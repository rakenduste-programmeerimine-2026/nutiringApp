import type { CSSProperties, ReactNode } from "react";
import type { OS } from "@/content/types";
import {
  AppTile,
  NavBar,
  PlaneIcon,
  SilentIcon,
  StatusBar,
  WifiIcon,
  appName,
  t,
  type AppKey,
  type StatusNotif,
} from "@/features/phone";
import { PANEL_ANIM_MS, isPanel, type HomeState, type QuickTile } from "../state";

/* Pull-down panels: notifications and quick settings / Control Center
   (prototype notif + qs). Lessons 3 and 4. */

/** Which panel is (or is about to be) on screen, or null for none. */
export function panelKind(s: HomeState): "notif" | "qs" | null {
  if (s.scr === "notif" || s.scr === "qs") return s.scr;
  if (s.shadeClosing) return s.shadeClosing;
  if (s.shadePull > 0) return s.sb === "openQS" ? "qs" : "notif";
  return null;
}

/**
 * The panel box. It follows the finger while it is pulled (down to open,
 * up to close) and slides the rest of the way when the finger is lifted.
 */
export function Shade({ s, os }: { s: HomeState; os: OS }) {
  const kind = panelKind(s);
  if (!kind) return null;
  const open = isPanel(s.scr);
  const pulling = s.shadePull !== 0;
  const transform = open
    ? `translateY(${Math.min(0, s.shadePull)}px)` // open: can be pushed up
    : s.shadeClosing
      ? "translateY(-100%)" // closing: slide up and away
      : `translateY(calc(-100% + ${Math.max(0, s.shadePull)}px))`; // being pulled down
  const style: CSSProperties = {
    transform,
    transition: pulling ? "none" : `transform ${PANEL_ANIM_MS}ms ease`,
  };
  return (
    <div className="shadewrap" style={style}>
      {kind === "notif" ? <NotifPanel s={s} os={os} /> : <QuickPanel s={s} os={os} />}
    </div>
  );
}

/* ---------- notifications ---------- */

const NOTIFS: Record<StatusNotif, { app: AppKey; time: string; title: (os: OS) => string; body: string }> = {
  call: { app: "phone", time: "9:47", title: (os) => t(os, "Vastamata kõne", "Missed Call"), body: "Mari Tamm" },
  msg: { app: "messages", time: "10:12", title: () => "Mari Tamm", body: "Kas tuled pühapäeval lõunale?" },
  weather: { app: "weather", time: "8:00", title: () => "Täna sajab vihma", body: "Võta vihmavari kaasa." },
};

/** Android: the handle at the bottom; push it up to close the panel. */
const CloseHandle = () => (
  <div className="shadehandle" data-swipe="up" data-swipe-act="navHome" data-swipe-drag="">
    <i />
  </div>
);

function NotifPanel({ s, os }: { s: HomeState; os: OS }) {
  const android = os === "android";
  // newest first, like on a real phone
  const list = [...s.notifs].reverse();
  return (
    <div className={`ph ${android ? "wall" : "wall-ios"}`}>
      <StatusBar os={os} light sound />
      <div className="shade">
        <div className={android ? "shdate" : "shtime"}>{android ? "teisipäev, 17. nov" : "10:24"}</div>
        {list.length ? (
          <>
            {list.map((n) => {
              const d = NOTIFS[n];
              return (
                <div
                  key={n}
                  className="notif"
                  data-n={n}
                  data-swipe="side"
                  data-swipe-act="dismiss"
                  data-swipe-follow=""
                >
                  <AppTile os={os} app={d.app} />
                  <div className="nbody">
                    <div className="nm">
                      {appName(os, d.app)} · <b className="ntime">{d.time}</b>
                    </div>
                    <div className="nt">{d.title(os)}</div>
                    <div className="nb">{d.body}</div>
                  </div>
                </div>
              );
            })}
            <button type="button" className="clearall" data-act="clearNotif">
              {t(os, "Kustuta kõik", "Clear All")}
            </button>
          </>
        ) : (
          <div className="nonotif">{t(os, "Teavitusi pole", "No Notifications")}</div>
        )}
        <div style={{ flex: 1 }} />
        {android && <CloseHandle />}
      </div>
      <NavBar os={os} dark />
    </div>
  );
}

/* ---------- quick settings / Control Center ---------- */

const ArrowsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 20V8M3.5 11.5L7 8l3.5 3.5M17 4v12M13.5 12.5L17 16l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const TorchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 2h8v4l-2 4v12h-4V10L8 6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
const RotateIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TILE_ICONS: Record<QuickTile, ReactNode> = {
  wifi: <WifiIcon />,
  data: <ArrowsIcon />,
  torch: <TorchIcon />,
  silent: <SilentIcon />,
  rotate: <RotateIcon />,
  plane: <PlaneIcon />,
};

/** Tile order and names: Android in Estonian, iPhone in English (Control Center). */
const TILES: Record<OS, [QuickTile, string][]> = {
  android: [
    ["wifi", "Wi-Fi"],
    ["data", "Mobiilne andmeside"],
    ["torch", "Taskulamp"],
    ["silent", "Vaikne režiim"],
    ["rotate", "Automaatne pööramine"],
    ["plane", "Lennurežiim"],
  ],
  ios: [
    ["plane", "Airplane Mode"],
    ["data", "Cellular"],
    ["wifi", "Wi-Fi"],
    ["rotate", "Orientation Lock"],
    ["torch", "Flashlight"],
    ["silent", "Silent Mode"],
  ],
};

function QuickPanel({ s, os }: { s: HomeState; os: OS }) {
  const android = os === "android";
  const tiles = TILES[os].map(([k, name]) => (
    <button
      type="button"
      key={k}
      className={`tile${s.qs[k] ? " on" : ""}${!android && k === "plane" ? " orange" : ""}`}
      data-act="tile"
      data-tile={k}
      aria-pressed={s.qs[k]}
    >
      {TILE_ICONS[k]}
      <span>
        {name}
        {android && <small>{s.qs[k] ? "Sees" : "Väljas"}</small>}
      </span>
    </button>
  ));
  // brightness: Android a horizontal bar, iPhone a tall vertical one
  const bright = android ? (
    <div className="bright t-bright">
      <SunIcon />
      <div className="bar" data-slide="h">
        <i style={{ width: `${s.bright}%` }} />
      </div>
    </div>
  ) : (
    <div className="bright vbright t-bright" data-slide="v">
      <div className="vfill" style={{ height: `${s.bright}%` }} />
      <SunIcon />
    </div>
  );
  return (
    <div className={`ph ${android ? "wall" : "wall-ios"}`}>
      <StatusBar os={os} light />
      <div className="shade">
        {s.qs.torch && <div className="torchglow" aria-hidden="true" />}
        {android ? (
          <>
            {bright}
            <div className="qsgrid">{tiles}</div>
          </>
        ) : (
          <div className="ccrow">
            <div className="qsgrid">{tiles}</div>
            {bright}
          </div>
        )}
        <div style={{ flex: 1 }} />
        {android && <CloseHandle />}
      </div>
      <NavBar os={os} dark />
    </div>
  );
}
