// lib/providers/registry.ts
// Doc2: Free-tier provider ecosystem (~1.3B tokens/month aggregate)
// Doc3: Capability profiles for intelligent routing
// Doc4: Separated weights — structural vs interpretive reliability

import type { GovernanceProvider } from './types'

const SYSTEM_PROMPT = 'You are a constitutional governance analysis engine. You output ONLY valid JSON. You never output markdown, commentary, or explanatory text outside the JSON structure. Your analysis is clinical, precise, and infrastructure-oriented.'

function openaiCompatibleBody(systemPrompt: string, userPrompt: string, model: string) {
  return {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 4096,
  }
}

function openaiExtract(response: any): string | null {
  return response?.choices?.[0]?.message?.content || null
}

// Provider registry — ordered by Doc2 priority (capability + reliability)
export function createProviderRegistry(): GovernanceProvider[] {
  return [
    {
      name: 'mistral',
      url: 'https://api.mistral.ai/v1/chat/completions',
      key: process.env.MISTRAL_API_KEY || '',
      model: 'mistral-large-latest',
      capabilities: {
        structuredOutputReliability: 0.88,
        reasoningReliability: 0.86,
        maxContextWindow: 128000,
        latencyClass: 'medium',
        supportsSystemPrompt: true,
        knownFailureModes: ['moderate-schema-drift'],
      },
      weights: {
        structuralReliability: 0.88,
        interpretiveReliability: 0.86,
        latencyReliability: 0.80,
        schemaReliability: 0.85,
      },
      status: {
        available: true, lastError: null, consecutiveFailures: 0,
        backoffUntil: null, quotaRemaining: null,
      },
      buildBody: (sys, user) => openaiCompatibleBody(sys, user, 'mistral-large-latest'),
      extractText: openaiExtract,
      buildUrl: () => 'https://api.mistral.ai/v1/chat/completions',
      buildHeaders: function() {
        return { 'Content-Type': 'application/json', Authorization: `Bearer ${this.key}` }
      },
    },

    {
      name: 'gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      key: process.env.GEMINI_API_KEY || '',
      model: 'gemini-2.0-flash',
      capabilities: {
        structuredOutputReliability: 0.82,
        reasoningReliability: 0.85,
        maxContextWindow: 1048576,
        latencyClass: 'fast',
        supportsSystemPrompt: true,
        knownFailureModes: ['occasional-markdown-wrapper', 'over-severity'],
      },
      weights: {
        structuralReliability: 0.82,
        interpretiveReliability: 0.85,
        latencyReliability: 0.90,
        schemaReliability: 0.78,
      },
      status: {
        available: true, lastError: null, consecutiveFailures: 0,
        backoffUntil: null, quotaRemaining: null,
      },
      buildBody: (sys, user) => ({
        contents: [{ parts: [{ text: `${sys}\n\n${user}` }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
      }),
      extractText: (data) => data?.candidates?.[0]?.content?.parts?.[0]?.text || null,
      buildUrl: function() {
        return `${this.url}?key=${this.key}`
      },
      buildHeaders: () => ({ 'Content-Type': 'application/json' }),
    },

    {
      name: 'groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key: process.env.GROQ_API_KEY || '',
      model: 'llama-3.3-70b-versatile',
      capabilities: {
        structuredOutputReliability: 0.80,
        reasoningReliability: 0.78,
        maxContextWindow: 128000,
        latencyClass: 'fast',
        supportsSystemPrompt: true,
        knownFailureModes: ['under-severity', 'surface-level-extraction'],
      },
      weights: {
        structuralReliability: 0.80,
        interpretiveReliability: 0.78,
        latencyReliability: 0.95,
        schemaReliability: 0.80,
      },
      status: {
        available: true, lastError: null, consecutiveFailures: 0,
        backoffUntil: null, quotaRemaining: null,
      },
      buildBody: (sys, user) => openaiCompatibleBody(sys, user, 'llama-3.3-70b-versatile'),
      extractText: openaiExtract,
      buildUrl: () => 'https://api.groq.com/openai/v1/chat/completions',
      buildHeaders: function() {
        return { 'Content-Type': 'application/json', Authorization: `Bearer ${this.key}` }
      },
    },

    {
      name: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key: process.env.OPENROUTER_API_KEY || '',
      model: 'qwen/qwen3-235b-a22b:free',
      capabilities: {
        structuredOutputReliability: 0.83,
        reasoningReliability: 0.84,
        maxContextWindow: 128000,
        latencyClass: 'medium',
        supportsSystemPrompt: true,
        knownFailureModes: ['rate-limit-sensitive'],
      },
      weights: {
        structuralReliability: 0.83,
        interpretiveReliability: 0.84,
        latencyReliability: 0.72,
        schemaReliability: 0.82,
      },
      status: {
        available: true, lastError: null, consecutiveFailures: 0,
        backoffUntil: null, quotaRemaining: null,
      },
      buildBody: (sys, user) => openaiCompatibleBody(sys, user, 'qwen/qwen3-235b-a22b:free'),
      extractText: openaiExtract,
      buildUrl: () => 'https://openrouter.ai/api/v1/chat/completions',
      buildHeaders: function() {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.key}`,
          'HTTP-Referer': 'https://cir-diagnostic-engine.vercel.app',
          'X-Title': 'CIR Diagnostic Engine',
        }
      },
    },

    {
      // DeepSeek V4 on NVIDIA NIM — the mu-node evaluated on its own substrate
      name: 'nvidia-deepseek',
      url: 'https://integrate.api.nvidia.com/v1/chat/completions',
      key: process.env.NVIDIA_API_KEY || '',
      model: 'deepseek-ai/deepseek-r1',
      capabilities: {
        structuredOutputReliability: 0.79,
        reasoningReliability: 0.91,
        maxContextWindow: 64000,
        latencyClass: 'slow',
        supportsSystemPrompt: true,
        knownFailureModes: ['extended-thinking-preamble', 'latency-variance'],
      },
      weights: {
        structuralReliability: 0.79,
        interpretiveReliability: 0.91,
        latencyReliability: 0.60,
        schemaReliability: 0.76,
      },
      status: {
        available: true, lastError: null, consecutiveFailures: 0,
        backoffUntil: null, quotaRemaining: null,
      },
      buildBody: (sys, user) => openaiCompatibleBody(sys, user, 'deepseek-ai/deepseek-r1'),
      extractText: openaiExtract,
      buildUrl: () => 'https://integrate.api.nvidia.com/v1/chat/completions',
      buildHeaders: function() {
        return { 'Content-Type': 'application/json', Authorization: `Bearer ${this.key}` }
      },
    },
  ]
}
