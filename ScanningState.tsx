'use client'

import { useEffect, useState } from 'react'

const PHASES = [
  'Parsing architecture description...',
  'Identifying execution boundaries...',
  'Mapping authority delegation chains...',
  'Phase 1: Extracting primitive presence matrix...',
  'Evaluating Bounded Verifiability Latency...',
  'Evaluating Explicit Compositional Contracts...',
  'Evaluating Continuous Deterministic Regression...',
  'Evaluating Dual Ownership structure...',
  'Computing deterministic scores from extraction...',
  'Phase 2: Generating narrative analysis...',
  'Detecting latent failure modes...',
  'Mapping governance topology...',
  'Decomposing confidence across epistemic dimensions...',
  'Running stability check...',
  'Assembling constitutional diagnostic report...',
]

export default function ScanningState() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev < PHASES.length - 1 ? prev + 1 : prev))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-lg border border-surface-border bg-surface-raised p-12">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-amber/2 to-transparent animate-scan" />
      </div>

      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 h-3 w-3 animate-pulse rounded-full bg-accent-amber" />
          <h2 className="font-mono text-lg font-semibold text-ink-primary">
            Constitutional MRI Scan in Progress
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Two-phase pipeline: extraction layer → deterministic scoring → narrative analysis
          </p>
        </div>

        <div className="space-y-1">
          {PHASES.map((text, index) => (
            <div
              key={text}
              className={`font-mono text-xs transition-all duration-300 ${
                index < phase
                  ? 'text-ink-muted line-through'
                  : index === phase
                  ? 'text-accent-amber'
                  : 'text-ink-muted/40'
              }`}
            >
              {index < phase ? '✓' : index === phase ? '◉' : '○'} {text}
            </div>
          ))}
        </div>

        <div className="mt-6 font-mono text-xs text-ink-muted">
          Scoring is deterministic. The model extracts. The engine classifies.
        </div>
      </div>
    </div>
  )
}
