import { useEffect, useRef } from 'react';
import { humanFrame } from './characters/renderer';
import type { DialogueParticipant } from './types';

/** A native pixel crop of the same character shown in the world. */
export default function DialoguePortrait({ participant, active }: { participant: DialogueParticipant; active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 56, 44);
    ctx.imageSmoothingEnabled = false;
    const frame = humanFrame(participant.portrait, 'down', false, 0);
    if (frame) ctx.drawImage(frame, 0, 0, 56, 44, 0, 0, 56, 44);
  }, [participant.portrait]);
  return <div className={`dialogue-portrait ${active ? 'is-speaking' : 'is-listening'}`} data-participant={participant.id}>
    <canvas ref={canvas} width={56} height={44} role="img" aria-label={participant.name} />
    <span aria-hidden="true">{participant.name}</span>
  </div>;
}
