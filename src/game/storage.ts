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
const API_URL = (import.meta.env.VITE_RANKING_API_URL || "http://localhost:3001/api").replace(/\/$/, "");

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

function normalizeScores(entries: unknown): ScoreEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .filter((entry) => typeof entry.score === "number")
    .map((entry) => ({
      name: typeof entry.name === "string" ? entry.name : "RONIN",
      score: entry.score as number,
      wave: typeof entry.wave === "number" ? entry.wave : 1,
      kills: typeof entry.kills === "number" ? entry.kills : 0,
      time: typeof entry.time === "number" ? entry.time : 0,
      date: typeof entry.date === "number" ? entry.date : Date.now(),
    }))
    .sort((a, b) => b.score - a.score || b.wave - a.wave || b.kills - a.kills)
    .slice(0, MAX);
}

export async function loadRemoteScores(): Promise<ScoreEntry[]> {
  try {
    const response = await fetch(`${API_URL}/ranking`);
    if (!response.ok) throw new Error("Ranking request failed");
    const scores = normalizeScores(await response.json());
    localStorage.setItem(KEY, JSON.stringify(scores));
    return scores;
  } catch {
    return loadScores();
  }
}

export async function saveRemoteScore(entry: ScoreEntry): Promise<{ list: ScoreEntry[]; rank: number }> {
  try {
    const response = await fetch(`${API_URL}/ranking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!response.ok) throw new Error("Could not save ranking");
    const list = normalizeScores(await response.json());
    localStorage.setItem(KEY, JSON.stringify(list));
    return { list, rank: list.findIndex((score) => score.name === entry.name && score.score === entry.score) };
  } catch {
    return saveScore(entry);
  }
}
export function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
