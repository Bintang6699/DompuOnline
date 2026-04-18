-- ============================================
-- MIGRATION: Add expiry_date to Jobs Schema
-- Run this in your Supabase SQL Editor if you want to use the expiry_date feature
-- ============================================

-- Step 1: Add expiry_date missing field to the jobs table
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS expiry_date DATE;
