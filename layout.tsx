import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CIR Diagnostic Engine — Governed Intelligence Structural Audit',
  description:
    'Constitutional governance audit for AI deployment architectures. Extraction-first. Deterministic scoring. Provider disagreement surfaced.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-base text-ink-primary antialiased">
        {children}
      </body>
    </html>
  )
}
