import { RACE_CONFIG, raceRarityLabel, type RaceId } from "../game/races";
import { PxButton } from "./PixelUi";

export default function RaceReveal({
  raceId,
  binding,
  onContinue,
  onHideForever,
}: {
  raceId: RaceId;
  binding: string;
  onContinue: () => void;
  onHideForever: () => void;
}) {
  const race = RACE_CONFIG[raceId];
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#070305]/80 p-4">
      <div className="anim-pop w-full max-w-xl border-4 border-[#070305] bg-[#160b12]/95 p-5 text-center shadow-[0_8px_0_#070305] sm:p-7" style={{ outline: `2px solid ${race.color}` }}>
        <div className="font-pixel text-[8px] tracking-widest text-[#b78c91] sm:text-[10px]">RAÇA OBTIDA</div>
        <div className="my-3 font-pixel text-[16px] leading-7 sm:text-[20px]" style={{ color: race.color }}>{race.icon} {race.name}</div>
        <div className="font-pixel text-[9px]" style={{ color: race.color }}>{raceRarityLabel(race.rarity)}</div>
        <p className="mx-auto mt-4 max-w-lg font-pixel text-[8px] leading-6 text-[#d8c2b8] sm:text-[9px]">{race.passive}</p>
        <div className="mt-4 border-2 border-[#3b1821] bg-[#0c0407] p-3 font-pixel text-[8px] leading-5 text-[#ffe2c4]">
          <strong style={{ color: race.color }}>{race.ability.name}</strong>
          <span className="mt-2 block text-[#a9c3be]">{race.ability.description}</span>
        </div>
        <div className="mt-4 font-pixel text-[9px] text-[#ffd44a]">[{binding}] HABILIDADE ESPECIAL</div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <PxButton tone="green" onClick={onContinue} className="min-h-12 justify-center text-[8px] sm:text-[9px]">CONTINUAR</PxButton>
          <PxButton tone="dark" onClick={onHideForever} className="min-h-12 justify-center text-[7px] sm:text-[8px]">NÃO MOSTRAR NOVAMENTE</PxButton>
        </div>
      </div>
    </div>
  );
}
