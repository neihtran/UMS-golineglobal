# 🚀 UMS Deployment Guide - Railway + Vercel

> Triển khai UMS lên production trong 30 phút

## 📋 Yêu cầu

- ✅ Tài khoản MongoDB Atlas (free) - https://www.mongodb.com/cloud/atlas
- ✅ Tài khoản Railway - https://railway.app (GitHub login)
- ✅ Tài khoản Vercel - https://vercel.com (GitHub login)
- ✅ Repo GitHub đã push code lên

---

## 🎯 Phần A: Deploy Backend lên Railway

### Bước A1: Tạo Project Railway

1. Vào https://railway.app/dashboard
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Chọn repo `ums-monorepo` của bạn
4. Click **"Add Service"** → **"GitHub Repo"** → chọn cùng repo

### Bước A2: Cấu hình Root Directory cho Backend

Vì đây là monorepo, cần trỏ vào thư mục `server/`:

1. Trong service vừa tạo → tab **"Settings"**
2. **Source**:
   - **Root Directory**: `server` ← **QUAN TRỌNG**
   - **Watch Paths**: `server/**`
3. **Deploy**:
   - **Builder**: NIXPACKS (auto)
   - **Build Command**: `npm install && npm run build` (auto từ nixpacks.toml)
   - **Start Command**: `npm start`
   - **Healthcheck Path**: `/api/health`

### Bước A3: Set Environment Variables

Tab **"Variables"**, thêm các biến sau:

```bash
# ─── Server ───
NODE_ENV=production
PORT=${{RAILWAY_PORT}}
FRONTEND_URL=https://ums-YOUR.vercel.app

# ─── MongoDB Atlas (lấy từ Atlas dashboard) ───
MONGODB_URI=mongodb+srv://ums_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ums_production?retryWrites=true&w=majority

# ─── JWT Secrets (sinh ngẫu nhiên) ───
JWT_ACCESS_SECRET=GENERATE_RANDOM_64_CHARS_BASE64
JWT_REFRESH_SECRET=GENERATE_RANDOM_64_CHARS_BASE64
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ─── TOTP MFA ───
TOTP_ISSUER=UMS-University
TOTP_SECRET=

# ─── CORS ───
ALLOWED_ORIGINS=https://ums-YOUR.vercel.app,https://ued.golineglobal.com

# ─── Rate Limiting ───
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200

# ─── File Upload ───
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10

# ─── MFA Required Roles ───
MFA_REQUIRED_ROLES=SUPER_ADMIN,ADMIN,HIEU_TRUONG,PHO_HIEU_TRUONG

# ─── HQNHAT Integration ───
HQNHAT_API_URL=https://api.hqnhat.id.vn
HQNHAT_API_TOKEN=
HQNHAT_API_USERNAME=
HQNHAT_API_PASSWORD=
HQNHAT_API_TIMEOUT_MS=30000
HQNHAT_API_RETRY_MAX=3
HQNHAT_SYNC_ENABLED=false
```

**Sinh JWT secrets bằng PowerShell:**

```powershell
# Chạy trong PowerShell
-join ((65..90) + (97..122) + (48..57) + (45,95) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Hoặc dùng online tool: https://www.random.org/strings/

### Bước A4: Generate Domain cho Backend

1. Tab **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Lưu URL lại, ví dụ:
   ```
   https://ums-backend-production.up.railway.app
   ```

### Bước A5: Test Backend

```bash
# Test health
curl https://ums-backend-production.up.railway.app/api/health

# Expected: {"status":"ok","timestamp":"..."}
```

### Bước A6: Tạo Admin User (qua Railway Shell)

1. Tab **"Deploy"** → Click vào deployment mới nhất → **"Shell"**
2. Chạy:
   ```bash
   cd /app && npx tsx src/seed/seedAll.ts
   ```
3. Hoặc tạo admin thủ công qua API:
   ```bash
   curl -X POST https://ums-backend-production.up.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@ums.local",
       "password": "Admin@123456",
       "fullName": "System Administrator",
       "role": "SUPER_ADMIN"
     }'
   ```

---

## 🎨 Phần B: Deploy Frontend lên Vercel

### Bước B1: Tạo Project Vercel

1. Vào https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import repo `ums-monorepo` từ GitHub
4. Click **"Import"**

### Bước B2: Cấu hình Monorepo

Vì đây là monorepo, để Vercel chỉ build frontend (root `/`, không phải `server/`):

1. **Framework Preset**: Vite
2. **Root Directory**: `./` (root, không thay đổi)
3. **Build Command**: `npm run build` (auto-detect)
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Bước B3: Environment Variables

**Environment Variables** section, thêm:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://ums-backend-production.up.railway.app/api` |
| `VITE_APP_NAME` | `UMS - Hệ thống Quản lý Đại học` |
| `VITE_APP_VERSION` | `1.0.0` |
| `VITE_NODE_ENV` | `production` |

### Bước B4: Deploy

1. Click **"Deploy"**
2. Đợi 2-3 phút
3. Vercel cấp URL: `https://ums-monorepo.vercel.app`

### Bước B5: Custom Domain (Optional)

1. Tab **"Settings"** → **"Domains"**
2. Add domain `ued.golineglobal.com`
3. Cấu hình DNS ở nhà cung cấp domain:
   ```
   CNAME  @  cname.vercel-dns.com
   ```

---

## 🔧 Phần C: Cấu hình cuối cùng

### C1. Update Backend CORS

Quay lại Railway → service backend → **Variables**:
- Cập nhật `ALLOWED_ORIGINS` thành domain Vercel thật:
  ```
  ALLOWED_ORIGINS=https://ums-monorepo.vercel.app,https://ued.golineglobal.com
  ```

### C2. Test End-to-End

```bash
# 1. Backend health
curl https://ums-backend-production.up.railway.app/api/health

# 2. Login API
curl -X POST https://ums-backend-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ums.local","password":"Admin@123456"}'

# 3. Frontend
# Mở browser: https://ums-monorepo.vercel.app
# Đăng nhập với admin@ums.local / Admin@123456
```

### C3. Kết nối HQNHAT (Optional)

Có 2 cách:

**Cách 1: Đợi owner HQNHAT cấp Bearer Token**
- Sau khi có, set vào Railway:
  ```
  HQNHAT_API_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGc...
  HQNHAT_SYNC_ENABLED=true
  ```

**Cách 2: Dùng UI module INT để manual sync**
- Vào `/int/hqnhat` trong app
- Click nút "Sync Majors" → Server backend sẽ gọi api.hqnhat.id.vn
- Kết quả lưu vào MongoDB Atlas

---

## 📊 Monitoring

| Service | URL | Health Check |
|---------|-----|--------------|
| Frontend | https://ums-monorepo.vercel.app | Vercel Analytics |
| Backend | https://ums-backend-production.up.railway.app/api/health | `/api/health` |
| MongoDB | Atlas Dashboard | https://cloud.mongodb.com |

---

## 🆘 Troubleshooting

### Lỗi "CORS policy violation"
→ Thêm domain Vercel vào `ALLOWED_ORIGINS` của backend

### Lỗi "MongoServerError: bad auth"
→ Sai username/password trong MongoDB URI

### Lỗi "Port already in use"  
→ Đổi `PORT=5001` trong Railway variables

### Frontend gọi API failed
→ Kiểm tra `VITE_API_BASE_URL` đúng URL Railway

---

## 💰 Chi phí

| Service | Free tier | Limit |
|---------|-----------|-------|
| Vercel | ✅ Unlimited | 100GB bandwidth/tháng |
| Railway | ✅ $5 credit/tháng | ~500h runtime |
| MongoDB Atlas | ✅ M0 free forever | 512MB storage |
| **Tổng** | **$0/tháng** | Đủ cho 1000 users |

---

## ✅ Done checklist

- [ ] Backend URL đã deploy và health check OK
- [ ] Frontend URL đã deploy
- [ ] Admin user đã tạo
- [ ] Login thành công ở frontend
- [ ] CORS không lỗi
- [ ] Domain `ued.golineglobal.com` đã trỏ về Vercel

Bạn cứ làm theo từng bước, gặp chỗ nào kẹt thì hỏi tôi! 🚀
