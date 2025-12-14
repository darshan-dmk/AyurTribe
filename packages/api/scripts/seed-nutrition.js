require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const REAL_FOOD_ITEMS = [
    // GRAINS
    {
        name_en: "Basmati Rice",
        name_sanskrit: "Shali",
        food_group: "Grain",
        rasa: ["Madhura", "Kashaya"],
        virya: "Shita",
        vipaka: "Madhura",
        guna: ["Laghu", "Snigdha"],
        dosha_effect: ["Balances Vata", "Balances Pitta", "Increases Kapha"],
        therapeutic_uses: ["General debility", "Fever", "Digestive disorders"],
        recommended_portion: "1 cup cooked",
        calories_per_100g: 121,
        protein_g: 3.5,
        carbs_g: 25,
        fat_g: 0.4,
        fiber_g: 0.4,
        vitamins: ["B1", "B3", "B6"],
        minerals: ["Iron", "Magnesium"]
    },
    {
        name_en: "Mung Dal (Green Gram)",
        name_sanskrit: "Mudga",
        food_group: "Legume",
        rasa: ["Madhura", "Kashaya"],
        virya: "Shita",
        vipaka: "Katu",
        guna: ["Laghu", "Ruksha"],
        dosha_effect: ["Balances Kapha", "Balances Pitta", "Balances Vata"],
        therapeutic_uses: ["Fever", "Detoxification", "Easy digestion"],
        recommended_portion: "1 bowl cooked",
        calories_per_100g: 105,
        protein_g: 7,
        carbs_g: 19,
        fat_g: 0.4,
        fiber_g: 7.6,
        vitamins: ["B1", "B6", "Folate"],
        minerals: ["Iron", "Magnesium", "Potassium"]
    },
    {
        name_en: "Ghee (Clarified Butter)",
        name_sanskrit: "Ghrita",
        food_group: "Dairy",
        rasa: ["Madhura"],
        virya: "Shita",
        vipaka: "Madhura",
        guna: ["Snigdha", "Guru", "Mridu"],
        dosha_effect: ["Balances Vata", "Balances Pitta", "Increases Kapha"],
        therapeutic_uses: ["Memory booster", "Vision", "Digestion", "Burn healing"],
        recommended_portion: "1-2 tsp",
        calories_per_100g: 900,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 99.5,
        fiber_g: 0,
        vitamins: ["A", "E", "K"],
        minerals: []
    },
    {
        name_en: "Spinach",
        name_sanskrit: "Palankya",
        food_group: "Vegetable",
        rasa: ["Kashaya", "Madhura"],
        virya: "Shita",
        vipaka: "Katu",
        guna: ["Guru", "Ruksha"],
        dosha_effect: ["Increases Vata", "Balances Pitta", "Balances Kapha"],
        therapeutic_uses: ["Constipation", "Debility"],
        recommended_portion: "1 cup cooked",
        calories_per_100g: 23,
        protein_g: 2.9,
        carbs_g: 3.6,
        fat_g: 0.4,
        fiber_g: 2.2,
        vitamins: ["A", "C", "K", "Folate"],
        minerals: ["Iron", "Calcium", "Magnesium"]
    },
    {
        name_en: "Pomegranate",
        name_sanskrit: "Dadima",
        food_group: "Fruit",
        rasa: ["Madhura", "Amla", "Kashaya"],
        virya: "Snigdha",
        vipaka: "Madhura",
        guna: ["Laghu", "Snigdha"],
        dosha_effect: ["Balances Vata", "Balances Pitta", "Balances Kapha"],
        therapeutic_uses: ["Heart health", "Digestion", "Thirst"],
        recommended_portion: "1/2 cup arils",
        calories_per_100g: 83,
        protein_g: 1.7,
        carbs_g: 19,
        fat_g: 1.2,
        fiber_g: 4,
        vitamins: ["C", "K"],
        minerals: ["Potassium"]
    },
    {
        name_en: "Turmeric",
        name_sanskrit: "Haridra",
        food_group: "Spice",
        rasa: ["Tikta", "Katu"],
        virya: "Ushna",
        vipaka: "Katu",
        guna: ["Ruksha", "Laghu"],
        dosha_effect: ["Balances Kapha", "Balances Vata", "Balances Pitta"],
        therapeutic_uses: ["Skin health", "Diabetes", "Inflammation"],
        recommended_portion: "1/4 tsp",
        calories_per_100g: 354,
        protein_g: 8,
        carbs_g: 65,
        fat_g: 10,
        fiber_g: 21,
        vitamins: ["C", "B6"],
        minerals: ["Iron", "Potassium", "Manganese"]
    }
];

async function seed() {
    console.log('🌱 Starting Ayurvedic nutrition seed...');
    console.log(`📊 Food items to insert: ${REAL_FOOD_ITEMS.length}`);

    try {
        // 1. Clear existing data
        console.log('🧹 Clearing existing food items...');
        const { error: deleteError } = await supabase
            .from('food_items')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (deleteError) {
            console.error('⚠️  Warning during deletion:', deleteError.message);
        }

        // 2. Insert new data
        console.log(`📥 Inserting ${REAL_FOOD_ITEMS.length} food items...`);

        const { data, error: insertError } = await supabase
            .from('food_items')
            .insert(REAL_FOOD_ITEMS)
            .select();

        if (insertError) {
            console.error('❌ Error inserting data:', insertError);
            throw insertError;
        }

        console.log(`✅ Successfully seeded ${data.length} food items!`);
        console.log('📋 Sample items:', data.slice(0, 3).map(item => item.name_en).join(', '));

    } catch (error) {
        console.error('💥 Seeding failed:', error);
        process.exit(1);
    }
}

seed().then(() => {
    console.log('🎉 Seeding complete!');
    process.exit(0);
}).catch(console.error);
