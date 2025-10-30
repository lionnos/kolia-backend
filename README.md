# KOLIA Backend API

Backend Node.js + Express pour l'application de livraison KOLIA à Bukavu.

## 🚀 Fonctionnalités

- **Authentification JWT** avec rôles (Client, Restaurant, Livreur, Admin)
- **CRUD complet** pour restaurants, plats et commandes
- **Gestion des paiements** avec intégration CinetPay
- **Notifications WhatsApp** (mock API en développement)
- **Upload d'images** avec Cloudinary
- **Commission automatique** de 15% sur chaque commande
- **API RESTful** complète avec validation des données
- **Base de données PostgreSQL** via Supabase

## 📋 Prérequis

- Node.js 16+ 
- npm ou yarn
- Compte Supabase
- Compte Cloudinary (optionnel)
- Compte CinetPay (optionnel)

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
```bash
cp .env.example .env
```

Remplir le fichier `.env` avec vos configurations :

```env
# Configuration de base
NODE_ENV=development
PORT=5000

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Autres configurations...
```

4. **Créer les tables de base de données**
```bash
npm run migrate
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'API sera accessible sur `http://localhost:5000`

## 📚 Documentation API

### Authentification

#### Inscription
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jean Mukamba",
  "email": "jean@example.com",
  "password": "motdepasse123",
  "phone": "+243970123456",
  "address": "Quartier Nyawera, Bukavu",
  "role": "client"
}
```

#### Connexion
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "jean@example.com",
  "password": "motdepasse123"
}
```

#### Profil utilisateur
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

### Restaurants

#### Lister les restaurants
```bash
GET /api/restaurants
GET /api/restaurants?commune=Ibanda&category=Congolais
```

#### Détails d'un restaurant
```bash
GET /api/restaurants/:id
```

#### Créer un restaurant (Restaurateur)
```bash
POST /api/restaurants
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Kivu Raha",
  "description": "Spécialités congolaises authentiques",
  "address": "Avenue nkafu, Bagira",
  "phone": "+243970123456",
  "commune": "Bagira",
  "category": "Cuisine Congolaise",
  "delivery_fee": 5000
}
```

### Plats

#### Lister les plats
```bash
GET /api/dishes
GET /api/dishes?restaurant_id=1&category=Plats principaux
```

#### Rechercher des plats
```bash
GET /api/dishes/search?q=poulet&commune=Ibanda
```

#### Créer un plat (Restaurateur)
```bash
POST /api/dishes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Poulet Moambé",
  "description": "Poulet traditionnel en sauce moambé",
  "price": 38970,
  "category": "Plats principaux",
  "preparation_time": 30,
  "is_spicy": true,
  "ingredients": "Poulet, sauce moambé, épices"
}
```

### Commandes

#### Créer une commande (Client)
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurant_id": 1,
  "items": [
    {
      "dish_id": 101,
      "quantity": 2,
      "price": 38970
    }
  ],
  "delivery_address": "Quartier Nyawera, Bukavu",
  "phone": "+243970111222",
  "payment_method": "mobile",
  "notes": "Livraison rapide svp"
}
```

#### Mes commandes (Client)
```bash
GET /api/orders/my-orders
Authorization: Bearer <token>
```

#### Commandes du restaurant (Restaurateur)
```bash
GET /api/orders/restaurant/:restaurantId
Authorization: Bearer <token>
```

#### Mettre à jour le statut d'une commande
```bash
PATCH /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "preparing"
}
```

### Paiements

#### Initialiser un paiement
```bash
POST /api/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 1,
  "amount": 82940,
  "currency": "CDF"
}
```

#### Vérifier un paiement
```bash
POST /api/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "transaction_id": "KOLIA_1_1234567890"
}
```

### Upload d'images

#### Upload d'une image
```bash
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <fichier_image>
```

## 🔐 Authentification et Autorisation

L'API utilise JWT pour l'authentification. Incluez le token dans l'en-tête :

```
Authorization: Bearer <votre_token_jwt>
```

### Rôles disponibles :
- **client** : Peut passer des commandes
- **restaurant** : Peut gérer son restaurant et ses plats
- **livreur** : Peut voir et accepter les livraisons
- **admin** : Accès complet à toutes les fonctionnalités

## 📊 Structure de la base de données

### Tables principales :
- `users` - Utilisateurs (clients, restaurateurs, livreurs)
- `restaurants` - Informations des restaurants
- `dishes` - Plats disponibles
- `orders` - Commandes passées
- `order_items` - Détails des articles commandés
- `transactions` - Transactions de paiement

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage
```

## 🚀 Déploiement

### Variables d'environnement de production
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://votre-frontend.com
```

### Commandes de déploiement
```bash
# Build de production
npm run build

# Lancer en production
npm start
```

## 📝 Statuts des commandes

1. **pending** - En attente de confirmation
2. **confirmed** - Confirmée par le restaurant
3. **preparing** - En cours de préparation
4. **ready_for_delivery** - Prête pour la livraison
5. **out_for_delivery** - En cours de livraison
6. **delivered** - Livrée
7. **cancelled** - Annulée

## 💰 Système de commission

- Commission automatique de **15%** sur chaque commande
- Calculée sur le sous-total (hors frais de livraison)
- Stockée dans la table `orders` (colonne `commission`)

## 📱 Notifications

### WhatsApp (Mock en développement)
Les notifications WhatsApp sont simulées en mode développement. Pour la production, configurez :
- `WHATSAPP_API_URL`
- `WHATSAPP_API_TOKEN`

## 🔧 Configuration avancée

### Rate Limiting
- 100 requêtes par 15 minutes par IP
- Configurable dans `server.js`

### Upload d'images
- Taille max : 5MB
- Formats supportés : JPG, PNG, GIF
- Redimensionnement automatique : 800x600px

### Paiements CinetPay
En mode développement, les paiements sont simulés. Pour la production :
1. Créer un compte CinetPay
2. Configurer les variables d'environnement
3. Tester avec l'API sandbox

## 🐛 Dépannage

### Erreurs courantes

**Erreur de connexion Supabase**
```
Vérifiez vos variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
```

**Erreur JWT**
```
Vérifiez que JWT_SECRET est défini et suffisamment complexe
```

**Erreur d'upload d'image**
```
Vérifiez la configuration Cloudinary ou utilisez le mode développement
```

## 📞 Support

Pour toute question ou problème :
- Email : support@kolia.cd
- Documentation : [docs.kolia.cd](https://docs.kolia.cd)

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.