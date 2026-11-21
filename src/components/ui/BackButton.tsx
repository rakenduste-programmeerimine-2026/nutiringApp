import Link from "next/link";
import styles from "./BackButton.module.css";
import { BackIcon } from "./icons";

type BackButtonProps = {
  /** Where the button leads. Default: the village. */
  href?: string;
  /** Full label (desktop). */
  label?: string;
  /** Short label (phone). */
  shortLabel?: string;
};

/** „‹ Tagasi külasse” – on phones shortened to „‹ Küla”. */
export function BackButton({
  href = "/kula",
  label = "Tagasi külasse",
  shortLabel = "Küla",
}: BackButtonProps) {
  return (
    <Link href={href} className={styles.backbtn} aria-label={label}>
      <BackIcon />
      <span className={styles.long}>{label}</span>
      <span className={styles.short}>{shortLabel}</span>
    </Link>
  );
}
