import { useEffect, useState } from "react";
import { authErrorMessage, deleteAccount, resetPassword, signIn, signOut, signUp, saveProfile, type AvatarId, type PlayerProfile } from "../game/auth";
import PixelSprite from "./PixelSprite";
import { PxButton, PxHeading } from "./PixelUi";

const AVATARS: Array<{ id: AvatarId; label: string; sprite: string }> = [
  { id: "samurai", label: "RONIN", sprite: "player" },
  { id: "azureRonin", label: "AZUL", sprite: "azureRonin" },
  { id: "violetRonin", label: "VIOLETA", sprite: "violetRonin" },
  { id: "goldRonin", label: "DOURADO", sprite: "goldRonin" },
  { id: "jadeRonin", label: "JADE", sprite: "jadeRonin" },
  { id: "shadowRonin", label: "SOMBRA", sprite: "shadowRonin" },
  { id: "bananaSamurai", label: "BANANA", sprite: "bananaSamurai" },
  { id: "strawberryKnight", label: "MORANGO", sprite: "strawberryKnight" },
  { id: "orangeRonin", label: "LARANJA", sprite: "orangeRonin" },
  { id: "snowRonin", label: "NEVE", sprite: "snowRonin" },
  { id: "suitedHero", label: "TERNO", sprite: "suitedHero" },
  { id: "dressHero", label: "VESTIDO", sprite: "dressHero" },
];

export default function AccountPanel({ profile, onProfile }: { profile: PlayerProfile | null; onProfile: (value: PlayerProfile | null) => void }) {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [avatarId, setAvatarId] = useState<AvatarId>(profile?.avatarId ?? "samurai");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setUsername(profile?.username ?? "");
    setAvatarId(profile?.avatarId ?? "samurai");
  }, [profile]);
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (register) { await signUp(email, password, username, avatarId); setMessage("Confira seu e-mail para confirmar a conta."); }
      else await signIn(email, password);
    } catch (error) { setMessage(authErrorMessage(error)); }
    finally { setBusy(false); }
  };
  const recover = async () => {
    if (busy) return;
    setBusy(true);
    try { await resetPassword(email); setMessage("Enviamos um link de recuperação para seu e-mail."); }
    catch (error) { setMessage(authErrorMessage(error)); }
    finally { setBusy(false); }
  };
  const update = async () => {
    if (!profile) return;
    try { const next = await saveProfile({ ...profile, username, avatarId }); onProfile(next); setMessage("Perfil atualizado."); }
    catch (error) { setMessage(authErrorMessage(error)); }
  };
  return <div className="flex flex-col gap-4 sm:gap-5">
    <PxHeading className="text-[10px] sm:text-[12px]">PERFIL</PxHeading>
    {!profile ? <>
      <input className="px-input font-pixel text-[10px] sm:text-[11px]" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-MAIL" type="email" />
      <input className="px-input font-pixel text-[10px] sm:text-[11px]" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="SENHA (6+ CARACTERES)" type="password" />
      {register && <><input className="px-input font-pixel text-[10px] sm:text-[11px]" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="NOME NO RANKING" maxLength={12} /><AvatarPicker value={avatarId} onChange={setAvatarId} /></>}
      <PxButton tone="red" disabled={busy} onClick={() => void submit()} className="w-full py-4 text-[10px] sm:text-[11px]">{busy ? "AGUARDE..." : register ? "CRIAR CONTA" : "ENTRAR"}</PxButton>
      {!register && <PxButton tone="dark" disabled={busy} onClick={() => void recover()} className="w-full py-3 text-[9px] sm:text-[10px]">ESQUECI A SENHA</PxButton>}
      <PxButton tone="menu" onClick={() => setRegister((v) => !v)} className="w-full py-3 text-[9px] sm:text-[10px]">{register ? "JÁ TENHO CONTA" : "CRIAR CONTA"}</PxButton>
    </> : <>
      <div className="px-inset min-w-0 break-words p-4 font-pixel text-[9px] text-[#ffe2c4] sm:text-[10px]">CONECTADO COMO: {profile.username}</div>
      <input className="px-input font-pixel text-[10px] sm:text-[11px]" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="NOME NO RANKING" maxLength={12} />
      <AvatarPicker value={avatarId} onChange={setAvatarId} />
      <PxButton tone="gold" onClick={() => void update()} className="w-full py-4 text-[10px] sm:text-[11px]">SALVAR PERFIL</PxButton>
      <PxButton tone="dark" onClick={() => void signOut().then(() => onProfile(null))} className="w-full py-3 text-[9px] sm:text-[10px]">SAIR DA CONTA</PxButton>
      <PxButton tone="red" onClick={() => { if (window.confirm("Excluir sua conta e seu perfil? Esta ação não pode ser desfeita.")) void deleteAccount().then(() => onProfile(null)).catch((error) => setMessage(authErrorMessage(error))); }} className="w-full py-3 text-[9px] sm:text-[10px]">EXCLUIR CONTA</PxButton>
    </>}
    {message && <p className="font-pixel text-center text-[8px] leading-5 text-[#ffd44a] sm:text-[9px]">{message}</p>}
  </div>;
}
function AvatarPicker({ value, onChange }: { value: AvatarId; onChange: (value: AvatarId) => void }) {
  return <div className="grid grid-cols-3 gap-2 sm:gap-3">{AVATARS.map((avatar) => <button key={avatar.id} onClick={() => onChange(avatar.id)} className={`px-tile flex min-h-24 min-w-0 w-full flex-col items-center justify-center gap-2 overflow-hidden p-2 sm:min-h-28 ${value === avatar.id ? "outline outline-2 outline-[#ffd44a]" : ""}`}><PixelSprite name={avatar.sprite} scale={3} /><span className="whitespace-nowrap text-center font-pixel text-[6px] leading-none sm:text-[7px]">{avatar.label}</span></button>)}</div>;
}

