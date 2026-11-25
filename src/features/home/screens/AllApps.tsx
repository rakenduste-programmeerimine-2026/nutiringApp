import type { OS } from "@/content/types";
import {
  AppIcon,
  AppTile,
  InfoIcon,
  Keyboard,
  NavBar,
  SearchIcon,
  appName,
  t,
  type AppKey,
} from "@/features/phone";
import type { HomeState } from "../state";
import { HomeStatusBar } from "./HomeStatusBar";

/* All apps (Android) / App Library (iPhone) with app search and the
   „Add to Home Screen” menu (prototype drawer). Lessons 6, 7, 9. */

export const ALL_APPS: AppKey[] = [
  "phone", "browser", "gallery", "calc", "calendar", "camera",
  "clock", "contacts", "weather", "store", "settings", "messages",
];

const HomeOutline = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
);

export function AllApps({ s, os }: { s: HomeState; os: OS }) {
  const android = os === "android";
  const searching = s.scr === "search";
  const sorted = [...ALL_APPS].sort((a, b) => appName(os, a).localeCompare(appName(os, b), "et"));
  const q = s.q.trim().toLowerCase();
  const results = q ? sorted.filter((a) => appName(os, a).toLowerCase().includes(q)) : [];

  return (
    <div className="ph" style={android ? { background: "#f3f5fb" } : undefined}>
      <div className="drawer">
        <HomeStatusBar s={s} os={os} light={!android} />
        <div className="searchbar" data-act="searchFocus">
          <SearchIcon />
          {searching ? (
            <>
              <span className="q">{s.q}</span>
              <span className="caret" />
            </>
          ) : (
            <span>{t(os, "Otsi rakendusi", "App Library")}</span>
          )}
        </div>

        {searching ? (
          <>
            <div className="results">
              {q &&
                (results.length ? (
                  results.map((a) => (
                    <button type="button" key={a} className="result" data-act="open" data-app={a} data-result={a}>
                      <AppTile os={os} app={a} />
                      <span>{appName(os, a)}</span>
                    </button>
                  ))
                ) : (
                  <div className="noresult">{t(os, "Tulemusi pole", "No Results")}</div>
                ))}
            </div>
            <Keyboard state={s.kb} />
          </>
        ) : (
          <>
            {!android && <div className="libtitle">App Library</div>}
            <div className="appgrid">
              {sorted.map((a) => (
                <AppIcon
                  key={a}
                  os={os}
                  app={a}
                  attrs={
                    a === "clock"
                      ? { "data-act": "open", "data-long": "longApp", "data-dapp": "clock" }
                      : { "data-act": "open" }
                  }
                />
              ))}
            </div>
            <div style={{ flex: 1 }} />
          </>
        )}

        {s.ctx && (
          <>
            <div className="ctxclose" data-act="ctxClose" />
            <div className="ctx">
              <button type="button" className="ctx-add" data-act="addHome">
                <HomeOutline />
                {t(os, "Lisa avaekraanile", "Add to Home Screen")}
              </button>
              <button type="button">
                <InfoIcon />
                {t(os, "Rakenduse teave", "App Info")}
              </button>
            </div>
          </>
        )}
      </div>
      {android ? <NavBar os={os} /> : <NavBar os={os} dark />}
    </div>
  );
}
