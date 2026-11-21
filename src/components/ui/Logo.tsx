import styles from "./Logo.module.css";

/** Nutiring logo. Size follows the font-size you give it (className or parent). */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={[styles.logo, className].filter(Boolean).join(" ")}
      role="img"
      aria-label="Nutiring"
    >
      Nuti
      <span className={styles.ring} aria-hidden="true">
        <span>ring</span>
      </span>
    </span>
  );
}
