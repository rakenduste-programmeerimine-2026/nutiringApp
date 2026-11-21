"use client";

import { useEffect, useState } from "react";

/** True on computers (≥ 900 px): the guide card is shown beside the phone. */
export function useWide(query = "(min-width: 900px)"): boolean {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return wide;
}
