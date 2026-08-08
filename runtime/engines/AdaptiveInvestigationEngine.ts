import {
  AdaptiveInvestigationState,
  EvidenceItem,
  HypothesisState,
  InvestigationObjective,
  InvestigationQuestion,
  InvestigationTurn,
} from "../artifacts/AdaptiveInvestigationState";
import { OperationalObject } from "../artifacts/OperationalObject";

const MIN_CONFIDENCE = 0.15;
const MAX_CONFIDENCE = 0.98;
const STATE_VERSION = "1.0.0";

type InvestigationContext = {
  combinedText: string;
  hasMachineContext: boolean;
  hasSupplierContext: boolean;
  hasShiftContext: boolean;
  hasMeasurementEvidence: boolean;
  hasRecentChangeSignal: boolean;
  hasRecurrenceSignal: boolean;
  hasFirstDetectionSignal: boolean;
  hasReproducibilitySignal: boolean;
};

type QuestionTemplate = {
  id: string;
  step: string;
  intro: string;
  question: (context: InvestigationContext, state: AdaptiveInvestigationState) => string;
  placeholder: string;
  whyAsked: (context: InvestigationContext, state: AdaptiveInvestigationState) => string;
  uncertaintyTarget: string;
  objective: InvestigationObjective;
  isApplicable: (context: InvestigationContext, state: AdaptiveInvestigationState) => boolean;
};

const clampConfidence = (value: number): number => {
  if (value < MIN_CONFIDENCE) {
    return MIN_CONFIDENCE;
  }
  if (value > MAX_CONFIDENCE) {
    return MAX_CONFIDENCE;
  }
  return Number(value.toFixed(3));
};

const normalize = (text: string): string => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const unique = (items: string[]): string[] => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const containsPattern = (text: string, pattern: RegExp): boolean => pattern.test(text);

const questionIsAllowed = (question: string): boolean => {
  const normalized = normalize(question);
  const blockedPatterns = [
    /primeiro passo/,
    /como resolver/,
    /como voce resolveria/,
    /qual acao/,
    /o que deve ser feito/,
    /how would you solve/,
    /what should be the first step/,
    /what action should be taken/,
  ];

  return !blockedPatterns.some((pattern) => pattern.test(normalized));
};

const createId = (): string => {
  if (typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `atlaz-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const buildContext = (state: AdaptiveInvestigationState): InvestigationContext => {
  const merged = normalize(
    [
      state.operationalObject.problemStatement,
      ...state.knownInformation,
      ...state.history.map((entry) => `${entry.questionAsked} ${entry.userAnswer}`),
    ].join(" ")
  );

  return {
    combinedText: merged,
    hasMachineContext: containsPattern(merged, /(maquina|equipamento|linha|estacao|prensa|ferramenta)/),
    hasSupplierContext: containsPattern(merged, /(fornecedor|lote|batch|material|insumo|origem)/),
    hasShiftContext: containsPattern(merged, /(turno|manha|tarde|noite)/),
    hasMeasurementEvidence: containsPattern(merged, /(medicao|medicao|mm|taxa|percentual|indicador|dado|relatorio|registro|amostra)/),
    hasRecentChangeSignal: containsPattern(merged, /(troca|mudanca|alteracao|novo|recente|atualizacao|setup)/),
    hasRecurrenceSignal: containsPattern(merged, /(recorrente|continua|continua ocorrendo|todo dia|toda vez|frequente|desde)/),
    hasFirstDetectionSignal: containsPattern(merged, /(detectad|aparece|primeira etapa|primeiro ponto|inspecao|teste final)/),
    hasReproducibilitySignal: containsPattern(merged, /(reproduz|controlad|ensaio|teste repetido|replicado)/),
  };
};

const domainKeywords = (domain: string): string[] => {
  const key = normalize(domain);

  if (key.includes("qualidade")) {
    return ["defeito", "nao conform", "retrabalho", "scrap", "vazamento", "medicao"];
  }
  if (key.includes("operacao") || key.includes("produ")) {
    return ["linha", "setup", "turno", "ritmo", "capacidade", "parada"];
  }
  if (key.includes("manutencao")) {
    return ["quebra", "manutencao", "falha", "lubrificacao", "desgaste"];
  }
  if (key.includes("suprimento") || key.includes("fornecedor")) {
    return ["fornecedor", "lote", "material", "insumo", "variacao"];
  }
  if (key.includes("engenharia")) {
    return ["parametro", "ajuste", "especificacao", "tolerancia", "projeto"];
  }

  return ["processo", "operacao", "variacao", "controle"];
};

const buildInitialHypotheses = (operationalObject: OperationalObject): HypothesisState[] => {
  const domains = unique([operationalObject.domain, ...operationalObject.suspectedDomains]).slice(0, 4);

  const base = domains.map((domain, index) => ({
    id: `h-${index + 1}-${normalize(domain).replace(/[^a-z0-9]+/g, "-")}`,
    description: `A principal causa está relacionada ao domínio ${domain}.`,
    confidence: clampConfidence(operationalObject.confidence - 0.08 + index * 0.02),
    supportingEvidence: [],
    contradictingEvidence: [],
    status: "Active" as const,
    keywords: domainKeywords(domain),
  }));

  if (base.length >= 3) {
    return base;
  }

  return [
    ...base,
    {
      id: "h-processo",
      description: "A variabilidade do processo está amplificando o problema.",
      confidence: clampConfidence(operationalObject.confidence - 0.04),
      supportingEvidence: [],
      contradictingEvidence: [],
      status: "Active" as const,
      keywords: ["variacao", "processo", "desvio", "instabilidade"],
    },
    {
      id: "h-controle",
      description: "Há desvio de controle entre planejamento e execução.",
      confidence: clampConfidence(operationalObject.confidence - 0.06),
      supportingEvidence: [],
      contradictingEvidence: [],
      status: "Active" as const,
      keywords: ["controle", "planejamento", "execucao", "checklist", "padrao"],
    },
  ].slice(0, 4);
};

const updateHypothesisStatus = (hypothesis: HypothesisState): HypothesisState["status"] => {
  if (hypothesis.confidence >= 0.78 && hypothesis.supportingEvidence.length > 0) {
    return "Confirmed";
  }

  if (hypothesis.confidence <= 0.32 && hypothesis.contradictingEvidence.length > 0) {
    return "Discarded";
  }

  return "Active";
};

const buildInitialGaps = (operationalObject: OperationalObject): string[] => {
  return unique([
    ...operationalObject.requiredInformation,
    "Recorrência e frequência do problema",
    "Ponto de detecção inicial no processo",
    "Escopo real do impacto (produto, máquina, turno)",
    "Mudanças recentes antes da ocorrência",
    "Diferenças mensuráveis entre casos afetados e não afetados",
    "Evidência faltante para validar a hipótese principal",
  ]);
};

const QUESTION_TEMPLATES: readonly QuestionTemplate[] = [
  {
    id: "q-recorrencia",
    step: "Recorrência",
    intro: "Vou começar reduzindo incerteza sobre o padrão do problema.",
    question: () => "O problema ainda está ocorrendo ou foi um evento isolado?",
    placeholder: "Descreva frequência, momento e padrão de ocorrência.",
    whyAsked: () => "A recorrência diferencia evento pontual de falha sistêmica.",
    uncertaintyTarget: "Recorrência e frequência do problema",
    objective: "Reduzir incerteza",
    isApplicable: (context, state) => !context.hasRecurrenceSignal && !state.askedQuestionIds.includes("q-recorrencia"),
  },
  {
    id: "q-deteccao",
    step: "Detecção",
    intro: "Agora vou localizar a primeira manifestação observável da falha.",
    question: () => "Em qual etapa do processo a falha é detectada pela primeira vez?",
    placeholder: "Informe a etapa, estação, inspeção ou teste onde a falha surge primeiro.",
    whyAsked: () => "Saber o primeiro ponto de detecção reduz o espaço causal da investigação.",
    uncertaintyTarget: "Ponto de detecção inicial no processo",
    objective: "Eliminar hipóteses",
    isApplicable: (context, state) => !context.hasFirstDetectionSignal && !state.askedQuestionIds.includes("q-deteccao"),
  },
  {
    id: "q-escopo-maquina",
    step: "Escopo",
    intro: "Vou delimitar o escopo do impacto para evitar generalizações.",
    question: () => "Isso ocorre em todas as máquinas/estações ou apenas em equipamentos específicos?",
    placeholder: "Detalhe onde ocorre e onde não ocorre, com modelo, linha ou estação.",
    whyAsked: () => "Delimitar escopo elimina hipóteses incompatíveis com o padrão real de ocorrência.",
    uncertaintyTarget: "Escopo real do impacto (produto, máquina, turno)",
    objective: "Eliminar hipóteses",
    isApplicable: (context, state) => context.hasMachineContext && !state.askedQuestionIds.includes("q-escopo-maquina"),
  },
  {
    id: "q-escopo-produto",
    step: "Escopo",
    intro: "Vou delimitar o escopo do impacto para evitar generalizações.",
    question: () => "Isso afeta todos os produtos/processos ou apenas modelos e condições específicas?",
    placeholder: "Descreva diferenças por produto, modelo, configuração ou condição operacional.",
    whyAsked: () => "Escopo claro evita investigar causas fora das condições realmente afetadas.",
    uncertaintyTarget: "Escopo real do impacto (produto, máquina, turno)",
    objective: "Eliminar hipóteses",
    isApplicable: (context, state) => !context.hasMachineContext && !state.askedQuestionIds.includes("q-escopo-produto"),
  },
  {
    id: "q-turno",
    step: "Variação operacional",
    intro: "Vou verificar se há variação por turno para testar estabilidade operacional.",
    question: () => "O comportamento muda entre turnos? Existe alguma diferença mensurável entre eles?",
    placeholder: "Informe diferenças por turno com dados observáveis (taxa, setup, temperatura, operador).",
    whyAsked: () => "Diferenças por turno ajudam a identificar causas associadas a contexto operacional.",
    uncertaintyTarget: "Escopo real do impacto (produto, máquina, turno)",
    objective: "Validar evidências",
    isApplicable: (context, state) => context.hasShiftContext && !state.askedQuestionIds.includes("q-turno"),
  },
  {
    id: "q-mudanca-fornecedor",
    step: "Mudanças recentes",
    intro: "Vou investigar gatilhos recentes antes do início do problema.",
    question: () => "Houve troca recente de fornecedor, lote, material, ferramenta ou parâmetro?",
    placeholder: "Registre o que mudou, quando mudou e em quais condições o problema começou.",
    whyAsked: () => "Mudanças próximas ao início do problema tendem a ter alto valor causal.",
    uncertaintyTarget: "Mudanças recentes antes da ocorrência",
    objective: "Identificar informação faltante",
    isApplicable: (context, state) => context.hasSupplierContext && !state.askedQuestionIds.includes("q-mudanca-fornecedor"),
  },
  {
    id: "q-mudanca-geral",
    step: "Mudanças recentes",
    intro: "Vou investigar gatilhos recentes antes do início do problema.",
    question: () => "Houve alguma mudança recente antes do problema aparecer (material, software, manutenção, operador ou processo)?",
    placeholder: "Descreva mudanças relevantes e sua proximidade temporal com o início do problema.",
    whyAsked: () => "Sem mapear mudanças recentes, hipóteses causais ficam frágeis.",
    uncertaintyTarget: "Mudanças recentes antes da ocorrência",
    objective: "Identificar informação faltante",
    isApplicable: (context, state) => !context.hasSupplierContext && !state.askedQuestionIds.includes("q-mudanca-geral"),
  },
  {
    id: "q-contraste-medicao",
    step: "Contraste de evidências",
    intro: "Vou confrontar casos afetados e não afetados para elevar a confiança analítica.",
    question: () => "Há diferença mensurável entre casos afetados e não afetados?",
    placeholder: "Compartilhe medições, taxas, tolerâncias e observações comparativas.",
    whyAsked: () => "Evidência comparativa reduz ambiguidade e separa correlação de causalidade.",
    uncertaintyTarget: "Diferenças mensuráveis entre casos afetados e não afetados",
    objective: "Validar evidências",
    isApplicable: (context, state) => !context.hasMeasurementEvidence && !state.askedQuestionIds.includes("q-contraste-medicao"),
  },
  {
    id: "q-reproducao",
    step: "Teste de hipótese",
    intro: "Vou verificar a reprodutibilidade para confirmar a hipótese principal.",
    question: () => "O problema é reproduzível em condição controlada?",
    placeholder: "Descreva tentativas de reprodução, condições e resultado obtido.",
    whyAsked: () => "Reprodutibilidade fortalece inferência causal e reduz incerteza residual.",
    uncertaintyTarget: "Evidência faltante para validar a hipótese principal",
    objective: "Aumentar confiança",
    isApplicable: (context, state) => !context.hasReproducibilitySignal && !state.askedQuestionIds.includes("q-reproducao"),
  },
  {
    id: "q-lacuna-final",
    step: "Fechamento investigativo",
    intro: "Vou fechar a lacuna crítica restante para consolidar a conclusão.",
    question: (_context, state) => {
      const topHypothesis = [...state.hypotheses].sort((a, b) => b.confidence - a.confidence)[0];
      if (!topHypothesis) {
        return "Qual evidência objetiva falta para aumentar a confiança da conclusão?";
      }
      return `Qual evidência objetiva ainda falta para confirmar ou descartar a hipótese: \"${topHypothesis.description}\"?`;
    },
    placeholder: "Informe qual dado, teste ou observação falta para fechar a incerteza principal.",
    whyAsked: () => "A investigação deve encerrar com clareza sobre a evidência faltante mais crítica.",
    uncertaintyTarget: "Evidência faltante para validar a hipótese principal",
    objective: "Aumentar confiança",
    isApplicable: (_context, state) => !state.askedQuestionIds.includes("q-lacuna-final"),
  },
];

const buildQuestionFromTemplate = (
  template: QuestionTemplate,
  context: InvestigationContext,
  state: AdaptiveInvestigationState
): InvestigationQuestion | null => {
  const questionText = template.question(context, state);

  if (!questionIsAllowed(questionText)) {
    return null;
  }

  const normalizedQuestion = normalize(questionText);
  const questionAlreadyAsked = state.history.some((entry) => normalize(entry.questionAsked) === normalizedQuestion);

  if (questionAlreadyAsked) {
    return null;
  }

  return {
    id: template.id,
    step: template.step,
    intro: template.intro,
    question: questionText,
    placeholder: template.placeholder,
    whyAsked: template.whyAsked(context, state),
    uncertaintyTarget: template.uncertaintyTarget,
    objective: template.objective,
  };
};

const chooseNextQuestion = (state: AdaptiveInvestigationState): InvestigationQuestion | null => {
  const context = buildContext(state);

  for (const template of QUESTION_TEMPLATES) {
    if (!template.isApplicable(context, state)) {
      continue;
    }

    const question = buildQuestionFromTemplate(template, context, state);
    if (question) {
      return question;
    }
  }

  return null;
};

const scoreAnswerSignal = (answer: string): number => {
  const normalizedAnswer = normalize(answer);

  let score = 0;

  if (normalizedAnswer.length >= 60) {
    score += 0.015;
  }

  if (containsPattern(normalizedAnswer, /(medicao|dado|registro|taxa|indicador|amostra|relatorio|teste)/)) {
    score += 0.055;
  }

  if (containsPattern(normalizedAnswer, /(troca|mudanca|alteracao|novo lote|novo fornecedor|setup)/)) {
    score += 0.035;
  }

  if (containsPattern(normalizedAnswer, /(nao sei|sem dado|desconhec|nao medido|ainda nao)/)) {
    score -= 0.05;
  }

  return score;
};

const updateHypothesesFromAnswer = (
  hypotheses: HypothesisState[],
  answer: string,
  evidenceId: string
): {
  hypotheses: HypothesisState[];
  strengthenedHypotheses: string[];
  weakenedHypotheses: string[];
} => {
  const normalizedAnswer = normalize(answer);

  const strengthenedHypotheses: string[] = [];
  const weakenedHypotheses: string[] = [];

  const updated = hypotheses.map((hypothesis) => {
    const hasKeyword = hypothesis.keywords.some((keyword) => normalizedAnswer.includes(normalize(keyword)));
    const hasNegation = containsPattern(normalizedAnswer, /(nao ocorre|nao afeta|descartado|invalido|sem relacao)/);

    let delta = 0;

    if (hasKeyword) {
      delta += 0.045;
      strengthenedHypotheses.push(hypothesis.id);
    }

    if (hasKeyword && hasNegation) {
      delta -= 0.065;
      weakenedHypotheses.push(hypothesis.id);
    }

    const nextSupportingEvidence = hasKeyword && !hasNegation
      ? unique([...hypothesis.supportingEvidence, evidenceId])
      : hypothesis.supportingEvidence;

    const nextContradictingEvidence = hasKeyword && hasNegation
      ? unique([...hypothesis.contradictingEvidence, evidenceId])
      : hypothesis.contradictingEvidence;

    const nextConfidence = clampConfidence(hypothesis.confidence + delta);

    return {
      ...hypothesis,
      confidence: nextConfidence,
      supportingEvidence: nextSupportingEvidence,
      contradictingEvidence: nextContradictingEvidence,
      status: updateHypothesisStatus({
        ...hypothesis,
        confidence: nextConfidence,
        supportingEvidence: nextSupportingEvidence,
        contradictingEvidence: nextContradictingEvidence,
      }),
    };
  });

  return {
    hypotheses: updated,
    strengthenedHypotheses: unique(strengthenedHypotheses),
    weakenedHypotheses: unique(weakenedHypotheses),
  };
};

const updateInformationGaps = (
  currentGaps: string[],
  question: InvestigationQuestion,
  answer: string
): string[] => {
  const normalizedAnswer = normalize(answer);
  const nextGaps = currentGaps.filter((gap) => normalize(gap) !== normalize(question.uncertaintyTarget));

  if (containsPattern(normalizedAnswer, /(nao sei|sem dado|desconhec|nao medido|ainda nao)/)) {
    nextGaps.push(`Dados pendentes sobre: ${question.uncertaintyTarget}`);
  }

  return unique(nextGaps);
};

export default class AdaptiveInvestigationEngine {
  public initialize(operationalObject: OperationalObject): AdaptiveInvestigationState {
    const createdAt = new Date().toISOString();

    const state: AdaptiveInvestigationState = {
      artifact: "AdaptiveInvestigationState",
      version: STATE_VERSION,
      investigationId: createId(),
      createdAt,
      updatedAt: createdAt,
      status: "ongoing",
      operationalObject,
      currentQuestion: null,
      askedQuestionIds: [],
      knownInformation: [operationalObject.problemStatement],
      evidenceRegistry: {
        items: [
          {
            id: createId(),
            title: "Interpretação inicial do problema",
            source: "Problem Interpreter",
            confidence: clampConfidence(operationalObject.confidence),
            investigationStep: "Definir",
          },
        ],
      },
      hypothesisRegistry: {
        items: buildInitialHypotheses(operationalObject),
      },
      hypotheses: buildInitialHypotheses(operationalObject),
      history: [],
      remainingInformationGaps: buildInitialGaps(operationalObject),
      currentConfidence: clampConfidence(operationalObject.confidence),
    };

    return {
      ...state,
      currentQuestion: chooseNextQuestion(state),
    };
  }

  public registerAnswer(state: AdaptiveInvestigationState, answer: string): AdaptiveInvestigationState {
    const trimmedAnswer = answer.trim();

    if (!state.currentQuestion || trimmedAnswer.length === 0) {
      return state;
    }

    const confidenceBefore = state.currentConfidence;
    const evidenceItem: EvidenceItem = {
      id: createId(),
      title: state.currentQuestion.question,
      source: `Resposta do usuário: ${trimmedAnswer}`,
      confidence: clampConfidence(Math.max(0.2, scoreAnswerSignal(trimmedAnswer) + 0.55)),
      investigationStep: state.currentQuestion.step,
    };

    const hypothesisUpdate = updateHypothesesFromAnswer(state.hypotheses, trimmedAnswer, evidenceItem.id);
    const answerScore = scoreAnswerSignal(trimmedAnswer);

    const confidenceDelta =
      answerScore +
      hypothesisUpdate.strengthenedHypotheses.length * 0.015 +
      hypothesisUpdate.weakenedHypotheses.length * 0.01;

    const confidenceAfter = clampConfidence(confidenceBefore + confidenceDelta);

    const remainingInformationGaps = updateInformationGaps(
      state.remainingInformationGaps,
      state.currentQuestion,
      trimmedAnswer
    );

    const turn: InvestigationTurn = {
      id: createId(),
      questionId: state.currentQuestion.id,
      questionAsked: state.currentQuestion.question,
      userAnswer: trimmedAnswer,
      whyQuestionWasAsked: state.currentQuestion.whyAsked,
      uncertaintyReduced: state.currentQuestion.uncertaintyTarget,
      objective: state.currentQuestion.objective,
      strengthenedHypotheses: hypothesisUpdate.strengthenedHypotheses,
      weakenedHypotheses: hypothesisUpdate.weakenedHypotheses,
      confidenceBefore,
      confidenceAfter,
      remainingInformationGaps,
      createdAt: new Date().toISOString(),
    };

    const nextState: AdaptiveInvestigationState = {
      ...state,
      updatedAt: new Date().toISOString(),
      currentConfidence: confidenceAfter,
      hypotheses: hypothesisUpdate.hypotheses,
      evidenceRegistry: {
        items: [...state.evidenceRegistry.items, evidenceItem],
      },
      hypothesisRegistry: {
        items: hypothesisUpdate.hypotheses,
      },
      history: [...state.history, turn],
      askedQuestionIds: unique([...state.askedQuestionIds, state.currentQuestion.id]),
      knownInformation: unique([...state.knownInformation, trimmedAnswer]),
      remainingInformationGaps,
    };

    const nextQuestion = chooseNextQuestion(nextState);

    return {
      ...nextState,
      currentQuestion: nextQuestion,
      status: nextQuestion ? "ongoing" : "ready-for-synthesis",
    };
  }
}
