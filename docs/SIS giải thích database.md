Part 1 - Danh mục đào tạo

majors
Chức năng: Quản lý danh sách ngành đào tạo của nhà trường.
Ví dụ:
Công nghệ thông tin
Kế toán
Quản trị kinh doanh

Các trường dữ liệu:
| Trường        | Giải thích                                                         |
| ----------- | --------------------------------- |
| id            | ID của ngành                                                       |
| department_id | Đơn vị (Khoa/Bộ môn) quản lý ngành, liên kết `departments` của HRM |
| code          | Mã ngành                                                           |
| name          | Tên ngành                                                          |
| degree_level  | Bậc đào tạo (Đại học, Cao học, Tiến sĩ...)                         |
| description   | Mô tả                                                              |
| status        | Trạng thái (`active`, `inactive`)                                  |

specializations
Chức năng: Quản lý các chuyên ngành thuộc một ngành đào tạo.
Ví dụ:
Ngành CNTT
Kỹ thuật phần mềm
Trí tuệ nhân tạo
An toàn thông tin
Khoa học dữ liệu

Các trường dữ liệu:
| Trường      | Giải thích                        |
| ----------- | --------------------------------- |
| id          | ID chuyên ngành                   |
| major_id    | Ngành đào tạo                     |
| code        | Mã chuyên ngành                   |
| name        | Tên chuyên ngành                  |
| description | Mô tả                             |
| status      | Trạng thái (`active`, `inactive`) |

training_systems
Chức năng: Quản lý các hệ đào tạo của trường.
Ví dụ:
Chính quy
Liên thông
Văn bằng 2
Các trường dữ liệu:
| Trường      | Giải thích                        |
| ----------- | --------------------------------- |
| id          | ID                                |
| code        | Mã hệ đào tạo                     |
| name        | Tên hệ đào tạo                    |
| description | Mô tả                             |
| status      | Trạng thái (`active`, `inactive`) |


academic_terms
Chức năng: Quản lý năm học và học kỳ.
Ví dụ:
2026-2027 - HK1
2026-2027 - HK2
2026-2027 - HK3

Đây là bảng được sử dụng gần như toàn bộ Module SIS.

Các trường dữ liệu:
| Trường             | Giải thích                                                      |
| ------------------ | --------------------------------------------------------------- |
| id                 | ID học kỳ                                                       |
| code               | Mã học kỳ                                                       |
| academic_year      | Năm học                                                         |
| semester           | Học kỳ                                                          |
| start_date         | Ngày bắt đầu học kỳ                                             |
| end_date           | Ngày kết thúc học kỳ                                            |
| registration_start | Ngày bắt đầu đăng ký học phần                                   |
| registration_end   | Ngày kết thúc đăng ký học phần                                  |
| status             | Trạng thái (`planning`, `registration`, `studying`, `finished`) |

courses
Chức năng: Quản lý khóa học (niên khóa) của sinh viên.
Ví dụ:
K20
K21
K22

Khóa học được sử dụng để xác định sinh viên thuộc khóa nào và áp dụng chương trình đào tạo tương ứng.

Các trường dữ liệu
| Trường      | Giải thích                        |
| ----------- | --------------------------------- |
| id          | ID khóa học                       |
| code        | Mã khóa học                       |
| name        | Tên khóa học                      |
| start_year  | Năm bắt đầu                       |
| end_year    | Năm kết thúc dự kiến              |
| description | Mô tả                             |
| status      | Trạng thái (`active`, `inactive`) |

Part 2 - Sinh viên & Tuyển sinh

admission_batches
Chức năng: Quản lý các đợt tuyển sinh của nhà trường.
Ví dụ:

Tuyển sinh Đại học 2026 - Đợt 1
Tuyển sinh Đại học 2026 - Đợt 2
Tuyển sinh Liên thông 2026

Sau khi thí sinh trúng tuyển sẽ được đưa vào đợt tuyển sinh tương ứng.

Các trường dữ liệu:
| Trường     | Giải thích                        |
| ---------- | --------------------------------- |
| id         | ID đợt tuyển sinh                 |
| code       | Mã đợt tuyển sinh                 |
| name       | Tên đợt tuyển sinh                |
| year       | Năm tuyển sinh                    |
| start_date | Ngày bắt đầu                      |
| end_date   | Ngày kết thúc                     |
| status     | Trạng thái (`active`, `inactive`) |

admission_students
Chức năng: Lưu danh sách thí sinh trúng tuyển.

Đây là dữ liệu đầu vào trước khi chính thức trở thành sinh viên.

Sau khi nhập học thành công sẽ sinh dữ liệu trong bảng students.

Các trường dữ liệu:
| Trường          | Giải thích                                                  |
| --------------- | ----------------------------------------------------------- |
| id              | ID thí sinh                                                 |
| batch_id        | Đợt tuyển sinh                                              |
| candidate_code  | Mã thí sinh                                                 |
| full_name       | Họ và tên                                                   |
| gender          | Giới tính                                                   |
| date_of_birth   | Ngày sinh                                                   |
| citizen_id      | CCCD/Hộ chiếu                                               |
| phone           | Số điện thoại                                               |
| email           | Email                                                       |
| major_id        | Ngành đăng ký                                               |
| admission_score | Điểm xét tuyển                                              |
| status          | Trạng thái (`pending`, `accepted`, `enrolled`, `cancelled`) |

classes
Chức năng: Quản lý lớp hành chính của sinh viên.

Ví dụ:
CNTT K20A
CNTT K20B
AI K21A

Lớp hành chính khác với lớp học phần.

Sinh viên chỉ thuộc một lớp hành chính tại một thời điểm.

Các trường dữ liệu:
| Trường            | Giải thích                        |
| ----------------- | --------------------------------- |
| id                | ID lớp                            |
| code              | Mã lớp                            |
| name              | Tên lớp                           |
| major_id          | Ngành đào tạo                     |
| specialization_id | Chuyên ngành                      |
| course_id         | Khóa học                          |
| advisor_id        | Cố vấn học tập (Employee - HRM)   |
| status            | Trạng thái (`active`, `inactive`) |

students
Chức năng: Lưu thông tin chính của sinh viên.

Đây là bảng trung tâm của toàn bộ Module SIS.

Tất cả các chức năng như:

Đăng ký học phần
Điểm
GPA
Cảnh báo học vụ
Tốt nghiệp

đều liên kết đến bảng này.

Các trường dữ liệu:
| Trường               | Giải thích                                  |
| -------------------- | ------------------------------------------- |
| id                   | ID sinh viên                                |
| user_id              | Tài khoản đăng nhập (Module Core Platform)  |
| student_code         | Mã sinh viên                                |
| admission_student_id | Hồ sơ tuyển sinh                            |
| class_id             | Lớp hành chính hiện tại                     |
| major_id             | Ngành                                       |
| specialization_id    | Chuyên ngành                                |
| training_system_id   | Hệ đào tạo                                  |
| course_id            | Khóa học                                    |
| enrollment_date      | Ngày nhập học                               |
| full_name            | Họ và tên                                   |
| gender               | Giới tính                                   |
| date_of_birth        | Ngày sinh                                   |
| citizen_id           | CCCD/Hộ chiếu                               |
| phone                | Số điện thoại                               |
| email                | Email                                       |
| address              | Địa chỉ                                     |
| avatar_file_id       | Ảnh đại diện (Module Core Platform - Files) |
| status               | Trạng thái học tập                          |

Ý nghĩa trạng thái: status
| Giá trị     | Ý nghĩa                                                      |
| ----------- | ------------------------------------------------------------ |
| studying    | Đang học                                                     |
| reserved    | Bảo lưu                                                      |
| graduated   | Đã tốt nghiệp                                                |
| dropped     | Thôi học                                                     |
| transferred | Đã chuyển ngành hoặc chuyển trường (tùy quy định triển khai) |

student_profiles
Chức năng: Lưu thông tin mở rộng của sinh viên.

Tách khỏi bảng students để giảm kích thước bảng chính và thuận tiện mở rộng trong tương lai.

Các trường dữ liệu:
| Trường            | Giải thích               |
| ----------------- | ------------------------ |
| id                | ID                       |
| student_id        | Sinh viên                |
| father_name       | Họ tên cha               |
| mother_name       | Họ tên mẹ                |
| guardian_name     | Người giám hộ            |
| guardian_phone    | Điện thoại người giám hộ |
| emergency_contact | Người liên hệ khẩn cấp   |
| emergency_phone   | Số điện thoại khẩn cấp   |
| nationality       | Quốc tịch                |
| ethnicity         | Dân tộc                  |
| religion          | Tôn giáo                 |
| insurance_number  | Số bảo hiểm              |
| bank_name         | Ngân hàng                |
| bank_account      | Số tài khoản ngân hàng   |

quan hệ giữa các bảng:
admission_batches
        │
        ▼
admission_students
        │
        ▼
students
        │
        ├────────────► student_profiles
        │
        ├────────────► classes
        │
        ├────────────► majors
        │
        ├────────────► specializations
        │
        ├────────────► training_systems
        │
        └────────────► courses

Part 3 - Quá trình học tập

student_status_histories
Chức năng: Lưu toàn bộ lịch sử thay đổi trạng thái học tập của sinh viên.

Khác với trường status trong bảng students chỉ lưu trạng thái hiện tại, bảng này lưu toàn bộ quá trình thay đổi để phục vụ tra cứu, thống kê và kiểm tra sau này.

Ví dụ:
01/09/2026  Đang học
15/03/2027  Bảo lưu
01/09/2027  Học lại
20/07/2030  Tốt nghiệp

Các trường dữ liệu:
| Trường         | Giải thích                               |
| -------------- | ---------------------------------------- |
| id             | ID                                       |
| student_id     | Sinh viên                                |
| status         | Trạng thái học tập (studying, reserved, dropped, graduated, transferred_major, transferred_class)                       |
| effective_date | Ngày bắt đầu áp dụng                     |
| decision_no    | Số quyết định                            |
| decision_date  | Ngày quyết định                          |
| reason         | Lý do                                    |
| note           | Ghi chú                                  |
| created_by     | Người tạo (Module Core Platform - Users) |

student_reservations
Chức năng: Quản lý các lần bảo lưu của sinh viên.

Một sinh viên có thể bảo lưu nhiều lần trong suốt quá trình học.

Các trường dữ liệu:
| Trường           | Giải thích              |
| ---------------- | ----------------------- |
| id               | ID                      |
| student_id       | Sinh viên               |
| from_date        | Ngày bắt đầu bảo lưu    |
| to_date          | Ngày kết thúc bảo lưu   |
| semester_from_id | Học kỳ bắt đầu bảo lưu  |
| semester_to_id   | Học kỳ kết thúc bảo lưu |
| decision_no      | Số quyết định           |
| decision_date    | Ngày quyết định         |
| reason           | Lý do bảo lưu           |
| status           | Trạng thái xử lý (approved, cancelled)       |
| created_by       | Người tạo               |

student_dropouts
Chức năng: Quản lý các quyết định thôi học của sinh viên.

Thông tin này được sử dụng để cập nhật trạng thái sinh viên và phục vụ thống kê.

Các trường dữ liệu:
| Trường        | Giải thích      |
| ------------- | --------------- |
| id            | ID              |
| student_id    | Sinh viên       |
| dropout_date  | Ngày thôi học   |
| decision_no   | Số quyết định   |
| decision_date | Ngày quyết định |
| reason        | Lý do thôi học  |
| status        | Trạng thái (approved, cancelled)     |
| created_by    | Người tạo       |


student_major_changes
Chức năng: Quản lý lịch sử chuyển ngành của sinh viên.

Sau khi chuyển ngành, hệ thống sẽ cập nhật lại ngành hiện tại trong bảng students và đồng thời lưu lịch sử tại bảng này.

Các trường dữ liệu:
| Trường                 | Giải thích             |
| ---------------------- | ---------------------- |
| id                     | ID                     |
| student_id             | Sinh viên              |
| from_major_id          | Ngành trước khi chuyển |
| to_major_id            | Ngành sau khi chuyển   |
| from_specialization_id | Chuyên ngành cũ        |
| to_specialization_id   | Chuyên ngành mới       |
| effective_date         | Ngày có hiệu lực       |
| decision_no            | Số quyết định          |
| decision_date          | Ngày quyết định        |
| reason                 | Lý do chuyển ngành     |
| created_by             | Người tạo              |

student_class_changes
Chức năng: Quản lý lịch sử chuyển lớp hành chính.

Sinh viên chỉ thuộc một lớp hành chính tại một thời điểm, nhưng có thể chuyển lớp trong quá trình học.

Các trường dữ liệu:
| Trường         | Giải thích       |
| -------------- | ---------------- |
| id             | ID               |
| student_id     | Sinh viên        |
| from_class_id  | Lớp cũ           |
| to_class_id    | Lớp mới          |
| effective_date | Ngày có hiệu lực |
| decision_no    | Số quyết định    |
| decision_date  | Ngày quyết định  |
| reason         | Lý do chuyển lớp |
| created_by     | Người tạo        |

graduations
Chức năng: Quản lý thông tin tốt nghiệp của sinh viên.

Khi sinh viên đủ điều kiện tốt nghiệp, hệ thống sẽ tạo bản ghi tại bảng này và cập nhật trạng thái trong bảng students.

Các trường dữ liệu:
| Trường             | Giải thích                   |
| ------------------ | ---------------------------- |
| id                 | ID                           |
| student_id         | Sinh viên                    |
| graduation_date    | Ngày tốt nghiệp              |
| graduation_term_id | Học kỳ tốt nghiệp            |
| total_credit       | Tổng số tín chỉ tích lũy     |
| gpa                | GPA tại thời điểm tốt nghiệp |
| cpa                | CPA tại thời điểm tốt nghiệp |
| classification     | Xếp loại tốt nghiệp  (Excellent, Very Good, Good, Average)        |
| degree_no          | Số bằng                      |
| decision_no        | Số quyết định tốt nghiệp     |
| decision_date      | Ngày quyết định              |
| created_by         | Người tạo                

students
     │
     ├────────────► student_status_histories
     │
     ├────────────► student_reservations
     │
     ├────────────► student_dropouts
     │
     ├────────────► student_major_changes
     │
     ├────────────► student_class_changes
     │
     └────────────► graduations


Part 4 - Chương trình đào tạo & Học phần

curriculums
Chức năng: Quản lý chương trình đào tạo áp dụng cho từng ngành, chuyên ngành, hệ đào tạo và khóa học.

Mỗi chương trình đào tạo quy định:
Danh sách môn học
Thứ tự học
Tổng số tín chỉ
Điều kiện tốt nghiệp

Ví dụ:
CNTT K20 - Chính quy
CNTT K21 - Chính quy
AI K20 - Chính quy

Mỗi chương trình đào tạo sẽ có danh sách học phần riêng.

Các trường dữ liệu:
| Trường             | Giải thích                        |
| ------------------ | --------------------------------- |
| id                 | ID chương trình đào tạo           |
| code               | Mã chương trình đào tạo           |
| name               | Tên chương trình đào tạo          |
| major_id           | Ngành đào tạo                     |
| specialization_id  | Chuyên ngành                      |
| training_system_id | Hệ đào tạo                        |
| course_id          | Khóa học                          |
| total_credit       | Tổng số tín chỉ                   |
| elective_credit    | Tổng số tín chỉ tự chọn           |
| description        | Mô tả                             |
| status             | Trạng thái (`active`, `inactive`) |

subject_types
Chức năng: Quản lý nhóm môn học.

Việc tách thành bảng riêng giúp dễ mở rộng khi trường bổ sung các loại môn học mới mà không cần sửa cấu trúc cơ sở dữ liệu.

Ví dụ:

Đại cương
Cơ sở ngành
Chuyên ngành
Thực tập
Khóa luận
Giáo dục quốc phòng
Giáo dục thể chất

Các trường dữ liệu:
| Trường      | Giải thích                        |
| ----------- | --------------------------------- |
| id          | ID loại môn học                   |
| code        | Mã loại môn học                   |
| name        | Tên loại môn học                  |
| description | Mô tả                             |
| status      | Trạng thái (`active`, `inactive`) |

subjects
Chức năng

Quản lý danh mục môn học của nhà trường.

Đây là danh mục môn học dùng chung cho tất cả chương trình đào tạo.

Ví dụ:

Lập trình Java
Cấu trúc dữ liệu
Toán cao cấp
Anh văn 1

Các trường dữ liệu
| Trường          | Giải thích                        |
| --------------- | --------------------------------- |
| id              | ID môn học                        |
| code            | Mã môn học                        |
| name            | Tên môn học                       |
| subject_type_id | Loại môn học                      |
| credit          | Số tín chỉ                        |
| theory_hours    | Số tiết lý thuyết                 |
| practice_hours  | Số tiết thực hành                 |
| lab_hours       | Số tiết phòng Lab                 |
| description     | Mô tả                             |
| status          | Trạng thái (`active`, `inactive`) |

curriculum_subjects
Chức năng
Liên kết môn học với chương trình đào tạo.
Đây là bảng quan trọng nhất của chương trình đào tạo.
Một môn học có thể xuất hiện trong nhiều chương trình đào tạo khác nhau.

Ví dụ:

Môn "Lập trình Java"

CNTT K20 → Học kỳ 3
AI K20 → Học kỳ 4

Đều sử dụng chung một môn học nhưng thuộc hai chương trình đào tạo khác nhau.

Các trường dữ liệu
| Trường         | Giải thích                                 |
| -------------- | ------------------------------------------ |
| id             | ID                                         |
| curriculum_id  | Chương trình đào tạo                       |
| subject_id     | Môn học                                    |
| semester       | Học kỳ dự kiến                             |
| year_no        | Năm học dự kiến                            |
| display_order  | Thứ tự hiển thị trong chương trình đào tạo |
| is_required    | Môn học bắt buộc (`true`, `false`)         |
| elective_group | Nhóm môn tự chọn                           |
| is_capstone    | Môn đồ án/khóa luận (`true`, `false`)      |
| is_internship  | Môn thực tập (`true`, `false`)             |

subject_prerequisites
Chức năng

Quản lý điều kiện tiên quyết hoặc song hành của môn học.

Ví dụ:
Cấu trúc dữ liệu
Tiên quyết:
Nhập môn lập trình
Hoặc
Đồ án chuyên ngành
Tiên quyết:
Hoàn thành 120 tín chỉ

Các trường dữ liệu
| Trường                  | Giải thích                                     |
| ----------------------- | ---------------------------------------------- |
| id                      | ID                                             |
| subject_id              | Môn học                                        |
| prerequisite_subject_id | Môn điều kiện                                  |
| type                    | Loại điều kiện (`prerequisite`, `corequisite`) |

subject_conditions
Chức năng
Quản lý các điều kiện đăng ký học phần ngoài điều kiện tiên quyết.

Ví dụ:
GPA tối thiểu
Số tín chỉ đã tích lũy
Số môn nợ tối đa

Hệ thống sẽ kiểm tra bảng này trước khi cho phép sinh viên đăng ký học phần.

Các trường dữ liệu
| Trường               | Giải thích                       |
| -------------------- | -------------------------------- |
| id                   | ID                               |
| subject_id           | Môn học                          |
| min_gpa              | GPA tối thiểu                    |
| min_completed_credit | Số tín chỉ đã tích lũy tối thiểu |
| max_failed_subject   | Số môn nợ tối đa được phép       |
| note                 | Ghi chú                          |

curriculums
      │
      ▼
curriculum_subjects
      ▲
      │
subjects
      ▲
      │
subject_types

subjects
      │
      ├────────────► subject_prerequisites
      │
      └────────────► subject_conditions

Part 5 - Đăng ký học phần & Thời khóa biểu

course_sections
Chức năng
Quản lý các lớp học phần được mở trong từng học kỳ.

Mỗi lớp học phần được mở từ một học phần trong chương trình đào tạo (curriculum_subjects).

Ví dụ:
Môn Lập trình Java
LHP01
LHP02

Đây là các lớp học phần khác nhau của cùng một môn học.

Các trường dữ liệu
| Trường                | Giải thích                                          |
| --------------------- | --------------------------------------------------- |
| id                    | ID lớp học phần                                     |
| curriculum_subject_id | Học phần trong chương trình đào tạo                 |
| academic_term_id      | Học kỳ mở lớp                                       |
| section_code          | Mã lớp học phần                                     |
| section_type          | Loại lớp (`theory`, `practice`, `lab`, `project`)   |
| max_students          | Số lượng sinh viên tối đa                           |
| current_students      | Số lượng sinh viên đã đăng ký                       |
| registration_start    | Thời gian bắt đầu đăng ký                           |
| registration_end      | Thời gian kết thúc đăng ký                          |
| status                | Trạng thái (`draft`, `open`, `closed`, `cancelled`) |

course_registrations
Chức năng
Quản lý việc sinh viên đăng ký hoặc hủy đăng ký học phần.

Đây là bảng trung tâm phục vụ:

Đăng ký học phần
Hủy đăng ký
Danh sách lớp
Nhập điểm
GPA

Mỗi bản ghi tương ứng với một sinh viên đăng ký một lớp học phần.

Các trường dữ liệu
| Trường            | Giải thích                                          |
| ----------------- | --------------------------------------------------- |
| id                | ID                                                  |
| student_id        | Sinh viên                                           |
| course_section_id | Lớp học phần                                        |
| registered_at     | Thời gian đăng ký                                   |
| cancelled_at      | Thời gian hủy đăng ký                               |
| status            | Trạng thái (`registered`, `cancelled`, `completed`) |

class_schedules
Chức năng
Quản lý thời khóa biểu của từng lớp học phần.

Một lớp học phần có thể có nhiều buổi học.

Ví dụ:
LHP01
Thứ 2 - Tiết 1 → Tiết 3
Thứ 5 - Tiết 1 → Tiết 3
Hoặc:
Buổi lý thuyết do Giảng viên A phụ trách.
Buổi thực hành do Giảng viên B phụ trách.

Thiết kế này cho phép một lớp học phần có nhiều giảng viên và nhiều phòng học khác nhau.

Các trường dữ liệu
| Trường            | Giải thích                                          |
| ----------------- | --------------------------------------------------- |
| id                | ID                                                  |
| course_section_id | Lớp học phần                                        |
| lecturer_id       | Giảng viên (Module HRM - Employees)                 |
| room_id           | Phòng học (Module Core Platform - Rooms)            |
| day_of_week       | Thứ trong tuần (1–7 hoặc theo quy ước của hệ thống) |
| lesson_from       | Tiết bắt đầu                                        |
| lesson_to         | Tiết kết thúc                                       |
| start_date        | Ngày bắt đầu áp dụng                                |
| end_date          | Ngày kết thúc áp dụng                               |

schedule_changes
Chức năng

Quản lý lịch sử thay đổi lịch học.

Áp dụng cho các trường hợp:
Đổi phòng học.
Đổi giảng viên.
Học bù.
Điều chỉnh lịch học.

Tất cả các thay đổi đều được lưu để phục vụ tra cứu và kiểm tra sau này.

Các trường dữ liệu
| Trường          | Giải thích                                     |
| --------------- | ---------------------------------------------- |
| id              | ID                                             |
| schedule_id     | Lịch học                                       |
| old_room_id     | Phòng học cũ                                   |
| new_room_id     | Phòng học mới                                  |
| old_lecturer_id | Giảng viên cũ                                  |
| new_lecturer_id | Giảng viên mới                                 |
| old_date        | Ngày học cũ                                    |
| new_date        | Ngày học mới                                   |
| reason          | Lý do thay đổi                                 |
| status          | Trạng thái (`pending`, `approved`, `rejected`) |
| created_by      | Người tạo (Module Core Platform - Users)       |

Quan hệ giữa các bảng
curriculum_subjects
          │
          ▼
   course_sections
          │
          ├────────────► course_registrations
          │                    │
          │                    ▼
          │                 students
          │
          ▼
   class_schedules
          │
          └────────────► schedule_changes

# Part 6 - Điểm & Cảnh báo học vụ
---
# student_grades
## Chức năng
Quản lý kết quả học tập của sinh viên theo từng lớp học phần.
Mỗi bản ghi tương ứng với **một sinh viên trong một lớp học phần**.
Bảng này được sử dụng để:
* Nhập điểm
* Chỉnh sửa điểm
* Khóa điểm
* Tính GPA
* Tính CPA
* Xét học lại
* Xét tốt nghiệp

### Các trường dữ liệu
| Trường                 | Giải thích                                     |
| ---------------------- | ---------------------------------------------- |
| id                     | ID                                             |
| course_registration_id | Đăng ký học phần                               |
| attendance_score       | Điểm chuyên cần                                |
| assignment_score       | Điểm bài tập                                   |
| midterm_score          | Điểm giữa kỳ                                   |
| final_score            | Điểm cuối kỳ                                   |
| total_score            | Điểm tổng kết                                  |
| letter_grade           | Điểm chữ (A, B+, B, C+, C, D+, D, F...)        |
| grade_point            | Điểm hệ 4 (0.0 - 4.0)                          |
| is_pass                | Kết quả đạt (`true`, `false`)                  |
| is_locked              | Trạng thái khóa điểm (`true`, `false`)         |
| locked_at              | Thời điểm khóa điểm                            |
| locked_by              | Người khóa điểm (Module Core Platform - Users) |

> **Lưu ý:** Sau khi `is_locked = true`, việc chỉnh sửa điểm chỉ được thực hiện theo quy trình được nhà trường quy định (ví dụ: mở khóa bởi người có thẩm quyền).

---

# gpa_histories
## Chức năng
Lưu lịch sử GPA/CPA của sinh viên theo từng học kỳ.
Bảng này giúp:
* Tra cứu GPA từng học kỳ.
* Theo dõi quá trình học tập.
* Xét học bổng.
* Xét cảnh báo học vụ.
* Xét tốt nghiệp.

Việc lưu kết quả theo học kỳ cũng giúp giảm thời gian tính toán khi cần thống kê hoặc in bảng điểm.

### Các trường dữ liệu

| Trường             | Giải thích                                                                     |
| ------------------ | ------------------------------------------------------------------------------ |
| id                 | ID                                                                             |
| student_id         | Sinh viên                                                                      |
| academic_term_id   | Học kỳ                                                                         |
| registered_credit  | Tổng số tín chỉ đã đăng ký trong học kỳ                                        |
| earned_credit      | Tổng số tín chỉ đạt trong học kỳ                                               |
| accumulated_credit | Tổng số tín chỉ tích lũy                                                       |
| semester_gpa       | GPA học kỳ                                                                     |
| cumulative_gpa     | CPA (GPA tích lũy)                                                             |
| academic_rank      | Xếp loại học lực (`Excellent`, `Very Good`, `Good`, `Average`, `Weak`, `Poor`) |
---

# academic_warnings

## Chức năng
Quản lý các cảnh báo học vụ của sinh viên.
Cảnh báo có thể được tạo tự động theo quy định của nhà trường hoặc do cán bộ đào tạo ghi nhận.

Ví dụ:
* GPA thấp.
* Thiếu tín chỉ.
* Nợ môn.
* Cảnh báo học tập.

### Các trường dữ liệu
| Trường           | Giải thích                                                                             |
| ---------------- | -------------------------------------------------------------------------------------- |
| id               | ID                                                                                     |
| student_id       | Sinh viên                                                                              |
| academic_term_id | Học kỳ                                                                                 |
| warning_type     | Loại cảnh báo (`low_gpa`, `failed_subject`, `insufficient_credit`, `academic_warning`) |
| warning_level    | Mức cảnh báo (1, 2, 3...)                                                              |
| description      | Nội dung cảnh báo                                                                      |
| resolved_at      | Thời điểm xử lý/xóa cảnh báo                                                           |

### Giải thích loại cảnh báo
* `low_gpa`: GPA dưới mức quy định.
* `failed_subject`: Có môn học không đạt.
* `insufficient_credit`: Thiếu số tín chỉ theo kế hoạch học tập.
* `academic_warning`: Cảnh báo học vụ theo quy định của nhà trường.

---

# student_logs
## Chức năng
Lưu nhật ký các sự kiện quan trọng liên quan đến sinh viên.

Khác với `audit_logs` của **Core Platform** (ghi nhận thao tác hệ thống), bảng này ghi nhận **các sự kiện nghiệp vụ** trong quá trình học tập của sinh viên.

Ví dụ:
* Đăng ký học phần.
* Hủy đăng ký học phần.
* Chuyển lớp.
* Chuyển ngành.
* Bảo lưu.
* Tốt nghiệp.
* Cập nhật điểm.

Bảng này hỗ trợ tra cứu lịch sử và đối chiếu nghiệp vụ.

### Các trường dữ liệu

| Trường         | Giải thích                                                         |
| -------------- | ------------------------------------------------------------------ |
| id             | ID                                                                 |
| student_id     | Sinh viên                                                          |
| action         | Hành động nghiệp vụ                                                |
| reference_type | Loại dữ liệu liên quan (Course Registration, Grade, Graduation...) |
| reference_id   | ID của dữ liệu liên quan                                           |
| description    | Mô tả chi tiết                                                     |
| created_by     | Người thực hiện (Module Core Platform - Users)                     |
| created_at     | Thời điểm ghi nhận sự kiện                                         |

---

## Quan hệ giữa các bảng


course_registrations
          │
          ▼
   student_grades
          │
          ▼
    gpa_histories
          │
          ▼
 academic_warnings

students
     │
     ├────────────► gpa_histories
     │
     ├────────────► academic_warnings
     │
     └────────────► student_logs



