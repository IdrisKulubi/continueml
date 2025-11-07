CREATE TYPE "public"."entity_type" AS ENUM('character', 'location', 'object', 'style', 'custom');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('queued', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."generation_tool" AS ENUM('runway', 'midjourney', 'stable_diffusion', 'other');--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"parent_branch_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"branch_id" uuid,
	"type" "entity_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"tags" text[] DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"url" text NOT NULL,
	"storage_key" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"branch_id" uuid,
	"user_id" varchar(255) NOT NULL,
	"original_prompt" text NOT NULL,
	"enhanced_prompt" text NOT NULL,
	"entity_ids" text[] DEFAULT '{}',
	"tool" "generation_tool" NOT NULL,
	"status" "generation_status" DEFAULT 'queued' NOT NULL,
	"result_url" text,
	"consistency_score" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "worlds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}',
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entities" ADD CONSTRAINT "entities_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entities" ADD CONSTRAINT "entities_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_images" ADD CONSTRAINT "entity_images_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branches_world_id_idx" ON "branches" USING btree ("world_id");--> statement-breakpoint
CREATE INDEX "branches_created_at_idx" ON "branches" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "branches_parent_branch_id_idx" ON "branches" USING btree ("parent_branch_id");--> statement-breakpoint
CREATE INDEX "entities_world_id_idx" ON "entities" USING btree ("world_id");--> statement-breakpoint
CREATE INDEX "entities_branch_id_idx" ON "entities" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "entities_type_idx" ON "entities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "entities_created_at_idx" ON "entities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "entity_images_entity_id_idx" ON "entity_images" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "entity_images_uploaded_at_idx" ON "entity_images" USING btree ("uploaded_at");--> statement-breakpoint
CREATE INDEX "generations_world_id_idx" ON "generations" USING btree ("world_id");--> statement-breakpoint
CREATE INDEX "generations_user_id_idx" ON "generations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generations_status_idx" ON "generations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "generations_created_at_idx" ON "generations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "worlds_user_id_idx" ON "worlds" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "worlds_created_at_idx" ON "worlds" USING btree ("created_at");