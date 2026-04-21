const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.vyhfnhanvhpqyngmzvns:dompu_online032@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    
    const sql = `
      -- 1. Modify jobs table to allow admin entries (vendor_id null)
      ALTER TABLE jobs ALTER COLUMN vendor_id DROP NOT NULL;
      
      -- Add status for jobs if not present, and company info since it may not be linked to vendor
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_name TEXT;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contact_info TEXT;

      -- 2. Create sliders table for the homepage banner
      CREATE TABLE IF NOT EXISTS sliders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Add RLS for sliders
      ALTER TABLE sliders ENABLE ROW LEVEL SECURITY;
      
      -- Drop policies if they exist so we can recreate them
      DROP POLICY IF EXISTS "Public can view active sliders" ON sliders;
      DROP POLICY IF EXISTS "Admins manage sliders" ON sliders;

      CREATE POLICY "Public can view active sliders"
        ON sliders FOR SELECT
        USING (is_active = true);

      CREATE POLICY "Admins manage sliders"
        ON sliders FOR ALL
        USING (auth.role() = 'authenticated');
    `;
    
    await client.query(sql);
    console.log('Database updated successfully for sliders and jobs!');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await client.end();
  }
}

run();
