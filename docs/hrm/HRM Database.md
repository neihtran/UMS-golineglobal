link: https://dbdiagram.io/d/02-HRM-6a55b072067336e1de68e559


Table positions {
  id bigint [pk, increment]
  code varchar(50) [not null, unique]
  name varchar(255) [not null]
  description text
  sort_order int [default: 0]
  status varchar(20) [default: 'ACTIVE']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table academic_ranks {
  id bigint [pk, increment]
  code varchar(50) [not null, unique]
  name varchar(255) [not null]
  description text
  sort_order int [default: 0]
  status varchar(20) [default: 'ACTIVE']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table employee_profiles {
  id bigint [pk, increment]
  employee_code varchar(30) [not null, unique]
  full_name varchar(255) [not null] 
  user_id bigint [not null] // điền số bất kỳ, sau này xong database IAM sẽ thêm vào
  department_id bigint // điền số bất kỳ, sau này xong database Core sẽ thêm vào
  position_id bigint
  academic_rank_id bigint
  employee_type varchar(20) [not null] // Master Value Group: EMPLOYEE_TYPE
  employment_type varchar(20) // Master Value Group: EMPLOYMENT_TYPE
  join_date date
  official_date date
  contract_start date
  contract_end date
  status varchar(20) [default: 'ACTIVE']
  phone varchar(20)
  personal_email varchar(255)
  work_email varchar(255)
  birthday date
  gender varchar(20) // Master Value Group: GENDER
  marital_status varchar(30) // Master Value Group: MARITAL_STATUS
  nationality varchar(100)
  ethnicity varchar(100)
  religion varchar(100)
  identity_no varchar(50)
  identity_issue_date date
  identity_issue_place varchar(255)
  tax_code varchar(50)
  social_insurance_no varchar(100)
  address text
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table degrees {
  id bigint [pk, increment]
  employee_id bigint [not null]
  degree_name varchar(255)
  major varchar(255)
  school varchar(255)
  country varchar(100)
  graduation_year int
  classification varchar(100)
  file_path text
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table certificates {
  id bigint [pk, increment]
  employee_id bigint [not null]
  certificate_name varchar(255)
  organization varchar(255)
  issue_date date
  expiry_date date
  certificate_no varchar(100)
  file_path text
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table training_histories {
  id bigint [pk, increment]
  employee_id bigint [not null]
  school varchar(255)
  program varchar(255)
  major varchar(255)
  degree varchar(255)
  country varchar(100)
  start_date date
  end_date date
  result varchar(255)
  file_path text
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table work_histories {
  id bigint [pk, increment]
  employee_id bigint [not null]
  organization varchar(255)
  department varchar(255)
  position varchar(255)
  start_date date
  end_date date
  job_description text
  reason_leave text
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table teaching_assignments {
  id bigint [pk, increment]
  lecturer_id bigint [not null]
  course_section_id bigint // điền số bất kỳ, sau này xong database SIS sẽ thêm vào
  teaching_type varchar(30) // THEORY | PRACTICE | LAB
  credit int
  teaching_hours decimal(8,2)
  start_date date
  end_date date
  status varchar(30) [default: 'PENDING']
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table advisor_assignments {
  id bigint [pk, increment]
  lecturer_id bigint [not null]
  class_id bigint [not null] // điền số bất kỳ, sau này xong database SIS sẽ thêm vào
  academic_term_id bigint [not null] // điền số bất kỳ, sau này xong database SIS sẽ thêm vào
  start_date date
  end_date date
  status varchar(30) [default: 'ACTIVE']
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table internship_supervisions {
  id bigint [pk, increment]
  lecturer_id bigint [not null]
  student_id bigint [not null] // điền số bất kỳ, sau này xong database SIS sẽ thêm vào
  company_id bigint // điền số bất kỳ, sau này xong database Module Internship sẽ thêm vào
  academic_term_id bigint [not null] // điền số bất kỳ, sau này xong database SIS sẽ thêm vào
  start_date date
  end_date date
  status varchar(30) [default: 'ASSIGNED']
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table thesis_supervisions {
  id bigint [pk, increment]
  lecturer_id bigint [not null]
  student_id bigint [not null] // điền số bất kỳ, sau này xong database SIS sẽ thêm vào
  graduation_project_id bigint [not null] // điền số bất kỳ, sau này xong database Module Graduation sẽ thêm vào
  academic_term_id bigint [not null] // điền số bất kỳ, sau này xong database SIS sẽ thêm vào
  role varchar(20) // MAIN | CO
  status varchar(30) [default: 'ASSIGNED']
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table exam_invigilations {
  id bigint [pk, increment]
  lecturer_id bigint [not null]
  exam_schedule_id bigint [not null] // điền số bất kỳ, sau này xong database Module Exam sẽ thêm vào
  role varchar(20) // MAIN | ASSISTANT
  start_time datetime
  end_time datetime
  status varchar(30) [default: 'ASSIGNED']
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table exam_markings {
  id bigint [pk, increment]
  lecturer_id bigint [not null]
  exam_schedule_id bigint [not null] // điền số bất kỳ, sau này xong database Module Exam sẽ thêm vào
  number_of_scripts int [default: 0]
  deadline datetime
  status varchar(30) [default: 'ASSIGNED']
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table work_schedules {
  id bigint [pk, increment]
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  start_time time
  end_time time
  break_start time
  break_end time
  working_hours decimal(5,2)
  late_after int // minutes
  early_leave_before int // minutes
  status varchar(20) [default: 'ACTIVE']
  description text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table employee_schedules {
  id bigint [pk, increment]
  employee_id bigint [not null]
  schedule_id bigint [not null]
  working_date date [not null]
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  indexes {
    (employee_id, working_date) [unique]
  }
}


Table attendances {
  id bigint [pk, increment]
  employee_id bigint [not null]
  schedule_id bigint
  attendance_date date [not null]
  check_in datetime
  check_out datetime
  working_minutes int [default: 0]
  late_minutes int [default: 0]
  early_leave_minutes int [default: 0]
  overtime_minutes int [default: 0]
  attendance_status varchar(30) [default: 'PRESENT']
  // PRESENT
  // ABSENT
  // LEAVE
  // HOLIDAY
  // REMOTE
  remark text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  indexes {
    (employee_id, attendance_date) [unique]
  }
}


Table attendance_logs {
  id bigint [pk, increment]
  attendance_id bigint [not null]
  employee_id bigint [not null]
  action varchar(20)
  // CHECK_IN
  // CHECK_OUT
  device_type varchar(30)
  // WEB
  // MOBILE
  // FACE
  // FINGERPRINT
  // CARD
  device_id bigint [not null] // điền số bất kỳ, sau này xong database Module Asset Management sẽ thêm vào
  device_name varchar(255)
  ip_address varchar(45)
  latitude decimal(10,7)
  longitude decimal(10,7)
  photo_path text
  created_at timestamp
}


Table leave_types {
  id bigint [pk, increment]
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  is_paid boolean [default: true]
  max_days decimal(5,2)
  description text
  status varchar(20) [default: 'ACTIVE']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table leave_requests {
  id bigint [pk, increment]
  employee_id bigint [not null]
  leave_type_id bigint [not null]
  from_date date
  to_date date
  total_days decimal(5,2)
  reason text
  file_path text
  approved_by bigint // đã có bảng user
  approved_at datetime
  status varchar(30) [default: 'PENDING']
  // DRAFT
  // PENDING
  // APPROVED
  // REJECTED
  // CANCELLED
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


Table overtime_requests {
  id bigint [pk, increment]
  employee_id bigint [not null]
  overtime_date date
  start_time datetime
  end_time datetime
  total_hours decimal(5,2)
  reason text
  approved_by bigint // đã có bảng user
  approved_at datetime
  status varchar(30) [default: 'PENDING']
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
}


///////////////////////////////////////////////////////////
// Khóa ngoại
///////////////////////////////////////////////////////////


// Ref: employee_profiles.user_id > users.id
// Ref: employee_profiles.department_id > departments.id
Ref: employee_profiles.position_id > positions.id
Ref: employee_profiles.academic_rank_id > academic_ranks.id


Ref: degrees.employee_id > employee_profiles.id


Ref: certificates.employee_id > employee_profiles.id


Ref: training_histories.employee_id > employee_profiles.id


Ref: work_histories.employee_id > employee_profiles.id


Ref: teaching_assignments.lecturer_id > employee_profiles.id
// Ref: teaching_assignments.course_section_id > course_sections.id


Ref: advisor_assignments.lecturer_id > employee_profiles.id
// Ref: advisor_assignments.class_id > classes.id
// Ref: advisor_assignments.academic_term_id > academic_terms.id


Ref: internship_supervisions.lecturer_id > employee_profiles.id
// Ref: internship_supervisions.student_id > students.id
// Ref: internship_supervisions.academic_term_id > academic_terms.id


Ref: thesis_supervisions.lecturer_id > employee_profiles.id
// Ref: thesis_supervisions.student_id > students.id
// Ref: thesis_supervisions.academic_term_id > academic_terms.id


// Ref: exam_invigilations.exam_schedule_id > exam_schedules.id
// Ref: exam_markings.exam_schedule_id > exam_schedules.id
// Ref: thesis_supervisions.graduation_project_id > graduation_projects.id
// Ref: internship_supervisions.company_id > companies.id


Ref: employee_schedules.employee_id > employee_profiles.id
Ref: employee_schedules.schedule_id > work_schedules.id


Ref: attendances.employee_id > employee_profiles.id
Ref: attendances.schedule_id > work_schedules.id


Ref: attendance_logs.attendance_id > attendances.id
Ref: attendance_logs.employee_id > employee_profiles.id


Ref: leave_requests.employee_id > employee_profiles.id
Ref: leave_requests.leave_type_id > leave_types.id
// Ref: leave_requests.approved_by > users.id


Ref: overtime_requests.employee_id > employee_profiles.id
// Ref: overtime_requests.approved_by > users.id



