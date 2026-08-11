import type { EvidenceItem, HypothesisState, SemanticEvidenceProfile } from '../artifacts/AdaptiveInvestigationState';

export interface SemanticInterpretationResult {
  profile: SemanticEvidenceProfile;
  inferredSignals: string[];
}

const clamp = (value: number): number => Math.max(0, Math.min(1, Number(value.toFixed(3))));

const normalize = (value: string): string =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default class EvidenceSemanticInterpreter {
  public interpret(
    input: {
      answer: string;
      question?: { question: string };
      context?: { domain?: string };
    },
    metadata: { hypothesisId: string }
  ): SemanticInterpretationResult {
    const normalized = normalize(input.answer);
    const revealsGap = /(nao sei|desconhec|ainda nao|sem dado|pendente|não medido|não tenho|nao tenho|faltam|falta|pende|indefinido|ainda não)/.test(normalized);
    const requiresValidation = /(validar|teste controlado|ensaio|confirmar|medir|verificar|confirmacao|validação|teste|validacao)/.test(normalized);
    const contradictsHypothesis = /(contradiz|incompat|não confirma|não suporta|falso|evidencia oposta)/.test(normalized);
    const supportsHypothesis = /(confirma|apoia|corrobora|suporta|corresponde)/.test(normalized);
    const opensNewPath = /(novo caminho|outra rota|nova direção|outra hipótese)/.test(normalized);
    const restrictsScope = /(apenas|somente|exclusivamente|limitado a)/.test(normalized);
    const increasesUncertainty = /(incerto|inseguro|não sei|ambíguo|indefinido)/.test(normalized);
    const reducesUncertainty = /(claro|confirmado|evidente|reduz incerteza|comprovado)/.test(normalized);

    const profile: SemanticEvidenceProfile = {
      supports_hypothesis: supportsHypothesis && !contradictsHypothesis,
      contradicts_hypothesis: contradictsHypothesis,
      reveals_gap: revealsGap,
      requires_validation: requiresValidation || revealsGap,
      opens_new_path: opensNewPath,
      restricts_scope: restrictsScope,
      increases_uncertainty: increasesUncertainty || revealsGap,
      reduces_uncertainty: reducesUncertainty && !increasesUncertainty,
    };

    return {
      profile,
      inferredSignals: [
        metadata.hypothesisId,
        input.context?.domain ?? 'investigação',
        profile.reveals_gap ? 'gap' : 'no-gap',
        profile.requires_validation ? 'validation-pending' : 'validated',
      ],
    };
  }

  public attachSemanticProfile(evidence: EvidenceItem, profile: SemanticEvidenceProfile): EvidenceItem {
    return {
      ...evidence,
      semanticProfile: {
        ...profile,
        supports_hypothesis: Boolean(profile.supports_hypothesis),
        contradicts_hypothesis: Boolean(profile.contradicts_hypothesis),
        reveals_gap: Boolean(profile.reveals_gap),
        requires_validation: Boolean(profile.requires_validation),
        opens_new_path: Boolean(profile.opens_new_path),
        restricts_scope: Boolean(profile.restricts_scope),
        increases_uncertainty: Boolean(profile.increases_uncertainty),
        reduces_uncertainty: Boolean(profile.reduces_uncertainty),
      },
    };
  }

  public interpretHypothesis(hypothesis: HypothesisState): SemanticEvidenceProfile {
    return {
      supports_hypothesis: false,
      contradicts_hypothesis: false,
      reveals_gap: hypothesis.missingEvidence.length > 0,
      requires_validation: hypothesis.missingEvidence.length > 0,
      opens_new_path: hypothesis.confidence < 0.6,
      restricts_scope: hypothesis.confidence >= 0.7,
      increases_uncertainty: hypothesis.confidence < 0.5,
      reduces_uncertainty: hypothesis.confidence >= 0.7,
    };
  }
}
