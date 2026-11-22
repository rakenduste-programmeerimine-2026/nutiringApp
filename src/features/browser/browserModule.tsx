import type { HouseModule } from "@/features/lessons";
import { BrowserScreen } from "./BrowserScreen";
import {
  actBrowser,
  checkBrowser,
  enterBrowser,
  initialBrowser,
  setupBrowser,
  type BrowserState,
} from "./browserState";

/**
 * Küberbrauser for the lesson engine:
 * <LessonHouse house={browser} module={browserModule} os={os} /> (the room page comes in #27).
 */
export const browserModule: HouseModule<BrowserState> = {
  initial: (os) => initialBrowser(os),
  setup: (state, name) => setupBrowser(state, name),
  enter: (state, name) => enterBrowser(state, name),
  act: (state, action, data) => actBrowser(state, action, data),
  check: (state, check) => checkBrowser(state, check),
  render: (state, os) => <BrowserScreen s={state} os={os} />,
  keyboardOpen: (state) => state.kbOpen,
};
