import type { ReactNode } from "react";
import type { OS } from "@/content/types";
import { GlobeIcon, ImageIcon, PersonIcon, PhoneCallIcon } from "./icons";

/* The replica's apps (prototype APPS). Generic icons only – no real
   Google / Apple logos (protected designs). */

const LINE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const line = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...LINE}>
    {d}
  </svg>
);

const SafariCompass = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" fill="none" stroke="#fff" strokeWidth="1.6" />
    <path d="M15.5 8.5l-2.2 4.8-4.8 2.2 2.2-4.8z" fill="#fff" />
    <path d="M13.3 13.3l-4.8 2.2 2.2-4.8z" fill="#ff3b30" />
  </svg>
);

type AppDef = {
  /** Android name (Estonian) */
  a: string;
  /** iPhone name (English) */
  i: string;
  bgA: string;
  bgI: string;
  fgA: string;
  fgI: string;
  icon: (os: OS) => ReactNode;
  /** The two names are different products (Chrome/Safari), not translations. */
  ownNames?: boolean;
};

export const APPS = {
  browser: {
    a: "Google Chrome", i: "Safari", bgA: "#ffffff", bgI: "linear-gradient(#5ac8fa,#0a7aff)", fgA: "#1a73e8", fgI: "#fff",
    ownNames: true,
    icon: (os) => (os === "android" ? <GlobeIcon /> : <SafariCompass />),
  },
  camera: {
    a: "Kaamera", i: "Camera", bgA: "#5f6368", bgI: "linear-gradient(#d9d9de,#a3a3aa)", fgA: "#fff", fgI: "#333",
    icon: () => line(<><path d="M4 8h3l2-2.5h6L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.6" /></>),
  },
  settings: {
    a: "Seaded", i: "Settings", bgA: "#5f6368", bgI: "linear-gradient(#a6a6ab,#6e6e73)", fgA: "#fff", fgI: "#fff",
    icon: () =>
      line(
        <>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
          <circle cx="12" cy="12" r="6.6" />
        </>,
      ),
  },
  messages: {
    a: "Sõnumid", i: "Messages", bgA: "#1a73e8", bgI: "linear-gradient(#5df27a,#1fc93b)", fgA: "#fff", fgI: "#fff",
    icon: () => (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 4c5 0 9 3.2 9 7.3s-4 7.2-9 7.2c-1 0-2-.1-2.9-.4L5 20l1-3.5C4.2 15.2 3 13.4 3 11.3 3 7.2 7 4 12 4z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  phone: {
    a: "Telefon", i: "Phone", bgA: "#1e8e3e", bgI: "linear-gradient(#5df27a,#1fc93b)", fgA: "#fff", fgI: "#fff",
    icon: () => <PhoneCallIcon />,
  },
  contacts: {
    a: "Kontaktid", i: "Contacts", bgA: "#7b61ff", bgI: "linear-gradient(#e5e5ea,#b8b8bf)", fgA: "#fff", fgI: "#6b6b70",
    icon: () => <PersonIcon />,
  },
  clock: {
    a: "Kell", i: "Clock", bgA: "#3c4043", bgI: "#111", fgA: "#fff", fgI: "#fff",
    icon: () => line(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>),
  },
  calendar: {
    a: "Kalender", i: "Calendar", bgA: "#4285f4", bgI: "#fff", fgA: "#fff", fgI: "#ff3b30",
    icon: () => line(<><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M8 3v4M16 3v4" /></>),
  },
  gallery: {
    a: "Galerii", i: "Photos", bgA: "#f4b400", bgI: "#fff", fgA: "#fff", fgI: "#ff9500",
    icon: () => <ImageIcon />,
  },
  calc: {
    a: "Kalkulaator", i: "Calculator", bgA: "#ea8600", bgI: "#333", fgA: "#fff", fgI: "#ff9f0a",
    icon: () =>
      line(<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h.1M12 12h.1M16 12h.1M8 16h.1M12 16h.1M16 16h.1" /></>),
  },
  store: {
    a: "Play pood", i: "App Store", bgA: "#ffffff", bgI: "linear-gradient(#19c3fb,#1872f4)", fgA: "#01875f", fgI: "#fff",
    ownNames: true,
    icon: () => line(<path d="M5 8h14l-1.2 12H6.2zM9 8V6.5a3 3 0 0 1 6 0V8" />),
  },
  weather: {
    a: "Ilm", i: "Weather", bgA: "#8ab4f8", bgI: "linear-gradient(#4fa8ff,#1d6fe0)", fgA: "#fff", fgI: "#fff",
    icon: () =>
      line(
        <>
          <circle cx="9" cy="10" r="3.5" />
          <path d="M9 3v1.5M3 10h1.5M4.8 5.8l1 1M13.2 5.8l-1 1M8 20h9a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.5 1A3 3 0 0 0 8 20z" />
        </>,
      ),
  },
} satisfies Record<string, AppDef>;

export type AppKey = keyof typeof APPS;

/** App name as shown on the phone: Estonian on Android, English on iPhone. */
export function appName(os: OS, key: AppKey): string {
  return os === "android" ? APPS[key].a : APPS[key].i;
}

/**
 * App name for Estonian instruction texts: on iPhone the English name plus
 * the Estonian meaning, e.g. „Clock (kell)” (prototype nm()).
 */
export function appNameForText(os: OS, key: AppKey): string {
  const app: AppDef = APPS[key];
  if (os === "android") return app.a;
  if (app.ownNames || app.a === app.i) return app.i;
  return `${app.i} (${app.a.toLowerCase()})`;
}

/** Only the app's icon drawing (no coloured tile), e.g. for lock-screen buttons. */
export function appGlyph(os: OS, key: AppKey): ReactNode {
  return (APPS[key] as AppDef).icon(os);
}

/** Just the coloured icon tile (prototype appIconRaw). */
export function AppTile({ os, app, className = "ic" }: { os: OS; app: AppKey; className?: string }) {
  const def = APPS[app];
  const android = os === "android";
  return (
    <div className={className} style={{ background: android ? def.bgA : def.bgI, color: android ? def.fgA : def.fgI }}>
      {def.icon(os)}
    </div>
  );
}

type AppIconProps = {
  os: OS;
  app: AppKey;
  /** Show the name under the icon (not in the dock). */
  withName?: boolean;
  /** Extra data-* attributes for the lesson engine, e.g. { "data-act": "open" } */
  attrs?: Record<string, string>;
};

/** Icon + name, as on the home screen (prototype appIcon). Has data-app="<key>". */
export function AppIcon({ os, app, withName = true, attrs = {} }: AppIconProps) {
  return (
    <div className="app" data-app={app} {...attrs}>
      <AppTile os={os} app={app} />
      {withName && <span>{appName(os, app)}</span>}
    </div>
  );
}
