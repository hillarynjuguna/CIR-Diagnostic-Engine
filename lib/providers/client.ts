// lib/providers/client.ts
// Doc3: SDK-free fetch-based client — every provider speaks native OpenAI-compatible or has a thin translation layer
// No @anthropic-ai/sdk dependency required

import type { GovernanceProvider } from './types'
import { updateWeights } from './router'

export async function callProvider(
  provider: GovernanceProvider,
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  try {
    const body = provider.buildBody(systemPrompt, userPrompt)
    const headers = provider.buildHeaders()
    const url = provider.buildUrl()

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '')
      console.error(`[${provider.name}] HTTP ${res.status}: ${errorBody.slice(0, 200)}`)
      provider.status.lastError = `HTTP ${res.status}`
      updateWeights(provider, { type: 'schema_failure' })
      return null
    }

    const data = await res.json()
    const text = provider.extractText(data)

    if (!text) {
      provider.status.lastError = 'Empty extraction'
      updateWeights(provider, { type: 'parse_failure' })
      return null
    }

    updateWeights(provider, { type: 'success' })
    return text
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      provider.status.lastError = 'Timeout'
      updateWeights(provider, { type: 'timeout' })
    } else {
      provider.status.lastError = err?.message || 'Unknown error'
      updateWeights(provider, { type: 'parse_failure' })
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// Attempt providers in weighted order until one returns a parseable result
export async function callWithFallback(
  providers: GovernanceProvider[],
  systemPrompt: string,
  userPrompt: string,
  parse: (text: string) => any
): Promise<{ result: any; providerName: string } | null> {
  for (const provider of providers) {
    if (!provider.key) continue
    if (provider.status.backoffUntil && Date.now() < provider.status.backoffUntil) continue
    if (provider.status.consecutiveFailures >= 3) continue

    const text = await callProvider(provider, systemPrompt, userPrompt)
    if (!text) continue

    try {
      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()

      // Try direct parse first, then regex extraction
      let parsed: any
      try {
        parsed = JSON.parse(cleaned)
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
        if (!match) continue
        parsed = JSON.parse(match[0])
      }

      const result = parse(parsed)
      return { result, providerName: provider.name }
    } catch {
      updateWeights(provider, { type: 'schema_failure' })
      continue
    }
  }

  return null
}
