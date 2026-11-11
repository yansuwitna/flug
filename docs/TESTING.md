# TESTING STRATEGY & LOG: FLAG HUNTER

## Rencana Pengujian

### 1. Unit & Integration Tests (Vitest)
- [x] Validasi Input & Hash Password (Bcryptjs dengan salt 12).
- [x] Flag Normalization (trim spasi, case-sensitive & case-insensitive).
- [x] HMAC-SHA256 Flag Hashing (konsistensi dan anti-collision).
- [x] Algoritma Level Progression (Level 1 s.d. Level 5).
- [x] Rate limiting flag submissions.

### 2. Authorization & Security Tests
- [x] Akses route terlindungi tanpa login redirect otomatis ke `/login`.
- [x] Proteksi RBAC Admin (`/admin/*`), Teacher (`/teacher/*`), Student (`/student/*`).
- [x] Pencegahan IDOR dan pemeriksaan kepemilikan resource di server.
- [x] Kunci flag tidak disimpan dalam bentuk plaintext dan tidak bocor ke browser siswa.

### 3. End-to-End (E2E) Flow Tests
- [x] Flow 1: Admin membuat Tahun Ajaran, Kelas, Mapel, Bab, serta menugaskan Guru dan Siswa.
- [x] Flow 2: Guru membuat Mission (Wizard Step 1-5), menambahkan materi (video embed & teks), membuat Challenge 5 tipe dengan flag hash dan clue bertingkat, lalu menerbitkan (Publish).
- [x] Flow 3: Siswa login, melihat daftar mission di kelasnya, membuka briefing, masuk ke workspace responsif (split desktop & tab mobile), meminta clue bertingkat dengan penalti XP, menangkap flag, dan menyelesaikan misi.
- [x] Flow 4: Siswa melihat XP, level naik, lencana (badge) terbuka, dan namanya masuk di Leaderboard kelas.
- [x] Flow 5: Guru melihat analitik hasil pengerjaan, akurasi challenge, dan mengunduh rekap nilai ke format CSV.

## Log Eksekusi Uji Otomatis
| Tanggal | Target Uji | Status | Detail / Catatan |
|---|---|---|---|
| 2026-11-11 | Normalisasi Flag (Case-insensitive & Sensitive) | **PASSED** | 2 tes lulus |
| 2026-11-11 | HMAC-SHA256 Hash Flag | **PASSED** | 2 tes lulus |
| 2026-11-11 | Bcrypt Password Hashing & Verification | **PASSED** | 1 tes lulus |
| 2026-11-11 | Gamification Level 1 - 5 Progression | **PASSED** | 4 tes lulus |
| 2026-11-11 | ESLint Code Quality Verification | **PASSED** | 0 error, 0 warning |
| 2026-11-11 | Next.js Production Build Compilation | **PASSED** | 19 rute sukses terkompilasi |
