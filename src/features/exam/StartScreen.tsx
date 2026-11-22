import { ButtonLink } from "@/components/ui";
import { ExamPage } from "./ExamPage";
import styles from "./exam.module.css";

export function StartScreen() {
  return (
    <ExamPage title="Eksam">
      <h1>Eksam</h1>
      <p className={styles.lead}>
        Tulemuste nägemiseks on vaja kontot. Kui sul veel kontot ei ole, loo
        see.
      </p>
      <div className={styles.stack}>
        <ButtonLink block href="/eksam/registreeri">
          Loo konto
        </ButtonLink>
        <ButtonLink block variant="ghost" href="/eksam/logi-sisse">
          Logi sisse
        </ButtonLink>
      </div>
    </ExamPage>
  );
}
