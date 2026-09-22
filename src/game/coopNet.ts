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

export class CoopNetwork {
  private ws: WebSocket | null = null;
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

  /**
   * URL do servidor coop: VITE_COOP_SERVER_URL (producao — servidor hospedado,
   * qualquer jogador entra pelo codigo de convite) ou, na falta, /coop-ws no
   * mesmo host da pagina (dev/proxy). Nao ha entrada manual de endereco.
   */
  private resolveServerUrl(): string {
    const raw = String((import.meta.env.VITE_COOP_SERVER_URL ?? "")).trim().replace(/\/+$/, "");
    if (raw) {
      if (/^wss?:\/\//i.test(raw)) return raw;
      if (/^https:\/\//i.test(raw)) return `wss://${raw.slice(8)}`;
      if (/^http:\/\//i.test(raw)) return `ws://${raw.slice(7)}`;
      const secure = window.location.protocol === "https:";
      return `${secure ? "wss:" : "ws:"}//${raw}`;
    }
    const loc = window.location;
    return `${loc.protocol === "https:" ? "wss:" : "ws:"}//${loc.host}/coop-ws`;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }

        const wsUrl = this.resolveServerUrl();
        const socket = new WebSocket(wsUrl);
        this.ws = socket;

        const timeout = setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            socket.close();
            reject(new Error("Tempo de conexão esgotado"));
          }
        }, 6000);

        socket.onopen = () => {
          clearTimeout(timeout);
          this.onStatusChange?.(true);
          resolve();
        };

        socket.onerror = (e) => {
          clearTimeout(timeout);
          this.onError?.("Não foi possível conectar ao servidor cooperativo.");
          reject(e);
        };

        socket.onclose = () => {
          this.onStatusChange?.(false);
          this.roomCode = null;
          this.role = null;
          this.roomState = null;
        };

        socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (err) {
        reject(err);
      }
    });
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

  public joinRoom(code: string, profile: PlayerProfile) {
    if (!this.isConnected()) return;
    this.ws?.send(
      JSON.stringify({
        type: "JOIN_ROOM",
        code: code.trim().toUpperCase(),
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
  }
}

export const coopNet = new CoopNetwork();
