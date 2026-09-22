import { useEffect, useState } from "react";
import type { PlayerProfile } from "../game/auth";
import type { Difficulty } from "../game/engine";
import { coopNet, type CoopRoomState } from "../game/coopNet";
import { PxButton, PxChip, PxFrame, PxHeading } from "./PixelUi";
import PixelSprite from "./PixelSprite";

interface CoopLobbyModalProps { profile: PlayerProfile; onClose: () => void; onStartCoop: (isHost: boolean, difficulty: Difficulty) => void; }

export default function CoopLobbyModal({ profile, onClose, onStartCoop }: CoopLobbyModalProps) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [code, setCode] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [room, setRoom] = useState<CoopRoomState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    coopNet.onRoomUpdate = (next) => { setRoom(next); setBusy(false); setMessage(""); };
    coopNet.onError = (error) => { setBusy(false); setMessage(error); };
    coopNet.onGameStart = (nextDifficulty) => onStartCoop(coopNet.role === "host", nextDifficulty);
    coopNet.onPeerLeft = (text) => { setMessage(text); setRoom(null); };
    return () => { coopNet.onRoomUpdate = undefined; coopNet.onError = undefined; coopNet.onGameStart = undefined; coopNet.onPeerLeft = undefined; };
  }, [onStartCoop]);

  const create = async () => {
    setBusy(true); setMessage("");
    try { await coopNet.createRoom(profile, difficulty); } catch (error) { setBusy(false); setMessage(error instanceof Error ? error.message : "Não foi possível criar a sala."); }
  };
  const join = async () => {
    setBusy(true); setMessage("");
    try { await coopNet.joinRoom(code, profile); } catch (error) { setBusy(false); setMessage(error instanceof Error ? error.message : "Não foi possível entrar na sala."); }
  };
  const leave = () => { coopNet.leaveRoom(); setRoom(null); setBusy(false); setMessage(""); };
  const copy = async () => { if (!room) return; await navigator.clipboard?.writeText(room.code); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };

  if (room) {
    const host = coopNet.role === "host";
    const canStart = host && Boolean(room.guest?.ready);
    return <div className="px-backdrop absolute inset-0 z-30 flex items-center justify-center overflow-y-auto p-3 sm:p-6"><PxFrame title="SALA COOPERATIVA" className="anim-pop w-full max-w-xl p-4 sm:p-6"><div className="flex flex-col gap-4">
      <div className="px-inset flex items-center justify-between gap-3 p-3"><div><div className="font-pixel text-[6px] text-[#91b9b5]">CÓDIGO DE CONVITE</div><strong className="font-pixel text-[18px] text-[#ffd44a]">{room.code}</strong></div><PxButton tone="gold" onClick={() => void copy()} className="px-3 py-2 text-[7px]">{copied ? "COPIADO" : "COPIAR"}</PxButton></div>
      <div className="grid grid-cols-2 gap-2"><div className="px-inset p-2"><div className="font-pixel text-[6px] text-[#ffd44a]">ANFITRIÃO</div><div className="font-pixel mt-1 text-[8px] text-[#ffe2c4]">{room.host.profile.username}</div></div><div className="px-inset p-2"><div className="font-pixel text-[6px] text-[#38bdf8]">PARCEIRO</div><div className="font-pixel mt-1 text-[8px] text-[#ffe2c4]">{room.guest?.profile.username ?? "AGUARDANDO..."}</div></div></div>
      {host && <div className="px-inset p-3"><PxHeading>DIFICULDADE</PxHeading><div className="mt-2 flex gap-2">{(["easy", "medium", "hard"] as const).map((value) => <PxChip key={value} on={room.difficulty === value} onClick={() => coopNet.setDifficulty(value)}>{value === "easy" ? "FÁCIL" : value === "medium" ? "MÉDIO" : "DIFÍCIL"}</PxChip>)}</div></div>}
      {message && <div className="font-pixel text-center text-[7px] leading-4 text-[#ef4444]">{message}</div>}
      {host ? <PxButton tone="gold" disabled={!canStart} onClick={() => coopNet.startGame()} className="w-full py-4 text-[9px]">{!room.guest ? "AGUARDANDO AMIGO..." : !room.guest.ready ? "AGUARDANDO PARCEIRO..." : "INICIAR PARTIDA"}</PxButton> : <PxButton tone={room.guest?.ready ? "dark" : "gold"} onClick={() => coopNet.toggleReady()} className="w-full py-4 text-[9px]">{room.guest?.ready ? "CANCELAR PRONTO" : "ESTOU PRONTO"}</PxButton>}
      <PxButton tone="dark" onClick={leave} className="w-full py-3 text-[8px]">SAIR DA SALA</PxButton>
    </div></PxFrame></div>;
  }

  return <div className="px-backdrop absolute inset-0 z-30 flex items-center justify-center overflow-y-auto p-3 sm:p-6"><PxFrame title="MODO COOPERATIVO" className="anim-pop w-full max-w-lg p-4 sm:p-6"><div className="flex flex-col gap-4">
    <div className="px-inset flex items-center justify-between p-3"><div className="flex items-center gap-2"><PixelSprite name={profile.avatarId === "samurai" ? "player" : profile.avatarId} scale={1} /><span className="font-pixel text-[8px] text-[#ffe2c4]">RONIN: {profile.username}</span></div><span className="font-pixel text-[6px] text-[#86efac]">ONLINE</span></div>
    <div className="grid grid-cols-2 gap-2"><PxButton tone={mode === "create" ? "gold" : "menu"} active={mode === "create"} onClick={() => setMode("create")} className="py-3 text-[8px]">HOSPEDAR</PxButton><PxButton tone={mode === "join" ? "gold" : "menu"} active={mode === "join"} onClick={() => setMode("join")} className="py-3 text-[8px]">ENTRAR</PxButton></div>
    {mode === "create" ? <><div className="px-inset p-3"><PxHeading>DIFICULDADE</PxHeading><div className="mt-2 flex gap-2">{(["easy", "medium", "hard"] as const).map((value) => <PxChip key={value} on={difficulty === value} onClick={() => setDifficulty(value)}>{value === "easy" ? "FÁCIL" : value === "medium" ? "MÉDIO" : "DIFÍCIL"}</PxChip>)}</div></div><PxButton tone="gold" disabled={busy} onClick={() => void create()} className="w-full py-4 text-[9px]">{busy ? "CRIANDO..." : "CRIAR SALA"}</PxButton></> : <><label className="font-pixel text-[7px] text-[#91b9b5]">CÓDIGO DO AMIGO<input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="KYU-ABCDE" maxLength={10} className="px-input mt-2 w-full text-center text-[10px] tracking-widest" /></label><PxButton tone="gold" disabled={busy || !code.trim()} onClick={() => void join()} className="w-full py-4 text-[9px]">{busy ? "ENTRANDO..." : "ENTRAR NA SALA"}</PxButton></>}
    {message && <div className="font-pixel text-center text-[7px] leading-4 text-[#ef4444]">{message}</div>}
    <div className="px-inset p-3 font-pixel text-[7px] leading-5 text-[#a9c3be]">Crie uma sala, envie o código ao seu amigo e iniciem juntos. Nenhum IP, porta ou túnel é necessário.</div>
    <PxButton tone="dark" onClick={onClose} className="w-full py-3 text-[8px]">VOLTAR</PxButton>
  </div></PxFrame></div>;
}

