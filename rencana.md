# RENCANA PENGEMBANGAN FLAG HUNTER

## Product Blueprint & Implementation Plan untuk Google Antigravity

  Informasi                           Keputusan
  ----------------------------------- ---------------------------------------
  Nama produk                         FLAG HUNTER
  Tagline                             Discover Knowledge. Capture the Flag.
  Versi dokumen                       1.1
  Target                              MVP
  Jenis aplikasi                      Standalone Learning Platform
  Cakupan                             Semua mata pelajaran
  Frontend dan full-stack framework   Next.js
  Styling                             Tailwind CSS
  Font utama                          Poppins
  Database                            MySQL 8
  Bahasa antarmuka                    Bahasa Indonesia
  Target perangkat                    Desktop, tablet, smartphone

------------------------------------------------------------------------

# 1. Tujuan Dokumen

Dokumen ini merupakan instruksi utama untuk Antigravity dalam merancang,
mengembangkan, menguji, dan mendokumentasikan FLAG HUNTER.

FLAG HUNTER adalah platform pembelajaran interaktif berbasis investigasi
dan gamifikasi. Guru memberikan video atau materi pembelajaran, kemudian
siswa menyelesaikan tantangan dengan menemukan jawaban tersembunyi yang
disebut **flag**, berdasarkan pertanyaan dan petunjuk (*clue*).

Aplikasi harus menjadi produk yang benar-benar berfungsi. Jangan hanya
membuat landing page, mockup, atau halaman statis. Fitur harus terhubung
dengan database, validasi server, autentikasi, otorisasi, dan alur
pengguna yang benar.

# 2. Instruksi Kerja untuk Antigravity

Sebelum melakukan perubahan kode:

1.  Periksa repository dan lingkungan proyek yang tersedia.
2.  Jika repository sudah berisi aplikasi, pahami struktur dan
    konvensinya. Jangan menghapus kode atau fitur yang masih digunakan.
3.  Buat dan pelihara dokumen:
    -   `docs/PROJECT_PLAN.md`
    -   `docs/ARCHITECTURE.md`
    -   `docs/DATABASE.md`
    -   `docs/PROGRESS.md`
    -   `docs/TESTING.md`
4.  Buat implementasi secara bertahap berdasarkan fase dalam dokumen
    ini.
5.  Setelah setiap fase, jalankan lint, type check, test, dan build yang
    relevan.
6.  Perbaiki error sebelum melanjutkan ke fase berikutnya.
7.  Jangan mengklaim pengujian berhasil jika belum benar-benar
    dijalankan.
8.  Catat asumsi dan keputusan teknis yang belum ditentukan.
9.  Jangan memasang dependency besar atau layanan eksternal tanpa
    alasan.
10. Jangan mengganti teknologi yang telah ditetapkan tanpa persetujuan.
11. Prioritaskan keamanan, konsistensi data, aksesibilitas,
    responsivitas, dan kemudahan penggunaan oleh guru.
12. Gunakan data contoh/seed yang jelas ditandai sebagai data
    demonstrasi, bukan data nyata.

**Instruksi penting:** gunakan Next.js sebagai fondasi aplikasi,
Tailwind CSS untuk styling, dan Poppins sebagai font utama. Jangan
menggunakan Laravel, Vue, Inertia, Bootstrap, atau AdminLTE untuk
implementasi ini.

# 3. Visi dan Filosofi Produk

## 3.1 Visi

Menjadikan pembelajaran sebagai pengalaman eksplorasi yang interaktif,
menantang, menyenangkan, dan berorientasi pada pemecahan masalah.

## 3.2 Filosofi pembelajaran

Alur utama:

1.  **Watch** --- siswa menonton video atau mempelajari materi.
2.  **Explore** --- siswa mengeksplorasi informasi.
3.  **Investigate** --- siswa menganalisis pertanyaan dan memecahkan
    tantangan.
4.  **Capture** --- siswa mengirim flag sebagai bukti pemahaman.
5.  **Reflect** --- siswa melihat hasil, umpan balik, dan progres.

## 3.3 Prinsip produk

-   Universal: dapat digunakan untuk semua mata pelajaran.
-   Teacher-friendly: guru non-programmer dapat membuat mission.
-   Student-centered: siswa dapat belajar mandiri dan mengulang materi.
-   Game-inspired, bukan game-only: permainan harus mendukung tujuan
    belajar.
-   Measurable: aktivitas dan hasil belajar dapat dianalisis guru.
-   Secure by design: kunci jawaban, skor, dan validasi dikelola server.
-   Responsive: nyaman digunakan pada desktop, tablet, dan smartphone.
-   Accessible: navigasi jelas, kontras baik, label terbaca, dan tidak
    bergantung pada warna saja.

# 4. Teknologi dan Konvensi Teknis

Gunakan versi stabil yang kompatibel pada saat proyek dimulai. Periksa
dokumentasi resmi dan versi package sebelum instalasi.

  -----------------------------------------------------------------------
  Lapisan                             Teknologi
  ----------------------------------- -----------------------------------
  Framework                           Next.js dengan App Router

  Bahasa                              TypeScript

  UI                                  React

  Styling                             Tailwind CSS

  Font                                Poppins melalui `next/font/google`

  Database                            MySQL 8

  ORM                                 Prisma ORM

  Authentication                      Auth.js atau solusi autentikasi
                                      Next.js yang terpelihara

  Validation                          Zod

  Forms                               React Hook Form + Zod bila
                                      diperlukan

  Icons                               Lucide React

  Charts                              Recharts atau library ringan

  Testing unit/integration            Vitest atau Jest dan React Testing
                                      Library

  Testing end-to-end                  Playwright

  Package manager                     Ikuti lockfile repository; jika
                                      baru, gunakan npm

  Deployment                          Node.js hosting/VPS; Docker
                                      opsional
  -----------------------------------------------------------------------

### Ketentuan teknis

-   Gunakan Next.js App Router.
-   Gunakan TypeScript strict mode.
-   Gunakan Server Components secara default.
-   Gunakan Client Components hanya untuk interaksi yang memerlukan
    state/event browser.
-   Gunakan Server Actions atau Route Handlers untuk operasi server
    sesuai kebutuhan.
-   Jangan menaruh akses database atau secret di Client Components.
-   Semua validasi input harus diulang di server.
-   Gunakan Prisma migrations untuk perubahan skema database.
-   Simpan konfigurasi rahasia hanya pada environment variables server.
-   Buat `.env.example`, jangan pernah commit `.env`.
-   Hindari dependency yang tidak diperlukan.

# 5. Pengguna dan Hak Akses

MVP memiliki tiga role.

## 5.1 Administrator

-   Mengelola akun guru dan siswa.
-   Mengelola kelas dan tahun ajaran.
-   Mengelola mata pelajaran.
-   Mengelola keanggotaan kelas.
-   Melihat statistik platform.
-   Mengatur konfigurasi dasar.
-   Mengakses audit log sesuai kewenangan.

## 5.2 Guru

-   Melihat kelas yang ditugaskan.
-   Mengelola mata pelajaran/topik yang diajar.
-   Membuat dan mengelola mission.
-   Menambahkan video, teks, tautan, dan dokumen.
-   Membuat challenge, flag, dan clue.
-   Mengatur poin, penalti, batas waktu, percobaan, dan publikasi.
-   Melihat progres, hasil, dan riwayat siswa.
-   Mengekspor laporan.

Guru hanya boleh mengelola kelas dan mission yang menjadi kewenangannya,
kecuali memiliki hak administrator.

## 5.3 Siswa

-   Login ke aplikasi.
-   Melihat kelas yang diikuti.
-   Melihat mission yang tersedia.
-   Membaca briefing dan tujuan pembelajaran.
-   Mengakses video dan materi.
-   Mengerjakan challenge.
-   Meminta clue.
-   Mengirim flag.
-   Melihat status jawaban dan progres.
-   Melihat XP, level, badge, leaderboard, dan riwayat mission.

Siswa tidak boleh mengakses kunci flag, konfigurasi internal challenge,
data pribadi siswa lain, atau laporan guru.

# 6. Ruang Lingkup MVP

## 6.1 Fitur wajib

  -----------------------------------------------------------------------
  Modul                               Fitur
  ----------------------------------- -----------------------------------
  Authentication                      Login, logout, reset password

  User Management                     CRUD pengguna dan role

  Academic Management                 Kelas, tahun ajaran, mata
                                      pelajaran, topik

  Class Membership                    Mengelola guru dan siswa dalam
                                      kelas

  Mission Management                  Membuat, mengubah, melihat,
                                      mengarsipkan, menerbitkan mission

  Learning Content                    Video embed, tautan, teks, dokumen

  Challenge Engine                    Membuat dan mengerjakan tantangan

  Flag Validation                     Validasi jawaban secara aman di
                                      server

  Clue Engine                         Petunjuk bertingkat dan penalti
                                      opsional

  Mission Attempt                     Memulai, melanjutkan, menyelesaikan
                                      mission

  Gamification                        Score, XP, level, badge sederhana

  Progress                            Progres siswa dan status challenge

  Leaderboard                         Peringkat XP dalam cakupan kelas

  Analytics                           Ringkasan hasil dan aktivitas siswa

  Reporting                           Laporan mission dan hasil siswa

  Responsive UI                       Desktop, tablet, smartphone
  -----------------------------------------------------------------------

## 6.2 Di luar ruang lingkup MVP

Jangan implementasikan sebelum MVP stabil:

-   Aplikasi Android/iOS native.
-   AI tutor atau chatbot.
-   Pembuatan soal otomatis menggunakan AI.
-   Multiplayer real-time.
-   Chat antarsiswa.
-   Marketplace mission.
-   Integrasi Moodle.
-   Video conference.
-   Sistem ujian adaptif.
-   Integrasi pembayaran.
-   Multi-tenant SaaS berbayar.

Arsitektur boleh disiapkan agar fitur lanjutan memungkinkan, tetapi
jangan menambahkan kompleksitas yang belum diperlukan.

# 7. Arsitektur Aplikasi

Gunakan pendekatan modular berbasis domain. Pisahkan UI, business logic,
akses database, dan validasi.

## 7.1 Domain utama

-   Identity: autentikasi, pengguna, role, permission.
-   Academic: kelas, tahun ajaran, mata pelajaran, topik, keanggotaan.
-   Learning: mission dan learning content.
-   Challenge: challenge, flag, clue, submission.
-   Progress: attempt, status, hasil.
-   Gamification: XP transaction, level, badge, leaderboard.
-   Analytics: ringkasan dan laporan.

## 7.2 Struktur direktori yang disarankan

``` text
flag-hunter/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── images/
│   ├── icons/
│   └── placeholders/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   ├── (teacher)/
│   │   │   └── teacher/
│   │   ├── (student)/
│   │   │   └── student/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layouts/
│   │   ├── mission/
│   │   ├── challenge/
│   │   ├── learning/
│   │   └── gamification/
│   ├── features/
│   │   ├── auth/
│   │   ├── academic/
│   │   ├── missions/
│   │   ├── challenges/
│   │   ├── progress/
│   │   └── reports/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── validation/
│   │   ├── security/
│   │   └── utils/
│   ├── server/
│   │   ├── services/
│   │   └── repositories/
│   ├── types/
│   └── middleware.ts
├── docs/
├── tests/
├── .env.example
├── package.json
└── README.md
```

Struktur dapat disesuaikan dengan konvensi Next.js yang dipilih, tetapi
pemisahan domain dan tanggung jawab harus dipertahankan.

## 7.3 Pola implementasi

-   `app/`: routing, layouts, pages, loading, error boundaries, route
    handlers.
-   `components/`: komponen UI yang dapat digunakan ulang.
-   `features/`: komponen dan skema khusus fitur.
-   `server/services/`: aturan bisnis.
-   `server/repositories/`: query database bila abstraksi repository
    diperlukan.
-   `lib/`: konfigurasi dan utilitas bersama.
-   `prisma/`: schema, migration, dan seed.

Jangan memaksakan repository pattern untuk setiap query sederhana. Pilih
abstraksi yang menjaga kode tetap jelas dan mudah diuji.

# 8. Rancangan Database

Gunakan MySQL dengan Prisma ORM. Semua relasi harus mempunyai foreign
key, index, dan aturan delete/update yang sesuai.

## 8.1 Tabel inti

### Identitas dan akademik

-   `User`: nama, email, password hash/provider, role/status.
-   `AcademicYear`: tahun ajaran dan status aktif.
-   `SchoolClass`: nama kelas, tingkat, program/jurusan, tahun ajaran.
-   `ClassMember`: relasi user dengan kelas dan peran keanggotaan.
-   `Subject`: kode dan nama mata pelajaran.
-   `ClassSubject`: relasi kelas, mata pelajaran, dan guru.
-   `Chapter`: bab/topik mata pelajaran.

### Pembelajaran

-   `Mission`: chapter, classSubject, creator, judul, slug, deskripsi,
    tujuan belajar, kesulitan, status, aturan, waktu, total poin.
-   `LearningContent`: mission, tipe konten, judul, isi, URL media,
    urutan, durasi opsional.

Tipe konten MVP: - `VIDEO_EMBED` - `VIDEO_FILE` bila penyimpanan file
sudah tersedia - `TEXT` - `LINK` - `DOCUMENT`

### Challenge

-   `Challenge`: mission, judul, pertanyaan, deskripsi, tipe jawaban,
    poin, urutan, status, aturan percobaan.
-   `FlagAnswer`: challenge, answer hash/HMAC, metadata normalisasi.
-   `Clue`: challenge, judul, isi petunjuk, urutan, penalti XP, status.
-   `ChallengeOption`: opsi pilihan untuk multiple choice, jika
    diperlukan.

Tipe challenge MVP: - `TEXT` - `NUMERIC` - `MULTIPLE_CHOICE` -
`SEQUENCE` - `CASE_STUDY`

Untuk multiple choice dan sequence, simpan opsi secara terstruktur.
Jangan mengirim kunci jawaban atau penanda jawaban benar ke browser
siswa.

### Aktivitas dan hasil

-   `MissionAttempt`: user, mission, status, startedAt, completedAt,
    attemptNumber.
-   `FlagSubmission`: attempt, challenge, submitted answer, status
    benar/salah, poin diperoleh, waktu submit.
-   `ClueUsage`: attempt, clue, penalti aktual, waktu digunakan.
-   `MissionResult`: attempt, total score, XP earned, ringkasan hasil,
    waktu penyelesaian.
-   `XpTransaction`: user, sumber transaksi, referensi, jumlah XP
    positif/negatif, keterangan, waktu.

### Gamification dan audit

-   `Badge`: nama, deskripsi, ikon, kriteria, status.
-   `UserBadge`: user, badge, waktu diperoleh.
-   `AuditLog`: aktor, aksi, resource, metadata aman, waktu.

## 8.2 Relasi utama

-   Satu Subject memiliki banyak Chapter.
-   Satu SchoolClass memiliki banyak ClassMember.
-   Satu SchoolClass memiliki banyak ClassSubject.
-   Satu ClassSubject menghubungkan kelas, mata pelajaran, dan guru.
-   Satu Chapter memiliki banyak Mission.
-   Satu Mission memiliki banyak LearningContent dan Challenge.
-   Satu Challenge memiliki satu atau lebih FlagAnswer dan banyak Clue.
-   Satu siswa dapat memiliki banyak MissionAttempt.
-   Satu Attempt memiliki banyak FlagSubmission dan ClueUsage.
-   Satu Attempt menghasilkan satu MissionResult sesuai aturan
    penyelesaian.
-   Setiap perubahan XP dicatat sebagai XpTransaction.

## 8.3 Aturan integritas data

-   Email pengguna unik.
-   Keanggotaan kelas tidak boleh ganda.
-   Gunakan foreign key dan unique constraints.
-   Tambahkan index pada kolom filter dan pencarian.
-   Cegah submission ganda yang tidak disengaja.
-   Tetapkan kebijakan attempt ulang.
-   Simpan snapshot poin dan aturan penting saat attempt dimulai.
-   Perubahan mission tidak boleh mengubah hasil historis secara
    diam-diam.
-   Gunakan database transaction saat menerima flag dan memberikan XP.
-   Jangan menghapus riwayat yang diperlukan untuk laporan.
-   Simpan tanggal dalam format database yang konsisten dan tampilkan
    sesuai zona waktu aplikasi.

# 9. Aturan Flag, Clue, Score, dan XP

## 9.1 Format flag

Contoh:

``` text
FLAG{IP_ADDRESS}
FLAG{NETWORK_LAYER}
FLAG{192.168.1.1}
```

Format tersebut hanya contoh. Guru dapat menentukan format dan jawaban
yang diterima sesuai mata pelajaran.

## 9.2 Validasi flag

-   Validasi dilakukan sepenuhnya di server.
-   Normalisasi dapat dikonfigurasi per challenge.
-   Pilihan normalisasi: trim spasi, case-insensitive, dan aturan spasi
    internal.
-   Jangan mengubah jawaban secara agresif hingga mengubah makna.
-   Gunakan HMAC dengan secret aplikasi atau mekanisme penyimpanan hash
    yang sesuai.
-   Untuk beberapa variasi jawaban, simpan beberapa hash jawaban.
-   Jangan pernah mengirim jawaban asli atau hash flag ke browser siswa.
-   Terapkan rate limit dan catat submission.
-   Pesan kesalahan tidak boleh membocorkan jawaban.
-   Jangan menyimpan secret di source code atau client bundle.

## 9.3 Clue

Setiap challenge dapat memiliki beberapa clue berurutan. Guru menentukan
penalti tiap clue.

Contoh: - Clue 1: petunjuk umum, penalti 0 XP. - Clue 2: petunjuk arah,
penalti 5 XP. - Clue 3: petunjuk spesifik, penalti 10 XP.

Clue yang telah dibuka dicatat. Siswa tidak dikenai penalti berulang
untuk clue yang sama dalam attempt yang sama, kecuali aturan mission
menyatakan lain.

## 9.4 Score dan XP

Pisahkan: - Score: hasil pada satu mission. - XP: akumulasi pengalaman
siswa. - Level: ditentukan berdasarkan total XP. - Badge: penghargaan
berdasarkan kriteria.

Rumus awal:

`XP challenge = max(0, poin dasar - penalti clue)`

Total XP attempt adalah jumlah XP challenge yang berhasil diselesaikan,
dengan batas sesuai aturan mission.

XP harus dihitung di server. Setiap transaksi harus mempunyai sumber dan
referensi unik agar retry request tidak menggandakan XP.

# 10. User Flow

## 10.1 Administrator

1.  Login.
2.  Membuka dashboard.
3.  Mengelola pengguna.
4.  Mengelola tahun ajaran dan kelas.
5.  Mengelola mata pelajaran.
6.  Menetapkan guru dan anggota kelas.
7.  Memantau statistik aplikasi.

## 10.2 Guru

1.  Login.
2.  Membuka dashboard guru.
3.  Memilih kelas dan mata pelajaran.
4.  Membuat chapter/topik.
5.  Membuat mission sebagai draft.
6.  Mengisi judul, deskripsi, tujuan, kesulitan, dan aturan.
7.  Menambahkan video dan materi.
8.  Membuat challenge.
9.  Menambahkan flag dan clue.
10. Mengatur poin, batas waktu, dan percobaan.
11. Preview sebagai siswa.
12. Publish mission.
13. Memantau aktivitas dan hasil siswa.
14. Mengekspor laporan.

## 10.3 Siswa

1.  Login.
2.  Melihat dashboard dan kelas yang diikuti.
3.  Memilih mission tersedia.
4.  Membaca mission briefing.
5.  Menonton video dan membaca materi.
6.  Membuka challenge.
7.  Menginvestigasi pertanyaan.
8.  Meminta clue bila diperlukan.
9.  Mengirim flag.
10. Mendapat feedback benar/salah.
11. Menyelesaikan semua challenge.
12. Melihat hasil, XP, badge, dan progres.

Siswa dapat membuka kembali materi saat mengerjakan challenge. Prasyarat
menonton video boleh menjadi pengaturan opsional guru, bukan perilaku
default.

# 11. UI/UX dan Design System

## 11.1 Arah visual

Nama: **FLAG HUNTER**\
Tagline: **Discover Knowledge. Capture the Flag.**

Arah desain: modern learning dashboard dengan aksen gamifikasi. Jangan
membuat seluruh aplikasi menyerupai terminal hacker. Platform harus
nyaman digunakan untuk semua mata pelajaran.

### Warna

  Token              Warna
  ------------------ -----------
  Navy               `#111827`
  Slate              `#1F2937`
  Green              `#16A34A`
  Cyan               `#38BDF8`
  Light background   `#F8FAFC`
  White surface      `#FFFFFF`
  Main text          `#0F172A`

Gunakan token warna melalui konfigurasi/theme CSS agar mudah diubah.
Pastikan kontras teks memenuhi praktik aksesibilitas.

### Typography: Poppins

Gunakan `next/font/google` untuk memuat Poppins. Definisikan font pada
root layout dan gunakan CSS variable, misalnya `--font-poppins`. Jangan
mengimpor font melalui tag stylesheet eksternal jika `next/font` dapat
digunakan.

Gunakan bobot secukupnya: - 400 Regular - 500 Medium - 600 SemiBold -
700 Bold

## 11.2 Layout berdasarkan role

### Admin

Sidebar: - Dashboard - Users - Classes - Academic Years - Subjects -
Settings - Audit Logs

### Guru

Sidebar: - Dashboard - My Classes - Subjects - Missions - Reports -
Profile

### Siswa

Navigasi: - Dashboard - My Missions - My Classes - Leaderboard -
Achievements - History - Profile

Gunakan komponen layout yang konsisten, tetapi sesuaikan menu dan konten
dengan role.

## 11.3 Halaman MVP

### Umum

-   Login
-   Forgot Password
-   Profile
-   Access Denied
-   Not Found
-   Error Boundary

### Admin

-   Dashboard
-   Users: list, create, edit, detail
-   Classes: list, create, edit, detail
-   Academic Years
-   Subjects
-   Class Membership
-   Settings
-   Audit Logs

### Guru

-   Dashboard
-   My Classes
-   Class Detail
-   Subject/Chapter Management
-   Missions Index
-   Mission Create/Edit
-   Mission Builder
-   Challenge Editor
-   Flag & Clue Editor
-   Mission Preview
-   Mission Results
-   Student Progress
-   Reports

### Siswa

-   Dashboard
-   My Classes
-   Mission Explorer
-   Mission Detail/Briefing
-   Mission Workspace
-   Challenge Detail
-   Mission Result
-   Leaderboard
-   Achievements
-   Learning History
-   Profile

## 11.4 Mission Workspace

Ini adalah halaman terpenting.

Desktop: - Header berisi nama mission, status, timer bila aktif, dan
progres. - Panel kiri berisi video/materi. - Panel kanan berisi
challenge, pertanyaan, clue, dan input flag. - Progress flag selalu
terlihat. - Feedback submission jelas dan tidak membocorkan jawaban.

Mobile: - Layout satu kolom. - Gunakan tab Materi dan Challenge. -
Tombol submit mudah dijangkau. - Tidak boleh ada overflow horizontal. -
Status dan progres tetap mudah ditemukan.

## 11.5 Mission Builder

Gunakan wizard lima langkah:

1.  Mission Information.
2.  Learning Content.
3.  Create Challenges.
4.  Configure Flags & Clues.
5.  Preview & Publish.

Sediakan validasi per langkah, indikator kelengkapan, draft, preview
siswa, dan konfirmasi sebelum publish.

# 12. Routing dan Proteksi Halaman

Gunakan route group Next.js App Router untuk memisahkan layout, bukan
sebagai pengganti otorisasi server.

Prefix yang disarankan: - `/admin` - `/teacher` - `/student` -
`/missions` untuk workspace yang tetap memeriksa akses.

Contoh route: - `/admin/dashboard` - `/admin/users` - `/admin/classes` -
`/admin/subjects` - `/teacher/dashboard` - `/teacher/missions` -
`/teacher/missions/new` - `/teacher/missions/[missionId]/edit` -
`/teacher/missions/[missionId]/preview` - `/teacher/reports` -
`/student/dashboard` - `/student/missions` -
`/student/missions/[missionId]` - `/student/missions/[missionId]/play` -
`/student/leaderboard` - `/student/achievements`

Setiap operasi server harus memeriksa session, role, kepemilikan
resource, keanggotaan kelas, status mission, dan izin akses. Jangan
hanya menyembunyikan menu di frontend.

# 13. Keamanan

Wajib diterapkan:

1.  Password disimpan dengan algoritma hash yang aman melalui solusi
    autentikasi terpilih.
2.  Validasi input server-side menggunakan Zod atau validasi setara.
3.  Otorisasi dilakukan di server untuk setiap resource.
4.  Kunci jawaban flag tidak dikirim ke client.
5.  Rate limiting untuk pengiriman flag dan login.
6.  XP dihitung dan diberikan di server.
7.  Gunakan transaksi database untuk submission dan pemberian XP.
8.  Proteksi terhadap IDOR dengan pemeriksaan akses setiap resource.
9.  Batasi tipe dan ukuran file upload.
10. Validasi URL video dan dokumen.
11. Hindari rendering HTML tidak tepercaya.
12. Audit aktivitas sensitif.
13. Gunakan secure cookies dan konfigurasi session yang benar.
14. Simpan secret hanya di environment server.
15. Jangan menampilkan stack trace atau detail database pada production.
16. Siapkan backup database dan prosedur pemulihan.

# 14. File Upload dan Video

Untuk MVP: - Dukung YouTube/Vimeo embed melalui domain yang diizinkan. -
Dukung tautan eksternal yang tervalidasi. - Dukung upload dokumen hanya
jika storage dan batas ukuran telah dikonfigurasi. - Jangan menyimpan
file besar langsung sebagai blob di MySQL. - Simpan metadata file di
database dan file di filesystem/object storage. - Pastikan file privat
hanya dapat diakses pengguna berwenang. - Gunakan placeholder jika media
belum tersedia.

# 15. Analytics dan Laporan

Dashboard guru minimal menampilkan: - Jumlah siswa yang ditugaskan. -
Jumlah siswa yang memulai mission. - Jumlah siswa yang menyelesaikan
mission. - Rata-rata score. - Tingkat penyelesaian. - Challenge dengan
tingkat jawaban benar tertinggi/terendah. - Frekuensi penggunaan clue. -
Riwayat submission.

Laporan harus dapat difilter berdasarkan kelas, mata pelajaran, mission,
dan rentang waktu. Ekspor CSV dapat menjadi fitur MVP jika waktu
memungkinkan.

Jangan menyimpulkan motivasi atau kompetensi siswa hanya dari XP.
Sajikan data sebagai indikator aktivitas dan hasil, bukan diagnosis
otomatis.

# 16. Seed dan Data Demonstrasi

Buat seed data yang memudahkan pengujian:

-   1 administrator.
-   2 guru.
-   1 kelas demonstrasi.
-   2 mata pelajaran berbeda.
-   2 topik.
-   2 mission.
-   Beberapa learning content.
-   Beberapa challenge dengan tipe berbeda.
-   Clue bertingkat.
-   Beberapa akun siswa.
-   Badge demonstrasi.

Sediakan kredensial development dalam dokumentasi lokal saja. Jangan
menggunakan password default yang sama di production. Tandai semua data
seed sebagai data demonstrasi.

# 17. Rencana Implementasi Bertahap

Estimasi berikut adalah perkiraan hari kerja untuk satu developer yang
memahami Next.js, React, TypeScript, dan database. Sesuaikan setelah
audit repository.

## Fase 0 --- Project Discovery & Setup

-   Periksa repository.
-   Setup Next.js App Router dan TypeScript.
-   Setup Tailwind CSS.
-   Setup Poppins melalui `next/font/google`.
-   Setup lint, format, dan environment.
-   Setup Prisma dan koneksi MySQL.
-   Buat dokumentasi proyek.

**Kriteria selesai:** aplikasi berjalan, halaman awal tampil, koneksi
database teruji, lint/typecheck/build berjalan.

## Fase 1 --- Database & Authentication

-   Rancang Prisma schema.
-   Buat migration.
-   Implementasikan autentikasi.
-   Implementasikan role admin, teacher, student.
-   Implementasikan protected server routes/actions.
-   Buat seed awal.

**Kriteria selesai:** pengguna dapat login dan hanya mengakses area
sesuai role.

## Fase 2 --- Academic Management

-   CRUD tahun ajaran.
-   CRUD kelas.
-   CRUD mata pelajaran.
-   CRUD chapter.
-   Penugasan guru.
-   Keanggotaan siswa.

**Kriteria selesai:** guru dan siswa terhubung dengan kelas serta mata
pelajaran yang benar.

## Fase 3 --- Mission Builder

-   CRUD mission.
-   Status draft/published/archived.
-   Learning content.
-   Upload/link video dan dokumen sesuai batasan.
-   Wizard builder.
-   Preview mission.

**Kriteria selesai:** guru dapat membuat dan menerbitkan mission yang
dapat dilihat siswa yang berhak.

## Fase 4 --- Challenge, Flag & Clue Engine

-   CRUD challenge.
-   Lima tipe challenge.
-   Pengelolaan variasi flag.
-   Validasi flag di server.
-   Clue bertingkat.
-   Rate limiting.
-   Riwayat submission dan clue usage.

**Kriteria selesai:** jawaban benar/salah diproses aman dan riwayat
tersimpan konsisten.

## Fase 5 --- Student Experience

-   Student dashboard.
-   Mission explorer.
-   Mission briefing.
-   Video dan materi.
-   Mission workspace.
-   Progress challenge.
-   Resume attempt.

**Kriteria selesai:** siswa dapat menyelesaikan alur mission dari awal
hingga akhir pada desktop dan mobile.

## Fase 6 --- Scoring & Gamification

-   Score mission.
-   XP transaction.
-   Level.
-   Badge.
-   Leaderboard.
-   Mission result.

**Kriteria selesai:** XP tidak dapat dimanipulasi dari client dan tidak
terduplikasi ketika request diulang.

## Fase 7 --- Teacher Analytics & Reports

-   Dashboard guru.
-   Hasil per mission.
-   Detail progres siswa.
-   Statistik challenge.
-   Filter laporan.
-   Ekspor CSV bila memungkinkan.

**Kriteria selesai:** guru dapat melihat dan mengunduh data hasil
pembelajaran yang sesuai kewenangannya.

## Fase 8 --- QA, Security & Deployment

-   Unit dan integration tests.
-   End-to-end tests untuk alur utama.
-   Uji akses antar-role.
-   Uji responsive.
-   Uji keamanan submission.
-   Uji performa dasar.
-   Dokumentasi deployment.
-   Backup dan recovery checklist.

**Kriteria selesai:** semua acceptance criteria MVP lulus dan aplikasi
dapat dijalankan pada environment target.

# 18. Acceptance Criteria MVP

  Area             Kriteria
  ---------------- ---------------------------------------------------------
  Authentication   Admin, guru, siswa dapat login/logout
  Authorization    Pengguna tidak dapat mengakses resource tanpa izin
  Academic         Admin dapat mengelola kelas dan mapel
  Mission          Guru dapat membuat dan menerbitkan mission
  Content          Siswa dapat mengakses materi sesuai izin
  Challenge        Lima tipe challenge dapat dikerjakan
  Flag             Jawaban benar diterima dan jawaban salah ditolak
  Security         Kunci flag tidak terlihat pada client
  Clue             Clue terbuka sesuai urutan dan aturan penalti
  Attempt          Progres dapat dilanjutkan
  Score            Skor konsisten dengan aturan mission
  XP               XP tercatat sebagai transaksi dan tidak terduplikasi
  Progress         Status challenge dan mission tersimpan
  Leaderboard      Peringkat sesuai cakupan dan aturan
  Analytics        Guru melihat hasil siswa di kelasnya
  Responsive       Halaman utama dapat digunakan di desktop dan smartphone
  Quality          Lint, typecheck, test, dan production build berhasil

# 19. Strategi Pengujian

Buat pengujian minimal untuk:

### Authentication dan authorization

-   Login benar dan salah.
-   Akses halaman tanpa login.
-   Siswa mencoba membuka dashboard guru.
-   Guru mencoba mengakses kelas guru lain.
-   Siswa mencoba membuka mission yang tidak ditugaskan.

### Mission

-   Draft tidak terlihat oleh siswa.
-   Mission published dapat diakses peserta yang berhak.
-   Mission archived tidak dapat dimulai.
-   Perubahan mission tidak merusak hasil attempt lama.

### Flag dan clue

-   Jawaban benar.
-   Jawaban salah.
-   Normalisasi huruf besar/kecil sesuai konfigurasi.
-   Variasi jawaban yang diterima.
-   Rate limit.
-   Clue dibuka satu kali.
-   Request ganda tidak menggandakan XP.

### Gamification

-   XP sesuai poin dan penalti.
-   XP tidak dapat diubah dari client.
-   Leaderboard tidak membocorkan informasi pribadi.
-   Badge diberikan satu kali sesuai kriteria.

### UI

-   Desktop.
-   Tablet.
-   Smartphone.
-   Loading, empty, error, dan success state.
-   Keyboard navigation dan label form.

# 20. Deployment dan Environment

Buat `.env.example` dengan variabel yang diperlukan, misalnya:

``` env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/flag_hunter"
AUTH_SECRET="replace-with-strong-random-secret"
NEXT_PUBLIC_APP_NAME="FLAG HUNTER"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Sesuaikan nama environment variables dengan library autentikasi dan
konfigurasi aktual.

Jangan masukkan secret nyata ke repository. Dokumentasikan: - Instalasi
dependency. - Konfigurasi database. - Menjalankan migration. -
Menjalankan seed. - Menjalankan development server. - Menjalankan
test. - Production build. - Deployment. - Backup dan restore database.

Aplikasi harus dapat dijalankan dengan perintah standar yang dicantumkan
di README.

# 21. Prioritas UX dan Kualitas

-   Gunakan Poppins secara konsisten.
-   Gunakan Tailwind CSS untuk seluruh styling.
-   Buat komponen Button, Input, Select, Modal, Card, Badge, Table,
    Tabs, Alert, Progress, dan Empty State yang konsisten.
-   Gunakan skeleton/loading state pada proses asynchronous.
-   Sediakan pesan error yang mudah dipahami.
-   Sediakan konfirmasi untuk tindakan destruktif.
-   Gunakan pagination untuk daftar panjang.
-   Gunakan filter dan pencarian pada tabel penting.
-   Hindari animasi berlebihan.
-   Pastikan tampilan mobile bukan sekadar desktop yang diperkecil.
-   Gunakan semantic HTML dan aksesibilitas keyboard.
-   Jangan gunakan data dummy hardcoded sebagai pengganti fitur backend
    yang seharusnya sudah terhubung.

# 22. Perintah Awal untuk Antigravity

Mulai dengan membaca seluruh dokumen `RENCANA.md` ini. Kemudian:

1.  Audit repository dan laporkan kondisi awal.
2.  Identifikasi apakah proyek baru atau proyek yang sudah berjalan.
3.  Buat rencana tugas terurut dan checklist pada `docs/PROGRESS.md`.
4.  Ajukan pertanyaan hanya jika ada keputusan penting yang benar-benar
    menghalangi implementasi.
5.  Implementasikan Fase 0 terlebih dahulu.
6.  Jalankan lint, typecheck, test, dan build.
7.  Laporkan file yang dibuat/diubah, perintah yang dijalankan, hasil
    aktual, dan kendala.
8.  Lanjutkan fase berikutnya secara bertahap setelah fase sebelumnya
    diverifikasi.
9.  Jangan berhenti pada desain UI. Bangun fungsionalitas end-to-end
    sampai acceptance criteria MVP terpenuhi.
10. Perbarui dokumentasi dan checklist setiap kali menyelesaikan fase.

## Definisi selesai

MVP FLAG HUNTER dinyatakan selesai ketika admin dapat menyiapkan kelas
dan pengguna, guru dapat membuat serta menerbitkan mission berisi materi
dan challenge, siswa dapat mempelajari materi dan menangkap flag, sistem
mencatat clue, score, XP, serta progres dengan aman, dan guru dapat
melihat laporan hasil pembelajaran.

------------------------------------------------------------------------

**Arah produk final:** FLAG HUNTER --- *Discover Knowledge. Capture the
Flag.*\
**Stack final:** Next.js + TypeScript + Tailwind CSS + Poppins +
Prisma + MySQL.\
**Strategi:** bangun MVP modular, aman, responsif, dan dapat digunakan
untuk seluruh mata pelajaran.