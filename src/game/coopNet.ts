import type { Difficulty, Weapon, Perk } from "./engine";
import type { PlayerProfile } from "./auth";
import { supabase } from "../lib/supabase";

export interface CoopRoomPlayer { profile: PlayerProfile; ready: boolean; }
export interface CoopRoomState { code: string; difficulty: Difficulty; started: boolean; host: CoopRoomPlayer; guest: CoopRoomPlayer | null; }
export interface PeerRoninState { px: number; py: number; face: number; walk: boolean; hp: number; maxHp: number; weapon: Weapon; atkPhase: number; atkAngle: number; isDashing: boolean; perk: Perk | null; coins: number; score: number; kills: number; username?: string; avatarId?: string; }
export interface CoopEnemyState { id: number; type: string; x: number; y: number; hp: number; maxHp: number; face: number; atkAngle: number; state: string; animTimer: number; }
export interface CoopPickupState { id: number; kind: "coin" | "heart" | "potion"; potion?: string; x: number; y: number; credited: boolean; }
export interface CoopHostSyncData { wave: number; waveTotal: number; waveLeft: number; enemies: CoopEnemyState[]; pickups: CoopPickupState[]; hostRonin: PeerRoninState; splitCoinsEarned?: number; waveCompleted?: boolean; }
export interface CoopGuestSyncData { guestRonin: PeerRoninState; hits: Array<{ enemyId: number; dmg: number; crit?: boolean; kx?: number; ky?: number }>; collectedPickupIds?: number[]; shopReady?: boolean; }
export type GamePacket =
  | { type: "HOST_SYNC"; payload: CoopHostSyncData }
  | { type: "GUEST_SYNC"; payload: CoopGuestSyncData }
  | { type: "COIN_DIVIDED"; amount: number; totalGuestCoins: number; totalHostCoins: number }
  | { type: "REVIVE_TRIGGER"; target: "host" | "guest" }
  | { type: "PICKUP_EFFECT"; kind: "heart" | "potion"; potion?: string; target: "host" | "guest" }
  | { type: "SHOP_OPEN"; wave: number }
  | { type: "SHOP_CONTINUE"; wave: number }
  | { type: "GAME_OVER" }
  | { type: "PLAYER_DAMAGE"; target: "host" | "guest"; dmg: number; nx: number; ny: number };

type WireMessage = { type: string; payload?: unknown };

function codeFrom(value: string) {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^KYU/, "").slice(0, 6);
}

function newCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return `KYU-${Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")}`;
}

export class CoopNetwork {
  private channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
  public roomCode: string | null = null;
  public role: "host" | "guest" | null = null;
  public roomState: CoopRoomState | null = null;
  public onRoomUpdate?: (room: CoopRoomState) => void;
  public onGameStart?: (difficulty: Difficulty, seed: number) => void;
  public onGamePacket?: (packet: GamePacket) => void;
  public onPeerLeft?: (message: string) => void;
  public onError?: (message: string) => void;
  public onStatusChange?: (connected: boolean) => void;

  public isConnected() { return this.channel !== null; }

  private publish(type: string, payload?: unknown) {
    void this.channel?.send({ type: "broadcast", event: "coop", payload: { type, payload } satisfies WireMessage });
  }

  private updateRoom(room: CoopRoomState, announce = true) {
    this.roomState = room;
    this.onRoomUpdate?.(room);
    if (announce) this.publish("ROOM_UPDATE", room);
  }

  private async open(code: string) {
    if (!supabase) throw new Error("Supabase não configurado.");
    this.disconnect();
    const channel = supabase.channel(`ronin-coop:${code}`, { config: { broadcast: { self: false } } });
    this.channel = channel;
    channel.on("broadcast", { event: "coop" }, ({ payload }) => this.receive(payload as WireMessage));
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("Tempo de conexão esgotado.")), 10000);
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") { window.clearTimeout(timer); this.onStatusChange?.(true); resolve(); }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") { window.clearTimeout(timer); reject(new Error("Não foi possível entrar na sala.")); }
      });
    });
  }

  async createRoom(profile: PlayerProfile, difficulty: Difficulty = "medium") {
    const code = newCode();
    await this.open(code);
    this.roomCode = code;
    this.role = "host";
    this.updateRoom({ code, difficulty, started: false, host: { profile, ready: true }, guest: null }, false);
    this.publish("HOST_READY", this.roomState);
  }

  async joinRoom(rawCode: string, profile: PlayerProfile) {
    const partial = codeFrom(rawCode);
    if (partial.length < 4) throw new Error("Digite um código de convite válido.");
    const code = `KYU-${partial}`;
    await this.open(code);
    this.roomCode = code;
    this.role = "guest";
    this.publish("JOIN_REQUEST", profile);
    window.setTimeout(() => {
      if (!this.roomState) this.onError?.("Sala não encontrada ou anfitrião desconectado.");
    }, 6000);
  }

  setDifficulty(difficulty: Difficulty) {
    if (this.role !== "host" || !this.roomState) return;
    this.updateRoom({ ...this.roomState, difficulty });
  }

  toggleReady() {
    if (this.role !== "guest" || !this.roomState?.guest) return;
    this.updateRoom({ ...this.roomState, guest: { ...this.roomState.guest, ready: !this.roomState.guest.ready } });
  }

  startGame() {
    if (this.role !== "host" || !this.roomState?.guest?.ready) return;
    const room = { ...this.roomState, started: true };
    this.updateRoom(room);
    const seed = Math.floor(Math.random() * 2 ** 31);
    this.onGameStart?.(room.difficulty, seed);
    this.publish("GAME_STARTED", { difficulty: room.difficulty, seed });
  }

  sendPacket(packet: GamePacket) { this.publish("GAME_PACKET", packet); }

  leaveRoom() {
    if (this.role === "host") this.publish("HOST_LEFT");
    if (this.role === "guest") this.publish("GUEST_LEFT");
    this.disconnect();
  }

  disconnect() {
    if (this.channel && supabase) void supabase.removeChannel(this.channel);
    this.channel = null;
    this.roomCode = null;
    this.role = null;
    this.roomState = null;
    this.onStatusChange?.(false);
  }

  private receive(message: WireMessage) {
    switch (message.type) {
      case "HOST_READY":
      case "ROOM_UPDATE": {
        const room = message.payload as CoopRoomState;
        this.roomState = room;
        this.onRoomUpdate?.(room);
        break;
      }
      case "JOIN_REQUEST": {
        if (this.role !== "host" || !this.roomState) return;
        if (this.roomState.guest) { this.publish("ERROR", "Esta sala já está cheia."); return; }
        this.updateRoom({ ...this.roomState, guest: { profile: message.payload as PlayerProfile, ready: false } });
        break;
      }
      case "GAME_STARTED": {
        const payload = message.payload as { difficulty: Difficulty; seed: number };
        this.onGameStart?.(payload.difficulty, payload.seed);
        break;
      }
      case "GAME_PACKET": this.onGamePacket?.(message.payload as GamePacket); break;
      case "HOST_LEFT":
      case "GUEST_LEFT": this.onPeerLeft?.("O parceiro saiu da sala."); break;
      case "ERROR": this.onError?.(String(message.payload)); break;
    }
  }
}

export const coopNet = new CoopNetwork();


