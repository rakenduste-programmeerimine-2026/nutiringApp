/* Where the highlight frame and the guide card go (prototype place()).
   Pure functions: they only calculate, the component applies the result. */

export type Box = { left: number; top: number; right: number; bottom: number };

/** Where the guide card goes on phones; undefined = next to the target. */
export type CardAt = "top" | "bottom" | "far";

/** One box around all target elements (screen coordinates), or null. */
export function unionBox(rects: Box[]): Box | null {
  const real = rects.filter((r) => r.right - r.left > 0 || r.bottom - r.top > 0);
  if (!real.length) return null;
  return real.reduce((a, b) => ({
    left: Math.min(a.left, b.left),
    top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  }));
}

/**
 * Highlight frame inside the phone (phone-relative pixels), 4 px bigger than
 * the target on each side and kept inside the phone.
 * `phone` is the inner screen area (already without the phone's black edge).
 */
export function highlightFrame(target: Box, phone: Box) {
  const pad = 4;
  const W = phone.right - phone.left;
  const H = phone.bottom - phone.top;
  const left = Math.max(2, target.left - phone.left - pad);
  const top = Math.max(2, target.top - phone.top - pad);
  return {
    left,
    top,
    width: Math.min(W - left - 2, target.right - target.left + pad * 2),
    height: Math.min(H - top - 2, target.bottom - target.top + pad * 2),
  };
}

/**
 * Card position on phones: below the highlight if it is in the top half
 * and there is room, otherwise above it. `cardAt` forces top / bottom.
 * Returns CSS `top` or `bottom` in px (phone-relative).
 */
export function cardPosition(opts: {
  target: Box | null;
  phone: Box;
  cardHeight: number;
  /** "far" = at the opposite edge of the phone from the target (never over other buttons) */
  cardAt?: CardAt;
}): { top?: number; bottom?: number } {
  const { target, phone, cardHeight: ch, cardAt } = opts;
  const H = phone.bottom - phone.top;
  if (cardAt === "top") return { top: 36 };
  if (cardAt === "bottom") return { bottom: 8 };
  if (!target) return { top: Math.max(10, (H - ch) / 2) };

  const top = target.top - phone.top;
  const bot = target.bottom - phone.top;
  if (cardAt === "far") return (top + bot) / 2 > H / 2 ? { top: 36 } : { bottom: 8 };
  const inLowerHalf = (top + bot) / 2 > H / 2;
  const noRoomBelow = bot + 14 + ch > H;
  if (inLowerHalf || noRoomBelow) {
    const bottom = Math.min(H - ch - 4, Math.max(4, H - top + 14));
    // not enough room above either → pin to the top
    return H - bottom - ch < 0 ? { top: 4 } : { bottom };
  }
  return { top: Math.max(4, bot + 14) };
}
