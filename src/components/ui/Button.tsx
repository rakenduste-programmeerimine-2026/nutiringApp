import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** "primary" = navy, "ghost" = white with navy border */
  variant?: "primary" | "ghost";
  /** Full width */
  block?: boolean;
  /** Smaller (52 px) version */
  small?: boolean;
};

/** Big, round Nutiküla button (64 px tall, 52 px when small). */
export function Button({
  variant = "primary",
  block = false,
  small = false,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = [
    styles.btn,
    variant === "ghost" && styles.ghost,
    block && styles.block,
    small && styles.small,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classes} {...rest} />;
}
