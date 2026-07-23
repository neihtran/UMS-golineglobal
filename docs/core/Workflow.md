---

# Module 00 - Core Platform

## 1. Quản lý cơ cấu tổ chức

### Chức năng

* Quản lý thông tin tổ chức.
* Quản lý cơ sở đào tạo.
* Quản lý khoa.
* Quản lý bộ môn.
* Quản lý phòng/ban chức năng.
* Quản lý mối quan hệ giữa các đơn vị.
* Kích hoạt/Ngừng sử dụng đơn vị.
* Tra cứu cơ cấu tổ chức.

### Workflow

```text
Khởi tạo tổ chức
        │
        ▼
Tạo cơ sở đào tạo
        │
        ▼
Tạo khoa
        │
        ▼
Tạo bộ môn
        │
        ▼
Tạo phòng/ban
        │
        ▼
Hoàn thành cơ cấu tổ chức
```

---

# 2. Quản lý cơ sở vật chất

### Chức năng

* Quản lý tòa nhà.
* Quản lý tầng.
* Quản lý loại phòng.
* Quản lý phòng.
* Cập nhật sức chứa phòng.
* Cập nhật trạng thái sử dụng phòng.
* Tra cứu phòng theo loại.
* Tra cứu phòng theo tòa nhà.

### Workflow

```text
Tạo tòa nhà
      │
      ▼
Tạo tầng
      │
      ▼
Khai báo loại phòng
      │
      ▼
Tạo phòng
      │
      ▼
Cập nhật thông tin phòng
      │
      ▼
Sẵn sàng cho các module sử dụng
```

---

# 3. Quản lý thời gian học tập

### Chức năng

* Quản lý năm học.
* Quản lý học kỳ.
* Thiết lập học kỳ hiện hành.
* Thiết lập thời gian đăng ký học phần.
* Tra cứu lịch học theo năm học.

### Workflow

```text
Tạo năm học
      │
      ▼
Tạo học kỳ
      │
      ▼
Thiết lập thời gian
đăng ký học phần
      │
      ▼
Đặt học kỳ hoạt động
      │
      ▼
Các module sử dụng
```

---

# 4. Quản lý danh mục dùng chung

### Chức năng

* Quản lý nhóm danh mục.
* Quản lý giá trị danh mục.
* Thiết lập giá trị mặc định.
* Sắp xếp thứ tự hiển thị.
* Kích hoạt/Ngừng sử dụng danh mục.
* Tra cứu danh mục.

Ví dụ:

* Giới tính.
* Tôn giáo.
* Dân tộc.
* Nhóm máu.
* Loại giấy tờ.
* ...

### Workflow

```text
Tạo nhóm danh mục
        │
        ▼
Thêm giá trị
        │
        ▼
Đặt giá trị mặc định
        │
        ▼
Kích hoạt sử dụng
        │
        ▼
Các module sử dụng
```

---

# 5. Quản lý địa giới hành chính

### Chức năng

* Quản lý quốc gia.
* Quản lý tỉnh/thành phố.
* Quản lý quận/huyện.
* Quản lý phường/xã.
* Tra cứu địa chỉ.
* Đồng bộ dữ liệu hành chính (nếu có).

### Workflow

```text
Quốc gia
     │
     ▼
Tỉnh/Thành phố
     │
     ▼
Quận/Huyện
     │
     ▼
Phường/Xã
     │
     ▼
Các module sử dụng
```

---

# Tổng hợp chức năng

| Nhóm chức năng      | Chức năng                                               |
| ------------------- | ------------------------------------------------------- |
| Cơ cấu tổ chức      | Quản lý tổ chức, cơ sở đào tạo, khoa, bộ môn, phòng/ban |
| Cơ sở vật chất      | Quản lý tòa nhà, tầng, loại phòng, phòng                |
| Thời gian học tập   | Quản lý năm học, học kỳ, thời gian đăng ký học phần     |
| Danh mục dùng chung | Quản lý nhóm danh mục và giá trị danh mục               |
| Địa giới hành chính | Quản lý quốc gia, tỉnh/thành phố, quận/huyện, phường/xã |

---

## Workflow tổng thể của Module 00 - Core Platform

```text
                 Khởi tạo hệ thống
                        │
                        ▼
            Khai báo thông tin tổ chức
                        │
                        ▼
             Khai báo cơ sở đào tạo
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
   Cơ cấu tổ chức   Cơ sở vật chất   Thời gian học tập
        │               │                │
        ▼               ▼                ▼
 Khoa/Bộ môn/      Tòa nhà/Tầng/    Năm học/Học kỳ
  Phòng ban           Phòng
        │               │                │
        └───────────────┼────────────────┘
                        ▼
             Khai báo danh mục dùng chung
                        │
                        ▼
          Khai báo địa giới hành chính
                        │
                        ▼
      Core Platform hoàn tất khởi tạo dữ liệu
                        │
                        ▼
      Các module IAM, HRM, SIS, LMS, Exam,
      Asset, Finance... sử dụng dữ liệu Core
```


