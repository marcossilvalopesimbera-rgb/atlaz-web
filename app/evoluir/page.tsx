'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { InvestigationPageFrame } from '@components/ui/cognitive/InvestigationPageFrame';
import { readInvestigationState } from '@/lib/investigationStateStorage';
import type { AdaptiveInvestigationState, EvidenceItem } from '@/runtime/artifacts/AdaptiveInvestigationState';

type ActionItem = {
  title: string;
  objective: string;
  impact: string;
  justification: string;
};

const toPercent = (value: number): string => `${Math.round(value * 100)}%`;

const buildActionItem = (evidence: EvidenceItem, index: number): ActionItem => {
  return {
    title: `Ação ${index + 1}: ${evidence.investigationStep}`,
    objective: `Validar ${evidence.question}`,
    impact: `Reduzir incerteza sobre ${evidence.relatedHypothesisId}`,
    justification: `Esta validação tem prioridade porque a evidência foi classificada como ${evidence.evidenceType} e orienta diretamente a próxima decisão.`,
  };
};

function ActionSection({ title, purpose, actions }: { title: string; purpose: string; actions: ActionItem[] }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{purpose}</p>
          </div>
        </div>

        <div className="space-y-3">
          {actions.map((action) => (
            <details key={action.title} className="group rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 transition duration-200 open:bg-white">
              <summary className="cursor-pointer list-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{action.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{action.objective}</p>
                  </div>
                </div>
              </summary>
              <div className="mt-4 grid gap-3 text-sm transition-all duration-300 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Impacto esperado</p>
                  <p className="mt-2 font-semibold text-slate-900">{action.impact}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Justificativa</p>
                  <p className="mt-2 font-semibold leading-6 text-slate-900">{action.justification}</p>
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

  return (
    <InvestigationPageFrame
      stageLabel="Evoluir"
      title="Agora o foco é transformar a leitura em ação coordenada."
      subtitle="O plano de evolução prioriza poucas ações, com impacto claro e sem despejar a estrutura técnica na tela principal."
      state={stateSnapshot}
    >
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Objetivo executivo</p>
        <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950">{executiveObjective.title}</h2>
        <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Recomendação central</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{executiveObjective.recommendation}</p>
        </div>
      </div>

      <ActionSection
        title="Plano de validação prioritário"
        purpose="Comece pelas validações que mais reduzem a incerteza e protegem a decisão."
        actions={phaseOneActions}
      />

      {phaseTwoActions.length ? (
        <details className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">Ver próximas validações</summary>
          <div className="mt-5">
            <ActionSection title="Validações complementares" purpose="Ações posteriores, disponíveis quando a prioridade inicial estiver concluída." actions={phaseTwoActions} />
          </div>
        </details>
      ) : null}

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Fechamento</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          O plano permanece governado por evidências. Se a base atual não for suficiente, a ATLAZ volta a investigar sem interromper o raciocínio.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => router.push('/')} className="w-full sm:w-auto">
            Salvar plano de ação
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.push('/new')} className="w-full sm:w-auto">
            Nova investigação
          </Button>
        </div>
      </div>
    </InvestigationPageFrame>
  );
}
