import type { User } from "../../db/schema.js";

export interface CreateUserDto {
  fullName: string;
  email: string;
  passwordHash: string;
}

export interface CreateOAuthUserDto {
  fullName: string;
  email: string;
  profilePicture?: string | undefined | null;
  isEmailVerified: boolean;
  emailVerifiedAt: Date;
}

export type UserId = { id: string };

export interface UpdatePasswordDto {
  userId: string;
  passwordHash: string;
}

export interface UpdateUnverifiedUserDto {
  userId: string;
  fullName: string;
  passwordHash: string;
}

export type UserProfile = Pick<
  User,
  "id" | "fullName" | "email" | "createdAt" | "profilePicture"
>;

export function toUserProfile(user: User): UserProfile {
  const { id, fullName, email, createdAt, profilePicture } = user;

  return { id, fullName, email, createdAt, profilePicture };
}
