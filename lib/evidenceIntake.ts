import type { AdaptiveInvestigationState } from '@/runtime/artifacts/AdaptiveInvestigationState';

export const EVIDENCE_INTAKE_STORAGE_KEY = 'atlaz.evidence-intake.records';

export type EvidenceProcessingStatus = 'processing' | 'processed' | 'needs-review' | 'failed';

export type EvidenceIntakeRecord = {
  id: string;
  investigationId: string;
  name: string;
  mimeType: string;
  size: number;
  addedAt: string;
  processedAt?: string;
  status: EvidenceProcessingStatus;
  extractedText: string;
  facts: string[];
  measurements: string[];
  dates: string[];
  entities: string[];
  events: string[];
  runtimeEvidenceIds: string[];
  impact: 'pending' | 'incorporated' | 'no-relevant-information' | 'contradiction-review';
};

export type EvidenceFile = {
  name: string;
  type: string;
  size: number;
  text: () => Promise<string>;
};

export type EvidenceRuntime = {
  registerAnswer: (state: AdaptiveInvestigationState, answer: string, executionContext?: {
    sessionId?: string;
    requestId?: string;
    retryCount?: number;
  }) => AdaptiveInvestigationState;
};

const createId = (): string => {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `evidence-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const unique = (values: string[]): string[] => Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

const textFile = (file: EvidenceFile): boolean =>
  file.type.startsWith('text/') || /\.(csv|txt|log|md|json|xml)$/i.test(file.name);

const findMatches = (content: string, pattern: RegExp): string[] => unique(Array.from(content.matchAll(pattern), (match) => match[0]));

export const extractStructuredEvidence = (content: string) => {
  const extractedText = normalizeWhitespace(content).slice(0, 12000);
  const sentences = extractedText.split(/(?<=[.!?;])\s+/).filter((sentence) => sentence.length >= 12);

  return {
    extractedText,
    facts: sentences.slice(0, 8),
    measurements: findMatches(extractedText, /\b\d+(?:[.,]\d+)?\s?(?:%|mm|cm|kg|g|ms|s|min|h|rpm|°c|c)(?!\w)/gi),
    dates: findMatches(extractedText, /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/g),
    entities: unique(findMatches(extractedText, /\b[A-Z][A-Za-zÀ-ÿ0-9-]{2,}\b/g).slice(0, 20)),
    events: sentences.filter((sentence) => /\b(troca|mudan[çc]a|interven[çc][ãa]o|falha|parada|manuten[çc][ãa]o|ocorr[êe]ncia|desvio)\b/i.test(sentence)).slice(0, 8),
  };
};

const saveRecords = (records: EvidenceIntakeRecord[]): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(EVIDENCE_INTAKE_STORAGE_KEY, JSON.stringify(records));
  }
};

export const readEvidenceIntakeRecords = (investigationId?: string): EvidenceIntakeRecord[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(EVIDENCE_INTAKE_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) {
      return [];
    }

    const records = parsed.filter((record): record is EvidenceIntakeRecord =>
      Boolean(record) && typeof record === 'object' && typeof (record as EvidenceIntakeRecord).investigationId === 'string'
    );
    return investigationId ? records.filter((record) => record.investigationId === investigationId) : records;
  } catch {
    return [];
  }
};

const replaceRecord = (record: EvidenceIntakeRecord): void => {
  const records = readEvidenceIntakeRecords();
  saveRecords([...records.filter((candidate) => candidate.id !== record.id), record]);
};

const evidenceNarrative = (record: EvidenceIntakeRecord): string => [
  `Evidência incorporada do arquivo ${record.name}.`,
  record.extractedText,
  record.dates.length ? `Datas identificadas: ${record.dates.join(', ')}.` : '',
  record.measurements.length ? `Medições identificadas: ${record.measurements.join(', ')}.` : '',
  record.events.length ? `Eventos identificados: ${record.events.join(' ')}` : '',
].filter(Boolean).join(' ');

const intakeQuestion = () => ({
  id: 'evidence-intake',
  step: 'Evidência anexada',
  intro: 'A evidência anexada será considerada na investigação atual.',
  question: 'Que informação relevante esta evidência acrescenta à investigação?',
  placeholder: '',
  whyAsked: 'Incorporar a evidência anexada sem reiniciar o caso.',
  uncertaintyTarget: 'Informação estruturada da evidência anexada',
  objective: 'Reduzir incerteza' as const,
});

export const intakeEvidence = async (
  file: EvidenceFile,
  state: AdaptiveInvestigationState,
  runtime: EvidenceRuntime,
  executionContext: { sessionId: string; requestId: string }
): Promise<{ record: EvidenceIntakeRecord; state: AdaptiveInvestigationState }> => {
  const startedAt = new Date().toISOString();
  const pending: EvidenceIntakeRecord = {
    id: createId(),
    investigationId: state.investigationId,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    addedAt: startedAt,
    status: 'processing',
    extractedText: '',
    facts: [],
    measurements: [],
    dates: [],
    entities: [],
    events: [],
    runtimeEvidenceIds: [],
    impact: 'pending',
  };
  replaceRecord(pending);

  if (!textFile(file)) {
    const record: EvidenceIntakeRecord = {
      ...pending,
      processedAt: new Date().toISOString(),
      status: 'needs-review',
      impact: 'no-relevant-information',
    };
    replaceRecord(record);
    return { record, state };
  }

  try {
    const extracted = extractStructuredEvidence(await file.text());
    if (!extracted.extractedText) {
      const record = { ...pending, ...extracted, processedAt: new Date().toISOString(), status: 'processed' as const, impact: 'no-relevant-information' as const };
      replaceRecord(record);
      return { record, state };
    }

    const beforeEvidenceIds = new Set(state.evidenceRegistry.items.map((item) => item.id));
    const runtimeInput = state.currentQuestion ? state : { ...state, currentQuestion: intakeQuestion() };
    const runtimeState = runtime.registerAnswer(runtimeInput, evidenceNarrative({ ...pending, ...extracted }), {
      ...executionContext,
      retryCount: 0,
    });
    const runtimeEvidenceIds = runtimeState.evidenceRegistry.items
      .filter((item) => !beforeEvidenceIds.has(item.id))
      .map((item) => item.id);
    const hasContradiction = runtimeState.evidenceRegistry.items.some((item) =>
      runtimeEvidenceIds.includes(item.id) && item.relation === 'Contradiction'
    );
    const record: EvidenceIntakeRecord = {
      ...pending,
      ...extracted,
      processedAt: new Date().toISOString(),
      status: 'processed',
      runtimeEvidenceIds,
      impact: hasContradiction ? 'contradiction-review' : 'incorporated',
    };
    replaceRecord(record);
    return { record, state: runtimeState };
  } catch {
    const record: EvidenceIntakeRecord = {
      ...pending,
      processedAt: new Date().toISOString(),
      status: 'failed',
      impact: 'no-relevant-information',
    };
    replaceRecord(record);
    return { record, state };
  }
};