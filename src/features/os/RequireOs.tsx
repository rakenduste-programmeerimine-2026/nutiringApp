"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useOs } from "./OsProvider";

/**
 * Wrap a page with this: if no system (Android / iPhone) has been chosen,
 * the user is sent back to the start page "/".
 */
export function RequireOs({ children }: { children: ReactNode }) {
  const { os, ready } = useOs();
  const router = useRouter();

  useEffect(() => {
    if (ready && !os) router.replace("/");
  }, [ready, os, router]);

  // Show nothing until we know the choice (avoids a flash of the page).
  if (!ready || !os) return null;
  return <>{children}</>;
}
