import type { PlayerData } from './types';

export type FacingDirection = 'up' | 'down' | 'left' | 'right';

/** A single actor survives the cinematic, transition and exterior scene. */
export interface StoryPlayerEntity extends PlayerData {
  x: number;
  y: number;
  facing: number;
  direction: FacingDirection;
  walking: boolean;
  walkTime: number;
  shirt: string;
}

export const STORY_SPAWN = { x: 400, y: 680 } as const;
export const STORY_MOVE_SPEED = 68;
export const STORY_PLAYER_RADIUS = 5;

export function createStoryPlayer(name: string): StoryPlayerEntity {
  return {
    name, ...STORY_SPAWN, facing: 1, direction: 'up',
    walking: false, walkTime: 0, shirt: '#477c79',
  };
}

export function moveStoryPlayer(
  player: StoryPlayerEntity,
  horizontal: number,
  vertical: number,
  seconds: number,
  canOccupy: (x: number, y: number) => boolean,
) {
  const length = Math.hypot(horizontal, vertical);
  if (length < .01 || seconds <= 0) {
    player.walking = false;
    return;
  }
  const dx = horizontal / Math.max(1, length);
  const dy = vertical / Math.max(1, length);
  if (Math.abs(dx) > Math.abs(dy)) {
    player.direction = dx < 0 ? 'left' : 'right';
    player.facing = dx < 0 ? -1 : 1;
  } else {
    player.direction = dy < 0 ? 'up' : 'down';
  }
  const beforeX = player.x, beforeY = player.y;
  const nextX = player.x + dx * STORY_MOVE_SPEED * seconds;
  const nextY = player.y + dy * STORY_MOVE_SPEED * seconds;
  if (canOccupy(nextX, player.y)) player.x = nextX;
  if (canOccupy(player.x, nextY)) player.y = nextY;
  player.walking = Math.hypot(player.x - beforeX, player.y - beforeY) > .01;
  if (player.walking) player.walkTime += seconds;
}

