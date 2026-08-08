'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { readInvestigationState } from '@/lib/investigationStateStorage';
import type { EvidenceItem, HypothesisState } from '@/runtime/artifacts/AdaptiveInvestigationState';

const stages = ['Definir', 'Investigar', 'Compreender', 'Decidir', 'Evoluir'];
const methodsApplied = ['5G', '5 Whys', 'Ishikawa'];

type ActionTrace = {
  evidence: EvidenceItem;
  hypothesis: HypothesisState;
  decision: string;
  action: ActionItem;
};

const toPercent = (value: number): string => `${Math.round(value * 100)}%`;

const deriveDecision = (description: string): string => {
  const normalized = description.toLowerCase();

  if (normalized.includes('variabilidade') || normalized.includes('processo')) {
    return 'Padronizar parâmetros críticos e conter variação operacional imediatamente.';
  }

  if (normalized.includes('controle') || normalized.includes('planejamento')) {
    return 'Reforçar governança de execução com checkpoints obrigatórios por etapa.';
  }

  if (normalized.includes('fornecedor') || normalized.includes('material') || normalized.includes('lote')) {
    return 'Aplicar contenção de lotes e revisão do fluxo de qualificação de entrada.';
  }

  return 'Mitigar risco com ação incremental e validação contínua de evidências.';
};

const deriveActionFromEvidence = (hypothesis: HypothesisState, evidence: EvidenceItem): ActionItem => {
  return {
    title: `Ação para ${evidence.investigationStep.toLowerCase()}`,
    explanation: `Aplicar resposta operacional baseada na evidência "${evidence.title}" para validar/estabilizar a hipótese: ${hypothesis.description}`,
    impact: 'Aumentar aderência da execução à hipótese confirmada',
    effort: evidence.confidence >= 0.75 ? 'Médio' : 'Baixo',
    area: 'Operações + Qualidade',
    deadline: evidence.confidence >= 0.75 ? 'Início em 24h' : 'Até D+3',
  };
};

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
  const [actionTraces, setActionTraces] = useState<ActionTrace[]>([]);

  useEffect(() => {
    const state = readInvestigationState();
    if (!state) {
      return;
    }

    const evidenceById = new Map(state.evidenceRegistry.items.map((item) => [item.id, item]));
    const confirmedHypotheses = state.hypothesisRegistry.items.filter((item) => item.status === 'Confirmed');

    const traces = confirmedHypotheses.flatMap((hypothesis) => {
      return hypothesis.supportingEvidence
        .map((evidenceId) => evidenceById.get(evidenceId))
        .filter((item): item is EvidenceItem => Boolean(item))
        .map((evidence) => {
          const decision = deriveDecision(hypothesis.description);
          return {
            evidence,
            hypothesis,
            decision,
            action: deriveActionFromEvidence(hypothesis, evidence),
          };
        });
    });

    setActionTraces(traces);
  }, []);

  const phaseOneActions = actionTraces.slice(0, 3).map((item) => item.action);
  const phaseTwoActions = actionTraces.slice(3, 6).map((item) => item.action);
  const phaseThreeActions = actionTraces.slice(6, 9).map((item) => item.action);

  const executiveObjective = {
    title: actionTraces.length > 0
      ? 'Executar ações priorizadas exclusivamente a partir de hipóteses Confirmed e evidências verificadas.'
      : 'Nenhuma ação recomendada até confirmação de hipóteses com evidências rastreáveis.',
    confidence: actionTraces.length > 0
      ? toPercent(actionTraces.reduce((acc, item) => acc + item.hypothesis.confidence, 0) / actionTraces.length)
      : '0%',
    recommendation: actionTraces.length > 0
      ? actionTraces[0].decision
      : 'Continue investigando para confirmar hipóteses antes de gerar plano de ação.',
  };

  const dynamicExpectedResults = actionTraces.length > 0
    ? [
        {
          title: 'Qualidade',
          value: `+${Math.min(25, 10 + actionTraces.length * 2)}%`,
          description: 'Melhoria projetada pela execução de ações ligadas a evidências confirmadas.',
        },
        {
          title: 'Cycle Time',
          value: `-${Math.min(20, 6 + actionTraces.length)}%`,
          description: 'Redução de retrabalho a partir de hipóteses confirmadas.',
        },
        {
          title: 'Produtividade',
          value: `+${Math.min(18, 5 + actionTraces.length)}%`,
          description: 'Ganho esperado pela remoção das causas já comprovadas.',
        },
      ]
    : expectedResults;

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

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Rastreabilidade</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Why this recommendation?</h3>
                <div className="mt-4 space-y-3">
                  {actionTraces.map((item, index) => (
                    <div key={`trace-${index}-${item.evidence.id}`} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                      <p><strong>Evidence:</strong> {item.evidence.title} ({toPercent(item.evidence.confidence)})</p>
                      <p className="text-slate-400">↓</p>
                      <p><strong>Hypothesis:</strong> {item.hypothesis.description}</p>
                      <p className="text-slate-400">↓</p>
                      <p><strong>Decision:</strong> {item.decision}</p>
                      <p className="text-slate-400">↓</p>
                      <p><strong>Action:</strong> {item.action.title}</p>
                    </div>
                  ))}
                  {actionTraces.length === 0 ? (
                    <p className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                      Sem hipóteses Confirmed e evidências conectadas, ações não são geradas nesta etapa.
                    </p>
                  ) : null}
                </div>
              </div>

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
                    {dynamicExpectedResults.map((result) => (
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

              {actionTraces.length === 0 ? (
                <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-800">
                  Nenhuma recomendação acionável foi publicada porque ainda não existem hipóteses Confirmed com evidências de suporte.
                </div>
              ) : null}

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
