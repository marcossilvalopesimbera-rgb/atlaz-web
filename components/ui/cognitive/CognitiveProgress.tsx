'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  COGNITIVE_ENGINE_CONFIG,
  COGNITIVE_TIMELINE,
  type CognitiveEngineKey,
} from './cognitiveProgressConfig';

type CognitiveProgressProps = {
  engineKey: CognitiveEngineKey;
  activeMessageIndex: number;
};

export function CognitiveProgress({ engineKey, activeMessageIndex }: CognitiveProgressProps) {
  const [elapsedLoadingMs, setElapsedLoadingMs] = useState(0);
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);

  const config = COGNITIVE_ENGINE_CONFIG[engineKey];
  const activeMessage = config.progressMessages[activeMessageIndex] ?? config.progressMessages[0];

  const activeTimelineIndex = useMemo(
    () => COGNITIVE_TIMELINE.findIndex((item) => item.engineKey === engineKey),
    [engineKey]
  );

  useEffect(() => {
    const startedAt = Date.now();

    const interval = window.setInterval(() => {
      setElapsedLoadingMs(Date.now() - startedAt);
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [engineKey]);

  useEffect(() => {
    if (elapsedLoadingMs < 5000 || config.educationalInsights.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveInsightIndex((current) => (current + 1) % config.educationalInsights.length);
    }, 2600);

    return () => {
      window.clearInterval(interval);
    };
  }, [elapsedLoadingMs, config.educationalInsights]);

  return (
    <div
      className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-base font-semibold text-slate-900">ATLAZ está estruturando sua investigação.</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        Cada etapa aplica um modelo cognitivo específico para reduzir incerteza antes da decisão.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[58%_42%]">
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Linha cognitiva</p>
          <ol className="mt-3 space-y-3">
            {COGNITIVE_TIMELINE.map((item, index) => {
              const isCompleted = index < activeTimelineIndex;
              const isCurrent = index === activeTimelineIndex;

              return (
                <li key={item.id} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                      isCurrent
                        ? 'bg-[#5B5CEB] text-white'
                        : isCompleted
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent ? 'text-slate-950' : isCompleted ? 'text-slate-700' : 'text-slate-500'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.engineLabel}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">O que a ATLAZ está fazendo agora</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{activeMessage.label}</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{activeMessage.purpose}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">{config.engineName}</p>

          <div className="mt-3 flex items-center gap-2" aria-hidden="true">
            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">{activeMessage.label}</p>

      {elapsedLoadingMs >= 5000 ? (
        <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Insight da investigação</p>
          <p className="mt-2 text-sm leading-7 text-slate-600 transition-opacity duration-300">
            {config.educationalInsights[activeInsightIndex]}
          </p>
        </div>
      ) : null}
    </div>
  );
}
