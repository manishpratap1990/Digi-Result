'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, Shield } from 'lucide-react'
import Logo from '@/components/shared/Logo'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Please enter your Admin ID and Password.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const isDemo = !supabaseUrl ||
        supabaseUrl === 'your_supabase_project_url' ||
        supabaseUrl.includes('demo-placeholder')

      if (isDemo) {
        // ── DEMO MODE ──
        const demoPass = process.env.DEMO_ADMIN_PASSWORD || 'admin123'
        await new Promise(r => setTimeout(r, 600))
        if (username.trim() === 'admin' && password === demoPass) {
          sessionStorage.setItem('demo_admin_session', '1')
          router.push('/admin/dashboard')
        } else {
          // Generic error — don't reveal demo credentials in error message
          setError('Incorrect Admin ID or Password. Please try again.')
        }
        return
      }

      // ── PRODUCTION: Supabase Auth ──
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const email = username.trim().includes('@')
        ? username.trim()
        : `${username.trim().toLowerCase()}@portal.local`

      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        // Generic error — don't reveal auth internals
        setError('Incorrect Admin ID or Password. Please try again.')
        return
      }
      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen blue-gradient-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl card-shadow-lg border border-border/50 overflow-hidden animate-fade-in">
        {/* Top blue bar */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-6 text-center flex flex-col items-center">
          <Logo size="lg" withWhiteBg className="mb-3" />
          <p className="text-white font-bold text-base">Digi Result</p>
          <p className="text-blue-100 text-xs mt-0.5">Admin Portal</p>
        </div>

        <div className="p-7">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">Admin Sign In</h1>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5" role="alert">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-1.5">Admin ID</label>
              <input
                id="adminId"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError('') }}
                placeholder="Enter Admin ID"
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoComplete="username"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-5">
            Restricted access — authorized personnel only.
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        &larr; <a href="/" className="hover:text-blue-600 transition-colors">Back to Result Portal</a>
      </p>
    </div>
  )
}
