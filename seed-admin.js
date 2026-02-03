const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './packages/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdmin() {
    const email = 'admin@ezbillify.com';
    const password = 'admin123';
    const firstName = 'System';
    const lastName = 'Admin';
    const role = 'admin';

    console.log(`Seeding admin user: ${email}...`);

    try {
        // 1. Check if user already exists in Auth
        const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        let user = authUsers.users.find(u => u.email === email);

        if (!user) {
            console.log('Creating new user in Supabase Auth...');
            const { data: newData, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { first_name: firstName, last_name: lastName, role }
            });
            if (createError) throw createError;
            user = newData.user;
        } else {
            console.log('User already exists in Auth, updating password...');
            const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
                password: password,
                user_metadata: { first_name: firstName, last_name: lastName, role }
            });
            if (updateError) throw updateError;
        }

        // 2. Hash password for local users table (if we use it there)
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Upsert into public.users
        const { error: upsertError } = await supabase
            .from('users')
            .upsert({
                id: user.id,
                email,
                password_hash: passwordHash,
                first_name: firstName,
                last_name: lastName,
                role,
                is_active: true,
                is_verified: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'email' });

        if (upsertError) throw upsertError;

        console.log('✅ Admin user seeded successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } catch (err) {
        console.error('❌ Error seeding admin:', err.message);
    }
}

seedAdmin();
