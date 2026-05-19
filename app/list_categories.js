const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.vyhfnhanvhpqyngmzvns:dompu_online032@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM categories');
    console.log(res.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
  } finally {
    await client.end();
  }
}

run();
