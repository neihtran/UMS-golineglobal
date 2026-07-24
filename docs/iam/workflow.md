Dựa trên database và các chức năng của Module 01 - IAM, mình đề xuất chia thành 4 nhóm chức năng. Workflow được thiết kế theo hướng nghiệp vụ, không phụ thuộc framework, để sau này dễ chuyển thành Use Case hoặc Activity Diagram.

Module 01 - IAM (Identity & Access Management)
I. Authentication
1. Đăng nhập
Người dùng
    │
    ▼
Nhập Username/Email + Password
    │
    ▼
Kiểm tra tài khoản tồn tại
    │
    ├── Không tồn tại
    │       │
    │       ▼
    │   Thông báo lỗi
    │
    ▼
Kiểm tra trạng thái tài khoản
    │
    ├── Inactive / Locked
    │       │
    │       ▼
    │   Từ chối đăng nhập
    │
    ▼
Kiểm tra mật khẩu
    │
    ├── Sai
    │       │
    │       ▼
    │   Thông báo lỗi
    │
    ▼
Có bật 2FA?
    │
    ├── Có
    │       │
    │       ▼
    │   Nhập OTP
    │       │
    │       ▼
    │   Xác thực OTP
    │
    ▼
Đăng nhập thành công
    │
    ▼
Cập nhật last_login_at
    │
    ▼
Lưu login_logs
    │
    ▼
Truy cập hệ thống


2. Đăng xuất
Người dùng
    │
    ▼
Chọn Đăng xuất
    │
    ▼
Cập nhật logged_out_at
    │
    ▼
Hủy phiên đăng nhập
    │
    ▼
Quay về màn hình Login


3. Quên mật khẩu
Người dùng
    │
    ▼
Nhập Email / Username
    │
    ▼
Kiểm tra tài khoản
    │
    ▼
Sinh Token
    │
    ▼
Lưu password_reset_tokens
    │
    ▼
Gửi Email / OTP
    │
    ▼
Người dùng nhập Token
    │
    ▼
Kiểm tra Token
    │
    ▼
Đặt mật khẩu mới
    │
    ▼
Hoàn thành


4. Đổi mật khẩu
Người dùng
    │
    ▼
Nhập mật khẩu hiện tại
    │
    ▼
Kiểm tra
    │
    ▼
Nhập mật khẩu mới
    │
    ▼
Cập nhật users.password
    │
    ▼
Cập nhật password_changed_at


5. OTP / 2FA
Đăng nhập
    │
    ▼
Kiểm tra bật 2FA?
    │
    ├── Không
    │
    ▼
Đăng nhập
    │
    └───────────────► Hoàn thành

    Có
    │
    ▼
Sinh OTP
    │
    ▼
Lưu otp_verifications
    │
    ▼
Gửi Email/SMS
    │
    ▼
Nhập OTP
    │
    ▼
Xác thực
    │
    ├── Sai
    │       │
    │       ▼
    │   Thông báo lỗi
    │
    ▼
Đăng nhập thành công


II. User Management
1. Quản lý tài khoản
Admin
    │
    ▼
Tạo tài khoản
    │
    ▼
Liên kết Employee hoặc Student
    │
    ▼
Sinh Username
    │
    ▼
Sinh Password
    │
    ▼
Lưu users


2. Khóa / Mở khóa tài khoản
Admin
    │
    ▼
Chọn tài khoản
    │
    ▼
Đổi status
    │
    ▼
Lưu
    │
    ▼
Audit Log


3. Import tài khoản
Import Excel
    │
    ▼
Kiểm tra dữ liệu
    │
    ▼
Tạo Users
    │
    ▼
Sinh Password
    │
    ▼
Lưu Database
    │
    ▼
Xuất kết quả Import


4. Reset mật khẩu
Admin
    │
    ▼
Chọn User
    │
    ▼
Reset Password
    │
    ▼
Sinh Password mới
    │
    ▼
Đánh dấu First Login
    │
    ▼
Thông báo cho User


5. Đăng nhập lần đầu đổi mật khẩu
Đăng nhập
    │
    ▼
is_first_login = true ?
    │
    ├── Không
    │       │
    │       ▼
    │   Dashboard
    │
    ▼
Yêu cầu đổi Password
    │
    ▼
Cập nhật Password
    │
    ▼
is_first_login = false
    │
    ▼
Dashboard


III. Role & Permission
1. Quản lý Role
Admin
    │
    ▼
Tạo Role
    │
    ▼
Cập nhật
    │
    ▼
Xóa


2. Quản lý Permission
Admin
    │
    ▼
Tạo Permission
    │
    ▼
Cập nhật
    │
    ▼
Xóa


3. Gán Permission cho Role
Role
    │
    ▼
Chọn Permission
    │
    ▼
Lưu role_permissions


4. Gán Role cho User
User
    │
    ▼
Chọn Role
    │
    ▼
Lưu user_roles


5. Phân quyền theo phạm vi dữ liệu
Role
    │
    ▼
Chọn Permission
    │
    ▼
Thiết lập Scope
        │
        ├── Campus
        ├── Faculty
        ├── Department
        ├── Semester
        ├── Course
        ├── Class
        └── Custom
    │
    ▼
Lưu permission_scopes


6. Ghi đè quyền cho User
User
    │
    ▼
Chọn Permission
    │
    ▼
Cho phép / Thu hồi
    │
    ▼
Lưu user_permission_overrides


IV. Audit
1. Nhật ký đăng nhập
Đăng nhập thành công
    │
    ▼
Lưu login_logs


2. Nhật ký thao tác
Người dùng
    │
    ▼
CRUD dữ liệu
    │
    ▼
Lưu audit_logs
        │
        ├── Module
        ├── Action
        ├── Resource
        ├── Old Value
        ├── New Value
        └── User


Tổng hợp chức năng
Nhóm
Chức năng
Authentication
Đăng nhập, Đăng xuất, Quên mật khẩu, Đổi mật khẩu, OTP, 2FA, SSO, LDAP/Active Directory
User Management
Quản lý tài khoản, Tạo/Sửa/Xóa tài khoản, Khóa/Mở khóa tài khoản, Import tài khoản, Reset mật khẩu, Đăng nhập lần đầu đổi mật khẩu
Role & Permission
Quản lý Role, Quản lý Permission, Gán Role, Gán Permission, Phân quyền theo phạm vi dữ liệu, Ghi đè quyền người dùng
Audit
Nhật ký đăng nhập, Nhật ký thao tác hệ thống, Nhật ký thay đổi dữ liệu, Nhật ký phân quyền, Nhật ký đặt lại mật khẩu


