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
    console.log('Attempting to add expiry_date column...');
    // We try to add it. If it fails (no permissions for exec_sql or something), we'll at least know.
    const { error } = await s.rpc('exec_sql', { sql: 'ALTER TABLE jobs ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;' });

    if (error) {
        console.error('Error adding column via RPC:', error.message);
        console.log('Falling back to direct table check...');
    }

    const { data, error: err2 } = await s.from('jobs').select('expiry_date').limit(1);
    if (err2) {
        console.log('Status: Failed to find or add expiry_date column.');
    } else {
        console.log('Status: expiry_date column is present.');
    }
}
run();
