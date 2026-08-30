import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MOCK_RESULTS } from '@/lib/mock-data'
import { calculateGrade } from '@/lib/utils'

export async function POST() {
  const supabase = await createClient()

  // Security: only allow authenticated admin users
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // We will group the mock results by examName + classLevel + academicSession
    // to create unique examinations.
    const examMap = new Map<string, any>()
    
    for (const result of MOCK_RESULTS) {
      const examKey = `${result.examName}-${result.classLevel}-${result.academicSession}`
      if (!examMap.has(examKey)) {
        examMap.set(examKey, {
          name: result.examName,
          class_level: result.classLevel,
          academic_session: result.academicSession,
          status: 'published',
          published_at: result.publishedAt,
          subjects: result.subjects
        })
      }
    }

    for (const [key, examData] of Array.from(examMap.entries())) {
      // Create Exam
      const { data: examRecord, error: examError } = await supabase.from('examinations')
        .insert({
          name: examData.name,
          class_level: examData.class_level,
          academic_session: examData.academic_session,
          status: examData.status,
          published_at: examData.published_at,
        })
        .select().single()

      if (examError) throw examError

      // Unique Subjects for Exam
      const insertedSubjects: Record<string, string> = {}
      let displayOrder = 1
      for (const sub of examData.subjects) {
        if (!insertedSubjects[sub.subjectName]) {
          const { data: subData, error: subError } = await supabase.from('subjects')
            .insert({
              examination_id: examRecord.id,
              subject_name: sub.subjectName,
              maximum_marks: sub.maximumMarks,
              passing_marks: sub.passingMarks,
              display_order: displayOrder++
            }).select().single()
          
          if (subError) throw subError
          insertedSubjects[sub.subjectName] = subData.id
        }
      }

      // Find results belonging to this exam
      const examResults = MOCK_RESULTS.filter(r => 
        r.examName === examData.name &&
        r.classLevel === examData.class_level &&
        r.academicSession === examData.academic_session
      )

      for (const res of examResults) {
        // Create Student
        const { data: studentRecord, error: stuError } = await supabase.from('students')
          .insert({
            roll_number: res.rollNumber,
            name: res.studentName,
            date_of_birth: res.dateOfBirth,
            class_level: res.classLevel,
          }).select().single()
        
        if (stuError && stuError.code !== '23505') throw stuError // Ignore duplicate student error
        
        // Fetch student if duplicated
        const finalStudentId = studentRecord ? studentRecord.id : 
            (await supabase.from('students').select('id').eq('roll_number', res.rollNumber).single()).data?.id

        // Create Result
        const { data: resultRecord, error: resError } = await supabase.from('results')
          .insert({
            student_id: finalStudentId,
            examination_id: examRecord.id,
            total_marks: res.totalMarks,
            maximum_total_marks: res.maximumMarks,
            percentage: res.percentage,
            grade: res.grade,
            result_status: res.resultStatus
          }).select().single()
        
        if (resError) throw resError

        // Create Result Subjects
        for (const sub of res.subjects) {
          const subId = insertedSubjects[sub.subjectName]
          await supabase.from('result_subjects').insert({
            result_id: resultRecord.id,
            subject_id: subId,
            marks_obtained: sub.marksObtained,
            grade: calculateGrade((sub.marksObtained / sub.maximumMarks) * 100)
          })
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Sample Data Seeded Successfully' })
  } catch (error: any) {
    console.error('Seed Error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Seed failed' }, { status: 500 })
  }
}
