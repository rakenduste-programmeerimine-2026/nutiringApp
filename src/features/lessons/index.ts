/* Lesson engine – owned by aruorg. Houses (Home screen, Messages, Küberbrauser)
   implement HouseModule and render <LessonHouse house={…} module={…} os={os} />. */
export { LessonHouse } from "./LessonHouse";
export { RichText } from "./RichText";
export { useLessonRunner, DELAY, type RunState, type RunMode } from "./useLessonRunner";
export { resolveText } from "./steps";
export type { HouseModule, Effect, ActData, ActResult } from "./types";
