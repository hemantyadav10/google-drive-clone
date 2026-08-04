export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "Your sign-in session expired. Please try again.",
  missing_params: "Something went wrong during sign-in. Please try again.",
  code_expired: "Your sign-in link expired. Please try again.",
  provider_down: "Google is temporarily unavailable. Please try again shortly.",
  unverified_email:
    "Your Google account's email isn't verified. Please verify it with Google, or sign in with your password instead.",
  oauth_failed:
    "Sign-in failed. Please try again or use your email and password.",
};

export function getOAuthErrorMessage(code: string): string {
  return OAUTH_ERROR_MESSAGES[code] ?? OAUTH_ERROR_MESSAGES["oauth_failed"];
}
