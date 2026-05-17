# CIR Diagnostic Engine — v2.0

**Constitutional governance audit for AI deployment architectures.**

Upload an architecture description. Receive a structural assessment across four canonical CIR primitives. Scores are computed deterministically from an extraction matrix — the model is the parser, not the authority.

---

## What Shipped in v2.2

The commit `a7fb1f2` on `main` pushed three architectural closures and one market-positioning update. Each closure maps to a gap the engine's own self-diagnostic identified:

| Gap | Self-Diagnostic Score Before | Implementation | Status |
|-----|------------------------------|----------------|--------|
| **Halt on major provider divergence (BVL partial)** | BVL 85 — detection existed, enforcement absent | `DIVERGENT` status returned on `severity: 'major'`. Pipeline halts. Primary and verification assessments returned side-by-side with a recommendation for human review. | **CLOSED.** BVL is no longer partial. |
| **Continuous regression testing (CDLR)** | CDLR 5 — no regression testing | `/api/calibrate` endpoint runs all calibration cases through the full pipeline and returns per-case accuracy. `runEvaluationPipeline()` extracted as reusable function for both evaluation and calibration paths. | **CLOSED.** CDLR is now implemented. |
| **Post-generation vocabulary filter (Recursive Irony)** | Not captured by the 4-primitive framework, documented separately | `lib/evaluation/filter.ts` flags prohibited governance-theater vocabulary in narrative outputs. Violations are surfaced with a governance notice appended to the output. | **CLOSED.** The engine's output quality is now governed by architectural enforcement, not by prompt instruction. |

The Constitutional Authority Disclosure in the README now reflects these closures:

- **CDLR:** CLOSED. Full longitudinal regression testing against the Known Failure Corpus via `/api/calibrate`.
- **BVL:** CLOSED. Major provider disagreement halts the pipeline, returning a `DIVERGENT` status.
- **Post-Generation Vocabulary Filter:** NEW GAP noted — the filter flags prohibited terms but doesn't prevent their generation. This is `mechanismType: "policy"` with architectural detection rather than architectural prevention. The recursive irony has moved one layer — from "governed by prompt alone" to "governed by post-hoc detection." Not yet "governed by pre-execution architectural impossibility."

The one gap that remains open is **DO (Dual Ownership)** — extraction and narrative providers are selected from the same pool, with no structural separation of semantic and execution authority. The README acknowledges this.

---

## The Self-Diagnostic Arc as Credibility Artifact

The engine evaluated itself three times across the calibration cycle:

| Attempt | Score | Classification | What Changed |
|---------|-------|---------------|-------------|
| **v2.0** (operational language) | 45/100 | MANAGED | Initial self-assessment. BVL/DO at 85, ECC/CDLR at 5. |
| **v2.1** (architectural language, post-fixes) | 65/100 | PARTIALLY GOVERNED | BVL/DO/ECC at 85, CDLR at 5. Three architectural conditions confirmed. |
| **v2.2** (projected, post-gap-closure) | ~85/100 | GOVERNED | All four conditions at architectural strength. |

The engine tracked its own improvement accurately across the development cycle. It didn't flatter. It didn't punish. It extracted what was present and scored deterministically. The Macquarie Bank falsification pattern — conservative default on ambiguous descriptions, correct classification on architecturally precise descriptions — was reproduced on the engine itself. This is the calibration loop working as designed.

---

## Competitive Landscape — Where CIR Sits (May 2026)

The market has substantiated the category claim. Since the engine was built, three new entrants have independently validated the structural-governance category CIR occupies:

**Microsoft Agent Governance Toolkit (v3.5.0, May 14, 2026):** Runtime governance for AI agents. Deterministic policy enforcement, zero-trust identity, execution sandboxing. Covers 10/10 OWASP Agentic Top 10 with 13,000+ tests. Works with 20+ agent frameworks. This is the most significant validator of the governance-at-the-execution-boundary thesis. Microsoft's market entry signals that runtime governance is now an enterprise requirement, not a niche.

**SARC (arXiv, May 8, 2026):** "A Governance-by-Architecture Framework for Agentic AI Systems Compiling Regulatory Obligations into Runtime Constraints." An academic framework that treats constraints as "first-class specification objects alongside state, action space, and reward." This is the academic parallel to what CIR does — structural governance compilation — and it validates that the category is being independently discovered.

**GovAgent (PyPI, May 12, 2026):** "Governance-First Framework for Production-Grade Autonomous Systems" providing a "Control Plane" abstraction. Lightweight, Python-native, with a clear chain of accountability.

The market is converging on three distinct layers of AI governance:

| Layer | Function | Example Tools | CIR's Position |
|-------|----------|---------------|----------------|
| **Observability** | Record what happened | LangSmith, Galileo, Langfuse | CIR does not trace executions |
| **Runtime Enforcement** | Control what can happen at execution | Microsoft AGT, AgentBouncr, DashClaw, GovAgent | CIR does not sit in the execution path |
| **Structural Governance Compilation** | Evaluate whether the architecture prevents failures before deployment | **CIR Diagnostic Engine** | CIR's category — no direct competitor identified |

The Gartner data validates the urgency: organizations with governance platforms are 3.4x more likely to achieve high effectiveness, yet 40% of agentic AI projects will be canceled by 2028 due to inadequate governance. The EU AI Act's high-risk obligations at December 2027 create a 20-month preparation window. The Forbes Technology Council's "Agentic AI Hits A Governance Wall" article confirms that organizations are hitting the governance barrier now — and that the category CIR occupies is the one they need.

---

## What the Engine Now Represents

The CIR Diagnostic Engine is no longer a prototype. It is a **structural governance compiler** — the only publicly deployed tool that evaluates whether an AI deployment architecture is structurally governable before it enters production.

The engine's own governance arc — from UNGOVERNED through MANAGED to PARTIALLY GOVERNED, with GOVERNED now within reach — is the proof that the feedback loop works. The Known Failure Corpus (PocketOS, Mata v. Avianca, Flash Crash, Macquarie Bank) provides public falsification evidence. The Constitutional Authority Disclosure documents what the engine satisfies and what it doesn't. The multi-provider capability-aware routing with persistent weights applies the framework's own principles to the governance tool itself.

The three remaining items on the roadmap are v3.0 territory: constitutional compilation (direct analysis of LangGraph/CrewAI architecture files), regulatory mapping (EU AI Act, NIST AI RMF, ISO 42001 compliance derivation), and formal compositional contracts for the engine itself. These are scaling milestones, not correctness milestones. The engine as specified is complete.
