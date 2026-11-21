import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import { Keyboard, highlightAccent, initialKeyboard, openAccents } from "@/features/phone";

/* The lessons find keys by these exact selectors (src/content/lessons/messages.ts),
   so the tests check the attributes, not only the look. */
const draw = (state = initialKeyboard()) => render(<Keyboard state={state} />).container;

it("has the keys the Messages lessons point at", () => {
  const kb = draw();
  for (const sel of [".kb", "[data-k=shift]", "[data-k=space]", "[data-k=bksp]", "[data-k=mode123]", "[data-base=o]"]) {
    expect(kb.querySelector(sel), sel).not.toBeNull();
  }
});

it("uses the English QWERTY layout without separate õ ä ö ü keys", () => {
  const kb = draw();
  const firstRow = [...kb.querySelectorAll(".krow")[0].querySelectorAll("[data-k]")].map((k) => k.textContent);
  expect(firstRow).toEqual(["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"]);
  expect(kb.querySelector('[data-k="ch:õ"]')).toBeNull();
});

it("marks letters that have accents for long press", () => {
  const kb = draw();
  for (const l of ["o", "a", "u", "s", "z", "e"]) {
    const key = kb.querySelector(`[data-base=${l}]`);
    expect(key, l).toHaveAttribute("data-long", "keyLong");
  }
  expect(kb.querySelector('[data-k="ch:k"]')).not.toHaveAttribute("data-long");
});

it("shows the accent popup with õ ö ó after holding o", () => {
  const kb = draw(openAccents(initialKeyboard(), "o"));
  const letters = [...kb.querySelectorAll(".accpop [data-k]")].map((k) => k.textContent);
  expect(letters).toEqual(["õ", "ö", "ó"]);
  expect(kb.querySelector('.accpop [data-k="ch:õ"]')).not.toBeNull();
});

it("puts the accent popup right above the held key", () => {
  const kb = draw(openAccents(initialKeyboard(), "s"));
  const sKey = kb.querySelector("[data-base=s]")!;
  const popup = kb.querySelector(".accpop")!;
  // popup and the s key share the same slot
  expect(popup.parentElement).toBe(sKey.parentElement);
  expect(popup.textContent).toBe("š");
  expect(kb.querySelectorAll(".accpop")).toHaveLength(1);
});

it("draws the letter under the finger highlighted", () => {
  const kb = draw(highlightAccent(openAccents(initialKeyboard(), "o"), "ö"));
  expect(kb.querySelector('.accpop [data-k="ch:ö"]')).toHaveClass("sel");
  expect(kb.querySelector('.accpop [data-k="ch:õ"]')).not.toHaveClass("sel");
});

it("aligns the popup inside the phone for keys at the edges", () => {
  expect(draw(openAccents(initialKeyboard(), "a")).querySelector(".accpop")).toHaveClass("at-left");
  expect(draw(openAccents(initialKeyboard(), "o")).querySelector(".accpop")).toHaveClass("at-right");
  expect(draw(openAccents(initialKeyboard(), "u")).querySelector(".accpop")).not.toHaveClass("at-left");
});

it("shows upper case letters while Shift is on", () => {
  const kb = draw({ ...initialKeyboard(), shift: true });
  expect(kb.querySelector('[data-k="ch:T"]')).not.toBeNull();
  expect(kb.querySelector("[data-k=shift]")).toHaveAttribute("aria-pressed", "true");
});

it("123 mode shows numbers and the ! key, and an ABC key back", () => {
  const kb = draw({ ...initialKeyboard(), mode: "123" });
  expect(kb.querySelector('[data-k="ch:1"]')).not.toBeNull();
  expect(kb.querySelector('[data-k="ch:!"]')).not.toBeNull();
  expect(kb.querySelector("[data-k=abc]")).not.toBeNull();
  expect(kb.querySelector("[data-k=shift]")).toBeNull();
});

it("emoji key only when requested (iPhone Messages), otherwise a comma", () => {
  expect(draw().querySelector("[data-k=emoji]")).toBeNull();
  expect(draw(initialKeyboard(true)).querySelector("[data-k=emoji]")).not.toBeNull();
});

it("emoji mode shows emojis to pick", () => {
  const kb = draw({ ...initialKeyboard(), mode: "emoji" });
  expect(kb.querySelectorAll(".emojigrid [data-act=emojiPick]").length).toBeGreaterThan(10);
});
