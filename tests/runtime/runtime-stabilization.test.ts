import test from 'node:test';
import assert from 'node:assert/strict';

import AdaptiveInvestigationEngine from '../../runtime/engines/AdaptiveInvestigationEngine.ts';
import DecisionIntegrityGuard from '../../runtime/governance/DecisionIntegrityGuard.ts';
import HypothesisLifecycleGovernor from '../../runtime/governance/HypothesisLifecycleGovernor.ts';
import RuntimeStateAuthenticator from '../../runtime/governance/RuntimeStateAuthenticator.ts';
import { AdaptiveInvestigationStateSchema } from '../../runtime/schemas/AdaptiveInvestigationStateSchema.ts';
import type {
  AdaptiveInvestigationState,
  EvidenceItem,
  HypothesisState,
  LifecyclePromotionAuditEntry,
} from '../../runtime/artifacts/AdaptiveInvestigationState.ts';
import type { OperationalObject } from '../../runtime/artifacts/OperationalObject.ts';
import { Impact } from '../../runtime/types/Impact.ts';
import { Severity } from '../../runtime/types/Severity.ts';
import { Urgency } from '../../runtime/types/Urgency.ts';

const timestamp = '2026-08-10T09:00:00.000Z';

const createHypothesis = (
  lifecycleStatus: HypothesisState['lifecycleStatus'],
  confidence = 0.7
): HypothesisState => ({
  id: 'h-1',
  description: 'Hipótese principal',
  confidence,
  lifecycleStatus,
  supportingEvidence: [],
  contradictingEvidence: [],
  missingEvidence: [],
  nextRecommendedInvestigation: 'Executar validação formal.',
  reasoningSummary: 'Resumo inicial',
  confidenceHistory: [],
  status: lifecycleStatus === 'Confirmed' ? 'Confirmed' : lifecycleStatus === 'Rejected' ? 'Discarded' : 'Active',
  keywords: ['fornecedor', 'lote'],
});

const createEvidence = (partial: Partial<EvidenceItem>): EvidenceItem => ({
  id: partial.id ?? 'e-1',
  origin: partial.origin ?? 'Investigation Flow',
  question: partial.question ?? 'Pergunta',
  answer: partial.answer ?? 'Resposta',
  timestamp: partial.timestamp ?? timestamp,
  title: partial.title ?? 'Evidência',
  source: partial.source ?? 'Fonte',
  confidence: partial.confidence ?? 0.9,
  evidenceType: partial.evidenceType ?? 'ValidationRecord',
  evidenceCategory: partial.evidenceCategory ?? 'Validation',
  weight: partial.weight ?? 0.9,
  weightLevel: partial.weightLevel ?? 'VeryHigh',
  relatedHypothesisId: partial.relatedHypothesisId ?? 'h-1',
  relation: partial.relation ?? 'Support',
  temporalCorrelation: partial.temporalCorrelation ?? 0.8,
  consistency: partial.consistency ?? 0.9,
  provenance:
    partial.provenance ??
    {
      kind: 'ValidationArtifact',
      source: 'Relatório formal',
      capturedAt: partial.timestamp ?? timestamp,
      confidence: partial.confidence ?? 0.9,
      consistency: partial.consistency ?? 0.9,
      temporalCorrelation: partial.temporalCorrelation ?? 0.8,
    },
  investigationStep: partial.investigationStep ?? 'Validar',
});

const createOperationalObject = (): OperationalObject => ({
  artifact: 'OperationalObject',
  version: '1.1.0',
  problemStatement: 'A taxa de defeito aumentou após troca de lote.',
  domain: 'Qualidade',
  category: 'Manufatura',
  process: 'Inspeção final',
  severity: Severity.High,
  urgency: Urgency.High,
  impact: Impact.High,
  suspectedDomains: ['Qualidade', 'Suprimento'],
  requiredInformation: ['Evidência objetiva de validação'],
  confidence: 0.62,
});

const createState = (
  hypothesis: HypothesisState,
  evidence: EvidenceItem[],
  missingEvidence: string[] = [],
  lifecycleAuditTrail: LifecyclePromotionAuditEntry[] = []
): AdaptiveInvestigationState => ({
  artifact: 'AdaptiveInvestigationState',
  version: '1.1.0',
  investigationId: 'runtime-1',
  createdAt: timestamp,
  updatedAt: timestamp,
  status: 'ongoing',
  operationalObject: createOperationalObject(),
  currentQuestion: null,
  askedQuestionIds: [],
  knownInformation: ['base'],
  evidenceRegistry: { items: evidence },
  hypothesisRegistry: {
    items: [
      {
        ...hypothesis,
        missingEvidence,
      },
    ],
  },
  hypotheses: [
    {
      ...hypothesis,
      missingEvidence,
    },
  ],
  history: [],
  lifecycleAuditTrail,
  remainingInformationGaps: missingEvidence,
  currentConfidence: hypothesis.confidence,
  investigationOutput: {
    problem: 'base',
    hypotheses: [
      {
        id: hypothesis.id,
        description: hypothesis.description,
        confidence: hypothesis.confidence,
        lifecycleStatus: hypothesis.lifecycleStatus,
        reasoningSummary: hypothesis.reasoningSummary,
      },
    ],
    confidence: {
      global: hypothesis.confidence,
      strongestHypothesisId: hypothesis.id,
    },
    evidence: {
      supporting: evidence.filter((item) => item.relation === 'Support'),
      contradicting: evidence.filter((item) => item.relation === 'Contradiction'),
    },
    missingEvidence,
    recommendedInvestigation: 'Executar validação formal.',
    decision: {
      status: 'insufficient-evidence',
      rationale: 'Aguardando análise.',
    },
  },
  runtimeTelemetry: [],
});

test('lifecycle governor blocks contextual evidence above plausible', () => {
  const governor = new HypothesisLifecycleGovernor();

  const decision = governor.resolve({
    hypothesis: createHypothesis('Candidate', 0.6),
    proposedStatus: 'Confirmed',
    confidence: 0.9,
    relatedEvidence: [
      createEvidence({
        evidenceType: 'OperatorOpinion',
        evidenceCategory: 'Contextual',
        provenance: {
          kind: 'ContextualInterview',
          source: 'Entrevista',
          capturedAt: timestamp,
          confidence: 0.8,
          consistency: 0.7,
          temporalCorrelation: 0.6,
        },
      }),
    ],
    missingEvidence: [],
  });

  assert.equal(decision.lifecycleStatus, 'Plausible');
  assert.equal(decision.ruleApplied, 'CategoryCeilingEnforced');
});

test('decision integrity blocks ready-for-decision without validation provenance', () => {
  const guard = new DecisionIntegrityGuard();
  const hypothesis = createHypothesis('Confirmed', 0.88);

  const state = createState(
    hypothesis,
    [
      createEvidence({
        evidenceType: 'ExperimentalConfirmation',
        evidenceCategory: 'Experimental',
        provenance: {
          kind: 'ExperimentalConfirmation',
          source: 'Ensaio controlado',
          capturedAt: timestamp,
          confidence: 0.9,
          consistency: 0.9,
          temporalCorrelation: 0.8,
        },
      }),
    ],
    []
  );

  const decision = guard.evaluate(state);
  assert.equal(decision.status, 'insufficient-evidence');
});

test('decision integrity allows ready-for-decision with validation evidence and consistency', () => {
  const guard = new DecisionIntegrityGuard();
  const hypothesis = createHypothesis('Confirmed', 0.93);
  const promotionEvidence = createEvidence({
    id: 'v-1',
    evidenceType: 'ValidationRecord',
    evidenceCategory: 'Validation',
    provenance: {
      kind: 'ValidationArtifact',
      source: 'Laudo independente',
      capturedAt: timestamp,
      confidence: 0.95,
      consistency: 0.93,
      temporalCorrelation: 0.85,
    },
  });

  const state = createState(
    hypothesis,
    [promotionEvidence],
    [],
    [
      {
        id: 'audit-1',
        governanceEvaluationId: 'gov-1',
        hypothesisId: hypothesis.id,
        hypothesisDescription: hypothesis.description,
        previousStatus: 'Validated',
        newStatus: 'Confirmed',
        ruleApplied: 'ValidationEvidencePromotion',
        predominantCategory: 'Validation',
        promoterEvidenceId: promotionEvidence.id,
        promoterEvidenceCategory: promotionEvidence.evidenceCategory,
        promoterEvidenceWeight: promotionEvidence.weight,
        promoterEvidenceQuality: promotionEvidence.consistency,
        justification: 'Promoção confirmada por evidência de validação governada.',
        createdAt: timestamp,
      },
    ]
  );

  const decision = guard.evaluate(state);
  assert.equal(decision.status, 'ready-for-decision');
});

test('adaptive engine records promotion audit trail and telemetry fields', () => {
  const engine = new AdaptiveInvestigationEngine();
  const initial = engine.initialize(createOperationalObject(), {
    sessionId: 'session-test',
    requestId: 'req-init',
    retryCount: 0,
  });

  assert.ok(initial.runtimeTelemetry.length > 0);
  const initTrace = initial.runtimeTelemetry[0];
  assert.equal(initTrace.sessionId, 'session-test');
  assert.equal(initTrace.runtimeId, initial.investigationId);
  assert.equal(initTrace.requestId, 'req-init');
  assert.ok(initTrace.totalDurationMs >= 0);

  const updated = engine.registerAnswer(initial, 'Acontece com frequência diária na linha A.', {
    sessionId: 'session-test',
    requestId: 'req-answer',
    retryCount: 0,
  });

  assert.ok(updated.runtimeTelemetry.length >= 2);
  const answerTrace = updated.runtimeTelemetry[updated.runtimeTelemetry.length - 1];
  assert.equal(answerTrace.requestId, 'req-answer');
  assert.ok(answerTrace.moduleTimings.some((item) => item.module === 'runtime.lifecycleGovernance'));

  assert.ok(updated.lifecycleAuditTrail.length > 0);
  const promotion = updated.lifecycleAuditTrail[updated.lifecycleAuditTrail.length - 1];
  assert.equal(promotion.hypothesisId.length > 0, true);
  assert.equal(promotion.previousStatus === promotion.newStatus, false);
  assert.equal(promotion.ruleApplied.length > 0, true);
  assert.equal(promotion.promoterEvidenceId.length > 0, true);
  assert.equal(promotion.justification.length > 0, true);
});

test('runtime state authenticator rejects confirmed lifecycle without promotion trail', () => {
  const authenticator = new RuntimeStateAuthenticator();
  const hypothesis = createHypothesis('Confirmed', 0.93);

  const state = createState(
    hypothesis,
    [
      createEvidence({
        id: 'val-1',
        evidenceType: 'ValidationRecord',
        evidenceCategory: 'Validation',
      }),
    ],
    []
  );

  const readyState: AdaptiveInvestigationState = {
    ...state,
    status: 'ready-for-synthesis',
    currentQuestion: null,
  };

  assert.throws(() => authenticator.assertAuthentic(readyState), /without promotion trail/i);
});

test('runtime state authenticator rejects ongoing state without current question', () => {
  const authenticator = new RuntimeStateAuthenticator();
  const hypothesis = createHypothesis('Candidate', 0.71);
  const evidence = [
    createEvidence({
      id: 'ctx-1',
      evidenceType: 'OperatorOpinion',
      evidenceCategory: 'Contextual',
      provenance: {
        kind: 'ContextualInterview',
        source: 'Entrevista',
        capturedAt: timestamp,
        confidence: 0.7,
        consistency: 0.65,
        temporalCorrelation: 0.6,
      },
    }),
  ];

  const state = createState(hypothesis, evidence, []);

  assert.throws(() => authenticator.assertAuthentic(state), /requires currentQuestion/i);
});

test('schema rejects telemetry entry without mandatory conformance fields', () => {
  const hypothesis = createHypothesis('Candidate', 0.72);
  const evidence = [
    createEvidence({
      id: 'ctx-2',
      evidenceType: 'OperatorOpinion',
      evidenceCategory: 'Contextual',
      provenance: {
        kind: 'ContextualInterview',
        source: 'Entrevista',
        capturedAt: timestamp,
        confidence: 0.7,
        consistency: 0.65,
        temporalCorrelation: 0.6,
      },
    }),
  ];
  const baseState = createState(hypothesis, evidence, []);

  const tampered: unknown = {
    ...baseState,
    status: 'ready-for-synthesis',
    runtimeTelemetry: [
      {
        id: 'trace-1',
        sessionId: 's-1',
        runtimeId: 'r-1',
        requestId: 'q-1',
        retryCount: 0,
        startedAt: timestamp,
        endedAt: timestamp,
        totalDurationMs: 10,
        moduleTimings: [],
        events: [],
        errors: [],
      },
    ],
  };

  assert.throws(() => AdaptiveInvestigationStateSchema.parse(tampered), /Invalid AdaptiveInvestigationState/i);
});

test('registerAnswer emits interrupted telemetry when answer is empty', () => {
  const engine = new AdaptiveInvestigationEngine();
  const initial = engine.initialize(createOperationalObject(), {
    sessionId: 'session-int',
    requestId: 'req-init-int',
    retryCount: 0,
  });

  const questionfulState: AdaptiveInvestigationState = {
    ...initial,
    status: 'ongoing',
    currentQuestion: {
      id: 'q-1',
      step: 'Contextualizar',
      intro: 'Vamos contextualizar.',
      question: 'Qual o impacto operacional observado?',
      placeholder: 'Descreva o impacto',
      whyAsked: 'Precisamos reduzir incerteza operacional.',
      uncertaintyTarget: 'Impacto operacional',
      objective: 'Reduzir incerteza',
    },
  };

  const updated = engine.registerAnswer(questionfulState, '   ', {
    sessionId: 'session-int',
    requestId: 'req-empty',
    retryCount: 0,
  });

  const lastTrace = updated.runtimeTelemetry[updated.runtimeTelemetry.length - 1];
  assert.equal(lastTrace.requestId, 'req-empty');
  assert.equal(lastTrace.result, 'interrupted');
  assert.equal(lastTrace.interruptionReason, 'EmptyAnswer');
});
