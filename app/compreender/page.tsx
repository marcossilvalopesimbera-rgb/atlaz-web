'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { readInvestigationState } from '@/lib/investigationStateStorage';
import type { EvidenceItem, HypothesisState } from '@/runtime/artifacts/AdaptiveInvestigationState';

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
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [hypotheses, setHypotheses] = useState<HypothesisState[]>([]);
  const [overallConfidence, setOverallConfidence] = useState<'Alta' | 'Média' | 'Baixa'>('Alta');
  const [mainConclusion, setMainConclusion] = useState(
    'A clareza está na sequência entre planejamento e controles.'
  );

  useEffect(() => {
    const state = readInvestigationState();

    if (!state) {
      return;
    }

    if (state.evidenceRegistry.items.length > 0) {
      setEvidence(state.evidenceRegistry.items.slice(-8).reverse());
    }

    const rankedHypotheses = state.hypothesisRegistry.items
      .slice()
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);

    if (rankedHypotheses.length > 0) {
      setHypotheses(rankedHypotheses);
      const bestConfirmed = rankedHypotheses.find((item) => item.status === 'Confirmed');
      setMainConclusion((bestConfirmed ?? rankedHypotheses[0]).description);
    }

    setOverallConfidence(confidenceLabel(state.currentConfidence));
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
              O que está causando isto?
            </h1>
            <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-slate-600">
              A ATLAZ conectou sinais e hipóteses para revelar a causa mais provável, por que ela importa agora e como isso orienta a próxima decisão.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[64%_36%]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border-2 border-slate-300 bg-white p-10 shadow-md shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Conclusão principal</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
                  {mainConclusion}
                </h2>
                <p className="mt-4 max-w-[680px] text-sm leading-7 text-slate-600">
                  As evidências mostram que a maior alavanca está em reforçar o fluxo entre o planejamento e a execução para reduzir ruídos e evitar que pequenos desvios se tornem crises.
                </p>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Contexto</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">Resumo do que já sabemos</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Síntese inteligente
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  A etapa de compreensão usa exclusivamente as evidências registradas no fluxo investigativo e suas hipóteses explícitas relacionadas.
                </p>
                <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                  Cada hipótese abaixo mostra o que está sustentando a conclusão, o que a contradiz e qual o status atual da investigação causal.
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Evidências</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">Evidence Registry</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Estruturado
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {evidence.map((item) => (
                    <div key={item.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-base font-semibold text-slate-950">{item.title}</p>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                          {toPercent(item.confidence)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">Fonte: {item.source}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Etapa: {item.investigationStep}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Insights</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">Hipóteses principais</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Investigativas
                  </span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {hypotheses.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-base font-semibold text-slate-950">{item.description}</p>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">Confiança: {toPercent(item.confidence)}</p>
                      <p className="text-sm leading-7 text-slate-600">Evidências de suporte: {item.supportingEvidence.length}</p>
                      <p className="text-sm leading-7 text-slate-600">Evidências contraditórias: {item.contradictingEvidence.length}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Relacionamentos</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">Como as hipóteses se conectam</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Contexto inteligente
                  </span>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <div className="grid gap-3 lg:grid-cols-3">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Variabilidade do processo</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Evidências com mesmo padrão aumentam confiança em hipóteses confirmadas.
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Lacunas de informação</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Hipóteses ativas ainda dependem de evidência complementar para confirmação.
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Desvio de controle</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Hipóteses descartadas são removidas da base de decisão para evitar ruído.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Ação recomendada</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Transformar entendimento em recomendações</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Estamos prontos para traduzir esse entendimento em recomendações de decisão e mostrar como agir com clareza.
                </p>
                <div className="mt-6">
                  <Button type="button" onClick={() => router.push('/decidir')} className="w-full sm:w-auto">
                    Avançar para decisões
                  </Button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Fechamento da etapa</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Compreensão consolidada</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  A leitura causal foi estruturada com base em sinais e hipóteses conectadas. A próxima etapa consolida decisões rastreáveis.
                </p>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Como a ATLAZ interpretou</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  A inteligência agrupou sinais de processo, controle e comunicação para apresentar um modelo lógico da situação, em vez de apenas listar problemas.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Confiança</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{overallConfidence}</p>
                <p className="mt-2 text-sm text-slate-600">Baseada em convergência de sinais e coerência causal.</p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Última atualização</p>
                <p className="mt-2">Síntese causal atualizada com os sinais mais recentes registrados na investigação.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
