'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, ArrowLeft, CheckCircle2, XCircle, Calendar, User, Hash, BookOpen, Printer, Download } from 'lucide-react'
import { formatDate, formatPercentage, getClassLabel } from '@/lib/utils'
import Logo from '@/components/shared/Logo'

interface SubjectResult {
  subjectName: string
  maximumMarks: number
  passingMarks: number
  marksObtained: number
  grade: string
  remarks: string | null
}

interface ResultData {
  studentName: string
  rollNumber: string
  dateOfBirth: string
  classLevel: number
  examName: string
  academicSession: string
  totalMarks: number
  maximumMarks: number
  percentage: number
  grade: string
  resultStatus: string
  publishedAt: string
  subjects: SubjectResult[]
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A+': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'A':  return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'B+': return 'text-indigo-700 bg-indigo-50 border-indigo-200'
    case 'B':  return 'text-violet-700 bg-violet-50 border-violet-200'
    case 'C+':
    case 'C':  return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'D':  return 'text-orange-700 bg-orange-50 border-orange-200'
    default:   return 'text-red-700 bg-red-50 border-red-200'
  }
}

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<ResultData | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('result_data')
    if (!stored) {
      router.replace('/')
      return
    }
    try {
      setResult(JSON.parse(stored))
    } catch {
      router.replace('/')
    }
  }, [router])

  if (!result) {
    return (
      <div className="min-h-screen blue-gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading result...</p>
        </div>
      </div>
    )
  }

  const isPass = result.resultStatus === 'pass'

  return (
    <div className="min-h-screen blue-gradient-bg">
      {/* Header */}
      <header className="bg-white border-b border-border/60 print:hidden" style={{ boxShadow: '0 1px 4px rgba(59,130,246,0.08)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Logo size="md" withWhiteBg={false} />
              <div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">Digi Result</p>
                <p className="text-xs text-muted-foreground">Digital Result Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const style = document.createElement('style')
                  style.id = '__print_style'
                  style.textContent = `
                    @media print {
                      .print\\:hidden { display: none !important; }
                      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                      @page { margin: 1.5cm; }
                    }
                  `
                  if (!document.getElementById('__print_style')) {
                    document.head.appendChild(style)
                  }
                  window.print()
                }}
                className="text-sm text-muted-foreground hover:text-blue-600 font-medium transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50"
                aria-label="Download result as PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
              <Link
                href="/"
                onClick={() => sessionStorage.removeItem('result_data')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Result Header */}
        <div className="bg-white rounded-2xl card-shadow-md border border-border/50 overflow-hidden mb-5 animate-fade-in">
          {/* Blue top bar */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5 print:bg-blue-700">
            <div className="flex items-center gap-3 mb-1">
              <Logo size="md" withWhiteBg className="print:hidden" />
              <div>
                <h1 className="text-white font-bold text-lg">Digi Result</h1>
                <p className="text-blue-100 text-xs">Digital Result Portal</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm mt-2">
              {result.examName} &bull; {getClassLabel(result.classLevel)} &bull; Session: {result.academicSession}
            </p>
          </div>

          {/* Academic Result heading */}
          <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Academic Result</span>
          </div>

          {/* Student Info Grid */}
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoField label="Student Name" value={result.studentName} icon={<User className="w-3.5 h-3.5" />} />
            <InfoField label="Roll Number" value={result.rollNumber} icon={<Hash className="w-3.5 h-3.5" />} />
            <InfoField label="Class" value={getClassLabel(result.classLevel)} icon={<BookOpen className="w-3.5 h-3.5" />} />
            <InfoField label="Date of Birth" value={formatDate(result.dateOfBirth)} icon={<Calendar className="w-3.5 h-3.5" />} />
            <InfoField label="Examination" value={result.examName} icon={<BookOpen className="w-3.5 h-3.5" />} />
            <InfoField label="Academic Session" value={result.academicSession} icon={<Calendar className="w-3.5 h-3.5" />} />
          </div>
        </div>

        {/* Marks Table */}
        <div className="bg-white rounded-2xl card-shadow-md border border-border/50 overflow-hidden mb-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="font-semibold text-gray-900 text-sm">Subject-wise Marks</h2>
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full result-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th className="text-right">Max. Marks</th>
                  <th className="text-right">Marks Obtained</th>
                  <th className="text-center">Grade</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((sub) => {
                  const subPass = sub.marksObtained >= sub.passingMarks
                  return (
                    <tr key={sub.subjectName} className="hover:bg-gray-50/50 transition-colors">
                      <td className="font-medium text-gray-900">{sub.subjectName}</td>
                      <td className="text-right text-muted-foreground">{sub.maximumMarks}</td>
                      <td className="text-right font-semibold text-gray-900">{sub.marksObtained}</td>
                      <td className="text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getGradeColor(sub.grade)}`}>
                          {sub.grade}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`text-xs font-medium ${subPass ? 'text-emerald-600' : 'text-red-500'}`}>
                          {subPass ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden px-4 py-3 space-y-3">
            {result.subjects.map((sub) => {
              const subPass = sub.marksObtained >= sub.passingMarks
              return (
                <div key={sub.subjectName} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-border/40">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{sub.subjectName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Max: {sub.maximumMarks}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">{sub.marksObtained}</p>
                    <div className="flex items-center gap-2 justify-end mt-0.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold border ${getGradeColor(sub.grade)}`}>{sub.grade}</span>
                      <span className={`text-xs font-medium ${subPass ? 'text-emerald-600' : 'text-red-500'}`}>{subPass ? 'Pass' : 'Fail'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          {/* Summary card */}
          <div className="bg-white rounded-2xl card-shadow-md border border-border/50 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Result Summary</h3>
            <div className="space-y-3">
              <SummaryRow label="Total Marks" value={`${result.totalMarks} / ${result.maximumMarks}`} />
              <SummaryRow label="Percentage" value={formatPercentage(result.percentage)} />
              <SummaryRow label="Overall Grade" value={
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold border ${getGradeColor(result.grade)}`}>
                  {result.grade}
                </span>
              } />
            </div>
          </div>

          {/* Status card */}
          <div className={`rounded-2xl border p-6 flex flex-col items-center justify-center text-center card-shadow-md ${
            isPass
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}>
            {isPass ? (
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mb-3" />
            ) : (
              <XCircle className="w-14 h-14 text-red-400 mb-3" />
            )}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Result Status</p>
            <p className={`text-3xl font-black tracking-wide ${isPass ? 'text-emerald-700' : 'text-red-600'}`}>
              {isPass ? 'PASS' : 'FAIL'}
            </p>
            {isPass && (
              <p className="text-xs text-emerald-600 mt-2">
                Congratulations on your result!
              </p>
            )}
            {!isPass && (
              <p className="text-xs text-red-500 mt-2">
                Please contact the school for guidance.
              </p>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          This result is published by Digi Result. For any discrepancy, contact the school office.
        </p>
      </main>
    </div>
  )
}

function InfoField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="text-blue-400">{icon}</span>
        {label}
      </div>
      <p className="font-semibold text-gray-900 text-sm">{value}</p>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}
