///////////////////////////////////////////////////////////////
// Module 03 - Student Information System
// Part 1 - Academic Structure
///////////////////////////////////////////////////////////////

Table majors {
  id bigint [pk, increment]
  department_id bigint [not null] // điền số bất kỳ, sau này xong database core sẽ thêm vào
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  degree_level varchar(30)
  description text
  status varchar(20) [not null]
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    department_id
    status
  }
}

Table specializations {
  id bigint [pk, increment]
  major_id bigint [not null]
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  description text
  status varchar(20) [not null, default: 'active']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    major_id
    status
  }
}

Table training_systems {
  id bigint [pk, increment]
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  description text
  status varchar(20) [not null, default: 'active']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    status
  }
}

Table academic_terms {
  id bigint [pk, increment]
  code varchar(30) [not null, unique]
  academic_year varchar(20) [not null]
  semester tinyint [not null]
  start_date date
  end_date date
  registration_start date
  registration_end date
  status varchar(20) [not null, default: 'planning']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    code
    academic_year
    semester
    status
  }
}

Table courses {
  id bigint [pk, increment]
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  start_year smallint [not null]
  end_year smallint
  description text
  status varchar(20) [not null, default: 'active']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    start_year
    status
  }
}

Table admission_batches {
  id bigint [pk, increment]
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  year smallint [not null]
  start_date date
  end_date date
  status varchar(20) [not null]
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    code
    year
    status
  }
}

Table admission_students {
  id bigint [pk, increment]
  batch_id bigint [not null]
  candidate_code varchar(30) [not null, unique]
  full_name varchar(255) [not null]
  gender varchar(10)
  date_of_birth date
  citizen_id varchar(20)
  phone varchar(20)
  email varchar(255)
  major_id bigint
  admission_score decimal(5,2)
  status varchar(20) [not null, default: 'pending']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    batch_id
    candidate_code
    major_id
    status
  }
}

Table classes {
  id bigint [pk, increment]
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  major_id bigint [not null]
  specialization_id bigint
  course_id bigint [not null]
  advisor_id bigint // điền số bất kỳ, sau này xong database core sẽ thêm vào
  status varchar(20) [not null, default: 'active']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    code
    major_id
    course_id
    advisor_id
    status
  }
}

Table students {
  id bigint [pk, increment]
  user_id bigint
  student_code varchar(30) [not null, unique]
  admission_student_id bigint
  class_id bigint
  major_id bigint [not null]
  specialization_id bigint
  training_system_id bigint [not null]
  course_id bigint [not null]
  enrollment_date date
  full_name varchar(255) [not null]
  gender varchar(10)
  date_of_birth date
  citizen_id varchar(20)
  phone varchar(20)
  email varchar(255)
  address text
  avatar text
  status varchar(20) [not null, default: 'studying']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    user_id
    student_code
    class_id
    major_id
    course_id
    status
  }
}

Table student_profiles {
  id bigint [pk, increment]
  student_id bigint [not null]
  father_name varchar(255)
  mother_name varchar(255)
  guardian_name varchar(255)
  guardian_phone varchar(20)
  emergency_contact varchar(255)
  emergency_phone varchar(20)
  nationality varchar(100)
  ethnicity varchar(100)
  religion varchar(100)
  insurance_number varchar(50)
  bank_name varchar(255)
  bank_account varchar(100)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    student_id
  }
}

Table student_status_histories {
  id bigint [pk, increment]
  student_id bigint [not null]
  status varchar(30) [not null]
  effective_date date [not null]
  decision_no varchar(100)
  decision_date date
  reason text
  note text
  created_by bigint
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    student_id
    status
    effective_date
  }
}

Table student_reservations {
  id bigint [pk, increment]
  student_id bigint [not null]
  from_date date [not null]
  to_date date [not null]
  semester_from_id bigint
  semester_to_id bigint
  decision_no varchar(100)
  decision_date date
  reason text
  status varchar(20) [default: 'approved']
  created_by bigint
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    student_id
    semester_from_id
    semester_to_id
    status
  }
}

Table student_dropouts {
  id bigint [pk, increment]
  student_id bigint [not null]
  dropout_date date [not null]
  decision_no varchar(100)
  decision_date date
  reason text
  status varchar(20) [default: 'approved']
  created_by bigint
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    student_id
    dropout_date
    status
  }
}

Table student_major_changes {
  id bigint [pk, increment]
  student_id bigint [not null]
  from_major_id bigint [not null]
  to_major_id bigint [not null]
  from_specialization_id bigint
  to_specialization_id bigint
  effective_date date
  decision_no varchar(100)
  decision_date date
  reason text
  created_by bigint
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    student_id
    from_major_id
    to_major_id
  }
}

Table student_class_changes {
  id bigint [pk, increment]
  student_id bigint [not null]
  from_class_id bigint [not null]
  to_class_id bigint [not null]
  effective_date date
  decision_no varchar(100)
  decision_date date
  reason text
  created_by bigint
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    student_id
    from_class_id
    to_class_id
  }
}

Table graduations {
  id bigint [pk, increment]
  student_id bigint [not null]
  graduation_date date [not null]
  graduation_term_id bigint
  total_credit int
  gpa decimal(4,2)
  cpa decimal(4,2)
  classification varchar(50)
  degree_no varchar(100)
  decision_no varchar(100)
  decision_date date
  created_by bigint
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    student_id
    graduation_term_id
    graduation_date
  }
}

Table curriculums {
  id bigint [pk, increment]
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  major_id bigint [not null]
  specialization_id bigint
  training_system_id bigint [not null]
  course_id bigint [not null]
  total_credit int
  elective_credit int
  description text
  status varchar(20) [not null, default: 'active']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    code
    major_id
    training_system_id
    course_id
    status
  }
}

Table subjects {
  id bigint [pk, increment]
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  subject_type_id bigint
  credit tinyint [not null]
  theory_hours smallint [default: 0]
  practice_hours smallint [default: 0]
  lab_hours smallint [default: 0]
  description text
  status varchar(20) [not null, default: 'active']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    code
    subject_type_id
    credit
    status
  }
}

Table curriculum_subjects {
  id bigint [pk, increment]
  curriculum_id bigint [not null]
  subject_id bigint [not null]
  semester tinyint
  year_no tinyint
  display_order int
  is_capstone boolean [default: false]
  is_internship boolean [default: false]
  is_required boolean [default: true]
  elective_group varchar(100)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    curriculum_id
    subject_id
    semester
  }
}

Table subject_prerequisites {
  id bigint [pk, increment]
  subject_id bigint [not null]
  prerequisite_subject_id bigint [not null]
  type varchar(20) [not null, default: 'prerequisite']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    subject_id
    prerequisite_subject_id
  }
}

Table subject_conditions {
  id bigint [pk, increment]
  subject_id bigint [not null]
  min_gpa decimal(4,2)
  min_completed_credit int
  max_failed_subject int
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    subject_id
  }
}

Table subject_types {
  id bigint [pk, increment]
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  description text
  status varchar(20) [not null, default: 'active']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    code
    status
  }
}

Table course_sections {
  id bigint [pk, increment]
  subject_id bigint [not null]
  academic_term_id bigint [not null]
  section_code varchar(30) [not null]
  section_type varchar(20) [not null, default: 'theory']
  max_students int [not null]
  current_students int [not null, default: 0]
  registration_start datetime
  registration_end datetime
  status varchar(20) [not null, default: 'open']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    subject_id
    academic_term_id
    section_code
    section_type
    status
  }
}

Table course_registrations {
  id bigint [pk, increment]
  student_id bigint [not null]
  course_section_id bigint [not null]
  registered_at datetime
  cancelled_at datetime
  status varchar(20) [not null, default: 'registered']
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    student_id
    course_section_id
    status
  }
}

Table class_schedules {
  id bigint [pk, increment]
  course_section_id bigint [not null]
  lecturer_id bigint [not null] // điền số bất kỳ, sau này xong database core sẽ thêm vào
  room_id bigint [not null] // điền số bất kỳ, sau này xong database core sẽ thêm vào
  day_of_week tinyint [not null]
  lesson_from tinyint [not null]
  lesson_to tinyint [not null]
  start_date date
  end_date date
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    course_section_id
    lecturer_id
    room_id
    day_of_week
  }
}

Table schedule_changes {
  id bigint [pk, increment]
  schedule_id bigint [not null]
  old_room_id bigint // điền số bất kỳ, sau này xong database core sẽ thêm vào
  new_room_id bigint // điền số bất kỳ, sau này xong database core sẽ thêm vào
  old_lecturer_id bigint // điền số bất kỳ, sau này xong database core sẽ thêm vào
  new_lecturer_id bigint // điền số bất kỳ, sau này xong database core sẽ thêm vào
  old_date date
  new_date date
  reason text
  status varchar(20) [not null, default: 'approved']
  created_by bigint
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    schedule_id
    status
  }
}

Table student_grades {
  id bigint [pk, increment]
  course_registration_id bigint [not null]
  attendance_score decimal(5,2)
  assignment_score decimal(5,2)
  midterm_score decimal(5,2)
  final_score decimal(5,2)
  total_score decimal(5,2)
  letter_grade varchar(5)
  grade_point decimal(3,2)
  is_pass boolean
  is_locked boolean [not null, default: false]
  locked_at timestamp
  locked_by bigint
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    course_registration_id
    is_locked
  }
}

Table gpa_histories {
  id bigint [pk, increment]
  student_id bigint [not null]
  academic_term_id bigint [not null]
  registered_credit int
  earned_credit int
  accumulated_credit int
  semester_gpa decimal(4,2)
  cumulative_gpa decimal(4,2)
  academic_rank varchar(50)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    student_id
    academic_term_id
  }
}

Table academic_warnings {
  id bigint [pk, increment]
  student_id bigint [not null]
  academic_term_id bigint [not null]
  warning_type varchar(30) [not null]
  warning_level tinyint [default: 1]
  description text
  resolved_at timestamp
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    student_id
    academic_term_id
    warning_type
  }
}

Table student_logs {
  id bigint [pk, increment]
  student_id bigint [not null]
  action varchar(100) [not null]
  reference_type varchar(100)
  reference_id bigint
  description text
  created_by bigint
  created_at timestamp
  Indexes {
    student_id
    action
    reference_type
  }
}

Ref: student_grades.course_registration_id > course_registrations.id
Ref: gpa_histories.student_id > students.id
Ref: gpa_histories.academic_term_id > academic_terms.id
Ref: academic_warnings.student_id > students.id
Ref: academic_warnings.academic_term_id > academic_terms.id
Ref: student_logs.student_id > students.id
Ref: subjects.subject_type_id > subject_types.id
Ref: curriculums.major_id > majors.id
Ref: curriculums.specialization_id > specializations.id
Ref: curriculums.training_system_id > training_systems.id
Ref: curriculums.course_id > courses.id
Ref: curriculum_subjects.curriculum_id > curriculums.id
Ref: curriculum_subjects.subject_id > subjects.id
Ref: subject_prerequisites.subject_id > subjects.id
Ref: subject_prerequisites.prerequisite_subject_id > subjects.id
Ref: subject_conditions.subject_id > subjects.id
Ref: student_status_histories.student_id > students.id
Ref: student_reservations.student_id > students.id
Ref: student_reservations.semester_from_id > academic_terms.id
Ref: student_reservations.semester_to_id > academic_terms.id
Ref: student_dropouts.student_id > students.id
Ref: student_major_changes.student_id > students.id
Ref: student_major_changes.from_major_id > majors.id
Ref: student_major_changes.to_major_id > majors.id
Ref: student_major_changes.from_specialization_id > specializations.id
Ref: student_major_changes.to_specialization_id > specializations.id
Ref: student_class_changes.student_id > students.id
Ref: student_class_changes.from_class_id > classes.id
Ref: student_class_changes.to_class_id > classes.id
Ref: graduations.student_id > students.id
Ref: graduations.graduation_term_id > academic_terms.id
Ref: specializations.major_id > majors.id
Ref: admission_students.batch_id > admission_batches.id
Ref: admission_students.major_id > majors.id
Ref: classes.major_id > majors.id
Ref: classes.specialization_id > specializations.id
Ref: classes.course_id > courses.id
Ref: students.admission_student_id > admission_students.id
Ref: students.class_id > classes.id
Ref: students.major_id > majors.id
Ref: students.specialization_id > specializations.id
Ref: students.training_system_id > training_systems.id
Ref: students.course_id > courses.id
Ref: student_profiles.student_id > students.id


Ref: course_sections.subject_id > subjects.id
Ref: course_sections.academic_term_id > academic_terms.id
Ref: course_registrations.student_id > students.id
Ref: course_registrations.course_section_id > course_sections.id
Ref: class_schedules.course_section_id > course_sections.id
Ref: schedule_changes.schedule_id > class_schedules.id

// Module: 02 HRM
// Ref: classes.advisor_id > employee_profiles.id
// Ref: schedule_changes.old_lecturer_id > employee_profiles.id
// Ref: schedule_changes.new_lecturer_id > employee_profiles.id
// Ref: class_schedules.lecturer_id > employee_profiles.id
// Ref: class_schedules.room_id > rooms.id
// Ref: schedule_changes.old_room_id > rooms.id
// Ref: schedule_changes.new_room_id > rooms.id

// module: 01 IAM
Ref: student_logs.created_by > users.id
Ref: student_grades.locked_by > users.id
Ref: schedule_changes.created_by > users.id
Ref: students.user_id > users.id
Ref: graduations.created_by > users.id
Ref: student_class_changes.created_by > users.id
Ref: student_major_changes.created_by > users.id
Ref: student_dropouts.created_by > users.id
Ref: student_reservations.created_by > users.id
Ref: student_status_histories.created_by > users.id

// module: 00 Core
// Ref: majors.department_id > departments.id

Table users {
  id bigint [pk, increment]
  username varchar(100) [unique]
  password varchar
  email varchar(255) [unique]
  phone varchar(20)
  avatar varchar
  is_active boolean
  email_verified_at timestamp
  last_login_at timestamp
  created_at timestamp
  updated_at timestamp
}