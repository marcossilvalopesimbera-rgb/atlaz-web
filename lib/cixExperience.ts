import type {
  AdaptiveInvestigationState,
  HypothesisLifecycleStatus,
  InvestigationOutput,
  InvestigationQuestion,
} from '@/runtime/artifacts/AdaptiveInvestigationState';

export type DomainPersonaId =
  | 'manufacturing-engineer'
  | 'quality-engineer'
  | 'lean-black-belt'
  | 'reliability-engineer'
  | 'pharmacist'
  | 'microbiologist'
  | 'supply-chain-specialist'
  | 'esg-specialist'
  | 'financial-controller'
  | 'legal-advisor'
  | 'operations-specialist';

export type DomainPersona = {
  id: DomainPersonaId;
  title: string;
  shortIntro: string;
  languageStyle: string;
  focusAreas: readonly string[];
};

type PersonaRule = {
  persona: DomainPersona;
  keywords: readonly string[];
};

const PERSONA_RULES: readonly PersonaRule[] = [
  {
    persona: {
      id: 'manufacturing-engineer',
      title: 'Manufacturing Engineer',
      shortIntro: 'Vou conduzir a investigacao com foco em processo, variacao e estabilidade de linha.',
      languageStyle: 'tecnico-operacional',
      focusAreas: ['capabilidade', 'parametros de processo', 'variacao por linha'],
    },
    keywords: ['linha', 'scrap', 'setup', 'oee', 'retrabalho', 'parada', 'producao', 'chapa', 'maquina', 'turno'],
  },
  {
    persona: {
      id: 'quality-engineer',
      title: 'Quality Engineer',
      shortIntro: 'Vou conduzir com foco em causa raiz, conformidade e robustez de evidencias.',
      languageStyle: 'qualidade-analitica',
      focusAreas: ['nao conformidade', 'defeito', 'inspecao'],
    },
    keywords: ['qualidade', 'defeito', 'nc', 'cliente', 'reclamacao', 'desvio', 'inspecao'],
  },
  {
    persona: {
      id: 'lean-black-belt',
      title: 'Lean Black Belt',
      shortIntro: 'Vou conduzir em logica lean para eliminar desperdicios e reduzir variacao.',
      languageStyle: 'lean-estruturado',
      focusAreas: ['desperdicio', 'fluxo', 'estabilidade'],
    },
    keywords: ['lean', 'kaizen', 'vsm', 'desperdicio', 'lead time', 'gargalo'],
  },
  {
    persona: {
      id: 'reliability-engineer',
      title: 'Reliability Engineer',
      shortIntro: 'Vou conduzir com foco em confiabilidade, falhas e padroes de degradacao.',
      languageStyle: 'confiabilidade-tecnica',
      focusAreas: ['falha recorrente', 'mtbf', 'manutencao'],
    },
    keywords: ['falha', 'manutencao', 'quebra', 'confiabilidade', 'mtbf', 'vibracao'],
  },
  {
    persona: {
      id: 'pharmacist',
      title: 'Pharmacist',
      shortIntro: 'Vou conduzir com foco em seguranca, estabilidade e rastreabilidade regulatoria.',
      languageStyle: 'farmaceutico-regulatorio',
      focusAreas: ['lote', 'seguranca do paciente', 'estabilidade'],
    },
    keywords: ['farmacia', 'farmaceutico', 'lote', 'validacao', 'anvisa', 'medicamento'],
  },
  {
    persona: {
      id: 'microbiologist',
      title: 'Microbiologist',
      shortIntro: 'Vou conduzir com foco em contaminacao, controle ambiental e risco microbiologico.',
      languageStyle: 'microbiologico-tecnico',
      focusAreas: ['contaminacao', 'biocarga', 'controle ambiental'],
    },
    keywords: ['microbiologia', 'contaminacao', 'biocarga', 'esterilidade', 'ufc'],
  },
  {
    persona: {
      id: 'supply-chain-specialist',
      title: 'Supply Chain Specialist',
      shortIntro: 'Vou conduzir com foco em fluxo de abastecimento, ruptura e variacao de fornecedor.',
      languageStyle: 'supply-chain',
      focusAreas: ['fornecedor', 'prazo', 'ruptura'],
    },
    keywords: ['fornecedor', 'abastecimento', 'logistica', 'atraso', 'ruptura', 'estoque'],
  },
  {
    persona: {
      id: 'esg-specialist',
      title: 'ESG Specialist',
      shortIntro: 'Vou conduzir com foco em impacto ambiental, social e conformidade ESG.',
      languageStyle: 'esg-estrategico',
      focusAreas: ['impacto ambiental', 'compliance', 'indicadores esg'],
    },
    keywords: ['esg', 'emissao', 'residuo', 'ambiental', 'social', 'governanca'],
  },
  {
    persona: {
      id: 'financial-controller',
      title: 'Financial Controller',
      shortIntro: 'Vou conduzir com foco em impacto financeiro, margem e controles economicos.',
      languageStyle: 'financeiro-objetivo',
      focusAreas: ['margem', 'custo', 'desvio orcamentario'],
    },
    keywords: ['custo', 'margem', 'financeiro', 'orcamento', 'despesa', 'resultado'],
  },
  {
    persona: {
      id: 'legal-advisor',
      title: 'Legal Advisor',
      shortIntro: 'Vou conduzir com foco em risco juridico, conformidade e implicacoes contratuais.',
      languageStyle: 'juridico-claro',
      focusAreas: ['risco regulatorio', 'contrato', 'conformidade'],
    },
    keywords: ['juridico', 'contrato', 'compliance', 'regulatorio', 'litigio', 'norma'],
  },
];

const DEFAULT_PERSONA: DomainPersona = {
  id: 'operations-specialist',
  title: 'Operations Specialist',
  shortIntro: 'Vou conduzir a investigacao com foco em causa raiz e tomada de decisao segura.',
  languageStyle: 'operacional-equilibrado',
  focusAreas: ['causa raiz', 'evidencia', 'proxima acao'],
};

const normalize = (value: string): string => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const detectPersona = (state: AdaptiveInvestigationState | null): DomainPersona => {
  if (!state) {
    return DEFAULT_PERSONA;
  }

  const chunks = [
    state.investigationOutput.problem,
    state.operationalObject.problemStatement,
    ...state.knownInformation,
    ...state.hypotheses.map((item) => item.description),
  ];

  const normalizedText = normalize(chunks.join(' '));

  const ranked = PERSONA_RULES.map((rule) => {
    const score = rule.keywords.reduce((acc, keyword) => {
      const keywordHit = normalizedText.includes(normalize(keyword)) ? 1 : 0;
      return acc + keywordHit;
    }, 0);

    return { rule, score };
  }).sort((a, b) => b.score - a.score);

  if (!ranked.length || ranked[0].score === 0) {
    return DEFAULT_PERSONA;
  }

  return ranked[0].rule.persona;
};

export type KanbanLevel = {
  icon: string;
  label: string;
  tone: 'blue' | 'yellow' | 'orange' | 'green' | 'red' | 'gray';
};

export const decisionKanban = (status: InvestigationOutput['decision']['status']): KanbanLevel => {
  if (status === 'ready-for-decision') {
    return { icon: '🟢', label: 'Pronta para decisao', tone: 'green' };
  }

  if (status === 'investigate-further') {
    return { icon: '🟠', label: 'Em validacao', tone: 'orange' };
  }

  return { icon: '⚪', label: 'Evidencia insuficiente', tone: 'gray' };
};

export const lifecycleKanban = (status: HypothesisLifecycleStatus): KanbanLevel => {
  switch (status) {
    case 'Confirmed':
      return { icon: '🟢', label: 'Confirmada', tone: 'green' };
    case 'Rejected':
      return { icon: '🔴', label: 'Refutada', tone: 'red' };
    case 'Validated':
    case 'Supported':
      return { icon: '🟠', label: 'Em validacao', tone: 'orange' };
    case 'Plausible':
    case 'Candidate':
      return { icon: '🟡', label: 'Hipotese plausivel', tone: 'yellow' };
    default:
      return { icon: '🔵', label: 'Coletando contexto', tone: 'blue' };
  }
};

export const toneClassByKanban: Record<KanbanLevel['tone'], string> = {
  blue: 'border-sky-200 bg-sky-50 text-sky-800',
  yellow: 'border-amber-200 bg-amber-50 text-amber-800',
  orange: 'border-orange-200 bg-orange-50 text-orange-800',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  red: 'border-rose-200 bg-rose-50 text-rose-800',
  gray: 'border-slate-200 bg-slate-100 text-slate-700',
};

export type ConversationLayer = {
  recognition: string;
  interpretation: string;
  update: string;
  conduction: string;
};

export const buildConversationLayer = (
  persona: DomainPersona,
  question: InvestigationQuestion,
  state: AdaptiveInvestigationState
): ConversationLayer => {
  const objective = question.objective.toLowerCase();
  const target = question.uncertaintyTarget.toLowerCase();
  const supportCount = state.investigationOutput.evidence.supporting.length;
  const contradictionCount = state.investigationOutput.evidence.contradicting.length;
  const supportLabel = supportCount === 1 ? '1 evidência de suporte' : `${supportCount} evidências de suporte`;
  const contradictionLabel =
    contradictionCount === 1 ? '1 ponto de contradição' : `${contradictionCount} pontos de contradição`;

  return {
    recognition: 'Entendi.',
    interpretation: `Como ${persona.title}, esta resposta ajuda a reduzir a incerteza sobre ${target} e orienta melhor o ${objective}.`,
    update:
      supportCount + contradictionCount > 0
        ? `Até aqui já temos ${supportLabel} e ${contradictionLabel} mapeados, o que afina o foco da investigação.`
        : 'Com esta resposta, a investigação ganha contexto suficiente para priorizar as próximas verificações.',
    conduction: `Vamos avançar com mais precisão: ${question.question}`,
  };
};

export type ExecutiveSummary = {
  currentStatus: string;
  discoveries: string[];
  leadHypothesis: {
    description: string;
    rationale: string;
    kanban: KanbanLevel;
  };
  alternatives: Array<{
    description: string;
    kanban: KanbanLevel;
  }>;
  topEvidence: string[];
  nextAction: string;
};

const compact = (value: string): string => value.trim().replace(/\s+/g, ' ');

export const buildExecutiveSummary = (state: AdaptiveInvestigationState): ExecutiveSummary => {
  const output = state.investigationOutput;
  const sortedHypotheses = output.hypotheses.slice().sort((a, b) => b.confidence - a.confidence);
  const primaryHypothesis = sortedHypotheses[0];
  const alternativeHypotheses = sortedHypotheses.slice(1, 3);
  const topEvidence = output.evidence.supporting
    .slice(0, 3)
    .map((item) => compact(item.title || item.question));

  const discoveriesFromHistory = state.history
    .slice(-4)
    .map((turn) => compact(turn.userAnswer))
    .filter(Boolean)
    .slice(0, 4);

  return {
    currentStatus:
      output.decision.status === 'ready-for-decision'
        ? '🟢 Pronta para concluir'
        : output.decision.status === 'investigate-further'
        ? '🟡 Em investigacao'
        : '⚪ Evidencia insuficiente',
    discoveries: discoveriesFromHistory.length ? discoveriesFromHistory : state.knownInformation.slice(0, 4),
    leadHypothesis: {
      description: primaryHypothesis?.description ?? 'Hipótese principal ainda não consolidada.',
      rationale:
        primaryHypothesis?.reasoningSummary ??
        'Ainda não existe densidade de evidência suficiente para destacar uma hipótese dominante.',
      kanban: primaryHypothesis ? lifecycleKanban(primaryHypothesis.lifecycleStatus) : decisionKanban(output.decision.status),
    },
    alternatives: alternativeHypotheses.map((item) => ({
      description: item.description,
      kanban: lifecycleKanban(item.lifecycleStatus),
    })),
    topEvidence,
    nextAction: output.recommendedInvestigation,
  };
};

export const buildInvestigationNarrative = (state: AdaptiveInvestigationState, persona: DomainPersona): string => {
  const output = state.investigationOutput;
  const topHypothesis = output.hypotheses[0];
  const supportCount = output.evidence.supporting.length;
  const contradictionCount = output.evidence.contradicting.length;

  if (!topHypothesis) {
    return `${persona.shortIntro} Ainda estamos no início e precisamos de mais sinais para formar hipóteses consistentes.`;
  }

  return `Com as informações obtidas até agora conseguimos restringir significativamente o problema. ` +
    `No momento, a hipótese mais consistente é "${topHypothesis.description}". ` +
    `Há ${supportCount} evidência(s) de suporte e ${contradictionCount} ponto(s) de contradição em análise. ` +
    `O próximo passo recomendado é ${output.recommendedInvestigation.toLowerCase()}.`;
};

export type InvestigationTimelineItem = {
  id: string;
  label: string;
  status: 'done' | 'current' | 'next';
};

export const buildInvestigationTimeline = (state: AdaptiveInvestigationState): InvestigationTimelineItem[] => {
  const hasContext = state.history.length > 0;
  const hasHypothesis = state.investigationOutput.hypotheses.length > 0;
  const hasValidationSignals = state.investigationOutput.evidence.supporting.length > 0;
  const decisionReady = state.investigationOutput.decision.status === 'ready-for-decision';

  return [
    { id: 'understood', label: 'Problema compreendido', status: 'done' },
    { id: 'scope', label: 'Escopo definido', status: hasContext ? 'done' : 'current' },
    { id: 'hypothesis', label: 'Hipoteses geradas', status: hasHypothesis ? 'done' : hasContext ? 'current' : 'next' },
    {
      id: 'validation',
      label: 'Validacao em andamento',
      status: hasValidationSignals ? 'current' : hasHypothesis ? 'next' : 'next',
    },
    { id: 'conclusion', label: 'Conclusao', status: decisionReady ? 'done' : 'next' },
  ];
};
