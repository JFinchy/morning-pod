CREATE TYPE "public"."episode_status" AS ENUM('pending', 'generating', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."queue_status" AS ENUM('pending', 'scraping', 'summarizing', 'generating-audio', 'uploading', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."tts_service" AS ENUM('openai', 'google');--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"source_id" varchar(128) NOT NULL,
	"title" varchar(500) NOT NULL,
	"summary" text NOT NULL,
	"content_hash" varchar(128) NOT NULL,
	"audio_url" text,
	"audio_size" integer,
	"duration" integer DEFAULT 0,
	"play_count" integer DEFAULT 0 NOT NULL,
	"generation_cost" numeric(8, 4) DEFAULT '0' NOT NULL,
	"tts_service" "tts_service" DEFAULT 'openai' NOT NULL,
	"status" "episode_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "episodes_content_hash_unique" UNIQUE("content_hash")
);
--> statement-breakpoint
CREATE TABLE "queue" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"episode_id" varchar(128) NOT NULL,
	"episode_title" varchar(500) NOT NULL,
	"source_id" varchar(128) NOT NULL,
	"source_name" varchar(255) NOT NULL,
	"status" "queue_status" DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"estimated_time_remaining" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"error_message" text,
	"cost" numeric(8, 4),
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"daily_limit" integer DEFAULT 3,
	"content_tier" varchar(50) DEFAULT 'free',
	"tts_service" "tts_service" DEFAULT 'openai' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue" ADD CONSTRAINT "queue_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue" ADD CONSTRAINT "queue_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;