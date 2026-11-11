# DESAIN BASIS DATA: FLAG HUNTER

Sistem Basis Data: **MySQL 8**  
ORM: **Prisma ORM**  
Penamaan: **Bahasa Indonesia (Tabel Snake Case di MySQL, Model Pascal Case di Prisma)**

---

## 1. Tabel Pengguna & Autentikasi (Terpisah per Peran)
- **`admin` (`Admin`)**:
  - Kolom: `id`, `nama`, `email`, `kata_sandi`, `status`, `url_foto`, `dibuat_pada`, `diperbarui_pada`
- **`guru` (`Guru`)**:
  - Kolom: `id`, `nip` (unik opsional), `nama`, `email`, `kata_sandi`, `status`, `url_foto`, `dibuat_pada`, `diperbarui_pada`
- **`siswa` (`Siswa`)**:
  - Kolom: `id`, `nisn` (unik opsional), `nama`, `email`, `kata_sandi`, `status`, `url_foto`, `dibuat_pada`, `diperbarui_pada`

---

## 2. Struktur Akademik & Kelas
- **`tahun_ajaran` (`TahunAjaran`)**: `id`, `nama`, `tanggal_mulai`, `tanggal_selesai`, `aktif`, `dibuat_pada`, `diperbarui_pada`
- **`kelas` (`Kelas`)**: `id`, `nama`, `tingkat`, `jurusan`, `id_tahun_ajaran`, `dibuat_pada`, `diperbarui_pada`
- **`anggota_kelas` (`AnggotaKelas`)**: `id`, `id_kelas`, `id_siswa`, `bergabung_pada`
- **`mata_pelajaran` (`MataPelajaran`)**: `id`, `kode`, `nama`, `deskripsi`, `dibuat_pada`, `diperbarui_pada`
- **`mapel_kelas` (`MapelKelas`)**: `id`, `id_kelas`, `id_mata_pelajaran`, `id_guru`, `dibuat_pada`, `diperbarui_pada`
- **`bab` (`Bab`)**: `id`, `id_mata_pelajaran`, `judul`, `deskripsi`, `nomor_urut`, `dibuat_pada`, `diperbarui_pada`

---

## 3. Misi Pembelajaran & Konten
- **`misi` (`Misi`)**: `id`, `id_mapel_kelas`, `id_bab`, `id_pembuat` (Guru), `judul`, `slug`, `deskripsi`, `tujuan_belajar`, `tingkat_kesulitan`, `status`, `durasi_menit`, `maks_percobaan`, `total_poin`, `nomor_urut`, `diterbitkan_pada`, `dibuat_pada`, `diperbarui_pada`
- **`konten_belajar` (`KontenBelajar`)**: `id`, `id_misi`, `tipe_konten`, `judul`, `isi`, `url_media`, `nomor_urut`, `durasi_detik`, `dibuat_pada`, `diperbarui_pada`

---

## 4. Sistem Tantangan & Flag Kriptografis
- **`tantangan` (`Tantangan`)**: `id`, `id_misi`, `judul`, `pertanyaan`, `deskripsi`, `tipe_tantangan`, `poin`, `nomor_urut`, `maks_mencoba`, `dibuat_pada`, `diperbarui_pada`
- **`opsi_tantangan` (`OpsiTantangan`)**: `id`, `id_tantangan`, `teks_opsi`, `nomor_urut`, `dibuat_pada`
- **`kunci_jawaban` (`KunciJawaban`)**: `id`, `id_tantangan`, `hash_jawaban` (HMAC-SHA256), `huruf_besar_kecil`, `pangkas_spasi`, `dibuat_pada`
- **`petunjuk` (`Petunjuk`)**: `id`, `id_tantangan`, `judul`, `teks_petunjuk`, `penalti_xp`, `nomor_urut`, `dibuat_pada`

---

## 5. Pengerjaan Misi, Transaksi XP & Gamifikasi
- **`percobaan_misi` (`PercobaanMisi`)**: `id`, `id_siswa`, `id_misi`, `nomor_percobaan`, `status`, `dimulai_pada`, `selesai_pada`
- **`kiriman_jawaban` (`KirimanJawaban`)**: `id`, `id_percobaan`, `id_tantangan`, `jawaban_terkirim`, `benar`, `poin_didapat`, `dikirim_pada`
- **`penggunaan_petunjuk` (`PenggunaanPetunjuk`)**: `id`, `id_percobaan`, `id_petunjuk`, `penalti_dipotong`, `dibuka_pada`
- **`hasil_misi` (`HasilMisi`)**: `id`, `id_percobaan`, `total_skor`, `xp_didapat`, `selesai_pada`
- **`transaksi_xp` (`TransaksiXp`)**: `id`, `id_siswa`, `jumlah`, `sumber`, `id_referensi`, `deskripsi`, `dibuat_pada`
- **`lencana` (`Lencana`)**: `id`, `nama`, `slug`, `deskripsi`, `url_ikon`, `kriteria`, `dibuat_pada`
- **`lencana_siswa` (`LencanaSiswa`)**: `id`, `id_siswa`, `id_lencana`, `diberikan_pada`
- **`log_audit` (`LogAudit`)**: `id`, `id_admin`, `aksi`, `target`, `metadata`, `dibuat_pada`
