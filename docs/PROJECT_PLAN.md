# PROJECT PLAN: FLAG HUNTER

**Tagline:** Discover Knowledge. Capture the Flag.  
**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Poppins, MySQL 8, Prisma ORM.

## Fase Pengembangan

- [x] **Fase 0: Project Discovery & Setup**
  - Setup Next.js App Router, TypeScript, Tailwind CSS.
  - Setup Poppins font via `next/font/google`.
  - Setup linting, formatting, environment variables.
  - Setup Prisma ORM & MySQL connection configuration.
  - Setup struktur folder & dokumentasi proyek.
- [x] **Fase 1: Database & Authentication**
  - Rancang skema database Prisma (Users, Roles, Sessions).
  - Setup sistem autentikasi (Auth.js/NextAuth atau custom session aman).
  - RBAC (Admin, Teacher, Student) dan route protection/middleware.
  - Seed awal user demonstrasi.
- [x] **Fase 2: Academic Management**
  - CRUD Tahun Ajaran & Kelas.
  - CRUD Mata Pelajaran & Chapter/Topik.
  - Hubungan Guru dan Siswa ke Kelas/Mapel.
- [x] **Fase 3: Mission Builder**
  - CRUD Mission (Draft/Published/Archived).
  - Learning Content (Video embed, text, link, document).
  - 5-step wizard Mission Builder untuk guru.
  - Fitur Mission Preview.
- [x] **Fase 4: Challenge, Flag & Clue Engine**
  - CRUD Challenge (5 tipe: Text, Numeric, Multiple Choice, Sequence, Case Study).
  - Clue bertingkat dengan penalti XP/Score.
  - Validasi Flag aman di server (HMAC/Hashing, case normalization, anti-leak).
  - Rate limiting submission.
- [x] **Fase 5: Student Experience**
  - Student Dashboard & Mission Explorer.
  - Mission Briefing & Content Viewer.
  - Mission Workspace (Desktop split-view, Mobile tabbed-view).
  - Progress tracker & attempt resumption.
- [x] **Fase 6: Scoring & Gamification**
  - Perhitungan Score & XP aman di server (transaksional).
  - Leveling system & Badge unlock.
  - Leaderboard per kelas.
- [x] **Fase 7: Teacher Analytics & Reports**
  - Dashboard analitik guru.
  - Detail submission, frekuensi clue, & tingkat kesulitan challenge.
  - Export data/laporan (CSV).
- [x] **Fase 8: QA, Security & Deployment**
  - Test unit & integration (Vitest).
  - Test E2E & security audit.
  - Dokumentasi deployment & production run.
