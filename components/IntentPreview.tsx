'use client'

import type { ScanMode } from '@/app/page'

interface Props {
  description: string
  mode: ScanMode
  onBeginScan: () => void
  onEdit: () => void
}

const DIMENSIONS = [
  {
    name: 'Reversibility & Safeguards',
    detail: 'Can mistakes be undone? Are irreversible actions gated?',
  },
  {
    name: 'Component Boundaries',
    detail: 'When tools connect, does each know what the other expects?',
  },
  {
    name: 'Rules That Stay True',
    detail: 'If your policies changed, would anyone notice?',
  },
  {
    name: 'Who Decides What',
    detail: 'When something needs to change, is it clear who has authority?',
  },
]

export default function IntentPreview({ description, mode, onBeginScan, onEdit }: Props) {
  const preview = description.length > 200
    ? description.slice(0, 200).trimEnd() + '…'
    : description

  return (
    <div className="space-y-4">
      {/* Description preview */}
      <div className="rounded-lg border border-surface-border bg-surface-raised p-5">
        <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Architecture Description
        </div>
        <p className="font-mono text-sm leading-relaxed text-ink-secondary">{preview}</p>
        <button
          onClick={onEdit}
          className="mt-3 font-mono text-xs text-ink-muted hover:text-ink-secondary transition-colors"
        >
          Edit description →
        </button>
      </div>

      {/* Intent Preview card */}
      <div className="rounded-lg border border-surface-border bg-surface-raised p-6">
        <h2 className="mb-1 font-sans text-xl font-semibold text-ink-primary">
          Ready to scan your architecture.
        </h2>
        <p className="mb-6 text-sm text-ink-secondary">
          We&apos;ll analyse it across four structural dimensions.
          {mode === 'quick'
            ? ' You selected Quick Scan — you\'ll see the headlines.'
            : ' You selected Deep Diagnostic — you\'ll get the full picture with evidence.'}
        </p>

        <div className="space-y-4 mb-8">
          {DIMENSIONS.map((d, i) => (
            <div key={d.name} className="flex gap-4">
              <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-accent-amber/60 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-accent-amber" />
              </div>
              <div>
                <div className="font-sans text-sm font-semibold text-ink-primary">{d.name}</div>
                <div className="mt-0.5 font-mono text-xs text-ink-muted">{d.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-md border border-surface-border bg-surface-overlay px-4 py-3 font-mono text-xs text-ink-muted">
          Extraction and scoring are deterministic. The model maps. The engine classifies.
          {mode === 'deep' && ' Full evidence citations included.'}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBeginScan}
            className="rounded-md bg-accent-amber px-6 py-2.5 font-mono text-sm font-semibold text-surface-base transition-colors hover:bg-amber-400"
          >
            Begin Scan
          </button>
          <button
            onClick={onEdit}
            className="rounded-md border border-surface-border px-6 py-2.5 font-mono text-sm text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink-primary"
          >
            Edit Description
          </button>
        </div>
      </div>
    </div>
  )
}
