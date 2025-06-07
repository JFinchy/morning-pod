CREATE TYPE "public"."content_status" AS ENUM('raw', 'processed', 'archived');--> statement-breakpoint
CREATE TABLE "scraped_content" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"source_id" varchar(128),
	"title" varchar(1000) NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"url" text NOT NULL,
	"published_at" timestamp NOT NULL,
	"source" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"tags" text,
	"content_hash" varchar(128) NOT NULL,
	"status" "content_status" DEFAULT 'raw' NOT NULL,
	"scraped_at" timestamp DEFAULT now() NOT NULL,
	"processing_metrics" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scraped_content_content_hash_unique" UNIQUE("content_hash")
);
--> statement-breakpoint
ALTER TABLE "episodes" ALTER COLUMN "duration" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "scraped_content" ADD CONSTRAINT "scraped_content_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;