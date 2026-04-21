# Panduan Fix Bug Loker - Dompu Online

## Bug yang Diperbaiki:
1. ✅ Loker tidak muncul di halaman user - FIXED
2. ✅ Fungsi delete loker tidak bekerja - FIXED  
3. ✅ Refresh data otomatis setelah create/update/delete - FIXED

---

## Langkah-Langkah Implementasi:

### 1. Update Database Schema (PENTING!)

Buka **Supabase Dashboard** → **SQL Editor** →  Copy-paste dan jalankan kode dari file:
```
app/supabase/migrations/001_fix_jobs_schema.sql
```

Atau manual jalankan di SQL Editor:

```sql
-- Step 1: Update jobs table - add missing fields
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_info TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Dompu, NTB',
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Full-time',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Make vendor_id optional
ALTER TABLE jobs
  ALTER COLUMN vendor_id DROP NOT NULL;

-- Step 2: Create media_jobs table (tabel baru untuk job media)
CREATE TABLE IF NOT EXISTS media_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_jobs_job ON media_jobs(job_id);

-- Step 3: Enable RLS & create policies
ALTER TABLE media_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public can read job media"
  ON media_jobs FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public can insert job media"
  ON media_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admins manage job media"
  ON media_jobs FOR ALL USING (auth.role() = 'authenticated');

-- Step 4: Update trigger untuk jobs
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
```

### 2. Verifikasi Perubahan di Admin Panel
- Buka halaman Admin → Manajemen Loker
- Klik "Tambah Loker"
- Test create loker baru dengan:
  - Judul, Nama Perusahaan, Lokasi, Tipe Pekerjaan
  - Contact Info (WA/Email)
  - Gaji Min & Max (optional)
  - Media Banner/Poster
  - Deskripsi & Syarat

### 3. Verifikasi di User Page
- Buka halaman Loker (user view)
- Loker yang baru dibuat harus **muncul otomatis** tanpa perlu refresh halaman
- Data harus lengkap: judul, perusahaan, lokasi, gaji, media

### 4. Test Delete Function
- Buka Admin → Manajemen Loker
- Klik tombol **Hapus** (Trash icon) pada salah satu loker
- Konfirmasi delete
- Loker harus **hilang dari database dan UI**
- Check di user page → loker juga harus hilang

### 5. Test Update Function
- Klik tombol **Edit** (Pencil icon)
- Ubah beberapa field
- Klik "Perbarui Loker"
- Changes harus langsung ter-reflect di list dan user page

---

## Perubahan Code yang Dilakukan:

### File: `app/supabase/schema.sql`
✅ Updated jobs table - tambah fields: company_name, contact_info, location, type
✅ Ubah vendor_id menjadi optional (nullable)
✅ Tambah media_jobs table (tabel terpisah untuk job media)
✅ Tambah RLS policies untuk media_jobs

### File: `app/src/app/admin/jobs/page.tsx`
✅ Update fetchJobs() → query dari media_jobs bukan media
✅ Update handleSave() → insert ke media_jobs dengan benar
✅ Update handleDelete() → explicit delete media_jobs dulu, then jobs
✅ Add error handling & success alerts
✅ Add validation untuk form inputs

### File: `app/src/app/jobs/page.tsx` (User View)
✅ Update getJobs() → query hanya dari jobs table (tidak perlu vendors/media)
✅ Update display → gunakan company_name langsung
✅ Ensure dynamic refresh dengan `export const dynamic = 'force-dynamic'`

---

## Testing Checklist:

- [ ] Migration SQL sudah dijalankan di Supabase
- [ ] Admin bisa create loker baru
- [ ] Loker muncul di admin list
- [ ] Loker muncul di user page (kategori loker) tanpa refresh
- [ ] Admin bisa edit loker
- [ ] Changes muncul otomatis di user page
- [ ] Admin bisa delete loker
- [ ] Loker hilang dari database & UI
- [ ] Media upload berfungsi dengan benar
- [ ] Contact info tersimpan dengan baik
- [ ] Salary/gaji tersimpan dan tampil dengan format currency

---

## Catatan Teknis:

- **vendor_id sekarang optional** - Loker tidak harus terikat ke vendor
- **media_jobs table baru** - Terpisah dari vendor media untuk lebih terstruktur
- **Auto-refresh** - React state management sudah update untuk real-time refresh
- **Cascade delete** - Media loker akan otomatis terhapus saat loker dihapus
- **RLS policies** - Semua orang bisa baca loker, hanya admin yang bisa manage

---

## Troubleshooting:

**Q: Loker masih tidak muncul di user page**
A: Cek apakah:
   - Migration SQL sudah dijalankan di Supabase
   - `force-dynamic` masih ada di `/jobs/page.tsx`
   - Loker sudah created di admin panel
   - Jalankan manual query di Supabase: `SELECT * FROM jobs;`

**Q: Delete tombol tidak bekerja**
A: Cek:
   - Media sudah terhapus dulu dari media_jobs table
   - Check browser console for error messages
   - Verifikasi RLS policies sudah enable

**Q: Edit tidak refresh UI**
A: Sudah fixed - `fetchJobs()` dipanggil setelah update sukses

---
