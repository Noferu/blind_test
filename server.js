// Refonte complète du serveur Blindtest avec parties privées, gestion fine et améliorations
const express = require("express");
const mysql = require("mysql2/promise");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "https://blindtest.ida.etu.mmi-unistra.fr",
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

const db = mysql.createPool({
  host: "localhost",
  user: "blind_user",
  password: "fort&complexe",
  database: "ida_blindtest"
});

// Serveur de test
app.get("/", (req, res) => {
  res.send("🎧 Serveur Socket.IO opérationnel sur Plesk !");
});

// État des parties (clés : codes)
const parties = {};

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/gi, "");
}

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code;
  do {
    code = "";
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (parties[code]);
  return code;
}

io.on("connection", (socket) => {
  console.log("🔌 Client connecté :", socket.id);

  socket.on("register-player", ({ pseudo, code }) => {
    if (!parties[code]) {
      parties[code] = {
        host: pseudo,
        players: {},
        currentTrack: null,
        alreadyAnswered: [],
        usedTrackIds: [],
        status: "waiting"
      };
    }

    const partie = parties[code];
    partie.players[pseudo] = { score: 0, socket };

    socket.join(code);

    if (pseudo === partie.host) {
      socket.emit("you-are-host");
    }

    updateScoreboard(code);
  });

  socket.on("start-round", async ({ host, code }) => {
    const partie = parties[code];
    if (!partie || host !== partie.host) return;

    await startNextRound(code);
  });

  socket.on("request-next-round", async ({ code }) => {
    await startNextRound(code);
  });

  socket.on("submit-answer", ({ pseudo, answer, timeTaken, trackId, code }) => {
    const partie = parties[code];
    if (!partie || !partie.currentTrack || trackId !== partie.currentTrack.id) return;

    const attempt = normalize(answer);
    const correctTitle = normalize(partie.currentTrack.title);
    const correctSource = normalize(partie.currentTrack.source);
    const acceptedAnswers = [correctTitle, correctSource];

    // Version abrégée (ajouter ici d'autres cas personnalisés)
    if (correctSource.includes("shingeki") && !acceptedAnswers.includes("snk")) {
      acceptedAnswers.push("snk");
    }

    if (partie.alreadyAnswered.includes(pseudo)) return;

    const isCorrect = acceptedAnswers.some(ans => attempt.includes(ans));

    if (isCorrect) {
      partie.alreadyAnswered.push(pseudo);
      const points = Math.max(5 - partie.alreadyAnswered.length + 1, 1);
      partie.players[pseudo].score += points;

      io.to(code).emit("correct-answer", {
        pseudo,
        points,
        title: `${partie.currentTrack.title} (${partie.currentTrack.source})`
      });

      updateScoreboard(code);
    }
  });

  socket.on("reset-tracks", ({ code }) => {
    const partie = parties[code];
    if (!partie) return;

    partie.usedTrackIds = [];
    partie.alreadyAnswered = [];
    partie.currentTrack = null;
    partie.status = "waiting";
    for (const joueur in partie.players) {
      partie.players[joueur].score = 0;
    }
    io.to(code).emit("tracks-reset");
    updateScoreboard(code);
    console.log("🔁 Tracks reset pour la partie", code);
  });

  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(code => {
      const partie = parties[code];
      if (!partie) return;

      const pseudo = Object.keys(partie.players).find(p => partie.players[p].socket.id === socket.id);
      if (pseudo) {
        delete partie.players[pseudo];

        if (pseudo === partie.host) {
          const restants = Object.keys(partie.players);
          if (restants.length) {
            partie.host = restants[0];
            partie.players[restants[0]].socket.emit("you-are-host");
          } else {
            delete parties[code];
            return;
          }
        }

        updateScoreboard(code);
      }
    });
  });
});

async function startNextRound(code) {
  try {
    const partie = parties[code];
    const [rows] = await db.query("SELECT * FROM tracks");
    const unusedTracks = rows.filter(track => !partie.usedTrackIds.includes(track.id));

    if (!unusedTracks.length) {
      io.to(code).emit("countdown", { message: "🎉 Toutes les musiques ont été jouées !" });
      return;
    }

    const track = unusedTracks[Math.floor(Math.random() * unusedTracks.length)];
    const youtubeId = extractYoutubeID(track.youtube_url);
    const timestamp = extractStartTime(track.youtube_url);

    partie.currentTrack = track;
    partie.usedTrackIds.push(track.id);
    partie.alreadyAnswered = [];

    const startTime = Date.now() + 17000;

    io.to(code).emit("round-started", {
      trackId: track.id,
      youtubeId,
      startTime,
      timestamp,
      title: track.title,
      source: track.source
    });
  } catch (e) {
    console.error("❌ Erreur lors du lancement de la manche :", e);
  }
}

function updateScoreboard(code) {
  const partie = parties[code];
  const scoreboard = Object.entries(partie.players).map(([pseudo, data]) => ({
    pseudo,
    score: data.score
  }));
  io.to(code).emit("score-update", scoreboard);
}

function extractYoutubeID(url) {
  const reg = /(?:\?v=|\/embed\/|\.be\/)([^&?/]+)/;
  const match = url.match(reg);
  return match ? match[1] : "";
}

function extractStartTime(url) {
  const reg = /[?&]t=(\d+)/;
  const match = url.match(reg);
  return match ? parseInt(match[1]) : 0;
}

httpServer.listen(() => {
  console.log("✅ Application Node.js lancée sur Plesk !");
});