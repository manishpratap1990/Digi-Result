'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Shield, ChevronRight, Loader2, AlertCircle, GraduationCap } from 'lucide-react'
import Logo from '@/components/shared/Logo'

export default function HomePage() {
  const router = useRouter()
  const [rollNumber, setRollNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rollNumber.trim()) {
      setError('Please enter your Roll Number.')
      return
    }
    if (!dateOfBirth) {
      setError('Please select your Date of Birth.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/result/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber: rollNumber.trim(), dateOfBirth }),
      })
      const data = await res.json()

      if (res.status === 429) {
        setError('Too many attempts. Please wait a minute and try again.')
        return
      }
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      if (!data.found) {
        setError('not_found')
        return
      }

      // Store result in sessionStorage so the result page can read it (no predictable URLs)
      sessionStorage.setItem('result_data', JSON.stringify(data.result))
      router.push('/result')
    } catch {
      setError('Unable to connect. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  const isNotFound = error === 'not_found'

  return (
    <div className="min-h-screen blue-gradient-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border/60 sticky top-0 z-10" style={{ boxShadow: '0 1px 4px rgba(59,130,246,0.08)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Name */}
            <div className="flex items-center gap-2.5">
              <Logo size="md" withWhiteBg={false} />
              <p className="font-bold text-gray-900 text-base leading-tight">Digi Result</p>
            </div>

            {/* Admin Login */}
            <Link
              href="/admin/login"
              className="text-sm text-muted-foreground hover:text-blue-600 font-medium transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        {/* Hero text */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 leading-tight">
            Check Your <span className="text-blue-600">Result</span>
          </h1>
          <p className="text-sm text-muted-foreground">Class 8 &bull; Class 10 &bull; Class 12</p>
        </div>

        {/* Result Lookup Card */}
        <div className="w-full max-w-md mx-auto animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="bg-white rounded-2xl card-shadow-lg border border-border/50 p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Search className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Find Your Result</h2>
            </div>

            {/* Not Found Error State */}
            {isNotFound && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 text-sm">Result Not Found</p>
                    <p className="text-red-600 text-xs mt-1 leading-relaxed">
                      We could not find a result matching the information entered. Please check your Roll Number and Date of Birth and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Other Error */}
            {error && !isNotFound && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Roll Number */}
              <div>
                <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Roll Number
                </label>
                <input
                  id="rollNumber"
                  type="text"
                  value={rollNumber}
                  onChange={(e) => { setRollNumber(e.target.value); setError('') }}
                  placeholder="Enter your Roll Number"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => { setDateOfBirth(e.target.value); setError('') }}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50/50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  max={new Date().toISOString().split('T')[0]}
                  disabled={loading}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking Result...
                  </>
                ) : (
                  <>
                    View Result
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border/60 py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Logo size="sm" withWhiteBg={false} />
              <p className="text-xs font-semibold text-gray-800">Digi Result</p>
            </div>
            <p className="text-xs text-muted-foreground">Class 8 &bull; Class 10 &bull; Class 12</p>
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Digi Result</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
