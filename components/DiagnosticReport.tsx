'use client'

import type { DiagnosticReport as DiagnosticReportType } from '@/lib/types'
import ExecutiveSummary from './ExecutiveSummary'
import PrimitiveCard from './PrimitiveCard'
import RiskMatrix from './RiskMatrix'
import RemediationPanel from './RemediationPanel'
import StabilityPanel from './StabilityPanel'

interface Props {
  report: DiagnosticReportType
  onReset: () => void
}

export default function DiagnosticReport({ report, onReset }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-lg font-semibold text-ink-primary">Diagnostic Report</h2>
          {report._provider && (
            <div className="mt-1 flex items-center gap-3 font-mono text-xs text-ink-muted">
              <span>
                Extraction: <span className="text-accent-amber">{report._provider}</span>
              </span>
              {report._verificationProvider && (
                <span>
                  Narrative: <span className="text-accent-amber">{report._verificationProvider}</span>
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onReset}
          className="rounded-md border border-surface-border px-4 py-2 font-mono text-xs text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink-primary"
        >
          New Scan
        </button>
      </div>

      <ExecutiveSummary report={report} />

      {/* Doc3: Stability surface — provider disagreement is named, not hidden */}
      {report._stability && (
        report._stability.warnings.length > 0 ||
        report._stability.providerDisagreement
      ) && (
        <StabilityPanel stability={report._stability} />
      )}

      <div>
        <h3 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-ink-secondary">
          What We Found
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {report.primitiveAssessments.map((assessment) => (
            <PrimitiveCard key={assessment.primitiveId} assessment={assessment} />
          ))}
        </div>
      </div>

      <RiskMatrix entries={report.riskMatrix} />

      {report.latentInstabilities.length > 0 && (
        <div className="rounded-lg border border-surface-border bg-surface-raised p-6">
          <h3 className="mb-3 font-mono text-sm font-semibold uppercase tracking-wider text-ink-secondary">
            Latent Instabilities
          </h3>
          <ul className="space-y-2">
            {report.latentInstabilities.map((instability, i) => (
              <li key={i} className="flex gap-3 font-mono text-sm text-ink-primary">
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
        <p className="font-mono text-sm leading-relaxed text-ink-primary">
          {report.topologyAssessment}
        </p>
      </div>

      <RemediationPanel priorities={report.remediationPriorities} />

      <div className="rounded-lg border border-surface-border/50 bg-surface-raised/50 p-4">
        <p className="font-mono text-xs text-ink-muted">
          <span className="text-ink-secondary font-semibold">Constitutional Authority Disclosure: </span>
          This engine evaluates architecture descriptions, not deployed systems. Extraction confidence
          is bounded by the specificity of the description provided. The engine does not yet fully
          satisfy the framework it evaluates — its own governance gaps are present in this codebase.
          Self-reported architectures carry inherent evidence limitations; confidence decomposition
          surfaces these rather than hiding them.
        </p>
      </div>
    </div>
  )
}
