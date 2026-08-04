link: https://dbdiagram.io/d/04-LMS-6a687b53c3a90dd98dceec05


Table learning_courses {
  id bigint [pk, increment]
  code varchar(30) [not null, unique]
  name varchar(255) [not null]
  description text
  thumbnail text
  course_section_id bigint
  lecturer_id bigint
  start_date date
  end_date date
  enrollment_type varchar(30)
  visibility varchar(20)
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    code
    course_section_id
    lecturer_id
    status
  }
}


Table course_materials {
  id bigint [pk, increment]
  title varchar(255) [not null]
  description text
  learning_course_id bigint
  material_type varchar(30)
  file_path text
  file_size bigint
  duration int
  display_order int
  is_downloadable boolean
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    learning_course_id
    material_type
    status
  }
}


Table course_modules {
  id bigint [pk, increment]
  title varchar(255) [not null]
  description text
  learning_course_id bigint
  display_order int
  is_published boolean
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    learning_course_id
    status
  }
}


Table lessons {
  id bigint [pk, increment]
  title varchar(255) [not null]
  summary text
  course_module_id bigint
  lesson_type varchar(30)
  estimated_minutes int
  display_order int
  is_preview boolean
  is_published boolean
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    course_module_id
    lesson_type
    status
  }
}


Table lesson_contents {
  id bigint [pk, increment]
  title varchar(255)
  lesson_id bigint
  content_type varchar(30)
  content text
  file_path text
  external_url text
  duration int
  display_order int
  is_downloadable boolean
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    lesson_id
    content_type
    status
  }
}


Table assignments {
  id bigint [pk, increment]
  title varchar(255) [not null]
  description text
  learning_course_id bigint
  lesson_id bigint
  assignment_type varchar(30)
  open_at datetime
  due_at datetime
  close_at datetime
  max_score decimal(8,2)
  max_attempts int
  allow_late_submission boolean
  allow_resubmission boolean
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    learning_course_id
    lesson_id
    assignment_type
    status
  }
}


Table assignment_submissions {
  id bigint [pk, increment]
  assignment_id bigint
  student_id bigint
  submission_type varchar(30)
  content text
  file_path text
  submitted_at datetime
  attempt_number int
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    assignment_id
    student_id
    status
  }
}


Table assignment_grades {
  id bigint [pk, increment]
  submission_id bigint
  lecturer_id bigint
  score decimal(8,2)
  feedback text
  graded_at datetime
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    submission_id
    lecturer_id
    status
  }
}


Table discussion_topics {
  id bigint [pk, increment]
  title varchar(255) [not null]
  description text
  learning_course_id bigint
  lesson_id bigint
  created_by bigint
  is_pinned boolean
  is_locked boolean
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    learning_course_id
    lesson_id
    created_by
    status
  }
}


Table discussion_posts {
  id bigint [pk, increment]
  discussion_topic_id bigint
  user_id bigint
  parent_post_id bigint
  content text
  is_answer boolean
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    discussion_topic_id
    user_id
    parent_post_id
    status
  }
}


Table attendance_sessions {
  id bigint [pk, increment]
  title varchar(255)
  learning_course_id bigint
  lesson_id bigint
  attendance_method varchar(30)
  start_time datetime
  end_time datetime
  qr_code text
  latitude decimal(10,7)
  longitude decimal(10,7)
  radius int
  face_recognition boolean
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    learning_course_id
    lesson_id
    attendance_method
    status
  }
}


Table attendance_records {
  id bigint [pk, increment]
  attendance_session_id bigint
  student_id bigint
  check_in_time datetime
  attendance_status varchar(30)
  latitude decimal(10,7)
  longitude decimal(10,7)
  verification_method varchar(30)
  note text
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    attendance_session_id
    student_id
    attendance_status
  }
}




// Ref: learning_courses.course_section_id > course_sections.id
// Ref: learning_courses.lecturer_id > employee_profiles.id
Ref: course_materials.learning_course_id > learning_courses.id
Ref: course_modules.learning_course_id > learning_courses.id
Ref: lessons.course_module_id > course_modules.id
Ref: lesson_contents.lesson_id > lessons.id
Ref: assignments.learning_course_id > learning_courses.id
Ref: assignments.lesson_id > lessons.id
Ref: assignment_submissions.assignment_id > assignments.id
// Ref: assignment_submissions.student_id > students.id
Ref: assignment_grades.submission_id > assignment_submissions.id
// Ref: assignment_grades.lecturer_id > employee_profiles.id
Ref: discussion_topics.learning_course_id > learning_courses.id
Ref: discussion_topics.lesson_id > lessons.id
// Ref: discussion_topics.created_by > users.id
Ref: discussion_posts.discussion_topic_id > discussion_topics.id
// Ref: discussion_posts.user_id > users.id
Ref: discussion_posts.parent_post_id > discussion_posts.id
Ref: attendance_sessions.learning_course_id > learning_courses.id
Ref: attendance_sessions.lesson_id > lessons.id
Ref: attendance_records.attendance_session_id > attendance_sessions.id
// Ref: attendance_records.student_id > students.id

