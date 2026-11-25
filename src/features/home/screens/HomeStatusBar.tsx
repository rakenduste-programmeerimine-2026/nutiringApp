import type { OS } from "@/content/types";
import { StatusBar } from "@/features/phone";
import type { HomeState } from "../state";

/**
 * Status bar of the Home screen. In the notification / quick settings lessons
 * (setup "sb:openNotif" / "sb:openQS") swiping down on it opens the panel:
 * Android – the whole bar; iPhone – left half = notifications, right half = Control Center.
 */
export function HomeStatusBar({ s, os, light }: { s: HomeState; os: OS; light: boolean }) {
  const swipe =
    !s.sb ? {} : os === "android" ? { all: s.sb } : s.sb === "openNotif" ? { left: s.sb } : { right: s.sb };
  // the panel follows the finger while it is pulled down
  return <StatusBar os={os} light={light} notifs={s.notifs} sound swipe={swipe} swipeDrag />;
}
