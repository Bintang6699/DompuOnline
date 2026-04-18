-- ============================================
-- MIGRATION: Create media_jobs Table
-- Copy and paste this entire script into your
-- Supabase SQL Editor and click "Run"
-- Dashboard: https://supabase.com/dashboard/project/vyhfnhanvhpqyngmzvns/sql
-- ============================================

-- Create media_jobs table for job media attachments
CREATE TABLE IF NOT EXISTS media_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_jobs_job ON media_jobs(job_id);

-- Enable RLS
ALTER TABLE media_jobs ENABLE ROW LEVEL SECURITY;

-- Public can read job media
DROP POLICY IF EXISTS "Public can read job media" ON media_jobs;
CREATE POLICY "Public can read job media"
  ON media_jobs FOR SELECT USING (true);

-- Allow insert
DROP POLICY IF EXISTS "Allow insert job media" ON media_jobs;
CREATE POLICY "Allow insert job media"
  ON media_jobs FOR INSERT WITH CHECK (true);

-- Allow delete
DROP POLICY IF EXISTS "Allow delete job media" ON media_jobs;
CREATE POLICY "Allow delete job media"
  ON media_jobs FOR DELETE USING (true);

-- Allow update
DROP POLICY IF EXISTS "Allow update job media" ON media_jobs;
CREATE POLICY "Allow update job media"
  ON media_jobs FOR UPDATE USING (true);

-- Also add expiry_date column to jobs if not exists
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Dompu, NTB';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Full-time';

-- Make vendor_id optional (jobs can be standalone without a vendor)
ALTER TABLE jobs ALTER COLUMN vendor_id DROP NOT NULL;

-- Done!
SELECT 'Migration completed successfully!' as status;
