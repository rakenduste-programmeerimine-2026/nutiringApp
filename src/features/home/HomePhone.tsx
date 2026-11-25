import type { OS } from "@/content/types";
import { AllApps } from "./screens/AllApps";
import { CameraApp, ClockApp, GenericApp, Recents } from "./screens/AppScreens";
import { LockScreen, PassScreen, SimScreen } from "./screens/CodeScreens";
import { HomeScreen } from "./screens/HomeScreen";
import { Shade } from "./screens/Panels";
import { isPanel, openApp, type HomeState } from "./state";
import "./home.css";

/**
 * Draws the Home screen replica for the current state (prototype HOME.render).
 * Everything sits in one .homeph box: home.css is scoped to it, so other
 * houses using the same class names are never affected.
 */
export function HomePhone({ s, os }: { s: HomeState; os: OS }) {
  return (
    <div className="homeph">
      {/* with a panel open, the screen it was pulled down from stays underneath */}
      <CurrentScreen s={isPanel(s.scr) ? { ...s, scr: s.shadeUnder } : s} os={os} />
      <Shade s={s} os={os} />
      {/* brightness slider really dims the screen */}
      <div className="dimmer" style={{ opacity: (((100 - s.bright) / 100) * 0.6).toFixed(2) }} />
    </div>
  );
}

function CurrentScreen({ s, os }: { s: HomeState; os: OS }) {
  const app = openApp(s.scr);
  if (app === "clock") return <ClockApp s={s} os={os} />;
  if (app === "camera") return <CameraApp os={os} />;
  if (app) return <GenericApp s={s} os={os} app={app} />;

  switch (s.scr) {
    case "sim":
      return <SimScreen s={s} os={os} />;
    case "lock":
      return <LockScreen s={s} os={os} />;
    case "pass":
      return <PassScreen s={s} os={os} />;
    case "drawer":
    case "search":
      return <AllApps s={s} os={os} />;
    case "recents":
      return <Recents s={s} os={os} />;
    default:
      return <HomeScreen s={s} os={os} />;
  }
}
