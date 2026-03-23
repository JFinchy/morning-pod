import { NextRequest } from "next/server";
import { z } from "zod";

// Import mock data
import { mockEpisodes } from "@/lib/mock-data/mocks";

/**
 * Request validation schema - matches the real API
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
 * Mock Episode Generation API
 *
 * Simulates the generation pipeline using mock data and staged responses
 * to avoid incurring AI costs during development
 *
 * POST /api/episodes/generate-mock
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
          await mockGenerateEpisode(validatedRequest, (progress) => {
            const data = `data: ${JSON.stringify(progress)}

`;
            controller.enqueue(encoder.encode(data));
          });

          controller.close();
        } catch (error) {
          const errorProgress = {
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Generation failed",
            progress: 0,
            stage: "error",
            type: "progress",
          };

          const data = `data: ${JSON.stringify(errorProgress)}

`;
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
    console.error("Mock episode generation error:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        {
          details: error.errors,
          error: "Invalid request data",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Mock generation pipeline function
 */
async function mockGenerateEpisode(
  request: GenerateRequest,
  onProgress: (progress: any) => void
): Promise<void> {
  // Find our NASA mock episode
  const nasaEpisode = mockEpisodes.find((ep) => ep.id === "ep-nasa");

  if (!nasaEpisode) {
    throw new Error("NASA mock episode not found");
  }

  // Stage 1: Scraping (simulate delay)
  onProgress({
    details: "Fetching article content...",
    message: "Scraping content from source...",
    progress: 10,
    stage: "scraping",
    type: "progress",
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

  onProgress({
    details: "Parsing and cleaning content...",
    message: "Extracting relevant information...",
    progress: 20,
    stage: "scraping",
    type: "progress",
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  onProgress({
    details: "Content successfully scraped from source",
    message: "Content scraped successfully",
    progress: 30,
    stage: "scraping",
    type: "progress",
  });

  // Stage 2: Summarization (simulate delay)
  onProgress({
    details: "Analyzing content structure...",
    message: "Creating podcast-friendly summary...",
    progress: 40,
    stage: "summarizing",
    type: "progress",
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  onProgress({
    details: "Generating AI summary...",
    message: "Processing content...",
    progress: 50,
    stage: "summarizing",
    type: "progress",
    cost: 0.01,
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

  onProgress({
    details: "Summary generated with key points and context",
    message: "Summary generated successfully",
    progress: 60,
    stage: "summarizing",
    type: "progress",
    cost: 0.02,
  });

  // Stage 3: Text-to-Speech (simulate delay)
  onProgress({
    details: "Preparing text for synthesis...",
    message: "Converting text to speech...",
    progress: 70,
    stage: "generating_audio",
    type: "progress",
    cost: 0.02,
  });

  await new Promise((resolve) => setTimeout(resolve, 2500));

  onProgress({
    details: "Converting summary to audio using " + request.voice + " voice",
    message: "Generating audio...",
    progress: 85,
    stage: "generating_audio",
    type: "progress",
    cost: 0.03,
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Stage 4: Saving (simulate delay)
  onProgress({
    details: "Uploading audio file...",
    message: "Finalizing episode...",
    progress: 90,
    stage: "saving",
    type: "progress",
    cost: 0.03,
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Stage 5: Complete
  onProgress({
    type: "complete",
    episode: {
      id: nasaEpisode.id,
      title: request.title || nasaEpisode.title,
      summary: nasaEpisode.summary,
      audioUrl: nasaEpisode.audioUrl,
      duration: nasaEpisode.duration,
      voice: request.voice,
      cost: 0.03,
    },
  });
}

/**
 * Health check endpoint
 */
export async function GET() {
  return Response.json({
    mock: true,
    status: "ok",
    supportedVoices: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
  });
}
