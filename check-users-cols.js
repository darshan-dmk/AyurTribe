const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './packages/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
    const { data, error } = await supabase.rpc('get_column_names', { table_nm: 'users' });
    if (error) {
        // If RPC doesn't exist, try a simple select
        console.log('RPC failed, trying select * limit 1');
        const { data: selectData, error: selectError } = await supabase.from('users').select('*').limit(1);
        if (selectError) {
            console.error(selectError);
        } else {
            console.log('Columns found:', Object.keys(selectData[0]));
        }
    } else {
        console.log('Columns:', data);
    }
}

checkColumns();
