/* House drawings from the prototype (houseSvg), converted to JSX.
   Soft, round "Purble Place" style houses without faces. */

export type HouseKind = "home" | "msg" | "cyber" | "exam";

function Grass() {
  return (
    <>
      <ellipse cx="150" cy="228" rx="140" ry="20" fill="#A8DB8A" />
      <circle cx="58" cy="214" r="13" fill="#7CC765" />
      <circle cx="244" cy="214" r="13" fill="#7CC765" />
    </>
  );
}

/** Home screen house: yellow, with an app grid on the roof. */
function HomeHouse() {
  const colours = ["#5984E7", "#7CC765", "#FF8A65"];
  return (
    <>
      <rect x="66" y="96" width="168" height="124" rx="22" fill="#FFE08A" />
      <path d="M50 108 L150 30 L250 108 Q256 116 246 118 L54 118 Q44 116 50 108z" fill="#F5B82E" />
      <rect x="196" y="40" width="24" height="44" rx="6" fill="#F5B82E" />
      <rect x="190" y="34" width="36" height="12" rx="6" fill="#E9A51C" />
      <rect x="104" y="58" width="92" height="46" rx="10" fill="#fff" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={116 + c * 26}
            y={63 + r * 13}
            width="16"
            height="9"
            rx="3"
            fill={colours[(r + c) % 3]}
          />
        )),
      )}
      <path d="M128 220 v-46 a22 22 0 0 1 44 0 v46z" fill="#3055AB" />
      <circle cx="162" cy="198" r="3" fill="#FFD45C" />
      <rect x="84" y="140" width="32" height="30" rx="10" fill="#fff" />
      <rect x="184" y="140" width="32" height="30" rx="10" fill="#fff" />
      <path d="M100 140v30M84 155h32M200 140v30M184 155h32" stroke="#FFE08A" strokeWidth="3" />
    </>
  );
}

/** Messages house: mint, with a speech bubble and a mailbox. */
function MessagesHouse() {
  return (
    <>
      <rect x="74" y="100" width="152" height="120" rx="26" fill="#BDF0D3" />
      <path d="M58 116 Q150 20 242 116 Q246 124 236 124 L64 124 Q54 124 58 116z" fill="#3DBF86" />
      <path
        d="M118 22 h64 a16 16 0 0 1 16 16 v22 a16 16 0 0 1 -16 16 h-34 l-16 14 v-14 h-14 a16 16 0 0 1 -16 -16 v-22 a16 16 0 0 1 16 -16z"
        fill="#fff"
        stroke="#3DBF86"
        strokeWidth="5"
      />
      <circle cx="134" cy="49" r="5" fill="#3DBF86" />
      <circle cx="150" cy="49" r="5" fill="#3DBF86" />
      <circle cx="166" cy="49" r="5" fill="#3DBF86" />
      <path d="M78 132 h144" stroke="#fff" strokeWidth="8" strokeDasharray="18 10" strokeLinecap="round" />
      <path d="M128 220 v-44 a22 22 0 0 1 44 0 v44z" fill="#1F8F5F" />
      <circle cx="162" cy="199" r="3" fill="#FFD45C" />
      <circle cx="104" cy="168" r="16" fill="#fff" />
      <circle cx="196" cy="168" r="16" fill="#fff" />
      <rect x="200" y="186" width="30" height="22" rx="4" fill="#fff" stroke="#3DBF86" strokeWidth="3" />
      <path d="M200 188 l15 11 15-11" fill="none" stroke="#3DBF86" strokeWidth="3" />
      <rect x="212" y="208" width="6" height="14" fill="#3DBF86" />
    </>
  );
}

/** Cyber security house: lavender, with a padlock and a shield. */
function CyberHouse() {
  return (
    <>
      <rect x="70" y="92" width="160" height="128" rx="20" fill="#DCD3FF" />
      <path d="M52 104 L150 34 L248 104 Q254 112 244 114 L56 114 Q46 112 52 104z" fill="#8E7CF0" />
      <path d="M70 132 h160" stroke="#C3B6FF" strokeWidth="6" />
      <rect x="124" y="48" width="52" height="44" rx="10" fill="#FFD45C" stroke="#fff" strokeWidth="4" />
      <path d="M134 50 v-10 a16 16 0 0 1 32 0 v10" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
      <circle cx="150" cy="66" r="5" fill="#8E7CF0" />
      <rect x="148" y="68" width="4" height="12" rx="2" fill="#8E7CF0" />
      <path d="M128 220 v-46 a22 22 0 0 1 44 0 v46z" fill="#5B47C9" />
      <circle cx="162" cy="198" r="3" fill="#FFD45C" />
      <rect x="86" y="148" width="30" height="34" rx="15" fill="#fff" />
      <rect x="184" y="148" width="30" height="34" rx="15" fill="#fff" />
      <path
        d="M226 150 l12 -4 12 4 v12 c0 9-6 14-12 17 -6-3-12-8-12-17z"
        fill="#8E7CF0"
        stroke="#fff"
        strokeWidth="3"
      />
    </>
  );
}

/** Exam house: peach, with a graduation cap. */
function ExamHouse() {
  return (
    <>
      <rect x="72" y="104" width="156" height="116" rx="22" fill="#FFD3BF" />
      <path d="M62 106 Q150 62 238 106 L230 122 Q150 92 70 122z" fill="#FF8A65" />
      <path d="M150 28 L214 54 L150 80 L86 54z" fill="#03236A" />
      <path d="M116 66 v18 c20 12 48 12 68 0 v-18" fill="#03236A" />
      <path d="M206 58 v26" stroke="#FFD45C" strokeWidth="4" />
      <circle cx="206" cy="88" r="6" fill="#FFD45C" />
      <rect x="86" y="136" width="128" height="22" rx="11" fill="#fff" />
      <path d="M98 147 l5 5 9-9" stroke="#1E8E4E" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M120 147h40" stroke="#FF8A65" strokeWidth="5" strokeLinecap="round" />
      <path d="M128 220 v-42 a22 22 0 0 1 44 0 v42z" fill="#E86A43" />
      <circle cx="162" cy="200" r="3" fill="#FFD45C" />
      <rect x="88" y="172" width="28" height="28" rx="9" fill="#fff" />
      <rect x="184" y="172" width="28" height="28" rx="9" fill="#fff" />
    </>
  );
}

const HOUSES = { home: HomeHouse, msg: MessagesHouse, cyber: CyberHouse, exam: ExamHouse };

export function HouseSvg({ kind }: { kind: HouseKind }) {
  const House = HOUSES[kind];
  return (
    <svg viewBox="0 0 300 250" aria-hidden="true">
      <Grass />
      <House />
    </svg>
  );
}
