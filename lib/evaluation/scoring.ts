// lib/evaluation/scoring.ts
// Doc3+4: The central architectural innovation — scores are COMPUTED, not GENERATED.
// The model extracts. The scoring engine is the constitutional authority.
// This inverts the standard pattern where the LLM produces a number on a scale.

import type { PrimitivePresence, SeverityLevel, GovernabilityClassification } from '../types'

// Deterministic score from presence matrix
// The branching logic encodes the CIR framework's scoring rubric mechanically
export function computeScoreFromPresence(assessment: PrimitivePresence): number {
  if (!assessment.present) {
    // Absent — differentiate by what governance exists
    switch (assessment.mechanismType) {
      case 'policy':      return 15  // System prompt / behavioral instruction only
      case 'procedural':  return 10  // Human process, no system enforcement
      case 'undefined':   return 5   // Nothing described — assume worst
      default:            return 5
    }
  }

  // Present — score reflects enforcement strength and evidence quality
  if (assessment.mechanismType !== 'architectural') {
    // Present but not at the architectural layer — governance is nominal
    return 40
  }

  // Architecturally enforced — differentiate by evidence quality
  switch (assessment.evidenceQuality) {
    case 'strong':   return 85  // Explicitly described, structurally enforced
    case 'moderate': return 70  // Implied by described behavior
    case 'weak':     return 55  // Absence of contradiction, assumed present
    default:         return 45
  }
}

export function classifySeverity(score: number): SeverityLevel {
  if (score <= 20) return 'CRITICAL'
  if (score <= 40) return 'HIGH'
  if (score <= 60) return 'MEDIUM'
  return 'LOW'
}

export function classifyGovernability(score: number): GovernabilityClassification {
  if (score >= 80) return 'GOVERNED'
  if (score >= 50) return 'PARTIALLY GOVERNED'
  if (score >= 30) return 'MANAGED'
  return 'UNGOVERNED'
}

export function computeOverallScore(scores: number[]): number {
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

// Name lookup for canonical primitive names
export const PRIMITIVE_NAMES: Record<string, string> = {
  'bounded-verifiability-latency': 'Bounded Verifiability Latency',
  'explicit-compositional-contracts': 'Explicit Compositional Contracts',
  'continuous-deterministic-layer-regression': 'Continuous Deterministic Layer Regression',
  'dual-ownership': 'Dual Ownership',
}
