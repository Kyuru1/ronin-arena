import type { Difficulty, Weapon, Perk, WeaponLevels, MagicType } from "./engine";
import type { PlayerProfile } from "./auth";
import type { RaceId } from "./races";
import { supabase } from "../lib/supabase";

export interface CoopRoomPlayer { profile: PlayerProfile; ready: boolean; perk: Perk | null; }
export interface CoopRoomState { code: string; difficulty: Difficulty; started: boolean; hostId: string; players: Record<string, CoopRoomPlayer>; rematchVotes?: Record<string, boolean>; }
export interface CoopArrowState { x: number; y: number; rot: number; weapon?: Weapon; evolved?: boolean; }
export interface CoopShotState { x: number; y: number; vx: number; vy: number; life: number; r: number; dmg: number; color?: string; explosive?: boolean; zone?: "fire" | "poison"; warmup?: number; }
export interface CoopParticleState { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string; drag: number; kind: 0 | 1 | 2 | 3; rot?: number; }
export interface CoopImpactState { x: number; y: number; a: number; life: number; max: number; heavy: boolean; }
export interface PeerRoninState {
  px: number; py: number; face: number; walk: boolean; hp: number; maxHp: number; weapon: Weapon; weapons: Weapon[]; activeSlot: number; weaponLevels: WeaponLevels; atkPhase: number; atkAngle: number; weaponAngle: number; attacking: boolean; bowCharge: number; arrows: CoopArrowState[]; isDashing: boolean; perk: Perk | null; raceId: RaceId; worldW?: number; worldH?: number; raceAbilityT: number; raceAbilityCd: number; coins: number; score: number; kills: number; magicType: MagicType; magicFxT: number; magicFxX: number; magicFxY: number; magicFxRadius: number; magicFxForm: number; username?: string; avatarId?: string;
}
export interface CoopEnemyState { id: number; type: string; x: number; y: number; hp: number; maxHp: number; face: number; atkAngle: number; state: string; animTimer: number; flash: number; }
export interface CoopPickupState { id: number; kind: "coin" | "heart" | "potion"; potion?: string; x: number; y: number; credited: boolean; }
export interface CoopHostSyncData { wave: number; waveTotal: number; waveLeft: number; enemies: CoopEnemyState[]; pickups: CoopPickupState[]; hostRonin: PeerRoninState; ronins?: Record<string, PeerRoninState>; splitCoinsEarned?: number; waveCompleted?: boolean; paused: boolean; shots: CoopShotState[]; particles: CoopParticleState[]; impacts: CoopImpactState[]; }
export interface CoopGuestSyncData { playerId: string; guestRonin: PeerRoninState; hits: Array<{ enemyId: number; dmg: number; crit?: boolean; kx?: number; ky?: number }>; collectedPickupIds?: number[]; shopReady?: boolean; }
export type GamePacket =
  | { type: "HOST_SYNC"; payload: CoopHostSyncData }
  | { type: "GUEST_SYNC"; payload: CoopGuestSyncData }
  | { type: "COIN_DIVIDED"; amount: number; totalGuestCoins: number; totalHostCoins: number }
  | { type: "REVIVE_TRIGGER"; target: string }
  | { type: "PICKUP_EFFECT"; kind: "heart" | "potion"; potion?: string; target: string }
  | { type: "SHOP_OPEN"; wave: number }
  | { type: "SHOP_CONTINUE"; wave: number; playerId?: string }
  | { type: "GAME_OVER" }
  | { type: "PLAYER_DAMAGE"; target: string; dmg: number; nx: number; ny: number }
  | { type: "SHOT_SYNC"; payload: CoopShotState[] };

type WireMessage = { type: string; payload?: unknown };
const MAX_PLAYERS = 4;

function codeFrom(value: string) { return String(value).toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^KYU/, "").slice(0, 6); }
function newCode() { const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return `KYU-${Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")}`; }

export class CoopNetwork {
  private channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
  public roomCode: string | null = null;
  public role: "host" | "guest" | null = null;
  public playerId: string | null = null;
  public roomState: CoopRoomState | null = null;
  public onRoomUpdate?: (room: CoopRoomState) => void;
  public onGameStart?: (difficulty: Difficulty, seed: number) => void;
  public onGamePacket?: (packet: GamePacket, senderId: string) => void;
  public onPeerLeft?: (message: string) => void;
  public onKicked?: (message: string) => void;
  public onRematchUpdate?: (votes: Record<string, boolean>) => void;
  public onRematchLobby?: () => void;
  public onError?: (message: string) => void;
  public onStatusChange?: (connected: boolean) => void;

  public isConnected() { return this.channel !== null; }
  public roomPlayers(room = this.roomState) { return room ? Object.entries(room.players) : []; }
  public isHost() { return this.role === "host"; }
  private publish(type: string, payload?: unknown) { void this.channel?.send({ type: "broadcast", event: "coop", payload: { type, payload } satisfies WireMessage }); }
  private updateRoom(room: CoopRoomState, announce = true) { this.roomState = room; this.onRoomUpdate?.(room); if (announce) this.publish("ROOM_UPDATE", room); }

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
    const code = newCode(); await this.open(code);
    this.roomCode = code; this.role = "host"; this.playerId = profile.id;
    this.updateRoom({ code, difficulty, started: false, hostId: profile.id, players: { [profile.id]: { profile, ready: true, perk: null } } }, false);
    this.publish("HOST_READY", this.roomState);
  }

  async joinRoom(rawCode: string, profile: PlayerProfile) {
    const partial = codeFrom(rawCode); if (partial.length < 4) throw new Error("Digite um código de convite válido.");
    const code = `KYU-${partial}`; await this.open(code);
    this.roomCode = code; this.role = "guest"; this.playerId = profile.id; this.publish("JOIN_REQUEST", profile);
    window.setTimeout(() => { if (!this.roomState) this.onError?.("Sala não encontrada ou anfitrião desconectado."); }, 6000);
  }

  setDifficulty(difficulty: Difficulty) { if (!this.isHost() || !this.roomState) return; this.updateRoom({ ...this.roomState, difficulty }); }
  setPerk(perk: Perk | null) {
    if (!this.roomState || !this.playerId || !this.roomState.players[this.playerId]) return;
    if (this.isHost()) this.updateRoom({ ...this.roomState, players: { ...this.roomState.players, [this.playerId]: { ...this.roomState.players[this.playerId], perk } } });
    else this.publish("PERK_UPDATE", { playerId: this.playerId, perk });
  }
  toggleReady() { if (!this.roomState || !this.playerId || this.isHost()) return; this.publish("READY_UPDATE", { playerId: this.playerId, ready: !this.roomState.players[this.playerId]?.ready }); }
  startGame() {
    if (!this.isHost() || !this.roomState) return;
    const players = Object.values(this.roomState.players);
    if (players.length < 2 || !players.every((player) => player.ready)) return;
    const room = { ...this.roomState, started: true, rematchVotes: {} }; this.updateRoom(room);
    const seed = Math.floor(Math.random() * 2 ** 31); this.onGameStart?.(room.difficulty, seed); this.publish("GAME_STARTED", { difficulty: room.difficulty, seed });
  }
  kickPlayer(playerId: string) {
    if (!this.isHost() || !this.roomState || playerId === this.roomState.hostId || !this.roomState.players[playerId]) return;
    const players = { ...this.roomState.players }; delete players[playerId];
    const rematchVotes = { ...(this.roomState.rematchVotes ?? {}) }; delete rematchVotes[playerId];
    this.updateRoom({ ...this.roomState, players, rematchVotes });
    this.publish("KICK_PLAYER", { playerId });
  }
  requestRematch() {
    if (!this.roomState?.started || !this.playerId) return;
    if (this.isHost()) this.applyRematchVote(this.playerId);
    else this.publish("REMATCH_READY", { playerId: this.playerId });
  }
  private applyRematchVote(playerId: string) {
    if (!this.isHost() || !this.roomState?.players[playerId]) return;
    const votes = { ...(this.roomState.rematchVotes ?? {}), [playerId]: true };
    const room = { ...this.roomState, rematchVotes: votes };
    this.updateRoom(room);
    this.onRematchUpdate?.(votes);
    const playerIds = Object.keys(room.players);
    if (!playerIds.length || !playerIds.every((id) => votes[id])) return;
    const players = Object.fromEntries(Object.entries(room.players).map(([id, player]) => [id, { ...player, ready: id === room.hostId }]));
    const lobbyRoom = { ...room, started: false, players, rematchVotes: {} };
    this.updateRoom(lobbyRoom);
    this.onRematchLobby?.();
    this.publish("REMATCH_LOBBY", lobbyRoom);
  }
  sendPacket(packet: GamePacket) { if (this.playerId) this.publish("GAME_PACKET", { senderId: this.playerId, packet }); }
  leaveRoom() { if (this.playerId) this.publish("PLAYER_LEFT", this.playerId); this.disconnect(); }
  disconnect() { if (this.channel && supabase) void supabase.removeChannel(this.channel); this.channel = null; this.roomCode = null; this.role = null; this.playerId = null; this.roomState = null; this.onStatusChange?.(false); }

  private receive(message: WireMessage) {
    switch (message.type) {
      case "HOST_READY": case "ROOM_UPDATE": { const room = message.payload as CoopRoomState; this.roomState = room; this.onRoomUpdate?.(room); this.onRematchUpdate?.(room.rematchVotes ?? {}); break; }
      case "JOIN_REQUEST": {
        if (!this.isHost() || !this.roomState) return;
        const profile = message.payload as PlayerProfile;
        if (this.roomState.players[profile.id]) return;
        if (Object.keys(this.roomState.players).length >= MAX_PLAYERS) { this.publish("ERROR", "Esta sala já está cheia (4 jogadores)."); return; }
        this.updateRoom({ ...this.roomState, players: { ...this.roomState.players, [profile.id]: { profile, ready: false, perk: null } } }); break;
      }
      case "PERK_UPDATE": {
        if (!this.isHost() || !this.roomState) return;
        const update = message.payload as { playerId: string; perk: Perk | null };
        const player = this.roomState.players[update.playerId]; if (!player) return;
        this.updateRoom({ ...this.roomState, players: { ...this.roomState.players, [update.playerId]: { ...player, perk: update.perk } } }); break;
      }
      case "READY_UPDATE": {
        if (!this.isHost() || !this.roomState) return;
        const update = message.payload as { playerId: string; ready: boolean };
        const player = this.roomState.players[update.playerId]; if (!player) return;
        this.updateRoom({ ...this.roomState, players: { ...this.roomState.players, [update.playerId]: { ...player, ready: update.ready } } }); break;
      }
      case "KICK_PLAYER": {
        const targetId = String((message.payload as { playerId?: string } | undefined)?.playerId ?? "");
        if (!targetId || targetId !== this.playerId) return;
        const kickedMessage = "Você foi expulso da sala pelo anfitrião.";
        this.disconnect(); this.onKicked?.(kickedMessage); break;
      }
      case "REMATCH_READY": {
        const playerId = String((message.payload as { playerId?: string } | undefined)?.playerId ?? "");
        this.applyRematchVote(playerId); break;
      }
      case "REMATCH_LOBBY": {
        const room = message.payload as CoopRoomState;
        this.roomState = room; this.onRoomUpdate?.(room); this.onRematchLobby?.(); break;
      }
      case "GAME_STARTED": { const payload = message.payload as { difficulty: Difficulty; seed: number }; this.onGameStart?.(payload.difficulty, payload.seed); break; }
      case "GAME_PACKET": { const payload = message.payload as { senderId: string; packet: GamePacket }; if (payload.senderId !== this.playerId) this.onGamePacket?.(payload.packet, payload.senderId); break; }
      case "PLAYER_LEFT": {
        const playerId = String(message.payload ?? ""); if (!playerId || !this.roomState) return;
        if (playerId === this.roomState.hostId) { this.onPeerLeft?.("O anfitrião saiu da sala."); return; }
        if (this.isHost()) { const players = { ...this.roomState.players }; delete players[playerId]; this.updateRoom({ ...this.roomState, players }); }
        this.onPeerLeft?.("Um parceiro saiu da sala."); break;
      }
      case "ERROR": this.onError?.(String(message.payload)); break;
    }
  }
}
export const coopNet = new CoopNetwork();
