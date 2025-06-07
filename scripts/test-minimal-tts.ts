#!/usr/bin/env bun

/**
 * Minimal Google TTS test to isolate API issues
 */

import { TextToSpeechClient } from "@google-cloud/text-to-speech";

async function testMinimalTTS() {
  console.log("🔬 Minimal Google TTS API test...\n");

  try {
    console.log("1. Creating TTS client...");
    const client = new TextToSpeechClient();
    console.log("✅ Client created successfully");

    console.log("2. Testing API connectivity with voices list...");

    // Try to list voices first - this is a lighter API call
    const [result] = await client.listVoices({
      languageCode: "en-US",
    });

    console.log("✅ API connectivity successful!");
    console.log(`   - Found ${result.voices?.length || 0} en-US voices`);

    // Show a few voice examples
    const voices = result.voices?.slice(0, 3) || [];
    voices.forEach((voice) => {
      console.log(
        `   - ${voice.name}: ${voice.ssmlGender}, ${voice.naturalSampleRateHertz}Hz`
      );
    });

    console.log("\n3. Testing basic synthesis with very short text...");

    const request = {
      input: { text: "Hi" }, // Very short text to minimize cost/time
      voice: {
        languageCode: "en-US",
        name: "en-US-Neural2-D",
      },
      audioConfig: {
        audioEncoding: "MP3" as const,
        sampleRateHertz: 24000,
      },
    };

    console.log("   - Making synthesis request...");
    const [response] = await client.synthesizeSpeech(request);

    if (response.audioContent) {
      console.log("✅ Basic synthesis successful!");
      console.log(`   - Audio size: ${response.audioContent.length} bytes`);
      console.log(`   - Estimated cost: ~$0.0001`);
    } else {
      console.log("❌ No audio content received");
    }

    console.log("\n🎉 All tests passed! API is working correctly.");
  } catch (error: any) {
    console.error("❌ Test failed:", error.message);

    if (error.code === 7) {
      console.log("\n💡 Error code 7 = PERMISSION_DENIED");
      console.log("   - Text-to-Speech API might not be enabled");
      console.log("   - Service account might lack permissions");
    } else if (error.code === 4) {
      console.log("\n💡 Error code 4 = DEADLINE_EXCEEDED");
      console.log("   - API request timed out");
      console.log("   - Possible billing or quota issues");
    } else if (error.code === 16) {
      console.log("\n💡 Error code 16 = UNAUTHENTICATED");
      console.log("   - Authentication issue with service account");
    }

    console.log("\n🔧 Manual checks needed:");
    console.log(
      "   1. Go to: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com"
    );
    console.log("   2. Ensure Text-to-Speech API is ENABLED");
    console.log(
      "   3. Check billing: https://console.cloud.google.com/billing"
    );
    console.log("   4. Verify service account permissions");

    process.exit(1);
  }
}

testMinimalTTS();
