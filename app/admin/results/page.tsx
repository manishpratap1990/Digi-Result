'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/admin/AdminSidebar'
import {
  Search, Pencil, Loader2, CheckCircle2,
  X, ChevronDown, Users, AlertCircle
} from 'lucide-react'
import { cn, formatDate, formatPercentage, calculateGrade } from '@/lib/utils'
import { toast } from 'sonner'

interface Examination { id: string; name: string; class_level: number; academic_session: string; status: string }
interface Subject { id: string; subject_name: string; maximum_marks: number; passing_marks: number; display_order: number }
interface ResultRow {
  id: string
  total_marks: number
  maximum_total_marks: number
  percentage: number
  grade: string
  result_status: string
  students: { id: string; name: string; roll_number: string; date_of_birth: string; class_level: number }
  examinations: { name: string; academic_session: string; status: string }
}

export default function ResultsPage() {
  const [exams, setExams] = useState<Examination[]>([])
  const [selectedExam, setSelectedExam] = useState<string>('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [results, setResults] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pass' | 'fail'>('all')
  const [editingResult, setEditingResult] = useState<ResultRow | null>(null)
  const [editSubjectMarks, setEditSubjectMarks] = useState<Record<string, number>>({})
  const [editSaving, setEditSaving] = useState(false)
  const [publishModal, setPublishModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const loadExams = async () => {
      try {
        const { data } = await supabase.from('examinations').select('*').order('created_at', { ascending: false })
        setExams(data || [])
        if (data && data.length > 0) setSelectedExam(data[0].id)
      } catch (err) {
        console.warn('Supabase fetch failed:', err)
      }
    }
    loadExams()
  }, [])

  const fetchResults = useCallback(async () => {
    if (!selectedExam) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('results')
        .select('*, students(*), examinations(*)')
        .eq('examination_id', selectedExam)
        .order('students(name)')
      setResults(data || [])

      const { data: subs } = await supabase
        .from('subjects').select('*').eq('examination_id', selectedExam).order('display_order')
      setSubjects(subs || [])
    } catch (err) {
      console.warn('Supabase fetch failed:', err)
      setResults([])
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }, [selectedExam])

  useEffect(() => { fetchResults() }, [fetchResults])

  const filtered = results.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.students.name.toLowerCase().includes(q) ||
      r.students.roll_number.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || r.result_status === filterStatus
    return matchSearch && matchStatus
  })

  const currentExam = exams.find(e => e.id === selectedExam)

  const openEdit = async (result: ResultRow) => {
    setEditingResult(result)
    const { data } = await supabase
      .from('result_subjects')
      .select('subject_id, marks_obtained')
      .eq('result_id', result.id)
    const marksMap: Record<string, number> = {}
    ;(data || []).forEach((rs: any) => { marksMap[rs.subject_id] = rs.marks_obtained })
    setEditSubjectMarks(marksMap)
  }

  const handleEditSave = async () => {
    if (!editingResult) return
    setEditSaving(true)
    try {
      const totalMarks = subjects.reduce((sum, sub) => sum + (editSubjectMarks[sub.id] || 0), 0)
      const maxTotal = subjects.reduce((sum, sub) => sum + sub.maximum_marks, 0)
      const percentage = maxTotal > 0 ? (totalMarks / maxTotal) * 100 : 0
      const grade = calculateGrade(percentage)

      // Determine pass/fail
      const anyFail = subjects.some(sub => (editSubjectMarks[sub.id] || 0) < sub.passing_marks)
      const resultStatus = anyFail ? 'fail' : 'pass'

      // Update result
      await supabase.from('results').update({
        total_marks: totalMarks, maximum_total_marks: maxTotal,
        percentage: Math.round(percentage * 100) / 100, grade, result_status: resultStatus,
        updated_at: new Date().toISOString(),
      }).eq('id', editingResult.id)

      // Update each subject result
      for (const sub of subjects) {
        const marks = editSubjectMarks[sub.id] || 0
        const subGrade = calculateGrade((marks / sub.maximum_marks) * 100)
        await supabase.from('result_subjects').upsert({
          result_id: editingResult.id, subject_id: sub.id,
          marks_obtained: marks, grade: subGrade,
        }, { onConflict: 'result_id,subject_id' })
      }

      toast.success('Result updated successfully.')
      setEditingResult(null)
      fetchResults()
    } catch {
      toast.error('Failed to update result.')
    } finally {
      setEditSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!selectedExam) return
    const { error } = await supabase.from('examinations').update({
      status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', selectedExam)
    if (error) { toast.error('Failed to publish.'); return }
    toast.success('Results published successfully!')
    setPublishModal(false)
    setExams(prev => prev.map(e => e.id === selectedExam ? { ...e, status: 'published' } : e))
  }

  return (
    <div className="min-h-screen bg-gray-50/70">
      <AdminSidebar />
      <main className="lg:pl-60">
        <div className="pt-14 lg:pt-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Results</h1>
                <p className="text-sm text-muted-foreground mt-1">Review, edit, and publish student results</p>
              </div>
              {currentExam && currentExam.status === 'draft' && results.length > 0 && (
                <button
                  onClick={() => setPublishModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Publish Results
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl card-shadow border border-border/50 p-4 mb-5 flex flex-col sm:flex-row gap-3">
              {/* Exam selector */}
              <div className="relative flex-1">
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
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or roll number..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Status filter */}
              <div className="flex gap-2">
                {(['all', 'pass', 'fail'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={cn(
                      'px-3 py-2.5 rounded-xl border text-xs font-medium capitalize transition-all',
                      filterStatus === s ? 'bg-blue-600 text-white border-blue-600' : 'border-border text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Results table */}
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl card-shadow border border-border/50 p-14 text-center">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {results.length === 0 ? 'No results uploaded for this examination.' : 'No results match your search.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl card-shadow border border-border/50 overflow-hidden animate-fade-in">
                <div className="px-6 py-3 border-b border-border/50 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</p>
                  <span className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full border',
                    currentExam?.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  )}>
                    {currentExam?.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-gray-50/60">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roll No.</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">%</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grade</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(r => (
                        <tr key={r.id} className="border-b border-border/30 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4 font-medium text-gray-900 text-sm">{r.students.name}</td>
                          <td className="px-4 py-4 text-sm text-muted-foreground font-mono">{r.students.roll_number}</td>
                          <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">{r.total_marks}/{r.maximum_total_marks}</td>
                          <td className="px-4 py-4 text-right text-sm text-muted-foreground">{Number(r.percentage).toFixed(1)}%</td>
                          <td className="px-4 py-4 text-center">
                            <span className={cn(
                              'text-xs font-semibold px-2 py-0.5 rounded-full border',
                              r.grade === 'A+' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                            )}>{r.grade}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={cn(
                              'text-xs font-semibold px-2 py-0.5 rounded-full border',
                              r.result_status === 'pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                            )}>
                              {r.result_status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Result Modal */}
      {editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !editSaving && setEditingResult(null)} />
          <div className="relative bg-white rounded-2xl card-shadow-lg border border-border/50 w-full max-w-md max-h-[85vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Edit Result</h2>
                <p className="text-xs text-muted-foreground">{editingResult.students.name} — {editingResult.students.roll_number}</p>
              </div>
              <button onClick={() => !editSaving && setEditingResult(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {subjects.map(sub => (
                <div key={sub.id} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-gray-700 font-medium">{sub.subject_name}</span>
                  <input
                    type="number"
                    min={0}
                    max={sub.maximum_marks}
                    value={editSubjectMarks[sub.id] ?? 0}
                    onChange={e => setEditSubjectMarks(prev => ({ ...prev, [sub.id]: Math.min(sub.maximum_marks, Math.max(0, parseInt(e.target.value) || 0)) }))}
                    className="w-20 px-3 py-2 rounded-xl border border-border text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-muted-foreground w-10">/ {sub.maximum_marks}</span>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-border/50 flex gap-3 justify-end">
              <button onClick={() => !editSaving && setEditingResult(null)} disabled={editSaving} className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
              <button onClick={handleEditSave} disabled={editSaving} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-70">
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {publishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPublishModal(false)} />
          <div className="relative bg-white rounded-2xl card-shadow-lg border border-border/50 w-full max-w-sm p-6 animate-fade-in">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Publish Results?</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You are about to make these results available to students.
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-2">
                {results.length} result{results.length !== 1 ? 's' : ''} will become publicly accessible.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPublishModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={handlePublish} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all">Publish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
