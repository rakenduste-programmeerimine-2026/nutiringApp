import type { House, Step } from "../types";

export const SIM_PIN = "1234";
export const SCREEN_LOCK = "2580";

const info = (
  text: Step["text"],
  target?: Step["target"],
  extra: Partial<Step> = {},
): Step => ({
  type: "info",
  text,
  ...(target ? { target } : {}),
  ...extra,
});
const act = (
  text: Step["text"],
  target: Step["target"],
  until: string | string[],
  extra: Partial<Step> = {},
): Step => ({ type: "do", text, target, until, ...extra });

const NAV_HOME: Step["text"] = {
  android: "Vajuta <b>●</b>, et minna avaekraanile tagasi.",
  ios: "<b>Pühi alt üles</b>, et minna avakuvale tagasi.",
};
const NAV_HOME_TARGET = { android: ".nav-home", ios: ".homeind" };

// Source: prototype „Nutiküla – Nutiring" (HOME.lessons) + client feedback 20.11.2026.
// Lessons 1 (explanations, lock-screen buttons), 2 (notification icons, sound mode, Do Not Disturb),
// 4 (brightness) and 7 (three buttons) are extended per the issue; their texts need client review.
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
        info(
          "<b>SIM PIN</b> kaitseb sinu SIM-kaarti ja mobiilinumbrit. Ilma selle koodita ei saa telefoniga helistada ega mobiilset internetti kasutada.",
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
          "See on <b>lukustuskuva</b>. Siin näed kellaaega ja kuupäeva ka siis, kui telefon on lukus.",
          ".lock-time, .lock-date",
        ),
        info(
          "Lukustuskuva all on kiirnupud (näiteks taskulamp ja kaamera). Neid saad kasutada ka lukus telefonil.",
          ".lock-buttons",
        ),
        info(
          "<b>Ekraanilukk</b> on eraldi kood, mis hoiab telefoni sisu võõraste eest. Seda küsitakse iga kord, kui telefoni avad.",
          ".lock-time, .lock-date",
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
            ios: "Sisesta pääsukood <b>2 5 8 0</b>.",
          },
          ".numpad",
          "passOk",
          {
            cardAt: "top",
            popup: {
              android: `Sinu harjutus-PIN-kood on <b>${SCREEN_LOCK}</b>`,
              ios: `Sinu harjutus-pääsukood on <b>${SCREEN_LOCK}</b>`,
            },
            hint: "Vajuta numbreid 2, 5, 8, 0.",
          },
        ),
        info(
          "Telefon on lahti! See on <b>avaekraan</b>. Siit avad kõik rakendused.",
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
        info(
          "<b>Teavituste ikoonid.</b> Olekuribale ilmub väike ikoon iga uue sõnumi või teate kohta, mida sa pole veel lugenud.",
          ".sb-notif",
        ),
        info(
          "<b>Helirežiim.</b> Kellukese või läbikriipsutatud kellukese ikoon näitab, kas telefon helisab või on vaikne.",
          ".sb-sound",
        ),
        info(
          "<b>Ära sega.</b> Kui see on sees, telefon ei helise ega näita teavitusi, kuni lülitad selle uuesti välja.",
          ".sb-dnd",
        ),
      ],
    },
    {
      title: "Teavitused",
      setup: "sb:openNotif",
      steps: [
        act(
          {
            android:
              "Pane sõrm ekraani ülaserva ja <b>pühi alla</b>. Võid ka vajutada.",
            ios: "Pane sõrm ekraani <b>vasakusse ülanurka</b> ja pühi alla. Võid ka vajutada.",
          },
          { android: ".sb", ios: ".sbl" },
          "openNotif",
        ),
        info(
          "<b>Teavitus</b> annab teada, et midagi on juhtunud. Siin kirjutas Mari Tamm sõnumi.",
          ".notif.n1",
        ),
        info(
          "Teavitusi saadavad ka teised rakendused, näiteks ilmateade.",
          ".notif.n2",
        ),
        act(
          "Teavituse eemaldamiseks <b>pühi seda küljele</b>.",
          ".notif.n2",
          "dismiss",
          { hint: "Pane sõrm teavitusele ja pühi paremale või vasakule." },
        ),
        act(
          {
            android:
              "Kui oled teavitused läbi lugenud, vajuta <b>Kustuta kõik</b>.",
            ios: "Kui oled teavitused läbi lugenud, vajuta <b>Tühjenda kõik</b>.",
          },
          ".clearall",
          "clearNotif",
        ),
        act(NAV_HOME, NAV_HOME_TARGET, "goHome"),
      ],
    },
    {
      title: "Kiirseaded",
      setup: "sb:openQS",
      steps: [
        act(
          {
            android:
              "Pane sõrm ekraani ülaserva ja <b>pühi alla</b>. Võid ka vajutada.",
            ios: "Pane sõrm ekraani <b>paremasse ülanurka</b> ja pühi alla. Võid ka vajutada.",
          },
          { android: ".sb", ios: ".sbr" },
          "openQS",
        ),
        info(
          {
            android:
              "Need on <b>kiirseaded</b>. Siit lülitad kiiresti asju sisse ja välja. Sinine nupp tähendab, et see on sees.",
            ios: "Need on <b>kiirseaded</b> (Juhtimiskeskus). Siit lülitad kiiresti asju sisse ja välja. Sinine nupp tähendab, et see on sees.",
          },
          ".qsgrid",
        ),
        info(
          "<b>Wi-Fi:</b> traadita internet kodus või kohvikus.",
          "[data-tile=wifi]",
        ),
        info(
          "<b>Mobiilne andmeside:</b> internet SIM-kaardi kaudu, kui Wi-Fit pole.",
          "[data-tile=data]",
        ),
        info(
          "<b>Taskulamp:</b> telefoni tagaküljel süttib tuli.",
          "[data-tile=torch]",
        ),
        info(
          "<b>Vaikne režiim:</b> telefon ei helise kõnede ja sõnumite peale.",
          "[data-tile=silent]",
        ),
        info(
          {
            android:
              "<b>Automaatne pööramine:</b> kui see on sees, keerab ekraan end koos telefoniga külili.",
            ios: "<b>Pööramislukk:</b> kui see on sees, ei keera ekraan end külili.",
          },
          "[data-tile=rotate]",
        ),
        info(
          "<b>Lennurežiim:</b> lülitab välja kõned, interneti ja Wi-Fi, näiteks lennukis.",
          "[data-tile=plane]",
        ),
        info(
          "<b>Heledus:</b> lohista riba, et ekraan oleks heledam või tumedam.",
          ".t-bright",
        ),
        act(
          "Proovi heledust! <b>Lohista heleduse liugurit</b> paremale või vasakule.",
          ".t-bright",
          "brightness",
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
        act(
          {
            android: "Vajuta <b>●</b>, et kiirseaded sulgeda.",
            ios: "<b>Pühi alt üles</b>, et Juhtimiskeskus sulgeda.",
          },
          NAV_HOME_TARGET,
          "goHome",
        ),
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
          { os: "android" },
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
          {
            os: "android",
          },
        ),
        info(
          "Ikoonid hakkasid <b>värisema</b>. Nüüd saad avakuva muuta.",
          ".homegrid, .dock",
          { os: "ios" },
        ),
        info(
          "<b>Pluss (+):</b> lisa avakuvale vidin, näiteks kell, ilm või kalender.",
          ".ie-plus",
          {
            os: "ios",
          },
        ),
        info(
          "<b>Muuda:</b> vaheta taustapilti ja avakuva kujundust.",
          ".ie-edit",
          { os: "ios" },
        ),
        act("Kui oled valmis, vajuta <b>Valmis</b>.", ".ie-done", "closeMenu", {
          os: "ios",
        }),
      ],
    },
    {
      title: "Kõik rakendused ja otsing",
      steps: [
        info(
          "Avaekraanil on ainult osa rakendusi. <b>Kõik rakendused</b> on eraldi kohas.",
          ".homegrid, .dock",
        ),
        act(
          "<b>Pühi ekraanil alt üles</b>, et näha kõiki rakendusi.",
          ".drawerhandle",
          "openDrawer",
          {
            os: "android",
          },
        ),
        act(
          "<b>Pühi ekraanil vasakule</b>, kuni jõuad Rakenduste kogusse. Võid ka vajutada täppidele.",
          ".pagedots",
          "openDrawer",
          { os: "ios" },
        ),
        info(
          {
            android:
              "Siin on <b>kõik telefoni rakendused</b> tähestiku järjekorras.",
            ios: "See on <b>Rakenduste kogu</b>. Siin on kõik telefoni rakendused.",
          },
          ".drawer .appgrid",
        ),
        act(
          {
            android: "Vajuta ülal <b>otsinguribale</b>.",
            ios: "Vajuta nupule <b>Otsi</b>.",
          },
          { android: ".searchbar", ios: ".searchpill" },
          "searchFocus",
        ),
        {
          type: "do",
          target: ".kb",
          text: "Kirjuta klaviatuuril sõna <b>kell</b>.",
          check: { kind: "searchQuery", value: "kell" },
          hint: "Vajuta tähti k, e, l, l.",
        },
        act(
          "Leitud! Vajuta rakendusele <b>Kell</b>, et see avada.",
          "[data-result=clock]",
          "open:clock",
        ),
        info("Kell on avatud. Nii leiad kiiresti iga rakenduse.", ".appscr"),
        act(
          "Kellas on mitu lehte. Vajuta <b>Alarms (äratused)</b>.",
          ".clock-tab-alarms",
          "alarms",
        ),
        act(
          {
            android: "Vajuta <b>Kell</b>, et minna tagasi kellaajale.",
            ios: "Vajuta <b>‹ Clock (kell)</b>, et minna tagasi.",
          },
          ".clock-back",
          "backClock",
        ),
      ],
    },
    {
      title: "Kolm nuppu ja tagasi minek",
      steps: [
        act(
          "Rakenduse avamiseks <b>vajuta selle ikoonile</b>. Ava <b>Kaamera</b>.",
          ".dock [data-app=camera]",
          "open:camera",
        ),
        info("Kaamera on avatud. Nüüd saaksid teha pilti.", ".camview"),
        info(
          "Ekraani all on <b>kolm nuppu</b>: ◀ <b>tagasi</b> läheb sammu tagasi, ● <b>avaleht</b> viib avaekraanile, ■ <b>avatud rakendused</b> näitab hiljuti avatud rakendusi.",
          ".navbar",
          { os: "android" },
        ),
        act(
          "Vajuta <b>ringikujulist nuppu ●</b>, et minna tagasi avaekraanile.",
          ".nav-home",
          "goHome",
          {
            os: "android",
          },
        ),
        info(
          "iPhone'il pole all nuppe. Avakuvale naasmiseks <b>pühi ekraani alumisest servast üles</b>.",
          ".homeind",
          { os: "ios" },
        ),
        act(
          "Avakuvale naasmiseks <b>pühi ekraani alumisest servast üles</b>. Võid ka vajutada joonele.",
          ".homeind",
          "goHome",
          { os: "ios" },
        ),
        info(
          "Oled jälle avaekraanil. Nii saad igast rakendusest välja tulla.",
          ".home",
        ),
        act(
          {
            android: "Vajuta nuppu <b>■</b>, et näha avatud rakendusi.",
            ios: "Pühi alumisest servast üles ja <b>peatu keset ekraani</b>, et näha avatud rakendusi.",
          },
          { android: ".nav-recents", ios: ".homeind" },
          "recents",
        ),
        act(
          "Rakenduse sulgemiseks <b>pühi selle kaarti üles</b>.",
          ".recents-card",
          "closeCard",
          { hint: "Pane sõrm kaardile ja pühi üles." },
        ),
      ],
    },
    {
      title: "Avaekraanil olevad rakendused",
      steps: [
        info(
          "<b>Telefon:</b> sellega helistad ja vastad kõnedele.",
          "[data-app=phone]",
        ),
        info(
          "<b>Brauser</b> on rakendus, millega pääsed internetti ja saad vaadata veebilehti.",
          "[data-app=browser]",
        ),
        info(
          "<b>Kaamera:</b> sellega teed pilte ja videoid.",
          ".dock [data-app=camera]",
        ),
        info(
          "<b>Seaded:</b> siin muudad telefoni seadeid, näiteks teksti suurust, helitugevust ja Wi-Fi ühendust.",
          "[data-app=settings]",
        ),
        info(
          "<b>Sõnumid:</b> siin loed ja kirjutad tekstisõnumeid (SMS).",
          "[data-app=messages]",
        ),
        info(
          "<b>Kontaktid:</b> sinu telefoniraamat. Siin on inimeste nimed ja telefoninumbrid.",
          "[data-app=contacts]",
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
            ios: "Oled Rakenduste kogus. Lisame <b>Kella</b> avakuvale.",
          },
          ".drawer .appgrid",
        ),
        act(
          "<b>Hoia sõrme</b> Kella ikoonil, kuni avaneb menüü.",
          "[data-dapp=clock]",
          "longApp",
          {
            hint: "Hoia sõrme all umbes üks sekund.",
          },
        ),
        act(
          {
            android: "Vajuta <b>Lisa avaekraanile</b>.",
            ios: "Vajuta <b>Lisa avakuvale</b>.",
          },
          ".ctx-add",
          "addHome",
        ),
        info("Kell on nüüd avaekraanil!", ".homegrid [data-app=clock]"),
        info(
          "Ikooni <b>liigutamiseks</b> hoia sõrme ikoonil ja lohista see uude kohta. Kui lased sõrme lahti, jääb ikoon sinna.",
          ".homegrid",
        ),
      ],
    },
  ],
};
