'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { readInvestigationState } from '@/lib/investigationStateStorage';

const progressSteps = ['Definir', 'Investigar', 'Compreender', 'Decidir', 'Evoluir'];
const defaultSignals = ['Produção', 'Qualidade', 'Custo', 'Entrega', 'Manutenção', 'Liderança', 'Estoque'];

const defaultHypotheses = [
  {
    title: 'Variabilidade do processo',
    confidence: 'Alta',
    explanation: 'Múltiplos sinais indicam inconsistência entre planejamento e execução.',
    color: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  {
    title: 'Sobrecarga de recursos',
    confidence: 'Média',
    explanation: 'As equipes parecem sobrecarregadas por iniciativas paralelas, reduzindo a velocidade de resposta.',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    title: 'Desvio de controle',
    confidence: 'Alta',
    explanation: 'Os controles operacionais enfraqueceram, permitindo que pequenos desvios se acumulem.',
    color: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  {
    title: 'Lacunas de informação',
    confidence: 'Média',
    explanation: 'Transições críticas carecem de responsabilidade clara e visibilidade entre áreas.',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

const confidenceLabel = (value: number): 'Alta' | 'Média' | 'Baixa' => {
  if (value >= 0.75) {
    return 'Alta';
  }
  if (value >= 0.5) {
    return 'Média';
  }
  return 'Baixa';
};

export default function CompreenderPage() {
  const router = useRouter();
  const [signals, setSignals] = useState<string[]>(defaultSignals);
  const [hypotheses, setHypotheses] = useState(defaultHypotheses);
  const [overallConfidence, setOverallConfidence] = useState<'Alta' | 'Média' | 'Baixa'>('Alta');
  const [mainConclusion, setMainConclusion] = useState(
    'A clareza está na sequência entre planejamento e controles.'
  );

  useEffect(() => {
    const state = readInvestigationState();

    if (!state) {
      return;
    }

    const mappedSignals = Array.from(new Set([state.operationalObject.domain, ...state.operationalObject.suspectedDomains]))
      .map((item) => item.trim())
      .filter(Boolean);

    if (mappedSignals.length > 0) {
      setSignals(mappedSignals);
    }

    const mappedHypotheses = state.hypotheses
      .slice()
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 4)
      .map((item, index) => ({
        title: item.statement,
        confidence: confidenceLabel(item.confidence),
        explanation: item.rationale,
        color: index % 2 === 0 ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-slate-100 text-slate-700 border-slate-200',
      }));

    if (mappedHypotheses.length > 0) {
      setHypotheses(mappedHypotheses);
      setMainConclusion(mappedHypotheses[0].title);
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
                  O impacto ocorre principalmente em pedidos críticos: a complexidade na transferência entre planejamento e execução gerou atrasos, falhas de qualidade e fricção entre times de operação e engenharia.
                </p>
                <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                  O problema central está na falta de alinhamento entre a demanda esperada e a capacidade real dos sistemas, que amplifica erros pequenos em interrupções maiores.
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Evidências</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">Sinais que sustentam a leitura</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Sinais foco
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {signals.map((signal) => (
                    <span key={signal} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                      {signal}
                    </span>
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
                    Confiança inicial
                  </span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {hypotheses.map((item) => (
                    <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-base font-semibold text-slate-950">{item.title}</p>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${item.color}`}>
                          {item.confidence}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.explanation}</p>
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
                        Variações constantes no processo criam pontos de fricção entre planejamento e execução.
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Lacunas de informação</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Falhas na transferência de informações ampliam o impacto das instabilidades operacionais.
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Desvio de controle</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Controle fraco permite que discrepâncias se tornem interrupções sistêmicas.
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
