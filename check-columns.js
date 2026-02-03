
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './packages/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('Checking food_items table for all expected columns...');
    const expectedColumns = [
        'id', 'name_en', 'name_sanskrit', 'food_group',
        'calories_per_100g', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
        'vitamins', 'minerals', 'rasa', 'virya', 'vipaka', 'guna',
        'dosha_effect', 'seasonal_suitability', 'digestion_level',
        'region_common', 'contraindications', 'suggested_combinations',
        'therapeutic_uses', 'recommended_portion'
    ];

    for (const col of expectedColumns) {
        const { error } = await supabase.from('food_items').select(col).limit(1);
        if (error) {
            console.log(`❌ Column ${col} MISSING: ${error.message}`);
        } else {
            console.log(`✅ Column ${col} EXISTS`);
        }
    }
}

checkTable();
