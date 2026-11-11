# ARCHITECTURE: FLAG HUNTER

## 1. Ikhtisar Arsitektur
FLAG HUNTER dibangun dengan pendekatan arsitektur monolitik modern berbasis domain menggunakan **Next.js App Router** dan **TypeScript**.

### Komponen Utama:
- **Presentation Layer:** Next.js Server & Client Components, Tailwind CSS, Lucide Icons.
- **Business Logic Layer:** Server Services & Server Actions yang menjalankan validasi aturan bisnis, otorisasi, dan kalkulasi skor/XP.
- **Data Access Layer:** Prisma ORM yang terhubung dengan MySQL 8.
- **Security & Validation:** Zod schema validation di client dan server, hash/HMAC verification untuk flag answer, session-based RBAC.

## 2. Struktur Direktori
```text
flag/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (admin)/
│   │   ├── (teacher)/
│   │   ├── (student)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layouts/
│   │   ├── mission/
│   │   ├── challenge/
│   │   └── gamification/
│   ├── features/
│   │   ├── auth/
│   │   ├── academic/
│   │   ├── missions/
│   │   ├── challenges/
│   │   └── reports/
│   ├── lib/
│   │   ├── db/
│   │   ├── auth/
│   │   ├── security/
│   │   └── utils/
│   ├── server/
│   │   └── services/
│   └── types/
├── docs/
└── tests/
```

## 3. Aliran Data Flag Validation
1. Siswa mengirimkan flag melalui Client Component `MissionWorkspace`.
2. Server Action / Route Handler menerima payload dan menjalankan rate-limiting serta otentikasi sesi.
3. Server mengecek apakah challenge milik mission yang sedang aktif dan attempt valid.
4. Input dinormalisasi sesuai aturan challenge (trim, lowercase/uppercase jika insensitive).
5. Hash/HMAC input dicocokkan dengan `FlagAnswer` di database.
6. Hasil disimpan secara transaksional di `FlagSubmission` dan `XpTransaction` (jika benar & first solve).
7. Server mengembalikan status (BENAR/SALAH/POIN) tanpa pernah mengekspos kunci flag ke client.
