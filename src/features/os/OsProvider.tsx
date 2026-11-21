"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { OS } from "@/content/types";

/** sessionStorage key: the choice lives until the browser tab is closed. */
export const OS_STORAGE_KEY = "nutikula-os";

type OsContextValue = {
  /** The chosen system, or null if the user has not chosen yet. */
  os: OS | null;
  /** Saves the choice (and remembers it for this browser tab). */
  setOs: (os: OS) => void;
  /** Becomes true after the saved choice has been read in the browser. */
  ready: boolean;
};

const OsContext = createContext<OsContextValue | null>(null);

function isOs(value: unknown): value is OS {
  return value === "android" || value === "ios";
}

export function OsProvider({ children }: { children: ReactNode }) {
  const [os, setOsState] = useState<OS | null>(null);
  const [ready, setReady] = useState(false);

  // sessionStorage exists only in the browser, so read it after the first render.
  useEffect(() => {
    const saved = window.sessionStorage.getItem(OS_STORAGE_KEY);
    if (isOs(saved)) setOsState(saved);
    setReady(true);
  }, []);

  const setOs = useCallback((next: OS) => {
    window.sessionStorage.setItem(OS_STORAGE_KEY, next);
    setOsState(next);
  }, []);

  return (
    <OsContext.Provider value={{ os, setOs, ready }}>
      {children}
    </OsContext.Provider>
  );
}

/** Read the chosen system in any client component inside <OsProvider>. */
export function useOs(): OsContextValue {
  const value = useContext(OsContext);
  if (!value) throw new Error("useOs must be used inside <OsProvider>");
  return value;
}
