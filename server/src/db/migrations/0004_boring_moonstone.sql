CREATE TYPE "public"."processing_status" AS ENUM('pending', 'completed', 'quarantined');--> statement-breakpoint
CREATE TYPE "public"."upload_status" AS ENUM('initiated', 'uploading', 'completed', 'failed', 'expired', 'aborted');--> statement-breakpoint
CREATE TYPE "public"."upload_type" AS ENUM('single', 'multipart');--> statement-breakpoint
CREATE TABLE "upload_sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"node_id" uuid,
	"parent_id" uuid,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"total_size" bigint NOT NULL,
	"uploaded_size" bigint DEFAULT 0 NOT NULL,
	"status" "upload_status" DEFAULT 'initiated' NOT NULL,
	"object_key" text NOT NULL,
	"expires_at" timestamp with time zone DEFAULT now() + interval '24 hours' NOT NULL,
	"s3_upload_id" text,
	"upload_type" "upload_type" DEFAULT 'single' NOT NULL,
	"part_size" bigint,
	"total_parts" integer,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "upload_sessions_node_id_unique" UNIQUE("node_id"),
	CONSTRAINT "upload_sessions_s3_upload_id_unique" UNIQUE("s3_upload_id")
);
--> statement-breakpoint
ALTER TABLE "nodes" RENAME COLUMN "modified_at" TO "content_modified_at";--> statement-breakpoint
DROP INDEX "unique_active_name_per_parent";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_sessions" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "user_sessions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_sessions" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "user_sessions" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "thumbnail_small_key" text;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "thumbnail_medium_key" text;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "page_count" integer;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "processing_status" "processing_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_parent_id_nodes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_name_per_parent" ON "nodes" USING btree ("parent_id","name","created_by") WHERE "nodes"."is_trashed" = false;--> statement-breakpoint
ALTER TABLE "nodes" DROP COLUMN "file_thumbnail_url";