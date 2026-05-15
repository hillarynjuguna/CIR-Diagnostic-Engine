'use client'

import { useState } from 'react'

interface Props {
  onSubmit: (description: string) => void
  error: string | null
}

const EXAMPLE_DESCRIPTION = `We have deployed an LLM-based coding agent that can read, write, and execute code in our production environment. The agent is gated behind a system prompt that instructs it not to delete production databases or run destructive operations. Developers review the agent's proposed changes before merging to main. We use standard observability tooling to monitor outputs. There is no pre-execution validation gate between the agent's reasoning and its tool execution. API tokens are scoped at the repository level but not at the action level. The same token that allows reading files also allows deleting volumes. There is no classification of actions by reversibility. Our policy requires human review but this review happens after the agent has already executed code in staging.`

export default function ArchitectureInput({ onSubmit, error }: Props) {
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (description.trim().length >= 50) {
      onSubmit(description.trim())
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-surface-border bg-surface-raised p-8">
        <div className="mb-6">
          <h2 className="mb-2 font-mono text-sm font-semibold uppercase tracking-wider text-ink-secondary">
            Architecture Description
          </h2>
          <p className="text-sm text-ink-muted">
            Describe your AI deployment architecture. Include: what agents exist, what actions
            they can take, what governance mechanisms are in place, how authorization works,
            how monitoring functions, where humans sit in the decision loop, and what happens
            between an agent's reasoning and its execution of consequential actions.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={EXAMPLE_DESCRIPTION}
            className="min-h-[240px] w-full rounded-md border border-surface-border bg-surface-base px-4 py-3 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent-amber focus:outline-none focus:ring-1 focus:ring-accent-amber"
            spellCheck={false}
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs text-ink-muted">
              {description.length} chars {description.length < 50 && `(${50 - description.length} more needed)`}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDescription(EXAMPLE_DESCRIPTION)}
                className="font-mono text-xs text-ink-muted hover:text-ink-secondary transition-colors"
              >
                Load example
              </button>
              <button
                type="submit"
                disabled={description.trim().length < 50}
                className="rounded-md bg-accent-amber px-6 py-2.5 font-mono text-sm font-semibold text-surface-base transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Run Diagnostic
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-md border border-accent-red/30 bg-accent-red/10 px-4 py-3 font-mono text-sm text-accent-red">
            {error}
          </div>
        )}
      </div>

      {/* What the engine evaluates */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { id: 'BVL', name: 'Bounded Verifiability Latency', question: 'Can verification occur before operational drift compounds?' },
          { id: 'ECC', name: 'Explicit Compositional Contracts', question: 'Are agent behavioral boundaries mechanically enforced?' },
          { id: 'CDLR', name: 'Continuous Deterministic Regression', question: 'Are policy layers continuously tested for drift?' },
          { id: 'DO', name: 'Dual Ownership', question: 'Is semantic authority separated from execution authority?' },
        ].map(p => (
          <div key={p.id} className="rounded-lg border border-surface-border bg-surface-raised p-4">
            <div className="mb-1 font-mono text-xs font-bold text-accent-amber">{p.id}</div>
            <div className="mb-2 font-mono text-xs font-semibold text-ink-secondary">{p.name}</div>
            <div className="font-mono text-xs text-ink-muted leading-relaxed">{p.question}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
