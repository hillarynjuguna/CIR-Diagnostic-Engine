'use client'

import type { RiskMatrixEntry } from '@/lib/types'

interface Props {
  entries: RiskMatrixEntry[]
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-accent-red/20 text-accent-red border-accent-red/30',
  HIGH: 'bg-accent-amber/20 text-accent-amber border-accent-amber/30',
  MEDIUM: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30',
  LOW: 'bg-accent-green/20 text-accent-green border-accent-green/30',
}

export default function RiskMatrix({ entries }: Props) {
  if (entries.length === 0) return null

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-6">
      <h3 className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-ink-secondary">
        Operational Risk Matrix
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="border-b border-surface-border text-left text-ink-muted">
              <th className="pb-2 pr-4 font-semibold">Failure Mode</th>
              <th className="pb-2 pr-4 font-semibold">Likelihood</th>
              <th className="pb-2 pr-4 font-semibold">Impact</th>
              <th className="pb-2 font-semibold">Primitives</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={i} className="border-b border-surface-border/50">
                <td className="py-3 pr-4 text-ink-primary">
                  <div className="font-semibold">{entry.failureMode}</div>
                  <div className="mt-0.5 text-ink-muted">{entry.description}</div>
                </td>
                <td className="py-3 pr-4">
                  <span className={`inline-block rounded border px-2 py-0.5 ${SEVERITY_COLORS[entry.likelihood] || ''}`}>
                    {entry.likelihood}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className={`inline-block rounded border px-2 py-0.5 ${SEVERITY_COLORS[entry.impact] || ''}`}>
                    {entry.impact}
                  </span>
                </td>
                <td className="py-3 text-ink-secondary">
                  {entry.affectedPrimitives.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
