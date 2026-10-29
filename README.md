# Belajar Vibe Coding NestJS

Backend REST API boilerplate dibangun menggunakan **NestJS**, **Prisma ORM**, dan database **MySQL**.

---

## 🛠 Tech Stack
- **Runtime:** Node.js 22 LTS
- **Framework:** NestJS 10.x
- **ORM:** Prisma 6.x
- **Database:** MySQL
- **Package Manager:** npm 10.x

---

## 📁 Struktur Direktori
```text
belajar-vibe-coding-nestjs/
├── prisma/
│   └── schema.prisma         # Prisma Schema (MySQL provider)
├── src/
│   ├── prisma/
│   │   ├── prisma.module.ts  # Global Prisma Module
│   │   └── prisma.service.ts # Prisma Service & Lifecycle hooks
│   ├── app.controller.ts     # Health check & root endpoints
│   ├── app.service.ts
│   ├── app.module.ts
│   └── main.ts               # Entrypoint aplikasi
├── .env.example              # Template environment variable
├── package.json
└── README.md
```

---

## 🚀 Panduan Setup & Menjalankan Project

### 1. Prasyarat
- Pastikan **Node.js 22 LTS** dan **npm 10.x** sudah terpasang.
- Pastikan instance **MySQL** berjalan dan dapat diakses.

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan nilai `DATABASE_URL` pada file `.env` dengan kredensial MySQL Anda:
```env
PORT=3000
DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<database_name>"
```

### 4. Setup Prisma (Generate Client & Migrasi)
Generate Prisma Client:
```bash
npx prisma generate
```

Jalankan migrasi database saat Anda mendefinisikan model baru:
```bash
npx prisma migrate dev --name init
```

Membuka Prisma Studio (GUI database):
```bash
npx prisma studio
```

### 5. Menjalankan Aplikasi
```bash
# Development mode (dengan watch mode)
npm run start:dev

# Production build & run
npm run build
npm run start:prod
```

### 6. Menjalankan Pengujian
```bash
# Unit test
npm run test

# End-to-end (e2e) test
npm run test:e2e
```

---

## 📡 Endpoints Tersedia
- `GET /` : Endpoint tes standar (`Hello World!`)
- `GET /health` : Endpoint status kesehatan server dan koneksi database MySQL
