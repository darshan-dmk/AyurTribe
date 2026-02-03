
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './packages/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkScores() {
    console.log('Fetching latest questionnaire scores...');
    const { data, error } = await supabase
        .from('questionnaire_answers')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        data.forEach(q => {
            console.log(`User: ${q.user_id}`);
            console.log(`Scores:`, q.scores);
            console.log(`Dominant:`, q.dominant_constitution);
        });
    }
}

checkScores();
