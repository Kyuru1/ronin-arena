import "dotenv/config";
import cors from "cors";
import express from "express";
import pg from "pg";

const { Pool } = pg;
const port = Number(process.env.PORT || 3001);
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "10kb" }));

const rankingQuery = `
  SELECT
    player_name AS name,
    score,
    wave,
    kills,
    survival_time_seconds AS time,
    (EXTRACT(EPOCH FROM created_at) * 1000)::bigint AS date
  FROM ranking
  ORDER BY score DESC, wave DESC, kills DESC, survival_time_seconds DESC, created_at ASC
  LIMIT 50`;

app.get("/api/ranking", async (_request, response) => {
  try {
    const { rows } = await pool.query(rankingQuery);
    response.json(rows);
  } catch (error) {
    console.error("Could not load ranking", error);
    response.status(500).json({ error: "Could not load ranking" });
  }
});

app.post("/api/ranking", async (request, response) => {
  const body = request.body ?? {};
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 12).toUpperCase() : "RONIN";
  const values = [body.score, body.wave, body.kills, body.time];
  if (!values.every((value) => Number.isFinite(value) && value >= 0)) {
    return response.status(400).json({ error: "Invalid score data" });
  }

  try {
    await pool.query(
      `INSERT INTO ranking (player_name, score, wave, kills, survival_time_seconds)
       VALUES ($1, $2, $3, $4, $5)`,
      [name || "RONIN", Math.floor(body.score), Math.max(1, Math.floor(body.wave)), Math.floor(body.kills), Math.floor(body.time)],
    );
    const { rows } = await pool.query(rankingQuery);
    return response.status(201).json(rows);
  } catch (error) {
    console.error("Could not save ranking", error);
    return response.status(500).json({ error: "Could not save ranking" });
  }
});

app.listen(port, () => console.log(`Ranking API running at http://localhost:${port}`));
