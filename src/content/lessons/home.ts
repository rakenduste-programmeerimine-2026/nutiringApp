import type { House, Step } from "../types";

export const SIM_PIN = "1234";
export const SCREEN_LOCK = "2580";

const info = (text: Step["text"], extra: Partial<Step> = {}): Step => ({ type: "info", text, ...extra });
const tap = (text: Step["text"], target: string, until: string, extra: Partial<Step> = {}): Step => ({
  type: "do",
  text,
  target,
  until,
  ...extra,
});

// NB: draft texts and selectors – to be aligned with the client prototype „Nutiküla – Nutiring".
export const home: House = {
  title: "Avaekraan",
  intro: "Siin õpid tundma telefoni avaekraani ja selle põhifunktsioone.",
  lessons: [
    {
      title: "SIM PIN ja telefoni lahtilukustamine",
      setup: "locked",
      steps: [
        info("SIM PIN on 4-numbriline kood, mis kaitseb su mobiilinumbrit. Ilma selleta ei saa telefoniga helistada."),
        {
          type: "do",
          text: "Sisesta SIM PIN.",
          popup: `Harjutuskood: ${SIM_PIN}`,
          target: "[data-sim-pad]",
          check: { kind: "simPin", value: SIM_PIN },
          hint: "Vajuta numbreid ükshaaval ja lõpuks kinnita.",
        },
        info("Ekraanilukk on eraldi kood, mis kaitseb telefoni sisu, kui telefon on võõraste käes."),
        {
          type: "do",
          text: "Sisesta ekraanilukk.",
          popup: `Harjutuskood: ${SCREEN_LOCK}`,
          target: "[data-lock-pad]",
          check: { kind: "screenLock", value: SCREEN_LOCK },
        },
        info("Lukustusekraanil on ka nupud kaamera ja taskulambi jaoks. Neid saab kasutada ilma telefoni lahti lukustamata."),
      ],
    },
    {
      title: "Olekuriba",
      steps: [
        info("Ekraani ülaosas on olekuriba: kell, akulaeng, võrk ja teavituste ikoonid."),
        tap("Puuduta akuikooni.", "[data-status-battery]", "tap:battery"),
        info("Väikesed ikoonid olekuribal näitavad, et sul on uusi teavitusi."),
        tap(
          { android: "Lülita telefon vaikseks režiimi.", ios: "Lülita telefon vaikseks küljel oleva lülitiga." },
          "[data-sound-mode]",
          "soundMode",
        ),
        tap("Lülita sisse režiim „Ära sega”.", "[data-dnd]", "dndOn"),
      ],
    },
    {
      title: "Teavitused",
      steps: [
        info("Teavitused annavad märku uutest sõnumitest ja rakenduste sündmustest."),
        tap(
          { android: "Tõmba olekuribalt sõrmega alla.", ios: "Tõmba ekraani ülaservast sõrmega alla." },
          "[data-statusbar]",
          "openNotifications",
        ),
        tap("Puuduta teavitust, et see avada.", "[data-notification]", "tap:notification"),
        tap("Pühi üks teavitus ekraanilt ära.", "[data-notification]", "dismissNotification"),
      ],
    },
    {
      title: "Kiirseaded",
      steps: [
        info("Kiirseadetes saad kiiresti sisse ja välja lülitada näiteks WiFi, Bluetoothi ja taskulambi."),
        tap(
          { android: "Tõmba olekuriba kahe sõrmega alla.", ios: "Tõmba ekraani ülemisest paremast nurgast alla." },
          "[data-statusbar]",
          "openQuickSettings",
        ),
        tap("Muuda ekraani heledust liugurit lohistades.", "[data-brightness]", "brightness"),
        tap("Lülita taskulamp sisse.", "[data-flashlight]", "flashlightOn"),
      ],
    },
    {
      title: "Pikk vajutus",
      steps: [
        info("Paljudel asjadel on peidetud menüü. Selle avamiseks hoia sõrme ikoonil umbes sekund."),
        tap("Hoia sõrme kaamera ikoonil.", "[data-app='camera']", "longPress:camera", {
          hint: "Ära tõsta sõrme kohe üles – hoia all.",
        }),
        tap("Vali menüüst üks valik.", "[data-context-menu] button", "tap:contextOption"),
      ],
    },
    {
      title: "Kõik rakendused ja otsing",
      steps: [
        info("Kõik telefoni rakendused on ühes loendis. Sealt leiad ka need, mida avaekraanil pole."),
        tap(
          { android: "Tõmba avaekraanil alt üles.", ios: "Libista avaekraanil viimasest vaatest vasakule." },
          "[data-home]",
          "openAllApps",
        ),
        tap("Puuduta otsinguriba ja kirjuta „kell”.", "[data-search]", "search:kell"),
        tap(
          { android: "Ava rakendus „Kell”.", ios: "Ava rakendus Clock (kell)." },
          "[data-app='clock']",
          "openApp:clock",
        ),
      ],
    },
    {
      title: "Kolm nuppu",
      steps: [
        info("Telefoni all on kolm tegevust: tagasi, avaleht ja avatud rakendused."),
        tap("Ava mõni rakendus.", "[data-app]", "openAnyApp"),
        tap("Puuduta nuppu „Tagasi”.", "[data-nav='back']", "navBack"),
        tap("Puuduta nuppu „Avaleht”.", "[data-nav='home']", "navHome"),
        tap("Puuduta nuppu „Avatud rakendused”.", "[data-nav='recents']", "navRecents"),
      ],
    },
    {
      title: "Avaekraani rakendused",
      steps: [
        info("Avaekraanil on sinu enim kasutatavad rakendused."),
        tap("Ava rakendus avaekraanilt.", "[data-home] [data-app]", "openAnyApp"),
        tap("Hoia ikooni all ja liiguta see teise kohta.", "[data-home] [data-app]", "moveIcon"),
      ],
    },
    {
      title: "Ikooni lisamine avaekraanile",
      steps: [
        info("Sagedasti kasutatava rakenduse saad avaekraanile eraldi ikoonina lisada."),
        tap(
          { android: "Ava kõigi rakenduste loend.", ios: "Libista avaekraanil viimasest vaatest vasakule." },
          "[data-home]",
          "openAllApps",
        ),
        tap("Hoia rakenduse ikooni all.", "[data-app='clock']", "longPress:clock"),
        tap(
          { android: "Vali „Lisa avaekraanile”.", ios: "Vali Add to Home Screen (lisa avaekraanile)." },
          "[data-add-home]",
          "addToHome",
        ),
      ],
    },
  ],
};
