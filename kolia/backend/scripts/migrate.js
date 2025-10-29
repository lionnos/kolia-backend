const { supabaseAdmin } = require('../config/database');

const createTables = async () => {
  try {
    console.log('🚀 Création des tables de la base de données...');

    // Table des utilisateurs
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          address TEXT NOT NULL,
          role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'restaurant', 'livreur', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Table des restaurants
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS restaurants (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          address TEXT NOT NULL,
          phone VARCHAR(20) NOT NULL,
          commune VARCHAR(50) NOT NULL CHECK (commune IN ('Kadutu', 'Ibanda', 'Bagira')),
          category VARCHAR(100) NOT NULL,
          delivery_fee DECIMAL(10,2) DEFAULT 5000,
          delivery_time VARCHAR(50) DEFAULT '25-35 min',
          image TEXT,
          rating DECIMAL(3,2) DEFAULT 0,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Table des plats
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS dishes (
          id SERIAL PRIMARY KEY,
          restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          category VARCHAR(100) NOT NULL,
          image TEXT,
          is_vegetarian BOOLEAN DEFAULT FALSE,
          is_vegan BOOLEAN DEFAULT FALSE,
          is_gluten_free BOOLEAN DEFAULT FALSE,
          is_spicy BOOLEAN DEFAULT FALSE,
          preparation_time INTEGER DEFAULT 25,
          ingredients TEXT,
          is_available BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Table des commandes
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
          driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          delivery_fee DECIMAL(10,2) NOT NULL,
          commission DECIMAL(10,2) NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          delivery_address TEXT NOT NULL,
          phone VARCHAR(20) NOT NULL,
          payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('card', 'mobile', 'cash')),
          payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
          status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled')),
          notes TEXT,
          delivered_at TIMESTAMP WITH TIME ZONE,
          cancelled_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Table des items de commande
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          dish_id INTEGER REFERENCES dishes(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Table des transactions
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(100) PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(10) DEFAULT 'CDF',
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
          payment_method VARCHAR(50) NOT NULL,
          cinetpay_token VARCHAR(255),
          cinetpay_response JSONB,
          refund_reason TEXT,
          completed_at TIMESTAMP WITH TIME ZONE,
          refunded_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Créer les index pour améliorer les performances
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON restaurants(user_id);
        CREATE INDEX IF NOT EXISTS idx_restaurants_commune ON restaurants(commune);
        CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants(category);
        CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_id ON dishes(restaurant_id);
        CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
        CREATE INDEX IF NOT EXISTS idx_dishes_is_available ON dishes(is_available);
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      `
    });

    // Créer les triggers pour updated_at
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
        CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_dishes_updated_at ON dishes;
        CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON dishes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    });

    console.log('✅ Tables créées avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Insertion des données de test...');

    // Créer un utilisateur admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .upsert([
        {
          name: 'Admin KOLIA',
          email: 'admin@kolia.cd',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          phone: '+243970000000',
          address: 'Bukavu, Sud-Kivu',
          role: 'admin'
        }
      ], { onConflict: 'email' })
      .select();

    if (adminError) {
      console.error('Erreur création admin:', adminError);
    } else {
      console.log('✅ Utilisateur admin créé');
    }

    // Créer des utilisateurs de test
    const { data: testUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .upsert([
        {
          name: 'Jean Mukamba',
          email: 'client@bukavu.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          phone: '+243970111222',
          address: 'Quartier Nyawera, Bukavu',
          role: 'client'
        },
        {
          name: 'Restaurant Kivu Raha',
          email: 'restaurant@bukavu.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          phone: '+243970123456',
          address: 'Avenue Patrice Lumumba, Ibanda',
          role: 'restaurant'
        },
        {
          name: 'Paul Livreur',
          email: 'livreur@bukavu.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          phone: '+243970555666',
          address: 'Quartier Kadutu, Bukavu',
          role: 'livreur'
        }
      ], { onConflict: 'email' })
      .select();

    if (usersError) {
      console.error('Erreur création utilisateurs:', usersError);
    } else {
      console.log('✅ Utilisateurs de test créés');
    }

    console.log('✅ Données de test insérées avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error);
  }
};

const main = async () => {
  await createTables();
  await seedData();
  console.log('🎉 Migration terminée!');
  process.exit(0);
};

main();