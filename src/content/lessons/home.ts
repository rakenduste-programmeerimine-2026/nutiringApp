import type { House, Step, Text } from "../types";

export const SIM_PIN = "1234";
export const SCREEN_LOCK = "2580";

/** Estonian on Android, English (with Estonian meaning where needed) on iPhone. */
const T = (android: string, ios: string): Text => ({ android, ios });

/** App names in instruction texts: iPhone shows the English name plus the Estonian meaning. */
const APP = {
  phone: T("Telefon", "Phone"),
  messages: T("Sõnumid", "Messages"),
  camera: T("Kaamera", "Camera (kaamera)"),
  settings: T("Seaded", "Settings (seaded)"),
  contacts: T("Kontaktid", "Contacts (kontaktid)"),
  clock: T("Kell", "Clock (kell)"),
};
/** Same wording for both systems except for the app name. */
const withApp = (before: string, app: Text, after: string): Text => ({
  android: `${before}${(app as { android: string }).android}${after}`,
  ios: `${before}${(app as { ios: string }).ios}${after}`,
});

const info = (text: Text, target?: Text, extra: Partial<Step> = {}): Step => ({
  type: "info",
  text,
  ...(target ? { target } : {}),
  ...extra,
});
const act = (
  text: Text,
  target: Text,
  until: string | string[],
  extra: Partial<Step> = {},
): Step => ({ type: "do", text, target, until, ...extra });
const check = (
  text: Text,
  target: Text,
  kind: string,
  value?: string | number,
  extra: Partial<Step> = {},
): Step => ({
  type: "do",
  text,
  target,
  check: value === undefined ? { kind } : { kind, value },
  ...extra,
});

const goHome = (): Step =>
  act(
    {
      android: "Vajuta ringi <b>●</b>, et minna avaekraanile.",
      ios: "<b>Pühi alt üles</b>, et minna avakuvale. Võid ka vajutada joonele.",
    },
    { android: ".nav-home", ios: ".homeind" },
    "goHome",
  );

// Source: prototype „Nutiküla – Nutiring" (HOME.lessons), version 20.11.2026.
export const home: House = {
  title: "Avaekraan",
  lessons: [
    {
      title: "SIM-kaardi PIN ja telefoni avamine",
      setup: "sim",
      steps: [
        info(
          "Telefon on sisse lülitatud ja küsib <b>SIM-kaardi PIN-koodi</b>. Päris telefonis on see kood kirjas SIM-kaardi ümbrisel.",
          ".pinbox",
        ),
        act(
          "Sisesta numbritega <b>1 2 3 4</b> ja vajuta <b>OK</b>.",
          ".numpad",
          "simOk",
          {
            cardAt: "top",
            popup: `Sinu harjutus-SIM-PIN on <b>${SIM_PIN}</b>`,
            hint: "Vajuta numbreid 1, 2, 3, 4 ja siis OK.",
          },
        ),
        info(
          "<b>Mis on SIM-kaardi PIN?</b> See avab sinu <b>SIM-kaardi</b>. SIM-kaarti on vaja <b>helistamiseks, sõnumite saatmiseks ja mobiilse interneti</b> kasutamiseks. Telefon küsib seda tavaliselt ainult siis, kui telefon sisse lülitatakse.",
        ),
        info(
          "See on <b>lukustuskuva</b>. Siin näed kellaaega ja kuupäeva ka siis, kui telefon on lukus.",
          ".lock-time, .lock-date",
        ),
        info(
          {
            android:
              "<b>Telefoni nupp:</b> sellega saad helistada otse lukustuskuvalt, telefoni avamata.",
            ios: "<b>Flashlight</b> (taskulamp): hoia sõrme sellel, et taskulamp sisse või välja lülitada.",
          },
          ".lk-left",
        ),
        info(
          withApp(
            "<b>",
            APP.camera,
            ":</b> sellega saad kiiresti pilti teha, telefoni avamata.",
          ),
          ".lk-right",
        ),
        act(
          "Pane sõrm ekraani alaossa ja <b>pühi üles</b>. Võid ka lihtsalt vajutada.",
          ".swipeup",
          "unlock",
        ),
        act(
          {
            android:
              "Sisesta ekraaniluku kood <b>2 5 8 0</b> ja vajuta <b>OK</b>.",
            ios: "Sisesta pääsukood (passcode) <b>2 5 8 0</b>.",
          },
          ".numpad",
          "passOk",
          {
            cardAt: "top",
            popup: {
              android: `Sinu harjutus-ekraanilukk on <b>${SCREEN_LOCK}</b>`,
              ios: `Sinu harjutus-pääsukood on <b>${SCREEN_LOCK}</b>`,
            },
            hint: "Vajuta numbreid 2, 5, 8, 0.",
          },
        ),
        info({
          android:
            "<b>Mis on ekraanilukk?</b> See on <b>teine kood</b> kui SIM-kaardi PIN. Ekraanilukk kaitseb sinu telefoni võõraste eest ja seda küsitakse iga kord, kui telefoni avad. Koodi asemel võib ekraanilukk olla ka <b>muster, parool, näotuvastus või sõrmejälg</b>.",
          ios: "<b>Mis on ekraanilukk?</b> See on <b>teine kood</b> kui SIM-kaardi PIN. Ekraanilukk kaitseb sinu telefoni võõraste eest ja seda küsitakse iga kord, kui telefoni avad. Koodi asemel võib ekraanilukk olla ka <b>muster, parool, Face ID (näotuvastus) või sõrmejälg</b>.",
        }),
        info(
          {
            android:
              "Telefon on lahti! See on <b>avaekraan</b>. Siit avad kõik rakendused.",
            ios: "Telefon on lahti! See on <b>avakuva</b>. Siit avad kõik rakendused.",
          },
          ".home",
        ),
      ],
    },
    {
      title: "Mis on ekraani ülaosas?",
      steps: [
        info(
          "Ekraani kõige ülemises reas on <b>olekuriba</b>. Väikesed ikoonid näitavad telefoni olekut.",
          ".sb",
        ),
        info("<b>Kellaaeg.</b> Siit näed alati, mis kell on.", ".sb-time"),
        info(
          "<b>Teavituste ikoonid.</b> Kella kõrval olevad väikesed märgid näitavad, et sulle on tulnud teavitusi: sõnum, ilmateade ja vastamata kõne. Teavitusi vaatame järgmises tunnis.",
          ".sb-notifs",
          { os: "android" },
        ),
        info(
          {
            android:
              "<b>Helirežiim.</b> Vibreerimise märk tähendab, et telefon on <b>vibreerimise režiimis</b>: kõne või sõnumi korral telefon ei helise, vaid väriseb.<br>Kui näed hoopis kuu märki, on sees <b>„Ära sega”</b>: telefon ei helise ega näita teavitusi.",
            ios: "<b>Helirežiim.</b> Läbikriipsutatud kellukese märk tähendab, et sees on <b>Silent Mode</b> (vaikne režiim): telefon ei helise, vaid väriseb.<br>Kui näed hoopis kuu märki, on sees <b>Do Not Disturb</b> (ära sega): telefon ei helise ega näita teavitusi.",
          },
          ".sb-sound",
        ),
        info(
          "<b>Mobiililevi.</b> Mida rohkem pulki, seda parem on levi helistamiseks.",
          ".sb-signal",
        ),
        info(
          "<b>Wi-Fi.</b> See märk tähendab, et telefon on ühendatud traadita internetiga.",
          ".sb-wifi",
        ),
        info(
          {
            android:
              "<b>Aku.</b> Number näitab, kui palju akut on alles. Kui see on väike, pane telefon laadima.",
            ios: "<b>Aku.</b> Täis kast tähendab täis akut. Kui kast on peaaegu tühi, pane telefon laadima.",
          },
          ".sb-batt",
        ),
      ],
    },
    {
      title: "Teavitused",
      setup: "sb:openNotif",
      steps: [
        act(
          {
            android: "Pane sõrm ekraani ülaserva ja <b>pühi alla</b>.",
            ios: "Pane sõrm ekraani <b>vasakusse ülanurka</b> ja <b>pühi alla</b>.",
          },
          { android: ".sb", ios: ".sbl" },
          "openNotif",
          { hint: "Pane sõrm ekraani ülaserva ja libista seda alla." },
        ),
        info(
          "<b>Teavitused</b> annavad teada, et midagi on juhtunud: tuli sõnum, keegi helistas või rakendus tahab sulle midagi öelda.",
          ".notif",
        ),
        info(
          "Igal teavitusel on näha <b>kellaaeg</b>, millal see tuli.",
          ".ntime",
        ),
        info(
          {
            android:
              "Siin on <b>vastamata kõne</b>: Mari Tamm helistas sulle, aga sa ei vastanud.",
            ios: "Siin on <b>Missed Call (vastamata kõne)</b>: Mari Tamm helistas sulle, aga sa ei vastanud.",
          },
          ".notif[data-n=call]",
        ),
        act(
          "Ühe teavituse saad eemaldada, kui <b>libistad selle sõrmega külje peale</b>. Proovi seda vastamata kõnega.",
          ".notif[data-n=call]",
          "dismiss",
          { hint: "Pane sõrm teavitusele ja libista paremale või vasakule." },
        ),
        info(
          "Teavitus kadus. Nii saad teavitusi <b>ükshaaval</b> eemaldada.",
          ".notif",
        ),
        act(
          {
            android:
              "Kõik teavitused korraga saad eemaldada nupuga <b>Kustuta kõik</b>. Vajuta seda.",
            ios: "Kõik teavitused korraga saad eemaldada nupuga <b>Clear All</b> (tühjenda kõik). Vajuta seda.",
          },
          ".clearall",
          "clearNotif",
        ),
        act(
          {
            android:
              "Teavituste sulgemiseks <b>pühi alt üles</b> või vajuta <b>ringi ●</b>.",
            ios: "Teavituste sulgemiseks <b>pühi ekraani alumisest servast üles</b>.",
          },
          { android: ".shadehandle, .nav-home", ios: ".homeind" },
          "goHome",
          {
            hint: {
              android: "Libista sõrme alt üles või vajuta ringi ●.",
              ios: "Pane sõrm alumisele joonele ja libista üles.",
            },
          },
        ),
      ],
    },
    {
      title: "Kiirseaded",
      setup: "sb:openQS",
      steps: [
        act(
          {
            android: "Pane sõrm ekraani ülaserva ja <b>pühi alla</b>.",
            ios: "Pane sõrm ekraani <b>paremasse ülanurka</b> ja <b>pühi alla</b>.",
          },
          { android: ".sb", ios: ".sbr" },
          "openQS",
          { hint: "Pane sõrm ekraani ülaserva ja libista seda alla." },
        ),
        info(
          {
            android:
              "Need on <b>kiirseaded</b>. Siit lülitad kiiresti asju sisse ja välja. Sinine nupp tähendab, et see on sees.",
            ios: "Need on <b>kiirseaded</b> (iPhone'is <b>Control Center</b>). Siit lülitad kiiresti asju sisse ja välja. Hele nupp tähendab, et see on sees.",
          },
          ".qsgrid",
        ),
        info(
          "<b>Wi-Fi:</b> traadita internet kodus või kohvikus. Kui telefon ei ole Wi-Fi-ga ühendatud, kasutab ta internetiks <b>mobiilset andmesidet</b>, kui see on sisse lülitatud.",
          "[data-tile=wifi]",
        ),
        info(
          {
            android:
              "<b>Mobiilne andmeside:</b> internet SIM-kaardi kaudu. Seda kasutatakse siis, kui Wi-Fit pole.",
            ios: "<b>Cellular (mobiilne andmeside):</b> internet SIM-kaardi kaudu. Seda kasutatakse siis, kui Wi-Fit pole.",
          },
          "[data-tile=data]",
        ),
        info(
          {
            android: "<b>Taskulamp:</b> telefoni tagaküljel süttib tuli.",
            ios: "<b>Flashlight (taskulamp):</b> telefoni tagaküljel süttib tuli.",
          },
          "[data-tile=torch]",
        ),
        info(
          {
            android:
              "<b>Vaikne režiim:</b> telefon ei helise kõnede ja sõnumite peale.",
            ios: "<b>Silent Mode (vaikne režiim):</b> telefon ei helise kõnede ja sõnumite peale.",
          },
          "[data-tile=silent]",
        ),
        info(
          {
            android:
              "<b>Automaatne pööramine:</b> kui see on sees, keerab ekraan end koos telefoniga külili.",
            ios: "<b>Orientation Lock</b> (pööramislukk): kui see on sees, ei keera ekraan end külili.",
          },
          "[data-tile=rotate]",
        ),
        info(
          {
            android:
              "<b>Lennurežiim:</b> lülitab välja kõned, interneti ja Wi-Fi, näiteks lennukis.",
            ios: "<b>Airplane Mode (lennurežiim):</b> lülitab välja kõned, interneti ja Wi-Fi, näiteks lennukis.",
          },
          "[data-tile=plane]",
        ),
        check(
          {
            android:
              "<b>Heledus:</b> sellega muudad ekraani heledamaks või tumedamaks. Proovi: <b>lohista sõrmega</b> riba vasakule või paremale.",
            ios: "<b>Heledus:</b> sellega muudad ekraani heledamaks või tumedamaks. Proovi: <b>lohista sõrmega</b> riba alla või üles.",
          },
          ".t-bright",
          "brightnessChanged",
          15,
          { hint: "Pane sõrm ribale ja libista seda." },
        ),
        info(
          "Tubli! Ekraani heledus muutus. Vali endale sobiv heledus: liiga tume ekraan on raskesti loetav.",
          ".t-bright",
        ),
        act(
          "Proovi järele! Lülita <b>taskulamp</b> sisse.",
          "[data-tile=torch]",
          "tile:torch",
        ),
        act(
          "Taskulamp põleb. Vajuta uuesti, et see <b>välja lülitada</b>.",
          "[data-tile=torch]",
          "tile:torch",
        ),
        goHome(),
      ],
    },
    {
      title: "Pikk puudutus avaekraanil",
      steps: [
        act(
          "<b>Hoia sõrme</b> ekraanil tühjal kohal umbes üks sekund, kuni midagi muutub.",
          ".wallempty",
          "longHome",
          { hint: "Hoia sõrme all, ära lase kohe lahti." },
        ),
        info(
          "Avanes <b>menüü</b>. Siin saad muuta avaekraani välimust.",
          ".lmenu",
          {
            os: "android",
          },
        ),
        info(
          "<b>Taustapilt ja stiil:</b> vali ekraani taustale uus pilt ja värvid.",
          ".lm-wall",
          { os: "android" },
        ),
        info(
          "<b>Vidinad:</b> väikesed aknad avaekraanil, näiteks kell, ilm või kalender.",
          ".lm-widg",
          { os: "android" },
        ),
        info(
          "<b>Avaekraani seaded:</b> näiteks ikoonide suurus ja paigutus.",
          ".lm-set",
          { os: "android" },
        ),
        act(
          "Menüü sulgemiseks <b>vajuta tühjale kohale</b> ekraanil.",
          ".menuclose",
          "closeMenu",
          { os: "android" },
        ),
        info(
          "Ikoonid hakkasid <b>värisema</b>. Nüüd saad avakuva muuta.",
          ".homegrid, .dock",
          { os: "ios" },
        ),
        info(
          "<b>Pluss (+):</b> lisa avakuvale vidin, näiteks kell, ilm või kalender.",
          ".ie-plus",
          { os: "ios" },
        ),
        info(
          "<b>Edit</b> (muuda): vaheta taustapilti ja avakuva kujundust.",
          ".ie-edit",
          { os: "ios" },
        ),
        act(
          "Kui oled valmis, vajuta <b>Done</b> (valmis).",
          ".ie-done",
          "closeMenu",
          { os: "ios" },
        ),
      ],
    },
    {
      title: "Kõik rakendused ja otsimine",
      steps: [
        info(
          {
            android:
              "Avaekraanil on ainult osa rakendusi. <b>Kõik rakendused</b> on eraldi kohas.",
            ios: "Avakuval on ainult osa rakendusi. <b>Kõik rakendused</b> on eraldi kohas.",
          },
          ".homegrid, .dock",
        ),
        info(
          "Kõigi rakenduste vaatesse saad <b>kahel viisil</b>: <b>pühi ekraanil alt üles</b> või vajuta <b>üheksa täpiga nuppu</b> (see on näiteks Samsungi telefonidel). Mõlemad töötavad.",
          ".drawerhandle, .apps-btn",
          { os: "android" },
        ),
        act(
          "Proovi ühte neist: <b>pühi alt üles</b> või vajuta <b>üheksa täpiga nuppu</b>.",
          ".drawerhandle, .apps-btn",
          "openDrawer",
          { os: "android" },
        ),
        act(
          "<b>Pühi ekraanil vasakule</b>, kuni jõuad <b>App Library</b> (rakenduste kogu) vaatesse. Võid ka vajutada täppidele.",
          ".pagedots",
          "openDrawer",
          { os: "ios" },
        ),
        info(
          {
            android:
              "Siin on <b>kõik telefoni rakendused</b> tähestiku järjekorras.",
            ios: "See on <b>App Library</b> (rakenduste kogu). Siin on kõik telefoni rakendused.",
          },
          ".drawer .appgrid",
        ),
        act(
          "Rakenduse leiad kiiresti otsinguga. Vajuta üleval <b>otsinguribale</b>.",
          ".searchbar",
          "searchFocus",
        ),
        check(
          "Kirjuta klaviatuuril sõna <b>kell</b>.",
          ".kb",
          "searchQuery",
          "kell",
          { os: "android", hint: "Vajuta tähti k, e, l, l." },
        ),
        check(
          "Kirjuta klaviatuuril sõna <b>clock</b> (iPhone'is on rakenduste nimed inglise keeles).",
          ".kb",
          "searchQuery",
          "clock",
          { os: "ios", hint: "Vajuta tähti c, l, o, c, k." },
        ),
        act(
          withApp(
            "Leitud! Vajuta rakendusele <b>",
            APP.clock,
            "</b>, et see avada.",
          ),
          "[data-result=clock]",
          "open:clock",
        ),
        info(
          {
            android: "Kell on avatud. Nii leiad kiiresti iga rakenduse.",
            ios: "Clock on avatud. Nii leiad kiiresti iga rakenduse.",
          },
          ".clockapp",
        ),
      ],
    },
    {
      title: "Kolm nuppu: tagasi, avaekraan ja avatud rakendused",
      setup: "drawer",
      steps: [
        act(
          withApp("Ava rakendus <b>", APP.clock, "</b>."),
          ".drawer [data-app=clock]",
          "open:clock",
        ),
        info(
          "Ekraani all on <b>kolm nuppu</b>: ◀ kolmnurk viib <b>sammu tagasi</b>, ● ring viib <b>avaekraanile</b> ja ■ ruut näitab <b>avatud rakendusi</b>. Proovime kõiki.",
          ".navbar",
          { os: "android" },
        ),
        info(
          "iPhone'il ei ole all nuppe. Kõik käib <b>pühkimisega</b> ja ekraani all oleva <b>joonega</b>. Proovime: tagasi minek, avakuvale minek ja avatud rakendused.",
          ".homeind",
          { os: "ios" },
        ),
        act(
          {
            android: "Vajuta all <b>Äratus</b>.",
            ios: "Vajuta all <b>Alarms</b> (äratused).",
          },
          ".tab-alarm",
          "alarms",
        ),
        info(
          "See on <b>äratuste</b> leht. Nüüd läheme tagasi eelmisele lehele.",
          ".alarms",
        ),
        act(
          "Vajuta <b>kolmnurka ◀</b>, et minna sammu tagasi.",
          ".nav-back",
          "backClock",
          { os: "android" },
        ),
        act(
          "iPhone'is on tagasi-nupp tavaliselt <b>üleval vasakul</b>. Vajuta <b>‹ Clock</b>. (Tagasi saab ka pühkides ekraani vasakust servast paremale.)",
          ".ios-back",
          "backClock",
          { os: "ios" },
        ),
        info(
          "Oled jälle Kella lehel. <b>Tagasi</b> viib alati ühe sammu tagasi.",
          ".clkbig",
        ),
        act(
          "Nüüd vajuta <b>ringi ●</b>, et minna avaekraanile.",
          ".nav-home",
          "goHome",
          { os: "android" },
        ),
        act(
          "<b>Pühi alt üles</b>, et minna avakuvale. Võid ka vajutada joonele.",
          ".homeind",
          "goHome",
          { os: "ios" },
        ),
        info(
          {
            android:
              "Oled avaekraanil. NB! Kell <b>ei sulgunud</b>, see jäi taustale avatuks.",
            ios: "Oled avakuval. NB! Kell <b>ei sulgunud</b>, see jäi taustale avatuks.",
          },
          ".home",
        ),
        act(
          "Vajuta <b>ruutu ■</b>, et näha avatud rakendusi.",
          ".nav-recent",
          "recents",
          { os: "android" },
        ),
        act(
          "<b>Pühi alt üles ja hoia sõrme</b> hetk ekraanil, kuni näed avatud rakendusi. Siin harjutuses: hoia sõrme joonel.",
          ".homeind",
          "openRecents",
          { os: "ios", hint: "Hoia sõrme joonel umbes üks sekund." },
        ),
        info("Siin on kõik <b>avatud rakendused</b>.", ".rrow"),
        act(
          "<b>Pühi Kella kaarti üles</b>, et rakendus sulgeda.",
          ".rcard[data-r=clock]",
          "closeCard",
          { hint: "Pane sõrm Kella kaardile ja libista üles." },
        ),
        info("Kell on nüüd <b>päriselt suletud</b>.", ".rrow, .recents"),
        goHome(),
      ],
    },
    {
      title: "Avaekraanil olevad rakendused",
      steps: [
        info(
          withApp(
            "Alustame alt vasakult. <b>",
            APP.phone,
            ":</b> sellega helistad ja vastad kõnedele.",
          ),
          ".dock [data-app=phone]",
        ),
        info(
          withApp(
            "<b>",
            APP.messages,
            ":</b> siin loed ja kirjutad tekstisõnumeid (SMS).",
          ),
          ".dock [data-app=messages]",
        ),
        info(
          {
            android:
              "<b>Google Chrome</b> on brauser. Sellega pääsed internetti ja saad vaadata veebilehti.",
            ios: "<b>Safari</b> on brauser. Sellega pääsed internetti ja saad vaadata veebilehti.",
          },
          ".dock [data-app=browser]",
        ),
        info(
          withApp(
            "<b>",
            APP.camera,
            ":</b> sellega teed <b>pilte ja videoid</b> ning saad isegi <b>skaneerida QR-koode</b>.",
          ),
          ".dock [data-app=camera]",
        ),
        info(
          "<b>Üheksa täpiga nupp</b> avab <b>kõigi rakenduste</b> vaate. Sinna pääsed ka, kui pühid ekraanil alt üles.",
          ".apps-btn",
          { os: "android" },
        ),
        info(
          "Meeldetuletus: <b>kõik rakendused</b> leiad, kui pühid ekraanil vasakule <b>App Library</b> (rakenduste kogu) vaatesse.",
          ".pagedots",
          { os: "ios" },
        ),
        info(
          withApp(
            "Nüüd ülemised. <b>",
            APP.settings,
            ":</b> siin muudad telefoni seadeid, näiteks teksti suurust, helitugevust ja Wi-Fi ühendust.",
          ),
          ".homegrid [data-app=settings]",
        ),
        info(
          withApp(
            "<b>",
            APP.contacts,
            ":</b> sinu telefoniraamat. Siin on inimeste nimed ja telefoninumbrid.",
          ),
          ".homegrid [data-app=contacts]",
        ),
      ],
    },
    {
      title: "Ikooni lisamine avaekraanile",
      setup: "drawer",
      steps: [
        info(
          {
            android:
              "Oled kõigi rakenduste vaates. Lisame <b>Kella</b> avaekraanile.",
            ios: "Oled App Library vaates. Lisame <b>Clock</b> (kell) rakenduse avakuvale.",
          },
          ".drawer .appgrid",
        ),
        act(
          {
            android: "<b>Hoia sõrme</b> Kella ikoonil, kuni avaneb menüü.",
            ios: "<b>Hoia sõrme</b> Clock ikoonil, kuni avaneb menüü.",
          },
          "[data-dapp=clock]",
          "longApp",
          { hint: "Hoia sõrme all umbes üks sekund." },
        ),
        act(
          {
            android: "Vajuta <b>Lisa avaekraanile</b>.",
            ios: "Vajuta <b>Add to Home Screen</b> (lisa avakuvale).",
          },
          ".ctx-add",
          "addHome",
        ),
        info(
          {
            android: "Kell on nüüd avaekraanil!",
            ios: "Clock on nüüd avakuval!",
          },
          ".homegrid [data-app=clock]",
        ),
        info(
          "Ikooni <b>liigutamiseks</b> hoia sõrme ikoonil ja lohista see uude kohta. Kui lased sõrme lahti, jääb ikoon sinna.",
          ".homegrid",
        ),
      ],
    },
  ],
};
