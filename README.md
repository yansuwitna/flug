# FLAG HUNTER

> **Tagline:** *Discover Knowledge. Capture the Flag.*  
> Platform pembelajaran interaktif berbasis investigasi, video, dan tantangan gamifikasi bendera pengetahuan (flag).

---

## 🚀 Fitur Utama MVP

1. **Role-Based Access Control (RBAC):**
   - **Administrator:** Manajemen akun pengguna, tahun ajaran aktif, kelas rombel, kurikulum mata pelajaran, dan plotting guru serta siswa.
   - **Guru (Pengajar):** Dashboard kelas yang diampu, Mission Builder wizard 5-langkah, materi modul (video embed YouTube, dokumen, link), Challenge Editor dengan 5 tipe soal, clue bertingkat, dan analitik laporan nilai beserta ekspor CSV.
   - **Siswa (Student):** Mission Explorer, Briefing Misi, Mission Workspace interaktif (Desktop split-screen, Mobile responsif tab), sistem rate-limited flag submission, akumulasi XP live, pangkat investigator, lencana penghargaan (*Badges*), dan Leaderboard kelas.

2. **Keamanan Jawaban Flag (Anti-Leak by Design):**
   - Kunci jawaban flag disimpan sebagai HMAC-SHA256 hash dengan salt rahasia server.
   - Client browser tidak pernah menerima kunci jawaban atau plaintext flag.
   - Normalisasi spasi dan *case-sensitivity* fleksibel.
   - Rate limiting pengiriman jawaban untuk mencegah brute-force.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack, TypeScript strict mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Typography:** Font **Poppins** via `next/font/google`
- **Database:** MySQL 8
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Autentikasi:** Stateless JWT (`jose`) dengan HttpOnly Secure Cookies & Bcrypt Password Hashing
- **Icons:** [Lucide React](https://lucide.dev/)
- **Pengujian:** [Vitest](https://vitest.dev/)

---

## ⚙️ Petunjuk Instalasi & Menjalankan Aplikasi

### 1. Prasyarat Sistem
- Node.js versi 18+ (direkomendasikan Node.js 20+)
- Layanan database **MySQL 8** aktif dan berjalan.

### 2. Salin Konfigurasi Environment
Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Sesuaikan variabel di `.env` dengan kredensial MySQL lokal Anda:
```env
DATABASE_URL="mysql://flag_user:flag_secret_123@localhost:3306/flag_hunter"
AUTH_SECRET="flag_hunter_jwt_super_secret_auth_key_2026_xyz123"
NEXT_PUBLIC_APP_NAME="FLAG HUNTER"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Sinkronisasi Skema Database & Seeder
Jalankan migrasi skema Prisma ke database MySQL dan masukkan data demonstrasi awal:

```bash
npx prisma db push
npm run seed
```

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Akses platform di peramban: `http://localhost:3000`.

---

## 🔑 Akun Demonstrasi (Default Password: `password123`)

Lihat dokumen lengkap di [`akun.md`](./akun.md):

| Role | Nama | Email | Akses Halaman |
|---|---|---|---|
| **ADMIN** | Administrator Utama | `admin@flaghunter.local` | `/admin/dashboard` |
| **TEACHER** | Budi Santoso, S.Kom | `guru1@flaghunter.local` | `/teacher/dashboard` |
| **TEACHER** | Siti Rahmawati, M.Pd | `guru2@flaghunter.local` | `/teacher/dashboard` |
| **STUDENT** | Ahmad Fadillah | `siswa1@flaghunter.local` | `/student/dashboard` |
| **STUDENT** | Dewi Lestari | `siswa2@flaghunter.local` | `/student/dashboard` |
| **STUDENT** | Rizky Pratama | `siswa3@flaghunter.local` | `/student/dashboard` |

---

## 🧪 Pengujian & Pemeriksaan Kode

```bash
# Menjalankan unit tests
npm test

# Menjalankan linting ESLint
npm run lint

# Menjalankan kompilasi build produksi
npm run build
```

## 📖 Panduan Deployment Lengkap

Panduan langkah demi langkah untuk rilis produksi di **VPS (Ubuntu/Debian, Nginx, PM2, SSL Let's Encrypt)**, **Cloud Hosting (cPanel Node.js Selector)**, maupun **Docker / Coolify / Dokploy** tersedia lengkap di:

👉 [**Panduan Deployment VPS & Hosting (docs/DEPLOYMENT.md)**](./docs/DEPLOYMENT.md)

---

## 💾 Backup & Pemulihan Database

### Backup:
```bash
mysqldump -u flag_user -p flag_hunter > backup_flag_hunter.sql
```

### Restore:
```bash
mysql -u flag_user -p flag_hunter < backup_flag_hunter.sql
```
