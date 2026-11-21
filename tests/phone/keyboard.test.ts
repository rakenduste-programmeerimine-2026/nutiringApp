import { describe, expect, it } from "vitest";
import {
  applyKey,
  closeAccents,
  highlightAccent,
  initialKeyboard,
  openAccents,
  releaseAccents,
} from "@/features/phone";

const type = (keys: string[], start = "") => {
  let text = start;
  let state = initialKeyboard();
  for (const k of keys) ({ text, state } = applyKey(k, text, state));
  return { text, state };
};

describe("applyKey", () => {
  it("types characters and spaces", () => {
    expect(type(["ch:k", "ch:e", "ch:l", "ch:l"]).text).toBe("kell");
    expect(type(["ch:a", "space", "ch:b"]).text).toBe("a b");
  });

  it("Shift makes only the next letter upper case", () => {
    // The keyboard sends the already upper-case letter while Shift is on.
    const { text, state } = type(["shift", "ch:T", "ch:e"]);
    expect(text).toBe("Te");
    expect(state.shift).toBe(false);
  });

  it("Shift can be switched off again", () => {
    expect(type(["shift", "shift"]).state.shift).toBe(false);
  });

  it("backspace deletes the last character, an emoji as one", () => {
    expect(type(["bksp"], "Tere").text).toBe("Ter");
    expect(type(["bksp"], "Hi 👍").text).toBe("Hi ");
    expect(type(["bksp"], "").text).toBe("");
  });

  it("switches between letters, numbers and emojis", () => {
    expect(type(["mode123"]).state.mode).toBe("123");
    expect(type(["mode123", "abc"]).state.mode).toBe("abc");
    expect(type(["emoji"]).state.mode).toBe("emoji");
  });

  it("Enter does not change the text", () => {
    expect(type(["enter"], "Tere").text).toBe("Tere");
  });
});

describe("accent popup", () => {
  it("opens for o and closes after the next key", () => {
    const opened = openAccents(initialKeyboard(), "o");
    expect(opened.acc).toBe("o");
    const { text, state } = applyKey("ch:õ", "Tere ", opened);
    expect(text).toBe("Tere õ");
    expect(state.acc).toBeNull();
  });

  it("does nothing for letters without accents", () => {
    expect(openAccents(initialKeyboard(), "k").acc).toBeNull();
  });
});

describe("hold, slide and release (like a real phone)", () => {
  const holdS = () => openAccents(initialKeyboard(), "s");

  it("nothing is highlighted when the popup opens", () => {
    expect(holdS().accSel).toBeNull();
  });

  it("sliding onto š highlights it; releasing types it and closes the popup", () => {
    const sliding = highlightAccent(holdS(), "š");
    expect(sliding.accSel).toBe("š");
    const { text, state } = releaseAccents("Ta", sliding);
    expect(text).toBe("Taš");
    expect(state.acc).toBeNull();
    expect(state.accSel).toBeNull();
  });

  it("releasing without landing on a letter types nothing and closes the popup", () => {
    const { text, state } = releaseAccents("Ta", holdS());
    expect(text).toBe("Ta");
    expect(state.acc).toBeNull();
  });

  it("moving off the letters removes the highlight", () => {
    const off = highlightAccent(highlightAccent(holdS(), "š"), null);
    expect(off.accSel).toBeNull();
  });

  it("ignores letters that are not in the open popup", () => {
    expect(highlightAccent(holdS(), "õ").accSel).toBeNull();
  });

  it("types an upper-case letter while Shift is on", () => {
    const shifted = highlightAccent(openAccents({ ...initialKeyboard(), shift: true }, "o"), "Õ");
    expect(releaseAccents("", shifted).text).toBe("Õ");
  });

  it("closeAccents closes without typing", () => {
    const closed = closeAccents(highlightAccent(holdS(), "š"));
    expect(closed.acc).toBeNull();
    expect(closed.accSel).toBeNull();
  });
});
