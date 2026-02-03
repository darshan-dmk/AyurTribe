
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './packages/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugData() {
    console.log('Fetching sample foods...');
    const { data, error } = await supabase.from('food_items').select('*').limit(5);
    if (error) {
        console.error('Error:', error);
    } else {
        data.forEach(food => {
            console.log(`Food: ${food.name_en}`);
            console.log(`Dosha Effect:`, food.dosha_effect);
            console.log(`Type:`, typeof food.dosha_effect);
            console.log(`---`);
        });
    }
}

debugData();
