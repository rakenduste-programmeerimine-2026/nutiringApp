/* Tiia's portrait (prototype `face()`), drawn in a 200 × 200 box. */

export type Mood = "neutral" | "happy" | "worried";

const SKIN = "#F6D2B8";
const HAIR = "#D9D9DF";
const TOP = "#E57A9B";
const BROW = "#6b5a4e";
const MOUTH = "#B23B4E";
const GLASSES = "#7a5c8a";

const BACKGROUND: Record<Mood, string> = {
  neutral: "#EAF0FD",
  happy: "#E5F6EC",
  worried: "#FDECEC",
};

function Brows({ mood }: { mood: Mood }) {
  const common = { stroke: BROW, strokeWidth: 5, strokeLinecap: "round" as const };
  if (mood === "worried") return <path d="M70 82 l18 6M130 82 l-18 6" {...common} />;
  if (mood === "happy") return <path d="M70 80 q10 -8 20 0M110 80 q10 -8 20 0" fill="none" {...common} />;
  return <path d="M70 84 h20M110 84 h20" {...common} />;
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === "happy") {
    return (
      <path
        d="M73 100 q7 -8 14 0M113 100 q7 -8 14 0"
        stroke="#2b2b2b"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  return (
    <>
      <circle cx="80" cy="99" r="6" fill="#2b2b2b" />
      <circle cx="120" cy="99" r="6" fill="#2b2b2b" />
    </>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  if (mood === "happy") return <path d="M82 128 q18 20 36 0z" fill={MOUTH} />;
  if (mood === "worried") {
    return (
      <>
        <path d="M84 138 q16 -14 32 0" stroke={MOUTH} strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* a drop of sweat */}
        <path d="M146 70 q6 10 0 14 q-6 -4 0 -14z" fill="#7FB8FF" />
      </>
    );
  }
  return <path d="M86 132 h28" stroke={MOUTH} strokeWidth={5} strokeLinecap="round" />;
}

/** The shapes of the face, without the outer <svg> (also used inside the house picture). */
export function TiiaFaceShapes({ mood = "neutral" }: { mood?: Mood }) {
  return (
    <>
      <circle cx="100" cy="100" r="98" fill={BACKGROUND[mood]} />
      <path d="M30 200 q8 -46 70 -50 q62 4 70 50z" fill={TOP} />
      <rect x="88" y="140" width="24" height="16" fill={SKIN} />
      <circle cx="100" cy="42" r="20" fill={HAIR} />
      <path d="M48 104 q-6 -62 52 -66 q58 4 52 66 q-8 -34 -52 -40 q-44 6 -52 40z" fill={HAIR} />
      <ellipse cx="100" cy="102" rx="46" ry="52" fill={SKIN} />
      <path d="M56 92 q4 -44 44 -46 q40 2 44 46 q-14 -26 -44 -26 q-30 0 -44 26z" fill={HAIR} />
      <ellipse cx="54" cy="106" rx="7" ry="10" fill={SKIN} />
      <ellipse cx="146" cy="106" rx="7" ry="10" fill={SKIN} />
      <Brows mood={mood} />
      <Eyes mood={mood} />
      <path d="M100 104 q-5 12 2 14" stroke="#d9a688" strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* glasses */}
      <circle cx="80" cy="99" r="15" fill="none" stroke={GLASSES} strokeWidth={3.5} />
      <circle cx="120" cy="99" r="15" fill="none" stroke={GLASSES} strokeWidth={3.5} />
      <path d="M95 99 h10" stroke={GLASSES} strokeWidth={3.5} />
      <Mouth mood={mood} />
    </>
  );
}

const MOOD_LABEL: Record<Mood, string> = {
  neutral: "Tiia",
  happy: "Tiia on rõõmus",
  worried: "Tiia on mures",
};

export function TiiaFace({ mood = "neutral" }: { mood?: Mood }) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={MOOD_LABEL[mood]} data-mood={mood}>
      <TiiaFaceShapes mood={mood} />
    </svg>
  );
}
