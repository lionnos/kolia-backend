const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Client avec clé de service pour les opérations admin
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client avec clé anonyme pour les opérations utilisateur
const supabaseClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY);

module.exports = {
  supabaseAdmin,
  supabaseClient
};