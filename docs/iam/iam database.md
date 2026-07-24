link: https://dbdiagram.io/d/01-IAM-6a5d8a28067336e1deab3db7


Table users {
  id bigint [pk, increment]
  username varchar(100) [not null, unique]
  email varchar(255) [unique]
  phone varchar(20) [unique]
  password varchar(255) [not null]
  account_type varchar(30) [not null]
  employee_id bigint
  student_id bigint
  status varchar(20) [not null]
  is_first_login boolean
  is_email_verified boolean
  is_phone_verified boolean
  is_two_factor_enabled boolean
  last_login_at timestamp
  password_changed_at timestamp
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    username
    email
    phone
    employee_id
    student_id
    status
  }
}


Table user_profiles {
  id bigint [pk, increment]
  user_id bigint [not null]
  avatar varchar(500)
  preferred_language varchar(20)
  timezone varchar(100)
  created_at timestamp
  updated_at timestamp
  Indexes {
    user_id
  }
}


Table password_reset_tokens {
  id bigint [pk, increment]
  user_id bigint [not null]
  token varchar(255) [not null]
  expired_at timestamp
  used_at timestamp
  created_at timestamp
  Indexes {
    user_id
    token
  }
}


Table otp_verifications {
  id bigint [pk, increment]
  user_id bigint [not null]
  otp_code varchar(20) [not null]
  purpose varchar(30) [not null]
  expired_at timestamp
  verified_at timestamp
  status varchar(20)
  created_at timestamp
  Indexes {
    user_id
    status
  }
}


Table roles {
  id bigint [pk, increment]
  code varchar(50) [not null, unique]
  name varchar(255) [not null]
  description text
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    code
    status
  }
}


Table permissions {
  id bigint [pk, increment]
  code varchar(100) [not null, unique]
  name varchar(255) [not null]
  module varchar(100)
  description text
  status varchar(20)
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    code
    module
    status
  }
}


Table role_permissions {
  id bigint [pk, increment]
  role_id bigint [not null]
  permission_id bigint [not null]
  created_at timestamp
  Indexes {
    role_id
    permission_id
  }
}


Table user_roles {
  id bigint [pk, increment]
  user_id bigint [not null]
  role_id bigint [not null]
  start_date date
  end_date date
  created_at timestamp
  Indexes {
    user_id
    role_id
  }
}


Table permission_scopes {
  id bigint [pk, increment]
  role_permission_id bigint [not null]
  faculty_id bigint
  department_id bigint
  division_id bigint
  campus_id bigint
  semester_id bigint
  scope_type varchar(30)
  scope_value varchar(255)
  created_at timestamp
  Indexes {
    role_permission_id
    faculty_id
    department_id
    division_id
    campus_id
    semester_id
  }
}


Table user_permission_overrides {
  id bigint [pk, increment]
  user_id bigint [not null]
  permission_id bigint [not null]
  is_allowed boolean
  start_date date
  end_date date
  created_at timestamp
  Indexes {
    user_id
    permission_id
  }
}


Table login_logs {
  id bigint [pk, increment]
  user_id bigint [not null]
  login_method varchar(30)
  ip_address varchar(100)
  logged_in_at timestamp
  logged_out_at timestamp
  created_at timestamp
  Indexes {
    user_id
    logged_in_at
  }
}


Table audit_logs {
  id bigint [pk, increment]
  user_id bigint
  module varchar(100)
  action varchar(50)
  resource_type varchar(100)
  resource_id bigint
  description text
  old_values text
  new_values text
  ip_address varchar(100)
  user_agent text
  created_at timestamp
  Indexes {
    user_id
    module
    action
    resource_type
    resource_id
    created_at
  }
}


Ref: login_logs.user_id > users.id
Ref: audit_logs.user_id > users.id


Ref: role_permissions.role_id > roles.id
Ref: role_permissions.permission_id > permissions.id


Ref: user_roles.user_id > users.id
Ref: user_roles.role_id > roles.id


Ref: permission_scopes.role_permission_id > role_permissions.id
// Ref: permission_scopes.faculty_id > faculties.id
// Ref: permission_scopes.department_id > departments.id
// Ref: permission_scopes.division_id > divisions.id
// Ref: permission_scopes.campus_id > campuses.id
// Ref: permission_scopes.semester_id > semesters.id


Ref: user_permission_overrides.user_id > users.id
Ref: user_permission_overrides.permission_id > permissions.id


// Ref: users.employee_id > employee_profiles.id
// Ref: users.student_id > students.id


Ref: user_profiles.user_id > users.id
Ref: password_reset_tokens.user_id > users.id
Ref: otp_verifications.user_id > users.id



