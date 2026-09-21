import type { InputMode } from "../game/engine";
import { PxButton, PxFrame } from "./PixelUi";
import { useMenuNavigation } from "./useMenuNavigation";

export default function InputModeScreen({ onSelect }: { onSelect: (mode: InputMode) => void }) {
  useMenuNavigation();
  return <div className="px-backdrop absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6">
    <PxFrame title="COMO VOCE VAI JOGAR?" className="anim-pop w-full max-w-2xl p-4 sm:p-6">
      <p className="mb-4 text-center font-pixel text-[7px] leading-5 text-[#a9c8c5]">Escolha o layout de controle desta partida.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <PxButton tone="menu" onClick={() => onSelect("keyboard")} className="min-h-28 flex-col gap-3 p-3 text-center"><strong className="text-[9px]">TECLADO</strong><span className="text-[6px] leading-4 text-[#a9c3be]">Mover, atacar e usar dash pelo teclado.</span></PxButton>
        <PxButton tone="menu" onClick={() => onSelect("keyboardMouse")} className="min-h-28 flex-col gap-3 p-3 text-center"><strong className="text-[9px]">TECLADO + MOUSE</strong><span className="text-[6px] leading-4 text-[#a9c3be]">Teclado para mover e mouse para mirar e atacar.</span></PxButton>
        <PxButton tone="menu" onClick={() => onSelect("gamepad")} className="min-h-28 flex-col gap-3 p-3 text-center"><strong className="text-[9px]">CONTROLE</strong><span className="text-[6px] leading-4 text-[#a9c3be]">Xbox e PlayStation: analógicos, A/✕, RB/R1 e RT/R2.</span></PxButton>
      </div>
      <p className="mt-4 text-center font-pixel text-[6px] leading-4 text-[#91b9b5]">Use as setas e ENTER, ou o direcional e A, para escolher.</p>
    </PxFrame>
  </div>;
}
