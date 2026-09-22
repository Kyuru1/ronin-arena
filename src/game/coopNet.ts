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
  kind: "coin" | "potion";
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
  | { type: "SHOP_CONTINUE"; wave: number };

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

  public connect(serverHost = "localhost:3001"): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }

        let wsUrl: string;
        const cleanHost = serverHost.trim().replace(/^https?:\/\//, "").replace(/^wss?:\/\//, "");

        if (cleanHost.includes(":")) {
          const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
          wsUrl = `${protocol}//${cleanHost}`;
        } else {
          // If no port, default to 3001
          const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
          wsUrl = `${protocol}//${cleanHost || "localhost"}:3001`;
        }

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
          this.onError?.("Não foi possível conectar ao servidor local.");
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
          this.onPeerLeft?.(msg.message);
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
