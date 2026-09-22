import type { Difficulty, Weapon, Perk } from "./engine";
import type { PlayerProfile } from "./auth";

export interface CoopRoomPlayer {
  profile: PlayerProfile;
  ready: boolean;
}

export interface CoopRoomState {
  code: string;
  difficulty: Difficulty;
  started: boolean;
  host: CoopRoomPlayer;
  guest: CoopRoomPlayer | null;
}

export interface PeerRoninState {
  px: number;
  py: number;
  face: number;
  walk: boolean;
  hp: number;
  maxHp: number;
  weapon: Weapon;
  atkPhase: number;
  atkAngle: number;
  isDashing: boolean;
  perk: Perk | null;
  coins: number;
  score: number;
  kills: number;
}

export interface CoopEnemyState {
  id: number;
  type: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  face: number;
  atkAngle: number;
  state: string;
  animTimer: number;
}

export interface CoopPickupState {
  id: number;
  kind: "coin" | "heart" | "potion";
  potion?: string;
  x: number;
  y: number;
  credited: boolean;
}

export interface CoopHostSyncData {
  wave: number;
  waveTotal: number;
  waveLeft: number;
  enemies: CoopEnemyState[];
  pickups: CoopPickupState[];
  hostRonin: PeerRoninState;
  splitCoinsEarned?: number;
  waveCompleted?: boolean;
}

export interface CoopGuestSyncData {
  guestRonin: PeerRoninState;
  hits: Array<{ enemyId: number; dmg: number; crit?: boolean; kx?: number; ky?: number }>;
  collectedPickupIds?: number[];
  shopReady?: boolean;
}

export type GamePacket =
  | { type: "HOST_SYNC"; payload: CoopHostSyncData }
  | { type: "GUEST_SYNC"; payload: CoopGuestSyncData }
  | { type: "COIN_DIVIDED"; amount: number; totalGuestCoins: number; totalHostCoins: number }
  | { type: "REVIVE_TRIGGER"; target: "host" | "guest" }
  | { type: "PICKUP_EFFECT"; kind: "heart" | "potion"; potion?: string; target: "host" | "guest" }
  | { type: "SHOP_OPEN"; wave: number }
  | { type: "SHOP_CONTINUE"; wave: number }
  | { type: "GAME_OVER" };

/** Códiigo de sala puro (ex.: KYU-6F3K) que usa o servidor 24/7 configurado. */
export function normalizeRoomCode(value: string): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
}

/** Normaliza http(s) -> ws(s) preservando path, query e fragmento. */
function toWebSocketUrl(rawUrl: string): string {
  let input = String(rawUrl ?? "").trim().replace(/\/+$/, "").replace(/\/$/, "");
  if (input.includes("#")) {
    input = input.replace(/#$/, "");
  }
  if (/^https:\/\//i.test(input)) return `wss://${input.slice(8)}`;
  if (/^http:\/\//i.test(input)) return `ws://${input.slice(7)}`;
  if (!input || /^wss?:\/\//i.test(input)) return input;
  // Host/URL sem protocolo: usa o protocolo da propria pagina (https => wss).
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  return `${secure ? "wss" : "ws"}://${input}`;
}

/**
 * Converte um convite de sala em dados de conexao.
 * O convite pode ser:
 *   - só um código ("KYU-XXXX") => usa o servidor 24/7 padrão;
 *   - "URL_TUNEL#KYU-XXXX" (ou "wss://host/path#KYU-XXXX") => conecta no
 *     túnel do anfitrião e entra na sala pelo código embutido no fragmento.
 *
 * Retorna null quando o convite é inválido (ex.: URL sem #KYU-XXXX).
 */
export function parseInvite(value: string): { url: string; code: string } | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const hashIdx = raw.indexOf("#");
  if (hashIdx === -1) {
    const code = normalizeRoomCode(raw);
    return code ? { url: "", code: `KYU-${code.replace(/^KYU-/, "")}` } : null;
  }

  const urlPart = raw.slice(0, hashIdx).trim();
  const codePart = normalizeRoomCode(raw.slice(hashIdx + 1)).replace(/^KYU-/, "");
  if (!codePart) return null;

  const wsUrl = toWebSocketUrl(urlPart);
  if (!wsUrl) return null;

  return { url: wsUrl, code: `KYU-${codePart}` };
}

export class CoopNetwork {
  private ws: WebSocket | null = null;
  private tunnelUrl = "";
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectWaiters: Array<{
    resolve: () => void;
    reject: (err: unknown) => void;
    settled: boolean;
  }> = [];
  public roomCode: string | null = null;
  public role: "host" | "guest" | null = null;
  public roomState: CoopRoomState | null = null;

  public onRoomUpdate?: (room: CoopRoomState) => void;
  public onGameStart?: (difficulty: Difficulty, seed: number) => void;
  public onGamePacket?: (packet: GamePacket) => void;
  public onPeerLeft?: (message: string) => void;
  public onError?: (message: string) => void;
  public onStatusChange?: (connected: boolean) => void;

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /** Endpoint atualmente em uso (vazio = servidor 24/7 padrão). */
  public currentEndpoint(): string {
    return this.tunnelUrl;
  }

  /**
   * Servidor 24/7: VITE_COOP_SERVER_URL (produção, qualquer jogador entra só
   * com o código). Na falta, /coop-ws no mesmo host da página (dev/proxy).
   * Quando o jogador colou um convite com URL (túnel do anfitrião), prevalece.
   */
  private defaultServerUrl(): string {
    const raw = String((import.meta.env.VITE_COOP_SERVER_URL ?? "")).trim().replace(/\/+$/, "");
    if (raw) return toWebSocketUrl(raw);
    const loc = window.location;
    return `${loc.protocol === "https:" ? "wss:" : "ws:"}//${loc.host}/coop-ws`;
  }

  /** Compara o endpoint atual com uma URL normalizando http(s) -> ws(s). */
  public isSameEndpoint(rawUrl = ""): boolean {
    if (!this.isConnected()) return false;
    const norm = (u: string) => toWebSocketUrl(u || "").replace(/\/+$/, "").toLowerCase();
    return norm(this.tunnelUrl || this.defaultServerUrl()) === norm(rawUrl || this.defaultServerUrl());
  }

  public connect(absoluteServerUrl?: string): Promise<void> {
    const specified = toWebSocketUrl(absoluteServerUrl ?? "");
    const target = specified || this.defaultServerUrl();
    const endpointKey = specified || ""; // "" => servidor 24/7 padrão

    if (this.ws) {
      // Já conectado no endpoint certo: reaproveita a conexão.
      if (this.isConnected() && this.isSameEndpoint(absoluteServerUrl ?? "")) {
        return Promise.resolve();
      }
      // Endpoint mudou (ex.: saiu do túnel para o servidor padrão): reconecta.
      this.ws.close();
      this.ws = null;
    }
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }

    this.tunnelUrl = endpointKey;

    return new Promise<void>((resolve, reject) => {
      const waiter = { resolve, reject, settled: false };
      this.connectWaiters.push(waiter);
      let socket: WebSocket | null = null;
      try {
        socket = new WebSocket(target);
      } catch (err) {
        this.settleWaiter(waiter, false, err);
        this.failWaiters(err);
        return;
      }
      this.ws = socket;

      const timeout = setTimeout(() => {
        if (socket && socket.readyState !== WebSocket.OPEN && this.ws === socket) {
          try { socket.close(); } catch { /* ignore */ }
          const err = new Error("Tempo de conexão esgotado");
          this.settleWaiter(waiter, false, err);
          this.failWaiters(err);
        }
      }, 25000); // 25 s — dá tempo do túnel (cloudflared/localtunnel) responder.

      socket.onopen = () => {
        clearTimeout(timeout);
        if (this.ws !== socket) return; // socket antigo substituído por reconexão
        this.onStatusChange?.(true);
        this.settleWaiter(waiter, true, undefined);
        this.resolveWaiters();
      };
      socket.onerror = () => {
        clearTimeout(timeout);
        if (this.ws !== socket) return;
        const err = new Error("Não foi possível conectar ao servidor cooperativo.");
        this.onError?.("Não foi possível conectar ao servidor cooperativo.");
        this.settleWaiter(waiter, false, err);
        this.failWaiters(err);
      };
      socket.onclose = () => {
        if (this.ws !== socket) return;
        this.onStatusChange?.(false);
        this.roomCode = null;
        this.role = null;
        this.roomState = null;
        this.failWaiters(new Error("Conexão encerrada."));
      };
      socket.onmessage = (event) => {
        if (this.ws === socket) this.handleMessage(event.data);
      };
    });
  }

  private settleWaiter(
    waiter: { resolve: () => void; reject: (err: unknown) => void; settled: boolean },
    ok: boolean,
    err: unknown,
  ) {
    if (waiter.settled) return;
    waiter.settled = true;
    if (ok) waiter.resolve();
    else waiter.reject(err);
  }

  private resolveWaiters() {
    const waiters = this.connectWaiters;
    this.connectWaiters = [];
    for (const w of waiters) {
      w.settled = true;
      w.resolve();
    }
  }

  private failWaiters(err: unknown) {
    const waiters = this.connectWaiters;
    this.connectWaiters = [];
    for (const w of waiters) {
      w.settled = true;
      w.reject(err);
    }
  }

  private handleMessage(rawData: unknown) {
    try {
      const msg = JSON.parse(String(rawData));
      switch (msg.type) {
        case "ROOM_CREATED":
          this.roomCode = msg.code;
          this.role = "host";
          break;
        case "ROOM_JOINED":
          this.roomCode = msg.code;
          this.role = "guest";
          break;
        case "ROOM_UPDATE":
          this.roomState = msg.room;
          this.onRoomUpdate?.(msg.room);
          break;
        case "GAME_STARTED":
          this.onGameStart?.(msg.difficulty, msg.seed);
          break;
        case "GAME_PACKET":
          this.onGamePacket?.(msg.data);
          break;
        case "PEER_LEFT":
          this.onPeerLeft?.(msg.message ?? "O parceiro saiu da sala.");
          break;
        case "ERROR":
          this.onError?.(msg.message);
          break;
      }
    } catch (err) {
      console.error("CoopNet JSON error:", err);
    }
  }

  public createRoom(profile: PlayerProfile, difficulty: Difficulty = "medium") {
    if (!this.isConnected()) return;
    this.ws?.send(
      JSON.stringify({
        type: "CREATE_ROOM",
        profile,
        difficulty,
      }),
    );
  }

  public joinRoom(inviteOrCode: string, profile: PlayerProfile) {
    if (!this.isConnected()) return;
    const parsed = parseInvite(inviteOrCode);
    if (!parsed) return;
    this.ws?.send(
      JSON.stringify({
        type: "JOIN_ROOM",
        code: parsed.code,
        profile,
      }),
    );
  }

  public setDifficulty(difficulty: Difficulty) {
    if (!this.isConnected() || this.role !== "host") return;
    this.ws?.send(
      JSON.stringify({
        type: "SET_DIFFICULTY",
        difficulty,
      }),
    );
  }

  public toggleReady() {
    if (!this.isConnected()) return;
    this.ws?.send(
      JSON.stringify({
        type: "TOGGLE_READY",
      }),
    );
  }

  public startGame() {
    if (!this.isConnected() || this.role !== "host") return;
    this.ws?.send(
      JSON.stringify({
        type: "START_GAME",
      }),
    );
  }

  public sendPacket(packet: GamePacket) {
    if (!this.isConnected()) return;
    this.ws?.send(
      JSON.stringify({
        type: "GAME_PACKET",
        data: packet,
      }),
    );
  }

  public leaveRoom() {
    if (this.isConnected()) {
      this.ws?.send(JSON.stringify({ type: "LEAVE_ROOM" }));
    }
    this.roomCode = null;
    this.role = null;
    this.roomState = null;
  }

  public disconnect() {
    this.leaveRoom();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.tunnelUrl = "";
  }
}

export const coopNet = new CoopNetwork();
