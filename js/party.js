// Refonte party.js avec gestion de code de partie, timestamps et corrections
console.log("\u{1F50C} Initialisation du Socket.IO depuis party.js...");

const socket = io("https://blindtest.ida.etu.mmi-unistra.fr", {
  transports: ["websocket"],
  timeout: 5000,
  reconnectionAttempts: 3
});

let startTime = null;
let trackId = null;
let youtubeId = null;
let timestamp = 0;
let correctTitle = null;
let correctSource = null;
let correctAnswer = null;
let gameFinished = false;

// Code récupéré côté serveur (PHP -> JS)
const CODE = "1234"; // À adapter avec session PHP

socket.on("connect", () => {
  console.log("✅ Connexion établie !");
  socket.emit("register-player", { pseudo: PSEUDO, code: CODE });
});

socket.on("connect_error", (err) => {
  console.error("❌ Erreur de connexion Socket.IO :", err);
});

// Host
socket.on("you-are-host", () => {
  console.log("👑 Ce joueur est l'hôte");
  const startBtn = document.getElementById("start-button");
  const resetBtn = document.getElementById("reset-button");

  startBtn.style.display = "block";
  startBtn.onclick = () => {
    startBtn.style.display = "none";
    resetBtn.style.display = "none";
    socket.emit("start-round", { host: PSEUDO, code: CODE });
  };

  resetBtn.onclick = () => {
    resetBtn.style.display = "none";
    socket.emit("reset-tracks", { code: CODE });
    gameFinished = false;
  };
});

socket.on("countdown", ({ message }) => {
  const countdown = document.getElementById("countdown");
  countdown.textContent = message;

  if (message.includes("Toutes les musiques")) {
    gameFinished = true;
    if (isHost()) document.getElementById("reset-button").style.display = "block";
  }
});

function isHost() {
  return document.getElementById("start-button")?.style.display === "none";
}

socket.on("round-started", ({ trackId: id, startTime: sTime, youtubeId: ytId, timestamp: ts, title, source }) => {
  console.log("🎶 Manche lancée :", title);
  trackId = id;
  startTime = sTime;
  youtubeId = ytId;
  timestamp = ts;
  correctTitle = title;
  correctSource = source;
  correctAnswer = null;
  gameFinished = false;

  document.getElementById("reset-button").style.display = "none";
  document.getElementById("answer").value = "";
  document.getElementById("feedback").innerHTML = "";
  document.getElementById("progress-bar").style.width = "0%";
  document.getElementById("progress-label").textContent = "";
  document.getElementById("thumbnail-container").style.display = "none";
  document.getElementById("youtube-thumbnail").src = "";

  const iframe = document.getElementById("youtube-frame");
  iframe.src = `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&start=${timestamp}&controls=0&mute=0`;
  iframe.onload = () => iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");

  document.getElementById("answer-form").style.display = "none";
  document.getElementById("player").style.display = "block";

  startCountdown();
});

function startCountdown() {
  let seconds = 3;
  const countdown = document.getElementById("countdown");
  countdown.textContent = `${seconds}`;

  const interval = setInterval(() => {
    seconds--;
    countdown.textContent = seconds > 0 ? `${seconds}` : "🎵 Devine la musique !";
    if (seconds <= 0) {
      clearInterval(interval);
      startPlaying();
    }
  }, 1000);
}

function startPlaying() {
  const iframe = document.getElementById("youtube-frame");
  iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*");
  document.getElementById("answer-form").style.display = "block";

  let total = 15, elapsed = 0;
  const progress = setInterval(() => {
    elapsed++;
    document.getElementById("progress-bar").style.width = `${(elapsed / total) * 100}%`;
    if (elapsed >= total) {
      clearInterval(progress);
      startRevealing();
    }
  }, 1000);
}

function startRevealing() {
  document.getElementById("answer-form").style.display = "none";
  document.getElementById("youtube-frame").contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");

  const thumb = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  document.getElementById("youtube-thumbnail").src = thumb;
  document.getElementById("thumbnail-container").style.display = "block";
  document.getElementById("countdown").textContent = `${correctTitle} (${correctSource})`;

  setTimeout(() => {
    if (!gameFinished) {
      document.title = "Création de partie";
      document.getElementById("countdown").textContent = "🔁 Nouvelle manche...";
      socket.emit("request-next-round", { code: CODE });
    }
  }, 5000);
}

const form = document.getElementById("answer-form");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const answer = document.getElementById("answer").value.trim();
  const timeTaken = (Date.now() - startTime) / 1000;
  socket.emit("submit-answer", { pseudo: PSEUDO, answer, timeTaken, trackId, code: CODE });
  document.getElementById("answer").value = "";
});

socket.on("correct-answer", ({ pseudo, points, title }) => {
  const feedback = document.getElementById("feedback");
  const label = document.getElementById("progress-label");
  feedback.innerHTML += `<p><strong>${pseudo}</strong> a trouvé ! +${points} pts</p>`;
  if (label.textContent === "") label.textContent = `${pseudo} a trouvé 🎯`;
  if (pseudo === PSEUDO) document.getElementById("answer-form").style.display = "none";
});

socket.on("score-update", (scores) => {
  const ul = document.getElementById("online-list");
  ul.innerHTML = "";
  scores.forEach(({ pseudo, score }) => {
    const li = document.createElement("li");
    li.textContent = `${pseudo} — ${score} pts`;
    ul.appendChild(li);
  });
});
