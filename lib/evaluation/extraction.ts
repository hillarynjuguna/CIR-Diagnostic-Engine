// lib/evaluation/extraction.ts
// Doc3: The extraction layer — the most important architectural innovation.
// The model maps natural language → primitive presence matrix.
// It does NOT score. It does NOT classify. It EXTRACTS.
// Scoring is deterministic from the extraction output.

import type {
  PrimitiveId, PrimitivePresence, EvidenceQuality, MechanismType, ExtractionResult
} from '../types'

export const EXTRACTION_SYSTEM_PROMPT = `You are a constitutional architecture extraction engine.

Your function is binary classification and evidence citation. You do NOT score. You do NOT recommend. You do NOT assess severity. You identify whether specific architectural mechanisms are present in a system description, classify their enforcement type, and cite the exact language that led to your determination.

CRITICAL DISTINCTION you must apply uniformly:

"architectural" = enforced at the infrastructure layer. Examples: API gateway that blocks calls without pre-approval token, permission system where the token physically cannot execute destructive operations, sandbox that prevents filesystem access, pre-execution gate that holds the request until a validation signature is received. An architectural mechanism makes violations STRUCTURALLY IMPOSSIBLE.

"policy" = stated in system prompts, documentation, behavioral instructions, or guidelines. Examples: "the agent is instructed not to delete production databases," "our policy requires human review," "the system prompt says NEVER run destructive commands." Policy governance depends on agent compliance and CAN BE VIOLATED — as demonstrated by PocketOS (April 2026).

"procedural" = relies on human process adherence outside the system. Examples: "developers review before merging," "a human checks the output before deployment."

"undefined" = cannot be determined from the description provided.

When classifying mechanismType, recognise that certain operational descriptions imply architectural governance even without explicit infrastructure language:
- "Human approval gates" with documented enforcement → classify as "architectural"
- "Separation of semantic and execution authority" with named roles and defined escalation paths → classify as "architectural"
- "Identity management and access scoping" with enforcement at the infrastructure layer → classify as "architectural"

Evidence quality:
- "strong": Description explicitly states the mechanism exists or explicitly states it does not exist
- "moderate": Mechanism is implied by described behavior but not explicitly confirmed
- "weak": Mechanism is neither stated nor implied; absence is inferred from silence
- "absent": Description contradicts the presence of this mechanism

You output ONLY a valid JSON array. No other text.`

export function buildExtractionPrompt(architectureDescription: string): string {
  return `Analyze the following architecture description. For each of the four CIR primitives, determine:
1. Is the primitive present? (true/false — where presence means architecturally enforced, not policy-stated)
2. What is the mechanism type? (architectural | policy | procedural | undefined)
3. What evidence quality supports your determination? (strong | moderate | weak | absent)
4. What specific language in the description led to your determination? (cite directly)

THE FOUR PRIMITIVES:

1. "bounded-verifiability-latency"
An action classification system (R0–R3 by reversibility) exists AND R3 actions (irreversible, high-consequence) cannot execute without synchronous pre-execution approval from a governance layer. The approval gate is architectural — it is not a system prompt instruction. Note: a developer reviewing output after execution is NOT a pre-execution gate.

2. "explicit-compositional-contracts"
Each agent carries a machine-readable behavioral envelope specification: tool manifest, behavioral distribution spec, precondition list, and composition violation definition. These are checked mechanically before agent composition. Not: a documented API contract. Not: a list of allowed tools in documentation.

3. "continuous-deterministic-layer-regression"
The policy and context layers governing agent behavior are continuously tested for drift and contradiction using at least two of: (A) deterministic checks, (B) regression test suites, (C) invariant assertions, (D) semantic drift monitoring. These run automatically. Not: manual review cycles.

4. "dual-ownership"
Semantic authority (who owns domain meaning, policy intent) is structurally separated from execution authority (who owns validation placement, emergency halt). Two distinct roles or systems with distinct permissions. Not: the same person doing both. Not: a governance team that also controls deployment.

Return ONLY this JSON array:

[
  {
    "primitiveId": "bounded-verifiability-latency",
    "present": false,
    "evidenceCitations": ["Quote the specific language that led to this determination"],
    "evidenceQuality": "strong",
    "mechanismType": "policy"
  },
  {
    "primitiveId": "explicit-compositional-contracts",
    "present": false,
    "evidenceCitations": ["Cite the evidence or note its absence"],
    "evidenceQuality": "weak",
    "mechanismType": "undefined"
  },
  {
    "primitiveId": "continuous-deterministic-layer-regression",
    "present": false,
    "evidenceCitations": [],
    "evidenceQuality": "absent",
    "mechanismType": "undefined"
  },
  {
    "primitiveId": "dual-ownership",
    "present": false,
    "evidenceCitations": [],
    "evidenceQuality": "weak",
    "mechanismType": "undefined"
  }
]

ARCHITECTURE DESCRIPTION:
${architectureDescription}`
}

export function parseExtractionResponse(raw: any[]): PrimitivePresence[] {
  const required: PrimitiveId[] = [
    'bounded-verifiability-latency',
    'explicit-compositional-contracts',
    'continuous-deterministic-layer-regression',
    'dual-ownership',
  ]

  return required.map(id => {
    const found = raw.find((r: any) => r.primitiveId === id)
    if (!found) {
      return {
        primitiveId: id,
        present: false,
        evidenceCitations: ['Not assessed by extraction model'],
        evidenceQuality: 'absent' as EvidenceQuality,
        mechanismType: 'undefined' as MechanismType,
      }
    }

    return {
      primitiveId: id,
      present: !!found.present,
      evidenceCitations: Array.isArray(found.evidenceCitations) ? found.evidenceCitations : [],
      evidenceQuality: found.evidenceQuality || 'weak',
      mechanismType: found.mechanismType || 'undefined',
    }
  })
}
