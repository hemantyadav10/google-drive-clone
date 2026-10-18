import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  customType,
  inet,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { MAX_NAME_LENGTH } from "../constants/node.js";

// helper function for primary key definition
const primaryKeyId = () =>
  uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`);

// common timestamp fields for all tables
const timestamps = {
  createdAt: timestamp("created_at", {
    withTimezone: true,
    precision: 3,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    precision: 3,
    mode: "date",
  })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
};

export const DEVICE_TYPES = [
  "desktop",
  "mobile",
  "tablet",
  "console",
  "smarttv",
  "wearable",
  "unknown",
] as const;

export const deviceTypeEnum = pgEnum("device_type", DEVICE_TYPES);
export const nodeTypeEnum = pgEnum("node_type", ["folder", "file"]);
export const providersTypeEnum = pgEnum("provider_type", ["google", "github"]);
export const uploadStatusEnum = pgEnum("upload_status", [
  "initiated",
  "uploading",
  "completed",
  "failed",
  "expired",
  "aborted",
]);
export const processingStatusEnum = pgEnum("processing_status", [
  "pending",
  "completed",
  "quarantined",
]);
export const uploadTypeEnum = pgEnum("upload_type", ["single", "multipart"]);

export type DeviceType = (typeof deviceTypeEnum.enumValues)[number];
export type ProviderType = (typeof providersTypeEnum.enumValues)[number];
export type UploadStatus = (typeof uploadStatusEnum.enumValues)[number];
export type NodeType = (typeof nodeTypeEnum.enumValues)[number];

export const ltree = customType<{ data: string }>({
  dataType() {
    return "ltree";
  },
});

export const users = pgTable("users", {
  id: primaryKeyId(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  profilePicture: text("profile_picture"),
  passwordHash: text("password_hash"),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  ...timestamps,
});

export const userSessions = pgTable("user_sessions", {
  id: primaryKeyId(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  userAgent: text("user_agent"),
  browserName: text("browser_name"),
  osName: text("os_name"),
  deviceType: deviceTypeEnum("device_type").default("desktop"),
  ipAddress: inet("ip_address"),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: primaryKeyId(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: primaryKeyId(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

export const accounts = pgTable(
  "accounts",
  {
    id: primaryKeyId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: providersTypeEnum("provider").notNull(),
    providerId: text("provider_id").notNull(),
    ...timestamps,
  },
  (t) => [
    unique().on(t.provider, t.providerId),
    unique().on(t.userId, t.provider),
  ],
);

export const nodes = pgTable(
  "nodes",
  {
    id: primaryKeyId(),
    type: nodeTypeEnum("type").notNull(),
    name: varchar("name", { length: MAX_NAME_LENGTH }).notNull(),
    description: text("description"),

    parentId: uuid("parent_id").references((): AnyPgColumn => nodes.id, {
      onDelete: "cascade",
    }), // nullable — root nodes have no parent
    path: ltree("path").notNull(),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    folderColor: text("folder_color"),

    // --- File content ---
    mimeType: text("mime_type"),
    sizeBytes: bigint("size_bytes", { mode: "number" }),
    storageKey: text("storage_key"),
    sha256Checksum: text("sha256_checksum"),
    thumbnailSmallKey: text("thumbnail_small_key"),
    thumbnailMediumKey: text("thumbnail_medium_key"),
    contentModifiedAt: timestamp("content_modified_at", { withTimezone: true }),

    // --- Media metadata (image/video/audio only) ---
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"),

    // --- PDF metadata ---
    pageCount: integer("page_count"),

    isTrashed: boolean("is_trashed").notNull().default(false),
    trashedAt: timestamp("trashed_at", { withTimezone: true }),

    processingStatus: processingStatusEnum("processing_status")
      .notNull()
      .default("pending"),

    ...timestamps,
  },
  (table) => [
    // --- Data integrity ---
    check("size_bytes_non_negative", sql`${table.sizeBytes} >= 0`),
    check(
      "trashed_at_consistency",
      sql`(${table.isTrashed} = false AND ${table.trashedAt} IS NULL) OR
          (${table.isTrashed} = true AND ${table.trashedAt} IS NOT NULL)`,
    ),
    check("no_self_parent", sql`${table.id} != ${table.parentId}`),

    // --- Business rules ---
    uniqueIndex("unique_active_name_per_parent")
      .on(table.parentId, table.name, table.createdBy)
      .where(sql`${table.isTrashed} = false`),
  ],
);

export const uploadSessions = pgTable("upload_sessions", {
  id: primaryKeyId(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  nodeId: uuid("node_id")
    .unique()
    .references(() => nodes.id, {
      onDelete: "cascade",
    }),
  parentId: uuid("parent_id").references(() => nodes.id, {
    onDelete: "cascade",
  }),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  totalSize: bigint("total_size", { mode: "number" }).notNull(),
  uploadedSize: bigint("uploaded_size", { mode: "number" })
    .notNull()
    .default(0),
  status: uploadStatusEnum("status").notNull().default("initiated"),
  objectKey: text("object_key").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true })
    .notNull()
    .default(sql`now() + interval '24 hours'`),

  // Multipart upload metadata
  s3UploadId: text("s3_upload_id").unique(),
  uploadType: uploadTypeEnum("upload_type").notNull().default("single"),
  partSize: bigint("part_size", { mode: "number" }),
  totalParts: integer("total_parts"),

  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserSession = typeof userSessions.$inferSelect;
export type CreateUserSessionData = typeof userSessions.$inferInsert;

export type EmailVerificationToken =
  typeof emailVerificationTokens.$inferSelect;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export type Account = typeof accounts.$inferSelect;
export type CreateAccountData = typeof accounts.$inferInsert;

export type CreateNodeData = typeof nodes.$inferInsert;
export type Node = typeof nodes.$inferSelect;

export type UploadSession = typeof uploadSessions.$inferSelect;
export type CreateUploadSessionData = typeof uploadSessions.$inferInsert;
