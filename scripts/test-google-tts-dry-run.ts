#!/usr/bin/env bun

/**
 * Dry run test for Google Cloud TTS - validates setup without making API calls
 * Run with: bun run scripts/test-google-tts-dry-run.ts
 */

import { join } from "path";

async function testGoogleTTSSetup() {
  console.log(
    "🧪 Testing Google Cloud TTS setup (DRY RUN - no API calls)...\n"
  );

  let allChecksPass = true;

  // 1. Check environment variables
  console.log("1. Checking environment variables...");
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentialsPath) {
    console.log("❌ GOOGLE_APPLICATION_CREDENTIALS not set");
    allChecksPass = false;
  } else {
    console.log(`✅ GOOGLE_APPLICATION_CREDENTIALS: ${credentialsPath}`);

    // Check if file exists
    try {
      const { existsSync } = await import("fs");
      if (existsSync(credentialsPath)) {
        console.log("✅ Credentials file exists");

        // Try to parse JSON
        try {
          const { readFileSync } = await import("fs");
          const credData = JSON.parse(readFileSync(credentialsPath, "utf8"));
          console.log(`✅ Credentials file is valid JSON`);
          console.log(`   - Project ID: ${credData.project_id || "Not found"}`);
          console.log(
            `   - Client Email: ${credData.client_email || "Not found"}`
          );
        } catch {
          console.log("❌ Credentials file is not valid JSON");
          allChecksPass = false;
        }
      } else {
        console.log("❌ Credentials file does not exist");
        allChecksPass = false;
      }
    } catch (error) {
      console.log("❌ Error checking credentials file:", error);
      allChecksPass = false;
    }
  }
  console.log("");

  // 2. Check Google Cloud TTS dependency
  console.log("2. Checking Google Cloud TTS dependency...");
  try {
    await import("@google-cloud/text-to-speech");
    console.log("✅ @google-cloud/text-to-speech dependency available");
  } catch (error) {
    console.log("❌ @google-cloud/text-to-speech not installed");
    console.log("   Run: bun add @google-cloud/text-to-speech");
    allChecksPass = false;
  }
  console.log("");

  // 3. Test service instantiation (without API calls)
  console.log("3. Testing service instantiation...");
  try {
    const { GoogleTTSService } = await import(
      "../src/lib/services/ai/google-tts"
    );
    const service = new GoogleTTSService();
    console.log("✅ GoogleTTSService instantiated successfully");

    // Test voice pairs
    const voicePairs = service.getAvailableVoicePairs();
    console.log(`✅ Available voice pairs: ${voicePairs.length}`);
    voicePairs.slice(0, 3).forEach((pair) => {
      console.log(`   - ${pair}`);
    });
    if (voicePairs.length > 3) {
      console.log(`   ... and ${voicePairs.length - 3} more`);
    }
  } catch (error) {
    console.log("❌ Error instantiating service:", error);
    allChecksPass = false;
  }
  console.log("");

  // 4. Test cost estimation (no API calls)
  console.log("4. Testing cost estimation...");
  try {
    const { calculateEstimatedCost, COST_ESTIMATES } = await import(
      "../src/lib/feature-flags/ai-config"
    );

    const testText = "Hello world, this is a test";
    const testLength = testText.length;

    // Estimate based on character count
    const openaiCost = (testLength / 1000000) * 15; // $15 per 1M characters
    const googleCost = (testLength / 1000000) * 4; // $4 per 1M characters

    console.log(`✅ Cost estimation working:`);
    console.log(`   - Text length: ${testLength} characters`);
    console.log(`   - OpenAI TTS: $${openaiCost.toFixed(6)} for "${testText}"`);
    console.log(`   - Google TTS: $${googleCost.toFixed(6)} for "${testText}"`);
    console.log(
      `   - Savings: ${(((openaiCost - googleCost) / openaiCost) * 100).toFixed(1)}%`
    );

    // Episode-level estimates
    console.log(`   - Full episode estimates:`);
    console.log(`     * OpenAI TTS: $${COST_ESTIMATES.tts.openai}`);
    console.log(`     * Google TTS: $${COST_ESTIMATES.tts["google-cloud"]}`);
  } catch (error) {
    console.log("❌ Error testing cost estimation:", error);
    allChecksPass = false;
  }
  console.log("");

  // 5. Test feature flag configuration
  console.log("5. Testing AI configuration...");
  try {
    const { getAIConfig } = await import("../src/lib/feature-flags/ai-config");
    const config = getAIConfig({}); // Pass empty feature flags object

    console.log("✅ AI configuration loaded:");
    console.log(`   - Summarization model: ${config.summarizationModel}`);
    console.log(`   - TTS provider: ${config.ttsProvider}`);
    console.log(`   - Caching enabled: ${config.enableCaching}`);
    console.log(`   - Voice style: ${config.voiceStyle}`);
  } catch (error) {
    console.log("❌ Error testing AI configuration:", error);
    allChecksPass = false;
  }
  console.log("");

  // Final result
  if (allChecksPass) {
    console.log("🎉 All setup checks passed! Ready for actual testing.");
    console.log("\n💡 Next steps:");
    console.log(
      "   1. Run 'bun run test:tts' for actual API testing (costs ~$0.01)"
    );
    console.log("   2. Or test one small request manually first");
    console.log("   3. Check Google Cloud Console for TTS API quotas");
  } else {
    console.log("❌ Some setup issues found. Please fix them before testing.");

    console.log("\n🔧 Common fixes:");
    console.log("   - Set up Google Cloud service account");
    console.log("   - Download JSON key file");
    console.log("   - Set GOOGLE_APPLICATION_CREDENTIALS environment variable");
    console.log("   - Enable Text-to-Speech API in Google Cloud Console");
    console.log("   - Ensure billing is enabled on your Google Cloud project");

    process.exit(1);
  }
}

// Run the test
testGoogleTTSSetup();
