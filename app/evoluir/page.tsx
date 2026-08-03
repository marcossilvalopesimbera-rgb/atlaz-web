'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';

const stages = ['Definir', 'Investigar', 'Compreender', 'Decidir', 'Evoluir'];
const executiveObjective = {
  title: 'Reduzir o retrabalho da montagem das portas em 80% nos próximos 90 dias.',
  confidence: '89%',
  recommendation:
    'Executar um plano em três frentes: estabilização imediata, eliminação da causa raiz e reforço sistêmico de prevenção.',
};

const methodsApplied = ['5G', '5 Whys', 'Ishikawa'];

const phaseOneActions = [
  {
    title: 'Inspeção temporária em 100% dos pontos críticos',
    explanation: 'Aplicar inspeção focada nos estágios finais de montagem até estabilizar o índice de retrabalho.',
    impact: 'Redução imediata de defeitos de saída',
    effort: 'Médio',
    area: 'Qualidade + Produção',
    deadline: 'Início em 24h',
  },
  {
    title: 'Monitoramento por turno do setup da estação',
    explanation: 'Registrar desvios de setup por turno para conter variações que elevam erro dimensional.',
    impact: 'Queda rápida na variabilidade do processo',
    effort: 'Baixo',
    area: 'Produção',
    deadline: 'Até D+2',
  },
  {
    title: 'Contenção temporária de lotes de maior risco',
    explanation: 'Aplicar gate de contenção para evitar envio de unidades com histórico de falha recorrente.',
    impact: 'Menor risco de impacto ao cliente',
    effort: 'Médio',
    area: 'Qualidade + Logística',
    deadline: 'Até D+3',
  },
];

const phaseTwoActions = [
  {
    title: 'Ajuste de engenharia no ponto de fixação',
    explanation: 'Revisar o ajuste de engenharia que hoje permite folga acima da faixa nominal em cenários críticos.',
    impact: 'Eliminação da principal causa de retrabalho',
    effort: 'Alto',
    area: 'Engenharia de Processo',
    deadline: 'Até D+21',
  },
  {
    title: 'Revisão de parâmetros e validação de processo',
    explanation: 'Atualizar parâmetros-chave e validar repetibilidade com amostragem ampliada por condição de uso.',
    impact: 'Aumento da estabilidade e previsibilidade',
    effort: 'Médio',
    area: 'Engenharia + Qualidade',
    deadline: 'Até D+14',
  },
  {
    title: 'Atualização da instrução de trabalho e qualificação',
    explanation: 'Padronizar sequência operacional revisada e requalificar operadores nas etapas críticas.',
    impact: 'Execução consistente entre turnos',
    effort: 'Médio',
    area: 'Produção + RH Técnico',
    deadline: 'Até D+10',
  },
];

const phaseThreeActions = [
  {
    title: 'Revisar PFMEA e Plano de Controle',
    explanation: 'Incorporar o modo de falha identificado e reforçar controles preventivos nos pontos de maior risco.',
    impact: 'Prevenção estruturada de recorrência',
    effort: 'Médio',
    area: 'Qualidade',
    deadline: 'Até D+30',
  },
  {
    title: 'Atualizar matriz de treinamento e trabalho padrão',
    explanation: 'Consolidar lições aprendidas e refletir mudanças no padrão operacional e na matriz de competências.',
    impact: 'Sustentação do resultado no longo prazo',
    effort: 'Baixo',
    area: 'Produção + RH Técnico',
    deadline: 'Até D+35',
  },
  {
    title: 'Auditorias de processo e produto em ciclo curto',
    explanation: 'Executar auditorias quinzenais para verificar aderência ao novo padrão e antecipar desvios.',
    impact: 'Detecção precoce e melhoria contínua',
    effort: 'Médio',
    area: 'Qualidade + Operações',
    deadline: 'Primeiro ciclo em D+15',
  },
];

const expectedResults = [
  {
    title: 'Qualidade',
    value: '+18%',
    description: 'Aumento esperado no indicador de conformidade final.',
  },
  {
    title: 'Cycle Time',
    value: '-12%',
    description: 'Redução de tempo por eliminação de retrabalho.',
  },
  {
    title: 'Produtividade',
    value: '+9%',
    description: 'Ganho operacional após estabilização do processo.',
  },
  {
    title: 'Scrap',
    value: '-22%',
    description: 'Queda projetada em perdas de material e retrabalho.',
  },
  {
    title: 'Delivery',
    value: '+11%',
    description: 'Maior aderência a prazo em pedidos críticos.',
  },
];

type ActionItem = {
  title: string;
  explanation: string;
  impact: string;
  effort: string;
  area: string;
  deadline: string;
};

function ActionSection({
  title,
  purpose,
  actions,
  delay,
}: {
  title: string;
  purpose: string;
  actions: ActionItem[];
  delay?: string;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm shadow-slate-950/5 animate-fade-in" style={delay ? { animationDelay: delay } : undefined}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{purpose}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Priorizado pela ATLAZ
          </span>
        </div>

        <div className="space-y-4">
          {actions.map((action) => (
            <details key={action.title} className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition duration-200 open:bg-white hover:border-slate-300">
              <summary className="cursor-pointer list-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-950">{action.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{action.explanation}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 transition group-open:border-[#5B5CEB] group-open:text-[#5B5CEB]">
                    Ver detalhes
                  </span>
                </div>
              </summary>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Impacto esperado</p>
                  <p className="mt-2 font-semibold text-slate-900">{action.impact}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Esforço de implementação</p>
                  <p className="mt-2 font-semibold text-slate-900">{action.effort}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Área responsável</p>
                  <p className="mt-2 font-semibold text-slate-900">{action.area}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Prazo sugerido</p>
                  <p className="mt-2 font-semibold text-slate-900">{action.deadline}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EvoluirPage() {
  const router = useRouter();

  const progressItems = useMemo(
    () =>
      stages.map((stage, index) => ({
        label: stage,
        active: index === 4,
        complete: index < 4,
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
                  key={item.label}
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
                  {item.label}
                </div>
              ))}
            </nav>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-sm shadow-slate-950/5">
              <div className="space-y-6 text-center">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">EVOLUIR</p>
                <div className="mx-auto max-w-[760px] space-y-5">
                  <h1 className="text-[3rem] leading-[0.96] tracking-tight text-slate-950 sm:text-[3.75rem]">
                    Plano de ação recomendado
                  </h1>
                  <p className="text-[18px] leading-8 text-slate-600">
                    A investigação foi concluída.
                  </p>
                  <p className="text-[18px] leading-8 text-slate-600">
                    A ATLAZ organizou as ações recomendadas por prioridade, impacto esperado e evidências coletadas.
                  </p>
                  <p className="text-sm italic leading-7 text-slate-500">
                    Investigação concluída. Decisão fundamentada. Plano estruturado. Melhoria contínua.
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
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Objetivo executivo</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">{executiveObjective.title}</h2>
                    </div>
                    <span className="rounded-full bg-[#5B5CEB] px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">
                      Confiança {executiveObjective.confidence}
                    </span>
                  </div>
                  <div className="rounded-[1.75rem] bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Recomendação central</p>
                    <p className="mt-4 text-lg leading-8 text-slate-900">{executiveObjective.recommendation}</p>
                  </div>
                </div>
              </div>

              <ActionSection
                title="Primeiras ações recomendadas"
                purpose="Ações imediatas para estabilizar a situação atual e reduzir impacto operacional no curto prazo."
                actions={phaseOneActions}
                delay="0.05s"
              />

              <ActionSection
                title="Eliminar a causa identificada"
                purpose="Intervenções para remover de forma definitiva a causa principal encontrada na investigação."
                actions={phaseTwoActions}
                delay="0.1s"
              />

              <ActionSection
                title="Evitar que o problema volte"
                purpose="Melhorias sistêmicas de longo prazo para sustentar o resultado e fortalecer a prevenção."
                actions={phaseThreeActions}
                delay="0.15s"
              />

              <div className="grid gap-4 lg:grid-cols-[58%_40%]">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Resultados esperados</p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Indicadores executivos</h2>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                        Projeção inicial
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {expectedResults.map((result) => (
                        <div key={result.title} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-950">{result.title}</p>
                            <span className="text-sm font-semibold text-[#5B5CEB]">{result.value}</span>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-600">{result.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.22s' }}>
                  <div className="space-y-4">
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Risco se nada for feito</p>
                    <h3 className="text-xl font-semibold text-slate-950">Impactos prováveis sem execução do plano</h3>
                    <ul className="space-y-3 text-sm leading-7 text-slate-600">
                      {[
                        'Perda progressiva de produtividade em linhas críticas',
                        'Aumento de scrap e retrabalho com maior custo operacional',
                        'Maior risco de impacto ao cliente em entregas de prioridade alta',
                        'Reincidência do problema por ausência de reforço sistêmico',
                      ].map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-xs text-white">!</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Investigação continua aberta</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">Novas informações encontradas?</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Atualização automática
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-slate-200/90">
                    Novas evidências podem repriorizar automaticamente recomendações e atualizar o plano de ação.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: 'Adicionar nota', description: 'Registrar novas observações de campo' },
                      { label: 'Enviar documento', description: 'PDF, DOCX, XLSX ou TXT' },
                      { label: 'Enviar foto', description: 'Evidência visual da operação' },
                      { label: 'Enviar planilha', description: 'Dados adicionais para análise' },
                      { label: 'Enviar vídeo', description: 'Contexto de execução em linha' },
                    ].map((item) => (
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
                  <p className="rounded-[1.25rem] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
                    New evidence may automatically reprioritize recommendations and update the action plan.
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-lg font-semibold text-slate-950">Conhecimento organizacional</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Esta investigação se torna conhecimento organizacional e pode acelerar futuras investigações com características similares.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.05s' }}>
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Perfil logado</p>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">ML</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Marcos Lopes</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Continuous Improvement Manager</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-lg font-semibold text-slate-950">Resumo de status</h3>
                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-950">Investigação concluída</p>
                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div className="h-2 w-full rounded-full bg-[#5B5CEB]" />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">100% consolidado</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-950">Nível de confiança</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">{executiveObjective.confidence}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <h3 className="text-lg font-semibold text-slate-950">Métodos aplicados</h3>
                <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                  {methodsApplied.map((item) => (
                    <div key={item} className="rounded-3xl border border-slate-200 bg-white p-4">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg font-semibold text-slate-950">Última atualização</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Plano consolidado há poucos minutos com base nas evidências validadas, conclusões da investigação e nível atual de confiança.
                </p>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5 animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <h3 className="text-lg font-semibold text-slate-950">Pronto para execução</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  As recomendações já estão organizadas automaticamente em uma sequência prática para implementação.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">Próximo passo</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Confirme o plano estruturado e compartilhe com as áreas responsáveis.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" onClick={() => router.push('/')} className="w-full sm:w-auto">
                Salvar plano de ação
              </Button>
              <Button variant="secondary" type="button" className="w-full sm:w-auto">
                Exportar relatório
              </Button>
              <Button variant="secondary" type="button" onClick={() => router.push('/new')} className="w-full sm:w-auto">
                Nova investigação
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
