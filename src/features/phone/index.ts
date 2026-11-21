/* Phone replica building blocks – owned by aruorg, everyone may use them
   (Home screen, Messages, Küberbrauser). Ask before changing. */
export { PhoneStage } from "./PhoneStage";
export { StatusBar, type StatusNotif } from "./StatusBar";
export { NavBar } from "./NavBar";
export { Keyboard } from "./Keyboard";
export {
  applyKey,
  openAccents,
  highlightAccent,
  closeAccents,
  releaseAccents,
  accentUnderFinger,
  keyboardAction,
  initialKeyboard,
  ACCENTS,
  EMOJIS,
  type KeyboardMode,
  type KeyboardState,
} from "./keyboardLogic";
export { APPS, AppIcon, AppTile, appName, appNameForText, type AppKey } from "./apps";
export { t, PHONE_TIME } from "./strings";
export * from "./icons";
