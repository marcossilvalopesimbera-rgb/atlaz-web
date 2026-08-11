'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { readInvestigationState } from '@/lib/investigationStateStorage';
import type { AdaptiveInvestigationState, EvidenceItem } from '@/runtime/artifacts/AdaptiveInvestigationState';

const stages = ['Definir', 'Investigar', 'Compreender', 'Decidir', 'Evoluir'];

type ActionItem = {
  title: string;
  explanation: string;
  impact: string;
  effort: string;
  area: string;
  deadline: string;
};

const toPercent = (value: number): string => `${Math.round(value * 100)}%`;

const buildActionItem = (evidence: EvidenceItem, index: number): ActionItem => {
  return {
    title: `Ação ${index + 1}: ${evidence.investigationStep}`,
    explanation: `Executar investigação dirigida com base na evidência ${evidence.evidenceType} para responder: ${evidence.question}`,
    impact: `Reduzir incerteza sobre ${evidence.relatedHypothesisId}`,
    effort: evidence.weightLevel === 'Maximum' || evidence.weightLevel === 'VeryHigh' ? 'Alto' : 'Médio',
    area: 'Operações + Qualidade',
    deadline: evidence.temporalCorrelation >= 0.8 ? 'Iniciar em 24h' : 'Até D+5',
  };
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
            CEF Runtime
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
              <div className="mt-4 grid gap-3 text-sm transition-all duration-300 sm:grid-cols-2">
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
          {actions.length === 0 ? (
            <p className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              Sem ações priorizadas porque o runtime ainda exige novas evidências.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function EvoluirPage() {
  const router = useRouter();
  const [stateSnapshot, setStateSnapshot] = useState<AdaptiveInvestigationState | null>(null);

  useEffect(() => {
    setStateSnapshot(readInvestigationState());
  }, []);

  const output = stateSnapshot?.investigationOutput;
  const supportEvidence = output?.evidence.supporting ?? [];
  const contradictingEvidence = output?.evidence.contradicting ?? [];
  const missingEvidence = output?.missingEvidence ?? [];

  const actionItems = supportEvidence.slice(0, 9).map(buildActionItem);
  const phaseOneActions = actionItems.slice(0, 3);
  const phaseTwoActions = actionItems.slice(3, 6);
  const phaseThreeActions = actionItems.slice(6, 9);

  const executiveObjective = {
    title:
      output?.decision.status === 'ready-for-decision'
        ? 'Executar plano com base em hipóteses validadas e evidências de alta qualidade.'
        : 'Consolidar evidências pendentes antes de formalizar plano final de execução.',
    confidence: toPercent(output?.confidence.global ?? 0),
    recommendation: output?.recommendedInvestigation || 'Expandir investigação para reduzir lacunas de evidência.',
  };

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
              Plano de ação orientado por evidências
            </h1>
            <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-slate-600">
              Esta etapa traduz a saída do runtime cognitivo em execução, mantendo rastreabilidade de hipóteses,
              lacunas e confiança.
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
                purpose="Ações imediatas para reduzir risco e remover incerteza operacional de curto prazo."
                actions={phaseOneActions}
              />

              <ActionSection
                title="Ações de validação estrutural"
                purpose="Ações para converter hipóteses suportadas em hipóteses validadas ou rejeitadas com evidência objetiva."
                actions={phaseTwoActions}
              />

              <ActionSection
                title="Ações de prevenção e evolução"
                purpose="Ações sistêmicas para evitar recorrência e consolidar aprendizado organizacional."
                actions={phaseThreeActions}
              />

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Rastreabilidade</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Why this recommendation?</h3>
                <div className="mt-4 space-y-3">
                  {supportEvidence.map((item) => (
                    <div key={item.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                      <p><strong>Evidence:</strong> {item.question}</p>
                      <p className="text-slate-400">↓</p>
                      <p><strong>Answer:</strong> {item.answer}</p>
                      <p className="text-slate-400">↓</p>
                      <p><strong>Weight:</strong> {item.weightLevel} ({toPercent(item.weight)})</p>
                      <p className="text-slate-400">↓</p>
                      <p><strong>Recommendation link:</strong> {executiveObjective.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Fechamento da etapa</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Execução governada por evidências</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  O plano só deve ser fechado quando a decisão estiver em ready-for-decision e sem evidências faltantes críticas.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button type="button" onClick={() => router.push('/')} className="w-full sm:w-auto">
                    Salvar plano de ação
                  </Button>
                  <Button variant="secondary" type="button" onClick={() => router.push('/new')} className="w-full sm:w-auto">
                    Nova investigação
                  </Button>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status decisório</p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-900">
                  {output?.decision.status || 'insufficient-evidence'}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{output?.decision.rationale || 'Sem racional disponível.'}</p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Evidência faltante</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {missingEvidence.slice(0, 5).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                  {missingEvidence.length === 0 ? <li>Nenhuma lacuna crítica aberta.</li> : null}
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm leading-7 text-rose-800">
                <p className="text-xs uppercase tracking-[0.24em] text-rose-700">Contradições ativas</p>
                <p className="mt-2">{contradictingEvidence.length} evidências contraditórias com penalização de confiança aplicada pelo CEF.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
