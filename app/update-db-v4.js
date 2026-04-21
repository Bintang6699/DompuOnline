const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.vyhfnhanvhpqyngmzvns:dompu_online032@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    
    const sql = `
      -- Sliders table enhancement
      ALTER TABLE sliders ADD COLUMN IF NOT EXISTS news_id UUID REFERENCES news(id) ON DELETE SET NULL;
      ALTER TABLE sliders ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'image' CHECK (type IN ('image', 'video'));
      ALTER TABLE sliders ADD COLUMN IF NOT EXISTS video_url TEXT;
      ALTER TABLE sliders ADD COLUMN IF NOT EXISTS title TEXT;
      
      -- Community links table
      CREATE TABLE IF NOT EXISTS community_links (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        platform TEXT NOT NULL, -- 'whatsapp_group', 'whatsapp_channel', 'facebook_group'
        url TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Seed sample community links if empty
      INSERT INTO community_links (platform, url) 
      SELECT 'whatsapp_group', 'https://chat.whatsapp.com/sample' WHERE NOT EXISTS (SELECT 1 FROM community_links WHERE platform = 'whatsapp_group');
      INSERT INTO community_links (platform, url) 
      SELECT 'whatsapp_channel', 'https://whatsapp.com/channel/sample' WHERE NOT EXISTS (SELECT 1 FROM community_links WHERE platform = 'whatsapp_channel');
      INSERT INTO community_links (platform, url) 
      SELECT 'facebook_group', 'https://facebook.com/groups/sample' WHERE NOT EXISTS (SELECT 1 FROM community_links WHERE platform = 'facebook_group');
    `;
    
    await client.query(sql);
    console.log('Database updated successfully for Slider & Community support!');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await client.end();
  }
}

run();
