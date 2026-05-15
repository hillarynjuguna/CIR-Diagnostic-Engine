'use client'

import type { DiagnosticReport } from '@/lib/types'

interface Props {
  report: DiagnosticReport
}

const CLASSIFICATION_CONFIG: Record<string, { dot: string; label: string; description: string }> = {
  GOVERNED: {
    dot: 'bg-accent-green',
    label: 'GOVERNED',
    description: 'Your system has structural safeguards in place across all four dimensions. Architectural enforcement is present, not just policy.',
  },
  'PARTIALLY GOVERNED': {
    dot: 'bg-accent-amber',
    label: 'PARTIALLY GOVERNED',
    description: 'Your system has some architectural safeguards, but gaps remain. Incidents are possible on the dimensions without enforcement.',
  },
  MANAGED: {
    dot: 'bg-accent-amber',
    label: 'MANAGED',
    description: 'Your system relies on instructions and processes to prevent failures, rather than architectural safeguards. This works until it doesn\'t.',
  },
  UNGOVERNED: {
    dot: 'bg-accent-red',
    label: 'UNGOVERNED',
    description: 'Your system has no architectural safeguards. Failures are a matter of when, not if. System prompts and policies are not substitutes for structural enforcement.',
  },
}

const SCORE_BAR_COLOR: Record<string, string> = {
  GOVERNED: 'bg-accent-green',
  'PARTIALLY GOVERNED': 'bg-accent-amber',
  MANAGED: 'bg-accent-amber',
  UNGOVERNED: 'bg-accent-red',
}

export default function ExecutiveSummary({ report }: Props) {
  const config =
    CLASSIFICATION_CONFIG[report.governabilityClassification] ||
    CLASSIFICATION_CONFIG['MANAGED']
  const barColor = SCORE_BAR_COLOR[report.governabilityClassification] || 'bg-ink-muted'

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-6">
      {/* Classification badge + score */}
      <div className="mb-5 flex items-center gap-3">
        <div className={`h-3 w-3 rounded-full ${config.dot}`} />
        <span className="font-mono text-sm font-bold text-ink-primary">
          {config.label}
        </span>
        <div className="ml-auto text-right">
          <span className="font-mono text-2xl font-bold text-ink-primary">{report.overallScore}</span>
          <span className="font-mono text-xs text-ink-muted">/100</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-5 h-2 w-full rounded-full bg-surface-overlay">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${report.overallScore}%` }}
        />
      </div>

      {/* Classification description */}
      <p className="mb-4 text-sm leading-relaxed text-ink-secondary">
        {config.description}
      </p>

      {/* Executive summary from narrative layer */}
      <div className="rounded-md border border-surface-border bg-surface-overlay p-4">
        <div className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Analysis
        </div>
        <p className="text-sm leading-relaxed text-ink-primary">
          {report.executiveSummary}
        </p>
      </div>
    </div>
  )
}
