// controllers/mockControllers.js

const mockData = require('../config/mockData'); 

// --- Simulation de GET /api/restaurants/:id ---
const getMockRestaurantById = (req, res) => {
    const id = parseInt(req.params.id, 10);
    
    // Simule la recherche: trouve le restaurant dans le tableau
    const restaurant = mockData.restaurants.find(r => r.id === id);

    if (!restaurant) {
        return res.status(404).json({ 
            success: false, 
            message: 'Restaurant Factice non trouvé (Mock)' 
        });
    }

    // Renvoie l'objet restaurant
    res.status(200).json({ 
        success: true, 
        data: {
            ...restaurant,
            dishes: undefined // Supprime les plats pour simuler la réponse de la BDD si les plats sont séparés
        }
    });
};


// --- Simulation de GET /api/dishes/restaurant/:id ---
const getMockDishesByRestaurant = (req, res) => {
    // Le paramètre peut être 'id' ou 'restaurantId' selon la route utilisée, on utilise 'id' de la route :id
    const restaurantId = parseInt(req.params.id, 10); 
    
    // Trouve le restaurant correspondant pour obtenir ses plats
    const restaurant = mockData.restaurants.find(r => r.id === restaurantId);

    if (!restaurant) {
        return res.status(404).json({ 
            success: false, 
            message: 'Restaurant Factice non trouvé pour les plats (Mock)' 
        });
    }

    // Renvoie uniquement le tableau des plats
    res.status(200).json({ 
        success: true, 
        data: restaurant.dishes, // Vos plats sont imbriqués
        count: restaurant.dishes.length
    });
};


module.exports = {
    getMockRestaurantById,
    getMockDishesByRestaurant
};