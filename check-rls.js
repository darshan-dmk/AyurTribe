
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './packages/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    console.log('Checking RLS for food_items...');

    // Check if RLS is enabled
    const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_rls_status', { table_name: 'food_items' });

    // Since we don't have that RPC, let's just try to fetch a count using the anon key vs service key
    const anonClient = createClient(supabaseUrl, process.env.SUPABASE_KEY);

    console.log('Fetching with Service Role Key...');
    const { count: serviceCount, error: serviceError } = await supabase
        .from('food_items')
        .select('*', { count: 'exact', head: true });

    if (serviceError) {
        console.error('Service Role Error:', serviceError.message);
    } else {
        console.log('Service Role Count:', serviceCount);
    }

    console.log('Fetching with Anon Key...');
    const { count: anonCount, error: anonError } = await anonClient
        .from('food_items')
        .select('*', { count: 'exact', head: true });

    if (anonError) {
        console.error('Anon Key Error:', anonError.message);
    } else {
        console.log('Anon Key Count:', anonCount);
    }
}

checkRLS();
