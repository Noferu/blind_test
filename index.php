<?php
session_start();
require_once "php/db.php";

$pseudo = $_SESSION['pseudo'] ?? null;
$code = $_SESSION['code'] ?? null;
$error = null;

// Nombre de sons dans la base
$trackCount = $pdo->query("SELECT COUNT(*) FROM tracks")->fetchColumn();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $pseudo_input = trim($_POST["pseudo"] ?? "");
  $code_input = trim($_POST["code"] ?? "");

  if ($pseudo_input === "") {
    $error = "Merci d'entrer un pseudo.";
  } elseif ($code_input !== "1234") {
    $error = "Code ami incorrect.";
  } else {
    $_SESSION["pseudo"] = $pseudo_input;
    $_SESSION["code"] = $code_input;
    $pseudo = $pseudo_input;
    $code = $code_input;
  }
}
?>

<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8">
  <title>Blind & Test</title>
  <link rel="icon" type="image/x-icon" href="assets/img/blindtest_logo.ico">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
  <link rel="stylesheet" href="assets/css/reset.css"> <!-- Reset en premier -->
  <link rel="stylesheet" href="assets/css/style.css"> <!-- Style global -->
  <link rel="stylesheet" href="assets/css/index.css"> <!-- Spécifique à index -->
</head>

<body>
  <main>
    <div class="container">
      <div class="title">
        <img src="assets/img/blindtest_logo.svg" alt="Logo Blind & Test">
        <h1>Blind & Test</h1>
      </div>

      <?php if ($pseudo && $code === "1234"): ?>
        <div class="main-content">
          <p>Bienvenue <strong><?= htmlspecialchars($pseudo) ?></strong> 👋</p>

          <div class="forms">
            <form action="party.php" method="get">
              <button type="submit"><i class="bi bi-box-arrow-in-right"></i>Accéder à la partie</button>
            </form>

            <form action="add_music.php" method="get">
              <button type="submit"><i class="bi bi-plus"></i>Ajouter des musiques</button>
            </form>
          </div>
        </div>
      <?php else: ?>
        <?php if ($error): ?>
          <p class="error"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>

        <form method="POST">
          <label for="pseudo">Ton pseudo :</label>
          <input type="text" id="pseudo" name="pseudo" required>

          <label for="code">Code ami :</label>
          <input type="text" id="code" name="code" required>

          <button type="submit">Valider</button>
        </form>
      <?php endif; ?>

      <p class="track-count">Il y a actuellement <strong><?= $trackCount ?></strong> musiques dans la playlist.</p>
    </div>
  </main>
</body>

</html>
