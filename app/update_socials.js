const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.vyhfnhanvhpqyngmzvns:dompu_online032@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    
    const sql = `
      ALTER TABLE vendors ADD COLUMN IF NOT EXISTS facebook_url TEXT;
      ALTER TABLE vendors ADD COLUMN IF NOT EXISTS instagram_url TEXT;
      ALTER TABLE vendors ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
      ALTER TABLE vendors ADD COLUMN IF NOT EXISTS twitter_url TEXT;
    `;
    
    await client.query(sql);
    console.log('Database updated successfully with social media columns!');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await client.end();
  }
}

run();
