import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Digi Result',
  description: 'Securely access your academic results online. Enter your Roll Number and Date of Birth to view your result.',
  keywords: 'result, academic result, school result, class 8, class 10, class 12',
  metadataBase: new URL('https://result.ciosupresult.org/'),
  openGraph: {
    title: 'Digi Result',
    description: 'Securely access your academic results online.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
