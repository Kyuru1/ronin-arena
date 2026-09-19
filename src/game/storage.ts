export interface ScoreEntry {
  name: string;
  score: number;
  wave: number;
  kills: number;
  time: number;
  date: number;
}

const KEY = "ronin.ranking.v2";
const MAX = 50;

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScoreEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => typeof e?.score === "number")
      .map((e) => ({ ...e, name: e.name || "RONIN" }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX);
  } catch {
    return [];
  }
}

/** Would this score make it onto the leaderboard? */
export function qualifies(score: number): boolean {
  const list = loadScores();
  return list.length < MAX || score > (list[list.length - 1]?.score ?? 0);
}

export function saveScore(entry: ScoreEntry): { list: ScoreEntry[]; rank: number } {
  const list = loadScores();
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  const trimmed = list.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
  const rank = trimmed.findIndex((e) => e === entry);
  return { list: trimmed, rank };
}

export function clearScores() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
