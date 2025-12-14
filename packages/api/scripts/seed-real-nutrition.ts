
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('Error loading .env:', result.error);
} else {
    console.log('.env loaded successfully. URL exists?', !!process.env.SUPABASE_URL);
}

const sanitize = (val?: string) => val ? val.trim().replace(/^["']|["']$/g, '') : undefined;
const supabaseUrl = sanitize(process.env.SUPABASE_URL);
const supabaseServiceKey = sanitize(process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Path to the CSV file
const CSV_FILE_PATH = path.resolve(__dirname, '../../../models/nutrition_dataset.csv');

// Helper to parse CSV line containing quoted fields
function parseCSVLine(text: string) {
    const result = [];
    let curve = 0;
    let start = 0;
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '"') {
            inQuote = !inQuote;
        } else if (text[i] === ',' && !inQuote) {
            let field = text.substring(start, i).trim();
            // Remove surrounding quotes if present
            if (field.startsWith('"') && field.endsWith('"')) {
                field = field.substring(1, field.length - 1);
            }
            result.push(field);
            start = i + 1;
        }
    }
    // Push the last field
    let lastField = text.substring(start).trim();
    if (lastField.startsWith('"') && lastField.endsWith('"')) {
        lastField = lastField.substring(1, lastField.length - 1);
    }
    result.push(lastField);
    return result;
}

// Helper to split string by comma and trim, handling possible nulls
const splitArray = (val: string) => {
    if (!val) return [];
    // If the value was quoted in CSV, it might still contain commas inside, e.g. "B1, B2"
    return val.split(',').map(s => s.trim()).filter(Boolean);
};

async function seed() {
    console.log('🌱 Starting accurate Ayurvedic nutrition seed from CSV...');

    if (!fs.existsSync(CSV_FILE_PATH)) {
        console.error(`❌ CSV file not found at: ${CSV_FILE_PATH}`);
        return;
    }

    console.log(`📖 Reading CSV from: ${CSV_FILE_PATH}`);
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const lines = fileContent.split(/\r?\n/).filter((line: string) => line.trim() !== '');

    if (lines.length < 2) {
        console.error('❌ CSV file is empty or has only header');
        return;
    }

    // Parse header to sanity check (optional, but good for debugging)
    const headers = parseCSVLine(lines[0]);
    console.log('Headers:', headers);

    const foodItems = [];

    // Skip header and parse rows
    for (let i = 1; i < lines.length; i++) {
        const columns = parseCSVLine(lines[i]);
        if (columns.length < 5) continue; // Skip malformed lines

        // Mapping based on CSV structure (adjust indices based on header)
        // id,name_en,name_sanskrit,food_group,calories_per_100g,protein_g,carbs_g,fat_g,fiber_g,vitamins,minerals,rasa,virya,vipaka,guna,dosha_effect,seasonal_suitability,digestion_level,region_common,contraindications,suggested_combinations,therapeutic_uses,recommended_portion

        try {
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

    console.log(`✅ Parsed ${foodItems.length} food items from CSV.`);

    // 1. Clear existing data
    console.log('🧹 Clearing existing food items...');
    const { error: deleteError } = await supabase
        .from('food_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all matching any ID

    if (deleteError) {
        console.error('Error clearing table:', deleteError);
        return;
    }

    // 2. Insert real data in batches
    console.log(`📥 Inserting ${foodItems.length} items into Supabase...`);

    // Batch size of 50 to avoid payload limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < foodItems.length; i += BATCH_SIZE) {
        const batch = foodItems.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await supabase
            .from('food_items')
            .insert(batch);

        if (insertError) {
            console.error(`❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, insertError);
        } else {
            console.log(`   Processed items ${i + 1} to ${Math.min(i + BATCH_SIZE, foodItems.length)}`);
        }
    }

    console.log('✨ Seeding complete!');
}

seed().catch(console.error);
