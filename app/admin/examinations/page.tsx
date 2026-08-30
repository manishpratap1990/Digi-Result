'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Plus, BookOpen, Pencil, Trash2, Loader2, AlertCircle, X, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Subject { id?: string; subject_name: string; maximum_marks: number; passing_marks: number; display_order: number }
interface Examination {
  id: string; name: string; class_level: number; academic_session: string; status: string; subjects?: Subject[]
}

const emptyExam = { name: '', class_level: 10, academic_session: '2025–26', status: 'draft' }
const defaultSubjectsByClass: Record<number, string[]> = {
  8: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  10: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  12: ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology'],
}

export default function ExaminationsPage() {
  const [exams, setExams] = useState<Examination[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExam, setEditingExam] = useState<Examination | null>(null)
  const [form, setForm] = useState(emptyExam)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchExams = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('examinations')
        .select('*')
        .order('created_at', { ascending: false })
      setExams(data || [])
    } catch (err) {
      console.warn('Supabase fetch failed:', err)
      setExams([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchExams() }, [])

  const openCreate = () => {
    setEditingExam(null)
    setForm(emptyExam)
    setSubjects(
      defaultSubjectsByClass[10].map((s, i) => ({ subject_name: s, maximum_marks: 100, passing_marks: 33, display_order: i + 1 }))
    )
    setShowModal(true)
  }

  const openEdit = async (exam: Examination) => {
    setEditingExam(exam)
    setForm({ name: exam.name, class_level: exam.class_level, academic_session: exam.academic_session, status: exam.status })
    // Load subjects for this exam
    const { data } = await supabase.from('subjects').select('*').eq('examination_id', exam.id).order('display_order')
    setSubjects(data || [])
    setShowModal(true)
  }

  const handleClassChange = (cl: number) => {
    setForm(f => ({ ...f, class_level: cl }))
    if (!editingExam) {
      setSubjects(defaultSubjectsByClass[cl].map((s, i) => ({ subject_name: s, maximum_marks: 100, passing_marks: 33, display_order: i + 1 })))
    }
  }

  const addSubject = () => {
    setSubjects(prev => [...prev, { subject_name: '', maximum_marks: 100, passing_marks: 33, display_order: prev.length + 1 }])
  }

  const removeSubject = (i: number) => {
    setSubjects(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, display_order: idx + 1 })))
  }

  const updateSubject = (i: number, field: keyof Subject, value: string | number) => {
    setSubjects(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Examination name is required.'); return }
    if (subjects.length === 0) { toast.error('Add at least one subject.'); return }
    if (subjects.some(s => !s.subject_name.trim())) { toast.error('All subjects must have a name.'); return }
    setSaving(true)

    try {
      if (editingExam) {
        // Update examination
        const { error } = await supabase.from('examinations').update({
          name: form.name.trim(),
          class_level: form.class_level,
          academic_session: form.academic_session,
          status: form.status,
          updated_at: new Date().toISOString(),
          published_at: form.status === 'published' ? new Date().toISOString() : editingExam.status === 'published' ? undefined : null,
        }).eq('id', editingExam.id)
        if (error) throw error

        // Delete old subjects and re-insert
        await supabase.from('subjects').delete().eq('examination_id', editingExam.id)
        await supabase.from('subjects').insert(subjects.map((s, i) => ({
          examination_id: editingExam.id, subject_name: s.subject_name.trim(),
          maximum_marks: s.maximum_marks, passing_marks: s.passing_marks, display_order: i + 1,
        })))
        toast.success('Examination updated successfully.')
      } else {
        // Create new examination
        const { data: newExam, error } = await supabase.from('examinations').insert({
          name: form.name.trim(), class_level: form.class_level,
          academic_session: form.academic_session, status: form.status,
          published_at: form.status === 'published' ? new Date().toISOString() : null,
        }).select().single()
        if (error || !newExam) throw error

        await supabase.from('subjects').insert(subjects.map((s, i) => ({
          examination_id: newExam.id, subject_name: s.subject_name.trim(),
          maximum_marks: s.maximum_marks, passing_marks: s.passing_marks, display_order: i + 1,
        })))
        toast.success('Examination created successfully.')
      }
      setShowModal(false)
      fetchExams()
    } catch (err) {
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('examinations').delete().eq('id', id)
    if (error) { toast.error('Failed to delete examination.'); return }
    toast.success('Examination deleted.')
    setDeleteId(null)
    fetchExams()
  }

  const handlePublishToggle = async (exam: Examination) => {
    const newStatus = exam.status === 'published' ? 'draft' : 'published'
    const { error } = await supabase.from('examinations').update({
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', exam.id)
    if (error) { toast.error('Failed to update status.'); return }
    toast.success(newStatus === 'published' ? 'Results published!' : 'Exam moved to draft.')
    fetchExams()
  }

  return (
    <div className="min-h-screen bg-gray-50/70">
      <AdminSidebar />
      <main className="lg:pl-60">
        <div className="pt-14 lg:pt-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-7">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Examinations</h1>
                <p className="text-sm text-muted-foreground mt-1">Create and manage examinations for each class</p>
              </div>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" /> Create Examination
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : exams.length === 0 ? (
              <div className="bg-white rounded-2xl card-shadow border border-border/50 p-14 text-center">
                <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No examinations yet. Create your first one.</p>
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                {exams.map((exam) => (
                  <div key={exam.id} className="bg-white rounded-2xl card-shadow border border-border/50 px-6 py-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{exam.name}</p>
                        <p className="text-xs text-muted-foreground">Class {exam.class_level} &bull; {exam.academic_session}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn(
                        'text-xs font-semibold px-2.5 py-1 rounded-full border',
                        exam.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}>
                        {exam.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      <button
                        onClick={() => handlePublishToggle(exam)}
                        className={cn(
                          'text-xs font-medium px-3 py-1.5 rounded-lg transition-all',
                          exam.status === 'published'
                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        )}
                      >
                        {exam.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => openEdit(exam)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(exam.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setShowModal(false)} />
          <div className="relative bg-white rounded-2xl card-shadow-lg border border-border/50 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-border/50 flex items-center justify-between z-10">
              <h2 className="font-bold text-gray-900">{editingExam ? 'Edit Examination' : 'Create Examination'}</h2>
              <button onClick={() => !saving && setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Examination Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Examination Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Annual Examination"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
                <div className="flex gap-2">
                  {[8, 10, 12].map(cl => (
                    <button
                      key={cl}
                      type="button"
                      onClick={() => handleClassChange(cl)}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
                        form.class_level === cl ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'border-border text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      Class {cl}
                    </button>
                  ))}
                </div>
              </div>
              {/* Session */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Academic Session</label>
                <input
                  type="text"
                  value={form.academic_session}
                  onChange={e => setForm(f => ({ ...f, academic_session: e.target.value }))}
                  placeholder="e.g. 2025–26"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Result Status</label>
                <div className="flex gap-2">
                  {['draft', 'published'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize',
                        form.status === s ? 'bg-blue-600 text-white border-blue-600' : 'border-border text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subjects */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Subjects</label>
                  <button onClick={addSubject} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Subject
                  </button>
                </div>
                <div className="space-y-2">
                  {subjects.map((sub, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sub.subject_name}
                        onChange={e => updateSubject(i, 'subject_name', e.target.value)}
                        placeholder="Subject name"
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={sub.maximum_marks}
                        onChange={e => updateSubject(i, 'maximum_marks', parseInt(e.target.value) || 100)}
                        placeholder="Max"
                        className="w-16 px-2 py-2 rounded-lg border border-border bg-gray-50/50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={sub.passing_marks}
                        onChange={e => updateSubject(i, 'passing_marks', parseInt(e.target.value) || 33)}
                        placeholder="Pass"
                        className="w-16 px-2 py-2 rounded-lg border border-border bg-gray-50/50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={() => removeSubject(i)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Max = Maximum Marks, Pass = Passing Marks per subject</p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-border/50 flex gap-3 justify-end">
              <button
                onClick={() => !saving && setShowModal(false)}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Examination'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl card-shadow-lg border border-border/50 w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Examination?</h3>
                <p className="text-sm text-muted-foreground mt-1">This will delete all associated subjects and results. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
