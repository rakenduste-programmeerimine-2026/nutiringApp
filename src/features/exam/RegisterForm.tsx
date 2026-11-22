"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { register } from "@/app/eksam/actions";
import { Button, ButtonLink } from "@/components/ui";
import { validateRegistration } from "@/lib/auth/validation";
import { ExamPage } from "./ExamPage";
import { savePendingAccount } from "./pending-account";
import { WarningIcon } from "./WarningIcon";
import styles from "./exam.module.css";

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [pinRepeat, setPinRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const name = username.trim();
    const invalid = validateRegistration(name, pin, pinRepeat);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setBusy(true);
    const result = await register(name, pin, pinRepeat);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    savePendingAccount({ username: name, pin });
    router.push("/eksam/ule-kirjuta");
  }

  return (
    <ExamPage title="Eksam · Loo konto">
      <h1>Loo konto</h1>
      <p className={styles.lead}>
        Mõtle välja kasutajanimi ja PIN. E-posti ega telefoninumbrit ei küsita.
      </p>

      <div className={styles.warnbox}>
        <WarningIcon />
        <div>
          <b>Kirjuta kasutajanimi ja PIN kindlasti üles!</b>
          <br />
          Unustatud PIN-i ei saa taastada, siis tuleb teha uus konto.
          <br />
          Kui sa kontot <b>3 kuud</b> ei kasuta, kustutatakse see koos
          tulemustega automaatselt.
        </div>
      </div>

      <form onSubmit={submit} noValidate>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.field}>
          <label htmlFor="username">Kasutajanimi</label>
          <input
            id="username"
            autoComplete="off"
            autoCapitalize="none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-describedby="username-hint"
          />
          <span id="username-hint" className={styles.hint}>
            Ära kasuta oma päris nime. Mõtle välja hüüdnimi.
          </span>
        </div>
        <div className={styles.field}>
          <label htmlFor="pin">PIN (6–20 numbrit)</label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={20}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="pin-repeat">Korda PIN-i</label>
          <input
            id="pin-repeat"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={20}
            value={pinRepeat}
            onChange={(e) => setPinRepeat(e.target.value)}
          />
        </div>
        <Button block type="submit" disabled={busy}>
          Loo konto
        </Button>
      </form>
      <div className={styles.stack} style={{ marginTop: 12 }}>
        <ButtonLink block variant="ghost" href="/eksam/logi-sisse">
          Mul on juba konto – logi sisse
        </ButtonLink>
      </div>
    </ExamPage>
  );
}
