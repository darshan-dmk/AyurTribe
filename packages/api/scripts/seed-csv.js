const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env:', result.error);
} else {
    // console.log('Parsed env:', result.parsed);
    console.log('.env loaded.');
}

// Sanitize inputs
const sanitize = (val) => val ? val.trim().replace(/^["']|["']$/g, '') : undefined;
const supabaseUrl = sanitize(process.env.SUPABASE_URL);
const supabaseServiceKey = sanitize(process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('Key:', supabaseServiceKey ? 'Set' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Path to the CSV file
const CSV_FILE_PATH = path.resolve(__dirname, '../../../models/nutrition_dataset.csv');

// Helper to parse CSV line containing quoted fields
function parseCSVLine(text) {
    const result = [];
    let start = 0;
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '"') {
            inQuote = !inQuote;
        } else if (text[i] === ',' && !inQuote) {
            let field = text.substring(start, i).trim();
            if (field.startsWith('"') && field.endsWith('"')) {
                field = field.substring(1, field.length - 1);
            }
            result.push(field);
            start = i + 1;
        }
    }
    let lastField = text.substring(start).trim();
    if (lastField.startsWith('"') && lastField.endsWith('"')) {
        lastField = lastField.substring(1, lastField.length - 1);
    }
    result.push(lastField);
    return result;
}

// Helper to split string by comma and trim
const splitArray = (val) => {
    if (!val) return [];
    return val.split(',').map(s => s.trim()).filter(Boolean);
};

async function seed() {
    console.log('🌱 Starting seed from CSV...');

    if (!fs.existsSync(CSV_FILE_PATH)) {
        console.error(`❌ CSV file not found at: ${CSV_FILE_PATH}`);
        return;
    }

    console.log(`📖 Reading CSV from: ${CSV_FILE_PATH}`);
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) {
        console.error('❌ CSV file is empty or has only header');
        return;
    }

    const foodItems = [];

    // Skip header (i=1)
    for (let i = 1; i < lines.length; i++) {
        const columns = parseCSVLine(lines[i]);
        if (columns.length < 5) continue;

        try {
            // id,name_en,name_sanskrit,food_group,calories_per_100g,protein_g,carbs_g,fat_g,fiber_g,vitamins,minerals,rasa,virya,vipaka,guna,dosha_effect,seasonal_suitability,digestion_level,region_common,contraindications,suggested_combinations,therapeutic_uses,recommended_portion
            const item = {
                name_en: columns[1],
                name_sanskrit: columns[2],
                food_group: columns[3],
                calories_per_100g: parseFloat(columns[4]) || 0,
                protein_g: parseFloat(columns[5]) || 0,
                carbs_g: parseFloat(columns[6]) || 0,
                fat_g: parseFloat(columns[7]) || 0,
                fiber_g: parseFloat(columns[8]) || 0,
                vitamins: splitArray(columns[9]),
                minerals: splitArray(columns[10]),
                rasa: splitArray(columns[11]),
                virya: columns[12],
                vipaka: columns[13],
                guna: splitArray(columns[14]),
                dosha_effect: splitArray(columns[15]),
                seasonal_suitability: splitArray(columns[16]),
                digestion_level: columns[17],
                region_common: splitArray(columns[18]),
                contraindications: splitArray(columns[19]),
                suggested_combinations: splitArray(columns[20]),
                therapeutic_uses: splitArray(columns[21]),
                recommended_portion: columns[22]
            };
            foodItems.push(item);
        } catch (err) {
            console.warn(`⚠️ Error parsing line ${i + 1}:`, err);
        }
    }

    console.log(`✅ Parsed ${foodItems.length} food items.`);

    // 1. Clear existing data
    console.log('🧹 Clearing existing food_items...');
    // We assume 'id' is distinct from '0000...' but to be safe we can use a different condition or just truncate if allowed.
    // supabase 'delete' requires a filter.
    const { error: deleteError } = await supabase
        .from('food_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
        console.error('Error clearing table:', deleteError);
        // Continue anyway? It might duplicate if not cleared, but if clearing fails due to other reasons...
        // If the table is empty, this returns no error.
    }

    // 2. Insert items
    console.log(`📥 Inserting ${foodItems.length} items...`);
    const BATCH_SIZE = 50;
    let successCount = 0;
    for (let i = 0; i < foodItems.length; i += BATCH_SIZE) {
        const batch = foodItems.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await supabase
            .from('food_items')
            .insert(batch);

        if (insertError) {
            console.error(`❌ Error inserting batch ${i}:`, insertError);
        } else {
            successCount += batch.length;
            process.stdout.write(`\r   Inserted ${successCount}/${foodItems.length}`);
        }
    }
    console.log('\n✨ Seeding complete!');
}

seed().catch(console.error);
