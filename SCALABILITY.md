# Scalability & Deployment Guide

## Architecture Overview

This project is built with a scalable, modular architecture:
- **Backend:** TypeScript + Express + Prisma ORM
- **Database:** PostgreSQL (managed service recommended)
- **Frontend:** React with Vite
- **Containerization:** Docker + Docker Compose

---

## Production Deployment

### 1. Backend Scaling

**Multiple Replicas:**
- Run multiple backend instances behind a load balancer (AWS ALB, nginx, HAProxy)
- Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT`
- Example: `docker-compose scale backend=3`

**Database:**
- Use managed Postgres (AWS RDS, Google Cloud SQL, Azure Database for PostgreSQL)
- Enable connection pooling with PgBouncer or managed pooling
- Set `DATABASE_URL=postgresql://user:pass@db-host:5432/db_name`

**Example scaling with docker-compose:**
```yaml
services:
  backend:
    deploy:
      replicas: 3
```

### 2. Caching Layer (Redis)

Add Redis for caching frequently accessed data (user profiles, tasks summaries):

```bash
# Add Redis to docker-compose
docker run -d -p 6379:6379 redis:alpine
```

**Backend Integration:**
```typescript
import redis from 'redis'
const redisClient = redis.createClient({ host: 'localhost', port: 6379 })

// Cache tasks for 5 minutes
router.get('/tasks', async (req, res) => {
  const cacheKey = `tasks:${req.user.id}`
  const cached = await redisClient.get(cacheKey)
  if (cached) return res.json(JSON.parse(cached))
  
  const tasks = await prisma.task.findMany({ where: { userId: req.user.id } })
  await redisClient.setex(cacheKey, 300, JSON.stringify(tasks))
  res.json(tasks)
})
```

### 3. Session Management with Redis

Replace in-memory sessions with Redis:
```typescript
import session from 'express-session'
import RedisStore from 'connect-redis'
const redisStore = new RedisStore({ client: redisClient })

app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
```

### 4. Load Balancing

**nginx Configuration (example):**
```nginx
upstream backend {
  server backend1:4000;
  server backend2:4000;
  server backend3:4000;
}

server {
  listen 80;
  location /api {
    proxy_pass http://backend;
  }
}
```

### 5. Logging & Monitoring

**Add structured logging (Winston):**
```bash
npm install winston
```

```typescript
import winston from 'winston'
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

app.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path, user: req.user?.id })
  next()
})
```

**Log Aggregation:**
- Send logs to ELK (Elasticsearch, Logstash, Kibana), Datadog, or CloudWatch
- Monitor error rates, response times, and database queries

---

## Kubernetes Deployment

### Deployment YAML (example)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: assignment-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: assignment-backend
  template:
    metadata:
      labels:
        app: assignment-backend
    spec:
      containers:
      - name: backend
        image: assignment-backend:latest
        ports:
        - containerPort: 4000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: value
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: assignment-backend-service
spec:
  selector:
    app: assignment-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 4000
  type: LoadBalancer
```

Deploy with:
```bash
kubectl apply -f deployment.yaml
kubectl scale deployment assignment-backend --replicas=5
```

---

## Performance Optimization

### 1. Database Query Optimization

**Add indexes to Prisma schema:**
```prisma
model Task {
  id        Int    @id @default(autoincrement())
  title     String @db.VarChar(255)
  userId    Int
  completed Boolean @default(false)
  createdAt DateTime @default(now())
  
  user Task @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([completed])
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_indexes
```

### 2. API Response Pagination

```typescript
router.get('/tasks', async (req: AuthRequest, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  
  const tasks = await prisma.task.findMany({
    where: { userId: req.user.id },
    skip: (page - 1) * limit,
    take: limit
  })
  
  res.json({ tasks, page, limit })
})
```

### 3. Compression & Caching Headers

```typescript
import compression from 'compression'
app.use(compression())
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600')
  next()
})
```

---

## CI/CD Pipeline (GitHub Actions example)

```yaml
name: Build & Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install && npm run build
      
  deploy:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t assignment-backend:latest ./backend
      - name: Push to registry
        run: docker push assignment-backend:latest
      - name: Deploy to K8s
        run: kubectl apply -f deployment.yaml
```

---

## Security Best Practices

1. **JWT Token Rotation:** Implement refresh tokens
   ```typescript
   const accessToken = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '15m' })
   const refreshToken = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: '7d' })
   ```

2. **HTTPS/TLS:** Use let's encrypt or managed certificates

3. **Rate Limiting:** Prevent brute force attacks
   ```bash
   npm install express-rate-limit
   ```

4. **CORS:** Restrict origins
   ```typescript
   app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }))
   ```

5. **Environment Secrets:** Use `.env` with sensitive data never committed

6. **SQL Injection:** Prisma ORM prevents this via parameterized queries

---

## Monitoring & Alerting

- **Health Checks:** Add `/health` endpoint that checks DB connectivity
- **APM Tools:** New Relic, DataDog, or Prometheus for real-time metrics
- **Alerts:** Set up alerts for CPU > 80%, error rate > 5%, DB response time > 1s

---

## Cost Optimization

- Use **auto-scaling** to provision resources based on demand
- **CDN** for static frontend assets (CloudFront, Cloudflare)
- **Managed databases** vs. self-hosted (easier maintenance, backups)
- **Spot instances** for non-critical workloads

---

## Summary

A production-ready deployment would include:
1. Postgres managed service (RDS/Cloud SQL)
2. Redis for caching & sessions
3. Multiple backend replicas behind load balancer
4. Kubernetes for orchestration
5. Structured logging & monitoring
6. CI/CD pipeline with automated tests
7. HTTPS, rate limiting, and security headers
8. Database query optimization and indexing
