import { type Config } from "drizzle-kit";

export default {
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  dialect: "postgresql",
  out: "../../drizzle",
  schema: "../../src/lib/db/schema.ts",
  strict: true,
  verbose: true,
} satisfies Config;
