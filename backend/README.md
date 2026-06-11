# Backend

1) Install deps

```bash
cd backend
npm install
```

2) Generate Prisma client and migrate (SQLite)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3) Run

```bash
npm run dev
```

The API will be at `http://localhost:4000` and docs at `/api/docs`.

Running with Docker Compose

1. From the repo root run:

```bash
docker-compose up --build
```

2. Initialize Prisma (inside backend container or locally):

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init --preview-feature
npm run seed
```

Scalability note:

- For production use Postgres with managed DB (Amazon RDS / Cloud SQL) and run multiple backend replicas behind a load balancer.
- Use Redis for caching common queries and session TTLs. Move heavy work to worker processes.
- Add structured logging (e.g., JSON logs) and central log aggregation (ELK / Datadog).
- Containerize and orchestrate with Kubernetes for autoscaling and rolling updates.
