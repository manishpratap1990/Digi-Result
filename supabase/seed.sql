-- ============================================================
-- Seed Data for Digital Result Portal
-- Run AFTER schema.sql
-- ============================================================

-- ============================================================
-- Insert Examinations
-- ============================================================

-- Class 8 (Draft)
insert into examinations (id, name, class_level, academic_session, status)
values 
  ('a1b2c3d4-0001-0000-0000-000000000008', 'Annual Examination', 8, '2025–26', 'draft');

-- Class 10 (Published)
insert into examinations (id, name, class_level, academic_session, status, published_at)
values
  ('a1b2c3d4-0001-0000-0000-000000000010', 'Annual Examination', 10, '2025–26', 'published', now());

-- Class 12 (Published)
insert into examinations (id, name, class_level, academic_session, status, published_at)
values
  ('a1b2c3d4-0001-0000-0000-000000000012', 'Annual Examination', 12, '2025–26', 'published', now());


-- ============================================================
-- Insert Subjects (Class 8)
-- ============================================================
insert into subjects (examination_id, subject_name, maximum_marks, passing_marks, display_order) values
  ('a1b2c3d4-0001-0000-0000-000000000008', 'English',        100, 33, 1),
  ('a1b2c3d4-0001-0000-0000-000000000008', 'Hindi',          100, 33, 2),
  ('a1b2c3d4-0001-0000-0000-000000000008', 'Mathematics',    100, 33, 3),
  ('a1b2c3d4-0001-0000-0000-000000000008', 'Science',        100, 33, 4),
  ('a1b2c3d4-0001-0000-0000-000000000008', 'Social Science', 100, 33, 5);

-- ============================================================
-- Insert Subjects (Class 10)
-- ============================================================
insert into subjects (examination_id, subject_name, maximum_marks, passing_marks, display_order) values
  ('a1b2c3d4-0001-0000-0000-000000000010', 'English',        100, 33, 1),
  ('a1b2c3d4-0001-0000-0000-000000000010', 'Hindi',          100, 33, 2),
  ('a1b2c3d4-0001-0000-0000-000000000010', 'Mathematics',    100, 33, 3),
  ('a1b2c3d4-0001-0000-0000-000000000010', 'Science',        100, 33, 4),
  ('a1b2c3d4-0001-0000-0000-000000000010', 'Social Science', 100, 33, 5);

-- ============================================================
-- Insert Subjects (Class 12)
-- ============================================================
insert into subjects (examination_id, subject_name, maximum_marks, passing_marks, display_order) values
  ('a1b2c3d4-0001-0000-0000-000000000012', 'English',     100, 33, 1),
  ('a1b2c3d4-0001-0000-0000-000000000012', 'Physics',     100, 33, 2),
  ('a1b2c3d4-0001-0000-0000-000000000012', 'Chemistry',   100, 33, 3),
  ('a1b2c3d4-0001-0000-0000-000000000012', 'Mathematics', 100, 33, 4),
  ('a1b2c3d4-0001-0000-0000-000000000012', 'Biology',     100, 33, 5);

-- ============================================================
-- Insert Students
-- ============================================================

-- Class 10 students
insert into students (id, roll_number, name, date_of_birth, class_level) values
  ('s1000000-0001-0000-0000-000000000001', 'CL10-001', 'Aarav Sharma',  '2009-03-15', 10),
  ('s1000000-0001-0000-0000-000000000002', 'CL10-002', 'Ananya Singh',  '2009-07-22', 10),
  ('s1000000-0001-0000-0000-000000000003', 'CL10-003', 'Rohan Verma',   '2009-11-05', 10),
  ('s1000000-0001-0000-0000-000000000004', 'CL10-004', 'Priya Gupta',   '2010-01-30', 10),
  ('s1000000-0001-0000-0000-000000000005', 'CL10-005', 'Kabir Khan',    '2009-09-18', 10);

-- Class 12 students
insert into students (id, roll_number, name, date_of_birth, class_level) values
  ('s1200000-0001-0000-0000-000000000001', 'CL12-001', 'Meera Joshi',       '2007-04-12', 12),
  ('s1200000-0001-0000-0000-000000000002', 'CL12-002', 'Arjun Nair',        '2007-06-25', 12),
  ('s1200000-0001-0000-0000-000000000003', 'CL12-003', 'Sneha Pillai',      '2007-02-08', 12),
  ('s1200000-0001-0000-0000-000000000004', 'CL12-004', 'Vikram Choudhary',  '2007-12-14', 12),
  ('s1200000-0001-0000-0000-000000000005', 'CL12-005', 'Divya Menon',       '2007-08-31', 12);

-- Class 8 students  
insert into students (id, roll_number, name, date_of_birth, class_level) values
  ('s0800000-0001-0000-0000-000000000001', 'CL8-001', 'Rahul Tiwari',     '2012-03-15', 8),
  ('s0800000-0001-0000-0000-000000000002', 'CL8-002', 'Sakshi Mishra',    '2012-07-20', 8),
  ('s0800000-0001-0000-0000-000000000003', 'CL8-003', 'Aditya Saxena',    '2011-11-10', 8),
  ('s0800000-0001-0000-0000-000000000004', 'CL8-004', 'Pooja Yadav',      '2012-05-05', 8),
  ('s0800000-0001-0000-0000-000000000005', 'CL8-005', 'Harsh Srivastava', '2012-01-22', 8);

-- ============================================================
-- Insert Results & Result Subjects (Class 10 — Published)
-- ============================================================

-- Helper: get subject IDs for class 10 exam
-- Aarav Sharma — PASS (high scorer)
insert into results (id, student_id, examination_id, total_marks, maximum_total_marks, percentage, grade, result_status)
values ('r1000001-0001-0000-0000-000000000001', 's1000000-0001-0000-0000-000000000001', 'a1b2c3d4-0001-0000-0000-000000000010', 424, 500, 84.80, 'A', 'pass');

-- Ananya Singh — PASS
insert into results (id, student_id, examination_id, total_marks, maximum_total_marks, percentage, grade, result_status)
values ('r1000001-0001-0000-0000-000000000002', 's1000000-0001-0000-0000-000000000002', 'a1b2c3d4-0001-0000-0000-000000000010', 461, 500, 92.20, 'A+', 'pass');

-- Rohan Verma — FAIL (below passing in 2 subjects)
insert into results (id, student_id, examination_id, total_marks, maximum_total_marks, percentage, grade, result_status)
values ('r1000001-0001-0000-0000-000000000003', 's1000000-0001-0000-0000-000000000003', 'a1b2c3d4-0001-0000-0000-000000000010', 156, 500, 31.20, 'F', 'fail');

-- Priya Gupta — PASS
insert into results (id, student_id, examination_id, total_marks, maximum_total_marks, percentage, grade, result_status)
values ('r1000001-0001-0000-0000-000000000004', 's1000000-0001-0000-0000-000000000004', 'a1b2c3d4-0001-0000-0000-000000000010', 392, 500, 78.40, 'B+', 'pass');

-- Kabir Khan — PASS
insert into results (id, student_id, examination_id, total_marks, maximum_total_marks, percentage, grade, result_status)
values ('r1000001-0001-0000-0000-000000000005', 's1000000-0001-0000-0000-000000000005', 'a1b2c3d4-0001-0000-0000-000000000010', 335, 500, 67.00, 'B', 'pass');

-- Subject results for Aarav (result r1000001-0001-0000-0000-000000000001)
-- We use a subquery approach but for seed we'll do it via WITH
with s10 as (
  select id, subject_name from subjects where examination_id = 'a1b2c3d4-0001-0000-0000-000000000010'
)
insert into result_subjects (result_id, subject_id, marks_obtained, grade)
select 'r1000001-0001-0000-0000-000000000001', id,
  case subject_name
    when 'English'        then 82
    when 'Hindi'          then 88
    when 'Mathematics'    then 91
    when 'Science'        then 78
    when 'Social Science' then 85
  end,
  case subject_name
    when 'English'        then 'A'
    when 'Hindi'          then 'A'
    when 'Mathematics'    then 'A+'
    when 'Science'        then 'B+'
    when 'Social Science' then 'A'
  end
from s10;

-- Subject results for Ananya (r1000001-0001-0000-0000-000000000002)
with s10 as (
  select id, subject_name from subjects where examination_id = 'a1b2c3d4-0001-0000-0000-000000000010'
)
insert into result_subjects (result_id, subject_id, marks_obtained, grade)
select 'r1000001-0001-0000-0000-000000000002', id,
  case subject_name
    when 'English'        then 95
    when 'Hindi'          then 90
    when 'Mathematics'    then 98
    when 'Science'        then 88
    when 'Social Science' then 90
  end,
  case subject_name
    when 'English'        then 'A+'
    when 'Hindi'          then 'A+'
    when 'Mathematics'    then 'A+'
    when 'Science'        then 'A'
    when 'Social Science' then 'A+'
  end
from s10;

-- Subject results for Rohan — FAIL
with s10 as (
  select id, subject_name from subjects where examination_id = 'a1b2c3d4-0001-0000-0000-000000000010'
)
insert into result_subjects (result_id, subject_id, marks_obtained, grade)
select 'r1000001-0001-0000-0000-000000000003', id,
  case subject_name
    when 'English'        then 28
    when 'Hindi'          then 35
    when 'Mathematics'    then 22
    when 'Science'        then 41
    when 'Social Science' then 30
  end,
  case subject_name
    when 'English'        then 'F'
    when 'Hindi'          then 'D'
    when 'Mathematics'    then 'F'
    when 'Science'        then 'C'
    when 'Social Science' then 'F'
  end
from s10;

-- Subject results for Priya
with s10 as (
  select id, subject_name from subjects where examination_id = 'a1b2c3d4-0001-0000-0000-000000000010'
)
insert into result_subjects (result_id, subject_id, marks_obtained, grade)
select 'r1000001-0001-0000-0000-000000000004', id,
  case subject_name
    when 'English'        then 79
    when 'Hindi'          then 82
    when 'Mathematics'    then 74
    when 'Science'        then 77
    when 'Social Science' then 80
  end,
  case subject_name
    when 'English'        then 'B+'
    when 'Hindi'          then 'A'
    when 'Mathematics'    then 'B+'
    when 'Science'        then 'B+'
    when 'Social Science' then 'A'
  end
from s10;

-- Subject results for Kabir
with s10 as (
  select id, subject_name from subjects where examination_id = 'a1b2c3d4-0001-0000-0000-000000000010'
)
insert into result_subjects (result_id, subject_id, marks_obtained, grade)
select 'r1000001-0001-0000-0000-000000000005', id,
  case subject_name
    when 'English'        then 68
    when 'Hindi'          then 72
    when 'Mathematics'    then 60
    when 'Science'        then 65
    when 'Social Science' then 70
  end,
  case subject_name
    when 'English'        then 'B'
    when 'Hindi'          then 'B+'
    when 'Mathematics'    then 'B'
    when 'Science'        then 'B'
    when 'Social Science' then 'B+'
  end
from s10;

-- ============================================================
-- Class 12 Results (Published) — 5 students
-- ============================================================
insert into results (id, student_id, examination_id, total_marks, maximum_total_marks, percentage, grade, result_status) values
  ('r1200001-0001-0000-0000-000000000001', 's1200000-0001-0000-0000-000000000001', 'a1b2c3d4-0001-0000-0000-000000000012', 445, 500, 89.00, 'A', 'pass'),
  ('r1200001-0001-0000-0000-000000000002', 's1200000-0001-0000-0000-000000000002', 'a1b2c3d4-0001-0000-0000-000000000012', 476, 500, 95.20, 'A+', 'pass'),
  ('r1200001-0001-0000-0000-000000000003', 's1200000-0001-0000-0000-000000000003', 'a1b2c3d4-0001-0000-0000-000000000012', 152, 500, 30.40, 'F', 'fail'),
  ('r1200001-0001-0000-0000-000000000004', 's1200000-0001-0000-0000-000000000004', 'a1b2c3d4-0001-0000-0000-000000000012', 385, 500, 77.00, 'B+', 'pass'),
  ('r1200001-0001-0000-0000-000000000005', 's1200000-0001-0000-0000-000000000005', 'a1b2c3d4-0001-0000-0000-000000000012', 410, 500, 82.00, 'A', 'pass');

-- Subject results for Meera (Class 12 PASS)
with s12 as (select id, subject_name from subjects where examination_id = 'a1b2c3d4-0001-0000-0000-000000000012')
insert into result_subjects (result_id, subject_id, marks_obtained, grade)
select 'r1200001-0001-0000-0000-000000000001', id,
  case subject_name when 'English' then 88 when 'Physics' then 84 when 'Chemistry' then 90 when 'Mathematics' then 92 when 'Biology' then 91 end,
  case subject_name when 'English' then 'A' when 'Physics' then 'A' when 'Chemistry' then 'A+' when 'Mathematics' then 'A+' when 'Biology' then 'A+' end
from s12;

-- Arjun (Class 12 PASS — top scorer)
with s12 as (select id, subject_name from subjects where examination_id = 'a1b2c3d4-0001-0000-0000-000000000012')
insert into result_subjects (result_id, subject_id, marks_obtained, grade)
select 'r1200001-0001-0000-0000-000000000002', id,
  case subject_name when 'English' then 94 when 'Physics' then 97 when 'Chemistry' then 95 when 'Mathematics' then 99 when 'Biology' then 91 end,
  case subject_name when 'English' then 'A+' when 'Physics' then 'A+' when 'Chemistry' then 'A+' when 'Mathematics' then 'A+' when 'Biology' then 'A+' end
from s12;

-- Sneha (FAIL)
with s12 as (select id, subject_name from subjects where examination_id = 'a1b2c3d4-0001-0000-0000-000000000012')
insert into result_subjects (result_id, subject_id, marks_obtained, grade)
select 'r1200001-0001-0000-0000-000000000003', id,
  case subject_name when 'English' then 30 when 'Physics' then 25 when 'Chemistry' then 32 when 'Mathematics' then 28 when 'Biology' then 37 end,
  case subject_name when 'English' then 'F' when 'Physics' then 'F' when 'Chemistry' then 'F' when 'Mathematics' then 'F' when 'Biology' then 'D' end
from s12;

-- Vikram
with s12 as (select id, subject_name from subjects where examination_id = 'a1b2c3d4-0001-0000-0000-000000000012')
insert into result_subjects (result_id, subject_id, marks_obtained, grade)
select 'r1200001-0001-0000-0000-000000000004', id,
  case subject_name when 'English' then 72 when 'Physics' then 78 when 'Chemistry' then 76 when 'Mathematics' then 80 when 'Biology' then 79 end,
  case subject_name when 'English' then 'B+' when 'Physics' then 'B+' when 'Chemistry' then 'B+' when 'Mathematics' then 'A' when 'Biology' then 'B+' end
from s12;

-- Divya
with s12 as (select id, subject_name from subjects where examination_id = 'a1b2c3d4-0001-0000-0000-000000000012')
insert into result_subjects (result_id, subject_id, marks_obtained, grade)
select 'r1200001-0001-0000-0000-000000000005', id,
  case subject_name when 'English' then 80 when 'Physics' then 82 when 'Chemistry' then 85 when 'Mathematics' then 83 when 'Biology' then 80 end,
  case subject_name when 'English' then 'A' when 'Physics' then 'A' when 'Chemistry' then 'A' when 'Mathematics' then 'A' when 'Biology' then 'A' end
from s12;
