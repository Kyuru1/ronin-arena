import { useEffect, useRef, useState } from "react";
import type { InputMode, KeyboardBindings } from "../game/engine";
import IntroCutsceneState from "./IntroCutsceneState";
import KyunethExteriorScene from "./KyunethExteriorScene";
import NameInputState from "./NameInputState";
import { STORY_SESSION_KEY } from "./storyContent";
import { createStoryPlayer, type StoryPlayerEntity } from "./storyPlayer";
import type { PlayerData, StoryState } from "./types";
import "./story.css";

function loadSessionPlayer(): PlayerData {
  try {
    const raw = sessionStorage.getItem(STORY_SESSION_KEY);
    if (!raw) return { name: "" };
    const parsed = JSON.parse(raw) as Partial<PlayerData>;
    return { name: typeof parsed.name === "string" ? parsed.name.slice(0, 18) : "" };
  } catch {
    return { name: "" };
  }
}

export default function StoryMode({
  isTouch,
  inputMode,
  movementKeys,
  onBack,
}: {
  isTouch: boolean;
  inputMode: InputMode;
  movementKeys: Pick<KeyboardBindings, "up" | "down" | "left" | "right">;
  onBack: () => void;
}) {
  const [storyState, setStoryState] = useState<StoryState>("name");
  const [player, setPlayer] = useState<PlayerData>(loadSessionPlayer);
  const actorRef = useRef<StoryPlayerEntity | null>(null);
  if (!actorRef.current) actorRef.current = createStoryPlayer(player.name);

  useEffect(() => {
    if (storyState !== "transition") return;
    const timer = window.setTimeout(() => setStoryState("kyuneth"), 1250);
    return () => window.clearTimeout(timer);
  }, [storyState]);

  const confirmPlayer = (nextPlayer: PlayerData) => {
    actorRef.current = createStoryPlayer(nextPlayer.name);
    setPlayer(nextPlayer);
    try {
      sessionStorage.setItem(STORY_SESSION_KEY, JSON.stringify(nextPlayer));
    } catch {
      // The active story still retains PlayerData when storage is unavailable.
    }
    setStoryState("intro");
  };

  return (
    <section className="story-mode" aria-label="Modo História">
      {storyState === "name" && (
        <NameInputState initialName={player.name} onConfirm={confirmPlayer} onBack={onBack} />
      )}
      {storyState === "intro" && (
        <IntroCutsceneState
          player={actorRef.current}
          onComplete={() => setStoryState("transition")}
          onBack={onBack}
        />
      )}
      {storyState === "transition" && (
        <div className="story-transition" role="status" aria-live="polite">
          <div className="story-transition-mark" />
          <span>O CAMINHO TERMINA.</span>
          <strong>UMA NOVA VIDA COMEÇA.</strong>
        </div>
      )}
      {storyState === "kyuneth" && (
        <KyunethExteriorScene player={actorRef.current} isTouch={isTouch} inputMode={inputMode} movementKeys={movementKeys} onBack={onBack} />
      )}
    </section>
  );
}
