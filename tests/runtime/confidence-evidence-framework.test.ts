import test from 'node:test';
import assert from 'node:assert/strict';

import ConfidenceEvidenceFramework from '../../runtime/cef/ConfidenceEvidenceFramework.ts';
import {
  CEFConfiguration,
  DEFAULT_CEF_CONFIGURATION,
} from '../../runtime/cef/config.ts';
import type {
  EvidenceItem,
  HypothesisLifecycleStatus,
  HypothesisState,
} from '../../runtime/artifacts/AdaptiveInvestigationState.ts';

const timestamp = '2026-08-09T12:00:00.000Z';

const createHypothesis = (
  lifecycleStatus: HypothesisLifecycleStatus,
  confidence = 0.5
): HypothesisState => ({
  id: 'h1',
  description: 'Causa potencial no fornecedor',
  confidence,
  lifecycleStatus,
  supportingEvidence: [],
  contradictingEvidence: [],
  missingEvidence: [],
  nextRecommendedInvestigation: 'Executar teste laboratorial.',
  reasoningSummary: 'Hipótese inicial.',
  confidenceHistory: [],
  status: 'Active',
  keywords: ['fornecedor', 'lote', 'material'],
});

const createEvidence = (partial: Partial<EvidenceItem>): EvidenceItem => ({
  id: partial.id ?? 'e1',
  origin: partial.origin ?? 'Investigation Flow',
  question: partial.question ?? 'Houve troca de fornecedor?',
  answer: partial.answer ?? 'Sim, e coincidiu com aumento de defeitos.',
  timestamp: partial.timestamp ?? timestamp,
  title: partial.title ?? 'Troca de fornecedor',
  source: partial.source ?? 'Entrevista operador',
  confidence: partial.confidence ?? 0.8,
  evidenceType: partial.evidenceType ?? 'HistoricalKPITrend',
  evidenceCategory:
    partial.evidenceCategory ??
    (partial.evidenceType === 'OperatorOpinion' || partial.evidenceType === 'ProcessObservation'
      ? 'Contextual'
      : partial.evidenceType === 'HistoricalKPITrend' || partial.evidenceType === 'CorrelationAnalysis' || partial.evidenceType === 'SystemLog'
      ? 'Correlational'
      : partial.evidenceType === 'ValidationRecord'
      ? 'Validation'
      : partial.evidenceType === 'ContradictoryFinding'
      ? 'Contradictory'
      : 'Experimental'),
  weight: partial.weight ?? 0.5,
  weightLevel: partial.weightLevel ?? 'Medium',
  relatedHypothesisId: partial.relatedHypothesisId ?? 'h1',
  relation: partial.relation ?? 'Support',
  temporalCorrelation: partial.temporalCorrelation ?? 0.8,
  consistency: partial.consistency ?? 0.8,
  provenance:
    partial.provenance ??
    ({
      kind:
        partial.evidenceType === 'OperatorOpinion'
          ? 'ContextualInterview'
          : partial.evidenceType === 'ProcessObservation'
          ? 'ContextualObservation'
          : partial.evidenceType === 'HistoricalKPITrend'
          ? 'HistoricalKPITrend'
          : partial.evidenceType === 'CorrelationAnalysis'
          ? 'CorrelationAnalysis'
          : partial.evidenceType === 'SystemLog'
          ? 'SystemLog'
          : partial.evidenceType === 'ValidationRecord'
          ? 'ValidationArtifact'
          : partial.evidenceType === 'ContradictoryFinding'
          ? 'ContradictoryFinding'
          : 'ExperimentalConfirmation',
      source: partial.source ?? 'Entrevista operador',
      capturedAt: partial.timestamp ?? timestamp,
      confidence: partial.confidence ?? 0.8,
      consistency: partial.consistency ?? 0.8,
      temporalCorrelation: partial.temporalCorrelation ?? 0.8,
    } as EvidenceItem['provenance']),
  investigationStep: partial.investigationStep ?? 'Investigar',
});

test('interview wording cannot create validation evidence', () => {
  const cef = new ConfidenceEvidenceFramework();

  const evidence = cef.createEvidenceRecord({
    id: 'textual',
    origin: 'Investigation Flow',
    question: {
      id: 'q1',
      step: 'Investigar',
      intro: 'Interpretação',
      question: 'Isso foi validado em bancada?',
      placeholder: 'Responder',
      whyAsked: 'Checar validação',
      uncertaintyTarget: 'validacao',
      objective: 'Validar evidências',
    },
    answer: 'Sim, validamos no papo, mas sem artefato formal.',
    investigationStep: 'Investigar',
    relatedHypothesisId: 'h1',
    keywords: ['validacao'],
    timestamp,
    provenance: {
      kind: 'ContextualInterview',
      source: 'Entrevista operador',
      capturedAt: timestamp,
      confidence: 0.45,
      consistency: 0.5,
      temporalCorrelation: 0.5,
    },
  });

  assert.equal(evidence.evidenceCategory, 'Contextual');
  assert.equal(evidence.evidenceType, 'OperatorOpinion');
  assert.equal(evidence.provenance.kind, 'ContextualInterview');
});

test('contextual evidence advances lifecycle only within contextual ceiling', () => {
  const cef = new ConfidenceEvidenceFramework();

  const hypothesis = createHypothesis('Draft', 0.9);
  const evidence = [createEvidence({ id: 'e1', evidenceType: 'OperatorOpinion', evidenceCategory: 'Contextual', provenance: { kind: 'ContextualInterview', source: 'Entrevista operador', capturedAt: timestamp, confidence: 0.45, consistency: 0.6, temporalCorrelation: 0.5 } })];

  const result = cef.evaluate({
    hypothesis,
    evidence,
    missingEvidence: [],
    timestamp,
  });

  assert.equal(result.lifecycleStatus, 'Candidate');
  assert.notEqual(result.lifecycleStatus, 'Confirmed');
});

test('correlational evidence promotes from plausible to supported', () => {
  const cef = new ConfidenceEvidenceFramework();
  const hypothesis = createHypothesis('Plausible', 0.5);

  const result = cef.evaluate({
    hypothesis,
    evidence: [
      createEvidence({
        id: 'c1',
        evidenceType: 'HistoricalKPITrend',
        evidenceCategory: 'Correlational',
        provenance: { kind: 'HistoricalKPITrend', source: 'KPI histórico', capturedAt: timestamp, confidence: 0.8, consistency: 0.8, temporalCorrelation: 0.7 },
      }),
    ],
    missingEvidence: [],
    timestamp,
  });

  assert.equal(result.lifecycleStatus, 'Supported');
});

test('experimental evidence promotes from supported to validated', () => {
  const cef = new ConfidenceEvidenceFramework();
  const hypothesis = createHypothesis('Supported', 0.6);

  const result = cef.evaluate({
    hypothesis,
    evidence: [
      createEvidence({
        id: 'e1',
        evidenceType: 'DOE',
        evidenceCategory: 'Experimental',
        provenance: { kind: 'DOE', source: 'DOE formal', capturedAt: timestamp, confidence: 0.95, consistency: 0.9, temporalCorrelation: 0.8 },
      }),
    ],
    missingEvidence: [],
    timestamp,
  });

  assert.equal(result.lifecycleStatus, 'Validated');
});

test('validation evidence promotes from validated to confirmed', () => {
  const cef = new ConfidenceEvidenceFramework();
  const hypothesis = createHypothesis('Validated', 0.92);

  const result = cef.evaluate({
    hypothesis,
    evidence: [
      createEvidence({
        id: 'v1',
        evidenceType: 'ValidationRecord',
        evidenceCategory: 'Validation',
        provenance: { kind: 'ValidationArtifact', source: 'Artefato de validação', capturedAt: timestamp, confidence: 1, consistency: 1, temporalCorrelation: 0.9 },
      }),
    ],
    missingEvidence: [],
    timestamp,
  });

  assert.equal(result.lifecycleStatus, 'Confirmed');
});

test('contradictory evidence rejects the hypothesis', () => {
  const cef = new ConfidenceEvidenceFramework();
  const hypothesis = createHypothesis('Supported', 0.7);

  const result = cef.evaluate({
    hypothesis,
    evidence: [
      createEvidence({
        id: 'x1',
        evidenceType: 'ContradictoryFinding',
        evidenceCategory: 'Contradictory',
        relation: 'Contradiction',
        provenance: { kind: 'ContradictoryFinding', source: 'Teste contraditório', capturedAt: timestamp, confidence: 0.9, consistency: 0.9, temporalCorrelation: 0.4 },
      }),
    ],
    missingEvidence: [],
    timestamp,
  });

  assert.equal(result.lifecycleStatus, 'Rejected');
});

test('reasoning output references classified categories and history entry is preserved', () => {
  const cef = new ConfidenceEvidenceFramework();
  const hypothesis = createHypothesis('Candidate', 0.55);

  const result = cef.evaluate({
    hypothesis,
    evidence: [
      createEvidence({ id: 'e1', evidenceType: 'ProcessObservation', evidenceCategory: 'Contextual', provenance: { kind: 'ContextualObservation', source: 'Gemba', capturedAt: timestamp, confidence: 0.5, consistency: 0.6, temporalCorrelation: 0.5 } }),
    ],
    missingEvidence: ['Executar MSA para validar sistema de medição'],
    timestamp,
  });

  assert.ok(result.reasoningSummary.includes('Categorias classificadas'));
  assert.equal(result.nextRecommendedInvestigation, 'Executar MSA para validar sistema de medição');
  assert.equal(result.confidenceEntry.timestamp, timestamp);
  assert.equal(result.confidenceEntry.lifecycleStatus, result.lifecycleStatus);
  assert.equal(result.confidenceEntry.confidence, result.confidence);
});

test('all lifecycle promotion paths are category-driven', () => {
  const cef = new ConfidenceEvidenceFramework();

  const contextual = cef.evaluate({
    hypothesis: createHypothesis('Draft', 0.5),
    evidence: [createEvidence({ id: 'ctx', evidenceType: 'OperatorOpinion', evidenceCategory: 'Contextual', provenance: { kind: 'ContextualInterview', source: 'Entrevista', capturedAt: timestamp, confidence: 0.45, consistency: 0.5, temporalCorrelation: 0.5 } })],
    missingEvidence: [],
    timestamp,
  });

  const correlational = cef.evaluate({
    hypothesis: createHypothesis('Plausible', 0.5),
    evidence: [createEvidence({ id: 'cor', evidenceType: 'HistoricalKPITrend', evidenceCategory: 'Correlational', provenance: { kind: 'HistoricalKPITrend', source: 'KPI', capturedAt: timestamp, confidence: 0.75, consistency: 0.8, temporalCorrelation: 0.7 } })],
    missingEvidence: [],
    timestamp,
  });

  const experimental = cef.evaluate({
    hypothesis: createHypothesis('Supported', 0.5),
    evidence: [createEvidence({ id: 'exp', evidenceType: 'ExperimentalConfirmation', evidenceCategory: 'Experimental', provenance: { kind: 'ExperimentalConfirmation', source: 'Ensaio', capturedAt: timestamp, confidence: 0.95, consistency: 0.9, temporalCorrelation: 0.8 } })],
    missingEvidence: [],
    timestamp,
  });

  const validation = cef.evaluate({
    hypothesis: createHypothesis('Validated', 0.5),
    evidence: [createEvidence({ id: 'val', evidenceType: 'ValidationRecord', evidenceCategory: 'Validation', provenance: { kind: 'ValidationArtifact', source: 'Validação formal', capturedAt: timestamp, confidence: 1, consistency: 1, temporalCorrelation: 1 } })],
    missingEvidence: [],
    timestamp,
  });

  assert.equal(contextual.lifecycleStatus, 'Candidate');
  assert.equal(correlational.lifecycleStatus, 'Supported');
  assert.equal(experimental.lifecycleStatus, 'Validated');
  assert.equal(validation.lifecycleStatus, 'Confirmed');
});
