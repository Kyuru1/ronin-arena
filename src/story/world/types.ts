import type { FacingDirection } from '../storyPlayer';
export interface Position { x: number; y: number }
export interface Rect extends Position { w: number; h: number }
export type Material = 'grass' | 'flowers' | 'shade' | 'sand' | 'packed' | 'wet' | 'earth' | 'stone' | 'wood' | 'water';
export interface Tile { material: Material; variant: number }
export type ObjectKind = 'house' | 'hall' | 'forge' | 'palm' | 'tree' | 'bush' | 'flowers' | 'rock' | 'bench' | 'barrel' | 'crate' | 'pot' | 'laundry' | 'sign' | 'cart' | 'tools' | 'stall' | 'furnace' | 'anvil' | 'well' | 'fence' | 'boat' | 'net' | 'steps';
export interface WorldObject extends Position { id: string; kind: ObjectKind; variant: number; collider?: Rect }
export interface Npc extends Position { id: string; shirt: string; direction: FacingDirection; route?: Position[]; speed?: number }
export interface InteractionPoint extends Position { label: string; radius: number; available: boolean }
export interface WorldScene { id: 'kyuneth' | 'approach'; width: number; height: number; tiles: Tile[][]; objects: WorldObject[]; npcs: Npc[]; interactions: InteractionPoint[]; spawn: Position }
export interface PixelAsset { image: HTMLCanvasElement; shadow: HTMLCanvasElement; anchor: Position; width: number; height: number }
export interface Animation { frames: number; fps: number }
export type Layer = 'terrain' | 'shadow' | 'objects' | 'entities' | 'particles';
export const TILE_SIZE = 16;
