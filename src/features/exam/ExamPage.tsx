"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { logout } from "@/app/eksam/actions";
import { Button, TopBar } from "@/components/ui";
import { RequireOs } from "@/features/os";
import styles from "./exam.module.css";

type ExamPageProps = {
  /** Shown in the top bar, e.g. „Eksam · Logi sisse”. */
  title: string;
  /** Show the „Logi välja” button (pages for logged-in users). */
  showLogout?: boolean;
  children: ReactNode;
};

/** Frame of every exam page: system choice check, top bar and centred content. */
export function ExamPage({
  title,
  showLogout = false,
  children,
}: ExamPageProps) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/eksam");
    router.refresh();
  }

  return (
    <RequireOs>
      <TopBar title={title}>
        {showLogout && (
          <Button
            small
            variant="ghost"
            className={styles.logout}
            onClick={handleLogout}
          >
            Logi välja
          </Button>
        )}
      </TopBar>
      <main className={styles.exam}>{children}</main>
    </RequireOs>
  );
}
