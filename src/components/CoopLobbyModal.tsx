import { useState, useEffect, useCallback } from "react";
import type { PlayerProfile } from "../game/auth";
import type { Difficulty } from "../game/engine";
import { coopNet, parseInvite, type CoopRoomState } from "../game/coopNet";
import { PxFrame, PxButton, PxHeading, PxChip } from "./PixelUi";
import PixelSprite from "./PixelSprite";

interface CoopLobbyModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onStartCoop: (isHost: boolean, difficulty: Difficulty) => void;
}

const TUNNEL_KEY = "ronin.coop.tunnel.v1";
const HELP_MD_URL = "/ronin-arena/COOP-HOSTING.md";

function loadRememberedTunnel(): string {
  try {
    return localStorage.getItem(TUNNEL_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function CoopLobbyModal({ profile, onClose, onStartCoop }: CoopLobbyModalProps) {
  const [tab, setTab] = useState<"lobby" | "create" | "join">("lobby");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [tunnelUrl, setTunnelUrl] = useState(loadRememberedTunnel);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("medium");
  const [roomState, setRoomState] = useState<CoopRoomState | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  // Setup callbacks on mount. A limpeza so remove o handler se ainda for o
  // mesmo (o App pode substituir onPeerLeft ao entrar em partida).
  useEffect(() => {
    const roomUpdate = (state: CoopRoomState) => {
      setRoomState(state);
      setLoading(false);
      // Sala criada no servidor 24/7: endereço não é mais relevante.
      if (!coopNet.currentEndpoint()) {
        try { localStorage.removeItem(TUNNEL_KEY); } catch { /* ignore */ }
        setTunnelUrl("");
      }
    };
    const gameStart = (startDifficulty: Difficulty) => {
      onStartCoop(coopNet.role === "host", startDifficulty);
    };
    const netError = (err: string) => {
      setErrorMsg(err);
      setLoading(false);
    };
    const peerLeft = (msg: string) => {
      setErrorMsg(msg);
      setLoading(false);
    };

    coopNet.onRoomUpdate = roomUpdate;
    coopNet.onGameStart = gameStart;
    coopNet.onError = netError;
    coopNet.onPeerLeft = peerLeft;

    return () => {
      if (coopNet.onRoomUpdate === roomUpdate) coopNet.onRoomUpdate = undefined;
      if (coopNet.onGameStart === gameStart) coopNet.onGameStart = undefined;
      if (coopNet.onError === netError) coopNet.onError = undefined;
      if (coopNet.onPeerLeft === peerLeft) coopNet.onPeerLeft = undefined;
    };
  }, [onStartCoop]);

  const ensureConnection = useCallback(async (absoluteServerUrl = "") => {
    const want = absoluteServerUrl.replace(/\/+$/, "");
    // Já conectado no endpoint certo: reaproveita a conexão.
    if (coopNet.isConnected() && coopNet.isSameEndpoint(want)) return true;
    // Endpoint diferente (ex.: anfitrião colou o túnel depois de usar o
    // servidor 24/7): reconecta e aguarda antes de criar a sala.
    try {
      setLoading(true);
      setErrorMsg("");
      await coopNet.connect(want);
      return true;
    } catch {
      setErrorMsg("Não foi possível conectar ao servidor cooperativo. Confira a URL do túnel e tente novamente.");
      setLoading(false);
      return false;
    }
  }, []);

  const handleCreateRoom = async () => {
    const url = tunnelUrl.trim();
    const ok = await ensureConnection(url);
    if (!ok) return;
    // Lembra a URL do túnel para a próxima vez que for hospedar.
    try {
      if (url) localStorage.setItem(TUNNEL_KEY, url);
      else localStorage.removeItem(TUNNEL_KEY);
    } catch {
      /* ignore storage errors */
    }
    setLoading(true);
    setErrorMsg("");
    coopNet.createRoom(profile, selectedDifficulty);
  };

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim()) {
      setErrorMsg("Digite o código da sala (KYU-XXXX) ou o convite completo (URL#KYU-XXXX).");
      return;
    }

    const parsed = parseInvite(roomCodeInput);
    if (!parsed) {
      setErrorMsg("Convite inválido. Use só o código (KYU-XXXX) ou a URL terminada em #KYU-XXXX.");
      return;
    }

    // Se o convite inclui URL (túnel do anfitrião), conecta nela; senão
    // continua no servidor 24/7 do jogo.
    const ok = await ensureConnection(parsed.url);
    if (!ok) return;
    setLoading(true);
    setErrorMsg("");
    setRoomCodeInput("");
    coopNet.joinRoom(parsed.url ? `${parsed.url}#${parsed.code}` : parsed.code, profile);
  };

  const handleToggleReady = () => {
    coopNet.toggleReady();
  };

  const handleStartGame = () => {
    if (coopNet.role !== "host" || !roomState?.guest?.ready) return;
    coopNet.startGame();
  };

  const handleLeaveRoom = () => {
    coopNet.leaveRoom();
    setRoomState(null);
    setTab("lobby");
    setErrorMsg("");
  };

  const copyText = async (text: string) => {
    setCopied(true);
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const input = document.createElement("input");
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
    } catch {
      /* ignore clipboard errors */
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    if (!roomState?.code) return;
    void copyText(roomState.code);
  };

  const copyFullInvite = () => {
    if (!roomState?.code) return;
    const endpoint = coopNet.currentEndpoint();
    const invite = endpoint ? `${endpoint}#${roomState.code}` : roomState.code;
    void copyText(invite);
  };

  const activeEndpoint = coopNet.currentEndpoint();

  // If in an active room
  if (roomState) {
    const isHost = coopNet.role === "host";
    const hostPlayer = roomState.host;
    const guestPlayer = roomState.guest;
    const canStart = isHost && guestPlayer && guestPlayer.ready;

    return (
      <div className="px-backdrop absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <PxFrame title="SALA COOPERATIVA" className="anim-pop w-full max-w-xl p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            {/* Header with Room Code */}
            <div className="px-inset flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#1c0812]">
              <div>
                <span className="font-pixel text-[7px] text-[#91b9b5]">CÓDIGO DE CONVITE:</span>
                <div className="font-pixel text-[18px] sm:text-[22px] text-[#ffd44a] tracking-wider">
                  {roomState.code}
                </div>
                {activeEndpoint && (
                  <div className="font-pixel text-[6px] text-[#86efac] mt-0.5 break-all">
                    🔌 {activeEndpoint}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <PxButton tone="gold" onClick={copyFullInvite} className="text-[8px] py-2 px-3">
                  {copied ? "COPIADO!" : "📋 COPIAR CONVITE"}
                </PxButton>
                <PxButton tone="dark" onClick={copyCode} className="text-[7px] py-1.5 px-3">
                  SÓ O CÓDIGO
                </PxButton>
              </div>
            </div>

            {/* Rules badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="px-inset p-2">
                <div className="font-pixel text-[6px] text-[#86efac]">CÂMERA</div>
                <div className="font-pixel text-[7px] text-[#ffe2c4] mt-0.5">INDIVIDUAL</div>
              </div>
              <div className="px-inset p-2">
                <div className="font-pixel text-[6px] text-[#ffd44a]">MOEDAS</div>
                <div className="font-pixel text-[7px] text-[#ffe2c4] mt-0.5">2X DIVIDIDAS</div>
              </div>
              <div className="px-inset p-2">
                <div className="font-pixel text-[6px] text-[#38bdf8]">DIFICULDADE</div>
                <div className="font-pixel text-[7px] text-[#ffe2c4] mt-0.5 uppercase">{roomState.difficulty}</div>
              </div>
              <div className="px-inset p-2">
                <div className="font-pixel text-[6px] text-[#f87171]">RANKING</div>
                <div className="font-pixel text-[7px] text-[#ffe2c4] mt-0.5">DESATIVADO</div>
              </div>
            </div>

            {/* Host difficulty controls (only host can change) */}
            {isHost && (
              <div className="px-inset p-3">
                <div className="font-pixel text-[7px] text-[#ffd44a] mb-2">AJUSTAR DIFICULDADE DA SALA:</div>
                <div className="flex gap-2">
                  {(["easy", "medium", "hard"] as const).map((diff) => (
                    <PxChip
                      key={diff}
                      on={roomState.difficulty === diff}
                      onClick={() => coopNet.setDifficulty(diff)}
                    >
                      {diff === "easy" ? "FÁCIL" : diff === "medium" ? "MÉDIO" : "DIFÍCIL"}
                    </PxChip>
                  ))}
                </div>
              </div>
            )}

            {/* Players in Room */}
            <div className="flex flex-col gap-2">
              <PxHeading>JOGADORES NA SALA (2 MÁX)</PxHeading>

              {/* Host Card */}
              <div className="px-inset flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <PixelSprite name={hostPlayer.profile.avatarId === "samurai" ? "player" : hostPlayer.profile.avatarId} scale={2} />
                  <div>
                    <div className="font-pixel text-[9px] text-[#ffe2c4]">
                      {hostPlayer.profile.username}
                    </div>
                    <span className="font-pixel text-[6px] text-[#ffd44a]">👑 ANFITRIÃO (HOST)</span>
                  </div>
                </div>
                <span className="font-pixel text-[7px] text-[#86efac]">PRONTO</span>
              </div>

              {/* Guest Card */}
              {guestPlayer ? (
                <div className="px-inset flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <PixelSprite name={guestPlayer.profile.avatarId === "samurai" ? "player" : guestPlayer.profile.avatarId} scale={2} />
                    <div>
                      <div className="font-pixel text-[9px] text-[#ffe2c4]">
                        {guestPlayer.profile.username}
                      </div>
                      <span className="font-pixel text-[6px] text-[#38bdf8]">⚔️ PARCEIRO COOP</span>
                    </div>
                  </div>
                  <span className={`font-pixel text-[7px] ${guestPlayer.ready ? "text-[#86efac]" : "text-[#ffd44a]"}`}>
                    {guestPlayer.ready ? "PRONTO" : "AGUARDANDO PRONTO"}
                  </span>
                </div>
              ) : (
                <div className="px-inset p-4 text-center border-dashed border border-[#6b2135]">
                  <div className="font-pixel text-[7px] text-[#91b9b5] animate-pulse">
                    AGUARDANDO ENTRADA DO 2º JOGADOR...
                  </div>
                  <div className="font-pixel text-[6px] text-[#a9c3be] mt-1">
                    Compartilhe o convite completo com seu amigo — ele cola no campo de código.
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="font-pixel text-center text-[7px] leading-4 text-[#ef4444] bg-[#450a0a]/50 p-2 rounded">
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-2">
              {isHost ? (
                <PxButton
                  tone="gold"
                  disabled={!canStart}
                  onClick={handleStartGame}
                  className="w-full py-4 text-[10px]"
                >
                  {!guestPlayer
                    ? "AGUARDANDO SEGUNDO JOGADOR..."
                    : !guestPlayer.ready
                      ? "AGUARDANDO PARCEIRO FICAR PRONTO..."
                      : "▶ INICIAR PARTIDA COOPERATIVA"}
                </PxButton>
              ) : (
                <PxButton
                  tone={guestPlayer?.ready ? "dark" : "gold"}
                  onClick={handleToggleReady}
                  className="w-full py-4 text-[10px]"
                >
                  {guestPlayer?.ready ? "CANCELAR PRONTO" : "✔ ESTOU PRONTO!"}
                </PxButton>
              )}

              <PxButton tone="dark" onClick={handleLeaveRoom} className="w-full py-3 text-[8px]">
                SAIR DA SALA
              </PxButton>
            </div>
          </div>
        </PxFrame>
      </div>
    );
  }

  // Lobby Menu (Create / Join tabs)
  return (
    <div className="px-backdrop absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <PxFrame title="MODO COOPERATIVO" className="anim-pop w-full max-w-lg p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* User authenticated badge */}
          <div className="px-inset flex items-center justify-between p-3 bg-[#190913]">
            <div className="flex items-center gap-2">
              <PixelSprite name={profile.avatarId === "samurai" ? "player" : profile.avatarId} scale={1} />
              <div className="font-pixel text-[8px] text-[#ffe2c4]">
                RONIN: <span className="text-[#ffd44a]">{profile.username}</span>
              </div>
            </div>
            <span className="font-pixel text-[6px] text-[#86efac]">✔ AUTENTICADO</span>
          </div>

          {showChecklist && (
            <div className="px-inset p-3 bg-[#14060e]">
              <div className="font-pixel text-[8px] text-[#ffd44a] mb-1.5">🏟️ HOSPEDAR NO SEU PC — CHECKLIST</div>
              <div className="font-pixel text-[7px] text-[#ffe2c4] leading-4 space-y-1 text-left">
                <p>1. No PC do anfitrião, rode no terminal: <strong className="text-[#86efac]">npm install</strong> e <strong className="text-[#86efac]">npm run server</strong>.</p>
                <p>2. Abra outro terminal e rode o túnel: <strong className="text-[#86efac]">npx localtunnel --port 3001</strong> (à alternativa: cloudflared, ngrok ou playit.gg).</p>
                <p>3. Copie a URL que aparecer (ex.: https://xxxxx.loca.lt) e cole no campo “HOSPEDAR NO SEU PC”.</p>
                <p>4. Crie a sala. No botão <strong className="text-[#86efac]">COPIAR CONVITE</strong> agora sai o link completo — mande pro amigo.</p>
                <p>💡 Sem internet, na mesma rede: use o IP local do PC (ex.: 192.168.0.10:3001) como URL e pule o túnel.</p>
                <p className="text-[#91b9b5]">📖 Passo a passo completo, com troca de firewall e alternativas: <a href={HELP_MD_URL} target="_blank" rel="noreferrer" className="underline text-[#ffd44a]">COOP-HOSTING.md</a></p>
              </div>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <PxButton
              tone={tab === "create" ? "gold" : "menu"}
              active={tab === "create"}
              onClick={() => { setTab("create"); setErrorMsg(""); }}
              className="py-3 text-[8px]"
            >
              HOSPEDAR SALA
            </PxButton>
            <PxButton
              tone={tab === "join" ? "gold" : "menu"}
              active={tab === "join"}
              onClick={() => { setTab("join"); setErrorMsg(""); }}
              className="py-3 text-[8px]"
            >
              ENTRAR COM CÓDIGO
            </PxButton>
          </div>

          <PxButton tone="dark" onClick={() => setShowChecklist((v) => !v)} className="w-full py-2 text-[7px]">
            {showChecklist ? "▲ OCULTAR GUIA RÁPIDO" : "▼ CONFIGURAR HOSPEDAGEM NO PC (GUIA)"}
          </PxButton>

          {/* CREATE TAB */}
          {tab === "create" && (
            <div className="flex flex-col gap-3">
              <div className="font-pixel text-[7px] text-[#91b9b5] leading-4">
                Crie uma sala cooperativa e chame um amigo. Um código de convite aparece na sua tela — quem tiver o código entra na hora.
              </div>

              <div className="px-inset p-3">
                <div className="font-pixel text-[7px] text-[#86efac] mb-1.5">🌐 HOSPEDAR NO SEU PC (OPCIONAL, CUSTO ZERO)</div>
                <label className="font-pixel text-[6px] text-[#91b9b5] block mb-1">
                  URL DO TÚNEL OU IP LOCAL (EX.: https://xxxxx.loca.lt OU 192.168.0.10:3001):
                </label>
                <input
                  type="text"
                  value={tunnelUrl}
                  onChange={(e) => setTunnelUrl(e.target.value)}
                  placeholder="deixe vazio para usar o servidor gratuito do jogo"
                  className="px-input font-pixel text-[9px] w-full lowercase"
                />
                <div className="font-pixel text-[6px] text-[#a9c3be] mt-1">
                  Deixe em branco para usar o servidor 24/7 do jogo (só o código).
                </div>
              </div>

              <div className="px-inset p-3">
                <div className="font-pixel text-[7px] text-[#ffd44a] mb-2">ESCOLHA A DIFICULDADE:</div>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((diff) => (
                    <PxChip
                      key={diff}
                      on={selectedDifficulty === diff}
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      {diff === "easy" ? "FÁCIL" : diff === "medium" ? "MÉDIO" : "DIFÍCIL"}
                    </PxChip>
                  ))}
                </div>
              </div>

              <PxButton
                tone="gold"
                disabled={loading}
                onClick={handleCreateRoom}
                className="w-full py-4 text-[9px]"
              >
                {loading ? "CRIANDO SALA..." : "CRIAR SALA"}
              </PxButton>
            </div>
          )}

          {/* JOIN TAB */}
          {tab === "join" && (
            <div className="flex flex-col gap-3">
              <div className="font-pixel text-[7px] text-[#91b9b5] leading-4">
                Cole o convite que o anfitrião mandou. Pode ser só o código ({`KYU-XXXX`}) para o servidor 24/7, ou o link completo (URL#KYU-XXXX) de quem hospeda no próprio PC.
              </div>

              <div className="px-inset p-3">
                <label className="font-pixel text-[7px] text-[#ffd44a] block mb-1">
                  CÓDIGO OU CONVITE:
                </label>
                <input
                  type="text"
                  maxLength={260}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value)}
                  placeholder="KYU-XXXX  ou  https://tunel.loca.lt#KYU-XXXX"
                  className="px-input font-pixel text-[9px] text-center tracking-widest w-full"
                />
              </div>

              <PxButton
                tone="gold"
                disabled={loading}
                onClick={handleJoinRoom}
                className="w-full py-4 text-[9px]"
              >
                {loading ? "ENTRANDO..." : "ENTRAR NA SALA"}
              </PxButton>
            </div>
          )}

          {/* DEFAULT INTRO VIEW */}
          {tab === "lobby" && (
            <div className="flex flex-col gap-3 text-center">
              <div className="px-inset p-4 bg-[#14060e]">
                <div className="font-pixel text-[9px] text-[#ffd44a] mb-2">REGRAS DO MODO COOP</div>
                <div className="font-pixel text-[7px] text-[#ffe2c4] leading-5 text-left space-y-1">
                  <p>⚔️ <strong>Câmera individual:</strong> Cada jogador navega pela arena com visão própria.</p>
                  <p>🪙 <strong>Moedas em dobro:</strong> Coleta dá 2x moedas divididas igualmente entre ambos.</p>
                  <p>💀 <strong>Monstros cooperativos:</strong> Inimigos perseguem o jogador mais próximo.</p>
                  <p>🚫 <strong>Sem ranking:</strong> As pontuações do coop não afetam a tabela de classificação.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <PxButton tone="gold" onClick={() => setTab("create")} className="py-4 text-[8px]">
                  CRIAR SALA
                </PxButton>
                <PxButton tone="menu" onClick={() => setTab("join")} className="py-4 text-[8px]">
                  ENTRAR COM CÓDIGO
                </PxButton>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="font-pixel text-center text-[7px] leading-4 text-[#ef4444] bg-[#450a0a]/50 p-2 rounded">
              {errorMsg}
            </div>
          )}

          <PxButton tone="dark" onClick={onClose} className="w-full py-3 text-[8px] mt-2">
            ◀ VOLTAR AO MENU
          </PxButton>
        </div>
      </PxFrame>
    </div>
  );
}
