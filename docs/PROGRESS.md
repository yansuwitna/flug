# PROGRESS TRACKER: FLAG HUNTER

## Status Proyek
- Tanggal Mulai: 2026-11-11
- Fase Saat Ini: **Fase 0 - Project Discovery & Setup**

---

### Fase 0 — Project Discovery & Setup
- [x] Membaca dan menganalisis `rencana.md`
- [x] Audit direktori kerja
- [x] Inisialisasi dokumentasi (`PROJECT_PLAN.md`, `ARCHITECTURE.md`, `DATABASE.md`, `PROGRESS.md`, `TESTING.md`)
- [x] Inisialisasi Next.js dengan TypeScript & App Router
- [x] Konfigurasi Tailwind CSS & Font Poppins
- [x] Setup Prisma ORM & `.env.example`
- [x] Verifikasi lint, typecheck, dan build awal (sukses 100%)

### Fase 1 — Database & Authentication
- [x] Rancang `prisma/schema.prisma` lengkap (User, Academic, Mission, Challenge, Submissions, Gamification, Audit)
- [x] Setup database migration & Prisma Client sinkron dengan MySQL 8
- [x] Implementasi Autentikasi aman (bcryptjs, JWT jose, httpOnly cookies)
- [x] Setup Middleware proteksi route berbasis RBAC (`/admin`, `/teacher`, `/student`, `/unauthorized`)
- [x] Seed data awal (1 Admin, 2 Guru, 3 Siswa, Tahun Ajaran, Kelas, Mapel, Bab)
- [x] Verifikasi build, type check, dan lint (100% clean)

### Fase 2 — Academic Management
- [x] CRUD Tahun Ajaran (`/admin/academic-years`) & toggle aktif
- [x] CRUD Kelas (`/admin/classes`) & filter tahun ajaran
- [x] CRUD Mapel (`/admin/subjects`) & Bab/Chapter per mapel (`/admin/subjects/[subjectId]`)
- [x] Manajemen Penugasan Guru ke Kelas-Mapel & Anggota Siswa (`/admin/classes/[classId]`)
- [x] Monitoring Akun Pengguna & Role (`/admin/users`)
- [x] Verifikasi build, type check, dan lint (100% clean)

### Fase 3 — Mission Builder
- [x] CRUD Mission (Draft/Published/Archived) via Server Actions
- [x] Learning Content Manager (Video embed, teks modul bacaan, link referensi)
- [x] Wizard Builder interaktif (`/teacher/missions/new` & `/teacher/missions/[missionId]/builder`)
- [x] Pratinjau Mission (Preview) dari sudut pandang siswa (`/teacher/missions/[missionId]/preview`)
- [x] Verifikasi build, type check, dan lint (100% clean)

### Fase 4 — Challenge, Flag & Clue Engine
- [x] CRUD Challenge & 5 tipe soal (`TEXT`, `NUMERIC`, `MULTIPLE_CHOICE`, `SEQUENCE`, `CASE_STUDY`)
- [x] Sistem Flag dengan hashing/HMAC aman di server (`FlagAnswer` tidak menyimpan plaintext flag)
- [x] Normalisasi input (trim spasi, opsi case-sensitive/insensitive)
- [x] Clue Engine bertingkat & perhitungan penalti poin/XP
- [x] Rate limiting submission (pencegahan brute force)
- [x] Verifikasi build, type check, dan lint (100% clean)

### Fase 5 — Student Experience
- [x] Student Dashboard & Mission Explorer (`/student/dashboard`)
- [x] Mission Briefing & Informasi Pembelajaran (`/student/missions/[missionId]`)
- [x] Mission Workspace responsif Desktop split & Mobile tab (`/student/missions/[missionId]/play`)
- [x] Progress challenge tracker, pembukaan clue dengan penalti, & feedback flag live
- [x] Resume attempt & penyelesaian misi (`completeAttemptAction`)
- [x] Verifikasi build, type check, dan lint (100% clean)

### Fase 6 — Scoring & Gamification
- [x] Transaksi XP aman & kalkulasi skor transaksional (`XpTransaction`, `MissionResult`)
- [x] Sistem 5 Pangkat Level Investigator (`getLevelFromXp`)
- [x] Sistem Lencana Penghargaan (Badges: *First Blood*, *Mission Accomplished*, *Flag Veteran*)
- [x] Halaman Prestasi Siswa & Progression Track (`/student/achievements`)
- [x] Leaderboard Peringkat Kelas Real-time (`/student/leaderboard`)
- [x] Verifikasi build, type check, dan lint (100% clean)

### Fase 7 — Teacher Analytics & Reports
- [x] Dashboard pemantauan analitik progres guru (`/teacher/reports`)
- [x] Laporan detail hasil pengerjaan, akurasi tantangan & clue (`/teacher/missions/[missionId]/results`)
- [x] Ekspor Laporan Nilai Siswa ke CSV (`/api/export/mission/[missionId]`)
- [x] Verifikasi build, type check, dan lint (100% clean)

### Fase 8 — QA, Security & Deployment
- [x] Pengujian Unit & Integrasi otomatis via Vitest (`npm test` passed 100%)
- [x] Audit Keamanan & RBAC (Anti-leak flag hash, rate limit, token HttpOnly, no IDOR)
- [x] Pengujian Responsive UI (Desktop split view & Mobile tabbed view)
- [x] Dokumentasi Deployment, Environment, dan Prosedur Backup/Restore di `README.md`
- [x] Build produksi bersih dan lulus verifikasi type check serta lint (100% clean)
