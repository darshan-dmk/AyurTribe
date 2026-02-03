
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './packages/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserTable() {
    console.log('Checking users table columns...');
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
        console.error('Error fetching users:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in users table:', Object.keys(data[0]));
    } else {
        console.log('Users table is empty or could not retrieve columns.');
        // Try to get schema via RPC or just query a non-existent column to see error
        const { error: err2 } = await supabase.from('users').select('non_existent_column').limit(1);
        console.log('Test error info:', err2?.message);
    }
}

checkUserTable();
