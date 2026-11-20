export type OS = "android" | "ios";
export type Text = string | { android: string; ios: string };

export type Step = {
  type: "do" | "info"; // "SINU KORD" / "LOE"
  warn?: boolean; // red "OHUMÄRK" card (info steps only, Küberbrauser)
  os?: OS; // step only for one system
  target?: Text; // CSS selector inside the phone replica
  show?: string; // extra area to keep visible
  text: Text; // instruction (Estonian)
  popup?: Text; // yellow notice, e.g. practice code
  hint?: Text; // shown after a wrong tap
  cardAt?: "top" | "bottom";
  until?: string | string[]; // event that completes a 'do' step
  check?: { kind: string; value?: string | number }; // state check instead of an event
  enter?: string; // named action when the step starts, e.g. 'botSay'
};

export type Lesson = {
  title: string;
  setup?: string;
  soon?: boolean;
  summary?: string[];
  steps: Step[];
};

export type House = { title: string; intro?: string; lessons: Lesson[] };
