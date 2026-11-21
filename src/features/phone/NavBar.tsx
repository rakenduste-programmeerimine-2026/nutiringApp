import type { OS } from "@/content/types";
import { NavBackIcon, NavHomeIcon, NavRecentIcon } from "./icons";

type NavBarProps = {
  os: OS;
  /** White buttons / line on a dark background. */
  dark?: boolean;
  /** iPhone: holding the bottom line opens the open-apps view (event "openRecents"). */
  iosLongPress?: boolean;
};

/**
 * Bottom of the phone.
 * Android: three buttons ◀ ● ■ (nav-back, nav-home, nav-recent).
 * iPhone: the home indicator line (homeind) – swipe up (or tap) to go home.
 * The lesson engine reacts to data-act / data-swipe / data-long.
 */
export function NavBar({ os, dark = false, iosLongPress = false }: NavBarProps) {
  if (os === "android") {
    return (
      <div className={`navbar${dark ? " dark" : ""}`}>
        <button type="button" className="nav-back" data-act="navBack" aria-label="Tagasi">
          <NavBackIcon />
        </button>
        <button type="button" className="nav-home" data-act="navHome" aria-label="Avaekraan">
          <NavHomeIcon />
        </button>
        <button type="button" className="nav-recent" data-act="navRecent" aria-label="Viimased rakendused">
          <NavRecentIcon />
        </button>
      </div>
    );
  }
  return (
    <div
      className={`homeind${dark ? " light" : ""}`}
      data-act="navHome"
      data-swipe="up"
      {...(iosLongPress ? { "data-long": "openRecents" } : {})}
    >
      <i />
    </div>
  );
}
