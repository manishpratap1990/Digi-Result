-- ============================================================
-- Digital Result Portal - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: institute_settings
-- ============================================================
create table if not exists institute_settings (
  id bigint primary key generated always as identity,
  institute_name text not null default 'Vidya Niketan School',
  logo_url text,
  address text,
  contact_email text,
  contact_phone text,
  website text,
  signature_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Insert default institute settings
insert into institute_settings (institute_name, address, contact_email)
values ('Vidya Niketan School', '123, Education Road, New Delhi - 110001', 'info@vidyaniketan.edu.in')
on conflict do nothing;

-- ============================================================
-- TABLE: examinations
-- ============================================================
create table if not exists examinations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  class_level integer not null check (class_level in (8, 10, 12)),
  academic_session text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

create index if not exists idx_examinations_class on examinations(class_level);
create index if not exists idx_examinations_status on examinations(status);

-- ============================================================
-- TABLE: subjects
-- ============================================================
create table if not exists subjects (
  id uuid primary key default uuid_generate_v4(),
  examination_id uuid not null references examinations(id) on delete cascade,
  subject_name text not null,
  maximum_marks integer not null default 100,
  passing_marks integer not null default 33,
  display_order integer not null default 0
);

create index if not exists idx_subjects_examination on subjects(examination_id);

-- ============================================================
-- TABLE: students
-- ============================================================
create table if not exists students (
  id uuid primary key default uuid_generate_v4(),
  roll_number text not null,
  name text not null,
  date_of_birth date not null,
  class_level integer not null check (class_level in (8, 10, 12)),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(roll_number, class_level)
);

create index if not exists idx_students_roll on students(roll_number);
create index if not exists idx_students_dob on students(date_of_birth);

-- ============================================================
-- TABLE: results
-- ============================================================
create table if not exists results (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  examination_id uuid not null references examinations(id) on delete cascade,
  total_marks integer not null default 0,
  maximum_total_marks integer not null default 0,
  percentage numeric(5,2) not null default 0,
  grade text not null default 'F',
  result_status text not null default 'pass' check (result_status in ('pass', 'fail', 'absent', 'withheld')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(student_id, examination_id)
);

create index if not exists idx_results_student on results(student_id);
create index if not exists idx_results_examination on results(examination_id);
create index if not exists idx_results_status on results(result_status);

-- ============================================================
-- TABLE: result_subjects
-- ============================================================
create table if not exists result_subjects (
  id uuid primary key default uuid_generate_v4(),
  result_id uuid not null references results(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  marks_obtained integer not null default 0,
  grade text not null default 'F',
  remarks text,
  unique(result_id, subject_id)
);

create index if not exists idx_result_subjects_result on result_subjects(result_id);

-- ============================================================
-- FUNCTION: lookup_student_result
-- Rate-limitable, called from server action
-- Returns result only if roll_number AND dob BOTH match
-- ============================================================
create or replace function lookup_student_result(
  p_roll_number text,
  p_dob date,
  p_class_level integer default null
)
returns table (
  result_id uuid,
  student_name text,
  student_roll text,
  student_dob date,
  student_class integer,
  exam_name text,
  exam_session text,
  exam_id uuid,
  total_marks integer,
  max_marks integer,
  percentage numeric,
  grade text,
  result_status text,
  published_at timestamptz
) language sql security definer as $$
  select
    r.id as result_id,
    s.name as student_name,
    s.roll_number as student_roll,
    s.date_of_birth as student_dob,
    s.class_level as student_class,
    e.name as exam_name,
    e.academic_session as exam_session,
    e.id as exam_id,
    r.total_marks,
    r.maximum_total_marks as max_marks,
    r.percentage,
    r.grade,
    r.result_status,
    e.published_at
  from students s
  join results r on r.student_id = s.id
  join examinations e on r.examination_id = e.id
  where 
    upper(trim(s.roll_number)) = upper(trim(p_roll_number))
    and s.date_of_birth = p_dob
    and e.status = 'published'
    and (p_class_level is null or s.class_level = p_class_level)
  order by e.published_at desc
  limit 1;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table institute_settings enable row level security;
alter table examinations enable row level security;
alter table students enable row level security;
alter table subjects enable row level security;
alter table results enable row level security;
alter table result_subjects enable row level security;

-- Public can read institute_settings (for display)
create policy "Public read institute_settings"
  on institute_settings for select using (true);

-- Public can read published examinations
create policy "Public read published examinations"
  on examinations for select using (status = 'published');

-- Authenticated (admin) can do everything on all tables
create policy "Admin full access institute_settings"
  on institute_settings for all using (auth.role() = 'authenticated');

create policy "Admin full access examinations"
  on examinations for all using (auth.role() = 'authenticated');

create policy "Admin full access students"
  on students for all using (auth.role() = 'authenticated');

create policy "Admin full access subjects"
  on subjects for all using (auth.role() = 'authenticated');

create policy "Admin full access results"
  on results for all using (auth.role() = 'authenticated');

create policy "Admin full access result_subjects"
  on result_subjects for all using (auth.role() = 'authenticated');

-- Note: student result lookup goes through the lookup_student_result() 
-- function (security definer) which bypasses RLS safely
