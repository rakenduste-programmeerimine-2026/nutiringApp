import type { OS } from "@/content/types";
import { AppIcon, NavBar, StatusBar, appName } from "@/features/phone";
import { LockScreen, PassScreen, SimScreen } from "./screens/CodeScreens";
import { openApp, type HomeState } from "./state";
import "./home.css";

/** Draws the Home screen replica for the current state (prototype HOME.render). */
export function HomePhone({ s, os }: { s: HomeState; os: OS }) {
  return (
    <>
      <CurrentScreen s={s} os={os} />
      {/* brightness slider really dims the screen */}
      <div className="dimmer" style={{ opacity: (((100 - s.bright) / 100) * 0.6).toFixed(2) }} />
    </>
  );
}

function CurrentScreen({ s, os }: { s: HomeState; os: OS }) {
  switch (s.scr) {
    case "sim":
      return <SimScreen s={s} os={os} />;
    case "lock":
      return <LockScreen s={s} os={os} />;
    case "pass":
      return <PassScreen s={s} os={os} />;
    default:
      return <TemporaryHome s={s} os={os} />;
  }
}

/* TEMPORARY until step b: a plain home screen so lesson 1 can be finished. */
function TemporaryHome({ s, os }: { s: HomeState; os: OS }) {
  const app = openApp(s.scr);
  return (
    <div className={`ph ${os === "android" ? "wall" : "wall-ios"}`}>
      <StatusBar os={os} light notifs={s.notifs} sound />
      <div className="home" style={{ padding: 16 }}>
        {app ? (
          <div style={{ color: "#fff", fontSize: 20 }}>{appName(os, app)}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[...s.homeApps, ...s.dockApps].map((a) => (
              <AppIcon key={a} os={os} app={a} attrs={{ "data-act": "open" }} />
            ))}
          </div>
        )}
      </div>
      <NavBar os={os} dark />
    </div>
  );
}
