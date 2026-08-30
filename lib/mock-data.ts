// ============================================================
// DEMO MODE — Mock data for testing without Supabase
// Activated automatically when Supabase env vars are not set
// ============================================================

export const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'

export const DEMO_ADMIN = {
  id: 'admin',
  password: 'admin123',
}

export interface MockSubject {
  subjectName: string
  maximumMarks: number
  passingMarks: number
  marksObtained: number
  grade: string
}

export interface MockResult {
  studentName: string
  rollNumber: string
  dateOfBirth: string   // YYYY-MM-DD
  classLevel: number
  examName: string
  academicSession: string
  totalMarks: number
  maximumMarks: number
  percentage: number
  grade: string
  resultStatus: 'pass' | 'fail'
  publishedAt: string
  subjects: MockSubject[]
}

export const MOCK_RESULTS: MockResult[] = [
  // ─── CLASS 10 ────────────────────────────────────────────
  {
    studentName: 'Aarav Sharma',
    rollNumber: 'CL10-001',
    dateOfBirth: '2009-03-15',
    classLevel: 10,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 424,
    maximumMarks: 500,
    percentage: 84.80,
    grade: 'A',
    resultStatus: 'pass',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',        maximumMarks: 100, passingMarks: 33, marksObtained: 82, grade: 'A'  },
      { subjectName: 'Hindi',          maximumMarks: 100, passingMarks: 33, marksObtained: 88, grade: 'A'  },
      { subjectName: 'Mathematics',    maximumMarks: 100, passingMarks: 33, marksObtained: 91, grade: 'A+' },
      { subjectName: 'Science',        maximumMarks: 100, passingMarks: 33, marksObtained: 78, grade: 'B+' },
      { subjectName: 'Social Science', maximumMarks: 100, passingMarks: 33, marksObtained: 85, grade: 'A'  },
    ],
  },
  {
    studentName: 'Ananya Singh',
    rollNumber: 'CL10-002',
    dateOfBirth: '2009-07-22',
    classLevel: 10,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 461,
    maximumMarks: 500,
    percentage: 92.20,
    grade: 'A+',
    resultStatus: 'pass',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',        maximumMarks: 100, passingMarks: 33, marksObtained: 95, grade: 'A+' },
      { subjectName: 'Hindi',          maximumMarks: 100, passingMarks: 33, marksObtained: 90, grade: 'A+' },
      { subjectName: 'Mathematics',    maximumMarks: 100, passingMarks: 33, marksObtained: 98, grade: 'A+' },
      { subjectName: 'Science',        maximumMarks: 100, passingMarks: 33, marksObtained: 88, grade: 'A'  },
      { subjectName: 'Social Science', maximumMarks: 100, passingMarks: 33, marksObtained: 90, grade: 'A+' },
    ],
  },
  {
    studentName: 'Rohan Verma',
    rollNumber: 'CL10-003',
    dateOfBirth: '2009-11-05',
    classLevel: 10,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 156,
    maximumMarks: 500,
    percentage: 31.20,
    grade: 'F',
    resultStatus: 'fail',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',        maximumMarks: 100, passingMarks: 33, marksObtained: 28, grade: 'F' },
      { subjectName: 'Hindi',          maximumMarks: 100, passingMarks: 33, marksObtained: 35, grade: 'D' },
      { subjectName: 'Mathematics',    maximumMarks: 100, passingMarks: 33, marksObtained: 22, grade: 'F' },
      { subjectName: 'Science',        maximumMarks: 100, passingMarks: 33, marksObtained: 41, grade: 'C' },
      { subjectName: 'Social Science', maximumMarks: 100, passingMarks: 33, marksObtained: 30, grade: 'F' },
    ],
  },
  {
    studentName: 'Priya Gupta',
    rollNumber: 'CL10-004',
    dateOfBirth: '2010-01-30',
    classLevel: 10,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 392,
    maximumMarks: 500,
    percentage: 78.40,
    grade: 'B+',
    resultStatus: 'pass',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',        maximumMarks: 100, passingMarks: 33, marksObtained: 79, grade: 'B+' },
      { subjectName: 'Hindi',          maximumMarks: 100, passingMarks: 33, marksObtained: 82, grade: 'A'  },
      { subjectName: 'Mathematics',    maximumMarks: 100, passingMarks: 33, marksObtained: 74, grade: 'B+' },
      { subjectName: 'Science',        maximumMarks: 100, passingMarks: 33, marksObtained: 77, grade: 'B+' },
      { subjectName: 'Social Science', maximumMarks: 100, passingMarks: 33, marksObtained: 80, grade: 'A'  },
    ],
  },
  {
    studentName: 'Kabir Khan',
    rollNumber: 'CL10-005',
    dateOfBirth: '2009-09-18',
    classLevel: 10,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 335,
    maximumMarks: 500,
    percentage: 67.00,
    grade: 'B',
    resultStatus: 'pass',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',        maximumMarks: 100, passingMarks: 33, marksObtained: 68, grade: 'B'  },
      { subjectName: 'Hindi',          maximumMarks: 100, passingMarks: 33, marksObtained: 72, grade: 'B+' },
      { subjectName: 'Mathematics',    maximumMarks: 100, passingMarks: 33, marksObtained: 60, grade: 'B'  },
      { subjectName: 'Science',        maximumMarks: 100, passingMarks: 33, marksObtained: 65, grade: 'B'  },
      { subjectName: 'Social Science', maximumMarks: 100, passingMarks: 33, marksObtained: 70, grade: 'B+' },
    ],
  },

  // ─── CLASS 12 ────────────────────────────────────────────
  {
    studentName: 'Meera Joshi',
    rollNumber: 'CL12-001',
    dateOfBirth: '2007-04-12',
    classLevel: 12,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 445,
    maximumMarks: 500,
    percentage: 89.00,
    grade: 'A',
    resultStatus: 'pass',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',   maximumMarks: 100, passingMarks: 33, marksObtained: 88, grade: 'A'  },
      { subjectName: 'Physics',   maximumMarks: 100, passingMarks: 33, marksObtained: 84, grade: 'A'  },
      { subjectName: 'Chemistry', maximumMarks: 100, passingMarks: 33, marksObtained: 90, grade: 'A+' },
      { subjectName: 'Mathematics', maximumMarks: 100, passingMarks: 33, marksObtained: 92, grade: 'A+' },
      { subjectName: 'Biology',   maximumMarks: 100, passingMarks: 33, marksObtained: 91, grade: 'A+' },
    ],
  },
  {
    studentName: 'Arjun Nair',
    rollNumber: 'CL12-002',
    dateOfBirth: '2007-06-25',
    classLevel: 12,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 476,
    maximumMarks: 500,
    percentage: 95.20,
    grade: 'A+',
    resultStatus: 'pass',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',   maximumMarks: 100, passingMarks: 33, marksObtained: 94, grade: 'A+' },
      { subjectName: 'Physics',   maximumMarks: 100, passingMarks: 33, marksObtained: 97, grade: 'A+' },
      { subjectName: 'Chemistry', maximumMarks: 100, passingMarks: 33, marksObtained: 95, grade: 'A+' },
      { subjectName: 'Mathematics', maximumMarks: 100, passingMarks: 33, marksObtained: 99, grade: 'A+' },
      { subjectName: 'Biology',   maximumMarks: 100, passingMarks: 33, marksObtained: 91, grade: 'A+' },
    ],
  },
  {
    studentName: 'Sneha Pillai',
    rollNumber: 'CL12-003',
    dateOfBirth: '2007-02-08',
    classLevel: 12,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 152,
    maximumMarks: 500,
    percentage: 30.40,
    grade: 'F',
    resultStatus: 'fail',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',   maximumMarks: 100, passingMarks: 33, marksObtained: 30, grade: 'F' },
      { subjectName: 'Physics',   maximumMarks: 100, passingMarks: 33, marksObtained: 25, grade: 'F' },
      { subjectName: 'Chemistry', maximumMarks: 100, passingMarks: 33, marksObtained: 32, grade: 'F' },
      { subjectName: 'Mathematics', maximumMarks: 100, passingMarks: 33, marksObtained: 28, grade: 'F' },
      { subjectName: 'Biology',   maximumMarks: 100, passingMarks: 33, marksObtained: 37, grade: 'D' },
    ],
  },
  {
    studentName: 'Divya Menon',
    rollNumber: 'CL12-004',
    dateOfBirth: '2007-08-31',
    classLevel: 12,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 410,
    maximumMarks: 500,
    percentage: 82.00,
    grade: 'A',
    resultStatus: 'pass',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',   maximumMarks: 100, passingMarks: 33, marksObtained: 80, grade: 'A'  },
      { subjectName: 'Physics',   maximumMarks: 100, passingMarks: 33, marksObtained: 82, grade: 'A'  },
      { subjectName: 'Chemistry', maximumMarks: 100, passingMarks: 33, marksObtained: 85, grade: 'A'  },
      { subjectName: 'Mathematics', maximumMarks: 100, passingMarks: 33, marksObtained: 83, grade: 'A' },
      { subjectName: 'Biology',   maximumMarks: 100, passingMarks: 33, marksObtained: 80, grade: 'A'  },
    ],
  },

  // ─── CLASS 8 ─────────────────────────────────────────────
  {
    studentName: 'Rahul Tiwari',
    rollNumber: 'CL8-001',
    dateOfBirth: '2012-03-15',
    classLevel: 8,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 390,
    maximumMarks: 500,
    percentage: 78.00,
    grade: 'B+',
    resultStatus: 'pass',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',        maximumMarks: 100, passingMarks: 33, marksObtained: 76, grade: 'B+' },
      { subjectName: 'Hindi',          maximumMarks: 100, passingMarks: 33, marksObtained: 82, grade: 'A'  },
      { subjectName: 'Mathematics',    maximumMarks: 100, passingMarks: 33, marksObtained: 79, grade: 'B+' },
      { subjectName: 'Science',        maximumMarks: 100, passingMarks: 33, marksObtained: 73, grade: 'B+' },
      { subjectName: 'Social Science', maximumMarks: 100, passingMarks: 33, marksObtained: 80, grade: 'A'  },
    ],
  },
  {
    studentName: 'Sakshi Mishra',
    rollNumber: 'CL8-002',
    dateOfBirth: '2012-07-20',
    classLevel: 8,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 455,
    maximumMarks: 500,
    percentage: 91.00,
    grade: 'A+',
    resultStatus: 'pass',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',        maximumMarks: 100, passingMarks: 33, marksObtained: 92, grade: 'A+' },
      { subjectName: 'Hindi',          maximumMarks: 100, passingMarks: 33, marksObtained: 90, grade: 'A+' },
      { subjectName: 'Mathematics',    maximumMarks: 100, passingMarks: 33, marksObtained: 95, grade: 'A+' },
      { subjectName: 'Science',        maximumMarks: 100, passingMarks: 33, marksObtained: 88, grade: 'A'  },
      { subjectName: 'Social Science', maximumMarks: 100, passingMarks: 33, marksObtained: 90, grade: 'A+' },
    ],
  },
  {
    studentName: 'Aditya Saxena',
    rollNumber: 'CL8-003',
    dateOfBirth: '2011-11-10',
    classLevel: 8,
    examName: 'Annual Examination',
    academicSession: '2025–26',
    totalMarks: 164,
    maximumMarks: 500,
    percentage: 32.80,
    grade: 'F',
    resultStatus: 'fail',
    publishedAt: '2026-08-01T00:00:00Z',
    subjects: [
      { subjectName: 'English',        maximumMarks: 100, passingMarks: 33, marksObtained: 30, grade: 'F' },
      { subjectName: 'Hindi',          maximumMarks: 100, passingMarks: 33, marksObtained: 40, grade: 'C' },
      { subjectName: 'Mathematics',    maximumMarks: 100, passingMarks: 33, marksObtained: 25, grade: 'F' },
      { subjectName: 'Science',        maximumMarks: 100, passingMarks: 33, marksObtained: 38, grade: 'D' },
      { subjectName: 'Social Science', maximumMarks: 100, passingMarks: 33, marksObtained: 31, grade: 'F' },
    ],
  },
]

export function lookupMockResult(rollNumber: string, dateOfBirth: string): MockResult | null {
  const normalized = rollNumber.trim().toUpperCase()
  return MOCK_RESULTS.find(
    r => r.rollNumber.toUpperCase() === normalized && r.dateOfBirth === dateOfBirth
  ) ?? null
}
