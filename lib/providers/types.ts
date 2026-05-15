// lib/providers/types.ts
// Doc3: GovernanceProvider interface
// Doc4: Separated weight dimensions prevent routing centralization on "clean JSON" providers

import type { ProviderWeights } from '../types'

export interface GovernanceProvider {
  name: string
  url: string
  key: string
  model: string

  // Doc4: Capability profile for dimension-aware routing
  capabilities: {
    structuredOutputReliability: number   // 0-1: JSON schema adherence
    reasoningReliability: number          // 0-1: governance analysis depth
    maxContextWindow: number              // tokens
    latencyClass: 'fast' | 'medium' | 'slow'
    supportsSystemPrompt: boolean
    knownFailureModes: string[]           // 'over-severity', 'under-severity', 'hallucination', 'schema-drift'
  }

  // Separated weight dimensions (Doc4)
  weights: ProviderWeights

  // Operational state (circuit breaker pattern from Doc2)
  status: {
    available: boolean
    lastError: string | null
    consecutiveFailures: number
    backoffUntil: number | null           // Unix timestamp
    quotaRemaining: number | null
  }

  // Transform functions for provider-specific schemas
  buildBody: (systemPrompt: string, userPrompt: string) => object
  extractText: (response: any) => string | null
  buildUrl: () => string
  buildHeaders: () => Record<string, string>
}
