import type { ReactNode, SVGProps } from "react";

/* Icons used inside the phone replica (prototype objects I, SB, SBX).
   All are drawn with the current text colour. */

type IconProps = SVGProps<SVGSVGElement>;

const LINE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Make an icon component. `line` = drawn with strokes, otherwise as given. */
function icon(name: string, children: ReactNode, opts: { viewBox?: string; line?: boolean } = {}) {
  const Icon = (props: IconProps) => (
    <svg
      viewBox={opts.viewBox ?? "0 0 24 24"}
      aria-hidden="true"
      {...(opts.line ? LINE : {})}
      {...props}
    >
      {children}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
}

/* ---------- status bar (prototype SB) ---------- */
export const SignalIcon = icon(
  "SignalIcon",
  <path d="M2 20h3v-4H2zM7 20h3v-7H7zM12 20h3V9h-3zM17 20h3V4h-3z" fill="currentColor" />,
  { viewBox: "0 0 22 22" },
);
export const WifiIcon = icon(
  "WifiIcon",
  <path
    d="M11 19.5l3-3.7a4.7 4.7 0 0 0-6 0zM4.5 11.6a10 10 0 0 1 13 0l1.9-2.4a13 13 0 0 0-16.8 0zM6.6 14.3a6.7 6.7 0 0 1 8.8 0l1.9-2.3a9.6 9.6 0 0 0-12.6 0z"
    fill="currentColor"
  />,
  { viewBox: "0 0 22 22" },
);
export const BatteryIcon = icon(
  "BatteryIcon",
  <>
    <rect x="1" y="5" width="20" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <rect x="3" y="7" width="13.5" height="8" rx="1.5" fill="currentColor" />
    <rect x="22" y="9" width="2" height="4" rx="1" fill="currentColor" />
  </>,
  { viewBox: "0 0 25 22" },
);
export const PlaneIcon = icon(
  "PlaneIcon",
  <path
    d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
    fill="currentColor"
  />,
);

/* ---------- extra status icons (prototype SBX) ---------- */
export const MsgNotifIcon = icon("MsgNotifIcon", <path d="M3 5h18v11H8l-5 4z" fill="currentColor" />);
export const WeatherNotifIcon = icon(
  "WeatherNotifIcon",
  <path d="M7 19h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 19z" fill="currentColor" />,
);
export const MissedCallIcon = icon(
  "MissedCallIcon",
  <>
    <path
      d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"
      fill="currentColor"
    />
    <path d="M15 3l6 6M21 3l-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </>,
);
export const VibrateIcon = icon(
  "VibrateIcon",
  <>
    <rect x="8" y="3" width="8" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M4 8v8M20 8v8M1.5 10v4M22.5 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </>,
);
export const SilentIcon = icon(
  "SilentIcon",
  <>
    <path
      d="M6 16V11a6 6 0 0 1 9-5.2M18 11v5l2 2H8M10 20.5a2 2 0 0 0 4 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </>,
);
export const DndIcon = icon(
  "DndIcon",
  <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="currentColor" />,
);

/* ---------- navigation ---------- */
export const NavBackIcon = icon(
  "NavBackIcon",
  <path d="M16 4L6 12l10 8z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />,
);
export const NavHomeIcon = icon(
  "NavHomeIcon",
  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.2" />,
);
export const NavRecentIcon = icon(
  "NavRecentIcon",
  <rect x="5" y="5" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2.2" />,
);

/* ---------- general icons (prototype I) ---------- */
export const BackIcon = icon("BackIcon", <path d="M15 5l-7 7 7 7" />, { line: true });
export const UpIcon = icon("UpIcon", <path d="M6 15l6-6 6 6" />, { line: true });
export const SearchIcon = icon(
  "SearchIcon",
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </>,
  { line: true },
);
export const CheckIcon = icon("CheckIcon", <path d="M5 12.5l4.5 4.5L19 7.5" />, { line: true });
export const XIcon = icon("XIcon", <path d="M6 6l12 12M18 6L6 18" />, { line: true });
export const InfoIcon = icon(
  "InfoIcon",
  <>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 11v6M12 7.5v.1" />
  </>,
  { line: true },
);
export const WarnIcon = icon(
  "WarnIcon",
  <>
    <path d="M12 3l10 18H2z" />
    <path d="M12 10v5M12 18v.1" />
  </>,
  { line: true },
);
export const HandIcon = icon(
  "HandIcon",
  <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V12m0-.5a1.5 1.5 0 0 1 3 0V16c0 3.3-2.7 6-6 6h-1.5c-2 0-3.4-.8-4.6-2.3L4.5 16a1.6 1.6 0 0 1 2.4-2.1L8 15" />,
  { line: true },
);
export const KeyIcon = icon(
  "KeyIcon",
  <>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l9-9M17 6l3 3M14 9l2 2" />
  </>,
  { line: true },
);
export const LockIcon = icon(
  "LockIcon",
  <>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </>,
  { line: true },
);
export const BellIcon = icon(
  "BellIcon",
  <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0" />,
  { line: true },
);
export const PlusIcon = icon("PlusIcon", <path d="M12 5v14M5 12h14" />, { line: true });
export const SmileIcon = icon(
  "SmileIcon",
  <>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M8 14.5c1 1.5 2.4 2.2 4 2.2s3-.7 4-2.2M9 9.5v.1M15 9.5v.1" />
  </>,
  { line: true },
);
export const MicIcon = icon(
  "MicIcon",
  <>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  </>,
  { line: true },
);
export const TrashIcon = icon(
  "TrashIcon",
  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  { line: true },
);
export const CopyIcon = icon(
  "CopyIcon",
  <>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
  </>,
  { line: true },
);
export const BlockIcon = icon(
  "BlockIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.6 5.6l12.8 12.8" />
  </>,
  { line: true },
);
export const PencilIcon = icon("PencilIcon", <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />, {
  line: true,
});
export const ChatIcon = icon("ChatIcon", <path d="M4 5h16v11H9l-5 4z" />, { line: true });
export const ImageIcon = icon(
  "ImageIcon",
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M21 16l-5-5-9 9" />
  </>,
  { line: true },
);
export const PinIcon = icon(
  "PinIcon",
  <>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </>,
  { line: true },
);
export const WaveIcon = icon("WaveIcon", <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />, {
  line: true,
});
export const GlobeIcon = icon(
  "GlobeIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
  </>,
  { line: true },
);
export const PlayIcon = icon("PlayIcon", <path d="M7 4.5v15l13-7.5z" fill="currentColor" />);
export const PauseIcon = icon("PauseIcon", <path d="M7 4h4v16H7zM13 4h4v16h-4z" fill="currentColor" />);
export const StopIcon = icon(
  "StopIcon",
  <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />,
);
export const SendIcon = icon(
  "SendIcon",
  <path
    d="M3 20.5l18-8.5L3 3.5l2.5 8.5zM5.5 12H12"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  />,
);
export const SendIosIcon = icon(
  "SendIosIcon",
  <path
    d="M12 19V6M6 11.5L12 5.5l6 6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
);
export const DotsIcon = icon(
  "DotsIcon",
  <>
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </>,
);
export const Dots9Icon = icon(
  "Dots9Icon",
  <>
    {[5, 12, 19].flatMap((y) =>
      [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="currentColor" />),
    )}
  </>,
);
export const PersonIcon = icon(
  "PersonIcon",
  <>
    <circle cx="12" cy="8" r="4.2" fill="currentColor" />
    <path d="M3.5 21c.8-4.4 4.2-7 8.5-7s7.7 2.6 8.5 7z" fill="currentColor" />
  </>,
);
export const PhoneCallIcon = icon(
  "PhoneCallIcon",
  <path
    d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"
    fill="currentColor"
  />,
);
export const ShiftIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      d="M12 4l8 8h-4.5v7h-7v-7H4z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
export const BackspaceIcon = icon("BackspaceIcon", <path d="M9 5h11v14H9l-6-7zM12 9l6 6M18 9l-6 6" />, {
  line: true,
});
