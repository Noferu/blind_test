# Blindtest Musical Multijoueur

![Preview](blindtest-preview.webp)

## 🎧 Description

Blindtest musical multijoueur développé en Node.js, Socket.IO, PHP et MySQL.  
Ce projet personnel vise à expérimenter l’interactivité en temps réel côté web, en permettant à plusieurs joueurs de rejoindre une partie, écouter des extraits musicaux (via YouTube) et cumuler des points selon leurs réponses.  
Le projet est hébergé sur Plesk, combinant à la fois un serveur Node.js et un back PHP.

---

## 🚀 Fonctionnalités principales

- Gestion de parties multijoueurs avec codes de session
- Intégration d’extraits musicaux YouTube (embed API)
- Système de score en temps réel
- Ajout de musiques et création de parties via interface PHP/MySQL
- Hébergement sur serveur Plesk avec configuration Node.js

---

## 🛠️ Technologies utilisées

- **Frontend** : HTML5, CSS3, JavaScript
- **Backend** : Node.js, Express, Socket.IO
- **Base de données** : PHP, MySQL
- **Autres** : API YouTube Embed, Git, Plesk

---

## 📦 Installation

### Prérequis

- Node.js >= 18.x
- PHP >= 8.x
- MySQL

### Étapes

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/<votre-utilisateur>/blindtest-multiplayer.git
   cd blindtest-multiplayer
   ```

2. Installez les dépendances Node.js :

   ```bash
   npm install
   ```

3. Configurez la base de données :

   * Créez la base MySQL.
   * Importez le fichier `bdd_blindtest.sql` (non inclus ici, à préparer).
   * Mettez à jour les identifiants dans `config.php`.

4. Démarrez le serveur Node.js :

   ```bash
   node server.js
   ```

5. Configurez votre hébergement (Plesk) :

   * Assurez-vous que Node.js est activé.
   * Placez vos fichiers PHP et statiques sur le bon domaine/sous-domaine.
   * Ouvrez les bons ports si nécessaire.

---

## 📂 Structure du projet

```
/blindtest-multiplayer
├── assets/
├── config/
├── database/
├── include/
├── pages/
├── templates/
├── server.js
├── package.json
├── index.php
├── .htaccess
└── README.md
```

---

## 🔍 Points techniques intéressants

* Utilisation avancée de Socket.IO pour synchroniser les réponses des joueurs en temps réel.
* Combinaison PHP + Node.js sur un même projet.
* Gestion sécurisée des sessions et des points.
* Intégration et manipulation dynamique de l’API YouTube Embed.

---

## 💡 Améliorations futures

* Refonte de l’interface utilisateur (plus moderne et responsive).
* Ajout d’un système de leaderboard permanent.
* Mise en place de tests unitaires pour la logique serveur.
* Optimisation des performances réseau pour les grandes parties.

---

## 📜 Licence

Ce projet est sous licence MIT — voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

© 2025 Nawfel IDA-ALI OU LAHSEN
[Portfolio](https://nawfel-portfolio.com) | [LinkedIn](https://linkedin.com/in/nawfel) | [GitHub](https://github.com/<votre-utilisateur>)
