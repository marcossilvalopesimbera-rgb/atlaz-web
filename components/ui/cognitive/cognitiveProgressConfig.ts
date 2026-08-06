export type CognitiveEngineKey =
  | 'problemInterpreter'
  | 'contextAnalysis'
  | 'hypothesisGeneration'
  | 'evidenceValidation'
  | 'decisionConsolidation'
  | 'learning'
  | 'evolution';

export type CognitiveTimelineStage = {
  id: string;
  label: string;
  engineLabel: string;
  engineKey: CognitiveEngineKey;
};

export type CognitiveProgressMessage = {
  label: string;
  purpose: string;
};

export type CognitiveEngineConfig = {
  stageTitle: string;
  engineName: string;
  completionMessage: string;
  progressMessages: readonly CognitiveProgressMessage[];
  educationalInsights: readonly string[];
};

export const COGNITIVE_TIMELINE: readonly CognitiveTimelineStage[] = [
  {
    id: 'understand',
    label: 'Compreender',
    engineLabel: 'Interpretador de Problema',
    engineKey: 'problemInterpreter',
  },
  {
    id: 'delimit',
    label: 'Delimitar',
    engineLabel: 'Análise de Contexto',
    engineKey: 'contextAnalysis',
  },
  {
    id: 'explore',
    label: 'Explorar',
    engineLabel: 'Geração de Hipóteses',
    engineKey: 'hypothesisGeneration',
  },
  {
    id: 'validate',
    label: 'Validar',
    engineLabel: 'Validação de Evidências',
    engineKey: 'evidenceValidation',
  },
  {
    id: 'consolidate',
    label: 'Consolidar',
    engineLabel: 'Consolidação de Decisão',
    engineKey: 'decisionConsolidation',
  },
  {
    id: 'learn',
    label: 'Aprender',
    engineLabel: 'Aprendizado',
    engineKey: 'learning',
  },
  {
    id: 'evolve',
    label: 'Evoluir',
    engineLabel: 'Evolução',
    engineKey: 'evolution',
  },
] as const;

export const COGNITIVE_ENGINE_CONFIG: Readonly<Record<CognitiveEngineKey, CognitiveEngineConfig>> = {
  problemInterpreter: {
    stageTitle: 'Compreender',
    engineName: 'Interpretador de Problema',
    completionMessage: '✓ Problema interpretado',
    progressMessages: [
      {
        label: 'Interpretando o problema...',
        purpose: 'Mapear sinais centrais, atores e impacto para iniciar a investigação com clareza.',
      },
      {
        label: 'Identificando o domínio operacional...',
        purpose: 'Relacionar o relato ao domínio mais provável e aos pontos de fricção prioritários.',
      },
      {
        label: 'Organizando o contexto...',
        purpose: 'Estruturar contexto inicial para guiar hipóteses e coleta de evidências.',
      },
      {
        label: 'Preparando a investigação...',
        purpose: 'Finalizar a base metodológica para avançar com perguntas de alto valor investigativo.',
      },
    ],
    educationalInsights: [
      'Boas investigações validam evidências antes de confirmar conclusões.',
      'Hipóteses fortes explicam múltiplos sintomas observados ao mesmo tempo.',
      'Evidências confiáveis reduzem incerteza e melhoram decisões executivas.',
      'Raciocínio estruturado evita conclusões prematuras em cenários complexos.',
    ],
  },
  contextAnalysis: {
    stageTitle: 'Delimitar',
    engineName: 'Análise de Contexto',
    completionMessage: '✓ Contexto compreendido',
    progressMessages: [
      {
        label: 'Delimitando fronteiras da investigação...',
        purpose: 'Definir escopo operacional, variáveis críticas e pontos de medição confiáveis.',
      },
      {
        label: 'Priorizando perguntas contextuais...',
        purpose: 'Selecionar perguntas que mais reduzem incerteza para a próxima etapa.',
      },
    ],
    educationalInsights: [
      'Escopo claro reduz retrabalho e acelera a investigação.',
      'Contexto bem delimitado aumenta a precisão das hipóteses.',
    ],
  },
  hypothesisGeneration: {
    stageTitle: 'Explorar',
    engineName: 'Geração de Hipóteses',
    completionMessage: '✓ Hipóteses organizadas',
    progressMessages: [
      {
        label: 'Mapeando hipóteses iniciais...',
        purpose: 'Gerar explicações plausíveis e ordená-las por coerência causal.',
      },
      {
        label: 'Priorizando linhas de investigação...',
        purpose: 'Direcionar esforço para hipóteses com maior potencial explicativo.',
      },
    ],
    educationalInsights: [
      'Hipóteses devem ser testáveis com evidências observáveis.',
      'Priorizar hipóteses evita dispersão analítica.',
    ],
  },
  evidenceValidation: {
    stageTitle: 'Validar',
    engineName: 'Validação de Evidências',
    completionMessage: '✓ Evidências consolidadas',
    progressMessages: [
      {
        label: 'Confrontando hipóteses com evidências...',
        purpose: 'Testar explicações com fatos para reduzir ambiguidade decisória.',
      },
      {
        label: 'Refinando confiança analítica...',
        purpose: 'Reforçar consistência entre sinais, causas e impacto observado.',
      },
    ],
    educationalInsights: [
      'Evidência de qualidade separa correlação de causalidade.',
      'Confiabilidade aumenta quando múltiplas fontes convergem.',
    ],
  },
  decisionConsolidation: {
    stageTitle: 'Consolidar',
    engineName: 'Consolidação de Decisão',
    completionMessage: '✓ Decisão preparada',
    progressMessages: [
      {
        label: 'Consolidando direcionamento executivo...',
        purpose: 'Transformar evidências em orientação prática e rastreável.',
      },
      {
        label: 'Preparando próxima ação recomendada...',
        purpose: 'Definir decisão com clareza de impacto, prioridade e continuidade.',
      },
    ],
    educationalInsights: [
      'Decisões sólidas conectam evidência, risco e impacto esperado.',
      'Clareza decisória reduz fricção entre áreas.',
    ],
  },
  learning: {
    stageTitle: 'Aprender',
    engineName: 'Aprendizado',
    completionMessage: '✓ Conhecimento atualizado',
    progressMessages: [
      {
        label: 'Consolidando lições aprendidas...',
        purpose: 'Registrar padrões para acelerar investigações futuras.',
      },
    ],
    educationalInsights: [
      'Aprendizado contínuo reduz reincidência de problemas.',
    ],
  },
  evolution: {
    stageTitle: 'Evoluir',
    engineName: 'Evolução',
    completionMessage: '✓ Evolução registrada',
    progressMessages: [
      {
        label: 'Convertendo aprendizado em evolução...',
        purpose: 'Transformar conclusões em melhoria sistêmica sustentável.',
      },
    ],
    educationalInsights: [
      'Evolução organizacional acontece quando decisões viram padrão.',
    ],
  },
};
