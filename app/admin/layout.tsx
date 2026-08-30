import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel — Digi Result',
  description: 'Administrator access only.',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
