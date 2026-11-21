/* Keyboard logic without any drawing (prototype: keyboard() + applyKey()).
   Decision 20.11.2026: English QWERTY on both systems; Estonian letters
   by holding o, a, u, s, z, e. */

export type KeyboardMode = "abc" | "123" | "emoji";

export type KeyboardState = {
  shift: boolean;
  mode: KeyboardMode;
  /** Show an emoji key instead of „,” (iPhone Messages). */
  emojiKey: boolean;
  /** Base letter whose accent popup is open, e.g. "o", or null. */
  acc: string | null;
  /** Accent letter under the finger in the open popup, e.g. "õ", or null. */
  accSel: string | null;
};

export const initialKeyboard = (emojiKey = false): KeyboardState => ({
  shift: false,
  mode: "abc",
  emojiKey,
  acc: null,
  accSel: null,
});

/** Letters you get by holding a key. */
export const ACCENTS: Record<string, string[]> = {
  a: ["ä", "à", "á"],
  o: ["õ", "ö", "ó"],
  u: ["ü", "ú"],
  s: ["š"],
  z: ["ž"],
  e: ["é", "è"],
};

export const LETTER_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

export const SYMBOL_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["@", "#", "€", "&", "-", "+", "(", ")", "/"],
  ["*", '"', "'", ":", ";", "!", "?"],
];

export const EMOJIS = ["😀", "😂", "😊", "😍", "👍", "🙏", "❤️", "🌷", "🎉", "☀️", "😢", "😮", "👋", "🤗", "🎂", "☕", "🐶", "🌲"];

/**
 * Key ids (the `data-k` attribute on each key):
 *   "ch:x"  type the character x       "space"   type a space
 *   "bksp"  delete the last character  "shift"   next letter upper case
 *   "mode123" / "abc" / "emoji"  switch keyboard
 *   "enter" does nothing here – each screen decides what Enter means
 */
export function applyKey(
  key: string,
  text: string,
  state: KeyboardState,
): { text: string; state: KeyboardState } {
  const next: KeyboardState = { ...state, acc: null, accSel: null };

  if (key === "shift") next.shift = !state.shift;
  else if (key === "mode123") next.mode = "123";
  else if (key === "abc") next.mode = "abc";
  else if (key === "emoji") next.mode = "emoji";
  // [...text] splits by characters, so an emoji is deleted as one character
  else if (key === "bksp") text = [...text].slice(0, -1).join("");
  else if (key === "space") text += " ";
  else if (key.startsWith("ch:")) {
    text += key.slice(3);
    next.shift = false; // Shift is for one letter only
  }
  return { text, state: next };
}

/* ---------- accent popup: hold, slide, release (like a real phone) ----------
   1. hold a letter        → openAccents()      popup opens, nothing highlighted
   2. slide the finger     → highlightAccent()  letter under the finger turns blue
   3. lift the finger      → releaseAccents()   types the highlighted letter (if any)
                                                and always closes the popup */

/** Holding a letter opens its accent popup (event "keyLong"). */
export function openAccents(state: KeyboardState, base: string): KeyboardState {
  return ACCENTS[base] ? { ...state, acc: base, accSel: null } : state;
}

/** Mark the accent letter under the finger (null = finger not on a letter). */
export function highlightAccent(state: KeyboardState, letter: string | null): KeyboardState {
  if (!state.acc) return state;
  const valid = letter !== null && ACCENTS[state.acc].includes(letter.toLowerCase());
  const accSel = valid ? letter!.toLowerCase() : null;
  // Same letter as before → return the same object, so React does not redraw on every finger move.
  return accSel === state.accSel ? state : { ...state, accSel };
}

/** Close the popup without typing anything. */
export function closeAccents(state: KeyboardState): KeyboardState {
  return { ...state, acc: null, accSel: null };
}

/**
 * Finger lifted while the popup is open: type the highlighted letter
 * (upper case if Shift is on) and close the popup. Nothing highlighted =
 * nothing typed.
 */
export function releaseAccents(text: string, state: KeyboardState): { text: string; state: KeyboardState } {
  if (!state.acc) return { text, state };
  if (!state.accSel) return { text, state: closeAccents(state) };
  const letter = state.shift ? state.accSel.toUpperCase() : state.accSel;
  return applyKey(`ch:${letter}`, text, state);
}

/**
 * One place for every keyboard action the lesson engine sends, so each house
 * only needs:  const r = keyboardAction(action, data, text, kb); if (r) …
 *   "key"           data.k = key id        → applyKey
 *   "keyLong"       data.base = "o"        → open accent popup
 *   "accentHover"   data.letter = "õ" / "" → highlight letter under the finger
 *   "accentRelease"                        → type highlighted letter, close popup
 *   "emojiPick"     data.e = "👍"          → add the emoji
 * Returns null for actions that are not keyboard actions.
 */
export function keyboardAction(
  action: string,
  data: Record<string, string | undefined>,
  text: string,
  state: KeyboardState,
): { text: string; state: KeyboardState } | null {
  switch (action) {
    case "key":
      return data.k ? applyKey(data.k, text, state) : { text, state };
    case "keyLong":
      return { text, state: data.base ? openAccents(state, data.base) : state };
    case "accentHover":
      return { text, state: highlightAccent(state, data.letter || null) };
    case "accentRelease":
      return releaseAccents(text, state);
    case "emojiPick":
      return { text: data.e ? text + data.e : text, state };
    default:
      return null;
  }
}

/**
 * Which accent letter is under the finger at screen point (x, y)?
 * Returns the letter (e.g. "õ") or null. Uses the browser's elementFromPoint.
 */
export function accentUnderFinger(x: number, y: number): string | null {
  if (typeof document === "undefined" || !document.elementFromPoint) return null;
  const el = document.elementFromPoint(x, y)?.closest<HTMLElement>(".accpop [data-k]");
  return el?.dataset.k?.startsWith("ch:") ? el.dataset.k.slice(3) : null;
}
