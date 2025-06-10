import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
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
export const contentStatusEnum = pgEnum("content_status", [
  "raw",
  "processed",
  "archived",
]);

// Sources table
export const sources = pgTable("sources", {
  active: boolean("active").default(true).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  contentTier: varchar("content_tier", { length: 50 }).default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  dailyLimit: integer("daily_limit").default(3),
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  ttsService: ttsServiceEnum("tts_service").default("openai").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  url: text("url").notNull(),
});

// Scraped Content table - stores raw content from scrapers
export const scrapedContent = pgTable("scraped_content", {
  category: varchar("category", { length: 100 }).notNull(),
  content: text("content").notNull(),
  contentHash: varchar("content_hash", { length: 128 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  processingMetrics: text("processing_metrics"), // JSON object with scraping metrics
  publishedAt: timestamp("published_at").notNull(),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
  source: varchar("source", { length: 255 }).notNull(), // Source name (e.g., "TLDR Tech")
  sourceId: varchar("source_id", { length: 128 }).references(() => sources.id), // Optional reference to sources table
  status: contentStatusEnum("status").default("raw").notNull(),
  summary: text("summary").notNull(),
  tags: text("tags"), // JSON array of tags
  title: varchar("title", { length: 1000 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  url: text("url").notNull(),
});

// Episodes table
export const episodes = pgTable("episodes", {
  audioSize: integer("audio_size"), // in bytes
  audioUrl: text("audio_url"),
  contentHash: varchar("content_hash", { length: 128 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  duration: integer("duration").default(0).notNull(), // in seconds
  generationCost: decimal("generation_cost", { precision: 8, scale: 4 })
    .default("0")
    .notNull(),
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  playCount: integer("play_count").default(0).notNull(),
  sourceId: varchar("source_id", { length: 128 })
    .notNull()
    .references(() => sources.id),
  status: episodeStatusEnum("status").default("pending").notNull(),
  summary: text("summary").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  ttsService: ttsServiceEnum("tts_service").default("openai").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Queue table
export const queue = pgTable("queue", {
  completedAt: timestamp("completed_at"),
  cost: decimal("cost", { precision: 8, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  episodeId: varchar("episode_id", { length: 128 })
    .notNull()
    .references(() => episodes.id, { onDelete: "cascade" }),
  episodeTitle: varchar("episode_title", { length: 500 }).notNull(),
  errorMessage: text("error_message"),
  estimatedTimeRemaining: integer("estimated_time_remaining"), // seconds
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  position: integer("position").notNull(),
  progress: integer("progress").default(0).notNull(), // 0-100
  sourceId: varchar("source_id", { length: 128 })
    .notNull()
    .references(() => sources.id),
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  startedAt: timestamp("started_at"),
  status: queueStatusEnum("status").default("pending").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types for TypeScript inference
export type Episode = typeof episodes.$inferSelect;
export type NewEpisode = typeof episodes.$inferInsert;
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type ScrapedContent = typeof scrapedContent.$inferSelect;
export type NewScrapedContent = typeof scrapedContent.$inferInsert;
export type QueueItem = typeof queue.$inferSelect;
export type NewQueueItem = typeof queue.$inferInsert;
