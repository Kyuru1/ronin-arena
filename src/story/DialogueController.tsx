import { useEffect, useMemo, useState, type PointerEvent } from "react";
import type { DialogueLine } from "./types";

const LETTER_INTERVAL_MS = 24;

export default function DialogueController({
  lines,
  paused = false,
  onLineChange,
  onComplete,
  onBack,
}: {
  lines: DialogueLine[];
  paused?: boolean;
  onLineChange?: (index: number) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [lineIndex, setLineIndex] = useState(0);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const line = lines[lineIndex];
  const complete = visibleCharacters >= line.text.length;
  const visibleText = useMemo(
    () => line.text.slice(0, visibleCharacters),
    [line.text, visibleCharacters],
  );

  useEffect(() => {
    if (complete || paused) return;
    const timer = window.setTimeout(
      () => setVisibleCharacters((count) => Math.min(line.text.length, count + 1)),
      LETTER_INTERVAL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [complete, paused, line.text, visibleCharacters]);

  const advance = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    if (!complete) {
      setVisibleCharacters(line.text.length);
      return;
    }
    if (lineIndex >= lines.length - 1) {
      onComplete();
      return;
    }
    setLineIndex((index) => index + 1);
    onLineChange?.(lineIndex + 1);
    setVisibleCharacters(0);
  };

  return (
    <div className="story-dialogue-layer" onPointerDown={advance}>
      <button
        type="button"
        className="story-cutscene-back"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onBack}
      >
        ← MENU
      </button>
      <div className="story-dialogue-box" aria-live="polite">
        <div className="story-dialogue-meta">
          <strong>{line.speaker}</strong>
          <span>{lineIndex + 1} / {lines.length}</span>
        </div>
        <p>
          {visibleText}
          {!complete && <span className="story-caret" aria-hidden="true" />}
        </p>
        <div className={`story-advance-hint ${complete ? "is-ready" : ""}`}>
          <span className="story-mouse-icon" aria-hidden="true" />
          {complete ? "M1 · CONTINUAR" : "M1 · COMPLETAR FALA"}
        </div>
      </div>
    </div>
  );
}

