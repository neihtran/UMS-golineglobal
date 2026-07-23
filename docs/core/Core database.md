link: https://dbdiagram.io/d/core-6a55a96536d348d120d75435


// 00. core
Table organizations {
  id bigint [pk, increment]
  code varchar(50) [unique, not null]
  name varchar(255) [not null]
  short_name varchar(100)
  description text
  phone varchar(20)
  email varchar(255)
  website varchar(255)
  logo varchar(255)
  is_active boolean
  created_at timestamp
  updated_at timestamp
}


Table campuses {
  id bigint [pk, increment]
  organization_id bigint [not null]
  code varchar(50) [not null]
  name varchar(255) [not null]
  phone varchar(20)
  email varchar(255)
  address text
  latitude decimal(10,7)
  longitude decimal(10,7)
  is_active boolean
  created_at timestamp
  updated_at timestamp
}


Table faculties {
  id bigint [pk, increment]
  campus_id bigint [not null]
  code varchar(50) [not null]
  name varchar(255) [not null]
  description text
  established_date date
  is_active boolean
  created_at timestamp
  updated_at timestamp
}


Table departments {
  id bigint [pk, increment]
  faculty_id bigint [not null]
  code varchar(50)
  name varchar(255)
  description text
  established_date date
  is_active boolean
  created_at timestamp
  updated_at timestamp
}


Table divisions {
  id bigint [pk, increment]
  campus_id bigint [not null]
  code varchar(50)
  name varchar(255)
  description text
  is_active boolean
  created_at timestamp
  updated_at timestamp
}


Table buildings {
  id bigint [pk, increment]
  campus_id bigint [not null]
  code varchar(50)
  name varchar(255)
  address text
  total_floor int
  is_active boolean
  created_at timestamp
  updated_at timestamp
}


Table floors {
  id bigint [pk, increment]
  building_id bigint [not null]
  floor_number int
  name varchar(100)
  created_at timestamp
  updated_at timestamp
}


Table room_types {
  id bigint [pk, increment]
  code varchar(50)
  name varchar(255)
  description text
  created_at timestamp
  updated_at timestamp
}


Table rooms {
  id bigint [pk, increment]
  floor_id bigint [not null]
  room_type_id bigint [not null]
  code varchar(50)
  name varchar(255)
  capacity int
  area decimal(8,2)
  description text
  is_active boolean
  created_at timestamp
  updated_at timestamp
}


Table academic_years {
  id bigint [pk, increment]
  code varchar(20)
  name varchar(100)
  start_date date
  end_date date
  is_current boolean
  created_at timestamp
  updated_at timestamp
}


Table semesters {
  id bigint [pk, increment]
  academic_year_id bigint [not null]
  code varchar(20)
  name varchar(100)
  semester_no int
  start_date date
  end_date date
  registration_start date
  registration_end date
  created_at timestamp
  updated_at timestamp
}


Table master_groups {
  id bigint [pk, increment]
  code varchar(50) [not null, unique]
  name varchar(255) [not null]
  description text
  sort_order int [default: 0]
  is_active boolean [default: true]
  created_at timestamp
  updated_at timestamp
}


Table master_values {
  id bigint [pk, increment]
  group_id bigint [not null]
  code varchar(50) [not null]
  name varchar(255) [not null]
  description text
  sort_order int [default: 0]
  is_default boolean [default: false]
  is_active boolean [default: true]
  created_at timestamp
  updated_at timestamp
}


Table countries {
  id bigint [pk, increment]
  name varchar(255)
  name_en varchar(255)
  created_at timestamp
  updated_at timestamp
}


Table provinces {
  id bigint [pk, increment]
  country_id bigint [not null]
  name varchar(255)
  name_en varchar(255)
  created_at timestamp
  updated_at timestamp
}


Table districts {
  id bigint [pk, increment]
  province_id bigint [not null]
  name varchar(255)
  name_en varchar(255)
  created_at timestamp
  updated_at timestamp
}


Table wards {
  id bigint [pk, increment]
  district_id bigint [not null]
  name varchar(255)
  name_en varchar(255)
  created_at timestamp
  updated_at timestamp
}


Ref: campuses.organization_id > organizations.id
Ref: faculties.campus_id > campuses.id
Ref: departments.faculty_id > faculties.id
Ref: divisions.campus_id > campuses.id
Ref: buildings.campus_id > campuses.id
Ref: floors.building_id > buildings.id
Ref: rooms.floor_id > floors.id
Ref: rooms.room_type_id > room_types.id
Ref: semesters.academic_year_id > academic_years.id
Ref: master_values.group_id > master_groups.id
Ref: provinces.country_id > countries.id
Ref: districts.province_id > provinces.id
Ref: wards.district_id > districts.id






