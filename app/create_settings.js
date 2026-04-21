const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const { createClient } = require('@supabase/supabase-js');
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('Attempting to create settings table...');
    const sql = `
    CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value JSONB NOT NULL
    );
    `;
    const { error } = await s.rpc('exec_sql', { query: sql }); // Note: Sometimes it's 'query', sometimes 'sql'.
    // Let's try to just insert into 'settings' and see if it exists. If not, try both param names.
    let sqlErr = await s.rpc('exec_sql', { sql });
    
    if (sqlErr.error) {
        console.error('exec_sql error:', sqlErr.error);
    } else {
        console.log('Settings table created (if it didn\'t exist).');
    }

    // Upsert default data
    const { data, error: insertError } = await s.from('settings')
        .upsert({
            key: 'global',
            value: {
                whatsapp: '',
                instagram: '',
                email: '',
                tiktok: '',
                address: '',
                enableFreeTrial: false
            }
        }, { onConflict: 'key' })
        .select();

    if (insertError) {
        console.error('Insert Error:', insertError);
    } else {
        console.log('Seed success:', data);
    }
}
run();
