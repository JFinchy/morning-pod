import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// Get the database URL from environment variables
// Support multiple environment variable names for flexibility
const getDatabaseUrl = () => {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    ""
  );
};

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  console.warn(
    "⚠️  No database URL found. Please set POSTGRES_URL in your environment variables."
  );
  console.warn(
    "   For local development: Copy env.local.example to .env.local"
  );
  console.warn(
    "   For production: Add POSTGRES_URL to your Vercel environment variables"
  );
}

// Create Neon HTTP client
const sql = neon(databaseUrl);

// Create the database connection with Neon
export const db = drizzle(sql, {
  logger: process.env.NODE_ENV === "development",
  schema,
});

// Export the schema for use in other files
export * from "./schema";

// Export connection helper for testing
export const isDbConnected = async (): Promise<boolean> => {
  if (!databaseUrl) return false;

  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.warn("Database connection test failed:", error);
    return false;
  }
};

// Export database URL for debugging
export const getDbInfo = () => ({
  driver: "neon-http",
  environment: process.env.NODE_ENV || "development",
  url: databaseUrl
    ? `${databaseUrl.split("@")[1] || "hidden"}`
    : "not configured",
});
