# Mobile App (Flutter)

Ce dossier contient la version mobile Flutter du projet Artisan Marketplace.

## Prérequis

- Flutter SDK (stable)
- Android Studio / VS Code + extension Flutter

## Installation

1. Ouvrir ce dossier (`mobile/`) comme projet Flutter
2. Lancer:
   - `flutter pub get`

## Exécution

Utiliser `--dart-define` pour l’URL API:

- Android emulator:
  - `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1`
- iOS simulator:
  - `flutter run --dart-define=API_BASE_URL=http://localhost:5000/api/v1`
- Device réel:
  - `flutter run --dart-define=API_BASE_URL=http://<ip-locale-machine>:5000/api/v1`

## Écrans disponibles

- Home
- Artisans
- Products
- Login
- Register

## API utilisée

- `GET /artisans`
- `GET /products`
- `POST /auth/login`
- `POST /auth/register`
- `GET /products/mine` (dashboard artisan)
- `POST /products` (create produit artisan)
- `PUT /products/:id` (edit produit artisan)
- `DELETE /products/:id` (delete produit artisan)
- `GET /artisan/:id` (détail artisan)
- `GET /artisan/:id/ratings` (liste des avis)
- `POST /ratings` (ajouter un avis)
- `PUT /ratings/:id` (modifier son avis)
- `DELETE /ratings/:id` (supprimer son avis)
- `GET /admin/artisans` (dashboard admin)

## Session & rôles

- Le token JWT est persisté localement via `flutter_secure_storage`.
- Les routes dashboards sont protégées côté mobile:
  - `/dashboard/artisan` (role `artisan`)
  - `/dashboard/admin` (role `admin`)

(La suite du CRUD mobile complet et ratings sera branchée dans les prochaines itérations.)

## Recherche / filtres

- Artisans: recherche locale par nom, localisation, bio
- Produits: recherche locale + tri prix + chargement paginé (load more)

## UX mobile

- Skeleton loaders sur les écrans listes/détails clés
- Écrans d’erreur avec action retry
- États vides standardisés

## Images produit

- Le formulaire artisan mobile accepte des URLs images (une par ligne)
- Les miniatures sont affichées dans:
  - dashboard artisan
  - catalogue produits
  - détail artisan
- L’upload fichier natif n’est pas encore branché

## Profil artisan

- Création et mise à jour du profil artisan mobile
- Champs actuels:
  - localisation
  - bio
  - avatar URL

## Modération admin

- Recherche artisan par nom/email
- Suppression artisan
- Suppression produit par ID

## Favoris

- Favoris artisans
- Favoris produits
- Écran dédié `Favoris`

## Navigation principale

- Barre de navigation partagée entre:
  - accueil
  - artisans
  - produits
  - favoris

## Accueil mobile

- Résumé session
- Compteurs favoris
- Accès rapides vers artisans, produits, favoris et dashboards
