import { sql } from "drizzle-orm";
import {
  boolean,
  inet,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
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

export const providersTypeEnum = pgEnum("provider_type", ["google", "github"]);
export type ProviderType = (typeof providersTypeEnum.enumValues)[number];

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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type EmailVerificationToken =
  typeof emailVerificationTokens.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type CreateUserSessionData = typeof userSessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type CreateAccountData = typeof accounts.$inferInsert;
