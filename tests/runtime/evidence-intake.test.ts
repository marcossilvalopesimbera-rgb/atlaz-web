import test from 'node:test';
import assert from 'node:assert/strict';

import AdaptiveInvestigationEngine from '../../runtime/engines/AdaptiveInvestigationEngine';
import { Impact } from '../../runtime/types/Impact';
import { Severity } from '../../runtime/types/Severity';
import { Urgency } from '../../runtime/types/Urgency';
import { extractStructuredEvidence, intakeEvidence } from '../../lib/evidenceIntake';

const operationalObject = {
  artifact: 'OperationalObject' as const,
  version: '1.1.0',
  problemStatement: 'Defeitos surgiram no envase após manutenção.',
  domain: 'Manufatura',
  category: 'Qualidade',
  process: 'Envase',
  severity: Severity.High,
  urgency: Urgency.High,
  impact: Impact.High,
  suspectedDomains: ['Manutenção'],
  requiredInformation: ['Recorrência e frequência do problema'],
  confidence: 0.6,
};

test('evidence intake extracts structured facts without assigning causal conclusions', () => {
  const extracted = extractStructuredEvidence('Em 2026-08-01 houve troca do fixador. A taxa de defeitos atingiu 12.5% na LinhaA.');

  assert.ok(extracted.facts.length > 0);
  assert.deepEqual(extracted.dates, ['2026-08-01']);
  assert.deepEqual(extracted.measurements, ['12.5%']);
  assert.ok(extracted.events.some((event) => /troca/i.test(event)));
});

test('intake keeps the investigation id and delegates hypothesis changes to the existing runtime', async () => {
  const runtime = new AdaptiveInvestigationEngine();
  const initial = runtime.initialize(operationalObject, { sessionId: 'session-intake', requestId: 'request-initial' });
  const hypothesesBefore = initial.hypotheses.map((hypothesis) => ({ id: hypothesis.id, confidence: hypothesis.confidence }));
  const file = {
    name: 'manutencao.csv',
    type: 'text/csv',
    size: 88,
    text: async () => 'data,eventos,taxa\n2026-08-01,troca do fixador,12.5%',
  };

  const result = await intakeEvidence(file, initial, runtime, { sessionId: 'session-intake', requestId: 'request-upload' });

  assert.equal(result.record.investigationId, initial.investigationId);
  assert.equal(result.record.status, 'processed');
  assert.ok(result.record.runtimeEvidenceIds.length > 0);
  assert.equal(result.state.investigationId, initial.investigationId);
  assert.notDeepEqual(result.state.hypotheses.map((hypothesis) => ({ id: hypothesis.id, confidence: hypothesis.confidence })), hypothesesBefore);
});

test('non-text evidence is retained for review without resetting or mutating the runtime state', async () => {
  const runtime = new AdaptiveInvestigationEngine();
  const initial = runtime.initialize(operationalObject, { sessionId: 'session-intake', requestId: 'request-initial' });
  const file = { name: 'relatorio.pdf', type: 'application/pdf', size: 2048, text: async () => '' };

  const result = await intakeEvidence(file, initial, runtime, { sessionId: 'session-intake', requestId: 'request-upload' });

  assert.equal(result.record.status, 'needs-review');
  assert.equal(result.state, initial);
});

test('multiple uploads remain associated with one investigation and preserve prior runtime context', async () => {
  const runtime = new AdaptiveInvestigationEngine();
  const initial = runtime.initialize(operationalObject, { sessionId: 'session-multiple', requestId: 'request-initial' });
  const first = await intakeEvidence(
    { name: 'ocorrencias.txt', type: 'text/plain', size: 24, text: async () => 'A ocorrência é recorrente.' },
    initial,
    runtime,
    { sessionId: 'session-multiple', requestId: 'request-first' }
  );
  const second = await intakeEvidence(
    { name: 'medicoes.csv', type: 'text/csv', size: 27, text: async () => 'medicao\n12.5%\n15.1%' },
    first.state,
    runtime,
    { sessionId: 'session-multiple', requestId: 'request-second' }
  );

  assert.equal(first.record.investigationId, initial.investigationId);
  assert.equal(second.record.investigationId, initial.investigationId);
  assert.ok(second.state.knownInformation.some((information) => information.includes('12.5%')));
  assert.ok(second.state.history.length >= first.state.history.length);
});

test('upload after a partial conclusion is delegated to the runtime without creating another investigation', async () => {
  const runtime = new AdaptiveInvestigationEngine();
  const initial = runtime.initialize(operationalObject, { sessionId: 'session-synthesis', requestId: 'request-initial' });
  const synthesisState = { ...initial, currentQuestion: null, status: 'ready-for-synthesis' as const };

  const result = await intakeEvidence(
    { name: 'conclusao.txt', type: 'text/plain', size: 38, text: async () => 'A manutenção ocorreu em 2026-08-01 antes do defeito.' },
    synthesisState,
    runtime,
    { sessionId: 'session-synthesis', requestId: 'request-upload' }
  );

  assert.equal(result.state.investigationId, synthesisState.investigationId);
  assert.ok(result.record.runtimeEvidenceIds.length > 0);
  assert.equal(result.state.history.at(-1)?.questionId, 'evidence-intake');
});

test('investigation without uploads follows the existing runtime flow unchanged', () => {
  const runtime = new AdaptiveInvestigationEngine();
  const initial = runtime.initialize(operationalObject, { sessionId: 'session-baseline', requestId: 'request-initial' });
  const updated = runtime.registerAnswer(initial, 'O problema é recorrente.', { sessionId: 'session-baseline', requestId: 'request-answer' });

  assert.equal(updated.investigationId, initial.investigationId);
  assert.equal(updated.history.length, 1);
  assert.ok(updated.evidenceRegistry.items.length > initial.evidenceRegistry.items.length);
});