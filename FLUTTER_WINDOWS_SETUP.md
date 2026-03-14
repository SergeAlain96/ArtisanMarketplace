# Installer Flutter sur Windows et lancer le test mobile

Ce guide sert à rendre la version mobile exécutable sur cette machine Windows.

## 1. Installer Flutter SDK

1. Télécharger Flutter SDK pour Windows depuis le site officiel Flutter.
2. Décompresser le dossier dans un chemin simple, par exemple:
   - `C:\src\flutter`
3. Vérifier que le fichier suivant existe:
   - `C:\src\flutter\bin\flutter.bat`

## 2. Ajouter Flutter au PATH Windows

Ajouter ce dossier au `PATH` utilisateur ou système:

- `C:\src\flutter\bin`

### Méthode rapide

1. Ouvrir **Paramètres système avancés**
2. Aller dans **Variables d'environnement**
3. Modifier la variable `Path`
4. Ajouter:
   - `C:\src\flutter\bin`
5. Fermer puis rouvrir VS Code

## 3. Vérifier l'installation

Dans un nouveau terminal PowerShell, exécuter:

- `flutter --version`
- `flutter doctor`

Objectif:
- la commande `flutter` doit être reconnue
- `flutter doctor` doit indiquer les composants manquants éventuels

## 4. Installer les dépendances Android minimales

Pour lancer l'application sur Android, il faut aussi:

1. Installer Android Studio
2. Installer:
   - Android SDK
   - Android SDK Platform
   - Android SDK Command-line Tools
   - Android Emulator
3. Accepter les licences si demandé via:
   - `flutter doctor --android-licenses`

## 5. Vérifier les appareils disponibles

Dans le dossier mobile, exécuter:

- `flutter devices`

Résultat attendu:
- un émulateur Android
- ou un appareil physique connecté
- ou Chrome/Windows si la cible est activée

## 6. Installer les dépendances du projet mobile

Depuis le dossier [mobile](mobile):

- `flutter pub get`

## 7. Vérifier que le backend tourne

Le mobile consomme l'API backend.
Il faut donc démarrer le backend avant le test.

URL API attendue côté mobile:

- Android emulator: `http://10.0.2.2:5000/api/v1`
- iOS simulator: `http://localhost:5000/api/v1`
- appareil réel: `http://<ip-locale-machine>:5000/api/v1`

## 8. Lancer l'application mobile

Depuis le dossier [mobile](mobile):

### Android emulator
- `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1`

### iOS simulator
- `flutter run --dart-define=API_BASE_URL=http://localhost:5000/api/v1`

### Appareil physique
- `flutter run --dart-define=API_BASE_URL=http://<ip-locale-machine>:5000/api/v1`

## 9. Parcours de test conseillé

Une fois l'application lancée:

1. Ouvrir l'accueil
2. Vérifier la navigation du bas:
   - Accueil
   - Artisans
   - Produits
   - Favoris
3. Tester la liste des artisans
4. Tester la liste des produits
5. Créer un compte ou se connecter
6. Tester selon le rôle:
   - artisan: dashboard artisan + profil artisan + CRUD produit
   - admin: dashboard admin
   - user: consultation + avis + favoris

## 10. Si Flutter n'est toujours pas reconnu

Dans PowerShell, fermer complètement VS Code puis rouvrir.
Ensuite re-tester:

- `flutter --version`

Si besoin, vérifier manuellement que ce fichier existe:

- `C:\src\flutter\bin\flutter.bat`

## Fichier lié

Voir aussi [mobile/README.md](mobile/README.md) pour les détails d'exécution du projet mobile.
