# Phase 5 -- Mobile Progress (Flutter)

Status: **started**

## Scope livré

- Initialisation de la base projet mobile Flutter (dossier `mobile/`)
- Mise en place d’un client API HTTP réutilisable
- Écrans principaux scaffoldés:
  - `HomeScreen`
  - `ArtisanScreen`
  - `ProductScreen`
  - `LoginScreen`
  - `RegisterScreen`
- Navigation mobile simple prête pour extension
- Persistance de session JWT via `flutter_secure_storage`
- Protection des routes sensibles par rôle (`artisan`, `admin`)
- Dashboards mobiles protégés:
  - `ArtisanDashboardScreen`
  - `AdminDashboardScreen`
- CRUD produit artisan côté mobile livré:
  - création produit
  - modification produit
  - suppression produit
  - lecture via `/products/mine`
- Ratings mobiles livrés:
  - lecture avis artisan (`GET /artisan/:id/ratings`)
  - création avis (`POST /ratings`)
  - modification avis (`PUT /ratings/:id`)
  - suppression avis (`DELETE /ratings/:id`)
  - affichage moyenne + total
- Recherche et filtres mobiles livrés:
  - recherche artisans (nom, lieu, bio)
  - recherche produits (nom, description, artisan)
  - tri produits (récents, prix croissant, prix décroissant)
  - pagination produits côté mobile (`Charger plus`)
- UX mobile standardisée:
  - skeleton loaders réutilisables
  - vues d’erreur avec bouton retry
  - vues vides réutilisables
- Gestion images produit mobile livrée:
  - saisie d’URLs image dans le formulaire produit artisan
  - prévisualisation miniature dans dashboard, catalogue et détail artisan
- Gestion profil artisan mobile livrée:
  - lecture du profil courant
  - création du profil artisan
  - mise à jour du profil artisan
- Modération admin mobile livrée:
  - recherche artisan par nom/email
  - suppression artisan
  - suppression produit par ID
- Favoris / bookmarks mobiles livrés:
  - favoris artisans
  - favoris produits
  - écran dédié favoris
- Navigation principale mobile unifiée:
  - barre de navigation partagée
  - accès direct accueil / artisans / produits / favoris
- Home mobile enrichi:
  - résumé session
  - compteurs favoris
  - accès rapides MVP

## Connexion API

Par défaut, l’app lit l’URL API via `--dart-define`:

- clé: `API_BASE_URL`
- fallback: `http://10.0.2.2:5000/api/v1` (Android emulator)

Exemples:

- Android emulator: `http://10.0.2.2:5000/api/v1`
- iOS simulator: `http://localhost:5000/api/v1`
- Appareil physique: `http://<ip-locale-machine>:5000/api/v1`

## Prochaines tâches mobiles

1. Ajouter état global auth avancé (provider/bloc/riverpod)
2. Ajouter formulaires validation UX complète
3. Ajouter pagination backend artisans (optionnelle)
4. Ajouter upload fichier image réel (Cloudinary/Supabase)
5. Ajouter polish UI mobile final
6. Préparer release build Android/iOS

## Dépendances actuelles

- `http`
- `cupertino_icons`
- `flutter_secure_storage`

## Notes

- Le backend reste la source unique des règles métier.
- Le mobile consomme les mêmes endpoints que le web.
- SQLite reste côté backend en local (temporaire).
