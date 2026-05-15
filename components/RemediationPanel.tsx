'use client'

interface Props {
  priorities: string[]
}

export default function RemediationPanel({ priorities }: Props) {
  if (priorities.length === 0) return null

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-6">
      <h3 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-ink-secondary">
        Remediation Priorities — Ordered by Consequence
      </h3>
      <ol className="space-y-3">
        {priorities.map((priority, i) => (
          <li key={i} className="flex gap-3 font-mono text-sm text-ink-primary">
            <span className="mt-0.5 shrink-0 font-bold text-accent-amber">{i + 1}.</span>
            <span>{priority}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 border-t border-surface-border pt-3">
        <p className="font-mono text-xs text-ink-muted">
          Fix what&apos;s irreversible first. If your system can do something that can&apos;t be undone,
          and there&apos;s no human approval gate before it executes — that&apos;s the gap to close today.
          Everything else can follow.
        </p>
      </div>
    </div>
  )
}
