import type { OS } from "@/content/types";
import {
  BatteryIcon,
  MissedCallIcon,
  MsgNotifIcon,
  SignalIcon,
  SilentIcon,
  VibrateIcon,
  WeatherNotifIcon,
  WifiIcon,
} from "./icons";
import { PHONE_TIME } from "./strings";

export type StatusNotif = "msg" | "weather" | "call";

const NOTIF_ICONS = { msg: MsgNotifIcon, weather: WeatherNotifIcon, call: MissedCallIcon };

type StatusBarProps = {
  os: OS;
  /** White icons on a dark/coloured background. */
  light?: boolean;
  /** Notification icons next to the time (shown on Android only). */
  notifs?: StatusNotif[];
  /** Show the sound mode icon (Android vibrate, iPhone Silent Mode). */
  sound?: boolean;
  /**
   * Swipe-down actions for the lesson engine (prototype data-swipe="down").
   * Android: `all` = whole bar. iPhone: `left` (notifications) / `right` (Control Center).
   */
  swipe?: { all?: string; left?: string; right?: string };
};

const swipeAttrs = (act?: string) =>
  act ? { "data-swipe": "down", "data-swipe-act": act } : {};

/**
 * Top row of the phone. Class names (sb-time, sb-notifs, sb-sound, sb-signal,
 * sb-wifi, sb-batt) are used by the lessons – do not rename them.
 */
export function StatusBar({ os, light = false, notifs, sound = false, swipe = {} }: StatusBarProps) {
  const android = os === "android";
  return (
    <div className={`sb${light ? " light" : ""}`} {...swipeAttrs(swipe.all)}>
      <div className="sbl" {...swipeAttrs(swipe.left)}>
        <span className="sbi sb-time">{PHONE_TIME}</span>
        {android && notifs && notifs.length > 0 && (
          <span className="sbi sb-notifs">
            {notifs.map((n) => {
              const Icon = NOTIF_ICONS[n];
              return (
                <span key={n} className={`sbn sbn-${n}`}>
                  <Icon />
                </span>
              );
            })}
          </span>
        )}
      </div>
      <div className="sbr" {...swipeAttrs(swipe.right)}>
        {sound && <span className="sbi sb-sound">{android ? <VibrateIcon /> : <SilentIcon />}</span>}
        <span className="sbi sb-signal">
          <SignalIcon />
        </span>
        <span className="sbi sb-wifi">
          <WifiIcon />
        </span>
        <span className="sbi sb-batt batt">
          {android && "85%"}
          <BatteryIcon />
        </span>
      </div>
    </div>
  );
}
