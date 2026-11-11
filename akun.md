# DAFTAR AKUN DEMO FLAG HUNTER

Dokumen ini berisi daftar kredensial akun demonstrasi yang dibuat secara otomatis oleh `prisma/seed.ts` untuk pengujian dan evaluasi fungsionalitas platform **FLAG HUNTER**.

> [!NOTE]  
> Seluruh akun di bawah menggunakan kata sandi default yang sama:  
> **Password:** `password123`

---

## 1. Akun Administrator
Role ini memiliki akses penuh ke manajemen platform, pengguna, kelas, tahun ajaran, dan mata pelajaran.

| Role | Nama | Email | Password | Halaman Masuk |
|---|---|---|---|---|
| **ADMIN** | Administrator Utama | `admin@flaghunter.local` | `password123` | `/admin/dashboard` |

---

## 2. Akun Guru (Pengajar)
Role ini bertugas mengelola kelas yang diampu, merancang Bab, membuat Mission (video/materi), menyusun Challenge & Clue, serta memantau hasil analisis siswa.

| Role | Nama | Email | Mata Pelajaran / Catatan | Password | Halaman Masuk |
|---|---|---|---|---|---|
| **TEACHER** | Budi Santoso, S.Kom | `guru1@flaghunter.local` | Guru TIK / Jaringan Dasar (Kelas X RPL 1) | `password123` | `/teacher/dashboard` |
| **TEACHER** | Siti Rahmawati, M.Pd | `guru2@flaghunter.local` | Guru IPA / Sains Demonstrasi | `password123` | `/teacher/dashboard` |

---

## 3. Akun Siswa (Student)
Role ini berfokus pada pengalaman belajar: menonton video materi, memecahkan challenge, meminta clue, dan menangkap bendera (*flag*) untuk mengumpulkan XP serta bersaing di peringkat kelas.

| Role | Nama | Email | Kelas Terdaftar | Password | Halaman Masuk |
|---|---|---|---|---|---|
| **STUDENT** | Ahmad Fadillah | `siswa1@flaghunter.local` | X RPL 1 | `password123` | `/student/dashboard` |
| **STUDENT** | Dewi Lestari | `siswa2@flaghunter.local` | X RPL 1 | `password123` | `/student/dashboard` |
| **STUDENT** | Rizky Pratama | `siswa3@flaghunter.local` | X RPL 1 | `password123` | `/student/dashboard` |

---

## 4. Cara Menjalankan Seeder Kembali
Jika basis data perlu di-reset atau diisi ulang dengan data demonstrasi di atas, jalankan perintah:

```bash
npx tsx prisma/seed.ts
```
