# API Backend - Application de Gestion des Bons de Livraison Aegean

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts           # Configuration base de données PostgreSQL/Supabase
│   ├── controllers/
│   │   ├── authController.ts     # Authentification et gestion utilisateurs
│   │   ├── blController.ts       # Gestion des bons de livraison
│   │   └── reportController.ts   # Génération de rapports PDF/Excel
│   ├── middleware/
│   │   ├── auth.ts              # Authentification JWT et logs d'activité
│   │   └── index.ts             # Rate limiting, validation, gestion d'erreurs
│   ├── routes/
│   │   ├── auth.ts              # Routes d'authentification
│   │   ├── bl.ts                # Routes des bons de livraison
│   │   ├── reports.ts           # Routes des rapports
│   │   └── index.ts             # Router principal
│   ├── types/
│   │   ├── index.ts             # Types TypeScript pour l'application
│   │   └── excel4node.d.ts      # Déclarations de types pour excel4node
│   ├── validation/
│   │   └── schemas.ts           # Schémas de validation Joi
│   ├── database/
│   │   └── migrate.ts           # Script de migration et initialisation DB
│   └── server.ts                # Serveur Express principal
├── .env                         # Variables d'environnement
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Stack Technologique

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Base de données**: PostgreSQL (Supabase)
- **Authentification**: JWT (jsonwebtoken)
- **Validation**: Joi
- **ORM**: SQL natif avec pg (PostgreSQL driver)
- **Sécurité**: Helmet, CORS, Rate limiting
- **Rapports**: PDFKit (PDF) + excel4node (Excel)
- **Logging**: Winston + Morgan

## 🎯 API Endpoints

### Authentification (`/api/auth`)
- `POST /login` - Connexion utilisateur
- `POST /logout` - Déconnexion
- `GET /profile` - Profil utilisateur
- `PUT /profile` - Mise à jour profil
- `GET /verify` - Vérification token

### Bons de Livraison (`/api/bl`)
- `POST /` - Créer un BL (chauffeur)
- `GET /` - Lister les BL avec pagination/filtres
- `GET /stats` - Statistiques dashboard
- `GET /:id` - Détails d'un BL
- `PUT /:id/validate` - Valider/rejeter un BL (agent)
- `DELETE /:id` - Supprimer un BL (chef)

### Rapports (`/api/reports`)
- `POST /generate` - Générer rapport PDF/Excel
- `GET /` - Lister rapports générés
- `GET /:id/download` - Télécharger rapport

## 🗄️ Schéma de Base de Données

### Tables Principales
- `users` - Utilisateurs (chauffeur, agent, chef)
- `bons_livraison` - Bons de livraison
- `bl_images` - Images des BL
- `ecarts` - Écarts détectés
- `palettes_stockees` - Palettes chez fournisseur
- `activity_logs` - Logs d'activité
- `rapports` - Rapports générés

### Vues
- `dashboard_stats` - Statistiques temps réel
- `bl_complets` - BL avec infos complètes
- `rapport_mensuel` - Vue rapport mensuel

## 🔧 Configuration

### Variables d'Environnement (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:password@host:5432/database
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
API_VERSION=v1

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## 📋 Scripts Disponibles

```bash
# Développement
npm run dev          # Démarrer en mode développement avec nodemon

# Production
npm run build        # Compiler TypeScript
npm start           # Démarrer en production

# Base de données
npm run db:migrate   # Exécuter les migrations
npm run db:seed      # Insérer données de test

# Tests
npm test            # Exécuter les tests
```

## 🔐 Authentification & Autorisation

### Rôles Utilisateur
- **Chauffeur**: Capturer les BL, voir ses propres BL
- **Agent**: Valider/rejeter les BL, générer rapports
- **Chef**: Accès complet, analytics, suppression

### Sécurité
- Tokens JWT avec expiration
- Rate limiting par IP
- Validation stricte des données
- Logs d'activité complets
- Headers de sécurité (Helmet)

## 📊 Fonctionnalités Rapports

### Types de Rapports
- **Mensuel**: Rapport complet du mois
- **Hebdomadaire**: Rapport de la semaine
- **Personnalisé**: Période définie par l'utilisateur

### Formats
- **PDF**: Rapport formaté avec statistiques
- **Excel**: Tableau détaillé avec 5 colonnes obligatoires
  1. N° BL
  2. Montant total
  3. Date préparation
  4. Date réception
  5. Date saisie

## 🏗️ Architecture

### Pattern MVC
- **Models**: Types TypeScript + vues SQL
- **Views**: Réponses JSON structurées
- **Controllers**: Logique métier
- **Middleware**: Authentification, validation, sécurité

### Gestion d'Erreurs
- Middleware global de gestion d'erreurs
- Codes d'erreur PostgreSQL gérés
- Validation Joi avec messages personnalisés
- Logging détaillé

## 🔄 État Actuel

### ✅ Terminé
- [x] Structure complète de l'API
- [x] Authentification JWT
- [x] Contrôleurs complets
- [x] Validation des données
- [x] Middleware de sécurité
- [x] Génération de rapports PDF/Excel
- [x] Schéma de base de données
- [x] Types TypeScript complets

### ⏳ En Cours
- [ ] Connexion à la base de données Supabase
- [ ] Tests de l'API
- [ ] Upload d'images des BL

### 🔮 À Faire
- [ ] Tests unitaires et d'intégration
- [ ] Documentation API (Swagger)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Monitoring et logs

## 🚀 Démarrage Rapide

1. **Installation**
```bash
cd backend
npm install
```

2. **Configuration**
```bash
cp .env.example .env
# Modifier les variables d'environnement
```

3. **Base de données**
```bash
npm run db:migrate
```

4. **Développement**
```bash
npm run dev
```

L'API sera disponible sur http://localhost:3001

## 🔗 Intégration Frontend

L'API est conçue pour s'intégrer parfaitement avec le frontend React créé. 

### Exemple d'utilisation
```typescript
// Connexion
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

// Créer un BL
const blResponse = await fetch('/api/bl', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(blData)
});
```

## 🆘 Support & Contact

Pour toute question technique ou problème:
- Vérifier les logs dans `/logs/app.log`
- Consulter la documentation des endpoints
- Tester avec `/api/health` pour vérifier le statut

---

**Statut**: 🟡 **Backend prêt, connexion DB en cours**  
**Version**: 1.0.0  
**Dernière mise à jour**: 08/08/2025