'use client'

import type { DiagnosticReport } from '@/lib/types'

interface Props {
  report: DiagnosticReport
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  GOVERNED: 'text-accent-green border-accent-green',
  'PARTIALLY GOVERNED': 'text-accent-amber border-accent-amber',
  MANAGED: 'text-accent-amber border-accent-amber',
  UNGOVERNED: 'text-accent-red border-accent-red',
}

export default function ExecutiveSummary({ report }: Props) {
  const colorClass =
    CLASSIFICATION_COLORS[report.governabilityClassification] ||
    'text-ink-secondary border-surface-border'

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-6">
      <div className="mb-4 flex items-start justify-between gap-6">
        <div className="flex-1">
          <h3 className="mb-2 font-mono text-sm font-semibold uppercase tracking-wider text-ink-secondary">
            Executive Summary
          </h3>
          <p className="font-mono text-sm leading-relaxed text-ink-primary">
            {report.executiveSummary}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div
            className={`inline-block rounded-md border px-4 py-2 font-mono text-sm font-bold ${colorClass}`}
          >
            {report.governabilityClassification}
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink-primary">
            {report.overallScore}
            <span className="text-sm text-ink-muted">/100</span>
          </div>
          <div className="mt-1 font-mono text-xs text-ink-muted">
            deterministic score
          </div>
        </div>
      </div>
    </div>
  )
}
