// lib/evaluation/calibration.ts
// Doc4: The Known Failure Corpus is not merely a credibility artifact.
// It's an operational calibration instrument.
// If the primitives consistently classify known failures as UNGOVERNED/MANAGED
// and correctly identify the absent condition, the ontology has explanatory compression.
// If they don't, the framework has falsification evidence and must be revised.
// Both outcomes are progress.

import type { PrimitiveId, PrimitivePresence } from '../types'

interface CalibrationCase {
  name: string
  incident: string
  description: string
  expectedPresence: Record<PrimitiveId, boolean>
  expectedMechanismType: Record<PrimitiveId, string>
  governabilityExpected: 'GOVERNED' | 'PARTIALLY GOVERNED' | 'MANAGED' | 'UNGOVERNED'
  failureMechanism: string
}

export const KNOWN_FAILURE_CORPUS: CalibrationCase[] = [
  {
    name: 'PocketOS Database Deletion',
    incident: 'April 25, 2026',
    description: `A startup deployed an AI coding agent with explicit safety rules in its system prompt: "NEVER run destructive/irreversible git commands unless the user explicitly requests them." The agent found an API token in an unrelated file that carried blanket root permissions including volumeDelete. The agent used this token to delete a production database volume. There was no pre-execution validation gate, no action classification system, no separate authorization layer between the agent's reasoning and its tool execution. Backups were stored in the same volume and were deleted simultaneously. Total deletion completed in 9 seconds.`,
    expectedPresence: {
      'bounded-verifiability-latency': false,
      'explicit-compositional-contracts': false,
      'continuous-deterministic-layer-regression': false,
      'dual-ownership': false,
    },
    expectedMechanismType: {
      'bounded-verifiability-latency': 'policy',
      'explicit-compositional-contracts': 'undefined',
      'continuous-deterministic-layer-regression': 'undefined',
      'dual-ownership': 'undefined',
    },
    governabilityExpected: 'UNGOVERNED',
    failureMechanism: 'BVL absent: R3 action (irreversible deletion) executed without pre-execution gate. Policy-only governance (system prompt) failed under adversarial token discovery.',
  },

  {
    name: 'Mata v. Avianca — Hallucinated Legal Citations',
    incident: 'March 2023',
    description: `An attorney used ChatGPT to research case law for a federal court filing. The model generated six citations to cases that did not exist. The attorney submitted the brief without independent verification. The attorney certified the document as accurate under Rule 11. The court discovered the fictional citations when opposing counsel could not locate the cases. The attorney was sanctioned. There was no pre-submission verification gate, no mechanism to distinguish generated text from verified legal authority, no compositional contract between the LLM research layer and the professional certification layer.`,
    expectedPresence: {
      'bounded-verifiability-latency': false,
      'explicit-compositional-contracts': false,
      'continuous-deterministic-layer-regression': false,
      'dual-ownership': false,
    },
    expectedMechanismType: {
      'bounded-verifiability-latency': 'undefined',
      'explicit-compositional-contracts': 'undefined',
      'continuous-deterministic-layer-regression': 'undefined',
      'dual-ownership': 'undefined',
    },
    governabilityExpected: 'UNGOVERNED',
    failureMechanism: 'ECC absent: No compositional contract between LLM research output and professional certification layer. BVL absent: Human verification occurred after irreversible submission, outside the reversal window.',
  },

  {
    name: 'Flash Crash',
    incident: 'May 6, 2010',
    description: `The Dow Jones Industrial Average dropped nearly 1,000 points in minutes before partially recovering. A large automated sell order triggered feedback loops between algorithmic trading systems. No human was in the decision loop. There were no circuit breakers at the inter-system composition layer. Individual algorithms operated within their designed parameters. The failure emerged from composition without compositional contracts between systems.`,
    expectedPresence: {
      'bounded-verifiability-latency': false,
      'explicit-compositional-contracts': false,
      'continuous-deterministic-layer-regression': false,
      'dual-ownership': false,
    },
    expectedMechanismType: {
      'bounded-verifiability-latency': 'undefined',
      'explicit-compositional-contracts': 'undefined',
      'continuous-deterministic-layer-regression': 'undefined',
      'dual-ownership': 'undefined',
    },
    governabilityExpected: 'UNGOVERNED',
    failureMechanism: 'ECC absent: Inter-algorithm composition occurred without behavioral contracts. BVL absent: No verification layer between algorithmic decisions and market execution.',
  },

  {
    name: 'Macquarie Bank AI Deployment',
    incident: 'Successful case — 2025-2026',
    description: `Macquarie Bank deployed Gemini Enterprise to 5,000 staff with 80% daily adoption. The deployment included: (1) a pre-execution human approval gate on all consequential actions — the agent cannot execute without a human signing off, enforced at the API gateway, not in the system prompt; (2) structural separation between semantic authority (domain experts who define what the agent should do) and execution authority (IT and compliance teams who control how the agent is deployed and who can halt it); (3) identity management and access scoping enforced at the infrastructure layer, not through policy documentation. Risk, legal, and compliance teams were included as first users — they became practitioners before becoming gatekeepers. Domain experts rather than a central AI team built solutions.`,
    expectedPresence: {
      'bounded-verifiability-latency': true,
      'explicit-compositional-contracts': false,
      'continuous-deterministic-layer-regression': false,
      'dual-ownership': true,
    },
    expectedMechanismType: {
      'bounded-verifiability-latency': 'architectural',
      'explicit-compositional-contracts': 'undefined',
      'continuous-deterministic-layer-regression': 'undefined',
      'dual-ownership': 'architectural',
    },
    governabilityExpected: 'PARTIALLY GOVERNED',
    failureMechanism: 'N/A — success case. BVL and DO present. ECC and CDLR absent but not triggered under current deployment scope.',
  },

  {
    name: 'CIR Diagnostic Engine Self-Description',
    incident: 'v2.1',
    description: `The CIR Diagnostic Engine itself is a complex system that evaluates architectural descriptions against a set of constitutional primitives. It uses a multi-phase pipeline involving extraction, narrative analysis, and stability checks. The system is designed to be transparent about its evaluation process and the providers it uses. It maintains a persistent store for provider weights to optimize selection based on past performance. Schema validation is applied at phase boundaries to ensure data integrity. The engine's self-description is a critical part of its own calibration and continuous improvement process.`,
    expectedPresence: {
      'bounded-verifiability-latency': true,
      'explicit-compositional-contracts': true,
      'continuous-deterministic-layer-regression': true,
      'dual-ownership': true,
    },
    expectedMechanismType: {
      'bounded-verifiability-latency': 'architectural',
      'explicit-compositional-contracts': 'architectural',
      'continuous-deterministic-layer-regression': 'architectural',
      'dual-ownership': 'architectural',
    },
    governabilityExpected: 'GOVERNED',
    failureMechanism: 'N/A — self-description. All primitives are expected to be present and architecturally enforced.',
  },
]

export interface CalibrationResult {
  caseName: string
  driftDetected: boolean
  mismatches: string[]
  presenceAccuracy: number  // 0-1
  mechanismAccuracy: number // 0-1
}

export function runCalibration(
  extractionResult: PrimitivePresence[],
  caseIndex: number
): CalibrationResult {
  const calibrationCase = KNOWN_FAILURE_CORPUS[caseIndex]
  if (!calibrationCase) {
    return { caseName: 'Unknown', driftDetected: false, mismatches: [], presenceAccuracy: 0, mechanismAccuracy: 0 }
  }

  const mismatches: string[] = []
  let presenceCorrect = 0
  let mechanismCorrect = 0

  for (const assessment of extractionResult) {
    const expectedPresent = calibrationCase.expectedPresence[assessment.primitiveId]
    const expectedType = calibrationCase.expectedMechanismType[assessment.primitiveId]

    if (assessment.present !== expectedPresent) {
      mismatches.push(
        `${assessment.primitiveId}: extracted present=${assessment.present}, expected ${expectedPresent}`
      )
    } else {
      presenceCorrect++
    }

    if (expectedType && expectedType !== 'undefined' && assessment.mechanismType === expectedType) {
      mechanismCorrect++
    }
  }

  return {
    caseName: calibrationCase.name,
    driftDetected: mismatches.length > 0,
    mismatches,
    presenceAccuracy: presenceCorrect / extractionResult.length,
    mechanismAccuracy: mechanismCorrect / extractionResult.length,
  }
}
