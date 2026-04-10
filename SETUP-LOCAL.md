# Lokal ishga tushirish

## 1. Backend (server)

```bash
cd server
npm install
npm run dev
```

Server `http://localhost:4444` da ishlaydi.

## 2. Admin panel

```bash
cd super-admin
npm install
npm run dev
```

Admin panel `http://localhost:5174` da ochiladi. Login: `admin`, Parol: `admin111`.

**DBni tozalash:** `cd server && npm run reset-db`

## 3. Client (Mini App) — local

Client bot/kategoriyalarni backend `GET /api/styles` dan oladi. Admin Uslublar sahifasida o'zgartirilgan kategoriyalar shu orqali yangilanadi.

**Muhim:** Client va admin bir xil backenddan foydalanishi kerak. `client/.env.local` da:

```
NEXT_PUBLIC_API_URL=http://localhost:4444
```

## Portlar

| Komponent  | Port |
|------------|------|
| Backend    | 4444 |
| Admin panel| 5174 |
| Client     | 3000 (Next.js) |
