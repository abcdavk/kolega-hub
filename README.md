# Kolega Hub

## Creator

- **Nama:** Farell Dio Revianzha/123250008
- **GitHub:** [frevszz](https://github.com/frevszz)
- **Nama:** Farieza Davie Rieawan/123250042
- **GitHub:** [abcdavk](https://github.com/abcdavk)
- **Repository:** [github.com/frevszz/kolega-hub](https://github.com/frevszz/kolega-hub)

Kolega Hub adalah aplikasi web untuk memberikan apresiasi dan ulasan antar kolega di lingkungan kerja. Pengguna dapat melihat daftar kolega, memberi penilaian berdasarkan beberapa kategori, mengumpulkan karma dan EXP, naik level, mengatur title pada profil, serta menukarkan karma dengan item yang tersedia di toko.

> **Catatan:** Proyek ini dibuat untuk memenuhi tugas praktikum mata kuliah Pemrograman Web.

Proyek dibangun dengan Next.js App Router, React, Tailwind CSS, TypeScript, dan MariaDB/MySQL.

## Fitur Utama

- Registrasi dan login menggunakan JWT.
- Daftar kolega beserta ringkasan nilai dan title.
- Ulasan dengan penilaian 1-5 pada empat kategori.
- Apresiasi tambahan untuk kolega yang dinilai.
- Sistem reward berupa karma dan feedback EXP.
- Sistem milestone/level.
- Profil pengguna, pembaruan data diri, dan unggah avatar.
- Pengaturan title yang ditampilkan pada profil.
- Toko penukaran karma beserta riwayat penukaran.
- Tampilan terang dan gelap.

## Sistem Poin dan Level

- `karma_balance` adalah saldo karma yang dapat digunakan untuk menukar item di toko.
- `feedback_exp` adalah poin EXP yang digunakan untuk mencapai level berikutnya.
- Setiap ulasan yang berhasil memberikan 250 karma dan feedback EXP sesuai nilai `FEEDBACK_EXP_PER_REVIEW`.
- Target EXP level dihitung menggunakan rumus:

```text
target level = 500 × level
```

Contoh:

| Level | Target EXP |
| ----- | ---------: |
| 1     |        500 |
| 2     |      1.000 |
| 3     |      1.500 |
| 10    |      5.000 |

Saat milestone berhasil diklaim, reward karma ditambahkan dan EXP dikurangi sebesar target level. Jika poin lebih banyak dari target, kelebihannya tetap tersisa sebagai progres awal untuk level berikutnya.

## Teknologi

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- MariaDB/MySQL
- mysql2
- jose untuk JWT
- bcryptjs untuk password hash
- Motion dan Remixicon untuk animasi serta ikon

## Struktur Projek

```text
kolega-hub/
├── database/
│   └── schema.sql          # Skema dan data awal MariaDB/MySQL
├── erd/
│   └── index.html          # ERD database
├── public/                 # Aset publik
├── src/
│   ├── app/
│   │   ├── api/            # REST API Next.js
│   │   │   ├── auth/       # Registrasi dan login
│   │   │   ├── me/         # Profil, title, dan avatar
│   │   │   ├── milestones/ # Data dan klaim milestone
│   │   │   ├── reviews/    # Pembuatan dan pengambilan ulasan
│   │   │   ├── users/      # Daftar dan detail pengguna
│   │   │   └── ...         # Appreciations, titles, toko, redemptions
│   │   ├── profile/        # Halaman profil pengguna
│   │   ├── shop/           # Halaman milestone dan toko
│   │   └── page.tsx        # Halaman daftar kolega
│   ├── components/
│   │   ├── people/         # Komponen kartu kolega
│   │   ├── shop/           # Komponen barang dan konfirmasi penukaran
│   │   └── ui/             # Komponen autentikasi, progress, search, dan popup
│   └── lib/
│       ├── api.ts          # Autentikasi dan respons API
│       ├── authEvents.ts   # Event perubahan sesi
│       ├── db.ts           # Koneksi MariaDB/MySQL
│       ├── milestones.ts   # Rumus target dan reward level
│       └── utils.ts
├── .env.example
├── package.json
└── next.config.ts
```

## Persyaratan

- Node.js 20 atau versi yang lebih baru
- npm
- MariaDB atau MySQL
- Git

## Instalasi

### 1. Masuk ke direktori proyek

```bash
cd kolega-hub
```

### 2. Install dependency

```bash
npm install
```

### 3. Buat database dan import skema

Buat database bernama `kolegahub_db`, lalu import [database/schema.sql](database/schema.sql) menggunakan phpMyAdmin atau MariaDB/MySQL CLI.

Contoh dengan MySQL CLI:

```bash
mysql -u root -p -e "CREATE DATABASE kolegahub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p kolegahub_db < database/schema.sql
```

### 4. Buat file konfigurasi

Salin `.env.example` menjadi `.env.local`, kemudian isi konfigurasi database dan secret JWT.

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Contoh konfigurasi:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=kolegahub_db

JWT_SECRET=isi-dengan-secret-acak-minimal-32-karakter

FEEDBACK_EXP_PER_REVIEW=10
REVIEW_COOLDOWN_HOURS=24
```

Untuk menghasilkan secret JWT yang aman, gunakan salah satu dari perintah berikut:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000` pada browser.

## Cara Penggunaan

### Login atau registrasi

1. Buka aplikasi.
2. Klik area login pada navbar atau buka dialog autentikasi.
3. Registrasikan akun baru atau login menggunakan akun yang tersedia.
4. Token JWT disimpan pada `localStorage` browser dengan key `token`.

### Memberi ulasan

1. Buka halaman utama untuk melihat daftar kolega.
2. Pilih kartu kolega.
3. Isi empat kategori penilaian, komentar opsional, dan apresiasi.
4. Kirim ulasan.
5. Setiap ulasan berhasil menambah 250 karma dan feedback EXP sesuai konfigurasi.

Mengaktifkan cooldown dengan `REVIEW_COOLDOWN_HOURS` mencegah pengguna mengulas kolega yang sama dalam periode tersebut.

### Menggunakan profil

1. Buka halaman profil melalui navbar.
2. Perbarui nama atau divisi.
3. Unggah avatar.
4. Pilih title dan atur urutan title yang tampil pada kartu profil.
5. Lihat ringkasan penilaian serta riwayat ulasan.

### Klaim milestone

1. Buka halaman **Shop**.
2. Perhatikan target EXP pada bagian Milestone.
3. Setelah poin mencapai target, klik **Claim**.
4. Reward karma ditambahkan.
5. EXP dikurangi sebesar target level, dan sisa EXP dapat digunakan untuk level berikutnya.

### Menukar poin karma

1. Buka halaman **Shop**.
2. Pilih barang yang ingin ditukar.
3. Pastikan saldo karma mencukupi dan stok tersedia.
4. Konfirmasikan penukaran.
5. Poin akan berkurang dan transaksi muncul pada riwayat penukaran.

## REST API

Endpoint yang dilindungi memerlukan header:

```text
Authorization: Bearer <token>
```

| Method  | Endpoint                    | Akses        | Keterangan                  |
| ------- | --------------------------- | ------------ | --------------------------- |
| `POST`  | `/api/auth/register`        | Publik       | Registrasi akun             |
| `POST`  | `/api/auth/login`           | Publik       | Login dan memperoleh JWT    |
| `GET`   | `/api/me`                   | Token        | Profil serta saldo pengguna |
| `PATCH` | `/api/me`                   | Token        | Memperbarui nama dan divisi |
| `GET`   | `/api/users`                | Publik       | Daftar kolega               |
| `GET`   | `/api/users/:id`            | Publik       | Detail kolega               |
| `GET`   | `/api/reviews`              | Publik       | Daftar ulasan               |
| `POST`  | `/api/reviews`              | Token        | Membuat ulasan              |
| `GET`   | `/api/appreciations`        | Publik       | Daftar apresiasi            |
| `GET`   | `/api/titles`               | Publik       | Daftar title                |
| `PUT`   | `/api/me/titles`            | Token        | Memperbarui title profil    |
| `POST`  | `/api/me/avatar`            | Token        | Mengunggah avatar           |
| `GET`   | `/api/milestones`           | Publik/Token | Daftar milestone            |
| `POST`  | `/api/milestones/:id/claim` | Token        | Klaim milestone             |
| `GET`   | `/api/shop-items`           | Publik       | Daftar barang toko          |
| `GET`   | `/api/redemptions`          | Token        | Riwayat penukaran           |
| `POST`  | `/api/redemptions`          | Token        | Menukar karma dengan barang |

Respons error menggunakan format JSON:

```json
{
  "error": "Pesan error"
}
```

## Skrip yang Tersedia

```bash
npm run dev       # Menjalankan server development
npm run build     # Membuat build produksi
npm run start     # Menjalankan build produksi
npm run lint      # Menjalankan pemeriksaan lint
npm run lint:fix  # Memperbaiki masalah lint bila tersedia
```

## Build Produksi

```bash
npm run build
npm run start
```

Pastikan `.env.local` tetap tersedia pada server produksi dan MariaDB dapat diakses oleh aplikasi.
