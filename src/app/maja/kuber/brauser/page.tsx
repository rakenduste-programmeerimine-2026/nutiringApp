"use client";

import { browser } from "@/content/lessons/browser";
import { browserModule } from "@/features/browser";
import { LessonHouse } from "@/features/lessons";
import { RequireOs, useOs } from "@/features/os";

/*
 * The Küberbrauser room in the Cyber security house. The lesson engine brings the intro
 * („Sain aru, alustan”), the lesson list with lesson 3 „Tulekul”, the red OHUMÄRK cards,
 * the legend and the „Peamised punktid” pages; the content is in src/content/lessons/browser.ts.
 */
function BrowserRoom() {
  const { os } = useOs();
  return os ? <LessonHouse house={browser} module={browserModule} os={os} /> : null;
}

export default function BrowserRoomPage() {
  return (
    <RequireOs>
      <BrowserRoom />
    </RequireOs>
  );
}
