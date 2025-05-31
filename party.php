<?php
session_start();

$pseudo = $_SESSION['pseudo'] ?? null;
$code = $_SESSION['code'] ?? null;

if (!$pseudo || $code !== "1234") {
  header("Location: index.php");
  exit;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Création de partie</title>
  <link rel="icon" href="assets/img/blindtest_logo.ico" type="image/x-icon">
  <link rel="stylesheet" href="assets/css/reset.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/party.css">
</head>
<body>
  <div class="layout">
    <main>
      <h1>Blind & Test</h1>

      <div class="main-content">

        <!-- Bouton du host -->
        <button id="start-button" style="display:none;"><i class="bi bi-play-fill"></i> Lancer la partie</button>

        <button id="reset-button" style="display:none">🔁 Relancer la partie</button>

        <!-- Compte à rebours -->
        <div id="countdown"></div>

        <!-- Barre de progression -->
        <div id="progress-container">
          <div id="progress-bar"></div>
          <span id="progress-label"></span>
        </div>

        <!-- Lecteur YouTube masqué -->
        <div id="player">
          <iframe id="youtube-frame"
                  src=""
                  allow="autoplay; encrypted-media"
                  allowfullscreen>
          </iframe>
        </div>

        <!-- Formulaire de réponse -->
        <form id="answer-form">
          <input type="text" name="answer" id="answer" placeholder="Ta réponse ici" required>
          <button type="submit"><i class="bi bi-send"></i> Valider</button>
        </form>

        <!-- Zone de feedback -->
        <p id="feedback"></p>

        <!-- Miniature et titre à la fin -->
        <div id="thumbnail-container">
          <img id="youtube-thumbnail" src="" alt="Miniature">
          <h3 id="track-title"></h3>
        </div>
      </div>
    </main>

    <aside>
      <h2>Joueurs en ligne</h2>
      <ul id="online-list">
        <li>Chargement...</li>
      </ul>
    </aside>
  </div>

  <a class="returnHome" href="index.php">⬅️ Retour à l’accueil</a>

  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
  <script>
    const PSEUDO = "<?= htmlspecialchars($pseudo) ?>";
  </script>
  <script src="js/party.js"></script>
</body>
</html>
