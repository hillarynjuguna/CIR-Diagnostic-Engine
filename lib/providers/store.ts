// Persistent provider weight store using Vercel KV
// Falls back to in-memory if KV is unavailable

const STORE_KEY = 'cir:provider-weights:v1'

interface StoredWeights {
  [providerName: string]: {
    structuralReliability: number
    interpretiveReliability: number
    latencyReliability: number
    schemaReliability: number
    consecutiveFailures: number
    lastUpdated: string
  }
}

// In-memory fallback
let memoryStore: StoredWeights | null = null

async function getKVStore(): Promise<StoredWeights | null> {
  try {
    const { kv } = await import('@vercel/kv')
    const data = await kv.get(STORE_KEY)
    return data as StoredWeights | null
  } catch {
    return null
  }
}

async function setKVStore(weights: StoredWeights): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(STORE_KEY, weights)
    memoryStore = weights
  } catch {
    memoryStore = weights // fallback to memory
  }
}

export async function loadWeights(): Promise<StoredWeights | null> {
  const kvData = await getKVStore()
  if (kvData) return kvData
  return memoryStore // fallback to memory if KV unavailable
}

export async function saveWeights(weights: StoredWeights): Promise<void> {
  await setKVStore(weights)
}

export async function recordProviderOutcome(
  providerName: string,
  outcome: 'success' | 'schema_failure' | 'parse_failure' | 'timeout' | 'interpretive_mismatch'
): Promise<void> {
  const weights = (await loadWeights()) || {}
  const current = weights[providerName] || {
    structuralReliability: 0.7,
    interpretiveReliability: 0.7,
    latencyReliability: 0.7,
    schemaReliability: 0.7,
    consecutiveFailures: 0,
    lastUpdated: new Date().toISOString(),
  }

  // Apply the same weight evolution logic as lib/providers/weights.ts
  switch (outcome) {
    case 'success':
      current.structuralReliability = Math.min(1.0, current.structuralReliability + 0.01)
      current.schemaReliability = Math.min(1.0, current.schemaReliability + 0.01)
      current.consecutiveFailures = 0
      break
    case 'interpretive_mismatch':
      current.interpretiveReliability = Math.max(0.1, current.interpretiveReliability - 0.03)
      break
    case 'schema_failure':
      current.structuralReliability = Math.max(0.1, current.structuralReliability - 0.05)
      current.schemaReliability = Math.max(0.1, current.schemaReliability - 0.04)
      current.consecutiveFailures++
      break
    case 'parse_failure':
      current.structuralReliability = Math.max(0.1, current.structuralReliability - 0.03)
      current.consecutiveFailures++
      break
    case 'timeout':
      current.latencyReliability = Math.max(0.1, current.latencyReliability - 0.06)
      current.consecutiveFailures++
      break
  }

  current.lastUpdated = new Date().toISOString()
  weights[providerName] = current
  await saveWeights(weights)
}
