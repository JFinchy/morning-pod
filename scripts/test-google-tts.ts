#!/usr/bin/env bun

/**
 * Test script for Google Cloud TTS integration
 * Run with: bun run scripts/test-google-tts.ts
 */

import { writeFileSync } from "fs";
import { join } from "path";

import { GoogleTTSService } from "../src/lib/services/ai/google-tts";

async function testGoogleTTS() {
  console.log("🎤 Testing Google Cloud TTS integration...\n");

  console.log("💰 COST WARNING:");
  console.log("   This test will make actual API calls to Google Cloud TTS");
  console.log("   Estimated cost: ~$0.01 (1 cent)");
  console.log("   See TESTING_COSTS.md for full breakdown\n");

  // Give user a chance to cancel
  console.log("⏸️  Press Ctrl+C in the next 3 seconds to cancel...");
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log("🚀 Starting test...\n");

  try {
    // Initialize the service
    console.log("1. Initializing Google TTS service...");
    const ttsService = new GoogleTTSService();
    console.log("✅ Service initialized successfully\n");

    // Test basic TTS synthesis
    console.log("2. Testing basic text synthesis...");
    const basicTest = await ttsService.synthesizeSpeech({
      text: "Hello! This is a test of Google Cloud Text-to-Speech integration for Morning Pod.",
      options: {
        voice: "en-US-Neural2-D",
        format: "mp3",
        useSSML: false,
      },
    });

    if (basicTest.success && basicTest.audioBuffer) {
      console.log("✅ Basic synthesis successful");
      console.log(`   - Audio size: ${basicTest.fileSize} bytes`);
      console.log(`   - Estimated duration: ${basicTest.duration} seconds`);
      console.log(`   - Cost: $${basicTest.cost?.toFixed(6) || "unknown"}`);

      // Save test audio file
      const basicFile = join(process.cwd(), "test-basic-tts.mp3");
      writeFileSync(basicFile, basicTest.audioBuffer);
      console.log(`   - Saved to: ${basicFile}\n`);
    } else {
      console.log("❌ Basic synthesis failed:", basicTest.error);
      return;
    }

    // Test conversational script generation
    console.log("3. Testing conversational script generation...");
    const testSummary =
      "OpenAI announced new features for ChatGPT, including improved reasoning capabilities and faster response times. The updates are rolling out to all users this week.";

    const script = ttsService.generateConversationalScript(testSummary);
    console.log("✅ Script generated successfully");
    console.log(`   - Generated ${script.lines.length} dialogue lines`);

    // Show first few lines of the script
    console.log("   - Script preview:");
    script.lines.slice(0, 4).forEach((line, i) => {
      console.log(`     ${line.speaker}: ${line.text.substring(0, 60)}...`);
    });
    console.log("");

    // Test conversational audio generation
    console.log("4. Testing conversational audio generation...");
    const conversationalTest = await ttsService.generateConversationalAudio(
      script,
      {
        voiceStyle: "upbeat",
        outputFormat: "mp3",
      }
    );

    if (conversationalTest.success && conversationalTest.audioSegments) {
      console.log("✅ Conversational audio generated successfully");
      console.log(
        `   - Generated ${conversationalTest.audioSegments.length} audio segments`
      );
      console.log(
        `   - Total duration: ${conversationalTest.totalDuration} seconds`
      );
      console.log(
        `   - Total cost: $${conversationalTest.totalCost?.toFixed(6) || "unknown"}`
      );

      // Save individual segments
      conversationalTest.audioSegments.forEach((segment, i) => {
        const segmentFile = join(
          process.cwd(),
          `test-conversation-${segment.speaker.toLowerCase()}-${i}.mp3`
        );
        writeFileSync(segmentFile, segment.audioBuffer);
        console.log(`   - Saved ${segment.speaker} segment to: ${segmentFile}`);
      });
      console.log("");
    } else {
      console.log("❌ Conversational audio failed:", conversationalTest.error);
    }

    // Test voice pairs
    console.log("5. Testing available voice pairs...");
    const voicePairs = ttsService.getAvailableVoicePairs();
    console.log("✅ Available voice pairs:");
    voicePairs.forEach((pair) => {
      console.log(`   - ${pair}`);
    });
    console.log("");

    // Show cost tracking
    console.log("6. Cost tracking summary...");
    const costTracking = ttsService.getCostTracking();
    if (costTracking.length > 0) {
      const totalCost = costTracking.reduce(
        (sum, track) => sum + track.cost,
        0
      );
      console.log(`✅ Total test cost: $${totalCost.toFixed(6)}`);
      console.log(`   - Total requests: ${costTracking.length}`);
      console.log(
        `   - Average cost per request: $${(totalCost / costTracking.length).toFixed(6)}`
      );
    }

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📁 Test files created:");
    console.log("   - test-basic-tts.mp3");
    console.log("   - test-conversation-host_a-*.mp3");
    console.log("   - test-conversation-host_b-*.mp3");
    console.log("\n🔊 Listen to these files to verify audio quality!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);

    if (error instanceof Error) {
      if (error.message.includes("credentials")) {
        console.log("\n💡 Troubleshooting tips:");
        console.log(
          "   - Check GOOGLE_APPLICATION_CREDENTIALS environment variable"
        );
        console.log("   - Verify the JSON key file path is correct");
        console.log(
          "   - Ensure the service account has Text-to-Speech permissions"
        );
      } else if (error.message.includes("API")) {
        console.log("\n💡 Troubleshooting tips:");
        console.log(
          "   - Verify Text-to-Speech API is enabled in Google Cloud Console"
        );
        console.log("   - Check your Google Cloud project ID");
        console.log("   - Ensure you have billing enabled on your project");
      }
    }

    process.exit(1);
  }
}

// Run the test
testGoogleTTS();
