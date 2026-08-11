import type { AdaptiveInvestigationState, InvestigationTargetEvidence } from '../artifacts/AdaptiveInvestigationState';

export default class EvidenceAcquisitionPlanner {
  public plan(state: AdaptiveInvestigationState): InvestigationTargetEvidence {
    const strongest = [...state.hypotheses].sort((a, b) => b.confidence - a.confidence)[0];
    const contradictions = state.evidenceRegistry.items.filter((item) => item.relation === 'Contradiction').length;
    const validationPending = state.evidenceRegistry.items.some((item) => item.semanticProfile?.requires_validation);
    const priority = clamp(0.6 + (strongest?.confidence ?? 0.5) * 0.25 + (contradictions > 0 ? 0.1 : 0) + (validationPending ? 0.05 : 0));

    return {
      priority,
      reason: contradictions > 0
        ? 'Priorizar validação da contradição para reduzir incerteza e estabilizar a hipótese dominante.'
        : 'Priorizar evidência que reduza incerteza e aumente separação entre hipóteses concorrentes.',
      expectedUncertaintyReduction: clamp(0.18 + (contradictions > 0 ? 0.08 : 0) + (validationPending ? 0.04 : 0)),
      recommendedAcquisition: validationPending
        ? 'Validar com teste controlado ou evidência independente.'
        : 'Coletar evidência objetiva com alto valor informacional.',
      supports: strongest ? [strongest.id] : [],
      domain: state.operationalObject.domain,
      expertPattern: 'evidence-first-validation',
    };
  }
}

const clamp = (value: number): number => Math.max(0, Math.min(1, Number(value.toFixed(3))));
