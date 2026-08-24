'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { InvestigationPageFrame } from '@components/ui/cognitive/InvestigationPageFrame';
import { readInvestigationState } from '@/lib/investigationStateStorage';
import type { AdaptiveInvestigationState } from '@/runtime/artifacts/AdaptiveInvestigationState';

export default function CompreenderPage() {
  const router = useRouter();
  const [stateSnapshot, setStateSnapshot] = useState<AdaptiveInvestigationState | null>(null);

  useEffect(() => {
    setStateSnapshot(readInvestigationState());
  }, []);

  const output = stateSnapshot?.investigationOutput;
  const rankedHypotheses = output?.hypotheses ?? [];
  const mainHypothesis = rankedHypotheses[0];
  const supportingEvidence = output?.evidence.supporting.slice(0, 3) ?? [];
  const contradictingEvidence = output?.evidence.contradicting.slice(0, 2) ?? [];

  return (
    <InvestigationPageFrame
      stageLabel="Compreender"
      title="Chegamos ao ponto em que a investigação começa a ficar nítida."
      subtitle="A ATLAZ mostra apenas o que sustenta a leitura executiva: uma hipótese principal, poucas alternativas e as evidências que realmente movem o caso."
      state={stateSnapshot}
      onStateUpdated={setStateSnapshot}
    >
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Hipótese principal</p>
        <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950">
          {mainHypothesis?.description || 'Ainda estamos consolidando a hipótese dominante.'}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {mainHypothesis?.reasoningSummary || 'A investigação ainda está acumulando sinais para sustentar uma leitura mais firme.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Evidências de suporte</p>
          <div className="mt-4 space-y-3">
            {supportingEvidence.map((item) => (
              <div key={item.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
              </div>
            ))}
            {supportingEvidence.length === 0 ? <p className="text-sm leading-7 text-slate-600">Ainda não há suporte consolidado.</p> : null}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Sinais de contradição</p>
          <div className="mt-4 space-y-3">
            {contradictingEvidence.map((item) => (
              <div key={item.id} className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{item.answer}</p>
              </div>
            ))}
            {contradictingEvidence.length === 0 ? <p className="text-sm leading-7 text-slate-600">Nenhuma contradição relevante foi registrada.</p> : null}
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Próximo passo</p>
        <p className="mt-3 text-lg font-semibold text-slate-950">{output?.recommendedInvestigation || 'Coletar evidência adicional para reduzir a incerteza.'}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => router.push('/decidir')} className="w-full sm:w-auto">
            Avançar para decisão
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.push('/workspace')} className="w-full sm:w-auto">
            Voltar à investigação
          </Button>
        </div>
      </div>
    </InvestigationPageFrame>
  );
}
