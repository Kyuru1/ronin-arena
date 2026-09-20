import test from "node:test";
import assert from "node:assert/strict";
import { getRankingThreshold, qualifies, normalizeScores } from "./storage.ts";

test("ranking allows only the top 50 and uses score order", () => {
  const scores = Array.from({ length: 60 }, (_, i) => ({
    name: `P${i + 1}`,
    score: i + 1,
    wave: 1,
    kills: 0,
    time: 1,
    date: i,
  }));

  const trimmed = normalizeScores(scores).slice(0, 50);
  assert.equal(trimmed.length, 50);
  assert.equal(trimmed[0].score, 60);
  assert.equal(trimmed.at(-1)?.score, 11);
  assert.equal(getRankingThreshold(scores)!.score, 11);
  assert.equal(qualifies(10, scores), false);
  assert.equal(qualifies(12, scores), true);
});
