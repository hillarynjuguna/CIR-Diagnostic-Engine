'use client'

import { useState } from 'react'
import type { DiagnosticReport as DiagnosticReportType } from '@/lib/types'
import ExecutiveSummary from './ExecutiveSummary'
import PrimitiveCard from './PrimitiveCard'
import QuickScanCard from './QuickScanCard'
import RiskMatrix from './RiskMatrix'
import RemediationPanel from './RemediationPanel'
import StabilityPanel from './StabilityPanel'
import type { ScanMode } from '@/app/page'

interface Props {
  report: DiagnosticReportType
  initialMode: ScanMode
  onReset: () => void
  onRescan: () => void
}

export default function DiagnosticReport({ report, initialMode, onReset, onRescan }: Props) {
  const [viewMode, setViewMode] = useState<ScanMode>(initialMode)

  const hasMajorDisagreement =
    report._stability?.providerDisagreement?.severity === 'major' ||
    report._stability?.providerDisagreement?.severity === 'moderate'

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-lg font-semibold text-ink-primary">
            Your System&apos;s Structural Map
          </h2>
          {report._provider && (
            <div className="mt-1 flex items-center gap-3 font-mono text-xs text-ink-muted">
              <span>Extraction: <span className="text-accent-amber">{report._provider}</span></span>
              {report._verificationProvider && (
                <span>Verification: <span className="text-accent-amber">{report._verificationProvider}</span></span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-md border border-surface-border overflow-hidden">
            <button
              onClick={() => setViewMode('quick')}
              className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                viewMode === 'quick'
                  ? 'bg-surface-overlay text-ink-primary'
                  : 'text-ink-muted hover:text-ink-secondary'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setViewMode('deep')}
              className={`px-3 py-1.5 font-mono text-xs transition-colors ${
                viewMode === 'deep'
                  ? 'bg-surface-overlay text-ink-primary'
                  : 'text-ink-muted hover:text-ink-secondary'
              }`}
            >
              Full Diagnostic
            </button>
          </div>
          <button
            onClick={onRescan}
            className="rounded-md border border-surface-border px-3 py-1.5 font-mono text-xs text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink-primary"
          >
            Re-scan
          </button>
          <button
            onClick={onReset}
            className="rounded-md border border-surface-border px-3 py-1.5 font-mono text-xs text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink-primary"
          >
            New Scan
          </button>
        </div>
      </div>

      {/* Executive summary */}
      <ExecutiveSummary report={report} />

      {/* Stability / Escalation Pathway */}
      {hasMajorDisagreement && report._stability && (
        <StabilityPanel stability={report._stability} onRescan={onRescan} />
      )}

      {/* Primitive cards */}
      <div>
        <h3 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-ink-secondary">
          What We Found
        </h3>

        {viewMode === 'quick' ? (
          <div className="space-y-3">
            {report.primitiveAssessments.map((a) => (
              <QuickScanCard key={a.primitiveId} assessment={a} />
            ))}
            <button
              onClick={() => setViewMode('deep')}
              className="mt-2 w-full rounded-lg border border-surface-border px-4 py-3 font-mono text-xs text-ink-muted hover:border-ink-muted hover:text-ink-secondary transition-colors"
            >
              View Full Diagnostic — evidence, risk matrix, remediation priorities →
            </button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {report.primitiveAssessments.map((a) => (
              <PrimitiveCard key={a.primitiveId} assessment={a} />
            ))}
          </div>
        )}
      </div>

      {/* Deep diagnostic only sections */}
      {viewMode === 'deep' && (
        <>
          <RiskMatrix entries={report.riskMatrix} />

          {report.latentInstabilities.length > 0 && (
            <div className="rounded-lg border border-surface-border bg-surface-raised p-6">
              <h3 className="mb-3 font-mono text-sm font-semibold uppercase tracking-wider text-ink-secondary">
                Latent Instabilities
              </h3>
              <ul className="space-y-2">
                {report.latentInstabilities.map((instability, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink-primary">
                    <span className="mt-0.5 shrink-0 text-accent-amber">△</span>
                    <span>{instability}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg border border-surface-border bg-surface-raised p-6">
            <h3 className="mb-3 font-mono text-sm font-semibold uppercase tracking-wider text-ink-secondary">
              Governance Topology
            </h3>
            <p className="text-sm leading-relaxed text-ink-primary">{report.topologyAssessment}</p>
          </div>

          <RemediationPanel priorities={report.remediationPriorities} />
        </>
      )}

      {/* Constitutional Authority Disclosure */}
      <div className="rounded-lg border border-surface-border/50 bg-surface-raised/50 p-4">
        <p className="font-mono text-xs text-ink-muted">
          <span className="text-ink-secondary font-semibold">Notice: </span>
          This engine evaluates architecture descriptions, not deployed systems. Extraction confidence
          is bounded by the specificity of the description provided. Self-reported architectures carry
          inherent evidence limitations — confidence scores surface these rather than hiding them.
        </p>
      </div>
    </div>
  )
}
