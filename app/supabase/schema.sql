-- ============================================
-- DompuOnline – Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- ENABLE UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏪',
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO categories (name, icon, slug, description) VALUES
  ('Transport', '🏍️', 'transport', 'Ojek, sewa motor & mobil'),
  ('Kuliner', '🍽️', 'food', 'Makanan & minuman lokal'),
  ('Belanja', '🛍️', 'shopping', 'Produk, elektronik & fashion'),
  ('Jasa', '🔧', 'services', 'Layanan profesional'),
  ('Loker', '💼', 'jobs', 'Lowongan kerja Dompu'),
  ('Berita', '📰', 'news', 'Berita lokal Dompu');

-- ============================================
-- VENDORS / MITRA
-- ============================================
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  maps_link TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'surveyed', 'approved', 'rejected')),
  subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired')),
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-expire subscriptions: schedule a cron job or call manually
-- UPDATE vendors SET subscription_status = 'expired' WHERE subscription_end < NOW() AND subscription_status = 'active';

-- ============================================
-- PRODUCTS (for Food & Shopping categories)
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(12, 2) DEFAULT 0,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SERVICES (for Jasa category)
-- ============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOBS (for Loker category)
-- ============================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  company_name TEXT,
  description TEXT,
  requirements TEXT,
  contact_info TEXT,
  salary_min DECIMAL(12, 2),
  salary_max DECIMAL(12, 2),
  location TEXT DEFAULT 'Dompu, NTB',
  type TEXT DEFAULT 'Full-time',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at for jobs
CREATE OR REPLACE FUNCTION update_jobs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_jobs_updated_at_column();

-- ============================================
-- NEWS (Berita lokal)
-- ============================================
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  author TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDIA_JOBS (Photos & Videos for Jobs/Loker)
-- ============================================
CREATE TABLE media_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDIA (Photos & Videos for Vendors)
-- ============================================
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RATINGS (Admin ratings for vendors)
-- ============================================
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL UNIQUE,
  quality_score INTEGER DEFAULT 4 CHECK (quality_score BETWEEN 1 AND 5),
  cleanliness_score INTEGER DEFAULT 4 CHECK (cleanliness_score BETWEEN 1 AND 5),
  trust_score INTEGER DEFAULT 4 CHECK (trust_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('1_month', '3_month', '6_month', '1_year')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired')),
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_subscription_status ON vendors(subscription_status);
CREATE INDEX idx_vendors_category ON vendors(category_id);
CREATE INDEX idx_vendors_featured ON vendors(is_featured);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_services_vendor ON services(vendor_id);
CREATE INDEX idx_jobs_vendor ON jobs(vendor_id);
CREATE INDEX idx_media_vendor ON media(vendor_id);
CREATE INDEX idx_media_jobs_job ON media_jobs(job_id);
CREATE INDEX idx_ratings_vendor ON ratings(vendor_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- PUBLIC: Read approved + active vendors only
CREATE POLICY "Public can view approved vendors"
  ON vendors FOR SELECT
  USING (status = 'approved' AND subscription_status = 'active');

-- PUBLIC: Can insert new vendor registration
CREATE POLICY "Public can register vendors"
  ON vendors FOR INSERT
  WITH CHECK (true);

-- ADMIN: Full access (authenticated users)
CREATE POLICY "Admins have full vendor access"
  ON vendors FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Categories: Public read
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories"
  ON categories FOR ALL USING (auth.role() = 'authenticated');

-- Products: Public read for approved vendors
CREATE POLICY "Public can read products"
  ON products FOR SELECT USING (true);
CREATE POLICY "Public can insert products"
  ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage products"
  ON products FOR ALL USING (auth.role() = 'authenticated');

-- Services
CREATE POLICY "Public can read services"
  ON services FOR SELECT USING (true);
CREATE POLICY "Public can insert services"
  ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage services"
  ON services FOR ALL USING (auth.role() = 'authenticated');

-- Jobs
CREATE POLICY "Public can read jobs"
  ON jobs FOR SELECT USING (true);
CREATE POLICY "Public can insert jobs"
  ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage jobs"
  ON jobs FOR ALL USING (auth.role() = 'authenticated');

-- News: Public read, admin write
CREATE POLICY "Public can read news"
  ON news FOR SELECT USING (true);
CREATE POLICY "Admins manage news"
  ON news FOR ALL USING (auth.role() = 'authenticated');

-- Media
CREATE POLICY "Public can read media"
  ON media FOR SELECT USING (true);
CREATE POLICY "Public can insert media"
  ON media FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage media"
  ON media FOR ALL USING (auth.role() = 'authenticated');

-- Media Jobs
CREATE POLICY "Public can read job media"
  ON media_jobs FOR SELECT USING (true);
CREATE POLICY "Public can insert job media"
  ON media_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage job media"
  ON media_jobs FOR ALL USING (auth.role() = 'authenticated');

-- Ratings: Public read, admin write
CREATE POLICY "Public can read ratings"
  ON ratings FOR SELECT USING (true);
CREATE POLICY "Admins manage ratings"
  ON ratings FOR ALL USING (auth.role() = 'authenticated');

-- Subscriptions
CREATE POLICY "Public can insert subscriptions"
  ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage subscriptions"
  ON subscriptions FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- STORAGE BUCKET SETUP
-- Run this separately in Supabase dashboard or Storage API
-- ============================================
-- 1. Create a storage bucket named 'media'
-- 2. Set it to PUBLIC
-- 3. Add policy: Allow authenticated uploads for large files
-- SQL for storage policies if needed:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
