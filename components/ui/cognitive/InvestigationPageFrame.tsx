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

type InvestigationPageFrameProps = {
  stageLabel: string;
  title: string;
  subtitle: string;
  state: AdaptiveInvestigationState | null;
  children: ReactNode;
};

const cardClassName = 'rounded-[1.75rem] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)] backdrop-blur';

const listClassName = 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4';

export function InvestigationPageFrame({ stageLabel, title, subtitle, state, children }: InvestigationPageFrameProps) {
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

          {summary ? (
            <div className="space-y-4">
              <div className={listClassName}>
                <div className={cardClassName}>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Situação atual</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{summary.currentStatus}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Ainda não existe base suficiente para concluir quando o estado permanece em investigação.
                  </p>
                </div>

                <div className={cardClassName}>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">O que descobrimos</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {summary.discoveries.slice(0, 3).map((item) => (
                      <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {item}
                      </span>
                    ))}
                    {summary.discoveries.length === 0 ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                        Ainda coletando contexto
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className={cardClassName}>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Hipótese principal</p>
                  <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${toneClassByKanban[summary.leadHypothesis.kanban.tone]}`}>
                    <span>{summary.leadHypothesis.kanban.icon}</span>
                    <span>{summary.leadHypothesis.kanban.label}</span>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{summary.leadHypothesis.description}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{summary.leadHypothesis.rationale}</p>
                </div>

                <div className={cardClassName}>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Próximo passo</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{summary.nextAction}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    A recomendação abaixo mantém a investigação focada no menor conjunto de sinais úteis.
                  </p>
                </div>
              </div>

              {summary.alternatives.length ? (
                <div className={`${cardClassName} flex flex-wrap items-center justify-between gap-4`}>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Hipóteses alternativas</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">Até duas alternativas permanecem em observação.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summary.alternatives.slice(0, 2).map((item) => (
                      <span key={item.description} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium ${toneClassByKanban[item.kanban.tone]}`}>
                        <span>{item.kanban.icon}</span>
                        <span>{item.description}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {summary.topEvidence.length ? (
                <div className={`${cardClassName} flex flex-wrap items-center gap-2`}>
                  <p className="mr-2 text-xs uppercase tracking-[0.24em] text-slate-500">Evidências principais</p>
                  {summary.topEvidence.slice(0, 3).map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.86fr)]">
            <div className="space-y-6">{children}</div>

            <aside className="space-y-6">
              <div className={cardClassName}>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Narrativa investigativa</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{narrative}</p>
              </div>

              {timeline.length ? (
                <div className={cardClassName}>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Linha do tempo</p>
                  <ol className="mt-4 space-y-3">
                    {timeline.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                            item.status === 'done'
                              ? 'bg-slate-950 text-white'
                              : item.status === 'current'
                              ? 'bg-[#5B5CEB] text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {item.status === 'done' ? '✓' : item.status === 'current' ? '●' : '○'}
                        </span>
                        <span className={`text-sm font-medium ${item.status === 'current' ? 'text-slate-950' : 'text-slate-600'}`}>
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {state ? <TechnicalAnalysisPanel state={state} /> : null}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}