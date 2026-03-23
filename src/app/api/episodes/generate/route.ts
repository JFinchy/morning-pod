import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { episodes } from "@/lib/db/schema";
import { createSummarizationService } from "@/lib/services/ai/summarization";
import { createTTSService } from "@/lib/services/ai/tts";
import { createScrapingService } from "@/lib/services/scraping/scraping-service";

/**
 * Request validation schema
 */
const GenerateRequestSchema = z.object({
  model: z.enum(["tts-1", "tts-1-hd"]).default("tts-1"),
  sourceId: z.string().optional(),
  sourceUrl: z.string().url("Valid URL is required"),
  title: z.string().optional(),
  voice: z
    .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
    .default("alloy"),
});

type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

/**
 * Response types for different stages
 */
interface GenerationProgress {
  data?: any;
  error?: string;
  message: string;
  progress: number; // 0-100
  stage:
    | "complete"
    | "completed"
    | "error"
    | "generating_audio"
    | "saving"
    | "scraping"
    | "summarizing";
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
            // Use the type provided in the progress object, default to "progress"
            const type = (progress as any).type || "progress";
            const data = `data: ${JSON.stringify({ ...progress, type })}\n\n`;
            controller.enqueue(encoder.encode(data));
          });

          controller.close();
        } catch (error) {
          const errorProgress = {
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Generation failed",
            progress: 0,
            stage: "error" as const,
            type: "error",
          };

          const data = `data: ${JSON.stringify(errorProgress)}\n\n`;
          controller.enqueue(encoder.encode(data));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("Episode generation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          details: error.errors,
          error: "Invalid request data",
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
  const summarizationService = createSummarizationService(
    undefined,
    process.env.GEMINI_SUMMARIZATION_PROVIDER === "true" ? "gemini" : "openai"
  );
  const ttsService = createTTSService();

  let scrapedContent: any;
  let summary: any;
  let audioResult: any;
  let episodeId: string | undefined;

  try {
    // Stage 0: Create initial record
    onProgress({
      message: "Initializing episode record...",
      progress: 5,
      stage: "saving",
    });

    const [initialEpisode] = await db
      .insert(episodes)
      .values({
        contentHash: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        progress: 5,
        sourceId: request.sourceId || "manual-entry",
        status: "generating" as const,
        summary: "Generating summary...",
        title: request.title || "New Episode Briefing",
      })
      .returning();

    episodeId = initialEpisode.id;

    // Stage 1: Scraping
    onProgress({
      message: "Scraping content from source...",
      progress: 15,
      stage: "scraping",
    });

    scrapedContent = await scrapingService.scrapeUrl(request.sourceUrl);

    if (!scrapedContent || !scrapedContent.content) {
      throw new Error("Failed to scrape content from the provided URL");
    }

    await db
      .update(episodes)
      .set({ progress: 30 })
      .where(eq(episodes.id, episodeId));

    onProgress({
      data: {
        contentLength: scrapedContent.content.length,
        source: scrapedContent.source,
        title: scrapedContent.title,
      },
      message: "Content scraped successfully",
      progress: 30,
      stage: "scraping",
    });

    // Stage 2: Summarization
    onProgress({
      message: "Creating podcast-friendly summary...",
      progress: 45,
      stage: "summarizing",
    });

    const summaryResult = await summarizationService.generateSummary({
      content: scrapedContent.content,
      publishedAt: scrapedContent.publishedAt
        ? new Date(scrapedContent.publishedAt)
        : undefined,
      source: scrapedContent.source || "Unknown",
      title: scrapedContent.title,
      url: request.sourceUrl,
    });

    summary = summaryResult.summary;

    // Update record with summary and progress
    await db
      .update(episodes)
      .set({
        title: request.title || summary.title,
        summary: summary.summary,
        progress: 60,
      })
      .where(eq(episodes.id, episodeId));

    onProgress({
      data: {
        cost: summaryResult.cost.totalCost,
        estimatedReadTime: summary.estimatedReadTime,
        keyPoints: summary.keyPoints,
        title: summary.title,
      },
      message: "Summary generated successfully",
      progress: 60,
      stage: "summarizing",
    });

    // Stage 3: Text-to-Speech
    onProgress({
      message: "Converting text to speech...",
      progress: 75,
      stage: "generating_audio",
    });

    audioResult = await ttsService.generateSpeech({
      options: {
        model: request.model,
        voice: request.voice,
      },
      text: summary.ttsOptimizedContent,
    });

    if (!audioResult.success) {
      throw new Error(`TTS generation failed: ${audioResult.error}`);
    }

    await db
      .update(episodes)
      .set({ progress: 90 })
      .where(eq(episodes.id, episodeId));

    onProgress({
      data: {
        audioUrl: audioResult.audioUrl,
        cost: audioResult.cost,
        duration: audioResult.duration,
        fileSize: audioResult.fileSize,
      },
      message: "Audio generated successfully",
      progress: 90,
      stage: "generating_audio",
    });

    // Stage 4: Final Update
    onProgress({
      message: "Finalizing episode...",
      progress: 95,
      stage: "saving",
    });

    const [updatedEpisode] = await db
      .update(episodes)
      .set({
        audioSize: audioResult.fileSize || 0,
        audioUrl: audioResult.audioUrl || "",
        duration: audioResult.duration || 0,
        generationCost: String(
          summaryResult.cost.totalCost + (audioResult.cost || 0)
        ),
        progress: 100,
        status: "ready" as const,
        updatedAt: new Date(),
      })
      .where(eq(episodes.id, episodeId))
      .returning();

    // Stage 5: Completed
    onProgress({
      data: {
        audioUrl: updatedEpisode.audioUrl,
        duration: updatedEpisode.duration,
        episodeId: updatedEpisode.id,
        processingTime: Date.now() - startTime,
        title: updatedEpisode.title,
        totalCost: updatedEpisode.generationCost,
      },
      message: "Episode generated successfully!",
      progress: 100,
      stage: "complete",
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
    const summarizationService = createSummarizationService(
      undefined,
      process.env.GEMINI_SUMMARIZATION_PROVIDER === "true" ? "gemini" : "openai"
    );
    const ttsService = createTTSService();

    const [summarizationOk, ttsOk] = await Promise.all([
      summarizationService.validateConnection(),
      ttsService.validateConnection(),
    ]);

    return NextResponse.json({
      configuration: {
        maxTextLength: 100000, // characters
        supportedModels: createTTSService().getAvailableModels(),
        supportedVoices: Object.keys(createTTSService().getAvailableVoices()),
      },
      services: {
        database: "available", // Assume available if we reach this point
        scraping: "available", // Always available (no external API)
        summarization: summarizationOk ? "available" : "unavailable",
        tts: ttsOk ? "available" : "unavailable",
      },
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        status: "unhealthy",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
