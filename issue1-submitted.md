# Issue: Setup NestJS Project with Prisma and MySQL

## 1. Overview & Objective
Inisialisasi project backend baru berbasis **Node.js** di root directory saat ini menggunakan framework **NestJS**, ORM **Prisma**, dan database **MySQL**. Dokumen ini berfungsi sebagai panduan instruksi tingkat tinggi (*high-level plan*) bagi programmer atau AI agent untuk tahap implementasi.

---

## 2. Tech Stack
- **Runtime:** Node.js 22 LTS
- **Framework:** NestJS 10.x
- **ORM:** Prisma 6.x
- **Database:** MySQL
- **Package Manager:** npm 10.x

---

## 3. High-Level Implementation Steps

### Phase 1: Inisialisasi Project NestJS
- Inisialisasi project NestJS langsung di direktori root saat ini tanpa membuat subfolder baru yang bersarang (*nested*).
- Pastikan struktur dasar NestJS (seperti `src/`, `package.json`, `tsconfig.json`, `.gitignore`, dan file konfigurasi standar lainnya) terbentuk dengan benar.
- Pastikan script dasar (`start`, `start:dev`, `build`, `test`) tersedia di `package.json`.

### Phase 2: Integrasi Prisma & Database MySQL
- Install dependensi Prisma (Prisma CLI sebagai dev dependency dan Prisma Client sebagai runtime dependency).
- Inisialisasi Prisma dengan provider `mysql`.
- Siapkan file template environment (`.env` dan `.env.example`) yang memuat connection string `DATABASE_URL` untuk MySQL.
- Buat skema awal di file `prisma/schema.prisma` yang sudah mengarah ke database MySQL.

### Phase 3: Arsitektur Prisma Service di NestJS
- Buat module/service khusus untuk Prisma (misal `PrismaService` & `PrismaModule`) agar koneksi Prisma Client dapat di-inject dan digunakan di seluruh modul NestJS.
- Konfigurasi lifecycle hook NestJS (`onModuleInit` / `enableShutdownHooks`) pada `PrismaService` untuk mengelola koneksi database secara graceful.

### Phase 4: Endpoint Verifikasi (Health Check)
- Buat atau modifikasi controller default untuk menyediakan endpoint health check sederhana (misal `GET /` atau `GET /health`).
- Pastikan endpoint dapat memvalidasi bahwa server NestJS berjalan normal dan koneksi database responsif.

### Phase 5: Dokumentasi & Validasi Akhir
- Perbarui `README.md` dengan instruksi cara:
  1. Menjalankan instalasi dependency.
  2. Mengonfigurasi environment variable.
  3. Menjalankan migrasi Prisma.
  4. Menjalankan aplikasi dalam mode development (`npm run start:dev`).
- Pastikan build project (`npm run build`) berjalan sukses tanpa error TypeScript.

---

## 4. Definition of Done (DoD)
1. Project NestJS berhasil di-build dan berjalan di mode development.
2. Prisma terkonfigurasi dengan provider MySQL dan siap untuk pembuatan model/migrasi.
3. `PrismaService` tersedia sebagai injectable service di NestJS.
4. Terdapat file `.env.example` sebagai referensi konfigurasi environment.
5. `README.md` memuat panduan setup yang jelas.
