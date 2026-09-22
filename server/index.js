import "dotenv/config";
import fs from "node:fs";
import http from "node:http";
import cors from "cors";
import express from "express";
import pg from "pg";
import { WebSocketServer, WebSocket } from "ws";

const { Pool } = pg;
const port = Number(process.env.PORT || 3001);
const app = express();

let pool = null;
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  } catch (err) {
    console.warn("PostgreSQL not configured or failed to initialize:", err.message);
  }
}

async function initializeDatabase() {
  if (!pool) return;
  try {
    const schemaPath = new URL("./schema.sql", import.meta.url);
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      await pool.query(schemaSql);
    }
  } catch (err) {
    console.warn("Could not execute schema.sql:", err.message);
  }
}

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

try {
  await initializeDatabase();
} catch (e) {
  console.warn("Database initialization skipped:", e.message);
}

app.get("/api/ranking", async (_request, response) => {
  if (!pool) return response.json([]);
  try {
    const { rows } = await pool.query(rankingQuery);
    response.json(rows);
  } catch (error) {
    console.error("Could not load ranking", error);
    response.status(500).json({ error: "Could not load ranking" });
  }
});

app.post("/api/ranking", async (request, response) => {
  if (!pool) return response.status(503).json({ error: "Database not configured" });
  const body = request.body ?? {};
  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ").slice(0, 12).toUpperCase() : "RONIN";
  const values = [body.score, body.wave, body.kills, body.time];
  if (!/^[A-Z0-9 _-]+$/.test(name || "RONIN") || !values.every((value) => Number.isInteger(value) && value >= 0)
    || body.score > 10000000 || body.wave < 1 || body.wave > 10000 || body.kills > 1000000 || body.time > 86400) {
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

/* -------------------------------------------------------------
   MULTIPLAYER COOP ROOM MANAGER (WEBSOCKET)
------------------------------------------------------------- */
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/**
 * @typedef {{
 *   code: string;
 *   difficulty: "easy" | "medium" | "hard";
 *   host: { ws: WebSocket; profile: any; ready: boolean };
 *   guest: { ws: WebSocket; profile: any; ready: boolean } | null;
 *   started: boolean;
 *   createdAt: number;
 * }} Room
 */

/** @type {Map<string, Room>} */
const rooms = new Map();

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KYU-${code}`;
}

function broadcastRoom(room) {
  const payload = JSON.stringify({
    type: "ROOM_UPDATE",
    room: {
      code: room.code,
      difficulty: room.difficulty,
      started: room.started,
      host: {
        profile: room.host.profile,
        ready: room.host.ready,
      },
      guest: room.guest
        ? {
            profile: room.guest.profile,
            ready: room.guest.ready,
          }
        : null,
    },
  });

  if (room.host.ws.readyState === WebSocket.OPEN) {
    room.host.ws.send(payload);
  }
  if (room.guest && room.guest.ws.readyState === WebSocket.OPEN) {
    room.guest.ws.send(payload);
  }
}

wss.on("connection", (ws) => {
  /** @type {string | null} */
  let currentRoomCode = null;
  /** @type {"host" | "guest" | null} */
  let clientRole = null;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case "CREATE_ROOM": {
        let code = generateRoomCode();
        while (rooms.has(code)) {
          code = generateRoomCode();
        }

        const room = {
          code,
          difficulty: msg.difficulty || "medium",
          host: {
            ws,
            profile: msg.profile,
            ready: true,
          },
          guest: null,
          started: false,
          createdAt: Date.now(),
        };

        rooms.set(code, room);
        currentRoomCode = code;
        clientRole = "host";

        ws.send(
          JSON.stringify({
            type: "ROOM_CREATED",
            code,
            role: "host",
          }),
        );
        broadcastRoom(room);
        break;
      }

      case "JOIN_ROOM": {
        const targetCode = String(msg.code || "").toUpperCase().trim();
        const room = rooms.get(targetCode);

        if (!room) {
          ws.send(JSON.stringify({ type: "ERROR", message: "Sala não encontrada. Verifique o código." }));
          return;
        }

        if (room.started) {
          ws.send(JSON.stringify({ type: "ERROR", message: "A partida desta sala já foi iniciada." }));
          return;
        }

        if (room.guest && room.guest.ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ERROR", message: "A sala já está cheia (máx. 2 jogadores)." }));
          return;
        }

        room.guest = {
          ws,
          profile: msg.profile,
          ready: false,
        };

        currentRoomCode = targetCode;
        clientRole = "guest";

        ws.send(
          JSON.stringify({
            type: "ROOM_JOINED",
            code: targetCode,
            role: "guest",
          }),
        );
        broadcastRoom(room);
        break;
      }

      case "SET_DIFFICULTY": {
        if (!currentRoomCode || clientRole !== "host") return;
        const room = rooms.get(currentRoomCode);
        if (!room || room.started) return;
        if (msg.difficulty === "easy" || msg.difficulty === "medium" || msg.difficulty === "hard") {
          room.difficulty = msg.difficulty;
          broadcastRoom(room);
        }
        break;
      }

      case "TOGGLE_READY": {
        if (!currentRoomCode) return;
        const room = rooms.get(currentRoomCode);
        if (!room || room.started) return;

        if (clientRole === "host") {
          room.host.ready = !room.host.ready;
        } else if (clientRole === "guest" && room.guest) {
          room.guest.ready = !room.guest.ready;
        }
        broadcastRoom(room);
        break;
      }

      case "START_GAME": {
        if (!currentRoomCode || clientRole !== "host") return;
        const room = rooms.get(currentRoomCode);
        if (!room || !room.guest) return;

        room.started = true;
        const startPayload = JSON.stringify({
          type: "GAME_STARTED",
          difficulty: room.difficulty,
          seed: Date.now(),
        });

        if (room.host.ws.readyState === WebSocket.OPEN) room.host.ws.send(startPayload);
        if (room.guest.ws.readyState === WebSocket.OPEN) room.guest.ws.send(startPayload);
        break;
      }

      case "GAME_PACKET": {
        if (!currentRoomCode) return;
        const room = rooms.get(currentRoomCode);
        if (!room) return;

        // Route packet to peer
        const target = clientRole === "host" ? room.guest?.ws : room.host.ws;
        if (target && target.readyState === WebSocket.OPEN) {
          target.send(
            JSON.stringify({
              type: "GAME_PACKET",
              sender: clientRole,
              data: msg.data,
            }),
          );
        }
        break;
      }

      case "LEAVE_ROOM": {
        handleLeave();
        break;
      }
    }
  });

  function handleLeave() {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;

    if (clientRole === "host") {
      // Host left: notify guest and close room
      if (room.guest && room.guest.ws.readyState === WebSocket.OPEN) {
        room.guest.ws.send(
          JSON.stringify({
            type: "PEER_LEFT",
            message: "O anfitrião encerrou a sala.",
          }),
        );
      }
      rooms.delete(currentRoomCode);
    } else if (clientRole === "guest") {
      // Guest left: inform host
      room.guest = null;
      if (room.host.ws.readyState === WebSocket.OPEN) {
        room.host.ws.send(
          JSON.stringify({
            type: "PEER_LEFT",
            message: "O segundo jogador saiu da sala.",
          }),
        );
        broadcastRoom(room);
      }
    }

    currentRoomCode = null;
    clientRole = null;
  }

  ws.on("close", () => {
    handleLeave();
  });

  ws.on("error", () => {
    handleLeave();
  });
});

server.listen(port, () => {
  console.log(`Server (HTTP + WebSocket Coop) running at http://localhost:${port}`);
});
