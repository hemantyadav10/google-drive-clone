import type { CreateUserSessionData, UserSession } from "../../db/schema.js";
import type { UserProfile } from "../user/user.types.js";

export type CreateSessionData = CreateUserSessionData;

export interface SessionMetadata {
  userAgent: string | null;
  ipAddress: string | null;
}

export interface LoginResult {
  sessionToken: string;
  user: UserProfile;
}

export type SessionSummary = Pick<
  UserSession,
  | "id"
  | "browserName"
  | "osName"
  | "deviceType"
  | "ipAddress"
  | "lastActiveAt"
  | "createdAt"
  | "expiresAt"
>;

export type SessionSummaryWithCurrent = SessionSummary & {
  isCurrent: boolean;
};

export type EmailVerificationTokenRecord = {
  id: string;
  userId: string;
};

export interface GoogleCallbackParams extends SessionMetadata {
  code: string | undefined;
  state: string | undefined;
  storedState: string | undefined;
  codeVerifier: string | undefined;
}
