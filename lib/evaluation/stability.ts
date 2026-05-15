// lib/evaluation/stability.ts
// Doc3: The stability layer does not attempt to resolve provider disagreement.
// It NAMES it and surfaces it. Governed interpretation, not governance oracle.
// "The engine knows when its evaluators disagree. It tells the user."

import type { DiagnosticReport, StabilityAssessment } from '../types'
import { classifyGovernability } from './scoring'

export function checkStability(
  primary: DiagnosticReport,
  primaryProvider: string,
  verification?: DiagnosticReport,
  verificationProvider?: string
): StabilityAssessment {
  const warnings: string[] = []

  // 1. Internal consistency — high variance across primitives signals unreliable extraction
  const scores = primary.primitiveAssessments.map(a => a.score)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)

  if (stdDev > 20) {
    warnings.push(
      `High internal variance detected (σ=${stdDev.toFixed(1)}). Primitive assessments show unusual spread — extraction may be inconsistent across the four primitives.`
    )
  }

  // 2. Classification coherence
  const derivedClassification = classifyGovernability(primary.overallScore)
  if (derivedClassification !== primary.governabilityClassification) {
    warnings.push(
      `Classification coherence check failed: score ${primary.overallScore} maps to ${derivedClassification} but report states ${primary.governabilityClassification}.`
    )
  }

  // 3. Cross-provider disagreement
  if (verification && verificationProvider && primaryProvider !== verificationProvider) {
    const divergentFields: string[] = []

    if (Math.abs(primary.overallScore - verification.overallScore) > 15) {
      divergentFields.push('overallScore')
    }

    for (let i = 0; i < primary.primitiveAssessments.length; i++) {
      const pa = primary.primitiveAssessments[i]
      const va = verification.primitiveAssessments[i]
      if (va && Math.abs(pa.score - va.score) > 20) {
        divergentFields.push(pa.primitiveName)
      }
    }

    if (divergentFields.length > 0) {
      const severity: 'minor' | 'moderate' | 'major' =
        divergentFields.includes('overallScore') ? 'major' :
        divergentFields.length > 1 ? 'moderate' : 'minor'

      warnings.push(
        `Provider disagreement on: ${divergentFields.join(', ')}. Treat affected assessments as provisional.`
      )

      return {
        passed: severity !== 'major',
        warnings,
        providerDisagreement: {
          primaryProvider,
          verificationProvider,
          divergentFields,
          severity,
        },
      }
    }
  }

  return { passed: true, warnings }
}
