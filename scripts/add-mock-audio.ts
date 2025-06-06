#!/usr/bin/env bun

import { eq, isNull } from "drizzle-orm";

import { db } from "../src/lib/db";
import { episodes } from "../src/lib/db/schema";

// Mock audio URLs for testing (using free sample audio files)
const mockAudioUrls = [
  "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
  "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
  "https://www.soundjay.com/misc/sounds/success-fanfare-trumpets.mp3",
  "https://www.soundjay.com/misc/sounds/typewriter-key.mp3",
];

async function addMockAudio() {
  console.log("🎵 Adding mock audio to episodes...");

  try {
    // Get all episodes without audio
    const episodeList = await db
      .select()
      .from(episodes)
      .where(isNull(episodes.audioUrl));

    console.log(`Found ${episodeList.length} episodes without audio`);

    if (episodeList.length === 0) {
      console.log(
        "ℹ️ No episodes without audio found. Run the episode generation first, then rerun this script."
      );
      process.exit(0);
    }

    // Update existing episodes with mock audio
    for (
      let i = 0;
      i < Math.min(episodeList.length, mockAudioUrls.length);
      i++
    ) {
      const episode = episodeList[i];
      const audioUrl = mockAudioUrls[i % mockAudioUrls.length];

      await db
        .update(episodes)
        .set({
          audioUrl,
          audioSize: 524288 + i * 100000, // Varying sizes (512KB - 900KB)
          duration: 180 + i * 30, // Varying durations (3-5 minutes)
          status: "ready", // Set to ready since we have audio
        })
        .where(eq(episodes.id, episode.id));

      console.log(`✅ Updated episode: "${episode.title}" with mock audio`);
    }

    console.log("🎉 Mock audio setup complete!");
    console.log("You can now test the audio playback functionality.");
    console.log("🔗 Visit http://localhost:3000/episodes to test playback");
  } catch (error) {
    console.error("❌ Error adding mock audio:", error);
  }

  process.exit(0);
}

addMockAudio();
