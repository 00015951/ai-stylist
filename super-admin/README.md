# Admin panel (Super Admin)

## Ishga tushirish

1. **Avval backend serverni ishga tushiring** (admin panel shu serverga ulanadi):

   - Loyiha **ildizidan**: `npm run dev:server`
   - yoki **server/** papkasidan: `npm run dev`

   Server `http://localhost:4444` da ishlashi kerak.

2. Keyin admin panelni ishga tushiring:

   ```bash
   cd super-admin
   npm run dev
   ```

3. Brauzerda <http://localhost:5174> oching. Login: `admin`, Parol: `admin111`.

## Sozlama

- **.env** (ixtiyoriy): Agar backend boshqa portda bo‘lsa, `VITE_PROXY_TARGET=http://localhost:PORT` qo‘ying (masalan `5555`).
- `.env.example` dan nusxa olish: `cp .env.example .env`
