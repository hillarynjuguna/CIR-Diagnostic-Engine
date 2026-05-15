// lib/evaluation/confidence.ts
// Doc4: The core epistemics insight — confidence is not monolithic.
// A model may be highly confident that the description lacks BVL,
// while the description itself is a self-reported narrative with no evidence.
// These are fundamentally different claims and must be separated.

import type { PrimitivePresence, DecomposedConfidence } from '../types'

// Architectural markers: language patterns that indicate structural enforcement
// rather than policy statements
const ARCHITECTURAL_MARKERS = [
  'api gateway', 'permission system', 'sandbox', 'pre-execution',
  'validation gate', 'circuit breaker', 'kill switch',
  'approval required before', 'canary deployment',
  'staging environment', 'read-only', 'append-only', 'immutable log',
  'hash chain', 'cryptographic signature', 'ed25519', 'jwt',
  'permit', 'token scope', 'reversibility', 'r0', 'r1', 'r2', 'r3',
  'rollback window', 'pre-flight', 'authz', 'authorization gate',
  'action classification', 'execution boundary',
]

// Self-report markers: language patterns indicating policy governance, not architectural
const SELF_REPORT_MARKERS = [
  'we require', 'our policy', 'should not', 'must not',
  'are instructed', 'system prompt', 'responsible for',
  'trained to', 'expected to', 'told not to', 'guidelines state',
  'we have a rule', 'the model is instructed',
]

export function decomposeConfidence(
  assessment: PrimitivePresence,
  architectureDescription: string
): DecomposedConfidence {
  const warnings: string[] = []
  const desc = architectureDescription.toLowerCase()

  // === Extraction Confidence ===
  // How clearly could the model map the description to the primitive?
  const extractionConfidence =
    assessment.evidenceQuality === 'strong' ? 0.90 :
    assessment.evidenceQuality === 'moderate' ? 0.70 :
    assessment.evidenceQuality === 'weak' ? 0.45 : 0.30

  // === Evidence Confidence ===
  // How trustworthy is the source material itself?
  // Default: self-reported, unverified description
  let evidenceConfidence = 0.50

  const architecturalCount = ARCHITECTURAL_MARKERS.filter(m => desc.includes(m)).length
  const selfReportCount = SELF_REPORT_MARKERS.filter(m => desc.includes(m)).length

  if (architecturalCount >= 4) {
    evidenceConfidence = 0.75
  } else if (architecturalCount >= 2) {
    evidenceConfidence = 0.62
  }

  if (selfReportCount >= 3 && architecturalCount === 0) {
    evidenceConfidence = Math.min(evidenceConfidence, 0.35)
    warnings.push(
      'Architecture description relies heavily on policy language with no architectural enforcement markers detected. Scores reflect policy governance, not structural governance.'
    )
  }

  if (assessment.evidenceCitations.length === 0) {
    evidenceConfidence = Math.min(evidenceConfidence, 0.40)
    warnings.push('No evidence citations returned by extraction model.')
  }

  // === Governance Confidence ===
  // Composite: bounded above by both extraction confidence and evidence confidence
  // mechanismType further constrains — policy governance cannot produce high governance confidence
  const mechanismCeiling =
    assessment.mechanismType === 'architectural' ? 0.88 :
    assessment.mechanismType === 'policy' ? 0.50 :
    assessment.mechanismType === 'procedural' ? 0.35 : 0.20

  const governanceConfidence = Math.min(
    extractionConfidence,
    evidenceConfidence,
    mechanismCeiling
  )

  if (governanceConfidence < 0.40) {
    warnings.push(
      'Low governance confidence. Architectural enforcement cannot be verified from the provided description. The CIR engine assesses descriptions, not deployed systems.'
    )
  }

  return {
    extractionConfidence: round2(extractionConfidence),
    evidenceConfidence: round2(evidenceConfidence),
    governanceConfidence: round2(governanceConfidence),
    warnings,
  }
}

function round2(val: number): number {
  return Math.round(val * 100) / 100
}
