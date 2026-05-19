const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.vyhfnhanvhpqyngmzvns:dompu_online032@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    
    // Insert Ternak category
    const sql = `
      INSERT INTO categories (id, name, icon, slug, description)
      VALUES ('9e1a5e94-44db-4134-ada5-ebe5ecf7ac6e', 'Ternak', '🐄', 'ternak', 'Jual beli hewan ternak dan peliharaan')
      ON CONFLICT (id) DO UPDATE SET name = 'Ternak', icon = '🐄', slug = 'ternak', description = 'Jual beli hewan ternak dan peliharaan';
    `;
    
    await client.query(sql);
    console.log('Ternak category inserted/updated in database');
  } catch (err) {
    console.error('Error inserting category:', err);
  } finally {
    await client.end();
  }
}

run();
