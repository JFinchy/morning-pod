import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

import * as schema from "./schema";

// Create the database connection
export const db = drizzle(sql, { schema });

// Export the schema for use in other files
export * from "./schema";
