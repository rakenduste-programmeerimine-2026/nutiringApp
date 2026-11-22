"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { ExamPage } from "./ExamPage";
import { TOPICS_PATH } from "./paths";
import {
  clearPendingAccount,
  readPendingAccount,
  type PendingAccount,
} from "./pending-account";
import { WarningIcon } from "./WarningIcon";
import styles from "./exam.module.css";

/** Shown once right after registering: username and PIN in large text. */
export function WriteDownScreen() {
  const router = useRouter();
  const [account, setAccount] = useState<PendingAccount | null>(null);

  useEffect(() => {
    const pending = readPendingAccount();
    // Nothing to show (page opened directly): go back to the account screens.
    if (!pending) router.replace("/eksam/registreeri");
    else setAccount(pending);
  }, [router]);

  function done() {
    clearPendingAccount();
    router.push(TOPICS_PATH);
  }

  return (
    <ExamPage title="Eksam · Kirjuta see üles">
      {account && (
        <>
          <h1>Kirjuta see üles</h1>
          <div className={styles.warnbox}>
            <WarningIcon />
            <div>
              <b>Seda PIN-i ei näe sa hiljem enam.</b> Kirjuta kasutajanimi ja
              PIN paberile. Unustatud PIN-i ei saa taastada.
            </div>
          </div>
          <dl className={styles.credentials}>
            <div>
              <dt>Kasutajanimi</dt>
              <dd data-testid="written-username">{account.username}</dd>
            </div>
            <div>
              <dt>PIN</dt>
              <dd data-testid="written-pin">{account.pin}</dd>
            </div>
          </dl>
          <Button block onClick={done}>
            Kirjutasin üles
          </Button>
        </>
      )}
    </ExamPage>
  );
}
