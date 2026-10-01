import { useEffect, useRef, useState } from 'react';
import DialoguePortrait from './DialoguePortrait';
import type { DialogueSequence } from './types';
import './dialogue.css';

const LETTER_INTERVAL_MS = 24;

/** Keyed session ensures a new conversation never inherits the previous cursor. */
export default function DialogueController(props: {
  dialogue: DialogueSequence;
  paused?: boolean;
  onLineChange?: (index: number) => void;
  onComplete: () => void;
}) {
  return <DialogueSession key={props.dialogue.id} {...props} />;
}

function DialogueSession({ dialogue, paused = false, onLineChange, onComplete }: {
  dialogue: DialogueSequence; paused?: boolean;
  onLineChange?: (index: number) => void; onComplete: () => void;
}) {
  const [cursor, setCursor] = useState({ index: 0, visible: 0, ended: false });
  const current = useRef(cursor);
  const lastInput = useRef(-Infinity);
  const notified = useRef(false);
  const line = dialogue.lines[cursor.index];
  const complete = !!line && cursor.visible >= line.text.length;
  const finish = () => {
    if (notified.current) return;
    notified.current = true;
    current.current = { ...current.current, ended: true };
    setCursor(current.current);
    onComplete();
  };
  useEffect(() => {
    if (!dialogue.lines.length && !notified.current) {
      notified.current = true;
      onComplete();
    }
  }, [dialogue.lines.length, onComplete]);
  useEffect(() => {
    if (!line || complete || paused || cursor.ended) return;
    const timer = window.setTimeout(() => {
      current.current = { ...current.current, visible: Math.min(line.text.length, current.current.visible + 1) };
      setCursor(current.current);
    }, LETTER_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [line, complete, paused, cursor]);

  const advance = () => {
    const now = performance.now();
    if (paused || current.current.ended || !line || now - lastInput.current < 180) return;
    lastInput.current = now;
    const state = current.current;
    if (state.visible < line.text.length) {
      current.current = { ...state, visible: line.text.length };
    } else if (state.index + 1 < dialogue.lines.length) {
      current.current = { index: state.index + 1, visible: 0, ended: false };
      onLineChange?.(state.index + 1);
    } else { finish(); return; }
    setCursor(current.current);
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.code !== 'Enter') return;
      if (paused) return;
      event.preventDefault();
      if (!event.repeat) advance();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  if (!line || cursor.ended) return null;
  const speaker = dialogue.participants.find(person => person.id === line.speaker);
  // Preserve the first two seats; a larger cast replaces the second seat as needed.
  const seats = dialogue.participants.slice(0, 2);
  if (speaker && !seats.includes(speaker)) seats[1] = speaker;
  return <div className="story-dialogue-layer cinematic-dialogue" hidden={paused}
    onClick={event => {
      if (event.button !== 0 || event.detail > 1) return;
      event.preventDefault(); event.stopPropagation(); advance();
    }}>
    <section className="story-dialogue-box" role="dialog" aria-label={`Conversa com ${speaker?.name ?? line.speaker}`}>
      <div className="dialogue-cast">{seats.map(person => <DialoguePortrait key={person.id} participant={person} active={person.id === line.speaker} />)}</div>
      <div className="dialogue-copy">
        <div className="story-dialogue-meta"><strong>{speaker?.name ?? line.speaker}</strong></div>
        <p aria-hidden="true">{line.text.slice(0, cursor.visible)}{!complete && <span className="story-caret" />}</p>
        <span className="dialogue-accessible-line" aria-live="polite" aria-atomic="true">{speaker?.name}: {line.text}</span>
        <button className={`story-advance-hint ${complete ? 'is-ready' : ''}`} type="button"
          onClick={event => { event.stopPropagation(); if (event.detail <= 1) advance(); }}>
          <span className="dialogue-input-hint">M1 · </span>{complete ? 'Continuar' : 'Revelar fala'}<span aria-hidden="true">◆</span>
        </button>
      </div>
    </section>
  </div>;
}
