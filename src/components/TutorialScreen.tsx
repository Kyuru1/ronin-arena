import { useState } from "react";
import { GAMEPLAY_TEXT } from "../game/gameplayText";
import type { Language } from "../game/i18n";
import PixelSprite from "./PixelSprite";
import { PxButton, PxFrame } from "./PixelUi";

export default function TutorialScreen({ language, isTouch, onBegin }: { language: Language; isTouch: boolean; onBegin: (neverAgain: boolean) => void }) {
  const [neverAgain, setNeverAgain] = useState(false);
  const g = GAMEPLAY_TEXT[language];
  const controls = [
    { icon: "player", title: g.move, detail: isTouch ? g.touchMove : g.moveHelp },
    { icon: "icoCrosshair", title: g.aim, detail: isTouch ? g.touchAim : g.aimHelp },
    { icon: "icoKatana", title: g.attack, detail: isTouch ? g.touchAttack : g.attackHelp },
    { icon: "icoDash", title: g.dash, detail: isTouch ? g.touchDash : g.dashHelp },
    { icon: "icoBook", title: g.swap, detail: isTouch ? g.touchSwap : g.swapHelp },
    { icon: "coin", title: g.shop, detail: g.shopHelp },
  ];

  return (
    <div className="px-backdrop absolute inset-0 z-40 flex items-center justify-center overflow-y-auto p-3 sm:p-6">
      <PxFrame className="anim-pop my-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="text-center">
          <div className="font-pixel text-[13px] text-[#ffe2c4] sm:text-[18px]">{g.tutorialTitle}</div>
          <p className="font-pixel mt-2 text-[7px] leading-5 text-[#a9c8c5]">{g.tutorialLead}</p>
        </div>
        <div className="my-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {controls.map((control) => (
            <div key={control.title} className="tutorial-control">
              <div className="px-tile !h-12 !w-12 shrink-0"><PixelSprite name={control.icon} scale={2} /></div>
              <div className="min-w-0"><strong>{control.title}</strong><span>{control.detail}</span></div>
            </div>
          ))}
        </div>
        <div className="font-pixel mb-4 border-l-4 border-[#ffd44a] bg-[#10252a] p-3 text-[7px] leading-5 text-[#b9e5df]">
          {g.shopSoon}: {g.shopHelp}
        </div>
        <label className="font-pixel mb-4 flex cursor-pointer items-center justify-center gap-3 text-[7px] text-[#c4a1a7]">
          <input type="checkbox" checked={neverAgain} onChange={(event) => setNeverAgain(event.target.checked)} className="h-5 w-5 accent-[#e0444d]" />
          {g.dontShow}
        </label>
        <PxButton tone="red" onClick={() => onBegin(neverAgain)} className="w-full py-4 text-[10px] sm:text-[12px]">▶ {g.begin}</PxButton>
      </PxFrame>
    </div>
  );
}
