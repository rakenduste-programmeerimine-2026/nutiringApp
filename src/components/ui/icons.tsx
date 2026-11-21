import type { SVGProps } from "react";

/* Simple line icons from the prototype (24×24, drawn with the current text colour). */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

type IconProps = SVGProps<SVGSVGElement>;

export function BackIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
      <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.1M4 12h.1M4 18h.1" />
    </svg>
  );
}
