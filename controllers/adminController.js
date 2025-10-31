// src/controllers/adminController.js

// Vous devriez utiliser un "Service Layer" pour interagir avec la DB
const dbService = require('../services/dbService'); 

// Fonction appelée par la Route
exports.getDashboardData = async (req, res) => {
    try {
        // 1. Déclenchez TOUTES les requêtes DB en parallèle pour optimiser la vitesse
        const [
            statsData, 
            monthlyRevenueData, 
            userGrowthData, 
            orderDistributionData
        ] = await Promise.all([
            dbService.fetchGlobalStats(),
            dbService.fetchMonthlyRevenue(),
            dbService.fetchUserGrowth(),
            dbService.fetchOrderStatusDistribution()
        ]);

        // 2. Agrégation des données dans la structure attendue par le Front-end
        const dashboardData = {
            stats: statsData, // Contient totalClients, totalRevenue, ordersPending, etc.
            charts: {
                monthlyRevenue: monthlyRevenueData,
                userGrowth: userGrowthData,
                orderDistribution: orderDistributionData
            }
        };

        // 3. Renvoi de la réponse JSON au Front-end
        return res.status(200).json(dashboardData);

    } catch (error) {
        console.error('Erreur lors de la récupération des données du dashboard:', error);
        return res.status(500).json({ 
            message: 'Erreur serveur interne lors du chargement du tableau de bord.' 
        });
    }
};