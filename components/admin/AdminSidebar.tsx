'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, BookOpen, Users, Upload, Settings, LogOut, Menu, X, GraduationCap
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/examinations', label: 'Examinations', icon: BookOpen },
  { href: '/admin/results', label: 'Results', icon: Users },
  { href: '/admin/import', label: 'Import Results', icon: Upload },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    // Clear demo session
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('demo_admin_session')
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
          <img src="/logo.png" alt="Digi Result Logo" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">Digi Result</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-blue-600' : 'text-gray-400')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border/60">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-white border-r border-border/60 z-20 card-shadow">
        <NavContent />
      </aside>

      {/* Mobile header bar */}
      <div className="lg:hidden bg-white border-b border-border/60 fixed top-0 left-0 right-0 z-20 px-4 h-14 flex items-center justify-between" style={{ boxShadow: '0 1px 4px rgba(59,130,246,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
            <img src="/logo.png" alt="Digi Result Logo" className="w-full h-full object-contain" />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Digi Result — Admin</p>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white flex flex-col animate-slide-in" style={{ boxShadow: '4px 0 20px rgba(0,0,0,0.08)' }}>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
