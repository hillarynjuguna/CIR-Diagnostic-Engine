'use client'

import type { RiskMatrixEntry } from '@/lib/types'

interface Props {
  entries: RiskMatrixEntry[]
}

const DISPLAY_NAMES: Record<string, string> = {
  'bounded-verifiability-latency': 'Reversibility & Safeguards',
  'explicit-compositional-contracts': 'Component Boundaries',
  'continuous-deterministic-layer-regression': 'Rules That Stay True',
  'dual-ownership': 'Who Decides What',
}

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-accent-red/10', text: 'text-accent-red', border: 'border-accent-red/30' },
  HIGH:     { bg: 'bg-accent-amber/10', text: 'text-accent-amber', border: 'border-accent-amber/30' },
  MEDIUM:   { bg: 'bg-accent-blue/10', text: 'text-accent-blue', border: 'border-accent-blue/30' },
  LOW:      { bg: 'bg-accent-green/10', text: 'text-accent-green', border: 'border-accent-green/30' },
}

function SeverityBadge({ level }: { level: string }) {
  const c = SEVERITY_CONFIG[level] || SEVERITY_CONFIG.MEDIUM
  return (
    <span className={`inline-block rounded border px-2 py-0.5 font-mono text-xs ${c.bg} ${c.text} ${c.border}`}>
      {level}
    </span>
  )
}

export default function RiskMatrix({ entries }: Props) {
  if (entries.length === 0) return null

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-6">
      <h3 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-ink-secondary">
        Operational Risk Matrix
      </h3>
      <div className="space-y-4">
        {entries.map((entry, i) => {
          const displayPrimitives = entry.affectedPrimitives
            .map(id => DISPLAY_NAMES[id] || id)
            .join(', ')

          return (
            <div
              key={i}
              className="rounded-md border border-surface-border bg-surface-overlay p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <div className="font-sans text-sm font-semibold text-ink-primary">
                  {entry.failureMode}
                </div>
                <div className="flex shrink-0 gap-2">
                  <SeverityBadge level={entry.likelihood} />
                  <SeverityBadge level={entry.impact} />
                </div>
              </div>
              <p className="mb-2 text-sm leading-relaxed text-ink-secondary">{entry.description}</p>
              {displayPrimitives && (
                <div className="font-mono text-xs text-ink-muted">
                  Related: {displayPrimitives}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
