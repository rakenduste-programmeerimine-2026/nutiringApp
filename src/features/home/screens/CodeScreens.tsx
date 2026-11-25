import type { OS } from "@/content/types";
import { LockIcon, PinDots, PinPad, StatusBar, UpIcon, appGlyph, t } from "@/features/phone";
import type { HomeState } from "../state";

/* Lesson 1 screens: SIM PIN → lock screen → screen lock code (prototype sim / lock / pass).
   No Android nav bar on these screens (decision 20.11.2026). */

/** iPhone: the home line without any action (nothing to go back to yet). */
const IosLine = ({ light = true }: { light?: boolean }) => (
  <div className={`homeind${light ? " light" : ""}`}>
    <i />
  </div>
);

const SimCardIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 34, height: 34 }}>
    <rect x="6" y="2" width="12" height="20" rx="2" fill="none" stroke="#1a73e8" strokeWidth="2" />
    <path d="M9 7h6v6H9z" fill="#1a73e8" />
  </svg>
);

export function SimScreen({ s, os }: { s: HomeState; os: OS }) {
  const android = os === "android";
  return (
    <div className="ph" style={{ background: android ? "#fff" : "#1c1c1e" }}>
      <StatusBar os={os} light={!android} />
      <div className={`pinscr${android ? "" : " dark"}`}>
        <div className="pinbox">
          {android && <SimCardIcon />}
          <div className="pt">{t(os, "Sisesta SIM-kaardi PIN-kood", "SIM PIN")}</div>
          <div className="ps">{t(os, "Telefoni kasutamiseks", "Enter SIM PIN")}</div>
          <PinDots value={s.pin} />
          <div className="pinerr" role="alert">
            {s.err}
          </div>
        </div>
        <PinPad withOk />
      </div>
      {!android && <IosLine />}
    </div>
  );
}

export function LockScreen({ s, os }: { s: HomeState; os: OS }) {
  const android = os === "android";
  const dragging = s.lockPull !== 0;
  return (
    <div className={`ph ${android ? "wall" : "wall-ios"}`}>
      <StatusBar os={os} light />
      {/* the whole lock screen moves up with the finger; the texts stay in place on it */}
      <div
        className="lock"
        style={{
          transform: s.lockPull ? `translateY(${s.lockPull}px)` : undefined,
          opacity: dragging ? Math.max(0.3, 1 + s.lockPull / 400) : undefined,
          transition: dragging ? "none" : "transform .25s ease, opacity .25s ease",
        }}
      >
        <div className="lt lock-time">10:24</div>
        <div className="ld lock-date">{t(os, "teisipäev, 17. november", "Tuesday, 17 November")}</div>
        <div className="sp" />
        <div className="lockrow">
          <span className="lkbtn lk-left">{android ? appGlyph(os, "phone") : <FlashlightIcon />}</span>
          <div
            className="swipeup"
            data-act="unlock"
            data-swipe="up"
            data-swipe-act="unlock"
            data-swipe-drag=""
          >
            <UpIcon />
            <span>{t(os, "Avamiseks pühkige üles", "Swipe up to open")}</span>
          </div>
          <span className="lkbtn lk-right">{appGlyph(os, "camera")}</span>
        </div>
      </div>
      {android ? <div style={{ height: 16 }} /> : <IosLine />}
    </div>
  );
}

const FlashlightIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 2h8v4l-2 4v12h-4V10L8 6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export function PassScreen({ s, os }: { s: HomeState; os: OS }) {
  const android = os === "android";
  return (
    <div className={`ph ${android ? "wall" : "wall-ios"}`} style={{ color: "#fff" }}>
      <StatusBar os={os} light />
      <div className="pinscr" style={{ background: "rgba(0,0,0,.25)" }}>
        <div className="pinbox">
          <LockIcon style={{ width: 30, height: 30 }} />
          <div className="pt">{t(os, "Sisesta PIN-kood", "Enter Passcode")}</div>
          <PinDots value={s.pass} />
          <div className="pinerr" role="alert">
            {s.err}
          </div>
        </div>
        {/* iPhone has no OK key: the code is checked after 4 digits */}
        <PinPad withOk={android} />
      </div>
      {!android && <IosLine />}
    </div>
  );
}
