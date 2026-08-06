'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import type { InvestigationQuestion } from '@/runtime/artifacts/AdaptiveInvestigationState';
import AdaptiveInvestigationEngine from '@/runtime/engines/AdaptiveInvestigationEngine';
import { readInvestigationState, writeInvestigationState } from '@/lib/investigationStateStorage';

const stages = ['Definir', 'Investigar', 'Compreender', 'Decidir', 'Evoluir'];

const adaptiveInvestigationEngine = new AdaptiveInvestigationEngine();

const synthesisBlock: InvestigationQuestion = {
  id: 'q-sintese-final',
  step: 'Síntese investigativa',
  intro: 'A investigação reuniu evidências suficientes para consolidar hipóteses e avançar para compreensão.',
  question: 'A etapa investigativa foi concluída. Deseja consolidar a compreensão agora?',
  placeholder: 'Opcional: registre observações finais antes da consolidação.',
  whyAsked: 'Fechamento do ciclo investigativo com base no estado acumulado.',
  uncertaintyTarget: 'Consolidar conclusão investigativa',
  objective: 'Aumentar confiança',
};

export default function WorkspacePage() {
  const router = useRouter();
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [stateSnapshot, setStateSnapshot] = useState(readInvestigationState());

  useEffect(() => {
    const loadedState = readInvestigationState();

    if (!loadedState) {
      setErrorMessage('Nenhum estado investigativo foi encontrado. Inicie uma nova investigação para continuar.');
      setIsLoaded(true);
      return;
    }

    setStateSnapshot(loadedState);
    setIsLoaded(true);
  }, []);

  const activeBlock = stateSnapshot?.currentQuestion ?? synthesisBlock;
  const totalSteps = Math.max(5, stateSnapshot ? stateSnapshot.history.length + (stateSnapshot.currentQuestion ? 1 : 0) : 5);
  const currentStep = Math.min(stateSnapshot?.history.length ?? 0, totalSteps - 1);
  const isLastStep = !stateSnapshot?.currentQuestion;

  const progressItems = useMemo(
    () =>
      stages.map((stage, index) => ({
        label: stage,
        active: index === 1,
        complete: index < 1,
        number: index + 1,
      })),
    []
  );

  const summaryItems = useMemo(() => {
    const base = ['Problema identificado', 'Objetivo definido', 'Contexto registrado'];

    if (!stateSnapshot) {
      return base;
    }

    const dynamic = stateSnapshot.history.map((entry) => `${entry.objective}: ${entry.uncertaintyReduced}`);
    return [...base, ...dynamic.slice(-4)];
  }, [stateSnapshot]);

  const updatedProgress = useMemo(
    () => {
      const historySteps = stateSnapshot?.history.map((entry) => entry.uncertaintyReduced) ?? [];
      const activeStepLabel = stateSnapshot?.currentQuestion?.step ?? 'Síntese investigativa';
      const labels = [...historySteps, activeStepLabel];

      return labels.map((label, index) => {
        if (index < currentStep) return { label, status: 'complete' as const };
        if (index === currentStep) return { label, status: 'active' as const };
        return { label, status: 'future' as const };
      });
    },
    [currentStep, stateSnapshot]
  );

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
  };

  const handleContinue = () => {
    if (!stateSnapshot) {
      router.push('/new');
      return;
    }

    if (isLastStep) {
      router.push('/compreender');
      return;
    }

    if (!currentAnswer.trim()) {
      return;
    }

    const updatedState = adaptiveInvestigationEngine.registerAnswer(stateSnapshot, currentAnswer);
    writeInvestigationState(updatedState);
    setStateSnapshot(updatedState);
    setCurrentAnswer('');

    if (!updatedState.currentQuestion) {
      router.push('/compreender');
    }
  };

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
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">INVESTIGAR</p>
            <h1 className="mt-4 max-w-[780px] text-[2.9rem] leading-[0.96] tracking-tight text-slate-950 sm:text-[3.5rem]">
              Investigação guiada por etapas
            </h1>
            <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-slate-600">
              A ATLAZ organizou a investigação em etapas sequenciais para transformar contexto, hipóteses e evidências em compreensão acionável sem sobrecarga.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[64%_36%]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border-2 border-slate-300 bg-white p-10 shadow-md shadow-slate-950/10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#5B5CEB] px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white">
                    Etapa {Math.min(currentStep + 1, totalSteps)} de {totalSteps}
                  </span>
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-500">{activeBlock.step}</p>
                </div>
                <p className="mt-5 text-lg leading-8 text-slate-700">{activeBlock.intro}</p>
                <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Pergunta principal</p>
                  <h2 className="mt-3 text-2xl font-semibold leading-9 text-slate-950">{activeBlock.question}</h2>
                  <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-500">
                    Objetivo cognitivo: {activeBlock.objective}
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Registre sua resposta</p>
                <textarea
                  value={currentAnswer}
                  onChange={(event) => handleAnswerChange(event.target.value)}
                  placeholder={activeBlock.placeholder}
                  disabled={isLastStep || !isLoaded || Boolean(errorMessage)}
                  className="mt-4 min-h-[240px] w-full resize-none rounded-[1.5rem] border border-slate-200 bg-slate-50 px-6 py-6 text-lg leading-7 text-slate-950 outline-none transition duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />

                {errorMessage ? (
                  <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
                ) : null}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    {currentAnswer.length} caracteres registrados
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      onClick={handleContinue}
                      disabled={(!currentAnswer.trim() && !isLastStep) || Boolean(errorMessage)}
                      className="w-full sm:w-auto"
                    >
                      {isLastStep ? 'Consolidar compreensão investigativa' : 'Avançar etapa'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Fechamento da etapa</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Investigação atualizada</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Cada resposta atualiza hipóteses, confiança e lacunas de informação sem reiniciar o raciocínio.
                </p>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-base font-semibold text-slate-900">Mapa da investigação</h2>
                <nav aria-label="Mapa da investigação" className="mt-4">
                  <div className="grid gap-3">
                    {updatedProgress.map((step) => {
                      const isActive = step.status === 'active';
                      const isComplete = step.status === 'complete';
                      return (
                        <div
                          key={step.label}
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                          aria-current={isActive ? 'true' : undefined}
                        >
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                              isActive
                                ? 'bg-[#5B5CEB] text-white'
                                : isComplete
                                ? 'bg-slate-950 text-white'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {isComplete ? '✓' : isActive ? '●' : '○'}
                          </span>
                          <span className={`text-sm ${isActive ? 'text-slate-950' : isComplete ? 'text-slate-700' : 'text-slate-500'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </nav>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-base font-semibold text-slate-900">Resumo até agora</h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  {summaryItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Método</p>
                <p className="mt-2">A ATLAZ conduz a investigação, conecta evidências e decide quais informações ainda faltam.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
