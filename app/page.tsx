'use client'

import { useState } from 'react'
import ArchitectureInput from '@/components/ArchitectureInput'
import DiagnosticReport from '@/components/DiagnosticReport'
import ScanningState from '@/components/ScanningState'
import type { DiagnosticReport as DiagnosticReportType } from '@/lib/types'

export default function Home() {
  const [report, setReport] = useState<DiagnosticReportType | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEvaluate = async (description: string) => {
    setIsScanning(true)
    setError(null)
    setReport(null)

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ architectureDescription: description }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Evaluation failed')
      }

      const data = await response.json()
      setReport(data)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-12">
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-accent-amber">
          Oscillatory Fields — Constitutional Architecture
        </div>
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-ink-primary">
          CIR Diagnostic Engine
        </h1>
        <p className="mt-2 max-w-2xl text-ink-secondary">
          Structural governance audit for AI deployment architectures. Extracts primitive presence
          from architecture descriptions. Scores deterministically. Surfaces provider disagreement.
          Evaluates whether your system is governable by architectural impossibility, not by policy,
          prompts, or hope.
        </p>
        <div className="mt-4 font-mono text-xs text-ink-muted">
          v2.0 — Two-phase pipeline: extraction → deterministic scoring → narrative analysis
        </div>
      </header>

      {!report && !isScanning && (
        <ArchitectureInput onSubmit={handleEvaluate} error={error} />
      )}

      {isScanning && <ScanningState />}

      {report && !isScanning && (
        <DiagnosticReport
          report={report}
          onReset={() => {
            setReport(null)
            setError(null)
          }}
        />
      )}
    </main>
  )
}
