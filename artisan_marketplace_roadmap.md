# Artisan Marketplace -- Development Roadmap (10 Days)

> Current scope: **Web + REST API only**. Mobile app is intentionally postponed.
> Local runtime note: **SQLite is used temporarily** for development convenience.

## Project Overview

Build a **Fullstack Artisan Marketplace** with:

-   Web App
-   Mobile App
-   REST API Backend

### Required Stack

-   Backend: NodeJS (Express or NestJS)
-   Frontend Web: ReactJS or NextJS
-   Mobile: Flutter
-   Database: MongoDB / Firebase / Supabase
-   Authentication: JWT or Firebase Auth
-   Deployment required

### Mandatory Features

-   Role-based authentication
-   CRUD operations
-   REST API documentation
-   Responsive UI
-   Basic security best practices

------------------------------------------------------------------------

# Global Architecture

Mobile App (Flutter) \| \| Web App (NextJS / React) \| \| REST API
(NodeJS / Express) \| \| Database (MongoDB)

## Current Architecture (Active)

Web App (NextJS / React) \| \| REST API (NodeJS / Express) \| \|
Database (MongoDB)

------------------------------------------------------------------------

# PHASE 1 --- Project Planning & Architecture (Day 1)

### Phase 1 Status (started)

-   Scope validated (mobile deferred)
-   Architecture foundations documented
-   Data model and role matrix specified
-   See [docs/phase1_foundation.md](docs/phase1_foundation.md)

## Define User Roles

### Admin

-   Moderate artisans
-   Moderate products
-   Manage the platform

### Artisan

-   Create profile
-   Add and manage products
-   View ratings

### Customer / User

-   Browse artisans
-   Browse products
-   Leave ratings

## Define Main Database Models

### User

-   id
-   name
-   email
-   password
-   role (admin \| artisan \| user)

### ArtisanProfile

-   id
-   userId
-   bio
-   location
-   avatar

### Product

-   id
-   artisanId
-   name
-   description
-   price
-   images
-   createdAt

### Rating

-   id
-   userId
-   artisanId
-   rating
-   comment

------------------------------------------------------------------------

# PHASE 2 --- Backend Development (Day 2--4)

### Phase 2 Status (started)

-   Backend scaffold completed
-   Core endpoints implemented (auth, artisans, products, ratings, admin)
-   Security middlewares and MongoDB integration enabled
-   Swagger documentation completed for mandatory endpoint groups

## Day 2 --- Authentication System

Endpoints

POST /auth/register\
POST /auth/login\
GET /auth/me

Features - JWT authentication - Password hashing with bcrypt - Role
management - Auth middleware

------------------------------------------------------------------------

## Day 3 --- Artisan Profile System

Endpoints

POST /artisan/profile\
GET /artisans\
GET /artisan/:id\
PUT /artisan/profile

Features - Create artisan profile - Edit artisan profile - List
artisans - View artisan details

------------------------------------------------------------------------

## Day 4 --- Products & Ratings

### Product Endpoints

POST /products\
GET /products\
GET /products/:id\
PUT /products/:id\
DELETE /products/:id

Features - Add product - Edit product - Delete product - View product
catalog

### Rating Endpoints

POST /ratings\
GET /artisan/:id/ratings

Features - Users can rate artisans - Users can leave reviews

------------------------------------------------------------------------

# PHASE 3 --- Admin Moderation (Day 5)

### Phase 3 Status (started)

-   Admin moderation routes enabled and secured
-   Artisan moderation listing supports pagination/search/metrics
-   Moderation delete endpoints return moderation summaries
-   See [docs/phase3_admin_moderation_progress.md](docs/phase3_admin_moderation_progress.md)

Admin endpoints

GET /admin/artisans\
DELETE /admin/artisan/:id\
DELETE /admin/product/:id

Features - View all artisans - Delete inappropriate content - Platform
moderation

------------------------------------------------------------------------

# PHASE 4 --- Frontend Web Development (Day 6--7)

### Phase 4 Status (started)

-   Next.js web app scaffold initialized
-   Main pages created (home, catalog, auth, artisan/admin dashboards)
-   Core UI components implemented
-   Backend API integration layer added
-   Role-based dashboard access added on client side
-   Server-side route protection added via Next.js middleware
-   Admin moderation actions integrated into dashboard UI
-   See [docs/phase4_web_progress.md](docs/phase4_web_progress.md)

## Main Pages

### Home Page

-   List of artisans

### Artisan Profile Page

-   Artisan information
-   Product list
-   Ratings

### Product Catalog

### Login / Register

### Artisan Dashboard

-   Add products
-   Edit products
-   Manage catalog

### Admin Dashboard

-   Moderation panel

## Core UI Components

-   Navbar
-   ArtisanCard
-   ProductCard
-   RatingStars
-   ProductForm

------------------------------------------------------------------------

# PHASE 5 --- Mobile App Development (Day 8)

Flutter Screens

-   HomeScreen
-   ArtisanScreen
-   ProductScreen
-   LoginScreen
-   RegisterScreen

API Calls

-   GET artisans
-   GET products
-   POST rating

------------------------------------------------------------------------

# PHASE 6 --- Security & Optimization (Day 9)

### Phase 6 Status (started)

-   API hardening applied (hpp, compression, strict JSON body size, trust proxy)
-   Global and auth-specific rate limiting configured
-   JWT claims hardening (issuer/audience/algorithm)
-   Password policy strengthened on registration
-   See [docs/phase6_security_progress.md](docs/phase6_security_progress.md)

Security Checklist

-   Password hashing (bcrypt)
-   JWT authentication middleware
-   Request validation (Joi or Zod)
-   CORS configuration
-   Rate limiting

------------------------------------------------------------------------

# PHASE 7 --- Deployment (Day 10)

## Backend

Deploy using: - Render - Railway

## Frontend

Deploy using: - Vercel

## Database

-   MongoDB Atlas

## Mobile

-   Build APK / App bundle

------------------------------------------------------------------------

# API Documentation

Use **Swagger** to document all routes.

Required documented endpoints:

/auth\
/artisans\
/products\
/ratings\
/admin

------------------------------------------------------------------------

# Bonus Features (Optional but impressive)

-   Artisan search
-   Category filters
-   Product image upload (Cloudinary)
-   Pagination
-   Favorite artisans/products

------------------------------------------------------------------------

# Key Priorities

Focus first on:

1.  Authentication
2.  Product CRUD
3.  Rating system
4.  Admin moderation

If these work correctly, the core of the project is complete.
