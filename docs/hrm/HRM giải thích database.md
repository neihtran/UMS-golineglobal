# Part 1 - Danh mục & Hồ sơ nhân sự
---

# positions

## Chức năng

Quản lý **danh mục chức vụ** của nhân sự trong trường.

Chức vụ được sử dụng để xác định vai trò quản lý hoặc chức danh của cán bộ, giảng viên và nhân viên trong quá trình công tác.

Ví dụ:
* Giảng viên.
* Trưởng bộ môn.
* Trưởng khoa.
* Trưởng phòng.
* Phó Hiệu trưởng.
* Hiệu trưởng.

### Các trường dữ liệu

| Trường      | Giải thích                        |
| ----------- | --------------------------------- |
| id          | ID                                |
| code        | Mã chức vụ                        |
| name        | Tên chức vụ                       |
| description | Mô tả chức vụ                     |
| sort_order  | Thứ tự hiển thị                   |
| status      | Trạng thái (`active`, `inactive`) |

### Giải thích trạng thái

* `active`: Đang được sử dụng.
* `inactive`: Ngừng sử dụng.

---

# academic_ranks

## Chức năng
Quản lý **học hàm, học vị** của giảng viên và cán bộ chuyên môn.

Thông tin này phục vụ cho việc quản lý hồ sơ nhân sự, phân công giảng dạy và thống kê trình độ chuyên môn.

Ví dụ:
* Cử nhân.
* Kỹ sư.
* Thạc sĩ.
* Tiến sĩ.
* Phó Giáo sư.
* Giáo sư.

### Các trường dữ liệu

| Trường      | Giải thích                        |
| ----------- | --------------------------------- |
| id          | ID                                |
| code        | Mã học hàm/học vị                 |
| name        | Tên học hàm/học vị                |
| description | Mô tả                             |
| sort_order  | Thứ tự hiển thị                   |
| status      | Trạng thái (`active`, `inactive`) |

### Giải thích trạng thái

* `active`: Đang được sử dụng.
* `inactive`: Ngừng sử dụng.

---

# employee_profiles

## Chức năng
Quản lý **hồ sơ nhân sự** của toàn bộ cán bộ, giảng viên và nhân viên trong trường.

Đây là bảng trung tâm của Module HRM. Các thông tin như bằng cấp, chứng chỉ, quá trình đào tạo, quá trình công tác, phân công giảng dạy và chấm công đều liên kết với bảng này.

Ví dụ:
* Hồ sơ giảng viên.
* Hồ sơ nhân viên hành chính.
* Hồ sơ cán bộ quản lý.
* Hồ sơ giảng viên thỉnh giảng.

### Các trường dữ liệu

| Trường               | Giải thích                                                                       |
| -------------------- | -------------------------------------------------------------------------------- |
| id                   | ID                                                                               |
| employee_code        | Mã nhân sự                                                                       |
| full_name        | Tên nhân sự                                                                       |
| user_id              | Tài khoản đăng nhập                                                              |
| department_id        | Đơn vị công tác                                                                  |
| position_id          | Chức vụ                                                                          |
| academic_rank_id     | Học hàm/học vị                                                                   |
| employee_type        | Loại nhân sự (`lecturer`, `staff`, `manager`, `researcher`, `visiting_lecturer`) |
| employment_type      | Loại hình làm việc (`full_time`, `part_time`, `contract`)                        |
| join_date            | Ngày bắt đầu làm việc                                                            |
| official_date        | Ngày trở thành nhân sự chính thức                                                |
| contract_start       | Ngày bắt đầu hợp đồng                                                            |
| contract_end         | Ngày kết thúc hợp đồng                                                           |
| status               | Trạng thái làm việc (`active`, `inactive`, `suspended`, `resigned`, `retired`)   |
| phone                | Số điện thoại                                                                    |
| personal_email       | Email cá nhân                                                                    |
| work_email           | Email cơ quan                                                                    |
| birthday             | Ngày sinh                                                                        |
| gender               | Giới tính (`male`, `female`, `other`)                                            |
| marital_status       | Tình trạng hôn nhân (`single`, `married`, `divorced`, `widowed`)                 |
| nationality          | Quốc tịch                                                                        |
| ethnicity            | Dân tộc                                                                          |
| religion             | Tôn giáo                                                                         |
| identity_no          | Số CCCD/CMND                                                                     |
| identity_issue_date  | Ngày cấp CCCD/CMND                                                               |
| identity_issue_place | Nơi cấp CCCD/CMND                                                                |
| tax_code             | Mã số thuế cá nhân                                                               |
| social_insurance_no  | Mã số bảo hiểm xã hội                                                            |
| address              | Địa chỉ thường trú                                                               |
| note                 | Ghi chú                                                                          |

### Giải thích loại nhân sự
* `lecturer`: Giảng viên.
* `staff`: Nhân viên hành chính.
* `manager`: Cán bộ quản lý.
* `researcher`: Cán bộ nghiên cứu.
* `visiting_lecturer`: Giảng viên thỉnh giảng.

### Giải thích loại hình làm việc
* `full_time`: Làm việc toàn thời gian.
* `part_time`: Làm việc bán thời gian.
* `contract`: Làm việc theo hợp đồng.

### Giải thích trạng thái
* `active`: Đang làm việc.
* `inactive`: Tạm ngừng làm việc.
* `suspended`: Tạm đình chỉ công tác.
* `resigned`: Đã nghỉ việc.
* `retired`: Đã nghỉ hưu.

### Giải thích giới tính
* `male`: Nam.
* `female`: Nữ.
* `other`: Khác.

### Giải thích tình trạng hôn nhân
* `single`: Độc thân.
* `married`: Đã kết hôn.
* `divorced`: Đã ly hôn.
* `widowed`: Góa.

---

# degrees

## Chức năng
Quản lý **bằng cấp** của nhân sự.

Một nhân sự có thể có nhiều bằng cấp khác nhau trong quá trình học tập và nghiên cứu.

Ví dụ:
* Cử nhân Công nghệ thông tin.
* Kỹ sư Xây dựng.
* Thạc sĩ Quản trị kinh doanh.
* Tiến sĩ Khoa học máy tính.

### Các trường dữ liệu

| Trường          | Giải thích              |
| --------------- | ----------------------- |
| id              | ID                      |
| employee_id     | Nhân sự sở hữu bằng cấp |
| degree_name     | Tên bằng cấp            |
| major           | Chuyên ngành            |
| school          | Trường đào tạo          |
| country         | Quốc gia đào tạo        |
| graduation_year | Năm tốt nghiệp          |
| classification | Xếp loại tốt nghiệp (`excellent`, `good`, `fair`, `average`, `pass`) |
| file_path       | Đường dẫn tệp bằng cấp  |
| note            | Ghi chú                 |

---

# certificates

## Chức năng
Quản lý **chứng chỉ chuyên môn** của nhân sự.

Chứng chỉ thường có thời hạn sử dụng và được cấp bởi các tổ chức đào tạo hoặc tổ chức chứng nhận.

Ví dụ:
* IELTS.
* TOEIC.
* MOS.
* AWS Certified Solutions Architect.
* CCNA.

### Các trường dữ liệu

| Trường           | Giải thích               |
| ---------------- | ------------------------ |
| id               | ID                       |
| employee_id      | Nhân sự sở hữu chứng chỉ |
| certificate_name | Tên chứng chỉ            |
| organization     | Đơn vị cấp chứng chỉ     |
| issue_date       | Ngày cấp                 |
| expiry_date      | Ngày hết hạn             |
| certificate_no   | Mã/Số chứng chỉ          |
| file_path        | Đường dẫn tệp chứng chỉ  |
| note             | Ghi chú                  |

---

# training_histories

## Chức năng
Quản lý **quá trình đào tạo** của nhân sự.

Bao gồm các chương trình đào tạo dài hạn, ngắn hạn, khóa bồi dưỡng hoặc các chương trình nâng cao trình độ chuyên môn.

Ví dụ:
* Đào tạo Thạc sĩ.
* Đào tạo Tiến sĩ.
* Khóa bồi dưỡng nghiệp vụ sư phạm.
* Khóa đào tạo chuyển đổi số.
* Khóa đào tạo AI.

### Các trường dữ liệu

| Trường      | Giải thích                       |
| ----------- | -------------------------------- |
| id          | ID                               |
| employee_id | Nhân sự tham gia đào tạo         |
| school      | Đơn vị đào tạo                   |
| program     | Tên chương trình đào tạo         |
| major       | Chuyên ngành                     |
| degree      | Văn bằng hoặc chứng chỉ đạt được |
| country     | Quốc gia đào tạo                 |
| start_date  | Ngày bắt đầu                     |
| end_date    | Ngày kết thúc                    |
| result | Kết quả đào tạo (`excellent`, `good`, `fair`, `average`, `pass`, `fail`, `completed`, `in_progress`) |
| file_path   | Đường dẫn tệp chứng nhận/kết quả |
| note        | Ghi chú                          |

---

# work_histories

## Chức năng
Quản lý **quá trình công tác** của nhân sự trước đây và trong nội bộ nhà trường.

Thông tin này phục vụ cho việc quản lý hồ sơ, đánh giá kinh nghiệm làm việc và xét các tiêu chuẩn về chuyên môn.

Ví dụ:
* Công tác tại doanh nghiệp.
* Công tác tại trường đại học khác.
* Điều chuyển giữa các đơn vị trong trường.
* Thay đổi chức vụ.

### Các trường dữ liệu

| Trường          | Giải thích                           |
| --------------- | ------------------------------------ |
| id              | ID                                   |
| employee_id     | Nhân sự                              |
| organization    | Cơ quan hoặc đơn vị công tác         |
| department      | Phòng ban/Bộ môn/Khoa công tác       |
| position        | Chức vụ đảm nhiệm                    |
| start_date      | Ngày bắt đầu công tác                |
| end_date        | Ngày kết thúc công tác               |
| job_description | Mô tả công việc                      |
| reason_leave    | Lý do nghỉ việc hoặc chuyển công tác |
| note            | Ghi chú                              |

---

# Part 2 - Quản lý công việc

---

# teaching_assignments

## Chức năng
Quản lý **phân công giảng dạy** cho giảng viên theo từng lớp học phần.

Thông tin này phục vụ cho việc lập kế hoạch giảng dạy, theo dõi khối lượng giảng dạy và tính giờ giảng.

Ví dụ:
* Phân công giảng dạy học phần Lập trình Web.
* Phân công giảng dạy thực hành Mạng máy tính.
* Phân công giảng dạy phòng thí nghiệm.

### Các trường dữ liệu

| Trường            | Giải thích                                                   |
| ----------------- | ------------------------------------------------------------ |
| id                | ID                                                           |
| lecturer_id       | Giảng viên được phân công                                    |
| course_section_id | Lớp học phần                                                 |
| teaching_type     | Hình thức giảng dạy (`theory`, `practice`, `lab`)            |
| credit            | Số tín chỉ                                                   |
| teaching_hours    | Tổng số giờ giảng                                            |
| start_date        | Ngày bắt đầu giảng dạy                                       |
| end_date          | Ngày kết thúc giảng dạy                                      |
| status            | Trạng thái (`pending`, `assigned`, `completed`, `cancelled`) |
| note              | Ghi chú                                                      |

### Giải thích các giá trị

**teaching_type**
* `theory`: Giảng dạy lý thuyết.
* `practice`: Giảng dạy thực hành.
* `lab`: Giảng dạy phòng thí nghiệm.

**status**
* `pending`: Chờ phân công hoặc chờ xác nhận.
* `assigned`: Đã được phân công.
* `completed`: Đã hoàn thành.
* `cancelled`: Đã hủy.

---

# advisor_assignments

## Chức năng
Quản lý **phân công cố vấn học tập** cho từng lớp sinh viên.

Giảng viên cố vấn có nhiệm vụ hỗ trợ sinh viên trong quá trình học tập, đăng ký học phần và giải quyết các vấn đề học vụ.

Ví dụ:
* Cố vấn lớp CNTT K20.
* Cố vấn lớp Quản trị kinh doanh K21.
* Cố vấn lớp Kỹ thuật phần mềm K22.

### Các trường dữ liệu

| Trường           | Giải thích                                      |
| ---------------- | ----------------------------------------------- |
| id               | ID                                              |
| lecturer_id      | Giảng viên cố vấn                               |
| class_id         | Lớp sinh viên                                   |
| academic_term_id | Học kỳ áp dụng                                  |
| start_date       | Ngày bắt đầu                                    |
| end_date         | Ngày kết thúc                                   |
| status           | Trạng thái (`active`, `completed`, `cancelled`) |
| note             | Ghi chú                                         |

### Giải thích các giá trị

**status**
* `active`: Đang thực hiện nhiệm vụ cố vấn.
* `completed`: Đã hoàn thành.
* `cancelled`: Đã hủy phân công.

---

# internship_supervisions

## Chức năng
Quản lý **phân công hướng dẫn thực tập** cho sinh viên.

Giảng viên sẽ theo dõi, hướng dẫn và đánh giá quá trình thực tập của sinh viên tại doanh nghiệp hoặc đơn vị tiếp nhận.

Ví dụ:
* Hướng dẫn thực tập doanh nghiệp.
* Hướng dẫn thực tập tốt nghiệp.
* Hướng dẫn thực tập nghề nghiệp.

### Các trường dữ liệu

| Trường           | Giải thích                                                       |
| ---------------- | ---------------------------------------------------------------- |
| id               | ID                                                               |
| lecturer_id      | Giảng viên hướng dẫn                                             |
| student_id       | Sinh viên thực tập                                               |
| company_id       | Doanh nghiệp tiếp nhận thực tập                                  |
| academic_term_id | Học kỳ                                                           |
| start_date       | Ngày bắt đầu hướng dẫn                                           |
| end_date         | Ngày kết thúc hướng dẫn                                          |
| status           | Trạng thái (`assigned`, `in_progress`, `completed`, `cancelled`) |
| note             | Ghi chú                                                          |

### Giải thích các giá trị

**status**
* `assigned`: Đã phân công giảng viên hướng dẫn.
* `in_progress`: Đang trong thời gian thực tập.
* `completed`: Đã hoàn thành thực tập.
* `cancelled`: Đã hủy phân công.

---

# thesis_supervisions

## Chức năng
Quản lý **phân công hướng dẫn đồ án, khóa luận hoặc luận văn** của sinh viên.

Một đề tài có thể có giảng viên hướng dẫn chính và giảng viên đồng hướng dẫn.

Ví dụ:
* Hướng dẫn đồ án tốt nghiệp.
* Hướng dẫn khóa luận tốt nghiệp.
* Hướng dẫn luận văn cao học.

### Các trường dữ liệu

| Trường                | Giải thích                                                       |
| --------------------- | ---------------------------------------------------------------- |

| id                    | ID                                                               |
| lecturer_id           | Giảng viên hướng dẫn                                             |
| student_id            | Sinh viên thực hiện                                              |
| graduation_project_id | Đồ án/khóa luận được hướng dẫn                                   |
| academic_term_id      | Học kỳ                                                           |
| role                  | Vai trò (`main`, `co`)                                           |
| status                | Trạng thái (`assigned`, `in_progress`, `completed`, `cancelled`) |
| note                  | Ghi chú                                                          |

### Giải thích các giá trị

**role**
* `main`: Giảng viên hướng dẫn chính.
* `co`: Giảng viên đồng hướng dẫn.

**status**
* `assigned`: Đã phân công.
* `in_progress`: Đang hướng dẫn.
* `completed`: Đã hoàn thành.
* `cancelled`: Đã hủy.

---

# exam_invigilations

## Chức năng
Quản lý **phân công coi thi** cho giảng viên.

Thông tin này phục vụ cho việc bố trí cán bộ coi thi theo từng ca thi, phòng thi và lịch thi.

Ví dụ:
* Coi thi giữa kỳ.
* Coi thi cuối kỳ.
* Coi thi bổ sung.

### Các trường dữ liệu

| Trường           | Giải thích                                        |
| ---------------- | ------------------------------------------------- |
| id               | ID                                                |
| lecturer_id      | Giảng viên coi thi                                |
| exam_schedule_id | Lịch thi                                          |
| role             | Vai trò (`main`, `assistant`)                     |
| start_time       | Thời gian bắt đầu coi thi                         |
| end_time         | Thời gian kết thúc coi thi                        |
| status           | Trạng thái (`assigned`, `completed`, `cancelled`) |
| note             | Ghi chú                                           |

### Giải thích các giá trị

**role**
* `main`: Giám thị chính.
* `assistant`: Giám thị hỗ trợ.

**status**
* `assigned`: Đã phân công.
* `completed`: Đã hoàn thành nhiệm vụ.
* `cancelled`: Đã hủy phân công.

---

# exam_markings

## Chức năng
Quản lý **phân công chấm thi** cho giảng viên.

Thông tin này phục vụ cho việc theo dõi số lượng bài thi được giao, thời hạn hoàn thành và trạng thái chấm thi.

Ví dụ:
* Chấm thi giữa kỳ.
* Chấm thi cuối kỳ.
* Chấm thi tốt nghiệp.

### Các trường dữ liệu

| Trường            | Giải thích                                                   |
| ----------------- | ------------------------------------------------------------ |
| id                | ID                                                           |
| lecturer_id       | Giảng viên chấm thi                                          |
| exam_schedule_id  | Lịch thi                                                     |
| number_of_scripts | Số lượng bài thi được giao                                   |
| deadline          | Hạn hoàn thành chấm thi                                      |
| status            | Trạng thái (`assigned`, `grading`, `completed`, `cancelled`) |
| note              | Ghi chú                                                      |

### Giải thích các giá trị

**status**
* `assigned`: Đã phân công chấm thi.
* `grading`: Đang chấm thi.
* `completed`: Đã hoàn thành việc chấm thi.
* `cancelled`: Đã hủy phân công.
—

# Part 3 - Chấm công & Nghỉ phép
---

# work_schedules

## Chức năng
Quản lý **ca làm việc** áp dụng cho cán bộ, giảng viên và nhân viên.

Ca làm việc được sử dụng để xác định thời gian làm việc tiêu chuẩn, thời gian nghỉ giữa ca và làm cơ sở tính đi muộn, về sớm và thời gian làm việc.

Ví dụ:
* Ca hành chính.
* Ca sáng.
* Ca chiều.
* Ca tối.
* Ca cuối tuần.

### Các trường dữ liệu

| Trường             | Giải thích                                    |
| ------------------ | --------------------------------------------- |
| id                 | ID                                            |
| code               | Mã ca làm việc                                |
| name               | Tên ca làm việc                               |
| start_time         | Thời gian bắt đầu ca                          |
| end_time           | Thời gian kết thúc ca                         |
| break_start        | Thời gian bắt đầu nghỉ giữa ca                |
| break_end          | Thời gian kết thúc nghỉ giữa ca               |
| working_hours      | Tổng số giờ làm việc                          |
| late_after         | Số phút cho phép đi muộn                      |
| early_leave_before | Số phút cho phép về sớm                       |
| status             | Trạng thái ca làm việc (`active`, `inactive`) |
| description        | Mô tả                                         |

### Giải thích các giá trị

**status - Trạng thái ca làm việc**

* `active`: Đang được sử dụng.
* `inactive`: Ngừng sử dụng.

---

# employee_schedules

## Chức năng
Quản lý **lịch làm việc** của từng nhân sự.

Bảng này dùng để phân công ca làm việc theo từng ngày, làm cơ sở cho việc chấm công và tính thời gian làm việc.

Ví dụ:
* Phân công ca hành chính.
* Phân công ca trực cuối tuần.
* Phân công ca làm việc ngoài giờ.

### Các trường dữ liệu

| Trường       | Giải thích    |
| ------------ | ------------- |
| id           | ID            |
| employee_id  | Nhân sự       |
| schedule_id  | Ca làm việc   |
| working_date | Ngày làm việc |
| note         | Ghi chú       |

---

# attendances

## Chức năng
Quản lý **kết quả chấm công** của nhân sự theo từng ngày.

Thông tin này được sử dụng để tính công, đánh giá chuyên cần, tính đi muộn, về sớm và làm cơ sở cho tính lương.

Ví dụ:
* Chấm công làm việc.
* Chấm công làm việc từ xa.
* Chấm công nghỉ phép.
* Chấm công ngày lễ.

### Các trường dữ liệu

| Trường              | Giải thích                                                               |
| ------------------- | ------------------------------------------------------------------------ |
| id                  | ID                                                                       |
| employee_id         | Nhân sự                                                                  |
| schedule_id         | Ca làm việc                                                              |
| attendance_date     | Ngày chấm công                                                           |
| check_in            | Thời gian check-in                                                       |
| check_out           | Thời gian check-out                                                      |
| working_minutes     | Tổng số phút làm việc                                                    |
| late_minutes        | Số phút đi muộn                                                          |
| early_leave_minutes | Số phút về sớm                                                           |
| overtime_minutes    | Số phút làm thêm                                                         |
| attendance_status   | Trạng thái chấm công (`present`, `absent`, `leave`, `holiday`, `remote`) |
| remark              | Ghi chú                                                                  |

### Giải thích các giá trị
**attendance_status - Trạng thái chấm công**
* `present`: Có mặt làm việc.
* `absent`: Vắng mặt.
* `leave`: Nghỉ phép.
* `holiday`: Nghỉ lễ hoặc nghỉ theo lịch của nhà trường.
* `remote`: Làm việc từ xa.
---

# attendance_logs
## Chức năng

Quản lý **lịch sử check-in/check-out** của nhân sự.

Mỗi lần check-in hoặc check-out sẽ được ghi nhận thành một bản ghi để phục vụ kiểm tra, đối soát và truy vết khi cần.

Ví dụ:
* Check-in bằng website.
* Check-in bằng ứng dụng di động.
* Check-in bằng nhận diện khuôn mặt.
* Check-in bằng máy chấm công.

### Các trường dữ liệu

| Trường        | Giải thích                                                     |
| ------------- | -------------------------------------------------------------- |
| id            | ID                                                             |
| attendance_id | Phiếu chấm công                                                |
| employee_id   | Nhân sự                                                        |
| action        | Hành động (`check_in`, `check_out`)                            |
| device_type   | Loại thiết bị (`web`, `mobile`, `face`, `fingerprint`, `card`) |
| device_id     | ID thiết bị chấm công                                          |
| device_name   | Tên thiết bị                                                   |
| ip_address    | Địa chỉ IP                                                     |
| latitude      | Vĩ độ                                                          |
| longitude     | Kinh độ                                                        |
| photo_path    | Đường dẫn ảnh xác thực                                         |

### Giải thích các giá trị

**action - Hành động chấm công**
* `check_in`: Check-in.
* `check_out`: Check-out.

**device_type - Loại thiết bị chấm công**
* `web`: Chấm công qua website.
* `mobile`: Chấm công qua ứng dụng di động.
* `face`: Chấm công bằng nhận diện khuôn mặt.
* `fingerprint`: Chấm công bằng vân tay.
* `card`: Chấm công bằng thẻ.
---

# leave_types

## Chức năng
Quản lý **danh mục loại nghỉ phép** của nhà trường.

Các loại nghỉ phép được sử dụng khi nhân sự tạo đơn xin nghỉ và phục vụ cho việc tính phép năm.

Ví dụ:
* Nghỉ phép năm.
* Nghỉ ốm.
* Nghỉ thai sản.
* Nghỉ không lương.
* Nghỉ việc riêng.

### Các trường dữ liệu

| Trường      | Giải thích                                       |
| ----------- | ------------------------------------------------ |
| id          | ID                                               |
| code        | Mã loại nghỉ phép                                |
| name        | Tên loại nghỉ phép                               |
| is_paid     | Có hưởng lương hay không                         |
| max_days    | Số ngày nghỉ tối đa                              |
| description | Mô tả                                            |
| status      | Trạng thái loại nghỉ phép (`active`, `inactive`) |

### Giải thích các giá trị

**is_paid**
* `true`: Nghỉ có hưởng lương.
* `false`: Nghỉ không hưởng lương.

**status - Trạng thái loại nghỉ phép**
* `active`: Đang được sử dụng.
* `inactive`: Ngừng sử dụng.

---

# leave_requests

## Chức năng
Quản lý **đơn xin nghỉ phép** của nhân sự.

Đơn nghỉ phép sẽ được gửi đến người có thẩm quyền để xét duyệt trước khi được ghi nhận vào kết quả chấm công.

Ví dụ:
* Xin nghỉ phép năm.
* Xin nghỉ ốm.
* Xin nghỉ việc riêng.
* Xin nghỉ thai sản.

### Các trường dữ liệu

| Trường        | Giải thích                                                                         |
| ------------- | ---------------------------------------------------------------------------------- |
| id            | ID                                                                                 |
| employee_id   | Nhân sự                                                                            |
| leave_type_id | Loại nghỉ phép                                                                     |
| from_date     | Ngày bắt đầu nghỉ                                                                  |
| to_date       | Ngày kết thúc nghỉ                                                                 |
| total_days    | Tổng số ngày nghỉ                                                                  |
| reason        | Lý do nghỉ                                                                         |
| file_path     | Đường dẫn tệp đính kèm                                                             |
| approved_by   | Người phê duyệt                                                                    |
| approved_at   | Thời gian phê duyệt                                                                |
| status        | Trạng thái đơn nghỉ phép (`draft`, `pending`, `approved`, `rejected`, `cancelled`) |

### Giải thích các giá trị

**status - Trạng thái đơn nghỉ phép**
* `draft`: Đang soạn.
* `pending`: Chờ phê duyệt.
* `approved`: Đã được phê duyệt.
* `rejected`: Bị từ chối.
* `cancelled`: Đã hủy đơn.
---

# overtime_requests

## Chức năng
Quản lý **đơn đăng ký làm thêm giờ** của nhân sự.

Đơn làm thêm giờ được sử dụng để đăng ký, phê duyệt và tính thời gian làm thêm theo quy định của nhà trường.

Ví dụ:
* Làm thêm ngoài giờ hành chính.
* Làm thêm cuối tuần.
* Làm thêm ngày lễ.
* Trực sự kiện.

### Các trường dữ liệu

| Trường        | Giải thích                                                                        |
| ------------- | --------------------------------------------------------------------------------- |
| id            | ID                                                                                |
| employee_id   | Nhân sự                                                                           |
| overtime_date | Ngày làm thêm                                                                     |
| start_time    | Thời gian bắt đầu                                                                 |
| end_time      | Thời gian kết thúc                                                                |
| total_hours   | Tổng số giờ làm thêm                                                              |
| reason        | Lý do làm thêm                                                                    |
| approved_by   | Người phê duyệt                                                                   |
| approved_at   | Thời gian phê duyệt                                                               |
| status        | Trạng thái đơn làm thêm (`draft`, `pending`, `approved`, `rejected`, `cancelled`) |
| note          | Ghi chú                                                                           |

### Giải thích các giá trị

**status - Trạng thái đơn làm thêm**
* `draft`: Đang soạn.
* `pending`: Chờ phê duyệt.
* `approved`: Đã được phê duyệt.
* `rejected`: Bị từ chối.
* `cancelled`: Đã hủy đơn.

---


