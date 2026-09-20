export interface ScoreEntry {
  name: string;
  score: number;
  wave: number;
  kills: number;
  time: number;
  date: number;
}

export const MAX = 50;
const KEY = "ronin.ranking.v2";
const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
const API_URL = (env.VITE_RANKING_API_URL || "http://localhost:3001/api").replace(/\/$/, "");

function compareEntries(a: ScoreEntry, b: ScoreEntry): number {
  return b.score - a.score || b.wave - a.wave || b.kills - a.kills || b.time - a.time;
}

export function normalizeScores(entries: unknown): ScoreEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .filter((entry) => typeof entry.score === "number")
    .map((entry) => ({
      name: typeof entry.name === "string" ? entry.name : "RONIN",
      score: Number(entry.score),
      wave: typeof entry.wave === "number" ? entry.wave : 1,
      kills: typeof entry.kills === "number" ? entry.kills : 0,
      time: typeof entry.time === "number" ? entry.time : 0,
      date: typeof entry.date === "number" ? entry.date : Date.now(),
    }))
    .sort(compareEntries)
    .slice(0, MAX);
}

export function getRankingThreshold(entries: ScoreEntry[] | unknown = []): ScoreEntry | null {
  const list = normalizeScores(entries);
  return list.length >= MAX ? list[MAX - 1] ?? null : null;
}

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScoreEntry[];
    if (!Array.isArray(parsed)) return [];
    return normalizeScores(parsed);
  } catch {
    return [];
  }
}

/** Would this score make it onto the leaderboard? */
export function qualifies(score: number, current: ScoreEntry[] | unknown = loadScores()): boolean {
  const list = normalizeScores(current);
  if (list.length < MAX) return true;
  const threshold = getRankingThreshold(list);
  if (!threshold) return true;
  return score > threshold.score;
}

export function saveScore(entry: ScoreEntry): { list: ScoreEntry[]; rank: number } {
  const list = normalizeScores([...loadScores(), entry]);
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
