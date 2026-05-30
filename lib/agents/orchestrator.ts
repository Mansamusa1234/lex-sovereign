import { logAudit, getAgentSettings } from '../supabase'
import { chat } from '../openai'
import { runLegalResearch, addMemory } from './legalResearch'
import { draftEmailReply } from './emailDrafting'
import { AGENT_LANGUAGES } from '../types'
import type { OrchestrationRequest, OrchestrationResult, RiskFlag } from '../types'

const BASE_ORCHESTRATOR_SYSTEM = `You are the Supreme Orchestrator of the Lex Sovereign AI Brain — a legal research and drafting assistant.
You coordinate the Legal Research Agent and Email Drafting Agent.

Your responsibilities:
1. Understand the user's request
2. Determine which agents are needed
3. Synthesise their outputs into a clear, useful response
4. Always flag when human review is required
5. Never fabricate law, statutes, case citations, or legal facts
6. Remind the user: this is a research and drafting tool, not legal advice

When presenting research findings, structure your response as:
- Summary of what was found
- Key relevant points (with source references)
- Recommended next steps
- Any warnings or risk flags`

function buildOrchestratorPrompt(language: string): string {
  if (language === 'en') return BASE_ORCHESTRATOR_SYSTEM
  const langName = AGENT_LANGUAGES[language] ?? language
  return `${BASE_ORCHESTRATOR_SYSTEM}\n\nCRITICAL LANGUAGE INSTRUCTION: Your entire response MUST be written in ${langName}. Do not use English unless it is a direct legal citation from the knowledge base.`
}

export async function runOrchestrator(req: OrchestrationRequest): Promise<OrchestrationResult> {
  // Fetch orchestrator's own language setting
  const settings = await getAgentSettings('orchestrator')
  const systemPrompt = buildOrchestratorPrompt(settings.language)

  const agentsUsed: string[] = ['Supreme Orchestrator']
  const allRiskFlags: RiskFlag[] = []
  let draftsCreated = 0
  let memoryAdded = 0
  let requiresApproval = false
  let approvalId: string | undefined

  await logAudit({
    agentName: 'Supreme Orchestrator',
    action: 'orchestration_started',
    details: {
      query: req.query.slice(0, 200),
      email_id: req.email_id,
      language: settings.language,
    },
  })

  const lowerQuery = req.query.toLowerCase()
  const wantsResearch =
    lowerQuery.includes('research') || lowerQuery.includes('statute') ||
    lowerQuery.includes('law')      || lowerQuery.includes('right') ||
    lowerQuery.includes('define')   || lowerQuery.includes('find') ||
    lowerQuery.includes('what')     || lowerQuery.includes('how')

  const wantsDraft =
    req.email_id != null ||
    lowerQuery.includes('draft')  || lowerQuery.includes('reply') ||
    lowerQuery.includes('respond')|| lowerQuery.includes('write')

  let researchSummary = ''
  let draftSummary = ''

  if (wantsResearch || (!wantsDraft)) {
    agentsUsed.push('Legal Research Agent')
    try {
      const result = await runLegalResearch(req.query)
      researchSummary = result.answer
      allRiskFlags.push(...result.unsupportedFlags)
      memoryAdded += result.memoryMatches > 0 ? 1 : 0
    } catch (err) {
      researchSummary = 'Legal Research Agent encountered an error. Please try again.'
    }
  }

  if (wantsDraft && req.email_id) {
    agentsUsed.push('Email Drafting Agent')
    try {
      const result = await draftEmailReply(req.email_id)
      draftsCreated = 1
      requiresApproval = true
      approvalId = result.approval.id
      allRiskFlags.push(...result.draft.risk_flags)
      draftSummary = `Draft created for approval. Risk score: ${result.draft.risk_score}/100. ${
        result.draft.risk_flags.length > 0
          ? `${result.draft.risk_flags.length} risk flag(s) detected.`
          : 'No risk flags.'
      }`
    } catch (err) {
      draftSummary = `Email drafting failed: ${(err as Error).message}`
    }
  }

  const contextParts: string[] = []
  if (researchSummary) contextParts.push(`Research findings:\n${researchSummary}`)
  if (draftSummary) contextParts.push(`Draft status:\n${draftSummary}`)
  if (allRiskFlags.length > 0) {
    contextParts.push(
      `Risk flags (${allRiskFlags.length}):\n${allRiskFlags
        .map(f => `- [${f.severity.toUpperCase()}] ${f.reason}`)
        .join('\n')}`
    )
  }

  const finalResponse = await chat(
    systemPrompt,
    req.query,
    contextParts.join('\n\n') || 'No sub-agent results available.'
  )

  await addMemory(
    `Orchestrator query: "${req.query.slice(0, 150)}" — Agents: ${agentsUsed.join(', ')}`,
    'other',
    {
      agents_used: agentsUsed,
      had_risk_flags: allRiskFlags.length > 0,
      required_approval: requiresApproval,
      language: settings.language,
    }
  )
  memoryAdded++

  await logAudit({
    agentName: 'Supreme Orchestrator',
    action: 'orchestration_completed',
    details: {
      agents_used: agentsUsed,
      drafts_created: draftsCreated,
      risk_flags: allRiskFlags.length,
      requires_approval: requiresApproval,
      language: settings.language,
    },
  })

  return {
    response: finalResponse,
    agents_used: agentsUsed,
    memory_added: memoryAdded,
    drafts_created: draftsCreated,
    risk_flags: allRiskFlags,
    requires_approval: requiresApproval,
    approval_id: approvalId,
  }
}
