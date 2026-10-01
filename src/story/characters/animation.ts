import type { FacingDirection } from '../storyPlayer';

export type VisualAction = 'idle' | 'walk' | 'turn' | 'start' | 'stop';
export interface VisualPose { direction: FacingDirection; action: VisualAction; frame: number; }
interface MutableState {
  direction: FacingDirection;
  walking: boolean;
  changedAt: number;
  phaseAt: number;
  previous: FacingDirection;
}

/** Visual state is keyed by actor ID and never changes world position or collision. */
export class CharacterAnimation {
  private readonly states = new Map<string, MutableState>();
  pose(id: string, direction: FacingDirection, walking: boolean, now: number, fps: number): VisualPose {
    let state = this.states.get(id);
    if (!state) {
      state = { direction, walking, changedAt: now - 1, phaseAt: now, previous: direction };
      this.states.set(id, state);
    } else if (state.direction !== direction || state.walking !== walking) {
      state.previous = state.direction;
      state.direction = direction;
      state.walking = walking;
      state.changedAt = now;
      state.phaseAt = now;
    }
    const age = now - state.changedAt;
    const action: VisualAction = age < .10 ? state.previous !== direction ? 'turn' : walking ? 'start' : 'stop' : walking ? 'walk' : 'idle';
    const frame = action === 'walk' ? Math.floor(Math.max(0, now - state.phaseAt) * fps) % 4 : 0;
    return { direction, action, frame };
  }
  clear() { this.states.clear(); }
}