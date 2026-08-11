import {
  AdaptiveInvestigationState,
  EvidenceItem,
  HypothesisState,
  InvestigationOutput,
  InvestigationObjective,
  InvestigationQuestion,
  InvestigationTurn,
  LifecyclePromotionAuditEntry,
} from "../artifacts/AdaptiveInvestigationState";
import { OperationalObject } from "../artifacts/OperationalObject";
import ConfidenceEvidenceFramework from "../cef/ConfidenceEvidenceFramework";
import DecisionIntegrityGuard from "../governance/DecisionIntegrityGuard";
import HypothesisLifecycleGovernor, {
  createLifecyclePromotionAuditEntry,
} from "../governance/HypothesisLifecycleGovernor";
import RuntimeExecutionTelemetry, { RuntimeExecutionContext } from "../telemetry/RuntimeExecutionTelemetry";
import EvidenceSemanticInterpreter from "../semantic/EvidenceSemanticInterpreter";
import CompetitiveHypothesisManager from "../hypotheses/CompetitiveHypothesisManager";
import EvidenceAcquisitionPlanner from "../planning/EvidenceAcquisitionPlanner";
import DomainExpertCommunicationLayer from "../communication/DomainExpertCommunicationLayer";
import CognitiveMemoryWindow from "../memory/CognitiveMemoryWindow";

const MIN_CONFIDENCE = 0;
const MAX_CONFIDENCE = 1;
const STATE_VERSION = "1.1.0";
const confidenceEvidenceFramework = new ConfidenceEvidenceFramework();
const lifecycleGovernor = new HypothesisLifecycleGovernor();
const decisionIntegrityGuard = new DecisionIntegrityGuard();
const evidenceSemanticInterpreter = new EvidenceSemanticInterpreter();
const competitiveHypothesisManager = new CompetitiveHypothesisManager();
const evidenceAcquisitionPlanner = new EvidenceAcquisitionPlanner();
const domainExpertCommunicationLayer = new DomainExpertCommunicationLayer();
const cognitiveMemoryWindow = new CognitiveMemoryWindow();

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

const buildQuestionJustification = (
  state: AdaptiveInvestigationState,
  question: string,
  uncertaintyTarget: string
) => {
  const strongest = [...state.hypotheses].sort((a, b) => b.confidence - a.confidence)[0];
  return {
    reason: `Investigar ${uncertaintyTarget} para reduzir incerteza e validar a hipótese dominante ${strongest?.description ?? "principal"}.`,
    supports: strongest ? [strongest.id] : [],
    expectedInformationGain: clampConfidence((strongest?.confidence ?? 0.5) + 0.2),
    domain: state.operationalObject.domain,
    expertPattern: "domain-specialist-questioning",
  };
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

const createExecutionContext = (
  runtimeId: string,
  provided?: Partial<RuntimeExecutionContext>
): RuntimeExecutionContext => {
  return {
    sessionId: provided?.sessionId ?? `session-${createId()}`,
    runtimeId,
    requestId: provided?.requestId ?? `req-${createId()}`,
    retryCount: provided?.retryCount ?? 0,
  };
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
  const createdAt = new Date().toISOString();

  const base = domains.map((domain, index) => ({
    id: `h-${index + 1}-${normalize(domain).replace(/[^a-z0-9]+/g, "-")}`,
    description: `A principal causa está relacionada ao domínio ${domain}.`,
    confidence: clampConfidence(operationalObject.confidence - 0.08 + index * 0.02),
    lifecycleStatus: "Draft" as const,
    supportingEvidence: [],
    contradictingEvidence: [],
    missingEvidence: [],
    nextRecommendedInvestigation: "Coletar evidência objetiva para reduzir incerteza sobre causalidade.",
    reasoningSummary:
      "Hipótese em Draft: existe possibilidade causal, porém ainda sem evidências objetivas suficientes para suporte ou confirmação.",
    confidenceHistory: confidenceEvidenceFramework.buildInitialHistory(
      createdAt,
      clampConfidence(operationalObject.confidence - 0.08 + index * 0.02)
    ),
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
      lifecycleStatus: "Draft" as const,
      supportingEvidence: [],
      contradictingEvidence: [],
      missingEvidence: [],
      nextRecommendedInvestigation: "Comparar dados de casos afetados e não afetados para testar variabilidade.",
      reasoningSummary:
        "Hipótese em Draft: requer evidência de contraste e medição para evoluir no ciclo de vida.",
      confidenceHistory: confidenceEvidenceFramework.buildInitialHistory(
        createdAt,
        clampConfidence(operationalObject.confidence - 0.04)
      ),
      status: "Active" as const,
      keywords: ["variacao", "processo", "desvio", "instabilidade"],
    },
    {
      id: "h-controle",
      description: "Há desvio de controle entre planejamento e execução.",
      confidence: clampConfidence(operationalObject.confidence - 0.06),
      lifecycleStatus: "Draft" as const,
      supportingEvidence: [],
      contradictingEvidence: [],
      missingEvidence: [],
      nextRecommendedInvestigation: "Levantar evidências de aderência entre padrão planejado e execução real.",
      reasoningSummary:
        "Hipótese em Draft: precisa de evidência observável para passar de possibilidade para probabilidade.",
      confidenceHistory: confidenceEvidenceFramework.buildInitialHistory(
        createdAt,
        clampConfidence(operationalObject.confidence - 0.06)
      ),
      status: "Active" as const,
      keywords: ["controle", "planejamento", "execucao", "checklist", "padrao"],
    },
  ].slice(0, 4);
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

  const memoryCandidate = {
    id: template.id,
    question: questionText,
    uncertaintyTarget: template.uncertaintyTarget,
  };

  if (!cognitiveMemoryWindow.shouldAskQuestion(memoryCandidate, state)) {
    return null;
  }

  const specialized = domainExpertCommunicationLayer.composeQuestion({
    domain: state.operationalObject.domain,
    context: state.operationalObject.problemStatement,
    targetEvidence: { reason: template.whyAsked(context, state) },
    state,
  });

  const question = specializeQuestion(questionText, specialized.question, state.operationalObject.domain);

  return {
    id: template.id,
    step: template.step,
    intro: template.intro,
    question,
    placeholder: template.placeholder,
    whyAsked: template.whyAsked(context, state),
    uncertaintyTarget: template.uncertaintyTarget,
    objective: template.objective,
    questionJustification: {
      ...buildQuestionJustification(state, question, template.uncertaintyTarget),
      reason: `${specialized.justification.reason} ${template.whyAsked(context, state)}`,
      domain: state.operationalObject.domain,
      expertPattern: specialized.justification.expertPattern,
      expectedInformationGain: clampConfidence(specialized.justification.expectedInformationGain),
    },
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


const specializeQuestion = (fallback: string, specialized: string, domain: string): string => {
  const normalizedDomain = domain.toLowerCase();
  if (normalizedDomain.includes("farmac") || normalizedDomain.includes("automot") || normalizedDomain.includes("hospital") || normalizedDomain.includes("finance")) {
    return specialized;
  }
  return fallback;
};

const buildInvestigationOutput = (state: AdaptiveInvestigationState): InvestigationOutput => {
  const strongest = [...state.hypotheses].sort((a, b) => b.confidence - a.confidence)[0];
  const supporting = state.evidenceRegistry.items.filter((item) => item.relation === "Support");
  const contradicting = state.evidenceRegistry.items.filter((item) => item.relation === "Contradiction");
  const decision = decisionIntegrityGuard.evaluate(state);
  const targetEvidence = evidenceAcquisitionPlanner.plan(state);

  const recommendedInvestigation =
    strongest?.nextRecommendedInvestigation ||
    state.remainingInformationGaps[0] ||
    "Coletar evidências objetivas adicionais antes de consolidar decisão.";

  return {
    problem: state.operationalObject.problemStatement,
    hypotheses: state.hypotheses.map((hypothesis) => ({
      id: hypothesis.id,
      description: hypothesis.description,
      confidence: hypothesis.confidence,
      lifecycleStatus: hypothesis.lifecycleStatus,
      reasoningSummary: hypothesis.reasoningSummary,
    })),
    confidence: {
      global: strongest?.confidence ?? state.currentConfidence,
      strongestHypothesisId: strongest?.id ?? null,
    },
    evidence: {
      supporting,
      contradicting,
    },
    missingEvidence: unique(state.hypotheses.flatMap((hypothesis) => hypothesis.missingEvidence)),
    recommendedInvestigation,
    targetEvidence,
    decision,
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
  public initialize(
    operationalObject: OperationalObject,
    executionContext?: Partial<RuntimeExecutionContext>
  ): AdaptiveInvestigationState {
    const runtimeId = createId();
    const telemetry = new RuntimeExecutionTelemetry(createExecutionContext(runtimeId, executionContext));
    const createdAt = new Date().toISOString();

    try {
      telemetry.markModuleStart("runtime.initialize");
      telemetry.addEvent("RuntimeInitializationStarted", "Inicialização do runtime iniciada.");

      const initialHypotheses = buildInitialHypotheses(operationalObject).map((hypothesis) => {
        const missingEvidence = confidenceEvidenceFramework.computeMissingEvidence(
          operationalObject.requiredInformation,
          hypothesis
        );

        return {
          ...hypothesis,
          missingEvidence,
        };
      });

      const state: AdaptiveInvestigationState = {
        artifact: "AdaptiveInvestigationState",
        version: STATE_VERSION,
        investigationId: runtimeId,
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
              origin: "Problem Interpreter",
              question: "Resumo estruturado do problema inicial",
              answer: operationalObject.problemStatement,
              timestamp: createdAt,
              title: "Interpretação inicial do problema",
              source: "Problem Interpreter",
              confidence: clampConfidence(operationalObject.confidence),
              evidenceType: "ProcessObservation",
              evidenceCategory: "Contextual",
              weight: 0.45,
              weightLevel: "Medium",
              relatedHypothesisId: "contexto-global",
              relation: "Neutral",
              temporalCorrelation: 0.6,
              consistency: 0.7,
              provenance: {
                kind: "ContextualObservation",
                source: "Problem Interpreter",
                capturedAt: createdAt,
                confidence: clampConfidence(operationalObject.confidence),
                consistency: 0.7,
                temporalCorrelation: 0.6,
              },
              investigationStep: "Definir",
            },
          ],
        },
        hypothesisRegistry: {
          items: initialHypotheses,
        },
        hypotheses: initialHypotheses,
        history: [],
        lifecycleAuditTrail: [],
        remainingInformationGaps: buildInitialGaps(operationalObject),
        currentConfidence: clampConfidence(operationalObject.confidence),
        investigationOutput: {
          problem: operationalObject.problemStatement,
          hypotheses: initialHypotheses.map((hypothesis) => ({
            id: hypothesis.id,
            description: hypothesis.description,
            confidence: hypothesis.confidence,
            lifecycleStatus: hypothesis.lifecycleStatus,
            reasoningSummary: hypothesis.reasoningSummary,
          })),
          confidence: {
            global: clampConfidence(operationalObject.confidence),
            strongestHypothesisId: initialHypotheses[0]?.id ?? null,
          },
          evidence: {
            supporting: [],
            contradicting: [],
          },
          missingEvidence: unique(initialHypotheses.flatMap((hypothesis) => hypothesis.missingEvidence)),
          recommendedInvestigation: operationalObject.requiredInformation[0] || "Iniciar coleta objetiva de evidências.",
          decision: {
            status: "insufficient-evidence",
            rationale: "A investigação foi iniciada e ainda não possui evidência suficiente para decisão.",
          },
        },
        runtimeTelemetry: [],
      };

      const nextQuestion = chooseNextQuestion(state);
      const nextState: AdaptiveInvestigationState = {
        ...state,
        currentQuestion: nextQuestion,
        status: nextQuestion ? "ongoing" : "ready-for-synthesis",
      };

      telemetry.markModuleEnd("runtime.initialize");
      telemetry.addEvent("RuntimeInitializationCompleted", "Inicialização do runtime concluída com sucesso.");
      telemetry.markSuccess();

      return {
        ...nextState,
        investigationOutput: buildInvestigationOutput(nextState),
        runtimeTelemetry: [telemetry.finalize()],
      };
    } catch (error) {
      telemetry.addError("runtime.initialize", error instanceof Error ? error.message : "Unknown initialization error");
      telemetry.markModuleEnd("runtime.initialize");
      telemetry.addEvent("RuntimeInitializationFailed", "Inicialização do runtime falhou.");
      telemetry.finalize();
      throw error;
    }
  }

  public registerAnswer(
    state: AdaptiveInvestigationState,
    answer: string,
    executionContext?: Partial<RuntimeExecutionContext>
  ): AdaptiveInvestigationState {
    const telemetry = new RuntimeExecutionTelemetry(
      createExecutionContext(state.investigationId, executionContext)
    );
    const trimmedAnswer = answer.trim();

    telemetry.markModuleStart("runtime.registerAnswer");
    telemetry.addEvent("AnswerRegistrationStarted", "Registro de resposta investigativa iniciado.");

    if (!state.currentQuestion) {
      telemetry.markInterrupted("MissingCurrentQuestion");
      telemetry.addEvent("AnswerRegistrationInterrupted", "Registro interrompido: runtime sem currentQuestion.");
      telemetry.markModuleEnd("runtime.registerAnswer");
      const interruptedTrace = telemetry.finalize();
      return {
        ...state,
        runtimeTelemetry: [...state.runtimeTelemetry, interruptedTrace].slice(-40),
      };
    }

    if (trimmedAnswer.length === 0) {
      telemetry.markInterrupted("EmptyAnswer");
      telemetry.addEvent("AnswerRegistrationInterrupted", "Registro interrompido: resposta vazia.");
      telemetry.markModuleEnd("runtime.registerAnswer");
      const interruptedTrace = telemetry.finalize();
      return {
        ...state,
        runtimeTelemetry: [...state.runtimeTelemetry, interruptedTrace].slice(-40),
      };
    }

    try {
      const confidenceBefore = state.currentConfidence;
      const timestamp = new Date().toISOString();

      telemetry.markModuleStart("runtime.gapUpdate");
      const remainingInformationGaps = updateInformationGaps(
        state.remainingInformationGaps,
        state.currentQuestion,
        trimmedAnswer
      );
      telemetry.markModuleEnd("runtime.gapUpdate");

      telemetry.markModuleStart("runtime.evidenceCreation");
      if (!state.currentQuestion) {
        throw new Error("Current question is required to register evidence.");
      }

      const currentQuestion = state.currentQuestion;
      const generatedEvidence = state.hypotheses.map((hypothesis) => {
        const semantic = evidenceSemanticInterpreter.interpret(
          {
            answer: trimmedAnswer,
            question: currentQuestion,
            context: { domain: state.operationalObject.domain },
          },
          { hypothesisId: hypothesis.id }
        );

        const record = confidenceEvidenceFramework.createEvidenceRecord({
          id: createId(),
          origin: "Investigation Flow",
          question: currentQuestion,
          answer: trimmedAnswer,
          investigationStep: currentQuestion.step || "Investigar",
          relatedHypothesisId: hypothesis.id,
          keywords: hypothesis.keywords,
          timestamp,
          provenance: {
            kind: "ContextualInterview",
            source: currentQuestion.question,
            capturedAt: timestamp,
            confidence: Math.max(0.35, Math.min(0.65, state.currentConfidence)),
            consistency: 0.55,
            temporalCorrelation: 0.5,
          },
        });

        return evidenceSemanticInterpreter.attachSemanticProfile(record, semantic.profile);
      });
      telemetry.markModuleEnd("runtime.evidenceCreation");

      const relevantEvidence = generatedEvidence.filter((item) => item.relation !== "Neutral");
      const evidenceToRegister = relevantEvidence.length > 0 ? relevantEvidence : [generatedEvidence[0]];
      const evidenceByHypothesis = new Map<string, EvidenceItem[]>(
        state.hypotheses.map((hypothesis) => [
          hypothesis.id,
          [
            ...state.evidenceRegistry.items.filter((item) => item.relatedHypothesisId === hypothesis.id),
            ...evidenceToRegister.filter((item) => item.relatedHypothesisId === hypothesis.id),
          ],
        ])
      );

      const strengthenedHypotheses: string[] = [];
      const weakenedHypotheses: string[] = [];
      const promotionEntries: LifecyclePromotionAuditEntry[] = [];

      telemetry.markModuleStart("runtime.lifecycleGovernance");

      const updatedHypotheses = state.hypotheses.map((hypothesis) => {
      const missingEvidence = confidenceEvidenceFramework.computeMissingEvidence(
        remainingInformationGaps,
        hypothesis
      );

      const evaluation = confidenceEvidenceFramework.evaluate({
        hypothesis,
        evidence: evidenceByHypothesis.get(hypothesis.id) ?? [],
        missingEvidence,
        timestamp,
      });

      if (evaluation.confidence > hypothesis.confidence) {
        strengthenedHypotheses.push(hypothesis.id);
      }

      if (evaluation.confidence < hypothesis.confidence) {
        weakenedHypotheses.push(hypothesis.id);
      }

      const governanceDecision = lifecycleGovernor.resolve({
        hypothesis,
        proposedStatus: evaluation.lifecycleStatus,
        confidence: evaluation.confidence,
        relatedEvidence: evidenceByHypothesis.get(hypothesis.id) ?? [],
        missingEvidence,
      });

      const governedLifecycleStatus = governanceDecision.lifecycleStatus;
      const status =
        governedLifecycleStatus === "Rejected"
          ? "Discarded"
          : governedLifecycleStatus === "Confirmed" && missingEvidence.length === 0
          ? "Confirmed"
          : "Active";

      if (governedLifecycleStatus !== hypothesis.lifecycleStatus && governanceDecision.promoterEvidence) {
        promotionEntries.push(
          createLifecyclePromotionAuditEntry({
            id: createId(),
            governanceEvaluationId: governanceDecision.governanceEvaluationId,
            hypothesis,
            from: hypothesis.lifecycleStatus,
            to: governedLifecycleStatus,
            ruleApplied: governanceDecision.ruleApplied,
            predominantCategory:
              governanceDecision.predominantCategory ?? governanceDecision.promoterEvidence.evidenceCategory,
            justification: governanceDecision.justification,
            promoterEvidence: governanceDecision.promoterEvidence,
            createdAt: timestamp,
          })
        );
      }

      return {
        ...hypothesis,
        confidence: evaluation.confidence,
        lifecycleStatus: governedLifecycleStatus,
        supportingEvidence: evaluation.supportingEvidenceIds,
        contradictingEvidence: evaluation.contradictingEvidenceIds,
        missingEvidence,
        nextRecommendedInvestigation: evaluation.nextRecommendedInvestigation,
        reasoningSummary: `${evaluation.reasoningSummary} Governança: ${governanceDecision.justification}`,
        confidenceHistory: [...hypothesis.confidenceHistory, evaluation.confidenceEntry],
        status,
      };
      });
      telemetry.markModuleEnd("runtime.lifecycleGovernance");

      const competitiveHypotheses = competitiveHypothesisManager.updateCompetition(
        updatedHypotheses as HypothesisState[],
        evidenceToRegister,
        { domain: state.operationalObject.domain }
      );

      const confidenceAfter = clampConfidence(
        updatedHypotheses.reduce((max, hypothesis) => Math.max(max, hypothesis.confidence), 0)
      );

      const turn: InvestigationTurn = {
      id: createId(),
      questionId: state.currentQuestion.id,
      questionAsked: state.currentQuestion.question,
      userAnswer: trimmedAnswer,
      whyQuestionWasAsked: state.currentQuestion.whyAsked,
      uncertaintyReduced: state.currentQuestion.uncertaintyTarget,
      objective: state.currentQuestion.objective,
      strengthenedHypotheses: unique(strengthenedHypotheses),
      weakenedHypotheses: unique(weakenedHypotheses),
      confidenceBefore,
      confidenceAfter,
      remainingInformationGaps,
      createdAt: timestamp,
      };

      const nextState: AdaptiveInvestigationState = {
      ...state,
      updatedAt: timestamp,
      currentConfidence: confidenceAfter,
      hypotheses: competitiveHypotheses,
      evidenceRegistry: {
        items: [...state.evidenceRegistry.items, ...evidenceToRegister],
      },
      hypothesisRegistry: {
        items: competitiveHypotheses,
      },
      history: [...state.history, turn],
      lifecycleAuditTrail: [...state.lifecycleAuditTrail, ...promotionEntries],
      askedQuestionIds: unique([...state.askedQuestionIds, state.currentQuestion.id]),
      knownInformation: unique([...state.knownInformation, trimmedAnswer]),
      remainingInformationGaps,
      investigationOutput: state.investigationOutput,
      runtimeTelemetry: state.runtimeTelemetry,
      };

      telemetry.markModuleStart("runtime.questionSelection");
      const nextQuestion = chooseNextQuestion(nextState);
      telemetry.markModuleEnd("runtime.questionSelection");

      const withQuestionState: AdaptiveInvestigationState = {
      ...nextState,
      currentQuestion: nextQuestion ? {
        ...nextQuestion,
        questionJustification: nextQuestion.questionJustification ?? buildQuestionJustification(nextState, nextQuestion.question, nextQuestion.uncertaintyTarget),
      } : null,
      status: nextQuestion ? "ongoing" : "ready-for-synthesis",
      };

      telemetry.markModuleStart("runtime.decisionIntegrity");
      const investigationOutput = buildInvestigationOutput(withQuestionState);
      telemetry.markModuleEnd("runtime.decisionIntegrity");

      telemetry.markModuleEnd("runtime.registerAnswer");
      telemetry.addEvent(
        "AnswerRegistrationCompleted",
        `Registro concluído com ${promotionEntries.length} transições auditadas de lifecycle.`
      );
      telemetry.markSuccess();

      const executionTrace = telemetry.finalize();

      return {
        ...withQuestionState,
        investigationOutput,
        runtimeTelemetry: [...withQuestionState.runtimeTelemetry, executionTrace].slice(-40),
      };
    } catch (error) {
      telemetry.addError("runtime.registerAnswer", error instanceof Error ? error.message : "Unknown registerAnswer error");
      telemetry.markModuleEnd("runtime.registerAnswer");
      telemetry.addEvent("AnswerRegistrationFailed", "Registro de resposta investigativa falhou.");
      const errorTrace = telemetry.finalize();

      return {
        ...state,
        runtimeTelemetry: [...state.runtimeTelemetry, errorTrace].slice(-40),
      };
    }
  }
}
