'use client'

import { useState } from 'react'
import type { PrimitiveAssessment } from '@/lib/types'

interface Props {
  assessment: PrimitiveAssessment
}

const DISPLAY_NAMES: Record<string, string> = {
  'bounded-verifiability-latency': 'Reversibility & Safeguards',
  'explicit-compositional-contracts': 'Component Boundaries',
  'continuous-deterministic-layer-regression': 'Rules That Stay True',
  'dual-ownership': 'Who Decides What',
}

const STATUS_LABELS: Record<string, string> = {
  CRITICAL: 'Needs Attention',
  HIGH: 'Gap Detected',
  MEDIUM: 'Partial',
  LOW: 'Present',
}

const STATUS_CONFIG: Record<string, { dot: string; border: string; label: string; labelColor: string }> = {
  CRITICAL: {
    dot: 'bg-accent-red',
    border: 'border-l-accent-red',
    label: 'Needs Attention',
    labelColor: 'text-accent-red',
  },
  HIGH: {
    dot: 'bg-accent-amber',
    border: 'border-l-accent-amber',
    label: 'Gap Detected',
    labelColor: 'text-accent-amber',
  },
  MEDIUM: {
    dot: 'bg-accent-blue',
    border: 'border-l-accent-blue',
    label: 'Partial',
    labelColor: 'text-accent-blue',
  },
  LOW: {
    dot: 'bg-accent-green',
    border: 'border-l-accent-green',
    label: 'Present',
    labelColor: 'text-accent-green',
  },
}

// The Quick Scan card: plain-language summary only, no scores, no mechanism types
// One tap to reveal the evidence
export default function QuickScanCard({ assessment }: Props) {
  const [expanded, setExpanded] = useState(false)
  const displayName = DISPLAY_NAMES[assessment.primitiveId] || assessment.primitiveName
  const config = STATUS_CONFIG[assessment.severity] || STATUS_CONFIG.MEDIUM

  return (
    <div className={`rounded-lg border border-surface-border border-l-2 ${config.border} bg-surface-raised overflow-hidden`}>
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 shrink-0 rounded-full mt-0.5 ${config.dot}`} />
            <h4 className="font-sans text-sm font-semibold text-ink-primary">{displayName}</h4>
          </div>
          <span className={`shrink-0 font-mono text-xs font-semibold ${config.labelColor}`}>
            {STATUS_LABELS[assessment.severity]}
          </span>
        </div>

        {/* Plain-language finding */}
        <p className="text-sm leading-relaxed text-ink-secondary mb-3">
          {assessment.explanation}
        </p>

        {/* First weakness as the "concrete risk" */}
        {assessment.detectedWeaknesses.length > 0 && (
          <p className="font-mono text-xs leading-relaxed text-ink-muted mb-3">
            — {assessment.detectedWeaknesses[0]}
          </p>
        )}

        {/* Expand/collapse trigger */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="font-mono text-xs text-ink-muted hover:text-accent-amber transition-colors"
        >
          {expanded ? 'Hide detail ↑' : 'Show evidence ↓'}
        </button>
      </div>

      {/* Expanded evidence */}
      {expanded && (
        <div className="border-t border-surface-border bg-surface-overlay px-5 py-4 space-y-3">
          {assessment.predictedFailurePatterns.length > 0 && (
            <div>
              <div className="mb-1.5 font-mono text-xs font-semibold text-accent-amber">How this fails</div>
              <ul className="space-y-1">
                {assessment.predictedFailurePatterns.slice(0, 2).map((f, i) => (
                  <li key={i} className="font-mono text-xs leading-relaxed text-ink-secondary">— {f}</li>
                ))}
              </ul>
            </div>
          )}
          {assessment.remediationRecommendations.length > 0 && (
            <div>
              <div className="mb-1.5 font-mono text-xs font-semibold text-accent-green">What to do</div>
              <p className="font-mono text-xs leading-relaxed text-ink-secondary">
                — {assessment.remediationRecommendations[0]}
              </p>
            </div>
          )}
          {assessment.presence.evidenceCitations.length > 0 && (
            <div>
              <div className="mb-1.5 font-mono text-xs text-ink-muted">From your description:</div>
              <p className="font-mono text-xs italic text-ink-secondary leading-relaxed">
                &ldquo;{assessment.presence.evidenceCitations[0]}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
