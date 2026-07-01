export interface CreateSessionData {
  userId: string;
  tokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}

export interface SessionMetadata {
  userAgent: string | null;
  ipAddress: string | null;
}

export interface LoginResult {
  sessionToken: string;
}
