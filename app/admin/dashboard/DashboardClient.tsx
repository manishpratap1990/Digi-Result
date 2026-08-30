'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/admin/AdminSidebar'
import {
  Users, BookOpen, FileText, ClipboardList, 
  TrendingUp, Plus, ArrowRight, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Stats {
  totalStudents: number
  publishedResults: number
  draftResults: number
  totalExaminations: number
}

interface RecentExam {
  id: string
  name: string
  class_level: number
  academic_session: string
  status: string
  studentCount?: number
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, publishedResults: 0, draftResults: 0, totalExaminations: 0 })
  const [recentExams, setRecentExams] = useState<RecentExam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Parallel fetches
      const [studentsRes, resultsRes, examsRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('results').select('id, examination_id, examinations!inner(status)', { count: 'exact' }),
        supabase.from('examinations').select('id, name, class_level, academic_session, status').order('created_at', { ascending: false }).limit(5),
      ])

      const totalStudents = studentsRes.count || 0
      const allResults = resultsRes.data || []
      const publishedResults = allResults.filter((r: any) => r.examinations?.status === 'published').length
      const draftResults = allResults.filter((r: any) => r.examinations?.status === 'draft').length
      const totalExaminations = examsRes.data?.length || 0

      setStats({ totalStudents, publishedResults, draftResults, totalExaminations })
      setRecentExams(examsRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Published Results', value: stats.publishedResults, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Draft Results', value: stats.draftResults, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Examinations', value: stats.totalExaminations, icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50/70">
      <AdminSidebar />
      <main className="lg:pl-60">
        <div className="pt-14 lg:pt-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-7">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Overview of result portal activity</p>
              </div>
              <Link
                href="/admin/examinations"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                New Examination
              </Link>
            </div>

            {/* Stats Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl card-shadow border border-border/50 p-5 animate-pulse">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 mb-3" />
                    <div className="h-7 w-16 bg-gray-100 rounded mb-1.5" />
                    <div className="h-4 w-24 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7 animate-fade-in">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl card-shadow border border-border/50 p-5">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', bg)}>
                      <Icon className={cn('w-4.5 h-4.5', color)} style={{ width: '18px', height: '18px' }} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Examinations */}
            <div className="bg-white rounded-2xl card-shadow border border-border/50 overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <h2 className="font-semibold text-gray-900 text-sm">Recent Examinations</h2>
                </div>
                <Link href="/admin/examinations" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="p-6 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : recentExams.length === 0 ? (
                <div className="p-10 text-center">
                  <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No examinations created yet.</p>
                  <Link href="/admin/examinations" className="text-sm text-blue-600 font-medium hover:underline">
                    Create your first examination →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Examination</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Class</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Session</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExams.map((exam) => (
                        <tr key={exam.id} className="border-b border-border/30 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 text-sm">{exam.name}</td>
                          <td className="px-4 py-4 text-center text-sm text-muted-foreground">Class {exam.class_level}</td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">{exam.academic_session}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                              exam.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            )}>
                              {exam.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Link href={`/admin/results?exam=${exam.id}`} className="text-xs text-blue-600 hover:underline">
                              View Results
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
