import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./Button.module.css";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "ghost";
  block?: boolean;
  small?: boolean;
};

/** A link to another page that looks like a Button (e.g. „Tagasi külasse”). */
export function ButtonLink({ variant = "primary", block = false, small = false, className, ...rest }: ButtonLinkProps) {
  const classes = [styles.btn, variant === "ghost" && styles.ghost, block && styles.block, small && styles.small, className]
    .filter(Boolean)
    .join(" ");
  return <Link className={classes} {...rest} />;
}
