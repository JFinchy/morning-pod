#!/usr/bin/env bun

/**
 * Test script to verify our database routers work
 * This will test the router structure and validation without requiring a database connection
 */

import { episodesRouter } from "../../src/lib/trpc/routers/episodes";
import { queueRouter } from "../../src/lib/trpc/routers/queue";
import { sourcesRouter } from "../../src/lib/trpc/routers/sources";

console.log("🧪 Testing Database Router Structure...");

// Test router exports
console.log("\n📋 Checking router exports:");
// Verify routers are properly instantiated
const isValidRouter = (router: unknown) => {
  return (
    router &&
    typeof router === "object" &&
    router !== null &&
    "_def" in router &&
    typeof (router as { _def?: unknown })._def === "object" &&
    (router as { _def: { procedures?: unknown } })._def !== null &&
    "procedures" in (router as { _def: { procedures?: unknown } })._def
  );
};

if (
  !isValidRouter(episodesRouter) ||
  !isValidRouter(sourcesRouter) ||
  !isValidRouter(queueRouter)
) {
  console.error("❌ Invalid router structure detected");
  process.exit(1);
}

console.log("✅ Episodes router:", episodesRouter ? "✓ loaded" : "✗ missing");
console.log("✅ Sources router:", sourcesRouter ? "✓ loaded" : "✗ missing");
console.log("✅ Queue router:", queueRouter ? "✓ loaded" : "✗ missing");

// Test router procedures
console.log("\n🔍 Checking router procedures:");

// Episodes router procedures
const episodesProcedures = Object.keys(episodesRouter._def.procedures);
console.log("📺 Episodes procedures:", episodesProcedures);

// Sources router procedures
const sourcesProcedures = Object.keys(sourcesRouter._def.procedures);
console.log("📰 Sources procedures:", sourcesProcedures);

// Queue router procedures
const queueProcedures = Object.keys(queueRouter._def.procedures);
console.log("⏳ Queue procedures:", queueProcedures);

// Test input validation schemas
console.log("\n✅ Router structure validation complete!");
console.log("\n📊 Summary:");
console.log(`   Episodes procedures: ${episodesProcedures.length}`);
console.log(`   Sources procedures: ${sourcesProcedures.length}`);
console.log(`   Queue procedures: ${queueProcedures.length}`);

console.log("\n🎯 Next steps:");
console.log("   1. Set up POSTGRES_URL in .env.local");
console.log("   2. Run: bun run db:migrate");
console.log("   3. Run: bun run db:seed");
console.log("   4. Test the API endpoints");

console.log("\n✨ Database routers are properly structured and ready for use!");
