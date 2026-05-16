// lib/providers/router.ts
// Doc3: Capability-aware selection (replaces Doc2's sequential fallback)
// Doc4: Dimension-specific routing — extraction vs verification tasks weight differently

import type { GovernanceProvider } from './types'
import { loadWeights } from './store'

// Hydrate provider weights from persistent store on cold start
export async function hydrateWeights(providers: GovernanceProvider[]): Promise<void> {
  const stored = await loadWeights()
  if (!stored) return

  for (const provider of providers) {
    const storedProvider = stored[provider.name]
    if (storedProvider) {
      provider.weights.structuralReliability = storedProvider.structuralReliability
      provider.weights.interpretiveReliability = storedProvider.interpretiveReliability
      provider.weights.latencyReliability = storedProvider.latencyReliability
      provider.weights.schemaReliability = storedProvider.schemaReliability
      provider.status.consecutiveFailures = storedProvider.consecutiveFailures
    }
  }
}

export function getAvailableProviders(providers: GovernanceProvider[]): GovernanceProvider[] {
  return providers.filter(p => {
    if (!p.status.available) return false
    if (p.status.backoffUntil && Date.now() < p.status.backoffUntil) return false
    if (p.status.consecutiveFailures >= 3) return false
    if (!p.key) return false
    return true
  })
}

// Doc4: Extraction task routing
// Prioritizes structural + schema reliability — extraction is mapping, not judging
export function selectExtractionProvider(providers: GovernanceProvider[]): GovernanceProvider | null {
  const available = getAvailableProviders(providers)
  if (available.length === 0) return null

  const scored = available.map(p => ({
    provider: p,
    score:
      p.weights.structuralReliability * 0.40 +
      p.weights.schemaReliability * 0.35 +
      p.weights.latencyReliability * 0.15 +
      p.weights.interpretiveReliability * 0.10,
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored[0].provider
}

// Doc4: Evaluation task routing
// Prioritizes interpretive + structural reliability equally
// Must select a DIFFERENT provider than extraction when possible
export function selectEvaluationProvider(
  providers: GovernanceProvider[],
  excludeName?: string
): GovernanceProvider | null {
  const available = getAvailableProviders(providers).filter(
    p => !excludeName || p.name !== excludeName
  )
  // If no alternative, fall back to same provider
  const pool = available.length > 0 ? available : getAvailableProviders(providers)
  if (pool.length === 0) return null

  const scored = pool.map(p => ({
    provider: p,
    score:
      p.weights.interpretiveReliability * 0.40 +
      p.weights.structuralReliability * 0.30 +
      p.weights.schemaReliability * 0.20 +
      p.weights.latencyReliability * 0.10,
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored[0].provider
}

// Doc4: Weight evolution — dimension-specific, not aggregate
// This prevents "clean JSON" providers from capturing all authority
export function updateWeights(
  provider: GovernanceProvider,
  outcome: {
    type: 'success' | 'schema_failure' | 'parse_failure' | 'timeout' | 'interpretive_mismatch'
    metadata?: {
      extractionQuality?: number
      schemaDeviation?: boolean
    }
  }
) {
  const w = provider.weights

  switch (outcome.type) {
    case 'success':
      w.structuralReliability = clamp(w.structuralReliability + 0.01)
      w.schemaReliability = clamp(w.schemaReliability + 0.01)
      provider.status.consecutiveFailures = 0
      break

    case 'interpretive_mismatch':
      // Provider returned valid JSON but governance interpretation diverged materially
      w.interpretiveReliability = clamp(w.interpretiveReliability - 0.03, 0.1)
      provider.status.consecutiveFailures++
      break

    case 'schema_failure':
      w.structuralReliability = clamp(w.structuralReliability - 0.05, 0.1)
      w.schemaReliability = clamp(w.schemaReliability - 0.04, 0.1)
      provider.status.consecutiveFailures++
      break

    case 'parse_failure':
      w.structuralReliability = clamp(w.structuralReliability - 0.03, 0.1)
      provider.status.consecutiveFailures++
      break

    case 'timeout':
      w.latencyReliability = clamp(w.latencyReliability - 0.06, 0.1)
      provider.status.consecutiveFailures++
      provider.status.backoffUntil = Date.now() + 30_000
      break
  }

  // Round to prevent float accumulation
  for (const key of Object.keys(w) as Array<keyof typeof w>) {
    w[key] = Math.round(w[key] * 100) / 100
  }
}

function clamp(val: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, val))
}
