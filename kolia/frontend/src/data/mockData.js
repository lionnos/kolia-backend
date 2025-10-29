export const mockData = {
  restaurants: [
    {
      id: 1,
      name: "Kivu Raha",
      commune: "Bagira",
      image: "/images/kivu raha.JPG",
      rating: 4.8,
      deliveryTime: "25-35 min",
      deliveryFee: 5000,
      category: "Cuisine Congolaise",
      description: "Spécialités congolaises authentiques du Kivu",
      address: "Avenue nkafu, Bagira",
      phone: "+243 970 123 456",
      status: "open",
      dishes: [
        { 
          id: 101, 
          name: "Poulet Moambé", 
          price: 38970, 
          description: "Poulet traditionnel en sauce moambé", 
          image: "/images/POULET MOAMBE.JPG", 
          category: "Plats principaux",
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true,
          isSpicy: true,
          rating: 4.8,
          ingredients: "Poulet, sauce moambé, épices, huile de palme"
        },
        { 
          id: 102, 
          name: "Sombé", 
          price: 5500, 
          description: "Feuilles de manioc aux arachides", 
          image: "/images/pondu.JPG", 
          category: "Plats principaux",
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          isSpicy: false,
          rating: 4.5,
          ingredients: "Feuilles de manioc, arachides, huile de palme, piment"
        },
        { 
          id: 103, 
          name: "Fufu", 
          price: 1000, 
          description: "Pâte de manioc traditionnelle", 
          image: "/images/fufu.JPG", 
          category: "Accompagnements",
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          isSpicy: false,
          rating: 4.3,
          hasOptions: true,
          options: [
            { id: 1, name: "Fufu de maïs", price: 1000 },
            { id: 2, name: "Fufu de manioc", price: 1500 },
            { id: 3, name: "Fufu de sorgho rouge", price: 2000 }
          ],
          ingredients: "Farine de manioc, eau"
        },
        { 
          id: 104, 
          name: "Mukeke grillé", 
          price: 7970, 
          description: "Poisson frais du lac Kivu grillé", 
          image: "/images/mukeke grille.JPG", 
          category: "Poissons",
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true,
          isSpicy: false,
          rating: 4.7,
          ingredients: "Poisson mukeke, citron, ail, épices"
        }
      ]
    },
    {
      id: 2,
      name: "Chez Da Letty",
      commune: "Ibanda",
      image: "/images/da letty.JPG",
      rating: 4.6,
      deliveryTime: "20-30 min",
      deliveryFee: 5000,
      category: "Cuisine familiale",
      description: "Cuisine congolaise familiale et chaleureuse",
      address: "Quartier Nyawera, Ibanda",
      phone: "+243 970 654 321",
      status: "open",
      dishes: [
        { 
          id: 201, 
          name: "Kwanga na Makayabu", 
          price: 31500, 
          description: "Kwanga avec poisson salé", 
          image: "/images/kwanga et makayabu.JPG", 
          category: "Plats principaux",
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true,
          isSpicy: true,
          rating: 4.6,
          ingredients: "Kwanga, poisson makayabu, huile, oignons, piment"
        },
        { 
          id: 202, 
          name: "Ngai-Ngai", 
          price: 3970, 
          description: "Légumes verts traditionnels", 
          image: "/images/ngaingai.JPG", 
          category: "Légumes",
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          isSpicy: false,
          rating: 4.2,
          ingredients: "Feuilles de ngai-ngai, huile de palme, arachides"
        },
        { 
          id: 203, 
          name: "Chikwange", 
          price: 4970, 
          description: "Pain de manioc dans les feuilles", 
          image: "/images/Chikwangue.JPG", 
          category: "Accompagnements",
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          isSpicy: false,
          rating: 4.4,
          ingredients: "Manioc, feuilles de bananier"
        }
      ]
    },
    {
      id: 3,
      name: "Le gourmet",
      commune: "Ibanda",
      image: "/images/le gourmet 2.JPG",
      rating: 4.4,
      deliveryTime: "30-40 min",
      deliveryFee: 5000,
      category: "International",
      description: "Cuisine moderne et internationale",
      address: "Avenue P.E LUMUMBA, Ibanda",
      phone: "+243 970 987 654",
      status: "open",
      dishes: [
        { 
          id: 301, 
          name: "Pizza Kivu", 
          price: 56970, 
          description: "Pizza aux fruits de mer du lac Kivu", 
          image: "/images/pizza 1.JPG", 
          category: "Pizza",
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isSpicy: false,
          rating: 4.5,
          ingredients: "Pâte à pizza, fromage, fruits de mer, tomates, basilic"
        },
        { 
          id: 302, 
          name: "Burger Tropical", 
          price: 43500, 
          description: "Burger avec fruits tropicaux", 
          image: "/images/bourger 1.JPG", 
          category: "Burgers",
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isSpicy: false,
          rating: 4.3,
          ingredients: "Pain burger, viande de bœuf, ananas, sauce maison"
        },
        { 
          id: 303, 
          name: "Salade Exotique", 
          price: 35970, 
          description: "Salade aux fruits tropicaux", 
          image: "/images/salade 1.JPG", 
          category: "Salades",
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          isSpicy: false,
          rating: 4.1,
          ingredients: "Laitue, mangue, avocat, noix de cajou, vinaigrette"
        }
      ]
    }
  ],
  
  communes: ["Tous", "Kadutu", "Ibanda", "Bagira"],
  categories: ["Tous", "Congolais", "Cuisine familiale", "International", "Fast Food"],
  
  orders: [
    {
      id: 1001,
      userId: 1,
      restaurantId: 1,
      restaurantName: "Kivu Raha",
      items: [
        { id: 101, name: "Poulet Moambé", price: 38970, quantity: 2 },
        { id: 103, name: "Fufu", price: 1000, quantity: 2 }
      ],
      total: 82940,
      status: "delivered",
      date: "2025-08-05",
      deliveryAddress: "Quartier Nyawera, Bukavu",
      deliveryFee: 5000,
      customerName: "Jean Mukamba",
      customerPhone: "+243 970 111 222",
      driverId: 1,
      deliveryDate: "2025-08-05",
      deliveredAt: "2025-08-05T14:30:00Z"
    },
    {
      id: 1002,
      userId: 1,
      restaurantId: 2,
      restaurantName: "Chez Da Letty",
      items: [
        { id: 201, name: "Kwanga na Makayabu", price: 31500, quantity: 1 }
      ],
      total: 36500,
      status: "ready_for_delivery",
      date: "2025-08-06",
      deliveryAddress: "Avenue Patrice Lumumba, Bukavu",
      deliveryFee: 5000,
      customerName: "Jean Mukamba",
      customerPhone: "+243 970 111 222",
      driverId: null
    },
    {
      id: 1003,
      userId: 1,
      restaurantId: 3,
      restaurantName: "Le gourmet",
      items: [
        { id: 301, name: "Pizza Kivu", price: 56970, quantity: 1 },
        { id: 303, name: "Salade Exotique", price: 35970, quantity: 1 }
      ],
      total: 97940,
      status: "out_for_delivery",
      date: "2025-08-06",
      deliveryAddress: "Quartier Kadutu, Bukavu",
      deliveryFee: 5000,
      customerName: "Jean Mukamba",
      customerPhone: "+243 970 111 222",
      driverId: 1,
      acceptedAt: "2025-08-06T12:15:00Z"
    },
    {
      id: 1004,
      userId: 2,
      restaurantId: 1,
      restaurantName: "Kivu Raha",
      items: [
        { id: 104, name: "Mukeke grillé", price: 7970, quantity: 2 },
        { id: 102, name: "Sombé", price: 5500, quantity: 1 }
      ],
      total: 21440,
      status: "ready_for_delivery",
      date: "2025-08-06",
      deliveryAddress: "Avenue nkafu, Bagira",
      deliveryFee: 5000,
      customerName: "Marie Kanku",
      customerPhone: "+243 970 333 444",
      driverId: null
    },
    {
      id: 1005,
      userId: 3,
      restaurantId: 2,
      restaurantName: "Chez Da Letty",
      items: [
        { id: 201, name: "Kwanga na Makayabu", price: 31500, quantity: 2 },
        { id: 203, name: "Chikwange", price: 4970, quantity: 1 }
      ],
      total: 72970,
      status: "delivered",
      date: "2025-08-05",
      deliveryAddress: "Quartier Nyawera, Ibanda",
      deliveryFee: 5000,
      customerName: "Paul Bahati",
      customerPhone: "+243 970 555 666",
      driverId: 2,
      deliveryDate: "2025-08-05",
      deliveredAt: "2025-08-05T16:45:00Z"
    }
  ],

  users: [
    {
      id: 1,
      email: "client@bukavu.com",
      password: "123456",
      name: "Jean Mukamba",
      phone: "+243 970 111 222",
      address: "Quartier Nyawera, Bukavu",
      role: "client"
    },
    {
      id: 2,
      email: "restaurant@bukavu.com", 
      password: "000000",
      name: "Restaurant Kivu Raha",
      phone: "+243 970 123 456",
      address: "Avenue Patrice Lumumba, Ibanda",
      role: "restaurant",
      restaurantId: 1
    },
    {
      id: 3,
      email: "livreur@bukavu.com",
      password: "123456",
      name: "Paul Livreur",
      phone: "+243 970 555 666",
      address: "Quartier Kadutu, Bukavu",
      role: "livreur",
      driverId: 1
    },
    {
      id: 4,
      email: "client2@bukavu.com",
      password: "123456",
      name: "Marie Kanku",
      phone: "+243 970 333 444",
      address: "Avenue nkafu, Bagira",
      role: "client"
    },
    {
      id: 5,
      email: "client3@bukavu.com",
      password: "123456",
      name: "Paul Bahati",
      phone: "+243 970 555 666",
      address: "Quartier Nyawera, Ibanda",
      role: "client"
    },
    {
      id: 6,
      email: "livreur2@bukavu.com",
      password: "123456",
      name: "Jacques Express",
      phone: "+243 970 777 888",
      address: "Quartier Bagira, Bukavu",
      role: "livreur",
      driverId: 2
    }
  ],

  resources: [
    {
      id: 1,
      restaurantId: 1,
      name: "Farine de maïs",
      category: "Céréales",
      quantity: 20,
      unit: "kg",
      minStockLevel: 5,
      image: "/images/mais.jpg"
    },
    {
      id: 2,
      restaurantId: 1,
      name: "Poulet",
      category: "Viandes",
      quantity: 15,
      unit: "kg",
      minStockLevel: 3,
      image: "/images/poulet.jpg"
    },
    {
      id: 3,
      restaurantId: 1,
      name: "Tomates",
      category: "Légumes",
      quantity: 8,
      unit: "kg",
      minStockLevel: 2,
      image: "/images/tomates.jpg"
    },
    {
      id: 4,
      restaurantId: 1,
      name: "Manioc",
      category: "Tubercules",
      quantity: 30,
      unit: "kg",
      minStockLevel: 10,
      image: "/images/manioc.jpg"
    },
    {
      id: 5,
      restaurantId: 1,
      name: "Huile végétale",
      category: "Condiments",
      quantity: 5,
      unit: "L",
      minStockLevel: 2,
      image: "/images/huile.jpg"
    },
    {
      id: 6,
      restaurantId: 2,
      name: "Poisson Makayabu",
      category: "Poissons",
      quantity: 12,
      unit: "kg",
      minStockLevel: 4,
      image: "/images/makayabu.jpg"
    },
    {
      id: 7,
      restaurantId: 2,
      name: "Feuilles de Manioc",
      category: "Légumes",
      quantity: 15,
      unit: "kg",
      minStockLevel: 5,
      image: "/images/feuilles-manioc.jpg"
    },
    {
      id: 8,
      restaurantId: 3,
      name: "Fromage",
      category: "Laitier",
      quantity: 8,
      unit: "kg",
      minStockLevel: 3,
      image: "/images/fromage.jpg"
    }
  ],

  // Ajout des données pour les livreurs
  deliveryDrivers: [
    {
      id: 1,
      name: "Paul Livreur",
      description: "Service de livraison rapide et fiable dans tout Bukavu",
      image: "/images/paul le livreur.png",
      available: true,
      rating: 4.8,
      deliveryAreas: ["Kadutu", "Ibanda", "Bagira"],
      vehicle: "Moto",
      phone: "+243 970 555 666"
    },
    {
      id: 2,
      name: "Jacques Express",
      description: "Livraison express de vos plats préférés",
      image: "/images/jack express.png",
      available: true,
      rating: 4.5,
      deliveryAreas: ["Kadutu", "Ibanda"],
      vehicle: "Vélo",
      phone: "+243 970 777 888"
    },
    {
      id: 3,
      name: "Marie Rapide",
      description: "Service de livraison rapide avec suivi en temps réel",
      image: "https://images.unsplash.com/photo-1623854767648-e7bb8009f0db?w=300&h=200&fit=crop",
      available: false,
      rating: 4.9,
      deliveryAreas: ["Bagira", "Kadutu"],
      vehicle: "Moto",
      phone: "+243 970 999 000"
    }
  ]
};