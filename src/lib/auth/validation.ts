/** Validation for exam accounts. Used by the server actions and reusable in the UI. */

export const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;
export const PIN_RE = /^[0-9]{6,20}$/;

export const MESSAGES = {
  usernameInvalid:
    "Kasutajanimi peab olema 3–30 märki pikk ja sisaldama ainult tähti, numbreid, märke _ ja -.",
  pinInvalid: "PIN peab koosnema ainult numbritest ja olema 6–20 numbrit pikk.",
  pinMismatch: "PIN-koodid ei ühti.",
  usernameTaken: "See kasutajanimi on juba võetud.",
  wrongCredentials: "Vale kasutajanimi või PIN.",
  tooManySignups:
    "Sellest võrgust on loodud liiga palju uusi kontosid. Proovi hiljem uuesti.",
  generic: "Midagi läks valesti. Proovi uuesti.",
} as const;

export function lockedMessage(minutes: number): string {
  return `Konto on lukustatud. Proovi uuesti ${minutes} min pärast.`;
}

/** Returns an Estonian error message, or null when the username is fine. */
export function validateUsername(username: string): string | null {
  return USERNAME_RE.test(username) ? null : MESSAGES.usernameInvalid;
}

/** Returns an Estonian error message, or null when the PIN is fine. */
export function validatePin(pin: string): string | null {
  return PIN_RE.test(pin) ? null : MESSAGES.pinInvalid;
}

/** First error found for a registration form, or null. */
export function validateRegistration(
  username: string,
  pin: string,
  pinRepeat: string,
): string | null {
  return (
    validateUsername(username) ??
    validatePin(pin) ??
    (pin === pinRepeat ? null : MESSAGES.pinMismatch)
  );
}

/** The hidden e-mail Supabase Auth uses for a username (the user never sees it). */
export function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@nutiring.local`;
}
