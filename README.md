
 # Forest Management Web App UI

 This is a Next.js app for the Forest Management Web App UI. The original project is available at https://www.figma.com/design/aQshr7j7PYO6zL50iQyAb6/Forest-Management-Web-App-UI.

 ## Running the code

 1. Install dependencies: `npm install`
 2. Start dev server: `npm run dev` (Next.js App Router at http://localhost:3000)
 3. Build for production: `npm run build`
 4. Run production server: `npm start`
 5. Lint: `npm run lint`

## Running with Docker Compose (Next.js + Postgres)

1. Copy `.env.example` to `.env` and adjust `POSTGRES_URL` if needed.
2. Build and start: `docker compose up --build`
3. App: http://localhost:3000
4. Postgres: exposed on `localhost:5432` with database `forest_db`, user `postgres`, password `postgres` (see `docker-compose.yml`).

### Database connectivity check

- With the app running, GET `/api/health` to verify the app can reach Postgres (returns `{ ok: true }` when the connection succeeds).

## Prisma + Postgres

- Install dependencies: `npm install`
- Generate client: `npx prisma generate`
- Apply migrations: `npx prisma migrate deploy`
- Seed sample data: `npx prisma db seed`
- Environment: set `POSTGRES_URL` (see `.env.example`). The Docker Compose `web` service runs migrations and seeds automatically before `npm run start`.

## Auth

- NextAuth.js with Prisma adapter and credential login (email + password).
- Demo users seeded with password `password123`: `admin@example.com`, `nguyenvana@example.com`, `tranthib@example.com`, `levanc@example.com`, `hoangvane@example.com`.
- Set `AUTH_SECRET` in your `.env` (see `.env.example`).
  
