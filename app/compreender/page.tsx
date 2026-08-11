'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { readInvestigationState } from '@/lib/investigationStateStorage';
import type { AdaptiveInvestigationState } from '@/runtime/artifacts/AdaptiveInvestigationState';

const progressSteps = ['Definir', 'Investigar', 'Compreender', 'Decidir', 'Evoluir'];

const confidenceLabel = (value: number): 'Alta' | 'Média' | 'Baixa' => {
  if (value >= 0.75) {
    return 'Alta';
  }
  if (value >= 0.5) {
    return 'Média';
  }
  return 'Baixa';
};

const toPercent = (value: number): string => `${Math.round(value * 100)}%`;

export default function CompreenderPage() {
  const router = useRouter();
  const [stateSnapshot, setStateSnapshot] = useState<AdaptiveInvestigationState | null>(null);

  useEffect(() => {
    setStateSnapshot(readInvestigationState());
  }, []);

  const progressItems = useMemo(
    () =>
      progressSteps.map((step, index) => ({
        step,
        active: index === 2,
        complete: index < 2,
        number: index + 1,
      })),
    []
  );

  const output = stateSnapshot?.investigationOutput;
  const rankedHypotheses = output?.hypotheses ?? [];
  const mainHypothesis = rankedHypotheses[0];
  const supportingEvidence = output?.evidence.supporting ?? [];
  const contradictingEvidence = output?.evidence.contradicting ?? [];
  const missingEvidence = output?.missingEvidence ?? [];
  const confidence = output?.confidence.global ?? stateSnapshot?.currentConfidence ?? 0;

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
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">COMPREENDER</p>
            <h1 className="mt-4 max-w-[780px] text-[2.9rem] leading-[0.96] tracking-tight text-slate-950 sm:text-[3.5rem]">
              Entendimento explicável da investigação
            </h1>
            <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-slate-600">
              Esta etapa apresenta exatamente o que o runtime cognitivo concluiu, com rastreabilidade de evidências,
              nível de confiança e lacunas ainda abertas.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[64%_36%]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border-2 border-slate-300 bg-white p-10 shadow-md shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Hipótese de maior confiança</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
                  {mainHypothesis?.description || 'Nenhuma hipótese consolidada ainda.'}
                </h2>
                <p className="mt-4 max-w-[760px] text-sm leading-7 text-slate-600">
                  {mainHypothesis?.reasoningSummary ||
                    'A investigação ainda está acumulando sinais para elevar a hipótese além de possibilidade.'}
                </p>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Hipóteses</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">Lifecycle e confiança</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Runtime Output
                  </span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {rankedHypotheses.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-base font-semibold text-slate-950">{item.description}</p>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                          {item.lifecycleStatus}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">Confiança: {toPercent(item.confidence)}</p>
                      <p className="text-sm leading-7 text-slate-600">{item.reasoningSummary}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Evidências</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">Suporte e contradição</h3>
                  </div>
                </div>

                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Suporte</p>
                    <div className="mt-2 space-y-3">
                      {supportingEvidence.map((item) => (
                        <div key={item.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                          <p className="text-base font-semibold text-slate-950">{item.title}</p>
                          <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            {item.evidenceType} · {item.weightLevel} · {toPercent(item.confidence)}
                          </p>
                        </div>
                      ))}
                      {supportingEvidence.length === 0 ? (
                        <p className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                          Nenhuma evidência de suporte consolidada.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Contradição</p>
                    <div className="mt-2 space-y-3">
                      {contradictingEvidence.map((item) => (
                        <div key={item.id} className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4">
                          <p className="text-base font-semibold text-slate-950">{item.title}</p>
                          <p className="mt-2 text-sm leading-7 text-slate-700">{item.answer}</p>
                          <p className="text-xs uppercase tracking-[0.24em] text-rose-700">
                            {item.evidenceType} · Penaliza confiança
                          </p>
                        </div>
                      ))}
                      {contradictingEvidence.length === 0 ? (
                        <p className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                          Nenhuma evidência contraditória registrada.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Evidência faltante</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Lacunas para próxima iteração</h3>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                  {missingEvidence.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                  {missingEvidence.length === 0 ? (
                    <li>Nenhuma lacuna crítica aberta no momento.</li>
                  ) : null}
                </ul>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Próxima investigação recomendada: {output?.recommendedInvestigation || 'Sem recomendação no momento.'}
                </p>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Ação recomendada</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Avançar para decisão operacional</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{output?.decision.rationale || 'A decisão será aberta na próxima etapa.'}</p>
                <div className="mt-6">
                  <Button type="button" onClick={() => router.push('/decidir')} className="w-full sm:w-auto">
                    Avançar para decisões
                  </Button>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Confiança global</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{confidenceLabel(confidence)}</p>
                <p className="mt-2 text-sm text-slate-600">{toPercent(confidence)} com base no modelo CEF.</p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status decisório</p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
                  {output?.decision.status || 'insufficient-evidence'}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{output?.decision.rationale || 'Sem racional consolidado.'}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
