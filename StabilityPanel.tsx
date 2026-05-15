'use client'

import type { StabilityAssessment } from '@/lib/types'

interface Props {
  stability: StabilityAssessment
}

const SEVERITY_STYLES = {
  minor: 'border-accent-blue/30 bg-accent-blue/5 text-accent-blue',
  moderate: 'border-accent-amber/30 bg-accent-amber/5 text-accent-amber',
  major: 'border-accent-red/30 bg-accent-red/5 text-accent-red',
}

export default function StabilityPanel({ stability }: Props) {
  const disagreement = stability.providerDisagreement
  const severityStyle = disagreement
    ? SEVERITY_STYLES[disagreement.severity]
    : 'border-accent-amber/30 bg-accent-amber/5 text-accent-amber'

  return (
    <div className={`rounded-lg border p-4 ${severityStyle}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider">
          Stability Assessment
        </span>
        {disagreement && (
          <span className="rounded border border-current px-1.5 py-0.5 font-mono text-xs">
            {disagreement.severity.toUpperCase()} DIVERGENCE
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {stability.warnings.map((w, i) => (
          <p key={i} className="font-mono text-xs leading-relaxed opacity-90">
            ⚠ {w}
          </p>
        ))}
      </div>

      {disagreement && (
        <div className="mt-3 border-t border-current/20 pt-3 font-mono text-xs">
          <div className="flex flex-wrap gap-4">
            <span>
              Extraction: <span className="font-semibold">{disagreement.primaryProvider}</span>
            </span>
            <span>
              Narrative: <span className="font-semibold">{disagreement.verificationProvider}</span>
            </span>
          </div>
          {disagreement.divergentFields.length > 0 && (
            <div className="mt-1.5 opacity-75">
              Divergent fields: {disagreement.divergentFields.join(', ')}
            </div>
          )}
          {disagreement.severity === 'major' && (
            <div className="mt-2 font-semibold">
              Major divergence detected. The overall governability classification is provisional. Request a manual review or re-run with a different model configuration.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
