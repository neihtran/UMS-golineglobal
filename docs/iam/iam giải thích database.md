# part 1 - Authentication & User Management 

# users

## Chức năng

Lưu trữ thông tin tài khoản đăng nhập của toàn bộ người dùng trong hệ thống.

Đây là bảng trung tâm của phân hệ IAM, được sử dụng để xác thực người dùng, quản lý trạng thái tài khoản và liên kết với hồ sơ nhân sự hoặc sinh viên.

## Ví dụ

* Tài khoản Quản trị viên.
* Tài khoản Ban Giám hiệu.
* Tài khoản Phòng Đào tạo.
* Tài khoản Phòng Nhân sự.
* Tài khoản Giảng viên.
* Tài khoản Sinh viên.
* Tài khoản Khách.

### Các trường dữ liệu

| Trường                | Giải thích                                             |
| --------------------- | ------------------------------------------------------ |
| id                    | Khóa chính của tài khoản.                              |
| username              | Tên đăng nhập của người dùng.                          |
| email                 | Địa chỉ email của tài khoản.                           |
| phone                 | Số điện thoại của tài khoản.                           |
| password              | Mật khẩu đã được mã hóa.                               |
| account_type          | Loại tài khoản.                                        |
| employee_id           | Nhân sự được liên kết với tài khoản.                   |
| student_id            | Sinh viên được liên kết với tài khoản.                 |
| status                | Trạng thái của tài khoản.                              |
| is_first_login        | Xác định đây có phải lần đăng nhập đầu tiên hay không. |
| is_email_verified     | Trạng thái xác thực email.                             |
| is_phone_verified     | Trạng thái xác thực số điện thoại.                     |
| is_two_factor_enabled | Trạng thái bật xác thực hai lớp (2FA).                 |
| last_login_at         | Thời điểm đăng nhập gần nhất.                          |
| password_changed_at   | Thời điểm thay đổi mật khẩu gần nhất.                  |

### Giải thích các giá trị

#### account_type

| Giá trị  | Giải thích                                             |
| -------- | ------------------------------------------------------ |
| employee | Tài khoản của nhân sự.                                 |
| student  | Tài khoản của sinh viên.                               |
| guest    | Tài khoản khách.                                       |
| system   | Tài khoản hệ thống sử dụng cho các tiến trình tự động. |

#### status

| Giá trị   | Giải thích                     |
| --------- | ------------------------------ |
| active    | Tài khoản đang hoạt động.      |
| inactive  | Tài khoản chưa được kích hoạt. |
| locked    | Tài khoản đã bị khóa.          |
| suspended | Tài khoản tạm ngừng sử dụng.   |

# user_profiles

## Chức năng

Lưu trữ các thông tin mở rộng và thiết lập cá nhân của tài khoản người dùng.

Các thông tin này không thuộc hồ sơ nhân sự hoặc sinh viên mà chỉ phục vụ cho việc sử dụng hệ thống.

## Ví dụ

* Người dùng thay đổi ảnh đại diện.
* Người dùng lựa chọn ngôn ngữ hiển thị.
* Người dùng thay đổi múi giờ sử dụng.

### Các trường dữ liệu

| Trường             | Giải thích                            |
| ------------------ | ------------------------------------- |
| id                 | Khóa chính của hồ sơ tài khoản.       |
| user_id            | Tài khoản sở hữu hồ sơ.               |
| avatar             | Đường dẫn ảnh đại diện của tài khoản. |
| preferred_language | Ngôn ngữ hiển thị của hệ thống.       |
| timezone           | Múi giờ sử dụng của tài khoản.        |

### Giải thích các giá trị

#### preferred_language

| Giá trị | Giải thích  |
| ------- | ----------- |
| vi      | Tiếng Việt. |
| en      | Tiếng Anh.  |
| ja      | Tiếng Nhật. |
| ko      | Tiếng Hàn.  |

#### timezone

Lưu theo chuẩn múi giờ IANA.

Ví dụ:

* Asia/Ho_Chi_Minh
* Asia/Tokyo
* Asia/Seoul
* UTC

# password_reset_tokens

## Chức năng

Lưu trữ mã xác thực được tạo khi người dùng thực hiện chức năng quên mật khẩu.

Mỗi mã chỉ có hiệu lực trong một khoảng thời gian nhất định và sẽ hết hiệu lực sau khi được sử dụng hoặc khi quá thời gian cho phép.

## Ví dụ

* Người dùng chọn **Quên mật khẩu**.
* Hệ thống gửi email chứa liên kết đặt lại mật khẩu.
* Hệ thống gửi mã OTP để đặt lại mật khẩu.

### Các trường dữ liệu

| Trường     | Giải thích                               |
| ---------- | ---------------------------------------- |
| id         | Khóa chính của yêu cầu đặt lại mật khẩu. |
| user_id    | Tài khoản yêu cầu đặt lại mật khẩu.      |
| token      | Mã xác thực dùng để đặt lại mật khẩu.    |
| expired_at | Thời điểm mã xác thực hết hiệu lực.      |
| used_at    | Thời điểm mã xác thực được sử dụng.      |


# part 2 - Role & Permission

# roles

## Chức năng

Lưu trữ danh sách các vai trò (Role) trong hệ thống.

Mỗi vai trò đại diện cho một nhóm người dùng có cùng chức năng hoặc trách nhiệm và được gán các quyền truy cập tương ứng.

## Ví dụ

* Quản trị viên hệ thống.
* Ban Giám hiệu.
* Phòng Đào tạo.
* Phòng Nhân sự.
* Giảng viên.
* Cố vấn học tập.
* Sinh viên.

### Các trường dữ liệu

| Trường      | Giải thích              |
| ----------- | ----------------------- |
| id          | Khóa chính của vai trò. |
| code        | Mã vai trò.             |
| name        | Tên vai trò.            |
| description | Mô tả vai trò.          |
| status      | Trạng thái của vai trò. |

### Giải thích các giá trị

#### status

| Giá trị  | Giải thích                 |
| -------- | -------------------------- |
| active   | Vai trò đang được sử dụng. |
| inactive | Vai trò ngừng sử dụng.     |


# permissions

## Chức năng

Lưu trữ danh sách các quyền (Permission) của hệ thống.

Mỗi quyền đại diện cho một thao tác hoặc chức năng mà người dùng được phép thực hiện trong từng phân hệ.

## Ví dụ

* Xem danh sách sinh viên.
* Thêm sinh viên.
* Cập nhật thông tin sinh viên.
* Xóa sinh viên.
* Duyệt đơn nghỉ phép.
* Quản lý học phần.

### Các trường dữ liệu

| Trường      | Giải thích             |
| ----------- | ---------------------- |
| id          | Khóa chính của quyền.  |
| code        | Mã quyền.              |
| name        | Tên quyền.             |
| module      | Phân hệ áp dụng quyền. |
| description | Mô tả quyền.           |
| status      | Trạng thái của quyền.  |

### Giải thích các giá trị

#### status

| Giá trị  | Giải thích               |
| -------- | ------------------------ |
| active   | Quyền đang được sử dụng. |
| inactive | Quyền ngừng sử dụng.     |

# role_permissions

## Chức năng

Liên kết vai trò với các quyền trong hệ thống.

Một vai trò có thể được gán nhiều quyền và một quyền có thể được sử dụng bởi nhiều vai trò.

## Ví dụ

* Vai trò **Giảng viên** được gán quyền xem lớp học, nhập điểm và điểm danh.
* Vai trò **Phòng Đào tạo** được gán quyền quản lý chương trình đào tạo và học phần.
* Vai trò **Quản trị viên** được gán toàn bộ quyền của hệ thống.

### Các trường dữ liệu

| Trường        | Giải thích                         |
| ------------- | ---------------------------------- |
| id            | Khóa chính của bản ghi phân quyền. |
| role_id       | Vai trò được gán quyền.            |
| permission_id | Quyền được gán cho vai trò.        |

# user_roles

## Chức năng

Liên kết tài khoản người dùng với các vai trò.

Một người dùng có thể được gán một hoặc nhiều vai trò trong từng thời điểm tùy theo nhiệm vụ hoặc chức danh.

## Ví dụ

* Một giảng viên đồng thời là Trưởng khoa.
* Một nhân sự vừa thuộc Phòng Đào tạo vừa là Quản trị viên hệ thống.
* Một người dùng được cấp quyền tạm thời trong một khoảng thời gian.

### Các trường dữ liệu

| Trường     | Giải thích                          |
| ---------- | ----------------------------------- |
| id         | Khóa chính của bản ghi gán vai trò. |
| user_id    | Tài khoản được gán vai trò.         |
| role_id    | Vai trò được gán cho tài khoản.     |
| start_date | Ngày bắt đầu hiệu lực của vai trò.  |
| end_date   | Ngày kết thúc hiệu lực của vai trò. |

# permission_scopes

## Chức năng

Xác định phạm vi áp dụng của quyền đối với từng vai trò.

Cho phép giới hạn quyền truy cập theo phạm vi dữ liệu thay vì áp dụng trên toàn hệ thống.

## Ví dụ

* Giảng viên chỉ được xem sinh viên thuộc khoa của mình.
* Phòng Đào tạo chỉ được quản lý học kỳ hiện tại.
* Trưởng khoa chỉ được quản lý dữ liệu của khoa phụ trách.

### Các trường dữ liệu

| Trường             | Giải thích                               |
| ------------------ | ---------------------------------------- |
| id                 | Khóa chính của phạm vi quyền.            |
| role_permission_id | Bản ghi phân quyền được áp dụng phạm vi. |
| scope_type         | Loại phạm vi áp dụng.                    |
| scope_value        | Giá trị của phạm vi áp dụng.             |

### Giải thích các giá trị

#### scope_type

| Giá trị    | Giải thích              |
| ---------- | ----------------------- |
| campus     | Theo cơ sở.             |
| faculty    | Theo khoa.              |
| department | Theo phòng ban.         |
| semester   | Theo học kỳ.            |
| course     | Theo khóa học.          |
| class      | Theo lớp học.           |
| custom     | Theo phạm vi tùy chỉnh. |

# user_permission_overrides

## Chức năng

Thiết lập quyền riêng cho từng tài khoản, ghi đè lên quyền được kế thừa từ vai trò khi cần thiết.

Chức năng này được sử dụng trong các trường hợp ngoại lệ mà quyền của vai trò không đáp ứng yêu cầu thực tế.

## Ví dụ

* Cấp thêm quyền xuất báo cáo cho một giảng viên.
* Tạm thời thu hồi quyền nhập điểm của một người dùng.
* Cấp quyền quản lý một chức năng trong thời gian ngắn.

### Các trường dữ liệu

| Trường        | Giải thích                               |
| ------------- | ---------------------------------------- |
| id            | Khóa chính của bản ghi ghi đè quyền.     |
| user_id       | Tài khoản được áp dụng quyền riêng.      |
| permission_id | Quyền được cấp hoặc thu hồi.             |
| is_allowed    | Xác định quyền được cấp hoặc bị từ chối. |
| start_date    | Ngày bắt đầu hiệu lực.                   |
| end_date      | Ngày kết thúc hiệu lực.                  |

### Giải thích các giá trị

#### is_allowed

| Giá trị | Giải thích                                 |
| ------- | ------------------------------------------ |
| true    | Cấp quyền cho người dùng.                  |
| false   | Thu hồi hoặc từ chối quyền của người dùng. |


# part 3 - Authentication & User Management 

# login_logs

## Chức năng

Lưu trữ lịch sử các phiên đăng nhập thành công của người dùng vào hệ thống.

Bảng này phục vụ việc theo dõi lịch sử truy cập, thống kê số lần đăng nhập và hỗ trợ kiểm tra khi xảy ra sự cố hoặc các vấn đề liên quan đến bảo mật.

## Ví dụ

* Giảng viên đăng nhập vào hệ thống để nhập điểm.
* Sinh viên đăng nhập để đăng ký học phần.
* Nhân sự đăng nhập để quản lý hồ sơ nhân viên.
* Quản trị viên đăng nhập để cấu hình hệ thống.

### Các trường dữ liệu

| Trường        | Giải thích                          |
| ------------- | ----------------------------------- |
| id            | Khóa chính của phiên đăng nhập.     |
| user_id       | Tài khoản thực hiện đăng nhập.      |
| login_method  | Phương thức đăng nhập được sử dụng. |
| ip_address    | Địa chỉ IP tại thời điểm đăng nhập. |
| logged_in_at  | Thời điểm đăng nhập thành công.     |
| logged_out_at | Thời điểm đăng xuất khỏi hệ thống.  |

### Giải thích các giá trị

#### login_method

| Giá trị    | Giải thích                                      |
| ---------- | ----------------------------------------------- |
| password   | Đăng nhập bằng tên đăng nhập và mật khẩu.       |
| otp        | Đăng nhập bằng mã OTP.                          |
| two_factor | Đăng nhập bằng xác thực hai lớp (2FA).          |
| sso        | Đăng nhập thông qua Single Sign-On (SSO).       |
| ldap       | Đăng nhập thông qua LDAP hoặc Active Directory. |

# audit_logs

## Chức năng

Lưu trữ nhật ký các thao tác của người dùng trên hệ thống.

Bảng này giúp theo dõi toàn bộ lịch sử thao tác, hỗ trợ kiểm tra, truy vết và đối chiếu khi dữ liệu có sự thay đổi hoặc phát sinh sự cố.

## Ví dụ

* Thêm mới sinh viên.
* Cập nhật thông tin nhân sự.
* Xóa học phần.
* Duyệt đơn nghỉ phép.
* Phân quyền tài khoản.
* Xuất báo cáo.

### Các trường dữ liệu

| Trường        | Giải thích                                       |
| ------------- | ------------------------------------------------ |
| id            | Khóa chính của nhật ký thao tác.                 |
| user_id       | Tài khoản thực hiện thao tác.                    |
| module        | Phân hệ phát sinh thao tác.                      |
| action        | Thao tác được thực hiện.                         |
| resource_type | Loại dữ liệu bị tác động.                        |
| resource_id   | Bản ghi dữ liệu bị tác động.                     |
| description   | Mô tả chi tiết thao tác.                         |
| old_values    | Dữ liệu trước khi thay đổi.                      |
| new_values    | Dữ liệu sau khi thay đổi.                        |
| ip_address    | Địa chỉ IP của người thực hiện thao tác.         |
| user_agent    | Thông tin trình duyệt hoặc ứng dụng gửi yêu cầu. |

### Giải thích các giá trị

#### action

| Giá trị        | Giải thích                      |
| -------------- | ------------------------------- |
| create         | Thêm mới dữ liệu.               |
| update         | Cập nhật dữ liệu.               |
| delete         | Xóa dữ liệu.                    |
| restore        | Khôi phục dữ liệu.              |
| approve        | Phê duyệt dữ liệu.              |
| reject         | Từ chối dữ liệu.                |
| import         | Nhập dữ liệu.                   |
| export         | Xuất dữ liệu.                   |
| assign_role    | Gán vai trò cho tài khoản.      |
| revoke_role    | Thu hồi vai trò của tài khoản.  |
| reset_password | Đặt lại mật khẩu cho tài khoản. |
| login          | Đăng nhập hệ thống.             |
| logout         | Đăng xuất hệ thống.             |


