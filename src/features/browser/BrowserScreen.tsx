import { CONTROL_CODE, PAYMENT, SITES } from "@/content/lessons/browser";
import type { OS } from "@/content/types";
import { HomeIcon } from "@/components/ui";
import { BellIcon, CopyIcon, Keyboard, LockIcon, NavBar, SearchIcon, StatusBar } from "@/features/phone";
import {
  addressText,
  pinLength,
  showSuggestion,
  SUGGESTION,
  type BrowserState,
} from "./browserState";
import "./browser.css";

/*
 * The phone screen of the Küberbrauser (prototype `WEB.render`).
 * Class names are global on purpose: the lessons point at them (.br-search, .res-ad …).
 * Taps work through data-act attributes, handled by the lesson engine.
 */

const money = (n: number) =>
  `${n.toLocaleString("et-EE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${PAYMENT.currency}`;

function Result({
  className,
  sponsored,
  url,
  title,
  description,
  act,
}: {
  className: string;
  sponsored?: boolean;
  url: string;
  title: string;
  description: string;
  act?: string;
}) {
  return (
    <button type="button" className={`res ${className}`} {...(act ? { "data-act": act } : {})}>
      {sponsored && <div className="sp">Sponsitud</div>}
      <div className="url">{url}</div>
      <div className="tt">{title}</div>
      <div className="ds">{description}</div>
    </button>
  );
}

function SearchResults({ s }: { s: BrowserState }) {
  return (
    <div className="results">
      {s.topic === "pension" ? (
        <>
          <Result
            className="res-ad"
            sponsored
            url={`https://${SITES.fakeGov}`}
            title="Sotsiaalkindlustusamet – Pension ja toetused | Logi sisse"
            description="Vaata oma pensioni suurust ja väljamaksete kuupäevi. Kiire sisselogimine."
            act="openRes"
          />
          <Result
            className="res-real"
            url={`https://www.${SITES.realGov}`}
            title="Pension | Sotsiaalkindlustusamet"
            description="Vanaduspension, pensioni maksmise kuupäevad ja taotlemine."
          />
        </>
      ) : (
        <>
          <Result
            className="res-bad"
            url={`https://${SITES.recipes}`}
            title="Parim porgandikook – lihtne retsept"
            description="Mahlane porgandikook toorjuustukreemiga. Valmib 1 tunniga!"
            act="openRes"
          />
          <Result
            className="res-ok"
            url="https://www.toidutare-naide.ee"
            title="Porgandikook | Toidutare"
            description="Klassikaline porgandikook kreemiga. Retsept ja toiduained."
          />
        </>
      )}
    </div>
  );
}

function FakeGovPage({ s }: { s: BrowserState }) {
  let body;
  switch (s.page) {
    case "fake-gov":
      body = (
        <>
          <h4>Pension</h4>
          <p>Vaata, millal tuleb järgmine pension ja kui suur see on.</p>
          <button type="button" className="fg-btn fg-login" data-act="fgLogin">
            Logi sisse
          </button>
        </>
      );
      break;
    case "fake-login":
      body = (
        <>
          <h4>Vali sisselogimise viis</h4>
          <div className="fg-methods">
            <button type="button" className="fg-m">
              ID-kaart
            </button>
            <button type="button" className="fg-m">
              Mobiil-ID
            </button>
            <button type="button" className="fg-m fg-sk" data-act="fgSk">
              <span className="skdot">S</span>
              {SITES.smartId}
            </button>
          </div>
        </>
      );
      break;
    case "fake-id":
      body = (
        <>
          <h4>{SITES.smartId}</h4>
          <div className="fg-lbl">Isikukood</div>
          <div className="fg-field">
            4xxxxxxxxxx <small>(näidis)</small>
          </div>
          <button type="button" className="fg-btn fg-go" data-act="fgGo">
            Jätka
          </button>
        </>
      );
      break;
    case "fake-wait":
      body = (
        <>
          <h4>Kinnita sisselogimine</h4>
          <div className="fg-code">
            Kontrollkood<b>{CONTROL_CODE}</b>
          </div>
          <p>Ava telefonis {SITES.smartId} rakendus ja kinnita sisselogimine PIN1-ga.</p>
        </>
      );
      break;
    case "fake-pin2":
      body = (
        <>
          <h4>Peaaegu valmis!</h4>
          <div className="fg-pin2">
            <b>Andmete kinnitamiseks</b> sisesta {SITES.smartId} rakenduses ka <b>PIN2</b>.
          </div>
        </>
      );
      break;
    default:
      body = (
        <>
          <h4>Aitäh!</h4>
          <div className="fg-done">Teie andmed on kinnitatud. Pension laekub teie kontole.</div>
        </>
      );
  }
  return (
    <div className="fakegov">
      <div className="fg-head">
        <span className="fg-emb" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="#fff" />
          </svg>
        </span>
        <span>SOOTSIAALKINDLUSTUSAMET</span>
      </div>
      <div className="fg-body">{body}</div>
    </div>
  );
}

function PageContent({ s }: { s: BrowserState }) {
  switch (s.page) {
    case "home":
      return (
        <div className="br-home-pg">
          <div className="br-logo">
            Küber<b>brauser</b>
          </div>
          <div className="br-search" data-act="searchFocus">
            <SearchIcon />
            <span>Otsi internetist</span>
          </div>
        </div>
      );
    case "search":
      return (
        <div className="br-home-pg br-typing">
          <div className="br-search on">
            <SearchIcon />
            <span className="q">{s.query}</span>
            <span className="caret" />
          </div>
          {showSuggestion(s) && (
            <button type="button" className="sugg" data-act="pickSugg">
              <SearchIcon />
              <span>{SUGGESTION[s.topic]}</span>
            </button>
          )}
        </div>
      );
    case "res":
      return <SearchResults s={s} />;
    case "cake":
      return (
        <div className="cakepg">
          <div className="cp-img" aria-hidden="true">
            <span>🥕</span>
            <span>🍰</span>
          </div>
          <h4>Parim porgandikook</h4>
          <p>Mahlane porgandikook toorjuustukreemiga. Vaja läheb: 3 porgandit, 2 muna, 200 g jahu…</p>
          <div className="cp-ad">REKLAAM</div>
        </div>
      );
    case "diet":
      return (
        <div className="dietpg">
          <div className="dp-h">BEST SLIM DEALS</div>
          <div className="dp-b">Special offer just for you!!!</div>
        </div>
      );
    default:
      return <FakeGovPage s={s} />;
  }
}

function Permission({ kind }: { kind: "notif" | "popup" }) {
  return (
    <div className="perm" role="dialog" aria-label="Loa küsimine">
      <div className="pm-t">
        <b>{SITES.recipes}</b> soovib:
      </div>
      <div className="pm-q">
        {kind === "notif" ? <BellIcon /> : <CopyIcon />}
        {kind === "notif" ? "Näidata teavitusi" : "Avada hüpikaknaid"}
      </div>
      <div className="pm-a">
        <button type="button" className="perm-block">
          Blokeeri
        </button>
        <button type="button" className="perm-allow" data-act="allow">
          Luba
        </button>
      </div>
    </div>
  );
}

function PopupAd({ kind }: { kind: "prize" | "diet" }) {
  if (kind === "prize") {
    return (
      <div className="adwrap">
        <div className="adpop prize" data-act="adClose">
          <span className="ad-x">✕</span>
          <div className="ad-big">🎁</div>
          <div className="ad-t">PALJU ÕNNE!</div>
          <div className="ad-s">Sa oled täna meie 1 000 000. külastaja! Vajuta ja vali oma auhind.</div>
          <div className="ad-btn">VALI AUHIND</div>
        </div>
      </div>
    );
  }
  return (
    <div className="adwrap">
      <div className="adpop diet">
        <span className="ad-x">✕</span>
        <div className="ad-t">LOSE 10 KG IN 7 DAYS!</div>
        <div className="ad-s">Doctors hate this one weird pill. Only 3 left in stock!</div>
        <div className="ad-btn">BUY NOW – 49.99 €</div>
      </div>
    </div>
  );
}

function SmartKoodApp({ s }: { s: BrowserState }) {
  const sk = s.sk!;
  const pin1 = sk.stage === "pin1";
  const length = pinLength(sk.stage);
  return (
    <div className="skapp" role="dialog" aria-label={`${SITES.smartId} harjutusrakendus`}>
      <div className="sk-h">
        <span className="skdot big">S</span>
        <div>
          <b>{SITES.smartId}</b>
          <small>harjutusrakendus · päris rakenduse nimi on Smart-ID</small>
        </div>
      </div>
      <div className="sk-req">
        <div className="sk-k">{pin1 ? "Sisselogimine" : "Allkirjastamine"}</div>
        <div className="sk-row">
          Taotleja: <b>{SITES.bank}</b>
        </div>
        {pin1 ? (
          <div className="sk-row">
            Kontrollkood: <b>{CONTROL_CODE}</b>
          </div>
        ) : (
          <>
            <div className="sk-row">
              Kinnita makse: <b>{money(PAYMENT.amount)}</b>
            </div>
            <div className="sk-row">
              Saaja: <b>{PAYMENT.to}</b>
            </div>
          </>
        )}
      </div>
      <div className="pinscr sk-pin">
        <div className="pinbox">
          <div className="pt">Sisesta {pin1 ? "PIN1" : "PIN2"}</div>
          <div className="dots" role="img" aria-label={`${sk.pin.length} / ${length} numbrit sisestatud`}>
            {Array.from({ length }, (_, i) => (
              <i key={i} className={i < sk.pin.length ? "f" : undefined} />
            ))}
          </div>
          <div className="pinerr" role="alert">
            {s.pinError}
          </div>
        </div>
        <div className="numpad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button key={d} type="button" data-act="pad" data-d={d}>
              {d}
            </button>
          ))}
          <button type="button" className="k-txt" data-act="pad" data-d="del" aria-label="Kustuta">
            ⌫
          </button>
          <button type="button" data-act="pad" data-d="0">
            0
          </button>
          <button type="button" className="k-ok" data-act="pad" data-d="ok">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export function BrowserScreen({ s, os }: { s: BrowserState; os: OS }) {
  const address = addressText(s);
  const secureLooking = s.page.startsWith("fake") || s.page === "cake" || s.page === "diet";
  return (
    <div className="ph brph">
      <StatusBar os={os} />
      <div className="br">
        <div className="br-top">
          <span className="br-badge">HARJUTUS</span>
          <div className="br-url">
            {secureLooking ? <LockIcon /> : <SearchIcon />}
            <span>
              {address.dim && <span className="u-dim">{address.dim}</span>}
              {address.dim && address.text ? " " : ""}
              {address.text}
            </span>
          </div>
        </div>
        <div className="br-page">
          <PageContent s={s} />
          {s.perm && <Permission kind={s.perm} />}
          {s.popup && <PopupAd kind={s.popup} />}
        </div>
        {s.kbOpen && <Keyboard state={s.kb} />}
        <div className="br-bot">
          <button type="button" className="br-back" data-act="brBack" aria-label="Tagasi">
            ‹
          </button>
          <button type="button" className="br-fwd" aria-label="Edasi">
            ›
          </button>
          <button type="button" className="br-home" data-act="brHome" aria-label="Avaleht">
            <HomeIcon />
          </button>
          <button type="button" className="br-tabs" aria-label="Vahelehed">
            1
          </button>
        </div>
      </div>
      {s.spam.length > 0 && (
        <div className="spam">
          {s.spam.map((text, i) => (
            <div key={`${s.spamNext - i}`} className="spn">
              <span className="spn-ic">
                <BellIcon />
              </span>
              <div>
                <div className="spn-a">{SITES.recipes} · nüüd</div>
                <div className="spn-t">{text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {s.skNotif && (
        <div className="sk-notif" data-act="openSk">
          <span className="skdot">S</span>
          <div>
            <div className="spn-a">{SITES.smartId} · nüüd</div>
            <div className="spn-t">{s.page === "fake-pin2" ? "Kinnita tehing PIN2-ga" : "Kinnita sisselogimine"}</div>
          </div>
        </div>
      )}
      {s.bankNotif && (
        <div className="sk-notif bank-notif">
          <span className="bankdot">N</span>
          <div>
            <div className="spn-a">{SITES.bank} · nüüd</div>
            <div className="spn-t">Sinu kontolt tehti makse {money(PAYMENT.amount)}</div>
            <div className="spn-a spn-to">Saaja: {PAYMENT.to}</div>
          </div>
        </div>
      )}
      {s.sk && <SmartKoodApp s={s} />}
      <NavBar os={os} />
    </div>
  );
}
