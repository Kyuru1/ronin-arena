import { useState } from "react";
import type { PlayerProfile } from "../game/auth";
import { PxFrame, PxButton } from "./PixelUi";
import PixelSprite from "./PixelSprite";

interface CoopLobbyModalProps {
  profile: PlayerProfile;
  onClose: () => void;
}

export default function CoopLobbyModal({ profile, onClose }: CoopLobbyModalProps) {
  const [inviteCode, setInviteCode] = useState("");

  return (
    <div className="px-backdrop absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <PxFrame title="MODO COOPERATIVO" className="anim-pop w-full max-w-lg p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="px-inset flex items-center justify-between p-3 bg-[#190913]">
            <div className="flex items-center gap-2">
              <PixelSprite name={profile.avatarId === "samurai" ? "player" : profile.avatarId} scale={1} />
              <div className="font-pixel text-[8px] text-[#ffe2c4]">
                RONIN: <span className="text-[#ffd44a]">{profile.username}</span>
              </div>
            </div>
            <span className="font-pixel text-[6px] text-[#ffd44a]">EM DESENVOLVIMENTO</span>
          </div>

          <div className="px-inset p-4 text-center">
            <div className="font-pixel text-[11px] text-[#ffd44a] mb-3">COOPERATIVO ONLINE EM BREVE</div>
            <p className="font-pixel text-[7px] leading-5 text-[#ffe2c4]">
              O modo cooperativo está desativado por enquanto. A versão online será feita com convite ou código de sala,
              sem exigir IP, porta ou túnel.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <PxButton tone="dark" disabled className="py-3 text-[8px]">HOSPEDAR SALA</PxButton>
            <PxButton tone="dark" disabled className="py-3 text-[8px]">ENTRAR COM CÓDIGO</PxButton>
          </div>

          <label className="font-pixel text-[7px] text-[#91b9b5]">
            CÓDIGO DE CONVITE (FUTURO)
            <input
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              placeholder="AAAA-BBBB"
              disabled
              className="mt-2 w-full px-inset bg-[#10070d] p-3 font-pixel text-[9px] text-[#a9c3be] outline-none opacity-60"
            />
          </label>

          <div className="px-inset p-3 font-pixel text-[7px] leading-5 text-[#a9c3be]">
            <div className="text-[#38bdf8] mb-1">PLANO DO MULTIPLAYER ONLINE</div>
            <div>1. O anfitrião cria uma sala e recebe um código curto.</div>
            <div>2. O amigo entra pelo código ou convite compartilhado.</div>
            <div>3. Um serviço de sinalização conecta os jogadores; o jogo não expõe IP ou porta.</div>
          </div>

          <PxButton tone="gold" onClick={onClose} className="w-full py-3 text-[9px]">VOLTAR</PxButton>
        </div>
      </PxFrame>
    </div>
  );
}
