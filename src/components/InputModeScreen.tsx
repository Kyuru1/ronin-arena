import type { InputMode } from "../game/engine";
import type { Language } from "../game/i18n";
import { uiText } from "../game/uiText";
import { PxButton, PxFrame } from "./PixelUi";
import { useMenuNavigation } from "./useMenuNavigation";

export default function InputModeScreen({ onSelect, language }: { onSelect: (mode: InputMode) => void; language: Language }) {
  const u = (key: Parameters<typeof uiText>[1]) => uiText(language, key);
  useMenuNavigation();
  return <div className="px-backdrop absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6">
    <PxFrame title={u("inputTitle")} className="anim-pop w-full max-w-2xl p-4 sm:p-6">
      <p className="mb-4 text-center font-pixel text-[7px] leading-5 text-[#a9c8c5]">{u("inputLead")}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <PxButton tone="menu" onClick={() => onSelect("keyboard")} className="min-h-28 flex-col gap-3 p-3 text-center"><strong className="text-[9px]">{u("keyboard")}</strong><span className="text-[6px] leading-4 text-[#a9c3be]">{u("keyboardDesc")}</span></PxButton>
        <PxButton tone="menu" onClick={() => onSelect("keyboardMouse")} className="min-h-28 flex-col gap-3 p-3 text-center"><strong className="text-[9px]">{u("keyboardMouse")}</strong><span className="text-[6px] leading-4 text-[#a9c3be]">{u("keyboardMouseDesc")}</span></PxButton>
        <PxButton tone="menu" onClick={() => onSelect("gamepad")} className="min-h-28 flex-col gap-3 p-3 text-center"><strong className="text-[9px]">{u("gamepad")}</strong><span className="text-[6px] leading-4 text-[#a9c3be]">{u("gamepadDesc")}</span></PxButton>
      </div>
      <p className="mt-4 text-center font-pixel text-[6px] leading-4 text-[#91b9b5]">{u("inputHint")}</p>
    </PxFrame>
  </div>;
}
