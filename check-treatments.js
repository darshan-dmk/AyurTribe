const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './packages/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTreatments() {
    const { data, error } = await supabase.from('treatments').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Treatments found:', data.length);
        data.forEach(t => console.log(`- ${t.name} (${t.category})`));
    }
}

checkTreatments();
