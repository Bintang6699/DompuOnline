-- ============================================
-- MIGRATION: Fix Jobs Schema
-- Run this in your Supabase SQL Editor to fix the jobs system
-- ============================================

-- Step 1: Update jobs table - add missing fields and make vendor_id optional
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_info TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Dompu, NTB',
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Full-time',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Make vendor_id optional (nullable) if it was NOT NULL before
-- Only run this if vendor_id is NOT NULL in your current schema
ALTER TABLE jobs
  ALTER COLUMN vendor_id DROP NOT NULL;

-- Step 2: Create a separate media_jobs table for job media
CREATE TABLE IF NOT EXISTS media_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for media_jobs
CREATE INDEX IF NOT EXISTS idx_media_jobs_job ON media_jobs(job_id);

-- Step 3: Enable RLS on media_jobs table
ALTER TABLE media_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for media_jobs
CREATE POLICY IF NOT EXISTS "Public can read job media"
  ON media_jobs FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public can insert job media"
  ON media_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admins manage job media"
  ON media_jobs FOR ALL USING (auth.role() = 'authenticated');

-- Step 4: Update trigger for jobs updated_at
CREATE OR REPLACE FUNCTION update_jobs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_jobs_updated_at_column();

-- Step 5: Update jobs RLS policy to allow public read
DROP POLICY IF EXISTS "Public can read jobs" ON jobs;
CREATE POLICY "Public can read jobs"
  ON jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert jobs" ON jobs;
CREATE POLICY "Public can insert jobs"
  ON jobs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage jobs" ON jobs;
CREATE POLICY "Admins manage jobs"
  ON jobs FOR ALL USING (auth.role() = 'authenticated');
