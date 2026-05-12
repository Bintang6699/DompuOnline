-- ============================================================
-- Dompu Online: Anti-Spam & Security System Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add security columns to vendors table
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS spam_score FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duplicate_score FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fingerprint_id TEXT,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
  ADD COLUMN IF NOT EXISTS security_flag TEXT;

-- 2. Security logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  fingerprint_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Blocked IPs and devices
CREATE TABLE IF NOT EXISTS blocked_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('ip', 'fingerprint')),
  value TEXT NOT NULL,
  reason TEXT,
  blocked_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(value)
);

-- 4. Similarity logs
CREATE TABLE IF NOT EXISTS similarity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  matched_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  similarity_type TEXT,
  similarity_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_logs_vendor ON security_logs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_logs_event ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_vendors_ip ON vendors(ip_address);
CREATE INDEX IF NOT EXISTS idx_vendors_fingerprint ON vendors(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_vendors_security_flag ON vendors(security_flag);
CREATE INDEX IF NOT EXISTS idx_blocked_identities_value ON blocked_identities(value);

-- 6. RLS: security_logs (only admin can read)
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "security_logs_service_only" ON security_logs
  USING (false)  -- Public cannot read
  WITH CHECK (false); -- Public cannot insert (API uses service role key)

-- 7. RLS: blocked_identities (only admin via service role)
ALTER TABLE blocked_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "blocked_identities_service_only" ON blocked_identities
  USING (false)
  WITH CHECK (false);

-- 8. RLS: similarity_logs (only admin via service role)
ALTER TABLE similarity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "similarity_logs_service_only" ON similarity_logs
  USING (false)
  WITH CHECK (false);
