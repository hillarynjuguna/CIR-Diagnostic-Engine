// lib/types.ts — CIR Diagnostic Engine v2.0 (synthesized)
// Incorporates: Doc1 base types, Doc3 extraction types, Doc4 confidence decomposition

export type PrimitiveId =
  | 'bounded-verifiability-latency'
  | 'explicit-compositional-contracts'
  | 'continuous-deterministic-layer-regression'
  | 'dual-ownership'

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type GovernabilityClassification =
  | 'GOVERNED'
  | 'PARTIALLY GOVERNED'
  | 'MANAGED'
  | 'UNGOVERNED'

export type MechanismType = 'architectural' | 'policy' | 'procedural' | 'undefined'

export type EvidenceQuality = 'strong' | 'moderate' | 'weak' | 'absent'

// Doc3: Extraction layer — Boolean presence matrix
// The model performs extraction. The scoring engine is the constitutional authority.
export interface PrimitivePresence {
  primitiveId: PrimitiveId
  present: boolean
  evidenceCitations: string[]
  evidenceQuality: EvidenceQuality
  mechanismType: MechanismType
}

// Doc4: Decomposed confidence — three distinct epistemic claims
export interface DecomposedConfidence {
  extractionConfidence: number   // How clearly could the model map the description?
  evidenceConfidence: number     // How trustworthy is the source material?
  governanceConfidence: number   // Composite: how reliable is the overall assessment?
  warnings: string[]
}

// Enriched primitive assessment (Doc1 base + Doc3 extraction + Doc4 confidence)
export interface PrimitiveAssessment {
  primitiveId: PrimitiveId
  primitiveName: string
  score: number
  severity: SeverityLevel
  explanation: string
  detectedWeaknesses: string[]
  predictedFailurePatterns: string[]
  remediationRecommendations: string[]
  // Doc3: Evidence traceability
  presence: PrimitivePresence
  // Doc4: Decomposed confidence
  confidence: DecomposedConfidence
}

export interface RiskMatrixEntry {
  failureMode: string
  likelihood: SeverityLevel
  impact: SeverityLevel
  affectedPrimitives: PrimitiveId[]
  description: string
}

// Doc3: Cross-provider disagreement surface
export interface StabilityAssessment {
  passed: boolean
  warnings: string[]
  providerDisagreement?: {
    primaryProvider: string
    verificationProvider: string
    divergentFields: string[]
    severity: 'minor' | 'moderate' | 'major'
  }
}

export interface DiagnosticReport {
  executiveSummary: string
  overallScore: number
  governabilityClassification: GovernabilityClassification
  primitiveAssessments: PrimitiveAssessment[]
  riskMatrix: RiskMatrixEntry[]
  latentInstabilities: string[]
  remediationPriorities: string[]
  topologyAssessment: string
  // Doc2/3: Provider transparency
  _provider?: string
  _verificationProvider?: string
  // Doc3: Stability surface
  _stability?: StabilityAssessment
}

export interface EvaluationRequest {
  architectureDescription: string
}

// Doc4: Provider reliability dimensions — separated weights
export interface ProviderWeights {
  structuralReliability: number    // JSON schema adherence, parseability
  interpretiveReliability: number  // governance analysis depth, primitive accuracy
  latencyReliability: number       // response time consistency
  schemaReliability: number        // output format stability across runs
}

// Doc3+4: Extraction result container
export interface ExtractionResult {
  presenceMatrix: PrimitivePresence[]
  confidence: number
  extractionProvider: string
  warnings: string[]
}
