import type { EvidenceItem, HypothesisCompetitionProfile, HypothesisState } from '../artifacts/AdaptiveInvestigationState';

export interface CompetitionContext {
  domain?: string;
}

export default class CompetitiveHypothesisManager {
  public updateCompetition(
    hypotheses: HypothesisState[],
    evidence: EvidenceItem[],
    context: CompetitionContext = {}
  ): HypothesisState[] {
    const competition = hypotheses.map((hypothesis) => {
      const relatedEvidence = evidence.filter((item) => item.relatedHypothesisId === hypothesis.id);
      const supporting = relatedEvidence.filter((item) => item.relation === 'Support').length;
      const contradicting = relatedEvidence.filter((item) => item.relation === 'Contradiction').length;
      const dominanceScore = clamp(hypothesis.confidence + supporting * 0.05 - contradicting * 0.07);
      const competingHypothesisIds = hypotheses
        .filter((candidate) => candidate.id !== hypothesis.id && candidate.confidence >= hypothesis.confidence * 0.8)
        .map((candidate) => candidate.id);

      const profile: HypothesisCompetitionProfile = {
        competingHypothesisIds,
        dominanceScore,
        isDominant: dominanceScore >= 0.72 || (hypothesis.confidence >= 0.7 && supporting > 0),
        dominantHypothesisId: dominanceScore >= 0.72 ? hypothesis.id : null,
        redundantWith: competingHypothesisIds.slice(0, 1),
        closureReason: competingHypothesisIds.length > 0 ? 'Conflito competitivo com hipóteses paralelas' : 'Sem conflito competitivo detectado',
      };

      return {
        ...hypothesis,
        status: hypothesis.status as HypothesisState['status'],
        competition: profile,
      };
    });

    return competition.map((hypothesis, index) => ({
      ...hypothesis,
      status: hypothesis.status as HypothesisState['status'],
      confidence: clamp(hypothesis.confidence + (hypothesis.competition?.isDominant ? 0.02 : 0)),
      reasoningSummary: `${hypothesis.reasoningSummary} [Competição: ${context.domain ?? 'investigação'}; dominante=${hypothesis.competition?.isDominant ? 'sim' : 'não'}]`,
      missingEvidence: index === 0 ? hypothesis.missingEvidence : [...hypothesis.missingEvidence, 'Validar competitividade com hipótese alternativa'],
    }));
  }
}

const clamp = (value: number): number => Math.max(0, Math.min(1, Number(value.toFixed(3))));
