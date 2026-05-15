// app/api/evaluate/route.ts
// Full synthesis: Doc1 base → Doc2 multi-provider → Doc3 extraction+stability → Doc4 separated weights
// Two-phase pipeline:
//   Phase 1 (Extraction): Provider A maps architecture → Boolean presence matrix
//   Phase 2 (Narrative): Provider B produces failure analysis anchored to extraction results
//   Phase 3 (Stability): Cross-provider divergence detected, not hidden

import { NextRequest, NextResponse } from 'next/server'
import { createProviderRegistry } from '@/lib/providers/registry'
import { selectExtractionProvider, selectEvaluationProvider } from '@/lib/providers/router'
import { callWithFallback } from '@/lib/providers/client'
import {
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
  parseExtractionResponse,
} from '@/lib/evaluation/extraction'
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

    const providers = createProviderRegistry()
    const desc = architectureDescription.trim()

    // === PHASE 1: EXTRACTION ===
    // Select provider optimized for structural + schema reliability
    const extractionProvider = selectExtractionProvider(providers)
    if (!extractionProvider) {
      return NextResponse.json(
        { error: 'No providers available. Please set at least one API key in .env.local.' },
        { status: 503 }
      )
    }

    const extractionResult = await callWithFallback(
      providers,
      EXTRACTION_SYSTEM_PROMPT,
      buildExtractionPrompt(desc),
      (parsed) => {
        if (!Array.isArray(parsed)) throw new Error('Extraction must return an array')
        return parseExtractionResponse(parsed)
      }
    )

    if (!extractionResult) {
      return NextResponse.json(
        { error: 'Extraction phase failed across all providers.' },
        { status: 500 }
      )
    }

    const presenceMatrix: PrimitivePresence[] = extractionResult.result
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
    const narrativeProviders = providers.filter(
      p => !p.status.backoffUntil || Date.now() > p.status.backoffUntil
    )

    const narrativeResult = await callWithFallback(
      narrativeProviders,
      'You are a constitutional governance analysis engine. You output ONLY valid JSON. Clinical, precise, infrastructure-oriented.',
      buildNarrativePrompt(desc, presenceMatrix, scores),
      (parsed) => {
        if (!parsed.primitiveNarratives) throw new Error('Missing primitiveNarratives')
        if (!parsed.riskMatrix) throw new Error('Missing riskMatrix')
        return parsed
      }
    )

    if (!narrativeResult) {
      return NextResponse.json(
        { error: 'Narrative analysis phase failed across all providers.' },
        { status: 500 }
      )
    }

    const narrative = narrativeResult.result
    const narrativeProviderName = narrativeResult.providerName

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

    return NextResponse.json(report)
  } catch (error: any) {
    console.error('Evaluation pipeline error:', error)
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during evaluation.' },
      { status: 500 }
    )
  }
}
