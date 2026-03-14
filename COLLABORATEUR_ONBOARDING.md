# Onboarding collaborateur (après téléchargement du projet GitHub)

Ce document regroupe toutes les actions à faire pour démarrer rapidement le projet en local.

## 1) Prérequis

- Node.js 20+ recommandé
- npm 10+
- Git
- (Optionnel) Docker Desktop

## 2) Cloner et ouvrir le projet

1. Cloner le dépôt GitHub
2. Ouvrir le dossier racine dans VS Code
3. Vérifier que la structure suivante est présente:
   - backend/
   - web/
   - docs/

## 3) Installer les dépendances

### Backend

- Aller dans backend/
- Lancer: npm install

### Frontend

- Aller dans web/
- Lancer: npm install

## 4) Configurer les variables d’environnement

### Backend

- Copier backend/.env.example vers backend/.env
- Ajuster au minimum:
  - PORT=5000
  - SQLITE_DB_PATH=./data/marketplace.sqlite
  - JWT_SECRET (mettre une valeur forte)
  - CLIENT_ORIGIN=http://localhost:3000
  - ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD

### Frontend

- Copier web/.env.example vers web/.env.local
- Vérifier:
  - NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1

## 5) Démarrage local (mode recommandé)

> Mode actuel du projet: SQLite local (pas besoin de Mongo pour démarrer)

### Lancer l’API

- Dans backend/: npm run dev
- Vérifier la santé API:
  - GET http://localhost:5000/api/v1/health

### Initialiser l’admin

- Dans backend/: npm run seed:admin

### Lancer le web

- Dans web/: npm run dev
- Ouvrir: http://localhost:3000

## 6) Vérifications fonctionnelles minimales

1. Ouvrir la page d’accueil
2. Créer un compte artisan via /register
3. Se connecter via /login
4. Aller sur /dashboard/artisan
5. Vérifier CRUD produit:
   - créer
   - lire dans “Mes produits”
   - modifier
   - supprimer
6. Aller sur /catalog et vérifier l’affichage

## 7) Qualité et validations avant commit

### Frontend

- Dans web/: npm run lint

### Backend (optionnel actuellement)

- Dans backend/: npm test

## 8) Workflow Git conseillé

1. Créer une branche feature:
   - feature/nom-court
2. Commits petits et clairs
3. Pull de la branche principale avant push
4. Ouvrir une Pull Request avec:
   - objectif
   - changements principaux
   - captures UI si impact visuel

## 9) Dépannage rapide

- Erreur CORS:
  - vérifier CLIENT_ORIGIN dans backend/.env
- Frontend vide:
  - vérifier que backend tourne sur 5000
  - vérifier NEXT_PUBLIC_API_BASE_URL
- Erreur JWT/401:
  - se reconnecter
  - vérifier JWT_SECRET non vide
- Port occupé:
  - changer PORT backend ou port web

## 10) Documents projet utiles

- Roadmap: artisan_marketplace_roadmap.md
- README: README.md
- Progression backend: docs/phase2_backend_progress.md
- Progression web: docs/phase4_web_progress.md
- Sécurité: docs/phase6_security_progress.md
- Postman: docs/postman/Artisan Marketplace API.postman_collection.json

## 11) État du scope

- Inclus: Web + API
- Temporaire: SQLite local
- Reporté: mobile

---

Si tu arrives à l’étape 6 sans blocage, ton environnement est prêt pour contribuer.
