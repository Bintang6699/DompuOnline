const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.vyhfnhanvhpqyngmzvns:dompu_online032@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    
    const sql = `
      -- Create bucket if it doesn't exist
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('media', 'media', true)
      ON CONFLICT (id) DO UPDATE SET public = true;

      -- Allow public access to view files
      CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');

      -- Allow anonymous uploads (for registration)
      CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
    `;
    
    await client.query(sql);
    console.log('Storage bucket and policies created successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
