<?php
session_start();

if (!isset($_SESSION['pseudo']) || $_SESSION['code'] !== "1234") {
  header("Location: index.php");
  exit;
}

require_once "php/db.php";

$pseudo = $_SESSION['pseudo'];

// 🔻 Supprimer une musique ajoutée par ce joueur
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
  $track_id = intval($_GET['delete']);
  $stmt = $pdo->prepare("DELETE FROM tracks WHERE id = ? AND added_by = ?");
  $stmt->execute([$track_id, $pseudo]);
  header("Location: add_music.php");
  exit;
}

// 🔺 Ajout d’une musique
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $title = trim($_POST["title"] ?? "");
  $source = trim($_POST["source"] ?? "");
  $youtube_url = trim($_POST["youtube_url"] ?? "");
  $force = isset($_POST["force"]);

  if ($title && $source && $youtube_url) {
    // Vérifier si un titre identique existe déjà
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tracks WHERE title = ?");
    $stmt->execute([$title]);
    $count = $stmt->fetchColumn();

    if ($count > 0 && !$force) {
      $warning = "Une musique avec ce titre existe déjà. Confirme l’ajout si c’est volontaire.";
      $pending = [
        'title' => $title,
        'source' => $source,
        'youtube_url' => $youtube_url
      ];
    } else {
      $stmt = $pdo->prepare("INSERT INTO tracks (title, source, youtube_url, added_by) VALUES (?, ?, ?, ?)");
      $stmt->execute([$title, $source, $youtube_url, $pseudo]);
      $success = "Musique ajoutée avec succès !";
    }
  } else {
    $error = "Merci de remplir tous les champs.";
  }
}

// Récupérer la liste des musiques de ce joueur
$stmt = $pdo->prepare("SELECT * FROM tracks WHERE added_by = ? ORDER BY id DESC");
$stmt->execute([$pseudo]);
$tracks = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8">
  <title>Ajouter des musiques</title>
  <link rel="icon" type="image/x-icon" href="assets/img/blindtest_logo.ico">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">

  <link rel="stylesheet" href="assets/css/reset.css"> <!-- Reset en premier -->
  <link rel="stylesheet" href="assets/css/style.css"> <!-- Style global -->
  <link rel="stylesheet" href="assets/css/add_music.css"> <!-- Spécifique à index -->
</head>

<body>
  <main>
    <h1>Ajouter une musique</h1>

    <div class="content">

      <div class="adding_form">

        <?php if (!empty($error)): ?>
          <p style="color:red"><?= htmlspecialchars($error) ?></p>
        <?php elseif (!empty($success)): ?>
          <p style="color:green"><?= htmlspecialchars($success) ?></p>
        <?php elseif (!empty($warning)): ?>
          <p style="color:orange"><?= htmlspecialchars($warning) ?></p>
        <?php endif; ?>

        <form method="POST">
          <input type="text" name="title" placeholder="Titre de la musique" required value="<?= $pending['title'] ?? '' ?>">
          <input type="text" name="source" placeholder="Anime / Artiste / Œuvre" required value="<?= $pending['source'] ?? '' ?>">
          <input type="url" name="youtube_url" placeholder="Lien YouTube" required value="<?= $pending['youtube_url'] ?? '' ?>">

          <?php if (!empty($warning)): ?>
            <input type="hidden" name="force" value="1">
            <button type="submit">Confirmer l’ajout malgré tout</button>
          <?php else: ?>
            <button type="submit">Ajouter</button>
          <?php endif; ?>
        </form>
      </div>

      <div class="playlist">

        <h2>Tes musiques ajoutées<br/>(en tant que <?= htmlspecialchars($pseudo) ?>)</p>
        </h2>
        <ul>
          <?php foreach ($tracks as $track): ?>
            <li>
              <a href="<?= htmlspecialchars($track['youtube_url']) ?>" target="_blank" title="Voir sur YouTube">
                <strong><?= htmlspecialchars($track['title']) ?></strong>
              </a>
              — <?= htmlspecialchars($track['source']) ?>
              <a href="?delete=<?= $track['id'] ?>" onclick="return confirm('Supprimer cette musique ?')">❌</a>
            </li>
          <?php endforeach; ?>
        </ul>

      </div>

    </div>


  </main>
  <a class="returnHome" href="index.php">⬅️ Retour à l’accueil</a>
</body>

</html>