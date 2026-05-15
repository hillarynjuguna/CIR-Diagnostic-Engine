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
            Describe Your System
          </h2>
          <p className="text-sm text-ink-muted">
            What does it do? What tools, APIs, or agents does it use? What&apos;s the most important
            thing it shouldn&apos;t be allowed to do? Who can stop it if something goes wrong?
            What happens between a decision and an action — is there a gate, or does it just run?
            The more specific you are, the more useful the results. If you&apos;re not sure about
            something, that&apos;s itself a finding — we&apos;ll flag it.
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
          { name: 'Reversibility & Safeguards', question: 'Can you undo mistakes? Do you have to approve important actions before they run, or do they just execute?' },
          { name: 'Component Boundaries', question: 'When your tools and agents connect to each other, does each one know what the other expects — or are they just passing data and hoping?' },
          { name: 'Rules That Stay True', question: 'You wrote rules for how your system should behave. Are those rules still accurate? Would you know if they drifted?' },
          { name: 'Who Decides What', question: 'When a decision needs to be made about how your system operates, is it clear who has authority? Is it documented?' },
        ].map(p => (
          <div key={p.name} className="rounded-lg border border-surface-border bg-surface-raised p-4">
            <div className="mb-2 font-mono text-xs font-semibold text-ink-secondary">{p.name}</div>
            <div className="font-mono text-xs text-ink-muted leading-relaxed">{p.question}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
