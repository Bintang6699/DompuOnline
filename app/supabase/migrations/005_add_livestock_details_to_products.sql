-- ============================================
-- MIGRATION: Add livestock_details to Products Table
-- ============================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS livestock_details JSONB DEFAULT NULL;
