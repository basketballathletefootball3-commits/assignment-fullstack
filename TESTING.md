# Testing Guide

This guide covers manual and automated testing of the assignment APIs and frontend.

## Prerequisites

Ensure backend and frontend are running:
```bash
# Terminal 1: Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Backend: `http://localhost:4000`  
Frontend: `http://localhost:5173`  
Swagger: `http://localhost:4000/api/docs`

---

## Manual Testing via Postman

1. **Import Collection:**
   - Open Postman
   - Click `File > Import`
   - Select `Assignment_API.postman_collection.json`

2. **Set Environment Variables:**
   - Create a new environment
   - Set `jwt_token = ""` (will be auto-populated after login)

3. **Test Auth Flow:**
   - Run `POST /api/v1/auth/register` with email/password
   - Run `POST /api/v1/auth/login` (token will auto-save to `jwt_token` variable)
   - All subsequent requests use the Bearer token

4. **Test CRUD Operations:**
   - Create task: `POST /api/v1/tasks`
   - List tasks: `GET /api/v1/tasks`
   - Get by ID: `GET /api/v1/tasks/1`
   - Update: `PUT /api/v1/tasks/1`
   - Delete: `DELETE /api/v1/tasks/1`

---

## Frontend Testing

### Test Register/Login

1. Navigate to `http://localhost:5173`
2. Fill in **Register** form:
   - Email: `test@example.com`
   - Password: `password123`
   - Click Register → should show "✓ Registered!"
3. Fill in **Login** form with same credentials → redirects to Dashboard

### Test Task CRUD

In Dashboard:

- **Create:** Enter title, description, click "Add Task"
- **List:** Tasks appear below
- **Edit:** Click "Edit" button, modify, click "Save"
- **Delete:** Click "Delete" button, confirm deletion
- **Logout:** Click "Logout" button, returns to login screen

---

## API Testing via curl

### Register User

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```
Response: `{"token": "eyJhbGciOiJIUzI1NiIs..."}`

### Create Task (requires JWT token from login)

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl -X POST http://localhost:4000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'
```

### Get All Tasks

```bash
curl -X GET http://localhost:4000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN"
```

### Update Task

```bash
curl -X PUT http://localhost:4000/api/v1/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries (updated)",
    "completed": true
  }'
```

### Delete Task

```bash
curl -X DELETE http://localhost:4000/api/v1/tasks/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Swagger UI Testing

1. Navigate to `http://localhost:4000/api/docs`
2. Click on endpoint, click "Try it out"
3. For protected endpoints, click the lock icon → enter JWT token
4. Fill in request body and click "Execute"

---

## Role-Based Access Control (RBAC)

### Test Admin Access

1. Seed creates an admin user: `admin@example.com` / `adminpass`
2. Login as admin
3. Admin can see all users' tasks via `GET /api/v1/tasks`
4. Regular users see only their own tasks

---

## Error Handling Tests

### Invalid Email

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "password": "short"}'
```
Expected: 400 error with validation message

### Missing Authorization Header

```bash
curl -X GET http://localhost:4000/api/v1/tasks
```
Expected: 401 Unauthorized

### Invalid Token

```bash
curl -X GET http://localhost:4000/api/v1/tasks \
  -H "Authorization: Bearer invalid_token"
```
Expected: 401 Invalid token

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test task retrieval
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/tasks

# Test login
ab -n 50 -c 5 -p login.json -T "application/json" http://localhost:4000/api/v1/auth/login
```

### Load Testing with k6

```bash
# Create load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
};

export default function() {
  const res = http.get('http://localhost:4000/api/v1/tasks', {
    headers: { Authorization: `Bearer $TOKEN` },
  });
  check(res, { 'status is 200': (r) => r.status === 200 });
}

# Run: k6 run load-test.js
```

---

## Health Check

```bash
curl http://localhost:4000/health
```
Expected: `{"status": "ok"}`

---

## Checklist for Complete Testing

- [ ] Register new user successfully
- [ ] Login returns valid JWT token
- [ ] Create task with valid data
- [ ] List tasks (show own or all if admin)
- [ ] Update task
- [ ] Delete task
- [ ] Cannot access protected routes without token
- [ ] Invalid credentials return 401
- [ ] Validation errors return 400
- [ ] Admin can see all users' tasks
- [ ] Regular user sees only own tasks
- [ ] Frontend displays error/success messages
- [ ] Swagger UI loads all endpoints
- [ ] Health check returns ok

All tests passing indicates the assignment is complete and deployment-ready!
