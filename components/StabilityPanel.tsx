'use client'

import type { StabilityAssessment } from '@/lib/types'

interface Props {
  stability: StabilityAssessment
  onRescan?: () => void
}

const DISPLAY_NAMES: Record<string, string> = {
  'bounded-verifiability-latency': 'Reversibility & Safeguards',
  'explicit-compositional-contracts': 'Component Boundaries',
  'continuous-deterministic-layer-regression': 'Rules That Stay True',
  'dual-ownership': 'Who Decides What',
}

export default function StabilityPanel({ stability, onRescan }: Props) {
  const d = stability.providerDisagreement

  const isMajor = d?.severity === 'major'
  const isModerate = d?.severity === 'moderate'

  const borderColor = isMajor
    ? 'border-accent-red/40'
    : isModerate
    ? 'border-accent-amber/40'
    : 'border-accent-blue/40'

  const headerColor = isMajor ? 'text-accent-red' : isModerate ? 'text-accent-amber' : 'text-accent-blue'
  const bgColor = isMajor
    ? 'bg-accent-red/5'
    : isModerate
    ? 'bg-accent-amber/5'
    : 'bg-accent-blue/5'

  // Translate divergent field IDs to display names
  const divergentDisplayNames = (d?.divergentFields || []).map(
    f => DISPLAY_NAMES[f] || f
  )

  return (
    <div className={`rounded-lg border p-6 ${borderColor} ${bgColor}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">⚠</span>
        <h3 className={`font-sans text-sm font-semibold ${headerColor}`}>
          Provider Disagreement Detected
        </h3>
        {d && (
          <span className={`ml-auto rounded border border-current px-2 py-0.5 font-mono text-xs ${headerColor}`}>
            {d.severity.toUpperCase()}
          </span>
        )}
      </div>

      {d && (
        <div className="mb-4 space-y-2 text-sm text-ink-secondary">
          <p>
            <span className="font-semibold text-ink-primary">{d.primaryProvider}</span> and{' '}
            <span className="font-semibold text-ink-primary">{d.verificationProvider}</span> produced
            materially different assessments on:
          </p>
          <ul className="ml-4 space-y-1">
            {divergentDisplayNames.map((name, i) => (
              <li key={i} className="font-mono text-xs">— {name}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-secondary">
            This means the architecture description may be ambiguous on these dimensions.
            The assessment is provisional.
          </p>
        </div>
      )}

      {stability.warnings.length > 0 && (
        <div className="mb-4 space-y-1">
          {stability.warnings.map((w, i) => (
            <p key={i} className="font-mono text-xs leading-relaxed text-ink-secondary">⚠ {w}</p>
          ))}
        </div>
      )}

      <div className="rounded-md border border-surface-border bg-surface-base p-4">
        <div className="mb-2 font-mono text-xs font-semibold text-ink-secondary">Recommended actions</div>
        <ul className="space-y-1.5 font-mono text-xs text-ink-muted">
          <li>— Re-describe your architecture with more specific detail on the flagged dimensions</li>
          <li>— Treat these findings as provisional pending human review</li>
          {onRescan && (
            <li>
              <button
                onClick={onRescan}
                className="text-accent-amber hover:text-amber-400 transition-colors"
              >
                — Re-scan with revised description →
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
