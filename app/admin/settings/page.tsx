'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Settings, Save, Loader2, CheckCircle2, Building, Mail, Phone, Globe, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface InstituteSettings {
  id: number
  institute_name: string
  address: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
}

export default function SettingsPage() {
  const [form, setForm] = useState<InstituteSettings>({
    id: 1, institute_name: '', address: '', contact_email: '', contact_phone: '', website: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase.from('institute_settings').select('*').single()
        if (data) setForm(data)
      } catch (err) {
        console.warn('Supabase fetch failed (likely demo mode):', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.institute_name.trim()) { toast.error('Institute name is required.'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('institute_settings').update({
        institute_name: form.institute_name.trim(),
        address: form.address?.trim() || null,
        contact_email: form.contact_email?.trim() || null,
        contact_phone: form.contact_phone?.trim() || null,
        website: form.website?.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', form.id)
      if (error) throw error
      toast.success('Settings saved successfully.')
    } catch {
      toast.error('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, field, icon, type = 'text', placeholder }: {
    label: string; field: keyof InstituteSettings; icon: React.ReactNode; type?: string; placeholder?: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
        <span className="text-blue-400">{icon}</span>
        {label}
      </label>
      <input
        type={type}
        value={(form[field] as string) || ''}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50/70">
      <AdminSidebar />
      <main className="lg:pl-60">
        <div className="pt-14 lg:pt-0">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-7 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your institute information</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_project_url')) {
                    toast.error('Local Supabase database is not connected. Add an active SUPABASE_URL to your .env to inject data.')
                    return
                  }
                  if (confirm('This will insert sample data into your database. Continue?')) {
                    toast.loading('Seeding data...', { id: 'seed' })
                    try {
                      const res = await fetch('/api/admin/seed', { method: 'POST' })
                      if (res.ok) toast.success('Sample data loaded successfully!', { id: 'seed' })
                      else toast.error('Failed to load sample data.', { id: 'seed' })
                    } catch {
                      toast.error('Network error during seeding.', { id: 'seed' })
                    }
                  }
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-sm rounded-xl transition-colors shadow-sm"
              >
                Load Sample Data
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5 animate-fade-in">
                <div className="bg-white rounded-2xl card-shadow border border-border/50 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-gray-900 text-sm">Institute Information</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <span className="text-blue-400"><Building className="w-3.5 h-3.5 inline" /></span>
                        Institute Name *
                      </label>
                      <input
                        type="text"
                        value={form.institute_name}
                        onChange={e => setForm(f => ({ ...f, institute_name: e.target.value }))}
                        placeholder="e.g. Digi Result"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <span className="text-blue-400"><MapPin className="w-3.5 h-3.5 inline" /></span>
                        Address
                      </label>
                      <textarea
                        value={form.address || ''}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        placeholder="Full institute address"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                          <span className="text-blue-400"><Mail className="w-3.5 h-3.5 inline" /></span>
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={form.contact_email || ''}
                          onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                          placeholder="info@institute.edu.in"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                          <span className="text-blue-400"><Phone className="w-3.5 h-3.5 inline" /></span>
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={form.contact_phone || ''}
                          onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <span className="text-blue-400"><Globe className="w-3.5 h-3.5 inline" /></span>
                        Website
                      </label>
                      <input
                        type="url"
                        value={form.website || ''}
                        onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                        placeholder="https://www.institute.edu.in"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
