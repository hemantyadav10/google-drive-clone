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
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

// helper function for primary key definition
const primaryKeyId = () =>
  uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`);

// common timestamp fields for all tables
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
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
export type DeviceType = (typeof deviceTypeEnum.enumValues)[number];

export const nodeTypeEnum = pgEnum("node_type", ["folder", "file"]);

export const providersTypeEnum = pgEnum("provider_type", ["google", "github"]);
export type ProviderType = (typeof providersTypeEnum.enumValues)[number];

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
    name: text("name").notNull(),
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
    sizeBytes: bigint("size_bytes", { mode: "bigint" }),
    storageKey: text("storage_key"),
    sha256Checksum: text("sha256_checksum"),
    fileThumbnailUrl: text("file_thumbnail_url"),
    contentModifiedAt: timestamp("modified_at", { withTimezone: true }),

    // --- Media metadata (image/video/audio only) ---
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"),

    isTrashed: boolean("is_trashed").notNull().default(false),
    trashedAt: timestamp("trashed_at", { withTimezone: true }),

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
      .on(table.parentId, table.name)
      .where(sql`${table.isTrashed} = false`),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type EmailVerificationToken =
  typeof emailVerificationTokens.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type CreateUserSessionData = typeof userSessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type CreateAccountData = typeof accounts.$inferInsert;

export type CreateNodeData = typeof nodes.$inferInsert;
export type Node = typeof nodes.$inferSelect;
