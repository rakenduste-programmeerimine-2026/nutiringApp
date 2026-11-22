"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { login } from "@/app/eksam/actions";
import { Button, ButtonLink } from "@/components/ui";
import { validatePin, validateUsername } from "@/lib/auth/validation";
import { ExamPage } from "./ExamPage";
import { TOPICS_PATH } from "./paths";
import styles from "./exam.module.css";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const name = username.trim();
    const invalid = validateUsername(name) ?? validatePin(pin);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setBusy(true);
    const result = await login(name, pin);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    router.push(TOPICS_PATH);
    router.refresh();
  }

  return (
    <ExamPage title="Eksam · Logi sisse">
      <h1>Logi sisse</h1>
      <p className={styles.lead}>Sisesta oma kasutajanimi ja PIN.</p>
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
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="pin">PIN</label>
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
        <Button block type="submit" disabled={busy}>
          Logi sisse
        </Button>
      </form>
      <div className={styles.stack} style={{ marginTop: 12 }}>
        <ButtonLink block variant="ghost" href="/eksam/registreeri">
          Mul ei ole kontot – loo konto
        </ButtonLink>
      </div>
    </ExamPage>
  );
}
