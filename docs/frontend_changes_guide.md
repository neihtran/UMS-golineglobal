# Hướng Dẫn Cập Nhật Frontend (Frontend Migration Guide)

Tài liệu này tổng hợp các thay đổi về API Backend liên quan đến upload tệp và xử lý hiển thị hình ảnh mà đội ngũ **Frontend** cần cập nhật.

---

## 1. Thay Đổi Tên Tham Số Gửi File Trong `FormData`

Khi thực hiện request upload file lên các API, tất cả các tham số đại diện cho tệp tin đã được chuyển về tên chuẩn duy nhất là **`file`**.

### 🔹 API Cập Nhật Hồ Sơ Tài Khoản (`POST /api/v1/iam/profile`)
- **Trước đây:** `formData.append('avatar', imageFile)`
- **Hiện tại:** `formData.append('file', imageFile)`

### 🔹 API Tạo Tổ Chức (`POST /api/v1/core/organizations`)
- **Trước đây:** `formData.append('logo', imageFile)`
- **Hiện tại:** `formData.append('file', imageFile)`

### 🔹 API Cập Nhật Tổ Chức (`POST /api/v1/core/organizations/{id}`)
- **Trước đây:** `formData.append('logo', imageFile)`
- **Hiện tại:** `formData.append('file', imageFile)`

---

## 2. Xử Lý Hiển Thị Đường Dẫn Hình Ảnh (URL CDN)

Backend **không còn tự động trả về đường dẫn đầy đủ (Full URL)**. 

Thay vào đó, Backend chỉ trả về **đường dẫn tương đối** lưu trong cơ sở dữ liệu (ví dụ: `avatars/xxxx.webp` hoặc `organizations/logos/yyyy.webp`).

Domin lưu trữ/CDN của dự án hiện tại là: **`https://storage.hqnhat.id.vn`**

### 🔹 Thao tác cần làm trên Frontend:
Frontend tự quản lý domain CDN (thông qua biến môi trường) và chủ động nối domain CDN vào trước đường dẫn tương đối khi hiển thị trên thẻ `<img />`.

#### Ví dụ hàm Helper trên Frontend:
```typescript
// Cấu hình domain CDN từ biến môi trường (env)
const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN || process.env.VITE_CDN_DOMAIN || 'https://storage.hqnhat.id.vn';

export const getImageUrl = (path?: string | null): string => {
  if (!path) {
    return '/images/default-placeholder.png'; // Ảnh mặc định nếu null/empty
  }

  // Nếu đường dẫn đã là URL tuyệt đối (HTTP/HTTPS), trả về giữ nguyên
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Ghép domain CDN với đường dẫn tương đối
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${CDN_DOMAIN}/${cleanPath}`;
};
```

#### Ví dụ sử dụng Component:
```tsx
// Hiển thị Avatar
<img src={getImageUrl(user.profile?.avatar)} alt="User Avatar" />

// Hiển thị Logo Tổ chức
<img src={getImageUrl(organization.logo)} alt="Organization Logo" />
```

---

## 3. Cấu Trúc Trường Dữ Liệu Trả Về (Response Payload)

| Resource | Field Name | Type | Example Value | Full URL Example | Note |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User Profile** | `avatar` | `string \| null` | `"avatars/c914e918-8f81-42db-84dd-f5653b6fa207.webp"` | `https://storage.hqnhat.id.vn/avatars/c914e918...webp` | Trả về đường dẫn tương đối |
| **Organization** | `logo` | `string \| null` | `"organizations/logos/a1b2c3d4.webp"` | `https://storage.hqnhat.id.vn/organizations/logos/a1b2c3d4.webp` | Trả về đường dẫn tương đối |
| **Degree** | `file_path` | `string \| null` | `"degrees/uuid.pdf"` | `https://storage.hqnhat.id.vn/degrees/uuid.pdf` | Trả về đường dẫn tương đối |
| **Certificate** | `file_path` | `string \| null` | `"certificates/uuid.pdf"` | `https://storage.hqnhat.id.vn/certificates/uuid.pdf` | Trả về đường dẫn tương đối |
| **Training History** | `file_path` | `string \| null` | `"training_histories/uuid.pdf"` | `https://storage.hqnhat.id.vn/training_histories/uuid.pdf` | Trả về đường dẫn tương đối |

---

> [!NOTE]
> Tất cả các API upload file ở Backend hiện tại đã được đồng bộ hóa chuẩn sử dụng key `file` trong `FormData` và không còn trả về CDN URL tuyệt đối.
