/**
 * The new account's username and PIN are kept in sessionStorage only until the user has
 * seen the „Kirjuta see üles” screen, so a page refresh does not lose the PIN too early.
 */
const KEY = "nutikula-new-account";

export type PendingAccount = { username: string; pin: string };

export function savePendingAccount(account: PendingAccount): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(account));
  } catch {
    // Storage blocked: the write-down page then sends the user back to the account screens.
  }
}

export function readPendingAccount(): PendingAccount | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      value &&
      typeof value === "object" &&
      typeof (value as PendingAccount).username === "string" &&
      typeof (value as PendingAccount).pin === "string"
    )
      return value as PendingAccount;
  } catch {
    // fall through
  }
  return null;
}

export function clearPendingAccount(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}
