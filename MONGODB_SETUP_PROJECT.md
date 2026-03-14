# Passer la base de données du projet sur MongoDB

Ce document explique comment utiliser MongoDB pour ce projet, et surtout ce qu'il faut changer dans le code pour que MongoDB devienne la base active.

## Point important

À l'heure actuelle, le backend tourne réellement sur **SQLite**.

Cela se voit dans :
- [backend/src/config/db.js](backend/src/config/db.js)
- [backend/src/config/env.js](backend/src/config/env.js)
- [backend/src/modules/auth/auth.routes.js](backend/src/modules/auth/auth.routes.js)
- [backend/src/modules/artisans/artisans.routes.js](backend/src/modules/artisans/artisans.routes.js)
- [backend/src/modules/products/products.routes.js](backend/src/modules/products/products.routes.js)
- [backend/src/modules/ratings/ratings.routes.js](backend/src/modules/ratings/ratings.routes.js)
- [backend/src/modules/admin/admin.routes.js](backend/src/modules/admin/admin.routes.js)

Le projet contient déjà des modèles Mongoose, mais ils ne pilotent pas encore le runtime actuel :
- [backend/src/modules/users/user.model.js](backend/src/modules/users/user.model.js)
- [backend/src/modules/artisans/artisan-profile.model.js](backend/src/modules/artisans/artisan-profile.model.js)
- [backend/src/modules/products/product.model.js](backend/src/modules/products/product.model.js)
- [backend/src/modules/ratings/rating.model.js](backend/src/modules/ratings/rating.model.js)

Donc :
- **mettre une URI MongoDB dans `.env` ne suffit pas**
- il faut aussi **basculer la couche d'accès aux données** de SQLite vers Mongoose/MongoDB

---

## 1. Choisir la cible MongoDB

Deux options simples :

### Option A -- MongoDB Atlas

Recommandé si vous voulez une base distante.

Étapes :
1. Créer un compte sur MongoDB Atlas
2. Créer un cluster
3. Créer un utilisateur base de données
4. Autoriser votre IP dans **Network Access**
5. Récupérer l'URI de connexion

Exemple :

`mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/artisan_marketplace?retryWrites=true&w=majority`

### Option B -- MongoDB local

Si vous voulez tout faire en local.

Exemple d'URI local :

`mongodb://127.0.0.1:27017/artisan_marketplace`

---

## 2. Préparer les variables d'environnement

Le backend lit déjà `MONGODB_URI` dans [backend/src/config/env.js](backend/src/config/env.js).

Créer ou modifier le fichier `.env` du backend avec au minimum :

```env
PORT=5000
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
JWT_ISSUER=artisan-marketplace-api
JWT_AUDIENCE=artisan-marketplace-web
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/artisan_marketplace
```

Si vous utilisez Atlas :

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/artisan_marketplace?retryWrites=true&w=majority
```

---

## 3. Vérifier les dépendances

Le package `mongoose` est déjà présent dans [backend/package.json](backend/package.json).

Donc en principe il n'y a rien à ajouter pour la partie ODM.

---

## 4. Remplacer la connexion SQLite par une connexion MongoDB

Le point actuel à modifier est [backend/src/config/db.js](backend/src/config/db.js).

Aujourd'hui ce fichier :
- ouvre une base SQLite
- crée les tables SQLite
- retourne une instance `sqlite`

Pour MongoDB, il faut :
- importer `mongoose`
- utiliser `env.mongodbUri`
- connecter `mongoose`
- supprimer la logique de création de tables SQLite

### Ce que doit faire `connectDatabase()` avec MongoDB

Comportement attendu :
1. lire `env.mongodbUri`
2. vérifier qu'il existe
3. appeler `mongoose.connect(env.mongodbUri)`
4. logguer que MongoDB est connecté
5. ne plus retourner d'instance SQLite

### Exemple de logique cible

```js
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI manquant');
  }

  await mongoose.connect(env.mongodbUri);
  console.log('MongoDB connected');
}
```

---

## 5. Basculer les routes du SQL vers Mongoose

C'est la partie la plus importante.

Actuellement, les routes utilisent `getDb()` puis exécutent des requêtes SQL du type :
- `SELECT`
- `INSERT INTO`
- `UPDATE`
- `DELETE`

Pour MongoDB, il faut remplacer cela par des appels Mongoose.

### Fichiers à migrer

#### Auth
- [backend/src/modules/auth/auth.routes.js](backend/src/modules/auth/auth.routes.js)

Remplacements typiques :
- `SELECT id FROM users WHERE email = ?`
  → `User.findOne({ email })`
- `INSERT INTO users ...`
  → `User.create(...)`
- `SELECT ... WHERE id = ?`
  → `User.findById(...)`

#### Artisans
- [backend/src/modules/artisans/artisans.routes.js](backend/src/modules/artisans/artisans.routes.js)

Remplacements typiques :
- création profil → `ArtisanProfile.create(...)`
- mise à jour profil → `ArtisanProfile.findOneAndUpdate(...)`
- liste artisans → `ArtisanProfile.find(...).populate('userId', 'name email role')`
- détail artisan → profil + produits liés

#### Produits
- [backend/src/modules/products/products.routes.js](backend/src/modules/products/products.routes.js)

Remplacements typiques :
- `INSERT INTO products ...`
  → `Product.create(...)`
- `SELECT ... FROM products`
  → `Product.find(...)`
- `UPDATE products SET ...`
  → `Product.findByIdAndUpdate(...)`
- `DELETE FROM products WHERE id = ?`
  → `Product.findByIdAndDelete(...)`

#### Ratings
- [backend/src/modules/ratings/ratings.routes.js](backend/src/modules/ratings/ratings.routes.js)

Remplacements typiques :
- création avis → `Rating.create(...)`
- liste avis → `Rating.find({ artisanId }).populate('userId', 'name')`
- update avis → `Rating.findByIdAndUpdate(...)`
- delete avis → `Rating.findByIdAndDelete(...)`

#### Admin
- [backend/src/modules/admin/admin.routes.js](backend/src/modules/admin/admin.routes.js)

Remplacements typiques :
- liste artisans avec stats → requêtes Mongoose + `countDocuments()`
- suppression artisan → supprimer `User`, `ArtisanProfile`, `Product`, `Rating`
- suppression produit → `Product.findByIdAndDelete(...)`

---

## 6. Correspondance SQLite -> MongoDB

### Table `users`

Collection MongoDB : `users`

Champs principaux :
- `name`
- `email`
- `password`
- `role`
- `createdAt`

Le modèle existe déjà dans [backend/src/modules/users/user.model.js](backend/src/modules/users/user.model.js).

### Table `artisan_profiles`

Collection MongoDB : `artisanprofiles` ou équivalent selon Mongoose

Champs principaux :
- `userId`
- `bio`
- `location`
- `avatarUrl`

Le modèle existe déjà dans [backend/src/modules/artisans/artisan-profile.model.js](backend/src/modules/artisans/artisan-profile.model.js).

### Table `products`

Collection MongoDB : `products`

Champs principaux :
- `artisanId`
- `name`
- `description`
- `price`
- `images`
- `createdAt`

Le modèle existe déjà dans [backend/src/modules/products/product.model.js](backend/src/modules/products/product.model.js).

### Table `ratings`

Collection MongoDB : `ratings`

Champs principaux :
- `userId`
- `artisanId`
- `rating`
- `comment`
- `createdAt`

Le modèle existe déjà dans [backend/src/modules/ratings/rating.model.js](backend/src/modules/ratings/rating.model.js).

---

## 7. Adapter les identifiants

Avec SQLite, plusieurs routes manipulent des IDs numériques.

Avec MongoDB, les IDs deviennent des `ObjectId` sous forme de chaînes hexadécimales.

Il faut donc revoir :
- les validations `Number(...)`
- les comparaisons d'IDs numériques
- les paramètres d'URL qui supposent des entiers

Exemples de points à vérifier :
- `req.user.id`
- `req.params.id`
- `req.params.artisanId`
- les contrôles de propriété d'un produit ou d'un avis

En MongoDB, on compare souvent :
- `doc._id.toString()`
- `doc.userId.toString()`
- `doc.artisanId.toString()`

---

## 8. Adapter les réponses API

Le frontend web et le mobile consomment actuellement un format qui expose souvent un champ `_id` logique, même quand SQLite est utilisé.

Pendant la migration, il faut préserver autant que possible le contrat API existant.

Conseils :
- continuer à renvoyer `_id`
- conserver les mêmes noms de champs métier
- éviter de casser les payloads du web et du mobile

---

## 9. Migrer les données existantes de SQLite vers MongoDB

Si vous avez déjà des données utiles dans SQLite, il faut faire une migration.

Méthode simple :
1. lire les données SQLite
2. transformer les champs
3. insérer dans MongoDB avec Mongoose

Ordre conseillé :
1. `users`
2. `artisan_profiles`
3. `products`
4. `ratings`

Attention :
- les clés étrangères SQLite deviennent des références MongoDB
- il faudra reconstruire les liaisons `userId`, `artisanId`

Le plus simple est d'écrire un script de migration dédié, par exemple :
- `backend/src/scripts/migrate-sqlite-to-mongo.js`

---

## 10. Tester après migration

Une fois MongoDB branché, vérifier au minimum :

### Auth
- inscription
- connexion
- `/auth/me`

### Artisans
- création profil artisan
- mise à jour profil
- liste artisans
- détail artisan

### Produits
- création produit
- lecture catalogue
- lecture `/products/mine`
- modification produit
- suppression produit

### Ratings
- création avis
- modification avis
- suppression avis
- lecture des avis d'un artisan

### Admin
- liste artisans
- suppression artisan
- suppression produit

---

## 11. Ordre de migration recommandé

Pour éviter de casser tout le projet, faire dans cet ordre :

1. connecter MongoDB dans [backend/src/config/db.js](backend/src/config/db.js)
2. migrer `auth.routes.js`
3. migrer `artisans.routes.js`
4. migrer `products.routes.js`
5. migrer `ratings.routes.js`
6. migrer `admin.routes.js`
7. tester le backend
8. tester le web
9. tester le mobile

---

## 12. Résumé franc

### Si l'objectif est juste de préparer MongoDB
Il suffit de :
- créer la base MongoDB
- ajouter `MONGODB_URI` dans `.env`

### Si l'objectif est de faire vraiment tourner ce projet sur MongoDB
Il faut aussi :
- remplacer la connexion SQLite dans [backend/src/config/db.js](backend/src/config/db.js)
- remplacer les requêtes SQL des routes par des requêtes Mongoose
- vérifier toute la gestion des IDs
- revalider les endpoints web et mobile

---

## 13. Fichiers utiles à consulter

- [backend/src/config/env.js](backend/src/config/env.js)
- [backend/src/config/db.js](backend/src/config/db.js)
- [backend/package.json](backend/package.json)
- [backend/src/modules/users/user.model.js](backend/src/modules/users/user.model.js)
- [backend/src/modules/artisans/artisan-profile.model.js](backend/src/modules/artisans/artisan-profile.model.js)
- [backend/src/modules/products/product.model.js](backend/src/modules/products/product.model.js)
- [backend/src/modules/ratings/rating.model.js](backend/src/modules/ratings/rating.model.js)
- [backend/src/modules/auth/auth.routes.js](backend/src/modules/auth/auth.routes.js)
- [backend/src/modules/artisans/artisans.routes.js](backend/src/modules/artisans/artisans.routes.js)
- [backend/src/modules/products/products.routes.js](backend/src/modules/products/products.routes.js)
- [backend/src/modules/ratings/ratings.routes.js](backend/src/modules/ratings/ratings.routes.js)
- [backend/src/modules/admin/admin.routes.js](backend/src/modules/admin/admin.routes.js)

---

## 14. Conclusion

Le projet est **préparé partiellement** pour MongoDB, car `mongoose` et les modèles existent déjà.

Mais la base active est encore SQLite.

Donc la mise en place MongoDB demande une **vraie migration backend**, pas seulement un changement de variable d'environnement.
