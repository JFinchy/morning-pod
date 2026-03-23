import { GoogleTTSService } from "../src/lib/services/ai/google-tts";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function testGoogleTTS() {
  console.log("Testing Google Cloud TTS Configuration...");

  try {
    // Check if credentials file exists
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!credentialsPath) {
      throw new Error(
        "GOOGLE_APPLICATION_CREDENTIALS environment variable is not set."
      );
    }

    // Resolve path relative to CWD if it starts with ./
    const resolvedPath = credentialsPath.startsWith("./")
      ? path.resolve(process.cwd(), credentialsPath)
      : credentialsPath;

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Credentials file not found at: ${resolvedPath}`);
    }
    console.log(`✅ Credentials file found at: ${resolvedPath}`);

    // Initialize Service
    console.log("Initializing Google TTS Service...");
    const ttsService = new GoogleTTSService();

    // Prepare Request
    const text =
      "This is a test of the Google Cloud Text-to-Speech integration.";
    console.log(`Generating audio for text: "${text}"`);

    // Call API
    const result = await ttsService.synthesizeSpeech({
      text,
      options: {
        voice: "en-US-Neural2-J", // Use a high-quality Neural2 voice
        gender: "MALE",
        format: "mp3",
      },
    });

    if (result.success && result.audioBuffer) {
      const outputPath = path.join(process.cwd(), "test-google-tts.mp3");
      fs.writeFileSync(outputPath, result.audioBuffer);
      console.log(`✅ Success! Audio saved to: ${outputPath}`);
      console.log(`   - Duration: ~${result.duration} seconds`);
      console.log(`   - Cost: $${result.cost?.toFixed(5)}`);
    } else {
      console.error("❌ Generation failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Test failed with error:");
    console.error(error);
  }
}

testGoogleTTS();
