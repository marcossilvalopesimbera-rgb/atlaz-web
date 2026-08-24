'use client';

import { ChangeEvent, useRef, useState } from 'react';
import type { AdaptiveInvestigationState } from '@/runtime/artifacts/AdaptiveInvestigationState';
import AdaptiveInvestigationEngine from '@/runtime/engines/AdaptiveInvestigationEngine';
import {
  intakeEvidence,
  readEvidenceIntakeRecords,
  type EvidenceIntakeRecord,
} from '@/lib/evidenceIntake';
import {
  createRuntimeRequestId,
  readOrCreateRuntimeSessionId,
  writeInvestigationState,
} from '@/lib/investigationStateStorage';
import { Button } from '../Button';

type EvidenceIntakeControlProps = {
  state: AdaptiveInvestigationState | null;
  onStateUpdated?: (state: AdaptiveInvestigationState) => void;
};

const adaptiveInvestigationEngine = new AdaptiveInvestigationEngine();

const outcomeMessage = (record: EvidenceIntakeRecord): string => {
  if (record.status === 'needs-review') {
    return 'Arquivo associado ao caso. Este formato ainda precisa de extração de conteúdo antes de entrar na análise.';
  }
  if (record.status === 'failed') {
    return 'Não foi possível processar este arquivo. Ele continua registrado no caso para auditoria.';
  }
  if (record.impact === 'contradiction-review') {
    return 'Esta evidência apresenta uma informação diferente daquela considerada anteriormente. Vou revisar a investigação antes de avançarmos.';
  }
  if (record.impact === 'no-relevant-information') {
    return 'Analisei o arquivo, mas não encontrei evidências suficientes para alterar a investigação neste momento.';
  }
  const identified = [record.events[0], record.measurements[0], record.dates[0]].filter(Boolean).join(' · ');
  return identified
    ? `Evidência incorporada. Identifiquei ${identified}; o Runtime reavaliou a investigação.`
    : 'Evidência incorporada e considerada pelo Runtime na investigação atual.';
};

export function EvidenceIntakeControl({ state, onStateUpdated }: EvidenceIntakeControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<EvidenceIntakeRecord[]>(() => readEvidenceIntakeRecords(state?.investigationId));
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!state || !event.target.files?.length) {
      return;
    }

    setIsProcessing(true);
    let latestState = state;
    let latestRecord: EvidenceIntakeRecord | null = null;

    for (const file of Array.from(event.target.files)) {
      const result = await intakeEvidence(file, latestState, adaptiveInvestigationEngine, {
        sessionId: readOrCreateRuntimeSessionId(),
        requestId: createRuntimeRequestId(),
      });
      latestState = result.state;
      latestRecord = result.record;
    }

    writeInvestigationState(latestState);
    onStateUpdated?.(latestState);
    setRecords(readEvidenceIntakeRecords(state.investigationId));
    setMessage(latestRecord ? outcomeMessage(latestRecord) : 'Nenhuma evidência foi selecionada.');
    setIsProcessing(false);
    event.target.value = '';
  };

  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.5)]" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Evidências ({records.length})</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Arquivos permanecem associados a esta investigação.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.log,.md,.json,.xml,image/*"
          onChange={handleFiles}
          disabled={!state || isProcessing}
        />
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={!state || isProcessing}>
          {isProcessing ? 'Processando evidência' : 'Adicionar evidência'}
        </Button>
      </div>

      {message ? <p className="mt-3 text-sm leading-6 text-slate-700">{message}</p> : null}

      {records.length ? (
        <details className="mt-3 border-t border-slate-100 pt-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">Ver arquivos</summary>
          <ul className="mt-3 space-y-2">
            {records.slice().reverse().map((record) => (
              <li key={record.id} className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700">
                <span className="font-medium text-slate-900">{record.name}</span>
                <span className={record.status === 'processed' ? 'text-emerald-700' : 'text-amber-700'}>
                  {record.status === 'processed' ? 'Processado' : record.status === 'processing' ? 'Processando' : 'Aguardando extração'}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}