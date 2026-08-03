export const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$/KU1yhoPCvl0kBJXa9/G+w$pVHnaesmxQtz+l005FQEuY2rxFdwDQo09/hUUea3ESU";
export const DAY_MS = 24 * 60 * 60 * 1000;
export const SESSION_LIFETIME_MS = 30 * DAY_MS;
export const VERIFICATION_TOKEN_LIFETIME_MS = DAY_MS;
export const PASSWORD_RESET_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes
export const LAST_ACTIVE_UPDATE_THRESHOLD_MS = 5 * 60 * 1000; // 5 min
