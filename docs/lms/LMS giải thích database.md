# Part 1 - Quản lý khóa học

Gồm 2 bảng:

* `learning_courses`
* `course_materials`

---

# learning_courses

## Chức năng

Quản lý thông tin khóa học trên hệ thống LMS.

Mỗi khóa học được tạo tương ứng với một lớp học phần trong SIS và là nơi giảng viên tổ chức toàn bộ hoạt động giảng dạy trực tuyến như học liệu, bài học, bài tập, thảo luận và điểm danh.

## Ví dụ

* Khóa học **Lập trình Web** dành cho lớp CNTT K20.
* Khóa học **Cơ sở dữ liệu** học trong học kỳ 2.
* Khóa học **Java nâng cao** dành cho sinh viên học cải thiện.

### Các trường dữ liệu

| Trường            | Giải thích                                         |
| ----------------- | -------------------------------------------------- |
| id                | Khóa chính của khóa học.                           |
| code              | Mã khóa học.                                       |
| name              | Tên khóa học.                                      |
| description       | Mô tả hoặc giới thiệu khóa học.                    |
| thumbnail         | Ảnh đại diện của khóa học.                         |
| course_section_id | Lớp học phần trong SIS được liên kết với khóa học. |
| lecturer_id       | Giảng viên phụ trách khóa học.                     |
| start_date        | Ngày bắt đầu khóa học.                             |
| end_date          | Ngày kết thúc khóa học.                            |
| enrollment_type   | Hình thức tham gia khóa học.                       |
| visibility        | Phạm vi hiển thị khóa học.                         |
| status            | Trạng thái khóa học.                               |

### Giải thích các giá trị

#### enrollment_type

| Giá trị         | Giải thích                                                |
| --------------- | --------------------------------------------------------- |
| self_enrollment | Người học tự đăng ký tham gia khóa học.                   |
| invitation      | Người học chỉ tham gia khi được giảng viên mời.           |
| course_section  | Sinh viên được đồng bộ tự động từ lớp học phần trong SIS. |

#### visibility

| Giá trị | Giải thích                                     |
| ------- | ---------------------------------------------- |
| public  | Hiển thị cho mọi người dùng có quyền truy cập. |
| private | Chỉ thành viên của khóa học mới được truy cập. |

#### status

| Giá trị  | Giải thích                            |
| -------- | ------------------------------------- |
| active   | Khóa học đang hoạt động.              |
| inactive | Khóa học tạm ngừng hoạt động.         |
| archived | Khóa học đã kết thúc và được lưu trữ. |

---

# course_materials

## Chức năng

Quản lý toàn bộ học liệu được sử dụng trong khóa học.

Giảng viên có thể tải lên nhiều loại tài liệu nhằm hỗ trợ quá trình giảng dạy và học tập.

## Ví dụ

* File **Slide Chương 1.pdf**.
* Video **Giới thiệu môn học.mp4**.
* Tài liệu **Đề cương học phần.docx**.
* Link **Video hướng dẫn trên YouTube**.
* File **Source Code Lab 01.zip**.

### Các trường dữ liệu

| Trường             | Giải thích                                             |
| ------------------ | ------------------------------------------------------ |
| id                 | Khóa chính của học liệu.                               |
| title              | Tên học liệu.                                          |
| description        | Mô tả học liệu.                                        |
| learning_course_id | Khóa học chứa học liệu.                                |
| material_type      | Loại học liệu.                                         |
| file_path          | Đường dẫn lưu trữ học liệu.                            |
| file_size          | Dung lượng của học liệu.                               |
| duration           | Thời lượng của học liệu (đối với video hoặc âm thanh). |
| display_order      | Thứ tự hiển thị của học liệu.                          |
| is_downloadable    | Cho phép tải học liệu về thiết bị.                     |
| status             | Trạng thái học liệu.                                   |

### Giải thích các giá trị

#### material_type

| Giá trị     | Giải thích                         |
| ----------- | ---------------------------------- |
| video       | Video bài giảng.                   |
| pdf         | Tài liệu PDF.                      |
| slide       | Slide bài giảng.                   |
| document    | Tài liệu văn bản (Word, Excel...). |
| source_code | Mã nguồn hoặc dự án thực hành.     |
| archive     | File nén (ZIP, RAR...).            |
| image       | Hình ảnh.                          |
| link        | Liên kết tới tài nguyên bên ngoài. |

#### is_downloadable

| Giá trị | Giải thích               |
| ------- | ------------------------ |
| true    | Cho phép tải về.         |
| false   | Chỉ được xem trực tuyến. |

#### status

| Giá trị  | Giải thích                  |
| -------- | --------------------------- |
| active   | Học liệu đang được sử dụng. |
| inactive | Học liệu tạm ngừng sử dụng. |

---

# Part 2 - Bài học

Gồm 3 bảng:

* `course_modules`
* `lessons`
* `lesson_contents`

---

# course_modules

## Chức năng

Quản lý các chương hoặc mô-đun của khóa học.

Mỗi khóa học được chia thành nhiều chương để tổ chức nội dung học tập theo từng chủ đề hoặc từng giai đoạn giảng dạy.

## Ví dụ

* Chương 1 - Giới thiệu môn học.
* Chương 2 - HTML cơ bản.
* Chương 3 - CSS nâng cao.
* Chương 4 - JavaScript.

### Các trường dữ liệu

| Trường             | Giải thích                       |
| ------------------ | -------------------------------- |
| id                 | Khóa chính của chương.           |
| title              | Tên chương.                      |
| description        | Mô tả chương.                    |
| learning_course_id | Khóa học chứa chương.            |
| display_order      | Thứ tự hiển thị của chương.      |
| is_published       | Trạng thái công khai của chương. |
| status             | Trạng thái chương.               |

### Giải thích các giá trị

#### is_published

| Giá trị | Giải thích                   |
| ------- | ---------------------------- |
| true    | Sinh viên có thể xem chương. |
| false   | Chỉ giảng viên có thể xem.   |

#### status

| Giá trị  | Giải thích                |
| -------- | ------------------------- |
| active   | Chương đang hoạt động.    |
| inactive | Chương tạm ngừng sử dụng. |

---

# lessons

## Chức năng

Quản lý các bài học thuộc từng chương.

Mỗi chương có thể bao gồm nhiều bài học với các nội dung và hình thức giảng dạy khác nhau.

## Ví dụ

* HTML Introduction.
* HTML Form.
* CSS Flexbox.
* JavaScript DOM.
* Laravel Routing.

### Các trường dữ liệu

| Trường            | Giải thích                        |
| ----------------- | --------------------------------- |
| id                | Khóa chính của bài học.           |
| title             | Tên bài học.                      |
| summary           | Mô tả ngắn của bài học.           |
| course_module_id  | Chương chứa bài học.              |
| lesson_type       | Loại bài học.                     |
| estimated_minutes | Thời lượng dự kiến của bài học.   |
| display_order     | Thứ tự hiển thị của bài học.      |
| is_preview        | Cho phép học thử.                 |
| is_published      | Trạng thái công khai của bài học. |
| status            | Trạng thái bài học.               |

### Giải thích các giá trị

#### lesson_type

| Giá trị    | Giải thích                 |
| ---------- | -------------------------- |
| video      | Bài học bằng video.        |
| document   | Bài học sử dụng tài liệu.  |
| reading    | Bài học dạng nội dung đọc. |
| practice   | Bài học thực hành.         |
| assignment | Bài học giao bài tập.      |

#### is_preview

| Giá trị | Giải thích                                                 |
| ------- | ---------------------------------------------------------- |
| true    | Người học có thể xem trước mà không cần tham gia khóa học. |
| false   | Chỉ thành viên của khóa học mới được xem.                  |

#### is_published

| Giá trị | Giải thích                              |
| ------- | --------------------------------------- |
| true    | Bài học đã được công khai.              |
| false   | Bài học đang ở trạng thái nháp hoặc ẩn. |

#### status

| Giá trị  | Giải thích                 |
| -------- | -------------------------- |
| active   | Bài học đang hoạt động.    |
| inactive | Bài học tạm ngừng sử dụng. |

---

# lesson_contents

## Chức năng

Quản lý nội dung chi tiết của từng bài học.

Một bài học có thể bao gồm nhiều loại tài nguyên như video, tài liệu, hình ảnh, liên kết hoặc tệp đính kèm nhằm hỗ trợ người học tiếp cận đầy đủ nội dung.

## Ví dụ

* Video **Giới thiệu HTML**.
* Slide **HTML Basic**.
* File **Exercise 01.pdf**.
* Link **W3Schools HTML Tutorial**.
* File **Source Code Demo.zip**.

### Các trường dữ liệu

| Trường          | Giải thích                         |
| --------------- | ---------------------------------- |
| id              | Khóa chính của nội dung bài học.   |
| title           | Tên nội dung.                      |
| lesson_id       | Bài học chứa nội dung.             |
| content_type    | Loại nội dung.                     |
| content         | Nội dung văn bản.                  |
| file_path       | Đường dẫn lưu trữ tệp.             |
| external_url    | Liên kết tới tài nguyên bên ngoài. |
| duration        | Thời lượng của nội dung (nếu có).  |
| display_order   | Thứ tự hiển thị của nội dung.      |
| is_downloadable | Cho phép tải nội dung về thiết bị. |
| status          | Trạng thái nội dung.               |

### Giải thích các giá trị

#### content_type

| Giá trị     | Giải thích                         |
| ----------- | ---------------------------------- |
| video       | Video bài giảng.                   |
| pdf         | Tài liệu PDF.                      |
| slide       | Slide bài giảng.                   |
| document    | Tài liệu văn bản.                  |
| image       | Hình ảnh minh họa.                 |
| audio       | File âm thanh.                     |
| source_code | Mã nguồn hoặc dự án thực hành.     |
| link        | Liên kết tới tài nguyên bên ngoài. |

#### is_downloadable

| Giá trị | Giải thích               |
| ------- | ------------------------ |
| true    | Cho phép tải xuống.      |
| false   | Chỉ được xem trực tuyến. |

#### status

| Giá trị  | Giải thích                  |
| -------- | --------------------------- |
| active   | Nội dung đang được sử dụng. |
| inactive | Nội dung tạm ngừng sử dụng. |



# Part 3 - Bài tập

Gồm 3 bảng:

* `assignments`
* `assignment_submissions`
* `assignment_grades`

---

# assignments

## Chức năng

Quản lý các bài tập được giao trong khóa học.

Giảng viên có thể tạo bài tập, quy định thời gian nộp, số lần nộp và thang điểm đánh giá.

## Ví dụ

* Bài tập **HTML Form**.
* Bài tập **Thiết kế giao diện bằng CSS**.
* Bài tập **Xây dựng RESTful API với Laravel**.

### Các trường dữ liệu

| Trường                | Giải thích                       |
| --------------------- | -------------------------------- |
| id                    | Khóa chính của bài tập.          |
| title                 | Tên bài tập.                     |
| description           | Nội dung và yêu cầu của bài tập. |
| learning_course_id    | Khóa học chứa bài tập.           |
| lesson_id             | Bài học liên quan đến bài tập.   |
| assignment_type       | Loại bài tập.                    |
| open_at               | Thời gian bắt đầu nhận bài.      |
| due_at                | Hạn nộp bài.                     |
| close_at              | Thời gian đóng bài tập.          |
| max_score             | Điểm tối đa.                     |
| max_attempts          | Số lần nộp tối đa.               |
| allow_late_submission | Cho phép nộp trễ.                |
| allow_resubmission    | Cho phép nộp lại bài.            |
| status                | Trạng thái bài tập.              |

### Giải thích các giá trị

#### assignment_type

| Giá trị | Giải thích                        |
| ------- | --------------------------------- |
| file    | Nộp tệp đính kèm.                 |
| text    | Nhập nội dung trực tiếp.          |
| url     | Gửi liên kết website hoặc GitHub. |
| mixed   | Kết hợp nhiều hình thức nộp bài.  |

#### allow_late_submission

| Giá trị | Giải thích                  |
| ------- | --------------------------- |
| true    | Cho phép nộp sau hạn.       |
| false   | Không cho phép nộp sau hạn. |

#### allow_resubmission

| Giá trị | Giải thích             |
| ------- | ---------------------- |
| true    | Được phép nộp lại bài. |
| false   | Chỉ được nộp một lần.  |

#### status

| Giá trị  | Giải thích                 |
| -------- | -------------------------- |
| active   | Bài tập đang hoạt động.    |
| inactive | Bài tập tạm ngừng sử dụng. | 

---

# assignment_submissions

## Chức năng

Quản lý bài nộp của sinh viên đối với từng bài tập.

Mỗi sinh viên có thể có một hoặc nhiều lần nộp tùy theo quy định của bài tập.

## Ví dụ

* Sinh viên nộp file **Assignment01.zip**.
* Sinh viên gửi link GitHub.
* Sinh viên nhập trực tiếp nội dung bài làm trên hệ thống.

### Các trường dữ liệu

| Trường          | Giải thích                   |
| --------------- | ---------------------------- |
| id              | Khóa chính của bài nộp.      |
| assignment_id   | Bài tập được nộp.            |
| student_id      | Sinh viên thực hiện bài nộp. |
| submission_type | Hình thức nộp bài.           |
| content         | Nội dung bài làm.            |
| file_path       | Đường dẫn tệp bài nộp.       |
| submitted_at    | Thời điểm nộp bài.           |
| attempt_number  | Lần nộp bài.                 |
| status          | Trạng thái bài nộp.          |

### Giải thích các giá trị

#### submission_type

| Giá trị | Giải thích                        |
| ------- | --------------------------------- |
| file    | Nộp tệp đính kèm.                 |
| text    | Nhập nội dung trực tiếp.          |
| url     | Gửi liên kết website hoặc GitHub. |

#### status

| Giá trị   | Giải thích                 |
| --------- | -------------------------- |
| submitted | Đã nộp bài.                |
| late      | Nộp sau thời hạn.          |
| returned  | Được trả lại để chỉnh sửa. |
| graded    | Đã được chấm điểm.         |

---

# assignment_grades

## Chức năng

Quản lý kết quả chấm điểm và nhận xét của giảng viên đối với từng bài nộp.

Lưu lịch sử đánh giá giúp sinh viên theo dõi kết quả và phản hồi của giảng viên.

## Ví dụ

* Chấm 8.5 điểm và nhận xét cần cải thiện giao diện.
* Chấm 10 điểm cho bài đạt yêu cầu.
* Yêu cầu sinh viên chỉnh sửa và nộp lại.

### Các trường dữ liệu

| Trường        | Giải thích                       |
| ------------- | -------------------------------- |
| id            | Khóa chính của kết quả chấm bài. |
| submission_id | Bài nộp được chấm.               |
| lecturer_id   | Giảng viên thực hiện chấm bài.   |
| score         | Điểm của bài nộp.                |
| feedback      | Nhận xét của giảng viên.         |
| graded_at     | Thời điểm chấm bài.              |
| status        | Trạng thái kết quả chấm.         |

### Giải thích các giá trị

#### status

| Giá trị   | Giải thích               |
| --------- | ------------------------ |
| draft     | Đang chấm, chưa công bố. |
| published | Đã công bố kết quả.      |

---

# Part 4 - Thảo luận

Gồm 2 bảng:

* `discussion_topics`
* `discussion_posts`

---

# discussion_topics

## Chức năng

Quản lý các chủ đề thảo luận trong khóa học.

Giảng viên hoặc người học có thể tạo các chủ đề để trao đổi, hỏi đáp hoặc thảo luận về nội dung học tập.

## Ví dụ

* Chủ đề **Hỏi đáp Chương 1**.
* Chủ đề **Thông báo về bài tập cuối kỳ**.
* Chủ đề **Thảo luận dự án nhóm**.

### Các trường dữ liệu

| Trường             | Giải thích                       |
| ------------------ | -------------------------------- |
| id                 | Khóa chính của chủ đề thảo luận. |
| title              | Tiêu đề chủ đề.                  |
| description        | Nội dung giới thiệu chủ đề.      |
| learning_course_id | Khóa học chứa chủ đề.            |
| lesson_id          | Bài học liên quan (nếu có).      |
| created_by         | Người tạo chủ đề.                |
| is_pinned          | Ghim chủ đề.                     |
| is_locked          | Khóa chủ đề.                     |
| status             | Trạng thái chủ đề.               |

### Giải thích các giá trị

#### is_pinned

| Giá trị | Giải thích                          |
| ------- | ----------------------------------- |
| true    | Chủ đề được ghim lên đầu danh sách. |
| false   | Hiển thị theo thứ tự thông thường.  |

#### is_locked

| Giá trị | Giải thích                         |
| ------- | ---------------------------------- |
| true    | Không cho phép thêm bình luận mới. |
| false   | Cho phép tiếp tục thảo luận.       |

#### status

| Giá trị  | Giải thích               |
| -------- | ------------------------ |
| active   | Chủ đề đang hoạt động.   |
| inactive | Chủ đề đã ngừng sử dụng. |

---

# discussion_posts

## Chức năng

Quản lý các bài viết và phản hồi trong từng chủ đề thảo luận.

Hỗ trợ trao đổi giữa giảng viên và sinh viên theo dạng bình luận nhiều cấp.

## Ví dụ

* Sinh viên đặt câu hỏi về bài học.
* Giảng viên trả lời thắc mắc.
* Sinh viên phản hồi ý kiến của bạn học.

### Các trường dữ liệu

| Trường              | Giải thích                    |
| ------------------- | ----------------------------- |
| id                  | Khóa chính của bài viết.      |
| discussion_topic_id | Chủ đề chứa bài viết.         |
| user_id             | Người đăng bài viết.          |
| parent_post_id      | Bài viết cha nếu là phản hồi. |
| content             | Nội dung bài viết.            |
| is_answer           | Đánh dấu câu trả lời chính.   |
| status              | Trạng thái bài viết.          |

### Giải thích các giá trị

#### is_answer

| Giá trị | Giải thích                    |
| ------- | ----------------------------- |
| true    | Là câu trả lời được đánh dấu. |
| false   | Bài viết thông thường.        |

#### status

| Giá trị | Giải thích              |
| ------- | ----------------------- |
| active  | Bài viết đang hiển thị. |
| hidden  | Bài viết bị ẩn.         |
| deleted | Bài viết đã bị xóa mềm. |

---

# Part 5 - Điểm danh

Gồm 2 bảng:

* `attendance_sessions`
* `attendance_records`

---

# attendance_sessions

## Chức năng

Quản lý các buổi điểm danh trong khóa học.

Giảng viên có thể lựa chọn nhiều hình thức điểm danh khác nhau nhằm đảm bảo tính chính xác và phù hợp với từng buổi học.

## Ví dụ

* Điểm danh bằng mã QR trước giờ học.
* Điểm danh bằng GPS khi học ngoài thực địa.
* Điểm danh thủ công trên lớp.
* Điểm danh bằng nhận diện khuôn mặt.

### Các trường dữ liệu

| Trường             | Giải thích                     |
| ------------------ | ------------------------------ |
| id                 | Khóa chính của buổi điểm danh. |
| title              | Tên buổi điểm danh.            |
| learning_course_id | Khóa học áp dụng.              |
| lesson_id          | Bài học tương ứng.             |
| attendance_method  | Phương thức điểm danh.         |
| start_time         | Thời gian bắt đầu điểm danh.   |
| end_time           | Thời gian kết thúc điểm danh.  |
| qr_code            | Dữ liệu mã QR.                 |
| latitude           | Vĩ độ của vị trí điểm danh.    |
| longitude          | Kinh độ của vị trí điểm danh.  |
| radius             | Bán kính cho phép điểm danh.   |
| face_recognition   | Cho phép nhận diện khuôn mặt.  |
| status             | Trạng thái buổi điểm danh.     |

### Giải thích các giá trị

#### attendance_method

| Giá trị          | Giải thích                          |
| ---------------- | ----------------------------------- |
| qr_code          | Điểm danh bằng mã QR.               |
| gps              | Điểm danh theo vị trí GPS.          |
| face_recognition | Điểm danh bằng nhận diện khuôn mặt. |
| manual           | Giảng viên điểm danh thủ công.      |

#### face_recognition

| Giá trị | Giải thích                         |
| ------- | ---------------------------------- |
| true    | Bật xác thực bằng khuôn mặt.       |
| false   | Không sử dụng nhận diện khuôn mặt. |

#### status

| Giá trị   | Giải thích             |
| --------- | ---------------------- |
| scheduled | Chưa mở điểm danh.     |
| active    | Đang điểm danh.        |
| closed    | Đã kết thúc điểm danh. |

---

# attendance_records

## Chức năng

Quản lý kết quả điểm danh của từng sinh viên trong mỗi buổi học.

Lưu thời gian, phương thức xác thực và trạng thái tham gia của sinh viên.

## Ví dụ

* Sinh viên điểm danh thành công bằng mã QR.
* Sinh viên điểm danh bằng GPS.
* Giảng viên đánh dấu vắng mặt thủ công.
* Sinh viên đến muộn nhưng vẫn được ghi nhận.

### Các trường dữ liệu

| Trường                | Giải thích                            |
| --------------------- | ------------------------------------- |
| id                    | Khóa chính của kết quả điểm danh.     |
| attendance_session_id | Buổi điểm danh.                       |
| student_id            | Sinh viên được điểm danh.             |
| check_in_time         | Thời điểm điểm danh.                  |
| attendance_status     | Trạng thái tham gia.                  |
| latitude              | Vĩ độ tại thời điểm điểm danh.        |
| longitude             | Kinh độ tại thời điểm điểm danh.      |
| verification_method   | Phương thức xác thực được sử dụng.    |
| note                  | Ghi chú của giảng viên hoặc hệ thống. |

### Giải thích các giá trị

#### attendance_status

| Giá trị | Giải thích    |
| ------- | ------------- |
| present | Có mặt.       |
| absent  | Vắng mặt.     |
| late    | Đi học muộn.  |
| excused | Vắng có phép. |

#### verification_method

| Giá trị          | Giải thích                         |
| ---------------- | ---------------------------------- |
| qr_code          | Xác thực bằng mã QR.               |
| gps              | Xác thực bằng vị trí GPS.          |
| face_recognition | Xác thực bằng nhận diện khuôn mặt. |
| manual           | Giảng viên xác nhận thủ công.      |




