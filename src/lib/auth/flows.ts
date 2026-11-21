import {
  lockedMessage,
  MESSAGES,
  usernameToEmail,
  validatePin,
  validateRegistration,
  validateUsername,
} from "./validation";

export type AuthResult = { ok: true } | { ok: false; error: string };

export const SIGNUP_LIMIT_PER_HOUR = 30;

/** Whole minutes left until `lockedUntil` (at least 1). */
export function minutesLeft(
  lockedUntil: string | Date,
  now: number = Date.now(),
): number {
  const ms = new Date(lockedUntil).getTime() - now;
  return Math.max(1, Math.ceil(ms / 60_000));
}

/** First address of an x-forwarded-for header, if it looks like an IP. */
export function clientIp(
  forwardedFor: string | null | undefined,
): string | null {
  const first = forwardedFor?.split(",")[0]?.trim();
  if (!first) return null;
  const v4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(first);
  const v6 = /^[0-9a-fA-F:]+$/.test(first) && first.includes(":");
  return v4 || v6 ? first : null;
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export type LoginDeps = {
  /** When the lock ends, or null if the account is not locked. */
  isLocked(username: string): Promise<string | null>;
  /** Signs in with Supabase Auth; true when username and PIN are right. */
  signIn(email: string, pin: string): Promise<boolean>;
  /** Counts a wrong PIN; returns when the lock ends if this one locked the account. */
  registerFailure(username: string): Promise<string | null>;
  clearFailures(username: string): Promise<void>;
  touchActive(): Promise<void>;
};

export async function loginFlow(
  deps: LoginDeps,
  username: string,
  pin: string,
): Promise<AuthResult> {
  username = username.trim();
  // Same message for every bad input so nothing is revealed about which accounts exist.
  if (validateUsername(username) || validatePin(pin))
    return { ok: false, error: MESSAGES.wrongCredentials };

  const lockedUntil = await deps.isLocked(username);
  if (lockedUntil)
    return { ok: false, error: lockedMessage(minutesLeft(lockedUntil)) };

  if (await deps.signIn(usernameToEmail(username), pin)) {
    await deps.clearFailures(username);
    await deps.touchActive();
    return { ok: true };
  }

  const nowLocked = await deps.registerFailure(username);
  if (nowLocked)
    return { ok: false, error: lockedMessage(minutesLeft(nowLocked)) };
  return { ok: false, error: MESSAGES.wrongCredentials };
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export type RegisterDeps = {
  /** Accounts created from this IP in the last hour. */
  signupsFromIp(ip: string): Promise<number>;
  logSignupIp(ip: string): Promise<void>;
  /** Creates the Auth user and signs them in; "taken" if the name exists. */
  signUp(email: string, pin: string): Promise<"ok" | "taken" | "error">;
  /** Inserts the profiles row; "taken" on a unique violation. */
  createProfile(username: string): Promise<"ok" | "taken" | "error">;
  /** Removes the Auth user again when the profile could not be created. */
  rollback(): Promise<void>;
};

export async function registerFlow(
  deps: RegisterDeps,
  ip: string | null,
  username: string,
  pin: string,
  pinRepeat: string,
): Promise<AuthResult> {
  username = username.trim();
  const invalid = validateRegistration(username, pin, pinRepeat);
  if (invalid) return { ok: false, error: invalid };

  if (ip && (await deps.signupsFromIp(ip)) >= SIGNUP_LIMIT_PER_HOUR) {
    return { ok: false, error: MESSAGES.tooManySignups };
  }

  const created = await deps.signUp(usernameToEmail(username), pin);
  if (created === "taken") return { ok: false, error: MESSAGES.usernameTaken };
  if (created === "error") return { ok: false, error: MESSAGES.generic };

  const profile = await deps.createProfile(username);
  if (profile !== "ok") {
    await deps.rollback();
    return {
      ok: false,
      error: profile === "taken" ? MESSAGES.usernameTaken : MESSAGES.generic,
    };
  }

  if (ip) await deps.logSignupIp(ip);
  return { ok: true };
}
