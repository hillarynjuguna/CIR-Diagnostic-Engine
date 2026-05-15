'use client'

import { useState } from 'react'
import type { PrimitiveAssessment } from '@/lib/types'

interface Props {
  assessment: PrimitiveAssessment
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-accent-red border-accent-red',
  HIGH: 'text-accent-amber border-accent-amber',
  MEDIUM: 'text-accent-blue border-accent-blue',
  LOW: 'text-accent-green border-accent-green',
}

const MECHANISM_LABELS: Record<string, { label: string; color: string }> = {
  architectural: { label: 'ARCHITECTURAL', color: 'text-accent-green' },
  policy: { label: 'POLICY ONLY', color: 'text-accent-amber' },
  procedural: { label: 'PROCEDURAL', color: 'text-accent-copper' },
  undefined: { label: 'UNDETECTED', color: 'text-ink-muted' },
}

const DISPLAY_NAMES: Record<string, string> = {
  'bounded-verifiability-latency': 'Reversibility & Safeguards',
  'explicit-compositional-contracts': 'Component Boundaries',
  'continuous-deterministic-layer-regression': 'Rules That Stay True',
  'dual-ownership': 'Who Decides What',
}

const DISPLAY_QUESTIONS: Record<string, string> = {
  'bounded-verifiability-latency': 'Can you undo mistakes? Do you have to approve important actions before they run, or do they just execute?',
  'explicit-compositional-contracts': 'When your tools and agents connect to each other, does each one know what the other expects — or are they just passing data and hoping?',
  'continuous-deterministic-layer-regression': 'You wrote rules for how your system should behave. Are those rules still accurate? Would you know if they drifted?',
  'dual-ownership': 'When a decision needs to be made about how your system operates, is it clear who has authority? Is it documented?',
}

export default function PrimitiveCard({ assessment }: Props) {
  const displayName = DISPLAY_NAMES[assessment.primitiveId] || assessment.primitiveName
  const displayQuestion = DISPLAY_QUESTIONS[assessment.primitiveId]
  const [showEvidence, setShowEvidence] = useState(false)
  const severityColor = SEVERITY_COLORS[assessment.severity] || 'text-ink-secondary border-surface-border'
  const mechanism = MECHANISM_LABELS[assessment.presence.mechanismType] || MECHANISM_LABELS.undefined

  const barColor =
    assessment.severity === 'CRITICAL' ? 'bg-accent-red' :
    assessment.severity === 'HIGH' ? 'bg-accent-amber' :
    assessment.severity === 'MEDIUM' ? 'bg-accent-blue' : 'bg-accent-green'

  const conf = assessment.confidence

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-5">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h4 className="font-mono text-sm font-semibold text-ink-primary">
            {displayName}
          </h4>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-block rounded border px-2 py-0.5 font-mono text-xs ${severityColor}`}>
              {assessment.severity}
            </span>
            <span className={`font-mono text-xs font-semibold ${mechanism.color}`}>
              {mechanism.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="font-mono text-xl font-bold text-ink-primary">{assessment.score}</span>
          <span className="font-mono text-xs text-ink-muted">/100</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-3 h-1.5 w-full rounded-full bg-surface-overlay">
        <div
          className={`h-1.5 rounded-full transition-all ${barColor}`}
          style={{ width: `${assessment.score}%` }}
        />
      </div>

      {/* Plain-language question */}
      {displayQuestion && (
        <p className="mb-2 font-mono text-xs leading-relaxed text-ink-muted italic">
          {displayQuestion}
        </p>
      )}

      {/* Explanation */}
      <p className="mb-3 font-mono text-xs leading-relaxed text-ink-secondary">
        {assessment.explanation}
      </p>

      {/* Weaknesses */}
      {assessment.detectedWeaknesses.length > 0 && (
        <div className="mb-2">
          <span className="font-mono text-xs font-semibold text-accent-red">Weaknesses</span>
          <ul className="mt-1 space-y-1">
            {assessment.detectedWeaknesses.map((w, i) => (
              <li key={i} className="font-mono text-xs text-ink-secondary">— {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Predicted Failures */}
      {assessment.predictedFailurePatterns.length > 0 && (
        <div className="mb-2">
          <span className="font-mono text-xs font-semibold text-accent-amber">Predicted Failures</span>
          <ul className="mt-1 space-y-1">
            {assessment.predictedFailurePatterns.map((f, i) => (
              <li key={i} className="font-mono text-xs text-ink-secondary">— {f}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Remediation */}
      {assessment.remediationRecommendations.length > 0 && (
        <div className="mb-3">
          <span className="font-mono text-xs font-semibold text-accent-green">Remediation</span>
          <ul className="mt-1 space-y-1">
            {assessment.remediationRecommendations.map((r, i) => (
              <li key={i} className="font-mono text-xs text-ink-secondary">— {r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Doc4: Decomposed confidence display */}
      <div className="mt-3 border-t border-surface-border pt-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-ink-muted">Confidence</span>
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="font-mono text-xs text-ink-muted hover:text-ink-secondary transition-colors"
          >
            {showEvidence ? 'hide' : 'details'}
          </button>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            { label: 'Extract', value: conf.extractionConfidence, title: 'Extraction confidence: how clearly the model could map the description' },
            { label: 'Evidence', value: conf.evidenceConfidence, title: 'Evidence confidence: how trustworthy the source description is' },
            { label: 'Govern', value: conf.governanceConfidence, title: 'Governance confidence: composite reliability of the overall assessment' },
          ].map(({ label, value, title }) => (
            <div key={label} title={title}>
              <div className="font-mono text-xs text-ink-muted">{label}</div>
              <div className="font-mono text-sm font-semibold text-ink-secondary">
                {(value * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        {showEvidence && (
          <div className="mt-3 space-y-2">
            {/* Evidence citations */}
            {assessment.presence.evidenceCitations.length > 0 && (
              <div>
                <span className="font-mono text-xs text-ink-muted">Evidence citations</span>
                <ul className="mt-1 space-y-1">
                  {assessment.presence.evidenceCitations.map((c, i) => (
                    <li key={i} className="font-mono text-xs italic text-ink-muted leading-relaxed">
                      "{c}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Confidence warnings */}
            {conf.warnings.length > 0 && (
              <div className="rounded border border-accent-amber/20 bg-accent-amber/5 p-2">
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
