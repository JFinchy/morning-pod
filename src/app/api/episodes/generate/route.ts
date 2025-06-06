import { createId } from "@paralleldrive/cuid2";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { episodes, sources } from "@/lib/db/schema";
import { SummarizationService, TTSService } from "@/lib/services/ai";
import type { GenerationResult } from "@/lib/services/ai/types";
import { ScraperManager } from "@/lib/services/scraping/scraper-manager";
import { BlobStorageService } from "@/lib/services/storage/blob";

// Request validation schema
const generateRequestSchema = z.object({
  sourceId: z.string().min(1, "Source ID is required"),
  options: z
    .object({
      summarization: z
        .object({
          style: z.enum(["conversational", "formal", "casual"]).optional(),
          targetLength: z.enum(["short", "medium", "long"]).optional(),
          includeIntro: z.boolean().optional(),
          includeOutro: z.boolean().optional(),
        })
        .optional(),
      tts: z
        .object({
          voice: z
            .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
            .optional(),
          model: z.enum(["tts-1", "tts-1-hd"]).optional(),
          speed: z.number().min(0.25).max(4.0).optional(),
        })
        .optional(),
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = createId();

  console.log(`[${requestId}] Starting episode generation...`);

  try {
    // Parse and validate request
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);

    const { sourceId, options } = validatedData;

    // Initialize services
    const scraperManager = new ScraperManager({
      persistToDatabase: true,
      deduplicationEnabled: true,
    });
    const summarizationService = new SummarizationService();
    const ttsService = new TTSService();
    const blobService = new BlobStorageService();

    // Initialize result tracking
    const result: GenerationResult = {
      success: false,
      totalCost: 0,
      processingTime: 0,
      steps: {
        scraping: { success: false },
        summarization: { success: false },
        tts: { success: false },
        storage: { success: false },
        database: { success: false },
      },
    };

    // Step 1: Verify source exists and is active
    console.log(`[${requestId}] Verifying source: ${sourceId}`);
    const sourceResult = await db.query.sources.findFirst({
      where: (sources, { eq, and }) =>
        and(eq(sources.id, sourceId), eq(sources.active, true)),
    });

    if (!sourceResult) {
      return NextResponse.json(
        {
          success: false,
          error: `Source '${sourceId}' not found or inactive`,
        },
        { status: 400 }
      );
    }

    // Map database source names to scraper identifiers
    const sourceNameToScraperId: Record<string, string> = {
      "TLDR Tech": "tldr",
      "Hacker News": "hackernews",
      "Morning Brew": "morningbrew",
    };

    const scraperId = sourceNameToScraperId[sourceResult.name];
    if (!scraperId) {
      return NextResponse.json(
        {
          success: false,
          error: `No scraper available for source '${sourceResult.name}'`,
        },
        { status: 400 }
      );
    }

    // Step 2: Scrape content
    console.log(
      `[${requestId}] Scraping content from source: ${sourceResult.name} (${scraperId})`
    );
    const scrapingResult = await scraperManager.scrapeSource(scraperId);

    result.steps!.scraping = {
      success: scrapingResult.success,
      itemCount: scrapingResult.content?.length,
      error: scrapingResult.error,
    };

    if (
      !scrapingResult.success ||
      !scrapingResult.content ||
      scrapingResult.content.length === 0
    ) {
      result.error = `Failed to scrape content: ${scrapingResult.error || "No content found"}`;
      return NextResponse.json(result, { status: 500 });
    }

    // Step 3: Summarize content
    console.log(
      `[${requestId}] Summarizing ${scrapingResult.content.length} items`
    );
    const summarizationResult = await summarizationService.summarize({
      content: scrapingResult.content.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        source: item.source,
        category: item.category,
        url: item.url,
        contentHash: item.contentHash,
      })),
      options: options?.summarization,
    });

    result.steps!.summarization = {
      success: summarizationResult.success,
      wordCount: summarizationResult.wordCount,
      cost: summarizationResult.cost,
      error: summarizationResult.error,
    };

    if (!summarizationResult.success || !summarizationResult.summary) {
      result.error = `Failed to summarize content: ${summarizationResult.error}`;
      result.totalCost = summarizationResult.cost || 0;
      return NextResponse.json(result, { status: 500 });
    }

    result.summary = summarizationResult.summary;
    result.totalCost += summarizationResult.cost || 0;

    // Step 4: Generate audio
    console.log(
      `[${requestId}] Generating audio from summary (${summarizationResult.wordCount} words)`
    );
    const ttsResult = await ttsService.generateSpeech({
      text: summarizationResult.summary,
      options: options?.tts,
    });

    result.steps!.tts = {
      success: ttsResult.success,
      duration: ttsResult.duration,
      cost: ttsResult.cost,
      error: ttsResult.error,
    };

    if (!ttsResult.success || !ttsResult.audioBuffer) {
      result.error = `Failed to generate audio: ${ttsResult.error}`;
      result.totalCost += ttsResult.cost || 0;
      return NextResponse.json(result, { status: 500 });
    }

    result.totalCost += ttsResult.cost || 0;

    // Step 5: Upload audio to storage
    const episodeId = createId();
    console.log(
      `[${requestId}] Uploading audio to storage (${ttsResult.fileSize} bytes)`
    );

    const uploadResult = await blobService.uploadAudio(
      ttsResult.audioBuffer,
      episodeId,
      { addRandomSuffix: true }
    );

    result.steps!.storage = {
      success: uploadResult.success,
      fileSize: uploadResult.size,
      error: uploadResult.error,
    };

    if (!uploadResult.success || !uploadResult.url) {
      result.error = `Failed to upload audio: ${uploadResult.error}`;
      return NextResponse.json(result, { status: 500 });
    }

    result.audioUrl = uploadResult.url;

    // Step 6: Save episode to database
    console.log(`[${requestId}] Saving episode to database`);
    try {
      const episodeTitle =
        options?.title ||
        `${sourceResult.name} - ${new Date().toLocaleDateString()}`;

      const episodeDescription =
        options?.description || `Daily news summary from ${sourceResult.name}`;

      const [newEpisode] = await db
        .insert(episodes)
        .values({
          sourceId: sourceId,
          title: episodeTitle,
          summary: summarizationResult.summary,
          contentHash: scrapingResult.content[0]?.contentHash || createId(),
          audioUrl: uploadResult.url,
          audioSize: uploadResult.size || ttsResult.fileSize,
          duration: ttsResult.duration,
          generationCost: result.totalCost.toString(),
          ttsService: (ttsResult.metadata?.model || "tts-1") as
            | "openai"
            | "google",
          status: "ready",
        })
        .returning();

      result.steps!.database = {
        success: true,
        episodeId: newEpisode.id,
      };

      result.episodeId = newEpisode.id;
      result.success = true;
      result.processingTime = Date.now() - startTime;

      console.log(
        `[${requestId}] Episode generation completed successfully in ${result.processingTime}ms`
      );
      console.log(`[${requestId}] Total cost: $${result.totalCost.toFixed(4)}`);

      return NextResponse.json(result);
    } catch (dbError) {
      console.error(`[${requestId}] Database error:`, dbError);

      // Try to clean up uploaded file if database save fails
      try {
        await blobService.deleteAudio(uploadResult.url);
      } catch (cleanupError) {
        console.error(
          `[${requestId}] Failed to cleanup uploaded file:`,
          cleanupError
        );
      }

      result.steps!.database = {
        success: false,
        error: dbError instanceof Error ? dbError.message : "Database error",
      };
      result.error = `Failed to save episode: ${dbError instanceof Error ? dbError.message : "Database error"}`;

      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error(`[${requestId}] Generation error:`, error);

    const processingTime = Date.now() - startTime;

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
          processingTime,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        processingTime,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check generation status or get available sources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "sources") {
      // Return available sources for generation
      const activeSources = await db.query.sources.findMany({
        where: (sources, { eq }) => eq(sources.active, true),
        columns: {
          id: true,
          name: true,
          url: true,
          category: true,
        },
      });

      return NextResponse.json({
        success: true,
        sources: activeSources,
      });
    }

    // Default: return API info
    return NextResponse.json({
      success: true,
      message: "Episode Generation API",
      endpoints: {
        "POST /api/episodes/generate": "Generate a new episode",
        "GET /api/episodes/generate?action=sources": "Get available sources",
      },
    });
  } catch (error) {
    console.error("GET /api/episodes/generate error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
