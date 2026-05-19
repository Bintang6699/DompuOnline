const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.vyhfnhanvhpqyngmzvns:dompu_online032@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    
    const sql = `
      ALTER TABLE products ADD COLUMN IF NOT EXISTS livestock_details JSONB DEFAULT NULL;
    `;
    
    await client.query(sql);
    console.log('Database altered successfully: Added livestock_details JSONB column to products table');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await client.end();
  }
}

run();
