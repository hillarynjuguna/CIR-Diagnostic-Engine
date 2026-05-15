'use client'

import { useState, useEffect } from 'react'
import ArchitectureInput from '@/components/ArchitectureInput'
import IntentPreview from '@/components/IntentPreview'
import DiagnosticReport from '@/components/DiagnosticReport'
import ScanningState from '@/components/ScanningState'
import CompareMonitor from '@/components/CompareMonitor'
import type { DiagnosticReport as DiagnosticReportType } from '@/lib/types'

type AppState = 'input' | 'intent' | 'scanning' | 'results'
export type ScanMode = 'quick' | 'deep'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('input')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<ScanMode>('deep')
  const [report, setReport] = useState<DiagnosticReportType | null>(null)
  const [previousReport, setPreviousReport] = useState<DiagnosticReportType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCompare, setShowCompare] = useState(false)

  // Load previous report from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cir_last_report')
      if (stored) setPreviousReport(JSON.parse(stored))
    } catch {}
  }, [])

  const handleDescriptionSubmit = (desc: string, selectedMode: ScanMode) => {
    setDescription(desc)
    setMode(selectedMode)
    setAppState('intent')
    setError(null)
  }

  const handleBeginScan = async () => {
    setAppState('scanning')
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

      const data: DiagnosticReportType = await response.json()
      setReport(data)

      // Persist to localStorage for Compare & Monitor
      try {
        const stored = localStorage.getItem('cir_last_report')
        if (stored) setPreviousReport(JSON.parse(stored))
        localStorage.setItem('cir_last_report', JSON.stringify({ ...data, _scanDate: new Date().toISOString() }))
      } catch {}

      setAppState('results')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setAppState('input')
    }
  }

  const handleReset = () => {
    setReport(null)
    setError(null)
    setShowCompare(false)
    setAppState('input')
  }

  const handleEditDescription = () => {
    setAppState('input')
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-accent-amber">
          Oscillatory Fields — Constitutional Architecture
        </div>
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-ink-primary">
          CIR Diagnostic Engine
        </h1>
        {appState === 'input' && (
          <p className="mt-2 max-w-2xl text-ink-secondary">
            You built something complex. Here&apos;s what&apos;s actually holding it together.
            Describe how your tools, agents, and workflows connect. CIR maps where they&apos;d
            break — before the incident, not after.
          </p>
        )}
      </header>

      {appState === 'input' && (
        <ArchitectureInput
          onSubmit={handleDescriptionSubmit}
          error={error}
          initialDescription={description}
        />
      )}

      {appState === 'intent' && (
        <IntentPreview
          description={description}
          mode={mode}
          onBeginScan={handleBeginScan}
          onEdit={handleEditDescription}
        />
      )}

      {appState === 'scanning' && <ScanningState />}

      {appState === 'results' && report && (
        <div className="space-y-6">
          {previousReport && (
            <div className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-raised px-4 py-3">
              <span className="font-mono text-xs text-ink-secondary">
                Previous scan available — compare architecture drift
              </span>
              <button
                onClick={() => setShowCompare(v => !v)}
                className="font-mono text-xs text-accent-amber hover:text-amber-400 transition-colors"
              >
                {showCompare ? 'Hide comparison' : 'Compare results'}
              </button>
            </div>
          )}

          {showCompare && previousReport && report && (
            <CompareMonitor current={report} previous={previousReport} />
          )}

          <DiagnosticReport
            report={report}
            initialMode={mode}
            onReset={handleReset}
            onRescan={() => setAppState('intent')}
          />
        </div>
      )}
    </main>
  )
}
