'use client'

import { useState } from 'react'
import type { ScanMode } from '@/app/page'

interface Props {
  onSubmit: (description: string, mode: ScanMode) => void
  error: string | null
  initialDescription?: string
}

const EXAMPLE_DESCRIPTION = `We have deployed an LLM-based coding agent that can read, write, and execute code in our production environment. The agent is gated behind a system prompt that instructs it not to delete production databases or run destructive operations. Developers review the agent's proposed changes before merging to main. We use standard observability tooling to monitor outputs. There is no pre-execution validation gate between the agent's reasoning and its tool execution. API tokens are scoped at the repository level but not at the action level — the same token that allows reading files also allows deleting volumes. There is no classification of actions by reversibility. Our policy requires human review but this review happens after the agent has already executed code in staging.`

const DIMENSIONS = [
  {
    name: 'Reversibility & Safeguards',
    question: 'Can you undo mistakes? Are irreversible actions gated?',
  },
  {
    name: 'Component Boundaries',
    question: 'When tools connect, does each know what the other expects?',
  },
  {
    name: 'Rules That Stay True',
    question: 'If your policies changed, would anyone notice?',
  },
  {
    name: 'Who Decides What',
    question: 'When something needs to change, is it clear who has authority?',
  },
]

export default function ArchitectureInput({ onSubmit, error, initialDescription = '' }: Props) {
  const [description, setDescription] = useState(initialDescription)

  const handleSubmit = (mode: ScanMode) => {
    if (description.trim().length >= 50) {
      onSubmit(description.trim(), mode)
    }
  }

  const isReady = description.trim().length >= 50

  return (
    <div className="space-y-6">
      {/* Input panel */}
      <div className="rounded-lg border border-surface-border bg-surface-raised p-8">
        <div className="mb-6">
          <h2 className="mb-2 font-sans text-lg font-semibold text-ink-primary">
            Describe the system you want us to analyse.
          </h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            What does it do? What tools, APIs, or agents does it use? What&apos;s the most important
            thing it shouldn&apos;t be allowed to do? Who can stop it if something goes wrong?
            What happens between a decision and an action — is there a gate, or does it just run?
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            The more specific you are, the more useful the results. If you&apos;re not sure about
            something, that&apos;s itself a finding — we&apos;ll flag it.
          </p>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={EXAMPLE_DESCRIPTION}
          className="min-h-[220px] w-full rounded-md border border-surface-border bg-surface-base px-4 py-3 font-mono text-sm text-ink-primary placeholder:text-ink-muted/50 focus:border-accent-amber focus:outline-none focus:ring-1 focus:ring-accent-amber resize-y"
          spellCheck={false}
        />

        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-xs text-ink-muted">
            {description.length} chars
            {description.length < 50 && (
              <span className="ml-1 text-accent-amber">({50 - description.length} more needed)</span>
            )}
          </span>
          <button
            type="button"
            onClick={() => setDescription(EXAMPLE_DESCRIPTION)}
            className="font-mono text-xs text-ink-muted hover:text-ink-secondary transition-colors"
          >
            Load example
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-accent-red/30 bg-accent-red/10 px-4 py-3 font-mono text-sm text-accent-red">
            {error}
          </div>
        )}

        {/* Autonomy Dial */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            disabled={!isReady}
            onClick={() => handleSubmit('quick')}
            className="group relative rounded-lg border border-surface-border bg-surface-overlay px-5 py-4 text-left transition-all hover:border-ink-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <div className="mb-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-secondary">
              Quick Scan
            </div>
            <div className="font-sans text-sm text-ink-primary">
              Headlines in under 60 seconds.
            </div>
            <div className="mt-1 font-mono text-xs text-ink-muted">
              Four findings. Plain language. Free.
            </div>
          </button>

          <button
            disabled={!isReady}
            onClick={() => handleSubmit('deep')}
            className="group relative rounded-lg border border-accent-amber/40 bg-surface-overlay px-5 py-4 text-left transition-all hover:border-accent-amber disabled:cursor-not-allowed disabled:opacity-40"
          >
            <div className="mb-1 font-mono text-xs font-bold uppercase tracking-wider text-accent-amber">
              Deep Diagnostic
            </div>
            <div className="font-sans text-sm text-ink-primary">
              Full report with evidence.
            </div>
            <div className="mt-1 font-mono text-xs text-ink-muted">
              Risk matrix, remediation priorities, confidence decomposition.
            </div>
          </button>
        </div>
      </div>

      {/* What we analyse */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DIMENSIONS.map((d) => (
          <div key={d.name} className="rounded-lg border border-surface-border bg-surface-raised p-4">
            <div className="mb-1.5 font-sans text-xs font-semibold text-ink-primary">{d.name}</div>
            <div className="font-mono text-xs leading-relaxed text-ink-muted">{d.question}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
