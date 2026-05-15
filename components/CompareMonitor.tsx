'use client'

import type { DiagnosticReport } from '@/lib/types'

interface Props {
  current: DiagnosticReport & { _scanDate?: string }
  previous: DiagnosticReport & { _scanDate?: string }
}

const DISPLAY_NAMES: Record<string, string> = {
  'bounded-verifiability-latency': 'Reversibility & Safeguards',
  'explicit-compositional-contracts': 'Component Boundaries',
  'continuous-deterministic-layer-regression': 'Rules That Stay True',
  'dual-ownership': 'Who Decides What',
}

const CLASS_CONFIG: Record<string, { dot: string; text: string }> = {
  GOVERNED: { dot: 'bg-accent-green', text: 'text-accent-green' },
  'PARTIALLY GOVERNED': { dot: 'bg-accent-amber', text: 'text-accent-amber' },
  MANAGED: { dot: 'bg-accent-amber', text: 'text-accent-amber' },
  UNGOVERNED: { dot: 'bg-accent-red', text: 'text-accent-red' },
}

function fmt(date?: string) {
  if (!date) return 'Previous scan'
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return 'Previous scan'
  }
}

export default function CompareMonitor({ current, previous }: Props) {
  const scoreDelta = current.overallScore - previous.overallScore
  const classChanged = current.governabilityClassification !== previous.governabilityClassification

  const currentConfig = CLASS_CONFIG[current.governabilityClassification] || CLASS_CONFIG['MANAGED']
  const previousConfig = CLASS_CONFIG[previous.governabilityClassification] || CLASS_CONFIG['MANAGED']

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-6 space-y-5">
      <div>
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-ink-secondary mb-1">
          Architecture Drift Detection
        </h3>
        <p className="font-mono text-xs text-ink-muted">
          Comparing your two most recent scans.
        </p>
      </div>

      {/* Classification comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-md border border-surface-border bg-surface-overlay p-4">
          <div className="mb-1 font-mono text-xs text-ink-muted">{fmt(previous._scanDate)}</div>
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${previousConfig.dot}`} />
            <span className={`font-mono text-sm font-bold ${previousConfig.text}`}>
              {previous.governabilityClassification}
            </span>
          </div>
          <div className="mt-1 font-mono text-xs text-ink-muted">{previous.overallScore}/100</div>
        </div>
        <div className="rounded-md border border-surface-border bg-surface-overlay p-4">
          <div className="mb-1 font-mono text-xs text-ink-muted">{fmt(current._scanDate)} (this scan)</div>
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${currentConfig.dot}`} />
            <span className={`font-mono text-sm font-bold ${currentConfig.text}`}>
              {current.governabilityClassification}
            </span>
          </div>
          <div className="mt-1 font-mono text-xs text-ink-muted">
            {current.overallScore}/100
            {scoreDelta !== 0 && (
              <span className={scoreDelta > 0 ? 'text-accent-green ml-1' : 'text-accent-red ml-1'}>
                {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Per-primitive diff */}
      <div>
        <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
          What changed
        </div>
        <div className="space-y-2">
          {current.primitiveAssessments.map((curr) => {
            const prev = previous.primitiveAssessments.find(p => p.primitiveId === curr.primitiveId)
            if (!prev) return null
            const delta = curr.score - prev.score
            const displayName = DISPLAY_NAMES[curr.primitiveId] || curr.primitiveName
            const unchanged = delta === 0

            return (
              <div
                key={curr.primitiveId}
                className="flex items-center justify-between gap-4 rounded-md border border-surface-border bg-surface-overlay px-4 py-3"
              >
                <div className="font-sans text-sm text-ink-primary">{displayName}</div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-ink-muted">{prev.score}</span>
                  <span className="text-ink-muted">→</span>
                  <span className={
                    delta > 0 ? 'font-semibold text-accent-green'
                    : delta < 0 ? 'font-semibold text-accent-red'
                    : 'text-ink-muted'
                  }>
                    {curr.score}
                  </span>
                  {!unchanged && (
                    <span className={delta > 0 ? 'text-accent-green' : 'text-accent-red'}>
                      {delta > 0 ? `↑ +${delta}` : `↓ ${delta}`}
                    </span>
                  )}
                  {unchanged && <span className="text-ink-muted">—</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {classChanged && (
        <div className="rounded-md border border-accent-green/30 bg-accent-green/5 px-4 py-3">
          <p className="font-mono text-xs text-accent-green">
            Classification changed: {previous.governabilityClassification} → {current.governabilityClassification}
          </p>
        </div>
      )}
    </div>
  )
}
