import type { OS } from "@/content/types";
import {
  AppIcon,
  Dots9Icon,
  ImageIcon,
  NavBar,
  UpIcon,
  appGlyph,
} from "@/features/phone";
import type { HomeState } from "../state";
import { HomeStatusBar } from "./HomeStatusBar";

/* Home screen (prototype homeScreen): app grid, dock, long-press menu (Android)
   or edit mode with jiggling icons (iPhone). Lessons 1, 5, 6, 8, 9. */

const WidgetsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
    <rect x="13" y="13" width="8" height="8" rx="2" />
  </svg>
);

export function HomeScreen({ s, os }: { s: HomeState; os: OS }) {
  const android = os === "android";
  const jiggle = s.scr === "jiggle";
  return (
    <div className={`ph ${android ? "wall" : "wall-ios"}${jiggle ? " jiggle" : ""}`}>
      <HomeStatusBar s={s} os={os} light />
      <div className="home">
        {android && (
          <div className="clockw">
            <div className="t">10:24</div>
            <div className="d">teisipäev, 17. november · 8°C</div>
          </div>
        )}
        <div className="appgrid homegrid" style={android ? { marginTop: "auto" } : undefined}>
          {s.homeApps.map((a) => (
            <AppIcon key={a} os={os} app={a} attrs={{ "data-act": "open" }} />
          ))}
        </div>
        {/* empty wallpaper area: hold it to open the menu / edit mode */}
        <div className="wallempty" data-long="longHome" style={{ top: android ? "30%" : "22%" }} />
        <div className="space" />
        {android ? (
          <div className="drawerhandle" data-act="openDrawer" data-swipe="up">
            <span>
              <UpIcon />
              Kõik rakendused
            </span>
          </div>
        ) : (
          <div className="pagedots" data-act="openDrawer" data-swipe="left">
            <i className="on" />
            <i />
          </div>
        )}
        <div className={`dock${android ? " dock5" : ""}`}>
          {s.dockApps.map((a) => (
            <AppIcon key={a} os={os} app={a} withName={false} attrs={{ "data-act": "open" }} />
          ))}
          {android && (
            <div className="app apps-btn" data-act="openDrawer" aria-label="Kõik rakendused">
              <div className="ic">
                <Dots9Icon />
              </div>
            </div>
          )}
        </div>
      </div>

      {s.scr === "longmenu" && (
        <>
          <div className="menuclose" data-act="closeMenu" />
          <div className="lmenu">
            <button type="button" className="lm lm-wall">
              <ImageIcon />
              Taustapilt ja stiil
            </button>
            <button type="button" className="lm lm-widg">
              <WidgetsIcon />
              Vidinad
            </button>
            <button type="button" className="lm lm-set">
              {appGlyph(os, "settings")}
              Avaekraani seaded
            </button>
          </div>
        </>
      )}

      {jiggle && (
        <div className="iosedit">
          <button type="button" className="ie-plus" aria-label="Add widget">
            +
          </button>
          <div className="mid">
            <button type="button" className="ie-edit">
              Edit
            </button>
          </div>
          <button type="button" className="ie-done" data-act="closeMenu">
            Done
          </button>
        </div>
      )}

      <NavBar os={os} dark iosLongPress />
    </div>
  );
}
