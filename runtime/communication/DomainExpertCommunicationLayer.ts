import type { AdaptiveInvestigationState } from '../artifacts/AdaptiveInvestigationState';

export interface ComposedQuestionResult {
  question: string;
  domainAuthenticityScore: number;
  justification: {
    reason: string;
    supports: string[];
    expectedInformationGain: number;
    domain: string;
    expertPattern: string;
  };
}

export interface ComposeQuestionInput {
  domain: string;
  context: string;
  targetEvidence: { reason: string };
  state: AdaptiveInvestigationState;
}

export default class DomainExpertCommunicationLayer {
  public composeQuestion(input: ComposeQuestionInput): ComposedQuestionResult {
    const domain = input.domain.toLowerCase();
    const score = this.scoreAuthenticity(input);

    const question = domain.includes('farmac')
      ? `O teste de integridade do filtro esterilizante foi aprovado antes e após o envase?`
      : domain.includes('automot')
      ? `O defeito aparece antes da cura ou somente após a cura da pintura?`
      : domain.includes('hospital')
      ? `Os casos compartilham o mesmo protocolo terapêutico?`
      : domain.includes('finance')
      ? `A divergência aparece apenas no fechamento mensal ou também nas conciliações diárias?`
      : `Qual evidência objetiva deveria ser coletada para validar a hipótese dominante no contexto ${input.context}?`;

    return {
      question,
      domainAuthenticityScore: score,
      justification: {
        reason: input.targetEvidence.reason,
        supports: input.state.hypotheses.map((hypothesis) => hypothesis.id),
        expectedInformationGain: clamp(0.7 + score * 0.2),
        domain: input.domain,
        expertPattern: 'domain-specialist-questioning',
      },
    };
  }

  private scoreAuthenticity(input: ComposeQuestionInput): number {
    const domain = input.domain.toLowerCase();
    const hasDomainContext = domain.length > 0;
    const hasSpecializedTerm = /(farmac|automot|hospital|finance|esteriliz|pintura|terap|concili|filtro|envase|cura|protocolo)/i.test(input.context);
    const hasTargetReason = input.targetEvidence.reason.length > 0;
    const domainSpecificBoost = /(farmac|automot|hospital|finance)/i.test(domain) ? 0.25 : 0;
    return clamp(Number(hasDomainContext) * 0.25 + Number(hasSpecializedTerm) * 0.45 + Number(hasTargetReason) * 0.25 + domainSpecificBoost);
  }
}

const clamp = (value: number): number => Math.max(0, Math.min(1, Number(value.toFixed(3))));
