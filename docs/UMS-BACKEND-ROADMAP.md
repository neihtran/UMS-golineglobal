# UMS Backend Roadmap - Lộ Trình Triển Khai Backend Lakehouse

> **Ngày tạo**: 08/07/2026  
> **Project**: University Management System (UMS)  
> **Frontend**: React 18 + Vite + TypeScript + TanStack Query  
> **Backend**: Node.js + Express + MongoDB  

---

## Mục Lục

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Phase 1: Nền Tảng Cơ Bản](#2-phase-1-nền-tảng-cơ-bản-tuần-1-2)
3. [Phase 2: API Client Layer](#3-phase-2-api-client-layer-frontend-tuần-2)
4. [Phase 3: TanStack Query Hooks](#4-phase-3-tanstack-query-hooks-tuần-2-3)
5. [Phase 4: Backend Services & Controllers](#5-phase-4-backend-services--controllers-tuần-4-6)
6. [Phase 5: Seed Data](#6-phase-5-seed-data-tuần-5)
7. [Phase 6: Deployment & DevOps](#7-phase-6-deployment--devops-tuần-6-8)
8. [Phase 7: Integration & Analytics](#8-phase-7-integration--analytics-tuần-8)
9. [Lệnh Triển Khai Nhanh](#9-lệnh-triển-khai-nhanh)
10. [Môi Trường & Secrets](#10-môi-trường--secrets)

---

## 1. Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UMS LAKEHOUSE ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐      ┌──────────────────┐      ┌─────────────────────┐    │
│  │   FRONTEND   │────▶│  API GATEWAY     │────▶│   OPERATIONAL STORE  │    │
│  │   (Vite)     │     │  (Express.js)    │     │   MongoDB Atlas      │    │
│  │   Port 5173  │◀────│  Port 5000       │◀────│   (Primary DB)       │    │
│  └──────────────┘      └──────────────────┘      └─────────────────────┘    │
│                                                        │                     │
│                                                        ▼                     │
│                         ┌──────────────────────────────────────────────┐   │
│                         │           ANALYTICAL STORE                     │   │
│                         │   MongoDB Atlas Data Lake (S3-compatible)    │   │
│                         │   • BI aggregations                          │   │
│                         │   • Audit logs                                │   │
│                         │   • Historical snapshots                       │   │
│                         └──────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     INTEGRATION LAYER (INT)                          │  │
│  │   HEMIS API  •  VNeID  •  VGCA  •  CSDL Văn Bằng  •  Kho Bạc      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Stack Công Nghệ

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, TanStack Query v5, Tailwind CSS |
| Backend | Node.js 20 LTS, Express 4, TypeScript |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (access + refresh), TOTP MFA |
| API Docs | OpenAPI / Swagger |
| Container | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend), Railway/Render (backend), MongoDB Atlas |

---

## 2. Phase 1: Nền Tảng Cơ Bản (Tuần 1-2)

### 2.1 Cấu Trúc Thư Mục Backend

```
server/
├── src/
│   ├── app.ts                   # Express app setup
│   ├── server.ts                # Entry point
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   ├── cors.ts              # CORS config
│   │   ├── rateLimit.ts         # Rate limit config
│   │   └── env.ts               # Env validation (Zod)
│   ├── models/                  # Mongoose schemas
│   │   ├── User.ts
│   │   ├── VienChuc.ts
│   │   ├── Department.ts
│   │   ├── LeaveRequest.ts
│   │   ├── AuditLog.ts
│   │   └── index.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── hrm.routes.ts
│   │   └── users.routes.ts
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── audit.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── asyncHandler.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── pagination.ts
│   ├── validators/
│   ├── integrations/
│   ├── types/
│   ├── seed/
│   └── tests/
├── package.json
├── tsconfig.json
└── .env
```

### 2.2 MongoDB Setup

#### Option A: MongoDB Atlas (Khuyến nghị)

1. Đăng ký tại https://www.mongodb.com/atlas
2. Tạo M0 cluster (Free tier)
3. Region: Singapore (ap-southeast-1)
4. Tạo database user
5. Whitelist IP: 0.0.0.0/0 (dev)

#### Option B: Docker Local

```bash
docker run -d \
  --name ums-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=ums_admin \
  -e MONGO_INITDB_ROOT_PASSWORD=ums_secure_password \
  -v mongodb_data:/data/db \
  mongo:7
```

### 2.3 Environment Configuration

```bash
# server/.env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ums_db
# Hoặc Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ums_db

# JWT
JWT_ACCESS_SECRET=ums-access-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=ums-refresh-secret-key-minimum-32-characters-long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# TOTP
TOTP_ISSUER=UMS-University
TOTP_SECRET=YOUR_BASE32_ENCODED_SECRET

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 2.4 Package.json Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "otplib": "^12.0.1",
    "qrcode": "^1.5.3",
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "typescript": "^5.3.2",
    "@types/node": "^20.10.4",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/multer": "^1.4.11",
    "ts-node-dev": "^2.0.0",
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1"
  }
}
```

### 2.5 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 3. Phase 2: API Client Layer (Frontend) (Tuần 2)

### 3.1 API Client

```typescript
// src/lib/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse, ErrorResponse } from '@/types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data;
          useAuthStore.getState().setAccessToken(accessToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### 3.2 Shared Types

```typescript
// src/types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### 3.3 Update Auth Store

```typescript
// src/stores/authStore.ts (UPDATE)
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  mfaRequired: boolean;
  tempToken: string | null;
  
  login: (user: User, accessToken: string, refreshToken: string) => void;
  loginMfaRequired: (tempToken: string) => void;
  completeMfaLogin: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}
```

---

## 4. Phase 3: TanStack Query Hooks (Tuần 2-3)

### 4.1 Auth Hooks

```typescript
// src/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest, LoginResponse } from '@/types/api.types';

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.mfaRequired) {
        useAuthStore.getState().loginMfaRequired(data.tempToken!);
      } else {
        useAuthStore.getState().login(data.user, data.accessToken, data.refreshToken);
      }
    },
  });
};

export const useVerifyMfa = () => {
  return useMutation({
    mutationFn: async ({ tempToken, code }: { tempToken: string; code: string }) => {
      const response = await apiClient.post<LoginResponse>('/auth/mfa', { tempToken, code });
      return response.data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().completeMfaLogin(data.user, data.accessToken, data.refreshToken);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  return useMutation({
    mutationFn: async () => { await apiClient.post('/auth/logout'); },
    onSettled: () => { logout(); },
  });
};
```

### 4.2 HRM Hooks

```typescript
// src/hooks/useHrm.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useNotificationStore } from '@/stores/notificationStore';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { VienChuc } from '@/types/common.types';

export interface VienChucFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'active' | 'trial' | 'leave' | 'inactive' | '';
  department?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const useVienChucList = (filters: VienChucFilters) => {
  return useQuery({
    queryKey: ['vienChuc', 'list', filters],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<VienChuc>>('/hrm/vien-chuc', {
        params: filters,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
};

export const useVienChucDetail = (id: string) => {
  return useQuery({
    queryKey: ['vienChuc', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<VienChuc>>(`/hrm/vien-chuc/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateVienChuc = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: Omit<VienChuc, '_id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiClient.post<ApiResponse<VienChuc>>('/hrm/vien-chuc', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vienChuc'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm viên chức mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo thất bại',
      });
    },
  });
};

export const useUpdateVienChuc = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VienChuc> }) => {
      const response = await apiClient.patch<ApiResponse<VienChuc>>(`/hrm/vien-chuc/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['vienChuc'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật thông tin' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Cập nhật thất bại',
      });
    },
  });
};

export const useDeleteVienChuc = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/hrm/vien-chuc/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vienChuc'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa viên chức' });
    },
  });
};

export const useDepartmentList = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await apiClient.get('/hrm/departments');
      return response.data;
    },
    staleTime: 1000 * 60 * 30,
  });
};
```

---

## 5. Phase 4: Backend Services & Controllers (Tuần 4-6)

### 5.1 Mongoose Model Pattern

```typescript
// server/src/models/VienChuc.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVienChuc extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  dob?: Date;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  title?: string;
  position?: string;
  department?: Types.ObjectId;
  contractType?: 'Cơ hữu' | 'Thỉnh giảng' | 'Thử việc';
  salary?: number;
  status: 'active' | 'trial' | 'leave' | 'inactive';
  joinDate?: Date;
  email?: string;
  phone?: string;
  address?: string;
  cccd?: string;
  avatar?: string;
  supervisor?: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  auditLog: Array<{
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT';
    userId: Types.ObjectId;
    timestamp: Date;
    details?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const VienChucSchema = new Schema<IVienChuc>(
  {
    code: { type: String, unique: true, required: true },
    name: { type: String, required: true, text: true },
    dob: Date,
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
    title: String,
    position: String,
    department: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    contractType: { type: String, enum: ['Cơ hữu', 'Thỉnh giảng', 'Thử việc'] },
    salary: Number,
    status: {
      type: String,
      enum: ['active', 'trial', 'leave', 'inactive'],
      default: 'active',
      index: true,
    },
    joinDate: Date,
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    address: String,
    cccd: { type: String, select: false },
    avatar: String,
    supervisor: { type: Schema.Types.ObjectId, ref: 'VienChuc' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    auditLog: [
      {
        action: String,
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        details: String,
      },
    ],
  },
  { timestamps: true }
);

VienChucSchema.index({ status: 1, department: 1 });
VienChucSchema.index({ name: 'text', code: 'text' });

export const VienChuc = mongoose.model<IVienChuc>('VienChuc', VienChucSchema);
```

### 5.2 Service Pattern

```typescript
// server/src/services/hrm.service.ts
import { VienChuc, IVienChuc } from '../models/VienChuc.js';
import { Department } from '../models/Department.js';
import { Types } from 'mongoose';
import type { FilterQuery } from 'mongoose';

export interface CreateVienChucDto {
  code: string;
  name: string;
  dob?: Date;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  title?: string;
  position?: string;
  department?: string;
  contractType?: 'Cơ hữu' | 'Thỉnh giảng' | 'Thử việc';
  salary?: number;
  joinDate?: Date;
  email?: string;
  phone?: string;
  address?: string;
  cccd?: string;
  avatar?: string;
  supervisor?: string;
}

export interface VienChucFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  department?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export class HrmService {
  async createVienChuc(data: CreateVienChucDto, userId: string): Promise<IVienChuc> {
    const vienChuc = new VienChuc({
      ...data,
      department: data.department ? new Types.ObjectId(data.department) : undefined,
      supervisor: data.supervisor ? new Types.ObjectId(data.supervisor) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    await vienChuc.save();
    return vienChuc.populate('department');
  }

  async getVienChucById(id: string): Promise<IVienChuc | null> {
    return VienChuc.findById(id)
      .populate('department', 'name code')
      .populate('supervisor', 'name email');
  }

  async listVienChuc(filters: VienChucFilters) {
    const { page = 1, pageSize = 10, search, status, department, sortBy = 'createdAt', sortDir = 'desc' } = filters;
    const filter: FilterQuery<IVienChuc> = {};
    
    if (status) filter.status = status;
    if (department) filter.department = new Types.ObjectId(department);
    if (search) filter.$text = { $search: search };

    const sortObj: Record<string, 1 | -1> = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      VienChuc.find(filter).populate('department', 'name code').skip((page - 1) * pageSize).limit(pageSize).sort(sortObj).lean(),
      VienChuc.countDocuments(filter),
    ]);

    return { data: data as IVienChuc[], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updateVienChuc(id: string, data: Partial<CreateVienChucDto>, userId: string): Promise<IVienChuc | null> {
    return VienChuc.findByIdAndUpdate(
      id,
      { $set: { ...data, updatedBy: new Types.ObjectId(userId) } },
      { new: true, runValidators: true }
    ).populate('department', 'name code');
  }

  async deleteVienChuc(id: string): Promise<boolean> {
    const result = await VienChuc.findByIdAndDelete(id);
    return !!result;
  }

  async getStats() {
    const [total, byStatus, byDepartment] = await Promise.all([
      VienChuc.countDocuments(),
      VienChuc.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      VienChuc.aggregate([
        { $match: { department: { $ne: null } } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
        { $unwind: '$dept' },
        { $project: { _id: '$dept._id', name: '$dept.name', count: 1 } },
      ]),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}),
      byDepartment,
    };
  }
}

export const hrmService = new HrmService();
```

### 5.3 Controller Pattern

```typescript
// server/src/controllers/hrm.controller.ts
import { Request, Response } from 'express';
import { hrmService } from '../services/hrm.service.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const hrmController = {
  getVienChucList: asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      search: req.query.search as string,
      status: req.query.status as string,
      department: req.query.department as string,
      sortBy: req.query.sortBy as string,
      sortDir: req.query.sortDir as 'asc' | 'desc',
    };

    const result = await hrmService.listVienChuc(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }),

  getVienChucById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const vienChuc = await hrmService.getVienChucById(id);

    if (!vienChuc) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy viên chức' },
      });
    }

    res.json({ success: true, data: vienChuc });
  }),

  createVienChuc: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user._id.toString();
    const vienChuc = await hrmService.createVienChuc(req.body, userId);
    res.status(201).json({ success: true, data: vienChuc });
  }),

  updateVienChuc: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user._id.toString();
    const vienChuc = await hrmService.updateVienChuc(id, req.body, userId);

    if (!vienChuc) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy viên chức' },
      });
    }

    res.json({ success: true, data: vienChuc });
  }),

  deleteVienChuc: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await hrmService.deleteVienChuc(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy viên chức' },
      });
    }

    res.json({ success: true, data: null, message: 'Đã xóa viên chức' });
  }),

  getVienChucStats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await hrmService.getStats();
    res.json({ success: true, data: stats });
  }),
};
```

### 5.4 Middleware Pattern

```typescript
// server/src/middleware/asyncHandler.ts
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// server/src/middleware/auth.middleware.ts
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token không hợp lệ' },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;

    const user = await User.findById(decoded.userId)
      .select('-password -refreshToken')
      .populate('role', 'name permissions');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Tài khoản không tồn tại hoặc đã bị khóa' },
      });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Token đã hết hạn' },
      });
    }
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Xác thực thất bại' },
    });
  }
};

// server/src/middleware/audit.middleware.ts
export const auditMiddleware = (resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300 && (req as any).user) {
        const action = req.method === 'POST' ? 'CREATE'
          : req.method === 'PUT' || req.method === 'PATCH' ? 'UPDATE'
          : req.method === 'DELETE' ? 'DELETE' : 'ACCESS';

        AuditLog.create({
          userId: (req as any).user._id,
          userName: (req as any).user.name,
          action,
          resource,
          resourceId: body?.data?._id || req.params?.id,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          status: 'success',
          timestamp: new Date(),
        }).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
};
```

### 5.5 Routes Pattern

```typescript
// server/src/routes/hrm.routes.ts
import { Router } from 'express';
import { hrmController } from '../controllers/hrm.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { auditMiddleware } from '../middleware/audit.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/vien-chuc', hrmController.getVienChucList);
router.get('/vien-chuc/:id', hrmController.getVienChucById);
router.post('/vien-chuc', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('VienChuc'), hrmController.createVienChuc);
router.patch('/vien-chuc/:id', roleMiddleware(['ADMIN', 'NHAN_VIEN']), auditMiddleware('VienChuc'), hrmController.updateVienChuc);
router.delete('/vien-chuc/:id', roleMiddleware(['ADMIN']), auditMiddleware('VienChuc'), hrmController.deleteVienChuc);
router.get('/vien-chuc-stats', hrmController.getVienChucStats);
router.get('/departments', hrmController.getDepartmentList);

export default router;
```

---

## 6. Phase 5: Seed Data (Tuần 5)

```typescript
// server/src/seed/seedHrm.ts
import { VienChuc } from '../models/VienChuc.js';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

const DEPARTMENT_SEED = [
  { code: 'KHOA-CNTT', name: 'Khoa Công nghệ Thông tin', shortName: 'CNTT', type: 'faculty' },
  { code: 'KHOA-KTX', name: 'Khoa Kinh tế', shortName: 'KTX', type: 'faculty' },
  { code: 'KHOA-SHCD', name: 'Khoa Sư phạm', shortName: 'SHCD', type: 'faculty' },
  { code: 'PHONG-TC', name: 'Phòng Tài chính', shortName: 'TC', type: 'department' },
  { code: 'PHONG-HC', name: 'Phòng Hành chính', shortName: 'HC', type: 'department' },
  { code: 'PHONG-QH', name: 'Phòng Quản học sinh', shortName: 'QH', type: 'department' },
];

const VIEN_CHUC_SEED = [
  {
    code: 'VC-2015-001',
    name: 'PGS.TS. Nguyễn Hoàng Long',
    dob: new Date('1975-03-15'),
    gender: 'Nam',
    title: 'PGS.TS',
    position: 'Trưởng khoa',
    contractType: 'Cơ hữu',
    salary: 25000000,
    status: 'active',
    joinDate: new Date('2015-09-01'),
    email: 'nguyen.hoang.long@truong.edu.vn',
    phone: '0901234001',
  },
  {
    code: 'VC-2016-002',
    name: 'TS. Trần Thị Mai Anh',
    dob: new Date('1982-07-22'),
    gender: 'Nữ',
    title: 'TS',
    position: 'Phó trưởng khoa',
    contractType: 'Cơ hữu',
    salary: 20000000,
    status: 'active',
    joinDate: new Date('2016-01-15'),
    email: 'tran.thi.mai.anh@truong.edu.vn',
    phone: '0901234002',
  },
  {
    code: 'VC-2017-003',
    name: 'ThS. Lê Văn Minh',
    dob: new Date('1988-11-08'),
    gender: 'Nam',
    title: 'ThS',
    position: 'Giảng viên',
    contractType: 'Cơ hữu',
    salary: 15000000,
    status: 'active',
    joinDate: new Date('2017-08-20'),
    email: 'le.van.minh@truong.edu.vn',
    phone: '0901234003',
  },
  {
    code: 'VC-2018-004',
    name: 'ThS. Phạm Thị Hương',
    dob: new Date('1990-04-30'),
    gender: 'Nữ',
    title: 'ThS',
    position: 'Giảng viên',
    contractType: 'Thỉnh giảng',
    salary: 12000000,
    status: 'active',
    joinDate: new Date('2018-02-10'),
    email: 'pham.thi.huong@truong.edu.vn',
    phone: '0901234004',
  },
  {
    code: 'VC-2019-005',
    name: 'KS. Ngô Đức Anh',
    dob: new Date('1992-09-14'),
    gender: 'Nam',
    title: 'KS',
    position: 'Chuyên viên',
    contractType: 'Cơ hữu',
    salary: 12000000,
    status: 'active',
    joinDate: new Date('2019-06-01'),
    email: 'ngo.duc.anh@truong.edu.vn',
    phone: '0901234005',
  },
  {
    code: 'VC-2020-006',
    name: 'CN. Hoàng Thị Lan',
    dob: new Date('1995-01-25'),
    gender: 'Nữ',
    title: 'CN',
    position: 'Nhân viên',
    contractType: 'Thử việc',
    salary: 8000000,
    status: 'trial',
    joinDate: new Date('2020-03-15'),
    email: 'hoang.thi.lan@truong.edu.vn',
    phone: '0901234006',
  },
  {
    code: 'VC-2015-007',
    name: 'PGS.TS. Đặng Quốc Bảo',
    dob: new Date('1973-06-18'),
    gender: 'Nam',
    title: 'PGS.TS',
    position: 'Trưởng phòng',
    contractType: 'Cơ hữu',
    salary: 22000000,
    status: 'active',
    joinDate: new Date('2015-02-01'),
    email: 'dang.quoc.bao@truong.edu.vn',
    phone: '0901234007',
  },
  {
    code: 'VC-2016-008',
    name: 'TS. Lý Thị Thu Hà',
    dob: new Date('1980-12-03'),
    gender: 'Nữ',
    title: 'TS',
    position: 'Phó trưởng phòng',
    contractType: 'Cơ hữu',
    salary: 18000000,
    status: 'active',
    joinDate: new Date('2016-09-01'),
    email: 'ly.thi.thu.ha@truong.edu.vn',
    phone: '0901234008',
  },
];

export async function seedHrm() {
  console.log('🌱 Seeding HRM data...');

  await Department.deleteMany({});
  await VienChuc.deleteMany({});

  const departments = await Department.insertMany(DEPARTMENT_SEED);
  const deptMap = departments.reduce((acc, dept) => {
    acc[dept.code] = dept._id;
    return acc;
  }, {} as Record<string, mongoose.Types.ObjectId>);

  const adminUser = await User.findOne({ role: 'ADMIN' });
  const userId = adminUser?._id || new mongoose.Types.ObjectId();

  const vcData = VIEN_CHUC_SEED.map((vc, index) => ({
    ...vc,
    department: Object.values(deptMap)[index % Object.values(deptMap).length],
    createdBy: userId,
    updatedBy: userId,
  }));

  await VienChuc.insertMany(vcData);

  console.log(`✅ Seeded ${departments.length} departments`);
  console.log(`✅ Seeded ${VIEN_CHUC_SEED.length} viên chức`);
}
```

---

## 7. Phase 6: Deployment & DevOps (Tuần 6-8)

### 7.1 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: ums-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ums_admin
      MONGO_INITDB_ROOT_PASSWORD: ums_secure_password
      MONGO_INITDB_DATABASE: ums_db
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  mongo-express:
    image: mongo-express:latest
    container_name: ums-mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_SERVER: mongodb
      ME_CONFIG_MONGODB_AUTHUSERNAME: ums_admin
      ME_CONFIG_MONGODB_AUTHPASSWORD: ums_secure_password
    depends_on:
      - mongodb
    profiles:
      - dev

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: ums-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGODB_URI=mongodb://ums_admin:ums_secure_password@mongodb:27017/ums_db?authSource=admin
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - FRONTEND_URL=http://localhost:5173
    depends_on:
      mongodb:
        condition: service_healthy

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: ums-frontend
    restart: unless-stopped
    ports:
      - "5173:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000/api
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### 7.2 Dockerfile Backend

```dockerfile
# server/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### 7.3 Dockerfile Frontend

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```conf
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.4 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json
      - run: cd server && npm ci
      - run: cd server && npm test

  deploy-backend:
    runs-on: ubuntu-latest
    needs: test-backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm i -g @railway/cli
          railway login --token $RAILWAY_TOKEN
          railway up --service backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 8. Phase 7: Integration & Analytics (Tuần 8+)

### 8.1 BI Service

```typescript
// server/src/services/bi.service.ts
export class BiService {
  async getDashboardOverview() {
    const [totalStaff, totalStudents, totalCourses] = await Promise.all([
      VienChuc.countDocuments({ status: 'active' }),
      Student.countDocuments({ status: 'studying' }),
      Course.countDocuments(),
    ]);
    return { totalStaff, totalStudents, totalCourses };
  }

  async getDepartmentAnalytics() {
    return VienChuc.aggregate([
      { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $group: { _id: '$dept._id', name: '$dept.name', total: { $sum: 1 }, avgSalary: { $avg: '$salary' } } },
      { $sort: { total: -1 } },
    ]);
  }
}
```

### 8.2 Integration Clients

```typescript
// server/src/integrations/hemis.client.ts
export class HEMISClient {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async syncStudentEnrollment(data: any) {
    return axios.post(`${this.baseUrl}/v1/enrollments`, data, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
  }

  async getStudentStatus(msv: string) {
    return axios.get(`${this.baseUrl}/v1/students/${msv}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
  }
}
```

---

## 9. Lệnh Triển Khai Nhanh

```bash
# ===== DEVELOPMENT =====

# 1. Setup backend
cd server
npm install
npm run dev

# 2. Setup MongoDB (Docker)
docker run -d --name ums-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=ums_admin -e MONGO_INITDB_ROOT_PASSWORD=ums_secure_password mongo:7

# 3. Run seed
npm run seed

# 4. Start frontend
cd ..
npm run dev

# ===== DOCKER =====

# Build and run
docker-compose up -d

# Run with Mongo Express (dev tools)
docker-compose --profile dev up -d

# Stop
docker-compose down

# ===== PRODUCTION =====

# Railway deployment
railway login
railway init
railway up

# Vercel deployment (frontend)
vercel --prod
```

---

## 10. Môi Trường & Secrets

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=UMS - Hệ thống Quản lý Đại học
```

### Backend (.env)

```bash
# Development
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/ums_db
JWT_ACCESS_SECRET=your-32-char-access-secret-here
JWT_REFRESH_SECRET=your-32-char-refresh-secret-here
ALLOWED_ORIGINS=http://localhost:5173

# Production
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://ums.your-domain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ums_db
JWT_ACCESS_SECRET=<generated>
JWT_REFRESH_SECRET=<generated>
ALLOWED_ORIGINS=https://ums.your-domain.com
```

---

## 11. Thứ Tự Ưu Tiên Module Backend

| Priority | Module | Dependency |
|----------|--------|------------|
| 1 | IAM + Auth | BLOCKING - mọi module phụ thuộc |
| 2 | HRM + User | Identity provider |
| 3 | Department + Master Data | Reference data dùng chung |
| 4 | SIS | Cần HRM |
| 5 | DMS | Độc lập |
| 6 | WMS | Độc lập |
| 7 | LMS | Cần SIS |
| 8 | EXAM | Cần SIS |
| 9 | PORTAL | Cần SIS, LMS, EXAM |
| 10 | FIN | Cần SIS, HRM |
| 11 | KTX | Cần FIN |
| 12 | RIT | Độc lập |
| 13 | BI | Read-only aggregate |
| 14 | QA | AUN-QA compliance |
| 15 | DCE | DigCompEdu framework |
| 16 | LIB | Cần LMS, SIS |
| 17 | PMS | Isolated auth |

---

## 12. Checklist Triển Khai

- [ ] Setup MongoDB (Atlas hoặc Docker)
- [ ] Tạo cấu trúc thư mục backend
- [ ] Cấu hình TypeScript
- [ ] Implement auth middleware + JWT
- [ ] Implement User model + routes
- [ ] Implement VienChuc model + routes
- [ ] Implement Department model + routes
- [ ] Tạo API client (frontend)
- [ ] Update authStore
- [ ] Tạo TanStack Query hooks
- [ ] Wire HRM page (VienChucList, VienChucDetail)
- [ ] Tạo seed data
- [ ] Setup Docker Compose
- [ ] Setup CI/CD (GitHub Actions)
- [ ] Deploy production

---

*Lưu file này ở nơi an toàn để tham khảo khi cần thiết.*
