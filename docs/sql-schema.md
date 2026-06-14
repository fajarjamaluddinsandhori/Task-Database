# SQL schema MVP

Dokumen ini merangkum schema SQL untuk MVP `materi-distribusi-app`. Versi SQL yang bisa langsung dipakai ada di file berikut:

- `supabase/schema.sql`

## Tabel utama

### 1. `classes`

Menyimpan data kelas yang diampu dosen.

Kolom penting:

- `name`: nama kelas
- `course_code`: kode mata kuliah, opsional
- `semester_label`: label semester
- `participant_count`: jumlah peserta
- `status`: `active | archived`

### 2. `materials`

Menyimpan materi sebagai entitas pusat yang bisa dipakai ulang lintas kelas.

Kolom penting:

- `title`: judul materi
- `description`: deskripsi singkat, opsional
- `original_file_name`: nama file asli
- `storage_path`: path file di bucket Supabase Storage
- `public_url`: URL file yang bisa dibuka dari aplikasi
- `mime_type`: tipe file
- `size_bytes`: ukuran file
- `material_type`: `pdf | docx | pptx | xlsx | link | other`

### 3. `material_distributions`

Menyimpan relasi many-to-many antara `materials` dan `classes`.

Kolom penting:

- `class_id`: relasi ke tabel `classes`
- `material_id`: relasi ke tabel `materials`
- `distributed_at`: waktu distribusi dibuat

## Storage

Schema juga menyiapkan bucket publik `materials` di Supabase Storage. Bucket ini dipakai untuk menyimpan file materi, lalu URL publiknya dicatat di tabel `materials`.

## Catatan desain

1. Schema sengaja dibuat ringkas agar cocok untuk MVP dosen multi-kelas.
2. Tipe enum tetap memakai `check constraint` supaya mudah dipahami pemula.
3. `materials` tidak menyimpan `class_id`, sehingga satu materi bisa dipakai ulang ke banyak kelas.
4. Operasi CRUD dijalankan dari sisi server memakai `SUPABASE_SERVICE_ROLE_KEY`, jadi auth pengguna belum diwajibkan pada fase ini.
