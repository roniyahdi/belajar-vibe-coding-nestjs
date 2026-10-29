# Issue: Implementasi API Registrasi User

## 1. Overview & Objective
Membuat fitur registrasi user baru dengan endpoint `POST /api/users`. Fitur ini mencakup pembuatan tabel `users` di database MySQL menggunakan Prisma migration, hashing password menggunakan bcrypt, serta validasi duplikasi email.

---

## 2. Spesifikasi Database

### Tabel `users`
| Kolom        | Tipe           | Constraint                     |
|-------------|----------------|--------------------------------|
| `id`        | `INTEGER`      | Primary Key, Auto Increment    |
| `name`      | `VARCHAR(255)` | NOT NULL                       |
| `email`     | `VARCHAR(255)` | NOT NULL, UNIQUE               |
| `password`  | `VARCHAR(255)` | NOT NULL (bcrypt hash)         |
| `created_at`| `TIMESTAMP`    | DEFAULT CURRENT_TIMESTAMP      |

---

## 3. Spesifikasi API

### Endpoint
```
POST /api/users
```

### Request Body
```json
{
    "name": "Roni",
    "email": "roni@gmail.com",
    "password": "rahasia"
}
```

### Response Body (Success - 201 Created)
```json
{
    "data": "OK"
}
```

### Response Body (Error - 400 Bad Request)
```json
{
    "error": "Email sudah terdaftar"
}
```

---

## 4. Konvensi Struktur Folder & Penamaan File

### Struktur folder di dalam `src/`
```text
src/
├── prisma/                   # (sudah ada) PrismaModule & PrismaService
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── routes/                   # Controller / Routing API
│   └── users-route.ts        # Controller untuk endpoint /api/users
├── services/                 # Business logic
│   └── user-service.ts       # Service berisi logika registrasi
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
```

### Format penamaan file
- **Routes (Controller):** `<nama-resource>-route.ts` → contoh: `users-route.ts`
- **Services:** `<nama-resource>-service.ts` → contoh: `user-service.ts`

---

## 5. Tahapan Implementasi (Step-by-Step)

### Tahap 1: Install Dependensi Baru
- Install package `bcrypt` untuk hashing password:
  ```bash
  npm install bcrypt
  npm install -D @types/bcrypt
  ```

### Tahap 2: Definisikan Model Prisma
- Buka file `prisma/schema.prisma`.
- Tambahkan model `User` dengan field sesuai spesifikasi tabel di atas.
- Field `email` harus memiliki constraint `@unique`.
- Field `password` menyimpan hasil hash bcrypt (bukan plain text).
- Jalankan migrasi Prisma:
  ```bash
  npx prisma migrate dev --name add-users-table
  ```
- Pastikan Prisma Client ter-generate ulang setelah migrasi.

### Tahap 3: Buat Service (`src/services/user-service.ts`)
- Buat class `UserService` dengan decorator `@Injectable()`.
- Inject `PrismaService` melalui constructor.
- Buat method `register(name, email, password)` yang:
  1. Cek apakah `email` sudah terdaftar di database menggunakan `prisma.user.findUnique()`.
  2. Jika email sudah ada, throw error / exception dengan pesan `"Email sudah terdaftar"`.
  3. Jika email belum ada, hash `password` menggunakan `bcrypt.hash()` (gunakan salt rounds = 10).
  4. Simpan data user baru ke database menggunakan `prisma.user.create()`.
  5. Return `"OK"` jika berhasil.

### Tahap 4: Buat Controller/Route (`src/routes/users-route.ts`)
- Buat class `UsersRoute` dengan decorator `@Controller('api/users')`.
- Inject `UserService` melalui constructor.
- Buat method handler dengan decorator `@Post()` yang:
  1. Menerima request body (`name`, `email`, `password`).
  2. Memanggil `userService.register()`.
  3. Jika sukses, return `{ "data": "OK" }`.
  4. Jika error (email duplikat), return `{ "error": "Email sudah terdaftar" }` dengan HTTP status code 400.

### Tahap 5: Daftarkan Module Baru di AppModule
- Buka file `src/app.module.ts`.
- Tambahkan `UsersRoute` ke array `controllers`.
- Tambahkan `UserService` ke array `providers`.
- Pastikan `PrismaModule` sudah ada di array `imports` (sudah ada dari setup sebelumnya).

### Tahap 6: Pengujian Manual
- Jalankan aplikasi: `npm run start:dev`.
- Pastikan database MySQL `belajar_vibe_coding_nestjs` sudah dibuat dan dapat diakses.
- Test registrasi user baru menggunakan curl atau Postman:
  ```bash
  curl -X POST http://localhost:3000/api/users \
    -H "Content-Type: application/json" \
    -d '{"name":"Roni","email":"roni@gmail.com","password":"rahasia"}'
  ```
- Verifikasi response `{ "data": "OK" }`.
- Test registrasi dengan email yang sama dan verifikasi response error `{ "error": "Email sudah terdaftar" }`.

### Tahap 7: Validasi Build
- Pastikan `npm run build` berjalan tanpa error TypeScript.

---

## 6. Definition of Done (DoD)
1. Tabel `users` berhasil dibuat di database MySQL melalui Prisma migration.
2. Endpoint `POST /api/users` berfungsi untuk registrasi user baru.
3. Password tersimpan dalam bentuk hash bcrypt (bukan plain text).
4. Registrasi dengan email duplikat mengembalikan error `"Email sudah terdaftar"` (HTTP 400).
5. Struktur folder mengikuti konvensi (`routes/` dan `services/`).
6. Build project (`npm run build`) sukses tanpa error.
