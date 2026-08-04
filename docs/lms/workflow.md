
Workflow 1 - Tạo khóa học (learning_courses)
Mục tiêu
Tạo một khóa học LMS từ lớp học phần trong SIS.
Quy trình
Giảng viên được phân công giảng dạy
        │
        ▼
SIS đã có course_section
        │
        ▼
Giảng viên chọn "Tạo khóa học LMS"
        │
        ▼
Kiểm tra đã tồn tại learning_course chưa
        │
   ┌────┴────┐
   │         │
 Có        Chưa
   │         │
Thông báo   ▼
        Tạo learning_course
              │
              ▼
        Sinh viên của enrollments
        được cấp quyền truy cập LMS
              │
              ▼
Khóa học sẵn sàng sử dụng

Bảng sử dụng
Bảng
Thao tác
course_sections
Đọc
enrollments
Đọc
learning_courses
Thêm


Workflow 2 - Quản lý học liệu (course_materials)
Mục tiêu
Giảng viên tải học liệu lên khóa học.
Quy trình
Giảng viên
      │
      ▼
Chọn khóa học
      │
      ▼
Tải học liệu
(Video / PDF / Slide / Link ...)
      │
      ▼
Upload File Storage
      │
      ▼
Lưu metadata vào course_materials
      │
      ▼
Sắp xếp display_order
      │
      ▼
Sinh viên xem học liệu

Bảng sử dụng
Bảng
Thao tác
learning_courses
Đọc
course_materials
Thêm / Sửa / Xóa


Workflow 3 - Quản lý chương học (course_modules)
Mục tiêu
Tổ chức nội dung khóa học.
Quy trình
Giảng viên

      │

      ▼

Khóa học

      │

      ▼

Tạo Module

      │

      ▼

Sắp xếp thứ tự

      │

      ▼

Publish Module

Bảng sử dụng
Bảng
Thao tác
learning_courses
Đọc
course_modules
Thêm / Sửa / Xóa


Workflow 4 - Quản lý bài học (lessons)
Mục tiêu
Tạo bài học thuộc từng chương.
Quy trình
Module

      │

      ▼

Thêm Lesson

      │

      ▼

Thiết lập loại bài học

      │

      ▼

Thiết lập Preview

      │

      ▼

Publish

Bảng sử dụng
Bảng
Thao tác
course_modules
Đọc
lessons
Thêm / Sửa / Xóa


Workflow 5 - Quản lý nội dung bài học (lesson_contents)
Mục tiêu
Thêm tài nguyên cho từng bài học.
Quy trình
Lesson

      │

      ▼

Thêm Video

      │

      ├───────────────┐

      ▼               ▼

Upload File      Nhập URL

      │               │

      └───────┬───────┘

              ▼

      lesson_contents

              │

              ▼

Sinh viên học

Bảng sử dụng
Bảng
Thao tác
lessons
Đọc
lesson_contents
Thêm / Sửa / Xóa


Workflow 6 - Giao bài tập (assignments)
Mục tiêu
Giảng viên tạo bài tập.
Quy trình
Giảng viên

      │

      ▼

Chọn Lesson

      │

      ▼

Nhập yêu cầu

      │

      ▼

Thiết lập

- Deadline
- Điểm
- Attempts

      │

      ▼

Publish Assignment

      │

      ▼

Sinh viên nhận thông báo

Bảng sử dụng
Bảng
Thao tác
learning_courses
Đọc
lessons
Đọc
assignments
Thêm / Sửa / Xóa


Workflow 7 - Nộp bài (assignment_submissions)
Mục tiêu
Sinh viên nộp bài.
Quy trình
Sinh viên

      │

      ▼

Mở Assignment

      │

      ▼

Nộp File/Text/URL

      │

      ▼

Kiểm tra Deadline

      │

 ┌────┴─────┐

 ▼          ▼

Đúng hạn   Trễ hạn

 │          │

 └────┬─────┘

      ▼

Lưu assignment_submissions

      │

      ▼

Cập nhật attempt_number

Bảng sử dụng
Bảng
Thao tác
assignments
Đọc
assignment_submissions
Thêm / Cập nhật


Workflow 8 - Chấm bài (assignment_grades)
Mục tiêu
Giảng viên đánh giá bài nộp.
Quy trình
Giảng viên

      │

      ▼

Danh sách bài nộp

      │

      ▼

Mở Submission

      │

      ▼

Nhập

- Điểm

- Feedback

      │

      ▼

Lưu assignment_grades

      │

      ▼

Cập nhật Submission = graded

      │

      ▼

Sinh viên xem điểm

Bảng sử dụng
Bảng
Thao tác
assignment_submissions
Đọc
assignment_grades
Thêm / Sửa
assignments
Đọc


Workflow 9 - Thảo luận (discussion_topics)
Mục tiêu
Tạo chủ đề thảo luận.
Quy trình
Giảng viên hoặc Sinh viên

        │

        ▼

Tạo Topic

        │

        ▼

Nhập tiêu đề

        │

        ▼

Publish

        │

        ▼

Các thành viên nhìn thấy Topic

Bảng sử dụng
Bảng
Thao tác
learning_courses
Đọc
lessons
Đọc
discussion_topics
Thêm / Sửa / Xóa


Workflow 10 - Bình luận (discussion_posts)
Mục tiêu
Trao đổi trong chủ đề.
Quy trình
Người dùng

      │

      ▼

Mở Topic

      │

      ▼

Đăng Comment

      │

      ▼

Có Reply ?

      │

 ┌────┴─────┐

 ▼          ▼

Có         Không

 │

 ▼

parent_post_id

 │

 ▼

Lưu discussion_posts

 │

 ▼

Thông báo thành viên

Bảng sử dụng
Bảng
Thao tác
discussion_topics
Đọc
discussion_posts
Thêm / Sửa / Xóa


Workflow 11 - Tạo buổi điểm danh (attendance_sessions)
Mục tiêu
Giảng viên mở điểm danh.
Quy trình
Giảng viên

      │

      ▼

Tạo Session

      │

      ▼

Chọn phương thức

QR / GPS / Face / Manual

      │

      ▼

Thiết lập

- Thời gian

- GPS

- QR

      │

      ▼

Mở điểm danh

Bảng sử dụng
Bảng
Thao tác
learning_courses
Đọc
lessons
Đọc
attendance_sessions
Thêm / Sửa / Xóa


Workflow 12 - Điểm danh sinh viên (attendance_records)
Mục tiêu
Ghi nhận kết quả điểm danh.
Quy trình
Sinh viên

      │

      ▼

Chọn phương thức

QR

GPS

Face

Manual

      │

      ▼

Xác thực

      │

      ▼

Hợp lệ ?

      │

 ┌────┴─────┐

 ▼          ▼

Không      Có

 │          │

Thông báo   ▼

      attendance_records

            │

            ▼

Giảng viên xem kết quả

Bảng sử dụng
Bảng
Thao tác
attendance_sessions
Đọc
attendance_records
Thêm
students
Đọc



Workflow tổng thể Module LMS
                                    SIS
                            course_sections
                                   │
                                   │
                                   ▼
                         learning_courses
                                   │
         ┌─────────┼───────────┐
         │                         │                         │
         ▼                         ▼                         ▼
 course_materials          course_modules          attendance_sessions
   (Học liệu)                    │                        │
                                 ▼                        ▼
                              lessons             attendance_records
                                 │
         ┌────────┼────────────┐
         │                       │                              │
         ▼                       ▼                              ▼
 lesson_contents           assignments              discussion_topics
 (Nội dung bài học)             │                              │
                                          ▼                              ▼
                 assignment_submissions          discussion_posts
                                │
                                ▼
                     assignment_grades


Quy trình nghiệp vụ tổng thể
Giảng viên được phân công giảng dạy
            │
            ▼
SIS tạo course_section
            │
            ▼
Tạo learning_course
            │
            ├──────────────────┐
            │                                              │
            ▼                                              ▼
    Đăng học liệu                                  Tạo Module học
course_materials                                  course_modules
                                                           │
                                                           ▼
                                                    Tạo Lesson
                                                       lessons
                                                           │
                   ┌───────────────┼──────────────┐
                   │                                       │                                     │
                   ▼                                       ▼                                     ▼
          lesson_contents                         assignments                    discussion_topics
                   │                                       │                                     │
                   │                                       ▼                                     ▼
                   │                          assignment_submissions             discussion_posts
                   │                                       │
                   │                                       ▼
                   │                             assignment_grades
                   │
                   └───────────┐
                                                  ▼
                                       attendance_sessions
                                                  │
                                                  ▼
                                        attendance_records
                                                  │
                                                  ▼
                                    Sinh viên hoàn thành khóa học


Ý nghĩa của từng giai đoạn
Giai đoạn
Bảng chính
Tạo khóa học
learning_courses
Chuẩn bị học liệu
course_materials
Xây dựng chương học
course_modules
Tạo bài học
lessons
Thêm nội dung bài học
lesson_contents
Giao bài tập
assignments
Sinh viên nộp bài
assignment_submissions
Giảng viên chấm điểm
assignment_grades
Thảo luận
discussion_topics, discussion_posts
Điểm danh
attendance_sessions, attendance_records


