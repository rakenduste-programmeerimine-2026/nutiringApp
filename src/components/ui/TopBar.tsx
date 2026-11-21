import type { ReactNode } from "react";
import { BackButton } from "./BackButton";
import styles from "./TopBar.module.css";

type TopBarProps = {
  /** Page title (hidden on narrow phones to save space). */
  title: string;
  /** Extra buttons on the right, e.g. „Õppetunnid”. */
  children?: ReactNode;
};

/** Sticky bar at the top of every house page: back button + title. */
export function TopBar({ title, children }: TopBarProps) {
  return (
    <header className={styles.topbar}>
      <BackButton />
      <div className={styles.title}>{title}</div>
      {children}
    </header>
  );
}
