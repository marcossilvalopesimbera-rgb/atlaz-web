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

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Nossa recomendação</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">Esta é a próxima ação porque reduz a principal incerteza antes de comprometer uma decisão operacional.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => router.push('/evoluir')} className="w-full sm:w-auto">
            Construir plano de ação
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.push('/workspace')} className="w-full sm:w-auto">
            Coletar novas evidências
          </Button>
        </div>
      </div>

      <details className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">Ver análise técnica</summary>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Linhas em observação</p>
            {hypotheses.slice(0, 3).map((hypothesis) => <p key={hypothesis.id} className="text-sm leading-7 text-slate-700">{hypothesis.description}</p>)}
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Evidências e pontos de atenção</p>
            {[...supportEvidence, ...contradictingEvidence].map((item) => <p key={item.id} className="text-sm leading-7 text-slate-700">{item.question}: {item.answer}</p>)}
          </div>
        </div>
      </details>
    </InvestigationPageFrame>
  );
}
