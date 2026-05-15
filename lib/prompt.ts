// lib/prompt.ts
// The evaluation prompt now operates on pre-computed primitive scores
// derived from the extraction layer — not blank-slate LLM scoring.
// The model is given the extraction results and asked to produce narrative analysis,
// failure pattern prediction, and remediation priorities.
// It does NOT produce the scores. Scores are computed deterministically.

import type { PrimitivePresence } from './types'

export function buildNarrativePrompt(
  architectureDescription: string,
  presenceMatrix: PrimitivePresence[],
  scores: Record<string, number>
): string {
  const primitiveContext = presenceMatrix
    .map(p => {
      const score = scores[p.primitiveId] || 0
      return `
PRIMITIVE: ${p.primitiveId}
Deterministically computed score: ${score}/100
Presence: ${p.present ? 'YES (architecturally enforced)' : 'NO'}
Mechanism type: ${p.mechanismType}
Evidence quality: ${p.evidenceQuality}
Evidence citations: ${p.evidenceCitations.join('; ') || 'None'}
`
    })
    .join('\n')

  return `You are a constitutional governance analysis engine completing a structural audit.

The extraction phase has already determined the presence matrix for the four CIR primitives. Scores have been computed deterministically from this matrix. Your task is to provide:

1. Narrative analysis for each primitive (specific to THIS architecture, not generic)
2. Detected weaknesses (concrete gaps, not principles)
3. Predicted failure patterns (reference: PocketOS April 2026 — agent deleted production DB in 9 seconds despite explicit safety rules; Flash Crash 2010; Mata v. Avianca 2023)
4. Remediation recommendations (architectural changes only — not policy updates, not better prompts)
5. Risk matrix of latent failure modes
6. Executive summary and governance topology assessment

CRITICAL CONSTRAINTS:
- Do not recommend "better prompts" or "more monitoring." Recommend structural changes.
- Do not use: "robust," "holistic," "best-in-class," "comprehensive approach."
- Be specific. Name the architectural component that must exist.
- If this architecture would permit a PocketOS-class failure (agent deletes production resources in seconds with no gate), state it directly.
- The scores are fixed. Do not contradict or re-score.

PRIMITIVE EXTRACTION RESULTS:
${primitiveContext}

OVERALL SCORE: ${Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)}/100

Return ONLY valid JSON:

{
  "executiveSummary": "2-4 sentences. State the governance posture plainly.",
  "primitiveNarratives": {
    "bounded-verifiability-latency": {
      "explanation": "2-4 sentences specific to this architecture",
      "detectedWeaknesses": ["at least 2 specific gaps"],
      "predictedFailurePatterns": ["at least 2 production failure scenarios"],
      "remediationRecommendations": ["at least 2 architectural changes"]
    },
    "explicit-compositional-contracts": {
      "explanation": "...", "detectedWeaknesses": [], "predictedFailurePatterns": [], "remediationRecommendations": []
    },
    "continuous-deterministic-layer-regression": {
      "explanation": "...", "detectedWeaknesses": [], "predictedFailurePatterns": [], "remediationRecommendations": []
    },
    "dual-ownership": {
      "explanation": "...", "detectedWeaknesses": [], "predictedFailurePatterns": [], "remediationRecommendations": []
    }
  },
  "riskMatrix": [
    {
      "failureMode": "Name",
      "likelihood": "CRITICAL|HIGH|MEDIUM|LOW",
      "impact": "CRITICAL|HIGH|MEDIUM|LOW",
      "affectedPrimitives": ["primitive-id"],
      "description": "One sentence."
    }
  ],
  "latentInstabilities": ["at least 2 recursive instability patterns"],
  "remediationPriorities": ["3-5 ordered by consequence severity"],
  "topologyAssessment": "2-4 sentences on where authority lives, where verification occurs, where gaps exist"
}

ARCHITECTURE DESCRIPTION:
${architectureDescription}`
}
