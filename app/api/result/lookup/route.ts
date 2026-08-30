import { NextRequest, NextResponse } from 'next/server'
import { DEMO_MODE, lookupMockResult } from '@/lib/mock-data'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
}

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const windowMs = 60_000
  const limit = 20 // higher limit in demo mode
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(getIP(req))) {
      return NextResponse.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 })
    }

    const body = await req.json()
    const { rollNumber, dateOfBirth } = body

    if (!rollNumber?.trim()) return NextResponse.json({ error: 'Roll number is required.' }, { status: 400 })
    if (!dateOfBirth) return NextResponse.json({ error: 'Date of birth is required.' }, { status: 400 })
    if (isNaN(new Date(dateOfBirth).getTime())) return NextResponse.json({ error: 'Invalid date of birth.' }, { status: 400 })

    // ── DEMO MODE: use mock data ──────────────────────────
    if (DEMO_MODE) {
      const result = lookupMockResult(rollNumber, dateOfBirth)
      if (!result) return NextResponse.json({ found: false }, { status: 200 })
      return NextResponse.json({ found: true, result })
    }

    // ── PRODUCTION MODE: use Supabase ─────────────────────
    const { createAdminClient } = await import('@/lib/supabase/server')
    const { normalizeRollNumber } = await import('@/lib/utils')
    const supabase = await createAdminClient()
    const normalizedRoll = normalizeRollNumber(rollNumber)

    const { data, error } = await supabase.rpc('lookup_student_result', {
      p_roll_number: normalizedRoll,
      p_dob: dateOfBirth,
    })

    if (error) {
      console.error('Lookup error:', error)
      return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
    }

    if (!data || data.length === 0) return NextResponse.json({ found: false }, { status: 200 })

    const result = data[0]
    const { data: subjectData } = await supabase
      .from('result_subjects')
      .select('marks_obtained, grade, remarks, subject:subjects(subject_name, maximum_marks, passing_marks, display_order)')
      .eq('result_id', result.result_id)
      .order('subject(display_order)')

    return NextResponse.json({
      found: true,
      result: {
        studentName: result.student_name,
        rollNumber: result.student_roll,
        dateOfBirth: result.student_dob,
        classLevel: result.student_class,
        examName: result.exam_name,
        academicSession: result.exam_session,
        totalMarks: result.total_marks,
        maximumMarks: result.max_marks,
        percentage: result.percentage,
        grade: result.grade,
        resultStatus: result.result_status,
        publishedAt: result.published_at,
        subjects: (subjectData || []).map((rs: any) => ({
          subjectName: rs.subject.subject_name,
          maximumMarks: rs.subject.maximum_marks,
          passingMarks: rs.subject.passing_marks,
          marksObtained: rs.marks_obtained,
          grade: rs.grade,
          remarks: rs.remarks,
        })),
      },
    })
  } catch (err) {
    console.error('Unhandled error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
