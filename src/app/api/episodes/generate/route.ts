import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSummarizationService } from "@/lib/services/ai/summarization";
import { createTTSService } from "@/lib/services/ai/tts";
import { createScrapingService } from "@/lib/services/scraping/scraping-service";
import { db } from "@/lib/db";
import { episodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Request validation schema
 */
const GenerateRequestSchema = z.object({
  sourceUrl: z.string().url("Valid URL is required"),
  voice: z
    .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
    .default("alloy"),
  model: z.enum(["tts-1", "tts-1-hd"]).default("tts-1"),
  title: z.string().optional(),
});

type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

/**
 * Response types for different stages
 */
interface GenerationProgress {
  stage:
    | "scraping"
    | "summarizing"
    | "generating_audio"
    | "saving"
    | "completed"
    | "error";
  message: string;
  progress: number; // 0-100
  data?: any;
  error?: string;
}

/**
 * Simple Episode Generation API
 *
 * Handles the complete pipeline: scrape → summarize → TTS → save
 *
 * @business-context This MVP approach generates episodes on-demand when user clicks
 *                   "Generate" rather than using a complex background queue system.
 *                   Perfect for initial validation and user testing.
 *
 * POST /api/episodes/generate
 * Body: { sourceUrl: string, voice?: string, model?: string, title?: string }
 *
 * Returns: Streaming JSON responses with progress updates
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validatedRequest = GenerateRequestSchema.parse(body);

    // Create a streaming response for progress updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await generateEpisode(validatedRequest, (progress) => {
            const data = `data: ${JSON.stringify(progress)}\n\n`;
            controller.enqueue(encoder.encode(data));
          });

          controller.close();
        } catch (error) {
          const errorProgress: GenerationProgress = {
            stage: "error",
            message: "Generation failed",
            progress: 0,
            error: error instanceof Error ? error.message : "Unknown error",
          };

          const data = `data: ${JSON.stringify(errorProgress)}\n\n`;
          controller.enqueue(encoder.encode(data));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Episode generation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Main generation pipeline function
 *
 * @business-context Orchestrates the complete episode generation process
 *                   with progress tracking and error handling at each stage
 */
async function generateEpisode(
  request: GenerateRequest,
  onProgress: (progress: GenerationProgress) => void
): Promise<void> {
  const startTime = Date.now();

  // Initialize services
  const scrapingService = createScrapingService();
  const summarizationService = createSummarizationService();
  const ttsService = createTTSService();

  let scrapedContent: any;
  let summary: any;
  let audioResult: any;
  let episodeId: string | undefined;

  try {
    // Stage 1: Scraping
    onProgress({
      stage: "scraping",
      message: "Scraping content from source...",
      progress: 10,
    });

    scrapedContent = await scrapingService.scrapeUrl(request.sourceUrl);

    if (!scrapedContent || !scrapedContent.content) {
      throw new Error("Failed to scrape content from the provided URL");
    }

    onProgress({
      stage: "scraping",
      message: "Content scraped successfully",
      progress: 25,
      data: {
        title: scrapedContent.title,
        contentLength: scrapedContent.content.length,
        source: scrapedContent.source,
      },
    });

    // Stage 2: Summarization
    onProgress({
      stage: "summarizing",
      message: "Creating podcast-friendly summary...",
      progress: 35,
    });

    const summaryResult = await summarizationService.generateSummary({
      title: scrapedContent.title,
      content: scrapedContent.content,
      source: scrapedContent.source || "Unknown",
      url: request.sourceUrl,
      publishedAt: scrapedContent.publishedAt
        ? new Date(scrapedContent.publishedAt)
        : undefined,
    });

    summary = summaryResult.summary;

    onProgress({
      stage: "summarizing",
      message: "Summary generated successfully",
      progress: 55,
      data: {
        title: summary.title,
        estimatedReadTime: summary.estimatedReadTime,
        keyPoints: summary.keyPoints,
        cost: summaryResult.cost.totalCost,
      },
    });

    // Stage 3: Text-to-Speech
    onProgress({
      stage: "generating_audio",
      message: "Converting text to speech...",
      progress: 65,
    });

    audioResult = await ttsService.generateSpeech({
      text: summary.ttsOptimizedContent,
      options: {
        voice: request.voice,
        model: request.model,
      },
    });

    if (!audioResult.success) {
      throw new Error(`TTS generation failed: ${audioResult.error}`);
    }

    onProgress({
      stage: "generating_audio",
      message: "Audio generated successfully",
      progress: 85,
      data: {
        duration: audioResult.duration,
        fileSize: audioResult.fileSize,
        cost: audioResult.cost,
        audioUrl: audioResult.audioUrl,
      },
    });

    // Stage 4: Save to Database
    onProgress({
      stage: "saving",
      message: "Saving episode to database...",
      progress: 90,
    });

    const episodeData = {
      sourceId: "temp-source-id", // TODO: Create proper source management
      title: request.title || summary.title,
      summary: summary.summary,
      contentHash: `hash-${Date.now()}`, // TODO: Generate proper content hash
      audioUrl: audioResult.audioUrl || "",
      audioSize: audioResult.fileSize || 0,
      duration: audioResult.duration || 0,
      generationCost: String(
        summaryResult.cost.totalCost + (audioResult.cost || 0)
      ),
      status: "ready" as const,
    };

    const [newEpisode] = await db
      .insert(episodes)
      .values(episodeData)
      .returning();
    episodeId = newEpisode.id;

    // Stage 5: Completed
    onProgress({
      stage: "completed",
      message: "Episode generated successfully!",
      progress: 100,
      data: {
        episodeId: newEpisode.id,
        title: newEpisode.title,
        duration: newEpisode.duration,
        audioUrl: newEpisode.audioUrl,
        totalCost: newEpisode.generationCost,
        processingTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error("Generation pipeline error:", error);

    // If we have an episode ID, mark it as failed
    if (episodeId) {
      try {
        await db
          .update(episodes)
          .set({
            status: "failed",
          })
          .where(eq(episodes.id, episodeId));
      } catch (dbError) {
        console.error("Failed to update episode status:", dbError);
      }
    }

    throw error;
  }
}

/**
 * Health check endpoint
 *
 * GET /api/episodes/generate
 * Returns: Service status and configuration
 */
export async function GET() {
  try {
    // Check service availability
    const summarizationService = createSummarizationService();
    const ttsService = createTTSService();

    const [summarizationOk, ttsOk] = await Promise.all([
      summarizationService.validateConnection(),
      ttsService.validateConnection(),
    ]);

    return NextResponse.json({
      status: "healthy",
      services: {
        summarization: summarizationOk ? "available" : "unavailable",
        tts: ttsOk ? "available" : "unavailable",
        scraping: "available", // Always available (no external API)
        database: "available", // Assume available if we reach this point
      },
      configuration: {
        supportedVoices: Object.keys(createTTSService().getAvailableVoices()),
        supportedModels: createTTSService().getAvailableModels(),
        maxTextLength: 100000, // characters
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
