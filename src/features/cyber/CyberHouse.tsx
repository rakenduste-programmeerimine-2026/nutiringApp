import { ButtonLink } from "@/components/ui";
import { TiiaFaceShapes } from "./TiiaFace";
import styles from "./cyber.module.css";

export const TIIA_PATH = "/maja/kuber/tiia";
export const BROWSER_PATH = "/maja/kuber/brauser";

/** The house with two rooms: Tiia on the left, the Küberbrauser computer on the right. */
function RoomsPicture() {
  return (
    <svg viewBox="0 0 640 400" aria-hidden="true">
      {/* roof and walls */}
      <path d="M40 150 L320 20 L600 150z" fill="#8E7CF0" />
      <rect x="60" y="140" width="520" height="250" rx="16" fill="#DCD3FF" />
      {/* the two rooms */}
      <rect x="84" y="164" width="226" height="204" rx="14" fill="#fff" />
      <rect x="330" y="164" width="226" height="204" rx="14" fill="#fff" />
      <rect x="84" y="330" width="226" height="38" fill="#F6E7C8" />
      <rect x="330" y="330" width="226" height="38" fill="#E3F0FF" />
      {/* Tiia */}
      <g transform="translate(117 172) scale(.8)">
        <TiiaFaceShapes />
      </g>
      {/* computer with a browser window */}
      <g transform="translate(370 186)">
        <rect x="0" y="0" width="146" height="104" rx="10" fill="#03236A" />
        <rect x="8" y="22" width="130" height="74" rx="4" fill="#fff" />
        <circle cx="14" cy="11" r="4" fill="#FF8A65" />
        <circle cx="28" cy="11" r="4" fill="#FFD45C" />
        <circle cx="42" cy="11" r="4" fill="#7CC765" />
        <rect x="18" y="32" width="110" height="10" rx="5" fill="#EAF0FD" />
        <rect x="18" y="50" width="70" height="8" rx="4" fill="#C9D5F2" />
        <rect x="18" y="64" width="96" height="8" rx="4" fill="#C9D5F2" />
        <path d="M108 62 l14 8 -14 8z" fill="#C62828" />
        <rect x="56" y="104" width="34" height="22" fill="#03236A" />
        <rect x="36" y="124" width="74" height="8" rx="4" fill="#03236A" />
      </g>
      {/* padlock on the roof */}
      <rect x="290" y="62" width="60" height="50" rx="12" fill="#FFD45C" stroke="#fff" strokeWidth="5" />
      <path d="M302 64 v-12 a18 18 0 0 1 36 0 v12" fill="none" stroke="#fff" strokeWidth="8" />
    </svg>
  );
}

export function CyberHouse() {
  return (
    <main className={styles.house}>
      <h1>Küberturvalisuse maja</h1>
      <p>Siin majas on kaks tuba. Vali, kuhu lähed.</p>
      <div className={styles.rooms}>
        <RoomsPicture />
      </div>
      <div className={styles.roomButtons}>
        <ButtonLink href={TIIA_PATH}>Aita Tiiat</ButtonLink>
        <ButtonLink href={BROWSER_PATH}>Küberbrauser</ButtonLink>
      </div>
      <p className={styles.houseNote}>
        Tiia sai kahtlasi sõnumeid ja kõnesid. Küberbrauseris harjutad ohtlikke olukordi internetis.
      </p>
    </main>
  );
}
