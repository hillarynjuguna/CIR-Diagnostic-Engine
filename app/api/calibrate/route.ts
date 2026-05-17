import { NextRequest, NextResponse } from 'next/server'
import { KNOWN_FAILURE_CORPUS } from '@/lib/evaluation/calibration'
import { runEvaluationPipeline } from '@/app/api/evaluate/route'

export const runtime = 'nodejs'
export const maxDuration = 90

export async function GET(request: NextRequest) {
  const results = []
  for (const case_ of KNOWN_FAILURE_CORPUS) {
    const report = await runEvaluationPipeline(case_.description)
    const expectedPresence = case_.expectedPresence
    const actualPresence: Record<string, boolean> = {}
    for (const assessment of report.primitiveAssessments) {
      actualPresence[assessment.primitiveId] = assessment.score >= 55
    }
    
    const mismatches: string[] = []
    for (const [id, expected] of Object.entries(expectedPresence)) {
      if (actualPresence[id] !== expected) {
        mismatches.push(id)
      }
    }
    
    results.push({
      case: case_.name,
      expected: expectedPresence,
      actual: actualPresence,
      match: mismatches.length === 0,
      mismatches,
      classification: report.governabilityClassification,
      extractionProvider: report._provider,
    })
  }
  
  const accuracy = results.filter(r => r.match).length / results.length
  return NextResponse.json({ accuracy, results })
}
