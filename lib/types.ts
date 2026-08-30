// Database types matching our schema

export type ClassLevel = 8 | 10 | 12

export type ExaminationStatus = 'draft' | 'published'

export type ResultStatus = 'pass' | 'fail' | 'absent' | 'withheld'

export interface InstituteSettings {
  id: number
  institute_name: string
  logo_url: string | null
  address: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  signature_url: string | null
  created_at: string
  updated_at: string
}

export interface Examination {
  id: string
  name: string
  class_level: ClassLevel
  academic_session: string
  status: ExaminationStatus
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface Student {
  id: string
  roll_number: string
  name: string
  date_of_birth: string // ISO date string YYYY-MM-DD
  class_level: ClassLevel
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  examination_id: string
  subject_name: string
  maximum_marks: number
  passing_marks: number
  display_order: number
}

export interface Result {
  id: string
  student_id: string
  examination_id: string
  total_marks: number
  maximum_total_marks: number
  percentage: number
  grade: string
  result_status: ResultStatus
  created_at: string
  updated_at: string
}

export interface ResultSubject {
  id: string
  result_id: string
  subject_id: string
  marks_obtained: number
  grade: string
  remarks: string | null
}

// Joined types for display
export interface ResultWithDetails extends Result {
  student: Student
  examination: Examination
  result_subjects: (ResultSubject & { subject: Subject })[]
}
