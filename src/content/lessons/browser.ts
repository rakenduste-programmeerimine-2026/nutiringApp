import type { House, Step } from "../types";

/** Practice codes and amounts for the Küberbrauser room (all invented). */
export const SMART_KOOD_PIN1 = "1357";
export const SMART_KOOD_PIN2 = "24680";
export const CONTROL_CODE = "4821";
export const PAYMENT = {
  amount: 1250,
  currency: "€",
  to: "Kiirlaen Invest OÜ",
} as const;

/** Invented site names – no real organisations. */
export const SITES = {
  fakeGov: "sootsiaalkindlustusamet.com",
  realGov: "sotsiaalkindlustusamet.ee",
  bank: "NutiBank",
  smartId: "Smart-KOOD",
  recipes: "kook-retseptid.top",
  spam: "best-slim-deals.xyz",
} as const;

/** Fake spam notifications; the replica shows a new one every 3 seconds (newest first, max 3). */
export const SPAM_NOTIFICATIONS: string[] = [
  "Sa ei usu, mis edasi juhtus! 😱",
  "Arstid on šokis: see lihtne nipp…",
  "Palju õnne! Võitsid 1000 € 🎁",
  "HOIATUS: sinu telefonis on viirus!",
  "Ainult täna: iPhone 1 euroga!",
  "Kuulsus avaldas oma saladuse…",
];

/*
 * Named `enter` actions the browser replica must provide (they change the page state when a
 * step starts): skNotif, bankNotif, startSpam, stopSpam, permNotif, permPopup,
 * popupPrize, page:<home|res|cake|diet|fake-gov|fake-wait|fake-pin2>, skRequest:<pin1|pin2>,
 * resetSpam, spamSample, histCake.
 */

const info = (
  text: string,
  target?: string,
  extra: Partial<Step> = {},
): Step => ({
  type: "info",
  text,
  ...(target ? { target } : {}),
  ...extra,
});
const warn = (text: string, target?: string, enter?: string): Step =>
  info(text, target, { warn: true, ...(enter ? { enter } : {}) });
const act = (
  text: string,
  target: string,
  until: string | string[],
  extra: Partial<Step> = {},
): Step => ({ type: "do", text, target, until, ...extra });
const typed = (
  text: string,
  prefix: string,
  hint: string,
  extra: Partial<Step> = {},
): Step => ({
  type: "do",
  text,
  target: ".kb",
  show: ".br-search",
  cardAt: "top",
  check: { kind: "queryStartsWith", value: prefix },
  hint,
  ...extra,
});

const digits = (pin: string) => pin.split("").join(", ");

// Source: prototype „Nutiküla – Nutiring" (WEB), version 20.11.2026.
// The summary "extra points" are still to be reviewed by the client.
export const browser: House = {
  title: "Küberbrauser",
  intro: `<h3>Küberbrauser</h3>
<p><b>See ei ole päris brauser.</b> See on harjutusväljak, kus näed, milliseid ohte internetis ette tuleb.</p>
<p>Kõik siinsed lehed, reklaamid ja teavitused on <b>välja mõeldud</b>. Sa ei saa siin midagi rikkuda ja sinu raha ning andmed on täiesti ohutud. Ükski kood, mida siin sisestad, ei lähe kuhugi.</p>
<p>Siin <b>tohibki eksida</b>. Astume koos lõksu ja vaatame siis üle, mis oleks pidanud meid hoiatama.</p>`,
  lessons: [
    {
      title: "Riigi lehe otsimine ja Smart-ID",
      setup: "topic:pension",
      summary: [
        "Kontrolli alati <b>aadressi</b>. Eesti riigiasutuste lehed lõpevad <b>.ee</b>-ga, näiteks sotsiaalkindlustusamet.ee. Vaata ka kirjavigu.",
        "<b>„Sponsitud”</b> tähendab reklaami. Ka kelmid saavad maksta, et olla otsingus esimesed.",
        "Smart-ID rakenduses vaata, <b>kes</b> sisselogimist küsib ja kas <b>kontrollkood</b> klapib lehel olevaga.",
        "<b>PIN1</b> on sisselogimiseks, <b>PIN2</b> maksete ja allkirjade kinnitamiseks. Kui sisselogimisel küsitakse PIN2, on see pettus.",
        "Kui sulle tuleb Smart-ID PIN-koodi päring, aga sa ei logi parasjagu kuskile sisse, <b>ära kunagi sisesta PIN-i</b>.",
        "Smart-KOOD on selle õppeprogrammi harjutusrakendus. Päris rakenduse nimi on <b>Smart-ID</b>.",
      ],
      steps: [
        info(
          "Tahad <b>Sotsiaalkindlustusameti</b> lehelt vaadata, millal tuleb järgmine pension. Otsime lehe internetist üles.",
        ),
        act("Vajuta <b>otsingukastile</b>.", ".br-search", "searchFocus"),
        typed(
          "Kirjuta otsingusse <b>sots</b>.",
          "sots",
          "Vajuta tähti s, o, t, s.",
        ),
        act(
          "Brauser pakub soovitust. Vajuta <b>sotsiaalkindlustusamet pension</b>.",
          ".sugg",
          "pickSugg",
        ),
        info("Siin on <b>otsingutulemused</b>.", ".results"),
        act("Vajuta <b>esimesele tulemusele</b>.", ".res-ad", "openRes"),
        info(
          "Avanes leht, mis näeb välja nagu Sotsiaalkindlustusameti leht.",
          ".fg-head",
        ),
        act(
          "Pensioni nägemiseks tuleb sisse logida. Vajuta <b>Logi sisse</b>.",
          ".fg-login",
          "fgLogin",
        ),
        info(
          "<b>Smart-KOOD</b> on selle õppeprogrammi harjutusversioon rakendusest <b>Smart-ID</b>. Muutsime nime ja välimust meelega, et keegi ei arvaks, et see on päris rakendus. Päris telefonis on rakenduse nimi Smart-ID.",
          ".fg-methods",
        ),
        act("Vali <b>Smart-KOOD</b>.", ".fg-sk", "fgSk"),
        act(
          "Isikukood on juba sisestatud. Vajuta <b>Jätka</b>.",
          ".fg-go",
          "fgGo",
        ),
        info(
          "Leht näitab <b>kontrollkoodi</b>. Kohe tuleb telefoni Smart-KOOD teavitus.",
          ".fg-code",
          {
            enter: "skNotif:delayed",
            popup: `Kontrollkood on <b>${CONTROL_CODE}</b>`,
          },
        ),
        act(
          "Telefoni tuli Smart-KOOD teavitus. Vajuta sellele.",
          ".sk-notif",
          "openSk",
          {
            enter: "skNotif",
          },
        ),
        act(
          "Smart-KOOD küsib <b>PIN1</b>. Sisesta see ja vajuta <b>OK</b>.",
          ".numpad",
          "pin1Ok",
          {
            cardAt: "top",
            popup: `Sinu harjutus-PIN1 on <b>${SMART_KOOD_PIN1}</b>`,
            hint: `Vajuta ${digits(SMART_KOOD_PIN1)} ja OK.`,
          },
        ),
        info(
          "Leht ütleb, et andmete kinnitamiseks on vaja ka <b>PIN2</b>.",
          ".fg-pin2",
          { enter: "skNotif:delayed" },
        ),
        act(
          "Jälle tuli Smart-KOOD teavitus. Vajuta sellele.",
          ".sk-notif",
          "openSk",
          {
            enter: "skNotif",
          },
        ),
        act("Sisesta <b>PIN2</b> ja vajuta <b>OK</b>.", ".numpad", "pin2Ok", {
          cardAt: "top",
          popup: `Sinu harjutus-PIN2 on <b>${SMART_KOOD_PIN2}</b>`,
          hint: `Vajuta ${digits(SMART_KOOD_PIN2)} ja OK.`,
        }),
        info(
          `Telefoni tuli teavitus sinu pangast <b>${SITES.bank}</b>: sinu kontolt tehti <b>makse ${PAYMENT.amount.toLocaleString("et-EE")} ${PAYMENT.currency}</b>.`,
          ".bank-notif",
          { enter: "bankNotif" },
        ),
        warn(
          `<b>Oi!</b> Leht ütleb, et „andmed on kinnitatud”, aga pank teatab <b>${PAYMENT.amount.toLocaleString("et-EE")} ${PAYMENT.currency} maksest</b> saajale „${PAYMENT.to}”. See oli <b>võltsleht</b> ja PIN2-ga kinnitasime hoopis makse kelmile. Päriselt ei juhtunud midagi. Lähme tagasi ja vaatame, milliseid ohumärke me ei märganud.`,
          ".bank-notif, .fg-done",
          "bankNotif",
        ),
        warn(
          "<b>Sponsitud</b> tähendab reklaami. Kelmid maksavad, et nende võltsleht oleks otsingus esimene.",
          ".res-ad .sp",
          "page:res",
        ),
        warn(
          `Aadress on <b>${SITES.fakeGov}</b>. Siin on üks <b>„o” liiga palju</b> ja lõpp on <b>.com</b>. Eesti riigiasutuste lehed lõpevad <b>.ee</b>-ga.`,
          ".res-ad .url",
        ),
        info(`Õige leht oli allpool: <b>${SITES.realGov}</b>.`, ".res-real"),
        warn(
          "Vale aadress oli kogu aeg näha ka <b>aadressiribal</b>. Vaata alati aadressiriba!",
          ".br-url",
          "page:fake-gov",
        ),
        warn(
          `Smart-KOOD rakenduses oli kirjas, et sisselogimist küsib <b>${SITES.bank}</b>, sinu pank. Aga sina tahtsid minna Sotsiaalkindlustusameti lehele! Kui nimi ei klapi, <b>ära sisesta PIN-i</b>.`,
          ".sk-req",
          "skRequest:pin1",
        ),
        warn(
          "<b>PIN2</b> küsiti sisselogimise ajal. PIN2-ga kinnitatakse <b>makseid ja allkirju</b>. Sisselogimiseks piisab PIN1-st. Kui sisselogimisel küsitakse PIN2, on see pettus.",
          ".sk-req",
          "skRequest:pin2",
        ),
        info(
          "<b>Pea meeles:</b> kui sulle tuleb Smart-ID PIN-koodi päring, aga sa ei logi parasjagu kuskile sisse, <b>ära kunagi sisesta PIN-i</b>.",
          undefined,
          { enter: "page:res" },
        ),
      ],
    },
    {
      title: "Retsepti otsimine ja rämpsteavitused",
      setup: "topic:cake",
      summary: [
        "Vaata <b>linki enne, kui vajutad</b>. Tundmatu aadress või imelik lõpp (nt .top, .xyz) on ohumärk.",
        "<b>Ära kunagi luba</b> veebilehtedel teavitusi saata. Vajuta alati <b>Blokeeri</b>.",
        "Ära luba ka <b>hüpikaknaid</b>. Reklaamid võivad olla pahatahtlikud.",
        "Väikesed ✕ nupud on sageli lõksud: mööda vajutades satud reklaami lehele.",
        "Kui leht <b>suunab sind ise teisele lehele</b>, vajuta kohe tagasi-nuppu, kuni jõuad tagasi otsingusse.",
        "Brauseri sulgemine ei peata teavitusi. Kui oled teavitused lubanud, lülita need välja brauseri seadetest.",
        "Kui oled kogemata teavitused lubanud, <b>küsi abi</b> tuttavalt või Nutiringi õpetajalt, et nad aitaksid loa maha võtta.",
      ],
      steps: [
        info(
          "Tahad küpsetada <b>porgandikooki</b>. Otsime internetist retsepti.",
        ),
        act("Vajuta <b>otsingukastile</b>.", ".br-search", "searchFocus"),
        typed(
          "Kirjuta otsingusse <b>porg</b>.",
          "porg",
          "Vajuta tähti p, o, r, g.",
        ),
        act(
          "Vajuta soovitusele <b>porgandikook retsept</b>.",
          ".sugg",
          "pickSugg",
        ),
        act("Vajuta <b>esimesele tulemusele</b>.", ".res-bad", "openRes"),
        info(
          "Leht avanes ja küsib kohe <b>luba saata sulle teavitusi</b>.",
          ".perm",
          { enter: "permNotif" },
        ),
        act("Vajuta <b>Luba</b>.", ".perm-allow", "allow"),
        act(
          "Nüüd küsib leht luba avada <b>hüpikaknaid</b>. Vajuta jälle <b>Luba</b>.",
          ".perm-allow",
          "allow",
        ),
        act(
          "Ilmus <b>reklaam</b>. Sulge see, vajutades üleval paremal väikest <b>✕</b>.",
          ".adpop",
          "adClose",
          { enter: "popupPrize" },
        ),
        info(
          "Oi! Ristike oli nii väike, et vajutasime mööda. Leht <b>suunas meid teisele lehele</b> ja avas uue reklaami.",
          ".br-url",
        ),
        info(
          "Ja nüüd hakkavad tulema <b>teavitused</b>, iga paari sekundi tagant uus…",
          ".spam",
          { enter: "startSpam" },
        ),
        warn(
          "Näib, et oleme sattunud <b>pahatahtlikule lehele</b>. Lähme tagasi ja vaatame, milliseid ohumärke märkamata jätsime.",
          undefined,
          "stopSpam",
        ),
        warn(
          `Aadress <b>${SITES.recipes}</b>: tundmatu leht ja imelik lõpp <b>.top</b>. Vaata linki <b>enne</b>, kui vajutad.`,
          ".res-bad .url",
          "page:res+resetSpam",
        ),
        warn(
          "<b>Teavituste luba:</b> ära kunagi luba veebilehtedel teavitusi saata. Vajuta alati <b>Blokeeri</b>.",
          ".perm",
          "page:cake+permNotif",
        ),
        warn(
          "<b>Hüpikakende luba:</b> ka seda ära luba. Hüpikaknad on sageli reklaamid ja võivad olla pahatahtlikud.",
          ".perm",
          "page:cake+permPopup",
        ),
        warn(
          "<b>Pisike ✕:</b> see on meelega nii väike, et vajutaksid mööda ja satuksid reklaami lehele.",
          ".ad-x",
          "page:cake+popupPrize",
        ),
        warn(
          "<b>Ümbersuunamine:</b> aadress muutus ise. Kui leht suunab sind kohe teisele lehele, mine kohe tagasi.",
          ".br-url",
          "page:diet+popupDiet",
        ),
        warn(
          "<b>Võõrkeelne imeline pakkumine</b> („kaota 10 kg 7 päevaga”) on pettus.",
          ".adpop",
        ),
        warn(
          "<b>Rämpsteavitused</b> tulevad, sest lubasime teavitused. Need võivad viia pahatahtlikele lehtedele.",
          ".spam",
          "page:diet+spamSample",
        ),
        {
          type: "do",
          target: ".br-back",
          enter: "page:diet+histCake",
          text: "Kui satud imelikule lehele, vajuta kohe <b>tagasi-nuppu ‹</b>, kuni jõuad tagasi otsingutulemustesse. Proovi: vajuta <b>‹ kaks korda</b>.",
          check: { kind: "page", value: "res" },
          hint: "Vajuta all vasakul olevat ‹ nuppu.",
        },
        info(
          "Oled jälle otsingutulemustes. <b>Brauseri sulgemine ei aita:</b> kui oled lehele teavitused lubanud, tulevad need edasi ka siis, kui brauser on kinni. Siis tuleb teavitused välja lülitada brauseri seadetest.",
          ".results",
        ),
        info(
          "Kui oled kogemata mõnele lehele teavitused lubanud, <b>küsi abi</b> tuttavalt või näiteks <b>Nutiringi õpetajalt</b>. Nad aitavad selle lehe loa brauseri seadetest maha võtta.",
        ),
      ],
    },
    {
      title: "Investeerimispettused",
      soon: true,
      steps: [],
    },
  ],
};
