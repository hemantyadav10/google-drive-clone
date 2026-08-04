const STORAGE_KEY = "verifyEmailContext";

export type VerifyEmailContext = {
  email: string;
  source: "register" | "login";
};

function isVerifyEmailContext(data: unknown): data is VerifyEmailContext {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.email === "string" &&
    (obj.source === "register" || obj.source === "login")
  );
}

export function setVerifyEmailContext(ctx: VerifyEmailContext) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
}

export function consumeVerifyEmailContext(): VerifyEmailContext | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);

  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return isVerifyEmailContext(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
