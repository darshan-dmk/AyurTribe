
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './packages/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCols() {
    const { data, error } = await supabase.from('food_items').select('*').limit(1);
    if (data && data[0]) {
        console.log('Available columns:', Object.keys(data[0]));
    } else {
        console.log('No data or error:', error);
    }
}

checkCols();
