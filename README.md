# TableFlow

Multi-tenant QR ordering for restaurants. Customers order via a conversational flow; staff manage everything from linked dashboards.

**Payments:** Customers only **choose** card or cash — nothing is charged online. Waiters see the preference on each order.

## Quick start

```bash
npm install
cp .env.local.example .env

# Start Postgres (Docker)
docker compose up -d

npx prisma migrate deploy   # or: npx prisma db push (dev only)
npm run db:seed             # demo data — do NOT use seed passwords in production
npm run dev
```

Open **http://localhost:3000**

| Portal | URL | Demo (after seed) |
|--------|-----|-------------------|
| Super Admin | `/super-admin` | admin@tableflow.app / superadmin123 |
| Restaurant Admin | `/admin` | admin@demobistro.com / admin123 |
| Waiter | `/waiter` | waiter@demobistro.com / waiter123 |
| Customer | `/order/demo-table-1` | No login |

## Production deploy (Vercel + Supabase)

1. Create Supabase project → copy `DATABASE_URL` (pooler) and `DIRECT_URL`.
2. Set env vars in Vercel (see `.env.example`). **Required:** `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET` (32+ chars), `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` (https).
3. Build command: `npm run build` (runs `prisma generate` + Next build).
4. After first deploy, run migrations against prod DB:
   ```bash
   npx prisma migrate deploy
   ```
5. Create your super admin manually or run seed **once** then change all passwords.
6. Optional: Supabase keys for faster realtime (otherwise 4–5s polling).

## Security (built in)

- Role-based middleware on all staff routes and APIs
- Tenant isolation via `restaurantId` on every query
- Login rate limit (10 attempts / 15 min per email)
- Timing-safe login (dummy bcrypt when user not found)
- Rate limits on public order APIs
- Security headers (X-Frame-Options, nosniff, etc.)
- Production env validation (`NEXTAUTH_SECRET` length & quality)
- No online payment processing — reduced PCI scope
- Generic error messages in production API responses

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run db:migrate` | Create migration (dev) |
| `npm run db:seed` | Demo data |

## Architecture

- **Next.js 14** App Router, TypeScript, Tailwind
- **Prisma** + PostgreSQL
- **NextAuth** JWT sessions (12h)
- **Supabase** optional broadcast for live updates

## License

Private — TableFlow.
