# Backend Developer Intern - Assignment Starter

This repository is a full-stack starter for the assignment: backend (TypeScript + Express + Prisma + Postgres) and a minimal React frontend (Vite).

## API Endpoints

All backend APIs are versioned at `/api/v1/`:
- **Auth:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
- **Tasks:** `POST/GET/PUT/DELETE /api/v1/tasks`, `GET/PUT/DELETE /api/v1/tasks/{id}`

## Documentation

- **Swagger UI:** `http://localhost:4000/api/docs` (when backend is running)
- **Postman Collection:** Import `Assignment_API.postman_collection.json` into Postman to test all endpoints

## Quick start (local)

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init --preview-feature
npm run dev
```

Quick start (frontend):

```bash
cd frontend
npm install
npm run dev
```

Docker quick start:

```bash
docker-compose up --build
```

See each subfolder README for details.

Scalability notes:

- Use Postgres for production (set `DATABASE_URL`), run multiple backend replicas behind a load balancer.
- Move long-running tasks to background workers and add Redis for caching and sessions.
- Containerize and orchestrate via Kubernetes for auto-scaling and resilience.