import { z } from 'zod'

export const PrimitivePresenceSchema = z.object({
  primitiveId: z.string(),
  present: z.boolean(),
  evidenceCitations: z.array(z.string()),
  evidenceQuality: z.enum(["high", "medium", "low", "absent"]),
  mechanismType: z.enum(["code", "config", "process", "undefined"]),
})

export const ExtractionResultSchema = z.array(PrimitivePresenceSchema)
