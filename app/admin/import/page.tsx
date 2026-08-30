'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/admin/AdminSidebar'
import {
  Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle,
  Loader2, ChevronDown, X, AlertTriangle, UploadCloud
} from 'lucide-react'
import { cn, calculateGrade, calculateSubjectGrade, isSubjectPass } from '@/lib/utils'
import { toast } from 'sonner'

interface Examination { id: string; name: string; class_level: number; academic_session: string }
interface Subject { id: string; subject_name: string; maximum_marks: number; passing_marks: number; display_order: number }
interface ImportRow {
  rowIndex: number
  rollNumber: string
  studentName: string
  dateOfBirth: string
  marks: Record<string, number>
  errors: string[]
  valid: boolean
}

export default function ImportPage() {
  const [exams, setExams] = useState<Examination[]>([])
  const [selectedExam, setSelectedExam] = useState<string>('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [rows, setRows] = useState<ImportRow[] | null>(null)
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('examinations').select('id, name, class_level, academic_session').order('created_at', { ascending: false })
      .then(({ data }) => {
        setExams(data || [])
        if (data && data.length > 0) setSelectedExam(data[0].id)
      })
  }, [])

  useEffect(() => {
    if (!selectedExam) return
    supabase.from('subjects').select('*').eq('examination_id', selectedExam).order('display_order')
      .then(({ data }) => setSubjects(data || []))
    setRows(null)
    setImportDone(false)
  }, [selectedExam])

  const downloadTemplate = async () => {
    // Dynamically import xlsx
    const XLSX = (await import('xlsx')).default || await import('xlsx')
    const headers = ['Roll Number', 'Student Name', 'Date of Birth (YYYY-MM-DD)', ...subjects.map(s => s.subject_name)]
    const ws = XLSX.utils.aoa_to_sheet([headers])
    // Column widths
    ws['!cols'] = headers.map(() => ({ wch: 22 }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Results')
    const exam = exams.find(e => e.id === selectedExam)
    XLSX.writeFile(wb, `Template_Class${exam?.class_level}_${exam?.academic_session || ''}.xlsx`.replace(/[–—]/g, '-'))
  }

  const parseFile = async (file: File) => {
    if (!subjects.length) { toast.error('Please select an examination with subjects first.'); return }
    setParsing(true)
    setRows(null)
    setImportDone(false)

    try {
      const XLSX = (await import('xlsx')).default || await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as string[][]

      if (raw.length < 2) { toast.error('File appears empty.'); setParsing(false); return }

      const parsed: ImportRow[] = []
      for (let i = 1; i < raw.length; i++) {
        const row = raw[i]
        if (row.every((c: string) => !String(c).trim())) continue

        const errors: string[] = []
        const rollNumber = String(row[0] || '').trim()
        const studentName = String(row[1] || '').trim()
        const dateOfBirth = String(row[2] || '').trim()

        if (!rollNumber) errors.push('Roll Number is missing')
        if (!studentName) errors.push('Student Name is missing')
        if (!dateOfBirth) errors.push('Date of Birth is missing')
        else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) errors.push('Date of Birth must be YYYY-MM-DD format')

        const marks: Record<string, number> = {}
        subjects.forEach((sub, idx) => {
          const val = row[3 + idx]
          const n = parseInt(String(val || ''))
          if (isNaN(n) || n < 0) errors.push(`${sub.subject_name}: invalid marks (must be 0–${sub.maximum_marks})`)
          else if (n > sub.maximum_marks) errors.push(`${sub.subject_name}: marks (${n}) exceed maximum (${sub.maximum_marks})`)
          else marks[sub.id] = n
        })

        parsed.push({ rowIndex: i + 1, rollNumber, studentName, dateOfBirth, marks, errors, valid: errors.length === 0 })
      }

      setRows(parsed)
    } catch (err) {
      toast.error('Failed to parse file. Make sure it is a valid Excel or CSV file.')
    } finally {
      setParsing(false)
    }
  }

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) { toast.error('Please upload an Excel (.xlsx, .xls) or CSV file.'); return }
    parseFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleConfirmImport = async () => {
    if (!rows || !selectedExam) return
    const validRows = rows.filter(r => r.valid)
    if (validRows.length === 0) { toast.error('No valid rows to import.'); return }
    setImporting(true)

    try {
      const exam = exams.find(e => e.id === selectedExam)!
      let successCount = 0

      for (const row of validRows) {
        // Upsert student
        const { data: student, error: sErr } = await supabase
          .from('students')
          .upsert({
            roll_number: row.rollNumber.toUpperCase(),
            name: row.studentName,
            date_of_birth: row.dateOfBirth,
            class_level: exam.class_level,
          }, { onConflict: 'roll_number,class_level' })
          .select()
          .single()

        if (sErr || !student) continue

        // Calculate totals
        const totalMarks = subjects.reduce((sum, sub) => sum + (row.marks[sub.id] || 0), 0)
        const maxTotal = subjects.reduce((sum, sub) => sum + sub.maximum_marks, 0)
        const percentage = maxTotal > 0 ? (totalMarks / maxTotal) * 100 : 0
        const grade = calculateGrade(percentage)
        const anyFail = subjects.some(sub => (row.marks[sub.id] || 0) < sub.passing_marks)

        // Upsert result
        const { data: result, error: rErr } = await supabase
          .from('results')
          .upsert({
            student_id: student.id,
            examination_id: selectedExam,
            total_marks: totalMarks,
            maximum_total_marks: maxTotal,
            percentage: Math.round(percentage * 100) / 100,
            grade,
            result_status: anyFail ? 'fail' : 'pass',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'student_id,examination_id' })
          .select()
          .single()

        if (rErr || !result) continue

        // Upsert result subjects
        for (const sub of subjects) {
          const marks = row.marks[sub.id] || 0
          const subGrade = calculateSubjectGrade(marks, sub.maximum_marks)
          await supabase.from('result_subjects').upsert({
            result_id: result.id, subject_id: sub.id, marks_obtained: marks, grade: subGrade,
          }, { onConflict: 'result_id,subject_id' })
        }
        successCount++
      }

      toast.success(`${successCount} records imported successfully.`)
      setImportDone(true)
      setRows(null)
    } catch {
      toast.error('Import failed. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  const validCount = rows ? rows.filter(r => r.valid).length : 0
  const errorCount = rows ? rows.filter(r => !r.valid).length : 0

  return (
    <div className="min-h-screen bg-gray-50/70">
      <AdminSidebar />
      <main className="lg:pl-60">
        <div className="pt-14 lg:pt-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900">Import Results</h1>
              <p className="text-sm text-muted-foreground mt-1">Upload an Excel or CSV file to bulk import student results</p>
            </div>

            {/* Step 1: Select Exam */}
            <div className="bg-white rounded-2xl card-shadow border border-border/50 p-6 mb-5">
              <h2 className="font-semibold text-gray-900 text-sm mb-4">1. Select Examination</h2>
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <select
                    value={selectedExam}
                    onChange={e => setSelectedExam(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl border border-border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>{e.name} — Class {e.class_level} ({e.academic_session})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <button
                  onClick={downloadTemplate}
                  disabled={!selectedExam || subjects.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 border border-blue-200 text-blue-600 text-sm font-medium rounded-xl hover:bg-blue-50 disabled:opacity-40 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
              {subjects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {subjects.map(s => (
                    <span key={s.id} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                      {s.subject_name} (Max: {s.maximum_marks})
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Upload */}
            <div className="bg-white rounded-2xl card-shadow border border-border/50 p-6 mb-5">
              <h2 className="font-semibold text-gray-900 text-sm mb-4">2. Upload File</h2>
              <div
                className={cn(
                  'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
                  dragging ? 'border-blue-400 bg-blue-50' : 'border-border hover:border-blue-300 hover:bg-blue-50/30'
                )}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
                />
                {parsing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-muted-foreground">Parsing file...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <UploadCloud className="w-7 h-7 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 text-sm">Drop your file here, or <span className="text-blue-600">browse</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Supports .xlsx, .xls, .csv</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Import Summary */}
            {rows && (
              <div className="bg-white rounded-2xl card-shadow border border-border/50 p-6 mb-5 animate-fade-in">
                <h2 className="font-semibold text-gray-900 text-sm mb-4">3. Import Summary</h2>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="p-4 bg-gray-50 rounded-xl text-center border border-border/40">
                    <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Total Rows</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                    <p className="text-2xl font-bold text-emerald-700">{validCount}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Valid Records</p>
                  </div>
                  <div className={cn('p-4 rounded-xl text-center border', errorCount > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-border/40')}>
                    <p className={cn('text-2xl font-bold', errorCount > 0 ? 'text-red-600' : 'text-gray-400')}>{errorCount}</p>
                    <p className={cn('text-xs mt-0.5', errorCount > 0 ? 'text-red-500' : 'text-muted-foreground')}>Errors</p>
                  </div>
                </div>

                {/* Error rows */}
                {errorCount > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Rows with Errors</p>
                    <div className="space-y-2">
                      {rows.filter(r => !r.valid).map(row => (
                        <div key={row.rowIndex} className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-red-700">Row {row.rowIndex} — {row.rollNumber || 'Unknown Roll'}</p>
                            <ul className="mt-0.5 space-y-0.5">
                              {row.errors.map((e, i) => <li key={i} className="text-xs text-red-500">{e}</li>)}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validCount > 0 && (
                  <button
                    onClick={handleConfirmImport}
                    disabled={importing}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-70"
                  >
                    {importing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Importing {validCount} records...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Confirm Import ({validCount} records)</>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Success state */}
            {importDone && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-emerald-800">Import Complete</p>
                <p className="text-sm text-emerald-600 mt-1">
                  Records imported successfully. Go to Results to review and publish.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
