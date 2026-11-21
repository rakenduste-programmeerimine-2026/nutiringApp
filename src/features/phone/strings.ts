import type { OS } from "@/content/types";

/**
 * Pick the text for the chosen system.
 * Android replica is in Estonian, the iPhone replica in English
 * (iOS has no Estonian UI) – decision 20.11.2026.
 *
 *   t(os, "Kustuta kõik", "Clear All")
 */
export function t(os: OS, et: string, en: string): string {
  return os === "android" ? et : en;
}

/** Fixed clock time shown everywhere in the replica. */
export const PHONE_TIME = "10:24";
