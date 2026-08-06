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
    title: 'Entrega',
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
}: {
  title: string;
  purpose: string;
  actions: ActionItem[];
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{purpose}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Priorizado pela ATLAZ
          </span>
        </div>

        <div className="space-y-3">
          {actions.map((action) => (
            <details key={action.title} className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition duration-200 open:bg-white">
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
              <div className="mt-4 grid gap-3 text-sm transition-all duration-300 group-open:animate-fade-in sm:grid-cols-2">
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
        <div className="space-y-10">
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

          <div className="rounded-[2rem] border-2 border-slate-300 bg-white p-10 shadow-md shadow-slate-950/10">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">EVOLUIR</p>
            <h1 className="mt-4 max-w-[780px] text-[2.9rem] leading-[0.96] tracking-tight text-slate-950 sm:text-[3.5rem]">
              Plano de ação recomendado
            </h1>
            <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-slate-600">
              A ATLAZ concluiu a investigação, priorizou ações por impacto e estruturou a execução para reduzir risco imediato e evitar recorrência.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[64%_36%]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border-2 border-slate-300 bg-white p-10 shadow-md shadow-slate-950/10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Objetivo executivo</p>
                    <h2 className="mt-2 text-3xl font-semibold leading-tight text-slate-950">{executiveObjective.title}</h2>
                  </div>
                  <span className="rounded-full bg-[#5B5CEB] px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                    Confiança {executiveObjective.confidence}
                  </span>
                </div>
                <div className="mt-6 rounded-[1.5rem] bg-[#5B5CEB] p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-200">Recomendação central</p>
                  <p className="mt-3 text-lg font-semibold leading-8">{executiveObjective.recommendation}</p>
                </div>
              </div>

              <ActionSection
                title="Primeiras ações recomendadas"
                purpose="Ações imediatas para estabilizar a situação atual e reduzir impacto operacional no curto prazo."
                actions={phaseOneActions}
              />

              <ActionSection
                title="Eliminar a causa identificada"
                purpose="Intervenções para remover de forma definitiva a causa principal encontrada na investigação."
                actions={phaseTwoActions}
              />

              <ActionSection
                title="Evitar que o problema volte"
                purpose="Melhorias sistêmicas de longo prazo para sustentar o resultado e fortalecer a prevenção."
                actions={phaseThreeActions}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Evidências</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">Indicadores esperados</h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Projeção inicial
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Risco se nada for feito</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">Impactos prováveis sem execução</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                    {[
                      'Perda progressiva de produtividade em linhas críticas',
                      'Aumento de scrap e retrabalho com maior custo operacional',
                      'Maior risco de impacto ao cliente em entregas de prioridade alta',
                      'Reincidência do problema por ausência de reforço sistêmico',
                    ].map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
                          !
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Ação e continuidade</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Plano pronto para execução</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Novas evidências podem repriorizar automaticamente recomendações e atualizar o plano de ação sem perder rastreabilidade.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                      className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                    >
                      <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                      <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Fechamento da etapa</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Plano de ação gerado</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  A investigação agora é conhecimento organizacional e está pronta para execução coordenada com as áreas responsáveis.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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

            <aside className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Perfil logado</p>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                      ML
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Marcos Lopes</p>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Gerente de Melhoria Contínua</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Resumo de status</p>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">Investigação concluída</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-full rounded-full bg-[#5B5CEB]" />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">100% consolidado</p>
                </div>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">Nível de confiança</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{executiveObjective.confidence}</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Métodos aplicados</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {methodsApplied.map((item) => (
                    <div key={item} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Última atualização</p>
                <p className="mt-2">
                  Plano consolidado há poucos minutos com base nas evidências validadas, conclusões da investigação e nível atual de confiança.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
