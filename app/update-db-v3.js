const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.vyhfnhanvhpqyngmzvns:dompu_online032@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();

    const sql = `
      -- Add news_id and job_id to media table
      ALTER TABLE media ADD COLUMN IF NOT EXISTS news_id UUID REFERENCES news(id) ON DELETE CASCADE;
      ALTER TABLE media ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id) ON DELETE CASCADE;

      -- Ensure vendor_id is nullable if not already
      ALTER TABLE media ALTER COLUMN vendor_id DROP NOT NULL;

      -- Add indexes for performance
      CREATE INDEX IF NOT EXISTS idx_media_news ON media(news_id);
      CREATE INDEX IF NOT EXISTS idx_media_job ON media(job_id);

      -- Update jobs table to support company information better if missing
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_logo TEXT;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Dompu, NTB';
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Full-time'; -- Full-time, Part-time, etc.
    `;

    await client.query(sql);
    console.log('Database updated successfully for news and jobs media support!');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await client.end();
  }
}

run();
