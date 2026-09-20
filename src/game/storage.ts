import { supabase } from "../lib/supabase";
import type { Difficulty } from "./engine";

export interface ScoreEntry {
  name: string;
  score: number;
  wave: number;
  kills: number;
  time: number;
  difficulty: Difficulty;
  date: number;
}

export const MAX = 50;
const KEY = "ronin.ranking.v2";
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
const API_URL = (env?.VITE_RANKING_API_URL || "http://localhost:3001/api").replace(/\/$/, "");

function compareEntries(a: ScoreEntry, b: ScoreEntry): number {
  return b.score - a.score || b.wave - a.wave || b.kills - a.kills || b.time - a.time || b.date - a.date;
}

function normalizeDifficulty(value: unknown): Difficulty {
  if (value === "easy" || value === "facil") return "easy";
  if (value === "hard" || value === "dificil") return "hard";
  return "medium";
}

export function difficultyToDb(value: Difficulty): "facil" | "medio" | "dificil" {
  return value === "easy" ? "facil" : value === "hard" ? "dificil" : "medio";
}

export function normalizeScores(entries: unknown): ScoreEntry[] {
  if (!Array.isArray(entries)) return [];
  const normalized = entries
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .filter((entry) => typeof entry.score === "number")
    .map((entry) => ({
      name: typeof entry.name === "string" ? entry.name : typeof entry.player_name === "string" ? entry.player_name : "RONIN",
      score: Number(entry.score),
      wave: typeof entry.wave === "number" ? entry.wave : 1,
      kills: typeof entry.kills === "number" ? entry.kills : 0,
      time: typeof entry.time === "number" ? entry.time : typeof entry.survival_time_seconds === "number" ? entry.survival_time_seconds : 0,
      difficulty: normalizeDifficulty(entry.difficulty),
      date: typeof entry.date === "number" ? entry.date : typeof entry.created_at === "string" ? Date.parse(entry.created_at) : Date.now(),
    }));

  return (["easy", "medium", "hard"] as const).flatMap((difficulty) =>
    normalized.filter((entry) => entry.difficulty === difficulty).sort(compareEntries).slice(0, MAX),
  );
}

export function getRankingThreshold(entries: ScoreEntry[] | unknown = []): ScoreEntry | null {
  const list = normalizeScores(entries);
  return list.length >= MAX ? list[MAX - 1] ?? null : null;
}

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return normalizeScores(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function qualifies(score: number, current: ScoreEntry[] | unknown = loadScores()): boolean {
  const list = normalizeScores(current);
  if (list.length < MAX) return true;
  const threshold = getRankingThreshold(list);
  return !threshold || score > threshold.score;
}

export function saveScore(entry: ScoreEntry): { list: ScoreEntry[]; rank: number } {
  const list = normalizeScores([...loadScores(), entry]);
  const trimmed = list.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* local storage can be unavailable in private browsing */
  }
  return { list: trimmed, rank: trimmed.findIndex((item) => item === entry) };
}

function saveLocal(list: ScoreEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export async function loadRemoteScores(): Promise<ScoreEntry[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("ranking")
      .select("player_name, difficulty, score, wave, kills, survival_time_seconds, created_at")
      .order("score", { ascending: false })
      .order("wave", { ascending: false })
      .order("kills", { ascending: false })
      .limit(150);
    if (!error && data) {
      const scores = normalizeScores(data);
      saveLocal(scores);
      return scores;
    }
  }

  try {
    const response = await fetch(`${API_URL}/ranking`);
    if (!response.ok) throw new Error("Ranking request failed");
    const scores = normalizeScores(await response.json());
    saveLocal(scores);
    return scores;
  } catch {
    return loadScores();
  }
}

export async function saveRemoteScore(entry: ScoreEntry): Promise<{ list: ScoreEntry[]; rank: number }> {
  if (supabase) {
    const { error } = await supabase.from("ranking").insert({
      player_name: entry.name,
      difficulty: difficultyToDb(entry.difficulty),
      score: Math.max(0, Math.floor(entry.score)),
      wave: Math.max(1, Math.floor(entry.wave)),
      kills: Math.max(0, Math.floor(entry.kills)),
      survival_time_seconds: Math.max(0, Math.floor(entry.time)),
    });
    if (!error) {
      const list = await loadRemoteScores();
      const sameDifficulty = list.filter((item) => item.difficulty === entry.difficulty);
      return { list, rank: sameDifficulty.findIndex((item) => item.name === entry.name && item.score === entry.score) };
    }
  }

  try {
    const response = await fetch(`${API_URL}/ranking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!response.ok) throw new Error("Could not save ranking");
    const list = normalizeScores(await response.json());
    saveLocal(list);
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