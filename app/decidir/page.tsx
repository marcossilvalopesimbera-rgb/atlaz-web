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
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">CONCLUSÕES</p>
                <div className="mx-auto max-w-[760px] space-y-5">
                  <h1 className="text-[3rem] leading-[0.96] tracking-tight text-slate-950 sm:text-[3.75rem]">
                    O que a investigação revelou
                  </h1>
                  <p className="text-[18px] leading-8 text-slate-600">
                    A ATLAZ consolidou as evidências disponíveis para transformar sinais dispersos em uma conclusão útil antes de construir o plano de ação.
                  </p>
                  <p className="text-sm italic leading-7 text-slate-500">
                    Novas pistas podem reforçar ou ajustar esta leitura, mas o quadro atual já oferece uma direção clara.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[62%_36%]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm shadow-slate-950/5 animate-fade-in">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Conclusão principal</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                        A falha central não é apenas operacional, mas de alinhamento entre o que foi planejado e o que a equipe consegue executar com estabilidade.
                      </h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Alta confiança
                    </span>
                  </div>

                  <div className="rounded-[2rem] bg-[#5B5CEB] p-8 text-white shadow-sm shadow-slate-950/10">
                    <div className="space-y-5">
                      <p className="text-lg font-semibold leading-8">
                        A recomendação mais forte neste momento é reforçar o fluxo entre decisão e execução, com foco em controles críticos e clareza de responsabilidade.
                      </p>
                      <p className="text-sm leading-7 text-slate-200/90">
                        As evidências sugerem que pequenas variações não tratadas se tornam interrupções maiores quando o alinhamento entre times fica fraco.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {['Risco reduzido', 'Visibilidade maior', 'Ação objetiva'].map((tag) => (
                          <span key={tag} className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.05s' }}>
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Evidências que sustentam</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">O que a investigação mostrou</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Dados claros
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {evidenceItems.map((item) => (
                      <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                        <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Métodos aplicados</p>
                        <h2 className="mt-2 text-xl font-semibold text-slate-950">Ferramentas usadas nesta investigação</h2>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {methodsApplied.map((method) => (
                        <div key={method} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                          {method}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Hipóteses avaliadas</p>
                        <h2 className="mt-2 text-xl font-semibold text-slate-950">Ranking de confiança atual</h2>
                      </div>
                    </div>
                    <div className="space-y-5">
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
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Novas evidências</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">A investigação continua aberta</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Atualização contínua
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-slate-600">
                    Novas notas, arquivos e registros podem atualizar automaticamente as hipóteses e a confiança atribuída a cada conclusão.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {evidenceUploads.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className="rounded-[1.25rem] border border-slate-200 bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                      >
                        <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                        <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.05s' }}>
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Resumo de status</p>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <p className="text-sm font-semibold text-slate-950">Progresso da investigação</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div className="h-2 w-[82%] rounded-full bg-[#5B5CEB]" />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">82% consolidado</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <p className="text-sm font-semibold text-slate-950">Confiança atual</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">87%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-lg font-semibold text-slate-950">Métodos usados</h3>
                <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                  {methodsApplied.map((item) => (
                    <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <h3 className="text-lg font-semibold text-slate-950">Última atualização</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  A leitura atual foi consolidada há poucos minutos, com base em evidências já registradas no fluxo de investigação.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">Próximo passo</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Escolha como avançar a partir da conclusão atual.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" onClick={() => router.push('/evoluir')} className="w-full sm:w-auto">
                Construir plano de ação
              </Button>
              <Button variant="secondary" type="button" onClick={() => router.push('/workspace')} className="w-full sm:w-auto">
                Continuar investigando
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
