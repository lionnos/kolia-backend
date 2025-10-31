// src/routes/adminRoutes.js (Exemple avec Express.js)

const express = require('express');
const router = express.Router();
// Importez votre Controller (que nous allons créer ensuite)
const adminController = require('../controllers/adminController'); 
// Assurez-vous d'avoir un middleware pour vérifier que l'utilisateur est bien un Admin
const authMiddleware = require('../middleware/authMiddleware'); 

// 🎯 La Route Unique pour le Tableau de Bord
// L'URL sera : GET /api/admin/dashboard-data
router.get(
    '/dashboard-data', 
    authMiddleware.verifyAdmin, // 🛑 Middleware de Sécurité OBLIGATOIRE
    adminController.getDashboardData // Le Controller
);

module.exports = router;