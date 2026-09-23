import test from "node:test";
import assert from "node:assert/strict";
import { RACE_CONFIG, RACE_IDS, forceRace, rollRace } from "./races.ts";

test("race roll honors each configured relative weight", () => {
  const total = RACE_IDS.reduce((sum, id) => sum + RACE_CONFIG[id].weight, 0);
  const counts = Object.fromEntries(RACE_IDS.map((id) => [id, 0])) as Record<(typeof RACE_IDS)[number], number>;
  for (let index = 0; index < total; index++) counts[rollRace(() => (index + 0.5) / total)]++;
  for (const id of RACE_IDS) assert.equal(counts[id], RACE_CONFIG[id].weight);
});

test("development race override never changes normal configured weights", () => {
  forceRace("godHunter");
  assert.equal(rollRace(() => 0.99), "godHunter");
  forceRace(null);
  assert.equal(rollRace(() => 0), "godHunter");
  assert.equal(rollRace(() => 0.999999), "survivor");
});

test("all race balance values match the initial design", () => {
  assert.equal(RACE_CONFIG.godHunter.modifiers.damage, 2);
  assert.equal(RACE_CONFIG.godHunter.modifiers.attributeLimit, 2);
  assert.equal(RACE_CONFIG.godHunter.modifiers.initialProgress, 0.5);
  assert.equal(RACE_CONFIG.godHunter.ability.duration, 5);
  assert.equal(RACE_CONFIG.godHunter.ability.invulnerable, true);

  assert.equal(RACE_CONFIG.oniBlood.modifiers.damage, 1.25);
  assert.equal(RACE_CONFIG.oniBlood.modifiers.maxHp, 0.9);
  assert.equal(RACE_CONFIG.oniBlood.ability.damage, 1.4);
  assert.equal(RACE_CONFIG.oniBlood.ability.duration, 6);

  assert.equal(RACE_CONFIG.spiritualHeir.modifiers.dashCooldown, 0.8);
  assert.equal(RACE_CONFIG.spiritualHeir.modifiers.moveSpeed, 1.1);
  assert.equal(RACE_CONFIG.spiritualHeir.ability.contactImmune, true);

  assert.equal(RACE_CONFIG.ronin.modifiers.damage, 1.1);
  assert.equal(RACE_CONFIG.ronin.ability.attackSpeed, 1.15);
  assert.equal(RACE_CONFIG.ronin.ability.duration, 5);

  assert.equal(RACE_CONFIG.survivor.modifiers.maxHp, 1.1);
  assert.equal(RACE_CONFIG.survivor.ability.healMaxHpFraction, 0.2);
  assert.equal(RACE_CONFIG.survivor.ability.cooldown, 35);
});

