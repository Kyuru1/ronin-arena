import { useEffect, useState } from 'react';

// Observational journal only: it never changes the world or enables interactions.
const entries = [
  { text: 'Conheça Kyuneth', detail: 'Explore a praça central', place: 'PRAÇA CENTRAL' },
  { text: 'Visite a prefeitura', detail: 'Um começo para a sua viagem', place: 'PREFEITURA DE KETLIN' },
  { text: 'Siga até a ferraria', detail: 'O som do martelo vem do leste', place: 'FERRARIA DE JEFF' },
  { text: 'Conheça a praia', detail: 'Siga a brisa até o cais', place: 'PRAIA DE KYUNETH' },
];

export default function TravelJournal({ landmark, paused }: { landmark: string; paused: boolean }) {
  const [index, setIndex] = useState(0);
  const [visited, setVisited] = useState<string[]>([]);
  const [compact, setCompact] = useState(false);
  const entry = entries[index];
  const complete = !!entry && visited.includes(entry.place);
  useEffect(() => {
    setCompact(false);
    if (paused || complete) return;
    const timer = window.setTimeout(() => setCompact(true), 6500);
    return () => window.clearTimeout(timer);
  }, [index, paused, complete]);
  useEffect(() => {
    if (paused) return;
    setVisited(previous => previous.includes(landmark) ? previous : [...previous, landmark]);
  }, [landmark, paused]);
  useEffect(() => {
    if (!complete || paused) return;
    const timer = window.setTimeout(() => setIndex(value => value + 1), 1800);
    return () => window.clearTimeout(timer);
  }, [complete, index, paused]);
  return <aside className={`travel-journal ${complete ? 'is-complete' : ''} ${compact ? 'is-compact' : ''}`} aria-label="Diário de viagem" aria-live="polite">
    <span className="journal-tack" aria-hidden="true" />
    <button type="button" className="journal-heading" aria-expanded={!compact} aria-controls="journal-current-entry" onClick={() => setCompact(value => !value)}>Diário de viagem <span aria-hidden="true">{compact ? '+' : '−'}</span></button>
    <div key={index} id="journal-current-entry" className="journal-entry" hidden={compact}>
      <span className="journal-mark" aria-hidden="true">{complete || !entry ? '✓' : '◇'}</span>
      <div><strong>{entry?.text ?? 'A vila te acolhe'}</strong><p>{complete ? 'Uma lembrança para guardar.' : entry?.detail ?? 'Continue descobrindo Kyuneth.'}</p></div>
    </div>
  </aside>;
}
