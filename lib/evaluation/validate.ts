import { z } from 'zod'

export const PrimitivePresenceSchema = z.object({
  primitiveId: z.enum([
    'bounded-verifiability-latency',
    'explicit-compositional-contracts',
    'continuous-deterministic-layer-regression',
    'dual-ownership',
  ]),
  present: z.boolean(),
  evidenceCitations: z.array(z.string()),
  evidenceQuality: z.enum(['strong', 'moderate', 'weak', 'absent']),
  mechanismType: z.enum(['architectural', 'policy', 'procedural', 'undefined']),
})

export const ExtractionResultSchema = z.array(PrimitivePresenceSchema)
