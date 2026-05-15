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

const DISPLAY_QUESTIONS: Record<string, string> = {
  'bounded-verifiability-latency': 'Can you undo mistakes? Are irreversible actions gated?',
  'explicit-compositional-contracts': 'When tools connect, does each know what the other expects?',
  'continuous-deterministic-layer-regression': 'If your policies changed, would anyone notice?',
  'dual-ownership': 'When something needs to change, is it clear who has authority?',
}

const STATUS_LABELS: Record<string, string> = {
  CRITICAL: 'Needs Attention',
  HIGH: 'Gap Detected',
  MEDIUM: 'Partial',
  LOW: 'Present',
}

const STATUS_COLORS: Record<string, { dot: string; border: string; badge: string }> = {
  CRITICAL: {
    dot: 'bg-accent-red',
    border: 'border-accent-red/30',
    badge: 'text-accent-red border-accent-red/50 bg-accent-red/10',
  },
  HIGH: {
    dot: 'bg-accent-amber',
    border: 'border-accent-amber/30',
    badge: 'text-accent-amber border-accent-amber/50 bg-accent-amber/10',
  },
  MEDIUM: {
    dot: 'bg-accent-blue',
    border: 'border-accent-blue/30',
    badge: 'text-accent-blue border-accent-blue/50 bg-accent-blue/10',
  },
  LOW: {
    dot: 'bg-accent-green',
    border: 'border-accent-green/30',
    badge: 'text-accent-green border-accent-green/50 bg-accent-green/10',
  },
}

const BAR_COLORS: Record<string, string> = {
  CRITICAL: 'bg-accent-red',
  HIGH: 'bg-accent-amber',
  MEDIUM: 'bg-accent-blue',
  LOW: 'bg-accent-green',
}

const MECHANISM_LABELS: Record<string, { label: string; color: string }> = {
  architectural: { label: 'Architectural enforcement', color: 'text-accent-green' },
  policy: { label: 'Policy only', color: 'text-accent-amber' },
  procedural: { label: 'Procedural', color: 'text-accent-copper' },
  undefined: { label: 'Not detected', color: 'text-ink-muted' },
}

function ConfidenceBar({ value, label, detail }: { value: number; label: string; detail: string }) {
  const pct = Math.round(value * 100)
  const color = pct >= 70 ? 'bg-accent-green' : pct >= 40 ? 'bg-accent-amber' : 'bg-accent-red'
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-muted">{label}</span>
        <span className="font-mono text-xs font-semibold text-ink-secondary">{pct}%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-surface-overlay">
        <div className={`h-1 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-0.5 font-mono text-xs text-ink-muted/70 italic">{detail}</div>
    </div>
  )
}

export default function PrimitiveCard({ assessment }: Props) {
  const [showEvidence, setShowEvidence] = useState(false)

  const displayName = DISPLAY_NAMES[assessment.primitiveId] || assessment.primitiveName
  const displayQuestion = DISPLAY_QUESTIONS[assessment.primitiveId]
  const statusLabel = STATUS_LABELS[assessment.severity] || assessment.severity
  const colors = STATUS_COLORS[assessment.severity] || STATUS_COLORS.MEDIUM
  const barColor = BAR_COLORS[assessment.severity] || 'bg-ink-muted'
  const mechanism = MECHANISM_LABELS[assessment.presence.mechanismType] || MECHANISM_LABELS.undefined
  const conf = assessment.confidence

  const confidenceDetails: Record<string, string> = {
    'Extraction': conf.extractionConfidence >= 0.7
      ? 'we\'re confident we read this correctly'
      : conf.extractionConfidence >= 0.4
      ? 'we could map this with moderate certainty'
      : 'the description was ambiguous here',
    'Evidence': conf.evidenceConfidence >= 0.7
      ? 'the description contains architectural detail'
      : conf.evidenceConfidence >= 0.4
      ? 'some specific detail was present'
      : 'the description relies on policy language',
    'Governance': conf.governanceConfidence >= 0.7
      ? 'the assessment is reliable'
      : conf.governanceConfidence >= 0.4
      ? 'the assessment is provisional'
      : 'architectural enforcement cannot be verified',
  }

  return (
    <div className={`rounded-lg border bg-surface-raised p-5 ${colors.border}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${colors.dot}`} />
          <div>
            <h4 className="font-sans text-sm font-semibold text-ink-primary">{displayName}</h4>
            {displayQuestion && (
              <p className="mt-0.5 font-mono text-xs text-ink-muted">{displayQuestion}</p>
            )}
          </div>
        </div>
        <span className={`shrink-0 rounded border px-2 py-0.5 font-mono text-xs ${colors.badge}`}>
          {statusLabel}
        </span>
      </div>

      {/* Score bar */}
      <div className="mb-1 flex items-center justify-between">
        <div className="h-2 flex-1 rounded-full bg-surface-overlay">
          <div
            className={`h-2 rounded-full transition-all ${barColor}`}
            style={{ width: `${assessment.score}%` }}
          />
        </div>
        <span className="ml-3 font-mono text-xs text-ink-muted">{assessment.score}/100</span>
      </div>
      <div className="mb-4 font-mono text-xs text-ink-muted">
        {mechanism.color !== 'text-ink-muted' && (
          <span className={mechanism.color}>{mechanism.label}</span>
        )}
        {mechanism.color === 'text-ink-muted' && (
          <span className="text-ink-muted">{mechanism.label}</span>
        )}
      </div>

      {/* Explanation */}
      <p className="mb-4 text-sm leading-relaxed text-ink-secondary">
        {assessment.explanation}
      </p>

      {/* Weaknesses */}
      {assessment.detectedWeaknesses.length > 0 && (
        <div className="mb-3">
          <div className="mb-1.5 font-mono text-xs font-semibold text-accent-red">What we found</div>
          <ul className="space-y-1">
            {assessment.detectedWeaknesses.map((w, i) => (
              <li key={i} className="font-mono text-xs leading-relaxed text-ink-secondary">
                — {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Predicted failures */}
      {assessment.predictedFailurePatterns.length > 0 && (
        <div className="mb-3">
          <div className="mb-1.5 font-mono text-xs font-semibold text-accent-amber">How this fails</div>
          <ul className="space-y-1">
            {assessment.predictedFailurePatterns.map((f, i) => (
              <li key={i} className="font-mono text-xs leading-relaxed text-ink-secondary">
                — {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Remediation */}
      {assessment.remediationRecommendations.length > 0 && (
        <div className="mb-3">
          <div className="mb-1.5 font-mono text-xs font-semibold text-accent-green">What to do</div>
          <ul className="space-y-1">
            {assessment.remediationRecommendations.map((r, i) => (
              <li key={i} className="font-mono text-xs leading-relaxed text-ink-secondary">
                — {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence section */}
      <div className="mt-4 border-t border-surface-border pt-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-ink-muted">How confident are we?</span>
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="font-mono text-xs text-ink-muted hover:text-ink-secondary transition-colors"
          >
            {showEvidence ? 'Hide detail' : 'Show evidence'}
          </button>
        </div>

        <div className="mt-3 space-y-2.5">
          <ConfidenceBar
            value={conf.extractionConfidence}
            label="Reading accuracy"
            detail={confidenceDetails['Extraction']}
          />
          <ConfidenceBar
            value={conf.evidenceConfidence}
            label="Description quality"
            detail={confidenceDetails['Evidence']}
          />
          <ConfidenceBar
            value={conf.governanceConfidence}
            label="Assessment reliability"
            detail={confidenceDetails['Governance']}
          />
        </div>

        {showEvidence && (
          <div className="mt-4 space-y-3">
            {assessment.presence.evidenceCitations.length > 0 && (
              <div>
                <div className="mb-1.5 font-mono text-xs text-ink-muted">From your description:</div>
                <ul className="space-y-1.5">
                  {assessment.presence.evidenceCitations.map((c, i) => (
                    <li
                      key={i}
                      className="rounded border border-surface-border bg-surface-overlay px-3 py-2 font-mono text-xs italic text-ink-secondary leading-relaxed"
                    >
                      &ldquo;{c}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {conf.warnings.length > 0 && (
              <div className="rounded border border-accent-amber/20 bg-accent-amber/5 p-3">
                {conf.warnings.map((w, i) => (
                  <p key={i} className="font-mono text-xs text-accent-amber leading-relaxed">
                    ⚠ {w}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
