import { createId } from "@paralleldrive/cuid2";
import {
  pgTable,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums for better type safety
export const episodeStatusEnum = pgEnum("episode_status", [
  "pending",
  "generating",
  "ready",
  "failed",
]);
export const ttsServiceEnum = pgEnum("tts_service", ["openai", "google"]);
export const queueStatusEnum = pgEnum("queue_status", [
  "pending",
  "scraping",
  "summarizing",
  "generating-audio",
  "uploading",
  "completed",
  "failed",
]);

// Sources table
export const sources = pgTable("sources", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  active: boolean("active").default(true).notNull(),
  dailyLimit: integer("daily_limit").default(3),
  contentTier: varchar("content_tier", { length: 50 }).default("free"),
  ttsService: ttsServiceEnum("tts_service").default("openai").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Episodes table
export const episodes = pgTable("episodes", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  sourceId: varchar("source_id", { length: 128 })
    .notNull()
    .references(() => sources.id),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary").notNull(),
  contentHash: varchar("content_hash", { length: 128 }).notNull().unique(),
  audioUrl: text("audio_url"),
  audioSize: integer("audio_size"), // in bytes
  duration: integer("duration").default(0), // in seconds
  playCount: integer("play_count").default(0).notNull(),
  generationCost: decimal("generation_cost", { precision: 8, scale: 4 })
    .default("0")
    .notNull(),
  ttsService: ttsServiceEnum("tts_service").default("openai").notNull(),
  status: episodeStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Queue table
export const queue = pgTable("queue", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  episodeId: varchar("episode_id", { length: 128 })
    .notNull()
    .references(() => episodes.id, { onDelete: "cascade" }),
  episodeTitle: varchar("episode_title", { length: 500 }).notNull(),
  sourceId: varchar("source_id", { length: 128 })
    .notNull()
    .references(() => sources.id),
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  status: queueStatusEnum("status").default("pending").notNull(),
  progress: integer("progress").default(0).notNull(), // 0-100
  estimatedTimeRemaining: integer("estimated_time_remaining"), // seconds
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  cost: decimal("cost", { precision: 8, scale: 4 }),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types for TypeScript inference
export type Episode = typeof episodes.$inferSelect;
export type NewEpisode = typeof episodes.$inferInsert;
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type QueueItem = typeof queue.$inferSelect;
export type NewQueueItem = typeof queue.$inferInsert;
