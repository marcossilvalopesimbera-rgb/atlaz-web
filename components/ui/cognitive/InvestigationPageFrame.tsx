'use client';

import type { ReactNode } from 'react';
import type { AdaptiveInvestigationState } from '@/runtime/artifacts/AdaptiveInvestigationState';
import {
  buildExecutiveSummary,
  buildInvestigationNarrative,
  buildInvestigationTimeline,
  detectPersona,
  toneClassByKanban,
} from '@/lib/cixExperience';
import { TechnicalAnalysisPanel } from './TechnicalAnalysisPanel';
import { EvidenceIntakeControl } from './EvidenceIntakeControl';

type InvestigationPageFrameProps = {
  stageLabel: string;
  title: string;
  subtitle: string;
  state: AdaptiveInvestigationState | null;
  onStateUpdated?: (state: AdaptiveInvestigationState) => void;
  children: ReactNode;
};

const cardClassName = 'rounded-[1.75rem] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)] backdrop-blur';

export function InvestigationPageFrame({ stageLabel, title, subtitle, state, onStateUpdated, children }: InvestigationPageFrameProps) {
  const persona = detectPersona(state);
  const summary = state ? buildExecutiveSummary(state) : null;
  const narrative = state ? buildInvestigationNarrative(state, persona) : 'Ainda estamos coletando contexto para estruturar a investigação.';
  const timeline = state ? buildInvestigationTimeline(state) : [];

  return (
    <main className="bg-[radial-gradient(circle_at_top_left,_rgba(91,92,235,0.08),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.08),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_40%,_#f8fafc_100%)] text-slate-950">
      <section className="mx-auto min-h-screen max-w-[1360px] px-6 py-10 lg:px-8 lg:py-12">
        <div className="space-y-8">
          <div className={`${cardClassName} overflow-hidden border-slate-200/80 bg-white`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-600">
                {stageLabel}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {persona.title}
              </span>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
              <div>
                <h1 className="max-w-[820px] text-[2.4rem] font-semibold leading-[0.95] tracking-tight text-slate-950 sm:text-[3.2rem]">
                  {title}
                </h1>
                <p className="mt-4 max-w-[760px] text-[17px] leading-8 text-slate-600">{subtitle}</p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Condução especialista</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{persona.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{persona.shortIntro}</p>
              </div>
            </div>
          </div>

          <EvidenceIntakeControl state={state} onStateUpdated={onStateUpdated} />

          {summary ? (
            <section className={cardClassName} aria-label="Resumo executivo da investigação">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Situação atual</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{summary.currentStatus}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">O que já descobrimos</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {summary.discoveries.slice(0, 2).join(' · ') || 'Estamos reunindo o contexto essencial para orientar a investigação.'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Principal linha de investigação</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{summary.leadHypothesis.description}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{summary.leadHypothesis.rationale}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Próxima ação recomendada</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{summary.nextAction}</p>
                </div>
              </div>
            </section>
          ) : null}

          <div className="space-y-6">{children}</div>

          <details className={`${cardClassName} group`}>
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">Mais detalhes</summary>
            <div className="mt-5 grid gap-6 xl:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Narrativa da investigação</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{narrative}</p>
              </div>
              {summary?.alternatives.length || summary?.topEvidence.length ? (
                <div className="space-y-4">
                  {summary?.alternatives.length ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Linhas em observação</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {summary.alternatives.slice(0, 2).map((item) => (
                          <span key={item.description} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium ${toneClassByKanban[item.kanban.tone]}`}>
                            <span>{item.kanban.label}</span>
                            <span>{item.description}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {summary?.topEvidence.length ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Evidências relevantes</p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">{summary.topEvidence.slice(0, 3).join(' · ')}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {timeline.length ? (
                <div className="xl:col-span-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Etapas da investigação</p>
                  <ol className="mt-3 flex flex-wrap gap-2">
                    {timeline.map((item) => (
                      <li key={item.id} className={`rounded-full border px-3 py-2 text-sm ${item.status === 'current' ? 'border-[#5B5CEB] bg-[#5B5CEB] text-white' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                        {item.label}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
              {state ? <TechnicalAnalysisPanel state={state} /> : null}
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}