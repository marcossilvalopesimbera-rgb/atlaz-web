'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { InvestigationPageFrame } from '@components/ui/cognitive/InvestigationPageFrame';
import { readInvestigationState } from '@/lib/investigationStateStorage';
import type { AdaptiveInvestigationState } from '@/runtime/artifacts/AdaptiveInvestigationState';

const decisionHeadline = (status: string): string => {
  if (status === 'ready-for-decision') {
    return 'A investigação já tem base suficiente para uma decisão operacional';
  }

  if (status === 'investigate-further') {
    return 'A investigação avançou, mas ainda pede uma validação final';
  }

  return 'Ainda faltam evidências para uma decisão segura';
};

export default function DecidirPage() {
  const router = useRouter();
  const [stateSnapshot, setStateSnapshot] = useState<AdaptiveInvestigationState | null>(null);

  useEffect(() => {
    setStateSnapshot(readInvestigationState());
  }, []);

  const output = stateSnapshot?.investigationOutput;
  const decisionStatus = output?.decision.status || 'insufficient-evidence';
  const hypotheses = output?.hypotheses ?? [];
  const supportEvidence = output?.evidence.supporting.slice(0, 3) ?? [];
  const contradictingEvidence = output?.evidence.contradicting.slice(0, 2) ?? [];

  return (
    <InvestigationPageFrame
      stageLabel="Decidir"
      title={decisionHeadline(decisionStatus)}
      subtitle="A visão executiva mostra apenas o essencial para decidir com serenidade: se a base já sustenta conclusão, o que ainda falta e qual ação mantém o caso sob controle."
      state={stateSnapshot}
    >
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status da decisão</p>
        <p className="mt-3 text-2xl font-semibold text-slate-950">{decisionStatus}</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">{output?.decision.rationale || 'Sem racional de decisão disponível.'}</p>
        <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Próxima investigação recomendada</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{output?.recommendedInvestigation || 'Coletar evidência adicional para reduzir incerteza.'}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Hipóteses em foco</p>
          <div className="mt-4 space-y-3">
            {hypotheses.slice(0, 3).map((hypothesis) => (
              <div key={hypothesis.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{hypothesis.description}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    {hypothesis.lifecycleStatus}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{hypothesis.reasoningSummary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Evidência principal</p>
          <div className="mt-4 space-y-3">
            {supportEvidence.map((item) => (
              <div key={item.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{item.question}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
              </div>
            ))}
            {supportEvidence.length === 0 ? <p className="text-sm leading-7 text-slate-600">Ainda não há evidência suficiente para sustentar decisão.</p> : null}
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pontos de atenção</p>
        <div className="mt-4 space-y-3">
          {contradictingEvidence.map((item) => (
            <div key={item.id} className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-slate-950">{item.question}</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{item.answer}</p>
            </div>
          ))}
          {contradictingEvidence.length === 0 ? <p className="text-sm leading-7 text-slate-600">Nenhuma contradição ativa na base atual.</p> : null}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => router.push('/evoluir')} className="w-full sm:w-auto">
            Construir plano de ação
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.push('/workspace')} className="w-full sm:w-auto">
            Continuar investigando
          </Button>
        </div>
      </div>
    </InvestigationPageFrame>
  );
}
