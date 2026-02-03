
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './packages/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDoshaCounts() {
    const doshas = ['Vata', 'Pitta', 'Kapha'];
    for (const dosha of doshas) {
        const { count, error } = await supabase
            .from('food_items')
            .select('*', { count: 'exact', head: true })
            .contains('dosha_effect', [`Balances ${dosha}`]);

        const { count: countReduces, error: errorReduces } = await supabase
            .from('food_items')
            .select('*', { count: 'exact', head: true })
            .contains('dosha_effect', [`Reduces ${dosha}`]);

        console.log(`${dosha}: Balances=${count}, Reduces=${countReduces}`);
    }
}

checkDoshaCounts();
