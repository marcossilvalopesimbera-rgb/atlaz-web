'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';

const progressSteps = ['Definir', 'Investigar', 'Compreender', 'Decidir', 'Evoluir'];
const signals = ['Production', 'Quality', 'Cost', 'Delivery', 'Maintenance', 'Leadership', 'Inventory'];

const hypotheses = [
  {
    title: 'Process variability',
    confidence: 'High',
    explanation: 'Multiple signals indicate inconsistency between planning and execution.',
    color: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  {
    title: 'Resource overload',
    confidence: 'Medium',
    explanation: 'Teams appear stretched across parallel launches, reducing response speed.',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    title: 'Control drift',
    confidence: 'High',
    explanation: 'Operational checks have weakened, allowing small issues to compound.',
    color: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  {
    title: 'Information gaps',
    confidence: 'Medium',
    explanation: 'Key handoffs lack clear ownership and visibility across teams.',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

export default function CompreenderPage() {
  const router = useRouter();

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
        <div className="space-y-14">
          <div className="space-y-6">
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

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-sm shadow-slate-950/5">
              <div className="space-y-6 text-center">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">COMPREENDER</p>
                <div className="mx-auto max-w-[760px] space-y-5">
                  <h1 className="text-[3rem] leading-[0.96] tracking-tight text-slate-950 sm:text-[3.75rem]">
                    O que está causando isto?
                  </h1>
                  <p className="text-[18px] leading-8 text-slate-600">
                    A ATLAZ organizou sinais e hipóteses para revelar as causas prováveis e as conexões entre elas.
                  </p>
                  <p className="text-sm italic leading-7 text-slate-500">
                    Decisões seguras começam com uma explicação bem fundamentada.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[62%_36%]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm shadow-slate-950/5 animate-fade-in">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Context</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">Resumo do que já sabemos</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Síntese inteligente
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-slate-600">
                    O impacto ocorre principalmente em pedidos críticos: a complexidade na transferência entre planejamento e execução gerou atrasos, falhas de qualidade e fricção entre times de operação e engenharia.
                  </p>
                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-700">
                    O problema central está na falta de alinhamento entre a demanda esperada e a capacidade real dos sistemas, que amplifica erros pequenos em interrupções maiores.
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.05s' }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Main signals detected</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">Tópicos que se destacam</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Sinais foco
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {signals.map((signal) => (
                      <span key={signal} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-950/5 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-100">
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Possible root causes</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">Hipóteses principais</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Confiança inicial
                    </span>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {hypotheses.map((item, index) => (
                      <div key={item.title} className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${item.color}`}>
                            {item.confidence}
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-7 text-slate-600">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Relationships</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">Como as hipóteses se conectam</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Contexto inteligente
                    </span>
                  </div>

                  <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8">
                    <div className="absolute left-1/2 top-8 h-px w-[60%] -translate-x-1/2 bg-slate-200" />
                    <div className="absolute left-1/2 top-8 h-8 w-px bg-slate-200" />
                    <div className="absolute left-1/2 top-[5.5rem] h-px w-[25%] bg-slate-200" />
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 transition duration-200 group-hover:-translate-y-0.5">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Process variability</p>
                        <p className="mt-4 text-sm leading-7 text-slate-600">Variações constantes no processo criam pontos de fricção entre planejamento e execução.</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 transition duration-200 group-hover:-translate-y-0.5">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Information gaps</p>
                        <p className="mt-4 text-sm leading-7 text-slate-600">Falhas na transferência de informações ampliam o impacto das instabilidades operacionais.</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 transition duration-200 group-hover:-translate-y-0.5">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Control drift</p>
                        <p className="mt-4 text-sm leading-7 text-slate-600">Controle fraco permite que discrepâncias se tornem interrupções sistêmicas.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-[#5B5CEB] p-10 shadow-sm shadow-slate-950/10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="space-y-5 text-white">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-200">Most likely leverage point</p>
                  <h2 className="text-3xl font-semibold leading-tight">A clareza está na sequência entre planejamento e controles.</h2>
                  <p className="max-w-[620px] text-sm leading-7 text-slate-200/90">
                    As evidências mostram que a maior alavanca está em reforçar o fluxo entre o planejamento e a execução para reduzir ruídos e evitar que pequenos desvios se tornem crises.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.05s' }}>
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">How ATLAZ saw it</p>
                  <p className="text-sm leading-7 text-slate-600">
                    A inteligência agrupou sinais de processo, controle e comunicação para apresentar um modelo lógico da situação, em vez de apenas listar problemas.
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-lg font-semibold text-slate-950">Próximo passo</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Estamos prontos para traduzir esse entendimento em recomendações de decisão e mostrar como agir com clareza.
                </p>
                  <div className="mt-6 flex justify-start">
                  <Button type="button" onClick={() => router.push('/decidir')} className="w-full sm:w-auto">
                    Descobrir recomendações →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
