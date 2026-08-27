CREATE TYPE "public"."node_type" AS ENUM('folder', 'file');--> statement-breakpoint
CREATE TABLE "nodes" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"type" "node_type" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"path" "ltree" NOT NULL,
	"created_by" uuid NOT NULL,
	"folder_color" text,
	"mime_type" text,
	"size_bytes" bigint,
	"storage_key" text,
	"sha256_checksum" text,
	"file_thumbnail_url" text,
	"modified_at" timestamp with time zone,
	"width" integer,
	"height" integer,
	"duration" integer,
	"is_trashed" boolean DEFAULT false NOT NULL,
	"trashed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "size_bytes_non_negative" CHECK ("nodes"."size_bytes" >= 0),
	CONSTRAINT "trashed_at_consistency" CHECK (("nodes"."is_trashed" = false AND "nodes"."trashed_at" IS NULL) OR
          ("nodes"."is_trashed" = true AND "nodes"."trashed_at" IS NOT NULL)),
	CONSTRAINT "no_self_parent" CHECK ("nodes"."id" != "nodes"."parent_id")
);
--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_parent_id_nodes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_name_per_parent" ON "nodes" USING btree ("parent_id","name") WHERE "nodes"."is_trashed" = false;