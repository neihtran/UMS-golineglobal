# Hướng dẫn Deploy UMS lên Production

## Kiến trúc tổng quan

```
┌──────────────────────────────────────────────────────────────┐
│  BROWSER (User)                                               │
└──────────────┬───────────────────────────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌──────────────┐   ┌─────────────────────────┐
│  FRONTEND    │   │  BACKEND NODE.JS        │
│  Vercel      │──►│  Railway/Render/Fly.io  │
│  ued.goline  │   │  (Express + MongoDB)    │
│  global.com  │   │  Port 5000/8000         │
└──────────────┘   │  - JWT + MFA Auth       │
                   │  - 17 modules API       │
                   │  - HQNHAT sync client   │
                   └──────────┬──────────────┘
                              │
                              ▼
                   ┌─────────────────────────┐
                   │  EXTERNAL API           │
                   │  api.hqnhat.id.vn       │
                   │  (Sync majors, courses) │
                   └─────────────────────────┘
```

## Phần 1: Chuẩn bị MongoDB Database

### 1.1. Local MongoDB (đang chạy - OK)

Đã có sẵn ở `localhost:27017`, DB `ums_real_api_test`.

### 1.2. Production MongoDB (khuyến nghị MongoDB Atlas miễn phí)

1. Truy cập https://www.mongodb.com/cloud/atlas
2. Tạo free cluster M0 (512 MB)
3. Tạo user: `ums_admin` / `secure_password`
4. Whitelist IP `0.0.0.0/0` (allow from anywhere)
5. Lấy connection string, ví dụ:
   ```
   mongodb+srv://ums_admin:<password>@cluster0.xxxxx.mongodb.net/ums_production?retryWrites=true&w=majority
   ```

## Phần 2: Deploy Backend (Railway - Khuyến nghị)

### 2.1. Chuẩn bị

```bash
# Cài Railway CLI
npm install -g @railway/cli

# Login
railway login
```

### 2.2. Khởi tạo project Railway

```bash
cd "d:\mokup-UMS\server"
railway init
```

### 2.3. Cấu hình biến môi trường trên Railway Dashboard

| Biến | Giá trị |
|------|---------|
| `NODE_ENV` | `production` |
| `PORT` | `${{RAILWAY_PORT}}` (auto) |
| `MONGODB_URI` | `mongodb+srv://...` (từ Atlas) |
| `JWT_ACCESS_SECRET` | random-32-chars-string |
| `JWT_REFRESH_SECRET` | random-32-chars-string |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://ued.golineglobal.com` |
| `ALLOWED_ORIGINS` | `https://ued.golineglobal.com,https://*.vercel.app` |
| `TOTP_ISSUER` | `UMS-University` |
| `MFA_REQUIRED_ROLES` | `SUPER_ADMIN,ADMIN,HIEU_TRUONG,PHO_HIEU_TRUONG` |
| `HQNHAT_API_URL` | `https://api.hqnhat.id.vn` |
| `HQNHAT_API_TOKEN` | (để trống, sẽ dùng login flow) |
| `HQNHAT_API_TIMEOUT_MS` | `30000` |
| `HQNHAT_SYNC_ENABLED` | `true` |

### 2.4. Cấu hình Build/Start

Trong Railway Dashboard → Service → Settings:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Watch Paths**: `src/**`

### 2.5. Deploy

```bash
railway up
```

Sau khi deploy xong, Railway sẽ cấp URL kiểu:
```
https://ums-backend-production.up.railway.app
```

## Phần 3: Setup Frontend

### 3.1. Cấu hình API URL

File `.env.production`:
```bash
VITE_API_BASE_URL=https://ums-backend-production.up.railway.app/api
VITE_APP_NAME=UMS - Hệ thống Quản lý Đại học
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

### 3.2. Cập nhật Backend CORS

Trong `server/.env`, đảm bảo:
```
ALLOWED_ORIGINS=https://ued.golineglobal.com,https://*.vercel.app
```

### 3.3. Deploy lên Vercel

**Cách 1: Qua GitHub (Khuyến nghị)**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ums.git
git push -u origin main
```

Sau đó:
1. Vào https://vercel.com → New Project
2. Import GitHub repo
3. **Framework Preset**: Vite
4. **Root Directory**: `./`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. **Environment Variables**:
   - `VITE_API_BASE_URL` = `https://ums-backend-production.up.railway.app/api`
8. Click **Deploy**

**Cách 2: Qua Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 3.4. Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Thêm `ued.golineglobal.com`
3. Cấu hình DNS:
   ```
   CNAME @ → cname.vercel-dns.com
   ```

## Phần 4: Tích hợp HQNHAT API

### 4.1. Đồng bộ dữ liệu từ HQNHAT vào MongoDB

Backend có sẵn 2 cách sync:

**Cách A: Manual trigger** (qua API endpoint)

```bash
# Login admin trước
curl -X POST https://ums-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ums.local","password":"admin123"}'

# Lấy token, sau đó trigger sync
curl -X POST https://ums-backend.up.railway.app/api/hqnhat/sync/majors \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Cách B: Auto cron job** (background)

Đã có sẵn scheduler trong `server/src/jobs/hqnhatScheduler.ts`. Khi `HQNHAT_SYNC_ENABLED=true`, mỗi ngày sẽ tự động sync:
- 02:00 - Faculties
- 03:00 - Majors, CourseGroups
- 04:00 - Courses
- 05:00 - Curriculums
- Mỗi 30 phút - Classes, Students

### 4.2. Lấy HQNHAT Bearer Token

Hiện tại API `api.hqnhat.id.vn` chỉ có 4 endpoints public (majors, specializations), không có `/auth/login`. 

**Cần làm**:
1. Liên hệ chủ sở hữu API để lấy Bearer token
2. Hoặc đợi họ thêm login endpoint

**Set token**:
```bash
# Trong Railway Dashboard
HQNHAT_API_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGc...
```

## Phần 5: Kiểm tra sau khi deploy

### 5.1. Backend health check

```bash
curl https://ums-backend.up.railway.app/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 5.2. Frontend

Truy cập https://ued.golineglobal.com → Login page

### 5.3. Tạo admin user đầu tiên

Backend có sẵn seed script:
```bash
# Trên Railway, vào tab Shell
cd /app
npx tsx src/seed/seedAll.ts
```

Hoặc qua API:
```bash
curl -X POST https://ums-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ums.local",
    "password": "Admin@123",
    "fullName": "System Administrator",
    "role": "SUPER_ADMIN"
  }'
```

### 5.4. Test HQNHAT sync

Sau khi có token, vào UI:
- Đăng nhập với role admin
- Truy cập `/int/hqnhat` (module INT)
- Click "Sync Majors" → Database sẽ được cập nhật từ API `api.hqnhat.id.vn`

## Phần 6: Các lỗi thường gặp

### 6.1. CORS Error
```
Access to XMLHttpRequest blocked by CORS
```
**Fix**: Thêm domain frontend vào `ALLOWED_ORIGINS` backend.

### 6.2. MongoDB connection timeout
```
MongooseServerSelectionError: connection timed out
```
**Fix**: 
- Kiểm tra connection string
- Whitelist IP `0.0.0.0/0` trên Atlas
- Nếu dùng local: khởi động MongoDB service

### 6.3. Backend không start
```
Error: JWT_ACCESS_SECRET is not defined
```
**Fix**: Set đầy đủ biến môi trường trên Railway.

### 6.4. Frontend không gọi được API
- Kiểm tra `VITE_API_BASE_URL` đúng
- Mở DevTools Network xem request URL
- Test trực tiếp API bằng curl trước

## Phần 7: Monitoring (Sau khi chạy ổn)

- **Backend logs**: Railway tab "Logs"
- **MongoDB**: Atlas tab "Monitoring"
- **Frontend**: Vercel tab "Analytics"
- **Integration logs**: `IntegrationLog` collection trong MongoDB

## Tóm tắt URLs sau khi deploy:

| Service | URL |
|---------|-----|
| Frontend | https://ued.golineglobal.com |
| Backend API | https://ums-backend-production.up.railway.app/api |
| Backend Health | https://ums-backend-production.up.railway.app/api/health |
| External HQNHAT | https://api.hqnhat.id.vn |
| MongoDB Atlas | (qua connection string) |

Bạn cứ chạy trước với MongoDB local + Backend local, sau khi OK sẽ chuyển sang production! 🚀
