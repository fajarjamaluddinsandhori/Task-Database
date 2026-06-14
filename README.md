# Materi Distribusi App

MVP untuk dosen yang ingin `upload sekali, distribusikan ke banyak kelas sekaligus`.

Stack utama:

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `Supabase`
- `PostgreSQL`

## Fitur yang sudah aktif

- CRUD `kelas`
- Upload file + CRUD `materi`
- Distribusi satu materi ke banyak kelas lewat `material_distributions`
- Dashboard ringkas untuk melihat jumlah kelas, materi, dan distribusi

## Setup lokal

1. Salin file env contoh:

```bash
copy .env.example .env.local
```

2. Isi nilai berikut:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

3. Jalankan SQL schema di Supabase SQL Editor:

- `supabase/schema.sql`

4. Jalankan aplikasi:

```bash
npm install
npm run dev
```

5. Buka:

- [http://localhost:3000](http://localhost:3000)

## Catatan implementasi

- Backend saat ini memakai `SUPABASE_SERVICE_ROLE_KEY` di sisi server agar flow CRUD dan upload file bisa langsung hidup tanpa auth dulu.
- Bucket file yang dipakai bernama `materials`.
- Auth pengguna belum diwajibkan pada fase ini agar fokus tetap pada alur inti MVP.

## Verifikasi

Perintah yang sudah dipakai untuk memeriksa project:

```bash
npm run lint
npm run build
```
