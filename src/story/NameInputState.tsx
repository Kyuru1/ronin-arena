import { useEffect, useRef, useState, type FormEvent } from "react";
import type { PlayerData } from "./types";

const MAX_NAME_LENGTH = 18;

function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

export default function NameInputState({
  initialName,
  onConfirm,
  onBack,
}: {
  initialName: string;
  onConfirm: (player: PlayerData) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = normalizeName(name);
    if (!normalized) {
      setError("DIGITE UM NOME PARA CONTINUAR.");
      inputRef.current?.focus();
      return;
    }
    onConfirm({ name: normalized });
  };

  return (
    <div className="story-name-state">
      <div className="story-name-sky" aria-hidden="true">
        <div className="story-name-sun" />
        <div className="story-name-island" />
      </div>
      <form className="story-name-card" onSubmit={submit}>
        <span className="story-kicker">MODO HISTÓRIA · PRÓLOGO</span>
        <h1>UM NOVO COMEÇO</h1>
        <p>Antes de continuar, diga seu nome.</p>
        <label htmlFor="story-player-name">NOME DO PROTAGONISTA</label>
        <input
          ref={inputRef}
          id="story-player-name"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          placeholder="VIAJANTE"
          aria-describedby={error ? "story-name-error" : undefined}
        />
        <div className="story-name-counter">{name.length}/{MAX_NAME_LENGTH}</div>
        {error && <div id="story-name-error" className="story-name-error">{error}</div>}
        <button type="submit" className="story-primary-button">CONFIRMAR <span>↵</span></button>
        <button type="button" className="story-quiet-button" onClick={onBack}>← VOLTAR AO MENU</button>
      </form>
    </div>
  );
}
