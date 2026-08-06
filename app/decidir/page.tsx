'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';

const progressSteps = ['Definir', 'Investigar', 'Compreender', 'Decidir', 'Evoluir'];

const evidenceItems = [
  {
    title: 'Padrão recorrente',
    description: 'Os sinais mais fortes apontam para o mesmo ponto de fricção entre planejamento e execução.',
  },
  {
    title: 'Impacto concentrado',
    description: 'Os efeitos foram mais visíveis em cenários críticos, onde pequenas variações amplificam riscos.',
  },
  {
    title: 'Falta de visibilidade',
    description: 'A transferência de informação entre times mostrou-se incompleta e pouco confiável.',
  },
];

const methodsApplied = ['5G', '5 Whys', 'Ishikawa'];

const hypotheses = [
  {
    title: 'Alinhamento de prioridades',
    confidence: '86%',
    description: 'A equipe opera com metas diferentes em momentos próximos, o que gera ruído de decisão.',
    width: 'w-[86%]',
  },
  {
    title: 'Capacidade operacional',
    confidence: '74%',
    description: 'A carga de trabalho parece exceder a capacidade de resposta em alguns pontos do fluxo.',
    width: 'w-[74%]',
  },
  {
    title: 'Controles insuficientes',
    confidence: '68%',
    description: 'Os check-points existentes não capturam todos os riscos antes que eles se tornem impacto.',
    width: 'w-[68%]',
  },
];

const evidenceUploads = [
  { label: 'Adicionar nota', description: 'Registrar uma nova observação' },
  { label: 'Enviar documento', description: 'PDF, DOCX ou TXT' },
  { label: 'Enviar foto', description: 'Registrar evidência visual' },
  { label: 'Enviar planilha', description: 'Dados e métricas' },
  { label: 'Enviar vídeo', description: 'Contexto operacional' },
];

export default function DecidirPage() {
  const router = useRouter();

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
            <h1 className="mt-4 max-w-[780px] text-[2.9rem] leading-[0.96] tracking-tight text-slate-950 sm:text-[3.5rem]">
              O que a investigação revelou
            </h1>
            <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-slate-600">
              A ATLAZ consolidou as evidências para indicar a melhor direção de decisão agora, os riscos envolvidos e os próximos movimentos recomendados.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[64%_36%]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border-2 border-slate-300 bg-white p-10 shadow-md shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Conclusão principal</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
                  A falha central não é apenas operacional, mas de alinhamento entre o que foi planejado e o que a equipe consegue executar com estabilidade.
                </h2>

                <div className="mt-6 rounded-[1.5rem] bg-[#5B5CEB] p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-200">Recomendação executiva</p>
                  <p className="mt-3 text-lg font-semibold leading-8">
                    Reforçar o fluxo entre decisão e execução com foco em controles críticos e clareza de responsabilidade.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-200/90">
                    As evidências sugerem que pequenas variações não tratadas se tornam interrupções maiores quando o alinhamento entre times fica fraco.
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Evidências</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">O que sustenta esta decisão</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Dados claros
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {evidenceItems.map((item) => (
                    <div key={item.title} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-base font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Insights</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">Ranking de confiança das hipóteses</h3>
                  <div className="mt-4 space-y-5">
                    {hypotheses.map((item) => (
                      <div key={item.title}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                          <span className="text-sm font-semibold text-[#5B5CEB]">{item.confidence}</span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                          <div className={`h-2 rounded-full bg-[#5B5CEB] ${item.width}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Suporte</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">Métodos aplicados</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    {methodsApplied.map((method) => (
                      <div key={method} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        {method}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Ação</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Escolha como avançar a partir da conclusão</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Novas notas, arquivos e registros podem atualizar automaticamente hipóteses e nível de confiança antes da definição final do plano.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {evidenceUploads.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                    >
                      <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                      <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button type="button" onClick={() => router.push('/evoluir')} className="w-full sm:w-auto">
                    Construir plano de ação
                  </Button>
                  <Button variant="secondary" type="button" onClick={() => router.push('/workspace')} className="w-full sm:w-auto">
                    Continuar investigando
                  </Button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Fechamento da etapa</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Decisão consolidada</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  A direção recomendada está conectada às evidências atuais e pronta para se transformar em plano executável na etapa final.
                </p>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Resumo de status</p>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">Progresso da investigação</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-[82%] rounded-full bg-[#5B5CEB]" />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">82% consolidado</p>
                </div>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">Confiança atual</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">87%</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Última atualização</p>
                <p className="mt-2">
                  A leitura atual foi consolidada há poucos minutos, com base em evidências já registradas no fluxo de investigação.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
