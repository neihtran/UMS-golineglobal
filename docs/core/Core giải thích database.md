Part 1 - Cơ cấu tổ chức 

# organizations

## Chức năng
Quản lý thông tin tổ chức sử dụng hệ thống.

Thông thường đây là trường đại học hoặc đơn vị chủ quản triển khai hệ thống. Bảng này là cấp cao nhất trong cơ cấu tổ chức và là dữ liệu gốc cho các cơ sở đào tạo (`campuses`).

Ví dụ:
* Trường Đại học ABC.
* Đại học Quốc gia TP. Hồ Chí Minh.
* Học viện XYZ.

### Các trường dữ liệu

| Trường      | Giải thích                                                         |
| ----------- | ------------------------------------------------------------------ |
| id          | ID                                                                 |
| code        | Mã tổ chức, sử dụng duy nhất trong toàn hệ thống                   |
| name        | Tên đầy đủ của tổ chức                                             |
| short_name  | Tên viết tắt                                                       |
| description | Mô tả hoặc giới thiệu về tổ chức                                   |
| phone       | Số điện thoại liên hệ                                              |
| email       | Email liên hệ                                                      |
| website     | Website chính thức                                                 |
| logo        | Đường dẫn logo của tổ chức                                         |
| is_active   | Trạng thái hoạt động (`true`: Hoạt động, `false`: Ngừng hoạt động) |

### Ghi chú
* Một tổ chức có thể quản lý nhiều cơ sở đào tạo (`campuses`).
* Trong hầu hết các hệ thống đại học chỉ có một tổ chức, tuy nhiên thiết kế này hỗ trợ mở rộng nhiều tổ chức trong tương lai.
---

# campuses

## Chức năng
Quản lý các cơ sở đào tạo trực thuộc một tổ chức.

Mỗi cơ sở đào tạo có thể bao gồm nhiều khoa, phòng ban, tòa nhà và phòng học.

Ví dụ:
* Cơ sở 1.
* Cơ sở Linh Trung.
* Cơ sở Thủ Đức.

### Các trường dữ liệu

| Trường          | Giải thích                                                         |
| --------------- | ------------------------------------------------------------------ |
| id              | ID                                                                 |
| organization_id | Tổ chức quản lý cơ sở đào tạo                                      |
| code            | Mã cơ sở                                                           |
| name            | Tên cơ sở đào tạo                                                  |
| phone           | Số điện thoại liên hệ                                              |
| email           | Email liên hệ                                                      |
| address         | Địa chỉ cơ sở                                                      |
| latitude        | Vĩ độ của cơ sở                                                    |
| longitude       | Kinh độ của cơ sở                                                  |
| is_active       | Trạng thái hoạt động (`true`: Hoạt động, `false`: Ngừng hoạt động) |

### Ghi chú
* Một cơ sở đào tạo thuộc một tổ chức.
* Một cơ sở đào tạo có thể quản lý nhiều khoa (`faculties`), phòng/ban (`divisions`) và tòa nhà (`buildings`).

---

# faculties

## Chức năng
Quản lý các khoa trực thuộc cơ sở đào tạo.

Khoa là đơn vị chuyên môn chịu trách nhiệm quản lý chương trình đào tạo, giảng viên và sinh viên thuộc lĩnh vực chuyên ngành.

Ví dụ:
* Khoa Công nghệ Thông tin.
* Khoa Kinh tế.
* Khoa Ngoại ngữ.

### Các trường dữ liệu
| Trường           | Giải thích                                                         |
| ---------------- | ------------------------------------------------------------------ |
| id               | ID                                                                 |
| campus_id        | Cơ sở đào tạo quản lý khoa                                         |
| code             | Mã khoa                                                            |
| name             | Tên khoa                                                           |
| description      | Mô tả về khoa                                                      |
| established_date | Ngày thành lập khoa                                                |
| is_active        | Trạng thái hoạt động (`true`: Hoạt động, `false`: Ngừng hoạt động) |

### Ghi chú
* Một khoa thuộc một cơ sở đào tạo.
* Một khoa có thể quản lý nhiều bộ môn (`departments`).
* Các module HRM, SIS, LMS và Research đều sẽ tham chiếu đến bảng này.

---

# departments

## Chức năng

Quản lý các bộ môn trực thuộc khoa.

Bộ môn là đơn vị chuyên môn nhỏ hơn khoa, phụ trách giảng dạy và nghiên cứu theo từng 
lĩnh vực cụ thể.

Ví dụ:

* Bộ môn Công nghệ Phần mềm.
* Bộ môn Hệ thống Thông tin.
* Bộ môn Khoa học Máy tính.

### Các trường dữ liệu

| Trường           | Giải thích                                                         |
| ---------------- | ------------------------------------------------------------------ |
| id               | ID                                                                 |
| faculty_id       | Khoa quản lý bộ môn                                                |
| code             | Mã bộ môn                                                          |
| name             | Tên bộ môn                                                         |
| description      | Mô tả                                                              |
| established_date | Ngày thành lập bộ môn                                              |
| is_active        | Trạng thái hoạt động (`true`: Hoạt động, `false`: Ngừng hoạt động) |

### Ghi chú

* Một bộ môn thuộc một khoa.
* Giảng viên trong Module HRM sẽ được phân công về bộ môn.
* Một bộ môn có thể phụ trách nhiều môn học và lớp học phần trong Module SIS.

---

# divisions

## Chức năng

Quản lý các phòng, ban chức năng trực thuộc cơ sở đào tạo.

Đây là các đơn vị hành chính hỗ trợ công tác quản lý, không tham gia trực tiếp vào hoạt động giảng dạy.

Ví dụ:

* Phòng Đào tạo.
* Phòng Công tác Sinh viên.
* Phòng Tài chính.
* Phòng Hành chính - Tổng hợp.

### Các trường dữ liệu

| Trường      | Giải thích                                                         |
| ----------- | ------------------------------------------------------------------ |
| id          | ID                                                                 |
| campus_id   | Cơ sở đào tạo quản lý phòng/ban                                    |
| code        | Mã phòng/ban                                                       |
| name        | Tên phòng/ban                                                      |
| description | Mô tả                                                              |
| is_active   | Trạng thái hoạt động (`true`: Hoạt động, `false`: Ngừng hoạt động) |

### Ghi chú

* Một phòng/ban thuộc một cơ sở đào tạo.
* Các nhân viên hành chính trong Module HRM sẽ được phân công vào các phòng/ban này.

---

# buildings

## Chức năng

Quản lý các tòa nhà thuộc từng cơ sở đào tạo.

Mỗi tòa nhà có thể bao gồm nhiều tầng và nhiều phòng phục vụ giảng dạy, làm việc hoặc các hoạt động khác.

Ví dụ:

* Tòa A.
* Tòa B.
* Nhà Điều hành.
* Thư viện.

### Các trường dữ liệu

| Trường      | Giải thích                                                         |
| ----------- | ------------------------------------------------------------------ |
| id          | ID                                                                 |
| campus_id   | Cơ sở đào tạo sở hữu tòa nhà                                       |
| code        | Mã tòa nhà                                                         |
| name        | Tên tòa nhà                                                        |
| address     | Địa chỉ của tòa nhà (nếu khác địa chỉ cơ sở)                       |
| total_floor | Tổng số tầng của tòa nhà                                           |
| is_active   | Trạng thái hoạt động (`true`: Hoạt động, `false`: Ngừng hoạt động) |

### Ghi chú

* Một tòa nhà thuộc một cơ sở đào tạo.
* Một tòa nhà có nhiều tầng (`floors`).
* Các phòng học, phòng làm việc và phòng chức năng sẽ được quản lý thông qua các tầng của tòa nhà.


## Part 2 - Cơ sở vật chất

---

# floors

## Chức năng

Quản lý các tầng thuộc từng tòa nhà.

Mỗi tầng là đơn vị trung gian giúp tổ chức và quản lý các phòng học, phòng làm việc, phòng thí nghiệm hoặc các phòng chức năng khác trong một tòa nhà.

Ví dụ:

* Tầng 1.
* Tầng 2.
* Tầng 3.
* Tầng hầm B1.

### Các trường dữ liệu

| Trường       | Giải thích          |
| ------------ | ------------------- |
| id           | ID                  |
| building_id  | Tòa nhà chứa tầng   |
| floor_number | Số tầng của tòa nhà |
| name         | Tên tầng (nếu có)   |

### Ghi chú

* Một tầng thuộc một tòa nhà.
* Một tầng có thể quản lý nhiều phòng (`rooms`).
* `floor_number` dùng để sắp xếp và xác định vị trí thực tế của tầng.
* `name` thường được sử dụng khi tòa nhà có các khu vực đặc biệt như **Tầng hầm**, **Tầng kỹ thuật**, **Mái**, **Mezzanine**...

---

# room_types

## Chức năng

Quản lý danh mục các loại phòng sử dụng trong toàn hệ thống.

Việc tách loại phòng thành bảng riêng giúp dễ dàng mở rộng và thống kê theo từng loại phòng mà không phải lưu dữ liệu dạng chuỗi trong bảng `rooms`.

Ví dụ:

* Phòng học lý thuyết.
* Phòng thực hành.
* Phòng thí nghiệm.
* Phòng hội thảo.
* Phòng họp.
* Văn phòng.
* Hội trường.

### Các trường dữ liệu

| Trường      | Giải thích     |
| ----------- | -------------- |
| id          | ID             |
| code        | Mã loại phòng  |
| name        | Tên loại phòng |
| description | Mô tả          |

### Ghi chú

* Một loại phòng có thể được sử dụng bởi nhiều phòng (`rooms`).
* Được sử dụng trong các module:

  * Classroom Management.
  * Asset Management.
  * SIS (xếp lịch học).
  * Exam (xếp phòng thi).

---

# rooms

## Chức năng

Quản lý toàn bộ các phòng thuộc trường đại học.

Đây là bảng trung tâm phục vụ việc quản lý phòng học, phòng làm việc và các phòng chức năng khác. Các module như SIS, Exam, Classroom Management, Asset Management hay Dormitory đều có thể tham chiếu đến bảng này.

Ví dụ:

* A101.
* A205.
* Phòng máy Lab 01.
* Hội trường lớn.
* Phòng họp số 1.

### Các trường dữ liệu

| Trường       | Giải thích                                                         |
| ------------ | ------------------------------------------------------------------ |
| id           | ID                                                                 |
| floor_id     | Tầng chứa phòng                                                    |
| room_type_id | Loại phòng                                                         |
| code         | Mã phòng                                                           |
| name         | Tên phòng                                                          |
| capacity     | Sức chứa tối đa                                                    |
| area         | Diện tích phòng (m²)                                               |
| description  | Mô tả                                                              |
| is_active    | Trạng thái hoạt động (`true`: Hoạt động, `false`: Ngừng hoạt động) |

### Ghi chú

* Một phòng thuộc một tầng.
* Một phòng chỉ có một loại phòng.
* Thông tin thiết bị của phòng sẽ được quản lý trong **Module Asset Management**, không lưu trực tiếp tại bảng này.
* Bảng này được sử dụng bởi nhiều module:

  * **SIS**: Xếp lịch học, đổi phòng học.
  * **Exam**: Xếp phòng thi.
  * **Classroom Management**: Đặt phòng, quản lý lịch sử sử dụng.
  * **Asset Management**: Quản lý thiết bị trong phòng.

---

## Part 3 - Thời gian học tập

---

# academic_years

## Chức năng

Quản lý các năm học của nhà trường.

Năm học là đơn vị thời gian lớn nhất trong hoạt động đào tạo và thường bao gồm nhiều học kỳ. Thông tin này được sử dụng thống nhất trong các module như SIS, HRM, Finance và Report.

Ví dụ:

* Năm học 2024 - 2025.
* Năm học 2025 - 2026.
* Năm học 2026 - 2027.

### Các trường dữ liệu

| Trường     | Giải thích                                                             |
| ---------- | ---------------------------------------------------------------------- |
| id         | ID                                                                     |
| code       | Mã năm học                                                             |
| name       | Tên năm học                                                            |
| start_date | Ngày bắt đầu năm học                                                   |
| end_date   | Ngày kết thúc năm học                                                  |
| is_current | Trạng thái hiện hành (`true`: Năm học hiện tại, `false`: Năm học khác) |

### Ghi chú

* Một năm học có thể bao gồm nhiều học kỳ (`semesters`).
* Tại một thời điểm chỉ nên có **một** năm học được đánh dấu là hiện hành (`is_current = true`).

---

# semesters

## Chức năng

Quản lý các học kỳ thuộc từng năm học.

Học kỳ là đơn vị thời gian được sử dụng trong quá trình đào tạo để tổ chức đăng ký học phần, xếp thời khóa biểu, nhập điểm và xét học vụ.

Ví dụ:

* Học kỳ 1.
* Học kỳ 2.
* Học kỳ hè.

### Các trường dữ liệu

| Trường             | Giải thích                     |
| ------------------ | ------------------------------ |
| id                 | ID                             |
| academic_year_id   | Năm học                        |
| code               | Mã học kỳ                      |
| name               | Tên học kỳ                     |
| semester_no        | Thứ tự học kỳ trong năm học    |
| start_date         | Ngày bắt đầu học kỳ            |
| end_date           | Ngày kết thúc học kỳ           |
| registration_start | Ngày bắt đầu đăng ký học phần  |
| registration_end   | Ngày kết thúc đăng ký học phần |

### Ghi chú

* Một học kỳ thuộc một năm học.
* Một năm học có thể có nhiều học kỳ (ví dụ: Học kỳ 1, Học kỳ 2 và Học kỳ hè).
* `registration_start` và `registration_end` được sử dụng để xác định khoảng thời gian sinh viên được phép đăng ký học phần.


## Part 4 - Danh mục dùng chung

---

# master_groups

## Chức năng

Quản lý các nhóm danh mục dùng chung của toàn hệ thống.

Thay vì tạo nhiều bảng nhỏ như `genders`, `religions`, `marital_statuses`, `blood_types`..., hệ thống sẽ gom các danh mục này thành từng nhóm trong `master_groups` và lưu các giá trị tương ứng trong `master_values`.

Ví dụ:

* Giới tính.
* Dân tộc.
* Tôn giáo.
* Nhóm máu.
* Trình độ học vấn.
* Trạng thái dữ liệu.
* Loại giấy tờ.
* Quốc tịch.

### Các trường dữ liệu

| Trường      | Giải thích                                                       |
| ----------- | ---------------------------------------------------------------- |
| id          | ID                                                               |
| code        | Mã nhóm danh mục                                                 |
| name        | Tên nhóm danh mục                                                |
| description | Mô tả                                                            |
| sort_order  | Thứ tự hiển thị                                                  |
| is_active   | Trạng thái hoạt động (`true`: Hoạt động, `false`: Ngừng sử dụng) |

### Ghi chú

* Một nhóm danh mục có thể chứa nhiều giá trị (`master_values`).
* `code` phải là duy nhất trong toàn hệ thống.
* Được sử dụng bởi hầu hết các module như HRM, SIS, Finance, Research...
* Khi cần bổ sung một danh mục mới, chỉ cần thêm một nhóm mới mà không phải tạo thêm bảng trong cơ sở dữ liệu.

---

# master_values

## Chức năng

Quản lý các giá trị thuộc từng nhóm danh mục.

Mỗi bản ghi đại diện cho một giá trị cụ thể trong một nhóm danh mục, giúp toàn bộ hệ thống sử dụng chung dữ liệu và tránh trùng lặp.

Ví dụ:

**Nhóm:** Giới tính

* Nam.
* Nữ.
* Khác.

**Nhóm:** Nhóm máu

* A.
* B.
* AB.
* O.

**Nhóm:** Tình trạng hôn nhân

* Độc thân.
* Đã kết hôn.
* Ly hôn.

### Các trường dữ liệu

| Trường      | Giải thích                                                       |
| ----------- | ---------------------------------------------------------------- |
| id          | ID                                                               |
| group_id    | Nhóm danh mục                                                    |
| code        | Mã giá trị                                                       |
| name        | Tên giá trị                                                      |
| description | Mô tả                                                            |
| sort_order  | Thứ tự hiển thị                                                  |
| is_default  | Giá trị mặc định (`true`: Mặc định, `false`: Không mặc định)     |
| is_active   | Trạng thái hoạt động (`true`: Hoạt động, `false`: Ngừng sử dụng) |

### Ghi chú

* Mỗi giá trị chỉ thuộc một nhóm danh mục.
* Trong cùng một nhóm, `code` nên là duy nhất.
* `sort_order` dùng để sắp xếp dữ liệu khi hiển thị.
* `is_default` xác định giá trị được chọn mặc định khi tạo mới dữ liệu.

---

## Part 5 - Địa giới hành chính

---

# countries

## Chức năng

Quản lý danh mục quốc gia.

Bảng này được sử dụng làm dữ liệu nền cho các địa chỉ và thông tin quốc tịch trong toàn hệ thống.

Ví dụ:

* Việt Nam.
* Nhật Bản.
* Hàn Quốc.
* Hoa Kỳ.

### Các trường dữ liệu

| Trường  | Giải thích                  |
| ------- | --------------------------- |
| id      | ID                          |
| name    | Tên quốc gia                |
| name_en | Tên quốc gia bằng tiếng Anh |

### Ghi chú

* Một quốc gia có thể có nhiều tỉnh/thành phố (`provinces`).
* Dữ liệu thường được nhập một lần và ít thay đổi.

---

# provinces

## Chức năng

Quản lý danh mục tỉnh và thành phố trực thuộc trung ương.

Đây là cấp hành chính trực thuộc quốc gia và được sử dụng trong các thông tin địa chỉ trên toàn hệ thống.

Ví dụ:

* Hà Nội.
* Thành phố Hồ Chí Minh.
* Đà Nẵng.
* Cần Thơ.

### Các trường dữ liệu

| Trường     | Giải thích         |
| ---------- | ------------------ |
| id         | ID                 |
| country_id | Quốc gia           |
| name       | Tên tỉnh/thành phố |
| name_en    | Tên tiếng Anh      |

### Ghi chú

* Một tỉnh/thành phố thuộc một quốc gia.
* Một tỉnh/thành phố có nhiều quận/huyện (`districts`).

---

# districts

## Chức năng

Quản lý danh mục quận, huyện, thị xã và thành phố trực thuộc tỉnh.

Đây là cấp hành chính trực thuộc tỉnh/thành phố.

Ví dụ:

* Quận 1.
* Quận Bình Thạnh.
* Huyện Củ Chi.
* Thành phố Thủ Đức.

### Các trường dữ liệu

| Trường      | Giải thích     |
| ----------- | -------------- |
| id          | ID             |
| province_id | Tỉnh/thành phố |
| name        | Tên quận/huyện |
| name_en     | Tên tiếng Anh  |

### Ghi chú

* Một quận/huyện thuộc một tỉnh/thành phố.
* Một quận/huyện có nhiều phường/xã (`wards`).

---

# wards

## Chức năng

Quản lý danh mục phường, xã và thôn.

Đây là cấp hành chính nhỏ nhất được sử dụng trong hệ thống để chuẩn hóa địa chỉ.

Ví dụ:

* Phường Bến Nghé.
* Xã Bình Mỹ.
* Thôn 8.

### Các trường dữ liệu

| Trường      | Giải thích	 |
| ----------- | ---------------------- |
| id          | ID                     |
| district_id | Quận/huyện             |
| name        | Tên phường/xã/thị trấn |
| name_en     | Tên tiếng Anh          |

### Ghi chú

* Một phường/xã thuộc một quận/huyện.
* Bảng này được sử dụng chung bởi tất cả các module có thông tin địa chỉ như HRM, SIS, CRM, Dormitory...
* Dữ liệu địa giới hành chính nên được đồng bộ từ nguồn dữ liệu chính thức của cơ quan quản lý nhà nước để đảm bảo tính chính xác và thống nhất.


