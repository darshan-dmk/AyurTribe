
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './packages/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log('Verifying food_items count...');
    const { count, error } = await supabase
        .from('food_items')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Total food_items:', count);
    }
}

listTables();
