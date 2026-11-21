import type { ReactNode, Ref } from "react";
import type { OS } from "@/content/types";
import "./phone.css";

type PhoneStageProps = {
  os: OS;
  /** The top bar of the page (e.g. <TopBar title="Avaekraan" />). */
  top?: ReactNode;
  /** What is on the phone screen. */
  screen: ReactNode;
  /** Layer above the screen: highlight ring, guide card, overlays (lesson engine). */
  layer?: ReactNode;
  /** Side panel next to the phone on computers ≥ 900 px (guide card + legend). */
  guide?: ReactNode;
  /** Refs for the lesson engine: measure the phone, read targets, draw on the layer. */
  phoneRef?: Ref<HTMLDivElement>;
  screenRef?: Ref<HTMLDivElement>;
  layerRef?: Ref<HTMLDivElement>;
};

/**
 * The lesson screen layout (prototype .lscreen / .stage / .phone).
 * Phone: the replica fills the whole screen under the top bar.
 * Computer (≥ 900 px): framed phone in the middle and the guide panel beside it.
 */
export function PhoneStage({ os, top, screen, layer, guide, phoneRef, screenRef, layerRef }: PhoneStageProps) {
  return (
    <div className="lscreen">
      {top}
      <div className="stage">
        <div className="phonewrap">
          <div className={`phone ${os}`} ref={phoneRef} data-testid="phone">
            <div className="phscreen" ref={screenRef}>
              {screen}
            </div>
            <div className="phlayer" ref={layerRef}>
              {layer}
            </div>
          </div>
        </div>
        <aside className="guide">{guide}</aside>
      </div>
    </div>
  );
}
