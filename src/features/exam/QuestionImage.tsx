import type { ReactNode } from "react";
import type { QuestionImage as Image } from "@/content/exam";
import type { OS } from "@/content/types";
import {
  AppTile,
  BackspaceIcon,
  BatteryIcon,
  MicIcon,
  NavHomeIcon,
  PencilIcon,
  PlaneIcon,
  PlusIcon,
  SendIcon,
  SendIosIcon,
  ShiftIcon,
  WifiIcon,
} from "@/features/phone";
import styles from "./exam.module.css";

function icons(os: OS): Record<string, ReactNode> {
  return {
    battery: <BatteryIcon />,
    wifi: <WifiIcon />,
    plane: <PlaneIcon />,
    "home-button": <NavHomeIcon />,
    pencil: <PencilIcon />,
    send: os === "android" ? <SendIcon /> : <SendIosIcon />,
    mic: <MicIcon />,
    shift: <ShiftIcon />,
    backspace: <BackspaceIcon />,
    plus: <PlusIcon />,
  };
}

/** The picture above a question: an app icon, a phone symbol or a text message. */
export function QuestionImage({ image, os }: { image: Image; os: OS }) {
  if (image.kind === "app") {
    return (
      <div className={styles.qimg}>
        <AppTile os={os} app={image.app} className={styles.appBig} />
      </div>
    );
  }
  if (image.kind === "icon") {
    return (
      <div className={styles.qimg}>
        <div className={styles.iconBig}>{icons(os)[image.icon]}</div>
      </div>
    );
  }
  return (
    <div className={styles.qimg}>
      <div className={styles.sms}>
        <div className={styles.smsFrom}>{image.from}</div>
        <div className={styles.smsBubble}>{image.text}</div>
      </div>
    </div>
  );
}
