// app/api/evaluate/route.ts
// Full synthesis: Doc1 base → Doc2 multi-provider → Doc3 extraction+stability → Doc4 separated weights
// Two-phase pipeline:
//   Phase 1 (Extraction): Provider A maps architecture → Boolean presence matrix
//   Phase 2 (Narrative): Provider B produces failure analysis anchored to extraction results
//   Phase 3 (Stability): Cross-provider divergence detected, not hidden

import { NextRequest, NextResponse } from 'next/server'
import { createProviderRegistry } from '@/lib/providers/registry'
import { hydrateWeights } from '@/lib/providers/router'
import { recordProviderOutcome } from '@/lib/providers/store'
import { selectExtractionProvider, selectEvaluationProvider } from '@/lib/providers/router'
import { callWithFallback } from '@/lib/providers/client'
import {
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
  parseExtractionResponse,
} from '@/lib/evaluation/extraction'
import { ExtractionResultSchema } from '@/lib/evaluation/validate'
import {
  computeScoreFromPresence,
  classifySeverity,
  classifyGovernability,
  computeOverallScore,
  PRIMITIVE_NAMES,
} from '@/lib/evaluation/scoring'
import { decomposeConfidence } from '@/lib/evaluation/confidence'
import { checkStability } from '@/lib/evaluation/stability'
import { buildNarrativePrompt } from '@/lib/prompt'
import { filterNarrativeOutput } from '@/lib/evaluation/filter'
import type {
  DiagnosticReport, PrimitiveAssessment, PrimitivePresence, StabilityAssessment
} from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 90

const PRIMITIVE_ORDER = [
  'bounded-verifiability-latency',
  'explicit-compositional-contracts',
  'continuous-deterministic-layer-regression',
  'dual-ownership',
] as const

export async function runEvaluationPipeline(architectureDescription: string): Promise<DiagnosticReport | any> {
  const providers = createProviderRegistry()
  await hydrateWeights(providers)
  const desc = architectureDescription.trim()

  // === PHASE 1: EXTRACTION ===
  // Select provider optimized for structural + schema reliability
  const extractionProvider = selectExtractionProvider(providers)
  if (!extractionProvider) {
    throw new Error('No providers available for extraction.')
  }

  let extractionResult
  try {
    extractionResult = await callWithFallback(
      providers,
      EXTRACTION_SYSTEM_PROMPT,
      buildExtractionPrompt(desc),
      (parsed) => {
        if (!Array.isArray(parsed)) throw new Error("Extraction must return an array")
        return parseExtractionResponse(parsed)
      }
    )
    if (extractionResult) {
      await recordProviderOutcome(extractionResult.providerName, 'success')
    }
  } catch (e) {
    if (extractionProvider) {
      await recordProviderOutcome(extractionProvider.name, 'parse_failure')
    }
    throw e;
  }

  if (!extractionResult) {
    throw new Error('Extraction phase failed across all providers.')
  }

  const presenceMatrix: PrimitivePresence[] = ExtractionResultSchema.parse(extractionResult.result)
  const extractionProviderName = extractionResult.providerName

  // === DETERMINISTIC SCORING ===
  // Scores computed from presence matrix — the model does not produce numbers
  const scores: Record<string, number> = {}
  for (const presence of presenceMatrix) {
    scores[presence.primitiveId] = computeScoreFromPresence(presence)
  }

  // === PHASE 2: NARRATIVE ANALYSIS ===
  // Select provider optimized for interpretive reliability
  // Prefer a different provider than extraction — prevents single-provider capture
  const narrativeProvider = selectEvaluationProvider(
    providers,
    extractionProviderName
  )

  let narrativeResult = null
  if (narrativeProvider) {
    try {
      narrativeResult = await callWithFallback(
        [narrativeProvider],
        'You are a constitutional governance analysis engine. You output ONLY valid JSON. Clinical, precise, infrastructure-oriented.',
        buildNarrativePrompt(desc, presenceMatrix, scores),
        (parsed) => {
          if (!parsed.primitiveNarratives) throw new Error('Missing primitiveNarratives')
          if (!parsed.riskMatrix) throw new Error('Missing riskMatrix')
          return parsed
        }
      )
      if (narrativeResult) {
        await recordProviderOutcome(narrativeResult.providerName, 'success')
      }
    } catch (e) {
      await recordProviderOutcome(narrativeProvider.name, 'parse_failure')
    }
  }

  // If the selected provider fails, fall back through remaining providers
  if (!narrativeResult) {
    const fallbackProviders = providers.filter(
      p => p.name !== extractionProviderName && p.name !== narrativeProvider?.name
    )
    try {
      narrativeResult = await callWithFallback(
        fallbackProviders,
        'You are a constitutional governance analysis engine. You output ONLY valid JSON. Clinical, precise, infrastructure-oriented.',
        buildNarrativePrompt(desc, presenceMatrix, scores),
        (parsed) => {
          if (!parsed.primitiveNarratives) throw new Error('Missing primitiveNarratives')
          if (!parsed.riskMatrix) throw new Error('Missing riskMatrix')
          return parsed
        }
      )
      if (narrativeResult) {
        await recordProviderOutcome(narrativeResult.providerName, 'success')
      }
    } catch (e) {
      console.error('Fallback narrative provider failed:', e)
    }
  }

  if (!narrativeResult) {
    throw new Error('Narrative analysis phase failed across all providers.')
  }

  let narrative = narrativeResult.result
  const narrativeProviderName = narrativeResult.providerName

  // Gap 2: Post-Generation Vocabulary Filter
  const { filtered: filteredExecutiveSummary, violations: esViolations } = filterNarrativeOutput(narrative.executiveSummary || "")
  narrative.executiveSummary = filteredExecutiveSummary
  if (esViolations.length > 0) {
    console.warn(`Executive Summary violations: ${esViolations.join(', ')}`)
  }

  if (narrative.primitiveNarratives) {
    for (const primitiveId in narrative.primitiveNarratives) {
      const pn = narrative.primitiveNarratives[primitiveId]
      if (pn.explanation) {
        const { filtered: filteredExplanation, violations: expViolations } = filterNarrativeOutput(pn.explanation)
        pn.explanation = filteredExplanation
        if (expViolations.length > 0) {
          console.warn(`Primitive Narrative (${primitiveId}) explanation violations: ${expViolations.join(', ')}`)
        }
      }
    }
  }

  // === ASSEMBLE PRIMITIVE ASSESSMENTS ===
  const overallScore = computeOverallScore(Object.values(scores))
  const governabilityClassification = classifyGovernability(overallScore)

  const primitiveAssessments: PrimitiveAssessment[] = PRIMITIVE_ORDER.map(id => {
    const presence = presenceMatrix.find(p => p.primitiveId === id) || {
      primitiveId: id,
      present: false,
      evidenceCitations: [],
      evidenceQuality: 'absent' as const,
      mechanismType: 'undefined' as const,
    }
    const score = scores[id] || 0
    const narrativeData = narrative.primitiveNarratives?.[id] || {}
    const confidence = decomposeConfidence(presence, desc)

    return {
      primitiveId: id,
      primitiveName: PRIMITIVE_NAMES[id] || id,
      score,
      severity: classifySeverity(score),
      explanation: narrativeData.explanation || 'No narrative produced.',
      detectedWeaknesses: narrativeData.detectedWeaknesses || [],
      predictedFailurePatterns: narrativeData.predictedFailurePatterns || [],
      remediationRecommendations: narrativeData.remediationRecommendations || [],
      presence,
      confidence,
    }
  })

  // === PHASE 3: STABILITY CHECK ===
  // Build a minimal report structure for stability comparison
  const reportForStability = { overallScore, governabilityClassification, primitiveAssessments }
  const stability: StabilityAssessment = checkStability(
    reportForStability as any,
    extractionProviderName
  )

  // Gap 1: Halt on Major Provider Divergence
  if (stability.providerDisagreement?.severity === 'major') {
    return {
      status: 'DIVERGENT',
      message: 'Primary and verification providers produced materially different assessments. The classification is withheld pending human review.',
      primaryProvider: extractionProvider.name,
      verificationProvider: narrativeProvider?.name || 'unknown',
      divergentFields: stability.providerDisagreement.divergentFields,
      primaryAssessment: extractionResult.result,
      verificationAssessment: narrative,
      recommendation: 'Re-describe your architecture with more specific detail on the divergent dimensions, or request a third evaluation.'
    } as any; // Cast to any to allow returning a different structure for divergence
  }

  // === FINAL REPORT ===
  const report: DiagnosticReport = {
    executiveSummary: narrative.executiveSummary || 'No executive summary produced.',
    overallScore,
    governabilityClassification,
    primitiveAssessments,
    riskMatrix: narrative.riskMatrix || [],
    latentInstabilities: narrative.latentInstabilities || [],
    remediationPriorities: narrative.remediationPriorities || [],
    topologyAssessment: narrative.topologyAssessment || '',
    _provider: extractionProviderName,
    _verificationProvider: narrativeProviderName !== extractionProviderName
      ? narrativeProviderName
      : undefined,
    _stability: stability,
  }

  return report
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { architectureDescription } = body

    if (!architectureDescription || typeof architectureDescription !== 'string') {
      return NextResponse.json({ error: 'architectureDescription is required.' }, { status: 400 })
    }

    if (architectureDescription.trim().length < 50) {
      return NextResponse.json(
        { error: 'Architecture description too short. Please provide at least 50 characters.' },
        { status: 400 }
      )
    }

    const report = await runEvaluationPipeline(architectureDescription)
    return NextResponse.json(report)
  } catch (error: any) {
    console.error('Evaluation pipeline error:', error)
    // Handle the specific error for major provider disagreement
    if (error.status === 'DIVERGENT') {
      return NextResponse.json(error, { status: 209 })
    }
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during evaluation.' },
      { status: 500 }
    )
  }
}
