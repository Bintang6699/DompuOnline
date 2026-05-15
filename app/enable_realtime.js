const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.vyhfnhanvhpqyngmzvns:dompu_online032@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    
    // Enable Realtime for vendors table
    const sql = `
      -- First check if table is already in the publication
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' AND tablename = 'vendors'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE vendors;
        END IF;
      END $$;
    `;
    
    await client.query(sql);
    console.log('Realtime enabled for vendors table!');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await client.end();
  }
}

run();
