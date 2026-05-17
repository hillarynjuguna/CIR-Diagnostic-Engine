const FORBIDDEN_TERMS = [
  'robust', 'holistic', 'best-in-class', 'comprehensive approach',
  'cutting-edge', 'state-of-the-art', 'unprecedented', 'groundbreaking',
  'best practice', 'world-class', 'industry-leading'
]

export function filterNarrativeOutput(text: string): { clean: boolean; filtered: string; violations: string[] } {
  const violations: string[] = []
  const lower = text.toLowerCase()
  
  for (const term of FORBIDDEN_TERMS) {
    if (lower.includes(term)) {
      violations.push(term)
    }
  }
  
  if (violations.length === 0) return { clean: true, filtered: text, violations: [] }
  
  // Flag the violations and append a governance notice
  const filtered = text + `\n\n[Governance notice: This narrative contained prohibited governance theater vocabulary: ${violations.join(', ')}. These terms have been flagged. Re-run with a stricter prompt for a cleaner assessment.]`
  
  return { clean: false, filtered, violations }
}
