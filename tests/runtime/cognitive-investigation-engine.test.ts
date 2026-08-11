import test from 'node:test';
import assert from 'node:assert/strict';

import AdaptiveInvestigationEngine from '../../runtime/engines/AdaptiveInvestigationEngine.ts';
import EvidenceSemanticInterpreter from '../../runtime/semantic/EvidenceSemanticInterpreter.ts';
import CompetitiveHypothesisManager from '../../runtime/hypotheses/CompetitiveHypothesisManager.ts';
import EvidenceAcquisitionPlanner from '../../runtime/planning/EvidenceAcquisitionPlanner.ts';
import DomainExpertCommunicationLayer from '../../runtime/communication/DomainExpertCommunicationLayer.ts';
import CognitiveMemoryWindow from '../../runtime/memory/CognitiveMemoryWindow.ts';
import type { AdaptiveInvestigationState, EvidenceItem, HypothesisState } from '../../runtime/artifacts/AdaptiveInvestigationState.ts';
import type { OperationalObject } from '../../runtime/artifacts/OperationalObject.ts';
import { Impact } from '../../runtime/types/Impact.ts';
import { Severity } from '../../runtime/types/Severity.ts';
import { Urgency } from '../../runtime/types/Urgency.ts';

const timestamp = '2026-08-10T09:00:00.000Z';

const createOperationalObject = (): OperationalObject => ({
  artifact: 'OperationalObject',
  version: '1.1.0',
  problemStatement: 'A taxa de defeito aumentou após troca de lote.',
  domain: 'Farmacêutica',
  category: 'Manufatura',
  process: 'Envase',
  severity: Severity.High,
  urgency: Urgency.High,
  impact: Impact.High,
  suspectedDomains: ['Qualidade', 'Suprimento'],
  requiredInformation: ['Evidência objetiva de validação'],
  confidence: 0.62,
});

const createHypothesis = (id: string, confidence: number, lifecycleStatus: HypothesisState['lifecycleStatus']): HypothesisState => ({
  id,
  description: `Hipótese ${id}`,
  confidence,
  lifecycleStatus,
  supportingEvidence: [],
  contradictingEvidence: [],
  missingEvidence: [],
  nextRecommendedInvestigation: 'Investigar',
  reasoningSummary: 'Resumo',
  confidenceHistory: [],
  status: 'Active',
  keywords: ['teste', 'lote'],
});

const createEvidence = (partial: Partial<EvidenceItem>): EvidenceItem => ({
  id: partial.id ?? 'e-1',
  origin: 'Investigation Flow',
  question: 'Pergunta',
  answer: 'Resposta',
  timestamp,
  title: 'Evidência',
  source: 'Fonte',
  confidence: 0.9,
  evidenceType: 'ValidationRecord',
  evidenceCategory: 'Validation',
  weight: 0.9,
  weightLevel: 'VeryHigh',
  relatedHypothesisId: partial.relatedHypothesisId ?? 'h-1',
  relation: 'Support',
  temporalCorrelation: 0.8,
  consistency: 0.9,
  provenance: {
    kind: 'ValidationArtifact',
    source: 'Relatório',
    capturedAt: timestamp,
    confidence: 0.9,
    consistency: 0.9,
    temporalCorrelation: 0.8,
  },
  investigationStep: 'Validar',
  ...partial,
});

const createState = (hypotheses: HypothesisState[], evidence: EvidenceItem[] = []): AdaptiveInvestigationState => ({
  artifact: 'AdaptiveInvestigationState',
  version: '1.1.0',
  investigationId: 'runtime-cognitive',
  createdAt: timestamp,
  updatedAt: timestamp,
  status: 'ongoing',
  operationalObject: createOperationalObject(),
  currentQuestion: null,
  askedQuestionIds: [],
  knownInformation: ['base'],
  evidenceRegistry: { items: evidence },
  hypothesisRegistry: { items: hypotheses },
  hypotheses,
  history: [],
  lifecycleAuditTrail: [],
  remainingInformationGaps: ['Dados de validação'],
  currentConfidence: 0.62,
  investigationOutput: {
    problem: 'base',
    hypotheses: hypotheses.map((hypothesis) => ({
      id: hypothesis.id,
      description: hypothesis.description,
      confidence: hypothesis.confidence,
      lifecycleStatus: hypothesis.lifecycleStatus,
      reasoningSummary: hypothesis.reasoningSummary,
    })),
    confidence: { global: 0.62, strongestHypothesisId: hypotheses[0]?.id ?? null },
    evidence: { supporting: [], contradicting: [] },
    missingEvidence: [],
    recommendedInvestigation: 'Investigar',
    decision: { status: 'insufficient-evidence', rationale: 'Aguardando' },
  },
  runtimeTelemetry: [],
});

test('semantic interpreter flags evidence gaps and validation pending', () => {
  const interpreter = new EvidenceSemanticInterpreter();
  const profile = interpreter.interpret(
    {
      answer: 'Não sei o valor medido ainda e preciso validar com teste controlado.',
      question: { question: 'O defeito é recorrente?' },
      context: { domain: 'Farmacêutica' },
    },
    { hypothesisId: 'h-1' }
  );

  assert.equal(profile.profile.reveals_gap, true);
  assert.equal(profile.profile.requires_validation, true);
  assert.equal(profile.profile.supports_hypothesis, false);
  assert.equal(profile.profile.contradicts_hypothesis, false);
});

test('competitive hypothesis manager establishes competition and dominance', () => {
  const manager = new CompetitiveHypothesisManager();
  const hypotheses = [
    createHypothesis('h-1', 0.8, 'Candidate'),
    createHypothesis('h-2', 0.74, 'Candidate'),
    createHypothesis('h-3', 0.2, 'Draft'),
  ];
  const evidence = [
    createEvidence({ relatedHypothesisId: 'h-1', relation: 'Support' }),
    createEvidence({ id: 'e-2', relatedHypothesisId: 'h-2', relation: 'Contradiction' }),
  ];

  const updated = manager.updateCompetition(hypotheses, evidence, { domain: 'Farmacêutica' });
  const dominant = updated.find((hypothesis) => hypothesis.competition?.isDominant);

  assert.ok(dominant);
  assert.equal(dominant?.competition?.dominantHypothesisId, dominant?.id);
  assert.ok(updated.some((hypothesis) => hypothesis.competition?.competingHypothesisIds.includes('h-1')));
});

test('planner prioritizes evidence acquisition with uncertainty reduction', () => {
  const planner = new EvidenceAcquisitionPlanner();
  const state = createState([
    createHypothesis('h-1', 0.71, 'Candidate'),
    createHypothesis('h-2', 0.62, 'Candidate'),
  ], [createEvidence({ relation: 'Contradiction' })]);

  const plan = planner.plan(state);
  assert.ok(plan.priority >= 0.7);
  assert.ok(plan.expectedUncertaintyReduction > 0);
  assert.match(plan.reason, /incerteza|contradição|validação/i);
  assert.ok(plan.recommendedAcquisition.length > 0);
});

test('domain expert layer produces specialized wording and authenticity score', () => {
  const layer = new DomainExpertCommunicationLayer();
  const result = layer.composeQuestion({
    domain: 'Farmacêutica',
    context: 'Investigação de falha de esterilidade',
    targetEvidence: { reason: 'Validar integridade do filtro esterilizante' },
    state: createState([createHypothesis('h-1', 0.74, 'Candidate')]),
  });

  assert.match(result.question, /filtro esterilizante|integridade/i);
  assert.ok(result.domainAuthenticityScore >= 0.75);
  assert.equal(result.justification.domain, 'Farmacêutica');
  assert.ok(result.justification.expectedInformationGain > 0);
});

test('memory window suppresses redundant questions', () => {
  const window = new CognitiveMemoryWindow();
  const state = createState([createHypothesis('h-1', 0.74, 'Candidate')]);
  state.history = [
    {
      id: 't-1',
      questionId: 'q-1',
      questionAsked: 'O problema é recorrente?',
      userAnswer: 'Sim',
      whyQuestionWasAsked: 'reduzir incerteza',
      uncertaintyReduced: 'Recorrência',
      objective: 'Reduzir incerteza',
      strengthenedHypotheses: [],
      weakenedHypotheses: [],
      confidenceBefore: 0.6,
      confidenceAfter: 0.65,
      remainingInformationGaps: [],
      createdAt: timestamp,
    },
  ];

  assert.equal(
    window.shouldAskQuestion(
      { id: 'q-2', question: 'O problema é recorrente?', uncertaintyTarget: 'Recorrência' },
      state
    ),
    false
  );
});

test('engine enriches questions with justification and planner guidance', () => {
  const engine = new AdaptiveInvestigationEngine();
  const initial = engine.initialize(createOperationalObject(), {
    sessionId: 'session-cog',
    requestId: 'req-cog',
    retryCount: 0,
  });

  const updated = engine.registerAnswer(initial, 'Não sei o valor medido ainda e preciso validar com teste controlado.', {
    sessionId: 'session-cog',
    requestId: 'req-cog-answer',
    retryCount: 0,
  });

  assert.ok(updated.currentQuestion);
  assert.ok(updated.currentQuestion?.questionJustification?.reason);
  assert.ok(updated.currentQuestion?.questionJustification?.expectedInformationGain > 0);
  assert.ok(updated.investigationOutput.targetEvidence?.priority >= 0);
  assert.ok(updated.investigationOutput.targetEvidence?.recommendedAcquisition.length > 0);
});
