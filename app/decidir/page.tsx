'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { readInvestigationState } from '@/lib/investigationStateStorage';
import type { AdaptiveInvestigationState } from '@/runtime/artifacts/AdaptiveInvestigationState';

const progressSteps = ['Definir', 'Investigar', 'Compreender', 'Decidir', 'Evoluir'];

const toPercent = (value: number): string => `${Math.round(value * 100)}%`;

const decisionHeadline = (status: string): string => {
  if (status === 'ready-for-decision') {
    return 'A investigação está pronta para decisão operacional';
  }

  if (status === 'investigate-further') {
    return 'A investigação avançou, mas ainda exige validação adicional';
  }

  return 'A investigação ainda está em fase de consolidação de evidências';
};

export default function DecidirPage() {
  const router = useRouter();
  const [stateSnapshot, setStateSnapshot] = useState<AdaptiveInvestigationState | null>(null);

  useEffect(() => {
    setStateSnapshot(readInvestigationState());
  }, []);

  const progressItems = useMemo(
    () =>
      progressSteps.map((step, index) => ({
        step,
        active: index === 3,
        complete: index < 3,
        number: index + 1,
      })),
    []
  );

  const output = stateSnapshot?.investigationOutput;
  const decisionStatus = output?.decision.status || 'insufficient-evidence';
  const hypotheses = output?.hypotheses ?? [];
  const supportEvidence = output?.evidence.supporting ?? [];
  const contradictingEvidence = output?.evidence.contradicting ?? [];

  return (
    <main className="bg-white text-slate-950">
      <section className="mx-auto min-h-screen max-w-[1280px] px-6 py-16 lg:px-8">
        <div className="space-y-10">
          <nav aria-label="Progresso da investigação" className="flex flex-wrap items-center gap-3">
            {progressItems.map((item) => (
              <div
                key={item.step}
                className={`flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] ${
                  item.complete
                    ? 'border-slate-200 bg-slate-100 text-slate-700'
                    : item.active
                    ? 'border-[#5B5CEB] bg-[#5B5CEB] text-white'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
                aria-current={item.active ? 'true' : undefined}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-semibold text-current">
                  {item.number}
                </span>
                {item.step}
              </div>
            ))}
          </nav>

          <div className="rounded-[2rem] border-2 border-slate-300 bg-white p-10 shadow-md shadow-slate-950/10">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">DECIDIR</p>
            <h1 className="mt-4 max-w-[880px] text-[2.7rem] leading-[0.98] tracking-tight text-slate-950 sm:text-[3.2rem]">
              {decisionHeadline(decisionStatus)}
            </h1>
            <p className="mt-5 max-w-[800px] text-[18px] leading-8 text-slate-600">
              O módulo cognitivo consolidou hipóteses, evidências e lacunas para indicar, com transparência, se já existe base
              suficiente para concluir.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[64%_36%]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border-2 border-slate-300 bg-white p-10 shadow-md shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Status da decisão</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">{decisionStatus}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {output?.decision.rationale || 'Sem racional de decisão disponível.'}
                </p>
                <div className="mt-6 rounded-[1.5rem] bg-[#5B5CEB] p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-200">Próxima investigação recomendada</p>
                  <p className="mt-3 text-lg font-semibold leading-8">
                    {output?.recommendedInvestigation || 'Coletar evidência adicional para reduzir incerteza.'}
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Hipóteses</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">Ranking por confiança e lifecycle</h3>
                <div className="mt-4 space-y-4">
                  {hypotheses.map((hypothesis) => (
                    <div key={hypothesis.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-base font-semibold text-slate-950">{hypothesis.description}</p>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                          {hypothesis.lifecycleStatus}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{hypothesis.reasoningSummary}</p>
                      <div className="mt-3 h-2 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-[#5B5CEB]" style={{ width: toPercent(hypothesis.confidence) }} />
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                        Confiança {toPercent(hypothesis.confidence)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Evidências de suporte</p>
                  <div className="mt-4 space-y-3">
                    {supportEvidence.map((item) => (
                      <div key={item.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-950">{item.question}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                          {item.evidenceType} · {item.weightLevel} · {toPercent(item.confidence)}
                        </p>
                      </div>
                    ))}
                    {supportEvidence.length === 0 ? (
                      <p className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                        Não há evidência de suporte consolidada para decisão.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 shadow-sm shadow-rose-950/5">
                  <p className="text-xs uppercase tracking-[0.28em] text-rose-700">Evidências contraditórias</p>
                  <div className="mt-4 space-y-3">
                    {contradictingEvidence.map((item) => (
                      <div key={item.id} className="rounded-[1.25rem] border border-rose-200 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-950">{item.question}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-700">{item.answer}</p>
                        <p className="text-xs uppercase tracking-[0.22em] text-rose-700">
                          Penalidade aplicada pelo CEF
                        </p>
                      </div>
                    ))}
                    {contradictingEvidence.length === 0 ? (
                      <p className="rounded-[1.25rem] border border-rose-200 bg-white p-4 text-sm leading-7 text-rose-800">
                        Nenhuma contradição ativa na base atual.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Ação</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Próximo passo operacional</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {output?.recommendedInvestigation || 'Colete evidências adicionais e reavalie hipóteses antes de concluir.'}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button type="button" onClick={() => router.push('/evoluir')} className="w-full sm:w-auto">
                    Construir plano de ação
                  </Button>
                  <Button variant="secondary" type="button" onClick={() => router.push('/workspace')} className="w-full sm:w-auto">
                    Continuar investigando
                  </Button>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Confiança global</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {toPercent(output?.confidence.global ?? stateSnapshot?.currentConfidence ?? 0)}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Evidência faltante</p>
                <ul className="mt-2 space-y-1">
                  {(output?.missingEvidence ?? []).slice(0, 4).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
