import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { episodes } from "@/lib/db/schema";
import {
  createSummarizationService,
  type SummaryOutput,
} from "@/lib/services/ai/summarization";
import { createTTSService, type TTSResult } from "@/lib/services/ai/tts";
import {
  createScrapingService,
  type ScrapedContent,
} from "@/lib/services/scraping/scraping-service";

const INTERNAL_SERVER_ERROR = "Internal server error";
const UNKNOWN_ERROR = "Unknown error";

/**
 * Request validation schema
 */
const GenerateRequestSchema = z.object({
  model: z.enum(["tts-1", "tts-1-hd"]).default("tts-1"),
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
  data?:
    | { audioUrl: string; cost: number; duration: number; fileSize: number } // generating_audio
    | {
        audioUrl: string;
        duration: number;
        episodeId: string;
        processingTime: number;
        title: string;
        totalCost: number;
      } // completed
    | { contentLength: number; source: string; title: string } // scraping
    | {
        cost: number;
        estimatedReadTime: number;
        keyPoints: string[];
        title: string;
      }; // summarizing
  error?: string;
  message: string;
  progress: number; // 0-100
  stage:
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
 * @remarks This MVP approach generates episodes on-demand when user clicks
 *                   "Generate" rather than using a complex background queue system.
 *                   Perfect for initial validation and user testing.
 *
 * POST /api/episodes/generate
 * Body: \{ sourceUrl: string, voice?: string, model?: string, title?: string \}
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
            error: error instanceof Error ? error.message : UNKNOWN_ERROR,
            message: "Generation failed",
            progress: 0,
            stage: "error",
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
        error: INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : UNKNOWN_ERROR,
      },
      { status: 500 }
    );
  }
}

/**
 * Main generation pipeline function
 *
 * @remarks Orchestrates the complete episode generation process
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

  let scrapedContent: ScrapedContent;
  let summary: SummaryOutput;
  let audioResult: TTSResult;
  let episodeId: string | undefined;

  try {
    // Stage 1: Scraping
    onProgress({
      message: "Scraping content from source...",
      progress: 10,
      stage: "scraping",
    });

    // eslint-disable-next-line fp/no-mutation
    scrapedContent = await scrapingService.scrapeUrl(request.sourceUrl);

    if (!scrapedContent || !scrapedContent.content) {
      throw new Error("Failed to scrape content from the provided URL");
    }

    onProgress({
      data: {
        contentLength: scrapedContent.content.length,
        source: scrapedContent.source,
        title: scrapedContent.title,
      },
      message: "Content scraped successfully",
      progress: 25,
      stage: "scraping",
    });

    // Stage 2: Summarization
    onProgress({
      message: "Creating podcast-friendly summary...", // eslint-disable-line no-secrets/no-secrets
      progress: 35,
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

    // eslint-disable-next-line fp/no-mutation, prefer-destructuring
    summary = summaryResult.summary;

    onProgress({
      data: {
        cost: summaryResult.cost.totalCost,
        estimatedReadTime: summary.estimatedReadTime,
        keyPoints: summary.keyPoints,
        title: summary.title,
      },
      message: "Summary generated successfully",
      progress: 55,
      stage: "summarizing",
    });

    // Stage 3: Text-to-Speech
    onProgress({
      message: "Converting text to speech...",
      progress: 65,
      stage: "generating_audio",
    });

    // eslint-disable-next-line fp/no-mutation
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

    onProgress({
      data: {
        audioUrl: audioResult.audioUrl || "",
        cost: audioResult.cost || 0,
        duration: audioResult.duration || 0,
        fileSize: audioResult.fileSize || 0,
      },
      message: "Audio generated successfully",
      progress: 85,
      stage: "generating_audio",
    });

    // Stage 4: Save to Database
    onProgress({
      message: "Saving episode to database...",
      progress: 90,
      stage: "saving",
    });

    const episodeData = {
      audioSize: audioResult.fileSize || 0,
      audioUrl: audioResult.audioUrl || "",
      contentHash: `hash-${Date.now()}`, // TODO: Generate proper content hash
      duration: audioResult.duration || 0,
      generationCost: String(
        summaryResult.cost.totalCost + (audioResult.cost || 0)
      ),
      sourceId: "temp-source-id", // TODO: Create proper source management
      status: "ready" as const,
      summary: summary.summary,
      title: request.title || summary.title,
    };

    const [newEpisode] = await db
      .insert(episodes)
      .values(episodeData)
      .returning();
    // eslint-disable-next-line fp/no-mutation
    episodeId = newEpisode.id;

    // Stage 5: Completed
    onProgress({
      data: {
        audioUrl: newEpisode.audioUrl || "",
        duration: newEpisode.duration,
        episodeId: newEpisode.id,
        processingTime: Date.now() - startTime,
        title: newEpisode.title,
        totalCost: Number(newEpisode.generationCost) || 0,
      },
      message: "Episode generated successfully!",
      progress: 100,
      stage: "completed",
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
        error: error instanceof Error ? error.message : UNKNOWN_ERROR,
        status: "unhealthy",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
