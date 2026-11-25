import type { OS } from "@/content/types";
import { AppTile, NavBar, StatusBar, appName, t, type AppKey } from "@/features/phone";
import type { HomeState } from "../state";
import { HomeStatusBar } from "./HomeStatusBar";

/* Opened apps and the open-apps view (prototype clock, recents, app:*). Lesson 7. */

/** Clock app: Clock page and Alarms page with tabs; iPhone has „‹ Clock” to go back. */
export function ClockApp({ s, os }: { s: HomeState; os: OS }) {
  const android = os === "android";
  const alarms = s.clockPage === "alarms";
  const tabs: [string, string][] = android
    ? [["alarm", "Äratus"], ["clock", "Kell"], ["timer", "Taimer"], ["stop", "Stopper"]]
    : [["world", "World Clock"], ["alarm", "Alarms"], ["stop", "Stopwatch"], ["timer", "Timers"]];
  const activeTab = alarms ? "alarm" : android ? "clock" : "world";

  return (
    <div className="ph" style={{ background: android ? "#f8f9fe" : "#000", color: android ? "#111" : "#fff" }}>
      <HomeStatusBar s={s} os={os} light={!android} />
      <div className="clockapp">
        {alarms ? (
          <>
            <div className="clkhead">
              {!android && (
                <button type="button" className="ios-back" data-act="appBack">
                  ‹ Clock
                </button>
              )}
              <div className="clkt">{t(os, "Äratused", "Alarms")}</div>
            </div>
            <div className="alarms">
              {[
                ["7:00", t(os, "Tööpäevad", "Weekdays"), true],
                ["9:30", t(os, "Laupäev", "Saturday"), false],
              ].map(([time, days, on]) => (
                <div className="alarm" key={String(time)}>
                  <div>
                    <div className="at">{time}</div>
                    <div className="adl">{days}</div>
                  </div>
                  <span className={`tgl${on ? " on" : ""}`}>
                    <i />
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="clkhead">
              <div className="clkt">{t(os, "Kell", "Clock")}</div>
            </div>
            <div className="clkbig">
              10:24
              <small>{t(os, "Tallinn · teisipäev", "Tallinn · Tuesday")}</small>
            </div>
          </>
        )}
        <div style={{ flex: 1 }} />
        <div className="clktabs">
          {tabs.map(([k, name]) => (
            <button
              type="button"
              key={k}
              className={`ctab${k === "alarm" ? " tab-alarm" : ""}${k === activeTab ? " on" : ""}`}
              {...(k === "alarm" ? { "data-act": "alarms" } : {})}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <NavBar os={os} dark={!android} iosLongPress />
    </div>
  );
}

export function CameraApp({ os }: { os: OS }) {
  return (
    <div className="ph" style={{ background: "#000" }}>
      <StatusBar os={os} light />
      <div className="camview">
        <div className="camhint">{t(os, "Kaamera vaade", "Camera")}</div>
        <div className="shutter" />
      </div>
      <NavBar os={os} dark iosLongPress />
    </div>
  );
}

/** Any other app: its name in a simple screen. */
export function GenericApp({ s, os, app }: { s: HomeState; os: OS; app: AppKey }) {
  return (
    <div className="ph" style={{ background: "#fff" }}>
      <HomeStatusBar s={s} os={os} light={false} />
      <div className="appscr">
        <div className="appbar">
          <AppTile os={os} app={app} />
          {appName(os, app)}
        </div>
        <div className="appbody">{appName(os, app)}</div>
      </div>
      <NavBar os={os} iosLongPress />
    </div>
  );
}

/** Open apps: a card per app; swipe a card up to close that app. */
export function Recents({ s, os }: { s: HomeState; os: OS }) {
  const android = os === "android";
  return (
    <div className="ph" style={{ background: android ? "#2b2f3a" : "rgba(30,40,70,.95)" }}>
      <StatusBar os={os} light />
      {/* tapping the empty area goes back home, like on a real phone */}
      <div className="recents" data-act="navHome">
        {s.recents.length ? (
          <div className="rrow">
            {s.recents.map((app) => (
              <div
                key={app}
                className="rcard"
                data-r={app}
                data-swipe="up"
                data-swipe-act="closeCard"
                data-swipe-follow=""
              >
                <div className="rlabel">
                  <AppTile os={os} app={app} />
                  <span>{appName(os, app)}</span>
                </div>
                <div className={`rshot${app === "clock" ? " dark" : ""}`}>{app === "clock" ? "10:24" : ""}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="norecents">{t(os, "Avatud rakendusi pole", "No Open Apps")}</div>
        )}
      </div>
      <NavBar os={os} dark />
    </div>
  );
}
