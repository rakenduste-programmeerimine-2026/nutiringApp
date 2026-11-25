import { describe, expect, it } from "vitest";
import { cardPosition, type Box } from "@/features/lessons/placement";

const phone: Box = { left: 0, top: 0, right: 360, bottom: 700 };
const box = (top: number, bottom: number): Box => ({ left: 20, right: 200, top, bottom });

describe("card position on phones", () => {
  it("next to the target: below a target in the top half", () => {
    expect(cardPosition({ target: box(100, 160), phone, cardHeight: 120 })).toEqual({ top: 174 });
  });

  it("„far”: a target at the top → card pinned to the bottom edge", () => {
    expect(cardPosition({ target: box(100, 160), phone, cardHeight: 120, cardAt: "far" })).toEqual({ bottom: 8 });
  });

  it("„far”: a target at the bottom (e.g. ●) → card at the top", () => {
    expect(cardPosition({ target: box(640, 690), phone, cardHeight: 120, cardAt: "far" })).toEqual({ top: 36 });
  });

  it("the lesson's own top / bottom always wins", () => {
    expect(cardPosition({ target: box(100, 160), phone, cardHeight: 120, cardAt: "top" })).toEqual({ top: 36 });
    expect(cardPosition({ target: null, phone, cardHeight: 120, cardAt: "bottom" })).toEqual({ bottom: 8 });
  });
});
