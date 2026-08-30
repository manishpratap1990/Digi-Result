import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { redirect } from 'next/navigation'

export default function AdminDashboardPage() {
  return <AdminDashboardClient />
}

import AdminDashboardClient from './DashboardClient'
