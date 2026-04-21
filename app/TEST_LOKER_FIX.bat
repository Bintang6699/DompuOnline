#!/batch
REM ============================================
REM Setup & Testing Script untuk Fix Loker Bug
REM Jalankan di Command Prompt (Admin)
REM ============================================

@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================
echo SETUP & TESTING - FIX LOKER BUG
echo ============================================
echo.

REM Step 1: Informasi penting
echo [LANGKAH 1] Informasi Penting
echo.
echo SEBELUM TEST, ANDA HARUS:
echo 1. Buka Supabase Dashboard
echo 2. Ke SQL Editor
echo 3. Copy-paste teks dari file: app/supabase/migrations/001_fix_jobs_schema.sql
echo 4. JALANKAN SQL di Supabase (WAJIB!)
echo.
echo Tekan Enter setelah SQL migration selesai dijalankan...
pause

REM Step 2: Info struktur perubahan
echo.
echo [LANGKAH 2] Ringkas Perubahan Database
echo.
echo Jobs Table sekarang punya field tambahan:
echo   - company_name (TEXT) - Nama Perusahaan
echo   - contact_info (TEXT) - WA/Email
echo   - location (TEXT) - Lokasi Kerja (default: Dompu, NTB)
echo   - type (TEXT) - Tipe Pekerjaan (default: Full-time)
echo   - updated_at (TIMESTAMPTZ) - Auto-update trigger
echo   - vendor_id sekarang NULLABLE (opsional)
echo.
echo Tabel baru: media_jobs
echo   - job_id FK ke jobs(id) ON DELETE CASCADE
echo   - type (image/video)
echo   - url (TEXT) - Link media
echo   - auto-delete saat job dihapus
echo.

REM Step 3: Instruksi testing
echo.
echo [LANGKAH 3] TESTING MANUAL
echo.
echo Buka browser dan ikuti test cases berikut:
echo.
echo TEST 1 - CREATE LOKER
echo ---------------------
echo 1. Buka: http://localhost:3000/admin/jobs
echo 2. Login ke admin
echo 3. Klik tombol [+] "Tambah Loker"
echo 4. Isi form:
echo    - Posisi: "Junior Developer"
echo    - Perusahaan: "PT Dompu Tech"
echo    - Lokasi: "Dompu, NTB"
echo    - Tipe: "Full-time"
echo    - Kontak: "0822XXXXXX"
echo    - Gaji Min: "3000000" (optional)
echo    - Gaji Max: "5000000" (optional)
echo    - Deskripsi: "Cari developer muda berbakat..."
echo    - Syarat: "Minimal lulusan SMA/SMK..."
echo    - Media: Add min 1 gambar/video URL
echo 5. Klik "Publikasikan Loker"
echo 6. Tunggu notif "Loker berhasil ditambahkan!"
echo.
echo EXPECTED RESULT:
echo ✓ Loker muncul di list admin jobs (refresh otomatis)
echo ✓ Buka tab baru: http://localhost:3000/jobs (user view)
echo ✓ Loker yang baru ditambah HARUS MUNCUL tanpa refresh
echo.

echo TEST 2 - EDIT LOKER
echo -------------------
echo 1. Di admin jobs page
echo 2. Cari loker yang baru dibuat
echo 3. Klik tombol Edit (Pencil icon)
echo 4. Ubah beberapa field, misal:
echo    - Ubah gaji min/max
echo    - Ubah deskripsi
echo    - Tambah media baru
echo 5. Klik "Perbarui Loker"
echo 6. Tunggu notif "Loker berhasil diperbarui!"
echo.
echo EXPECTED RESULT:
echo ✓ Changes langsung terlihat di admin list
echo ✓ Switch ke user page (/jobs)
echo ✓ Changes harus ter-reflect otomatis
echo ✓ Media baru harus visible
echo.

echo TEST 3 - DELETE LOKER
echo --------------------
echo 1. Di admin jobs page
echo 2. Klik tombol Delete (Trash icon) pada loker
echo 3. Konfirmasi "Yakin ingin menghapus lowongan ini?"
echo 4. Klik "OK"
echo 5. Tunggu notif "Loker berhasil dihapus!"
echo.
echo EXPECTED RESULT:
echo ✓ Loker hilang dari admin list (refresh otomatis)
echo ✓ Media loker juga hilang dari database
echo ✓ Switch ke user page (/jobs)
echo ✓ Loker juga harus hilang dari sana
echo.

echo TEST 4 - FORCE DYNAMIC (Cache Refresh)
echo ------------------------------------
echo 1. Admin: Create loker baru
echo 2. Jangan refresh user page
echo 3. Loker seharusnya LANGSUNG muncul (tanpa refresh)
echo 4. Ini karena force-dynamic pada getJobs()
echo.
echo.
echo ============================================
echo DEBUGGING TIPS
echo ============================================
echo.
echo Kalau ada masalah, check:
echo.
echo 1. DATABASE ERROR?
echo    - Buka Supabase Dashboard
echo    - SQL Editor: SELECT * FROM jobs;
echo    - Cek apakah loker sudah ada di database
echo    - Cek apakah media_jobs table sudah ada
echo.
echo 2. LOKER TIDAK MUNCUL DI USER PAGE?
echo    - Pastikan migration SQL sudah dijalankan
echo    - Check browser console (F12) untuk error
echo    - Manual jalankan query: SELECT * FROM jobs;
echo    - Pastikan loker punya status 'published' atau tidak ada filter lain
echo.
echo 3. DELETE TIDAK BEKERJA?
echo    - Check apakah RLS policies sudah enable
echo    - Check apakah auth.role() = 'authenticated' working
echo    - Lihat error di browser console (F12)
echo.
echo 4. UPLOAD IMAGE GAGAL?
echo    - Cek supabase bucket 'media' sudah create + public
echo    - Cek RLS storage policies sudah enable
echo    - Coba masukan URL manual (bukan upload)
echo.

echo.
echo ============================================
echo SELESAI!
echo ============================================
echo.
echo File dokumentasi: app/BUGFIX_LOKER.md
echo Pastikan semua TEST CASE sudah passed sebelum deploy!
echo.
pause
