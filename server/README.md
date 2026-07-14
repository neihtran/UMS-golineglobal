# UMS Backend

University Management System - Backend API

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

### 3. Start MongoDB
```bash
# Using Docker
docker run -d --name ums-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=ums_admin -e MONGO_INITDB_ROOT_PASSWORD=ums_secure_password mongo:7
```

### 4. Run Seed Data
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

Server will start at http://localhost:5000

## API Endpoints

### Health Check
```
GET /api/health
```

### Auth
```
POST /api/auth/login
POST /api/auth/mfa
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/mfa/setup
POST /api/auth/mfa/enable
```

### HRM
```
GET    /api/hrm/vien-chuc
GET    /api/hrm/vien-chuc/:id
POST   /api/hrm/vien-chuc
PATCH  /api/hrm/vien-chuc/:id
DELETE /api/hrm/vien-chuc/:id
GET    /api/hrm/vien-chuc-stats

GET    /api/hrm/departments
GET    /api/hrm/departments/:id
POST   /api/hrm/departments
PATCH  /api/hrm/departments/:id
DELETE /api/hrm/departments/:id

GET    /api/hrm/leave-requests
POST   /api/hrm/leave-requests
```

## Docker Deployment

### Build Images
```bash
# Backend
docker build -f server/Dockerfile -t ums-backend:test ./server

# Frontend (pre-built dist/)
docker build -f Dockerfile.frontend -t ums-frontend:test .
```

### Run with Docker Compose (Full Stack)
```bash
# Start all services (MongoDB + Backend + Frontend)
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

Services:
- Frontend: http://localhost:80
- Backend API: http://localhost:5000
- Mongo Express: http://localhost:8081 (dev profile only)

### Environment Variables for Docker
```bash
cp .env .env.local  # Edit with your values
```

## Default Login Credentials

After running seed:
- Email: `admin@truong.edu.vn`
- Password: `Admin@123`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run seed` | Seed database with sample data |
| `npm test` | Run tests |

## Project Structure

```
server/
├── src/
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Entry point
│   ├── config/             # Environment, database, CORS
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── middleware/         # Auth, RBAC, audit
│   ├── utils/              # JWT, pagination
│   ├── validators/         # Zod schemas
│   └── seed/               # Seed scripts
├── package.json
├── tsconfig.json
└── .env
```
