'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';

const investigationBlocks = [
  {
    step: 'Contexto',
    label: 'ATLAZ',
    intro:
      'Entendi o contexto. Antes de analisar possíveis causas, preciso compreender melhor o cenário.',
    question: 'Qual processo ou área apresentou o maior impacto?',
    placeholder: 'Descreva o processo, área ou área de negócio mais afetada...',
  },
  {
    step: 'Hipóteses',
    label: 'ATLAZ',
    intro:
      'Agora vamos mapear possíveis hipóteses com base no que já sabemos e definir onde concentrar a investigação.',
    question: 'Quais hipóteses você está considerando?',
    placeholder: 'Liste as explicações mais prováveis para o problema...',
  },
  {
    step: 'Evidências',
    label: 'ATLAZ',
    intro:
      'A seguir, precisamos identificar os fatos e dados que confirmam ou descartam cada hipótese.',
    question: 'Quais evidências já foram coletadas até agora?',
    placeholder: 'Liste relatórios, dados, observações e sinais relevantes...',
  },
  {
    step: 'Causas',
    label: 'ATLAZ',
    intro:
      'Com hipóteses e evidências, podemos começar a isolar as causas mais prováveis do problema.',
    question: 'Quais sinais apontam para a origem do problema?',
    placeholder: 'Descreva quais fatores ou eventos parecem ter desencadeado a situação...',
  },
  {
    step: 'Plano de ação',
    label: 'ATLAZ',
    intro:
      'Para fechar a investigação, defina a primeira ação concreta que deve ser tomada.',
    question: 'Qual deve ser o primeiro passo para resolver isso?',
    placeholder: 'Defina a ação imediata, responsável e prazo esperados...',
  },
];

export default function WorkspacePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    () => investigationBlocks.map(() => '')
  );

  const activeBlock = investigationBlocks[currentStep];
  const currentAnswer = answers[currentStep];
  const isLastStep = currentStep === investigationBlocks.length - 1;

  const summaryItems = useMemo(() => {
    const items = ['Problema identificado', 'Objetivo definido', 'Contexto registrado'];
    if (currentStep >= 1) {
      items.push('Hipóteses mapeadas');
    }
    if (currentStep >= 2) {
      items.push('Evidências em análise');
    }
    if (currentStep >= 3) {
      items.push('Causas isoladas');
    }
    if (currentStep >= 4) {
      items.push('Plano de ação definido');
    }
    return items;
  }, [currentStep]);

  const updatedProgress = useMemo(
    () =>
      investigationBlocks.map((block, index) => {
        if (index < currentStep) return { label: block.step, status: 'complete' };
        if (index === currentStep) return { label: block.step, status: 'active' };
        return { label: block.step, status: 'future' };
      }),
    [currentStep]
  );

  const handleAnswerChange = (value: string) => {
    const next = [...answers];
    next[currentStep] = value;
    setAnswers(next);
  };

  const handleContinue = () => {
    if (!currentAnswer.trim()) return;
    if (isLastStep) {
      router.push('/compreender');
      return;
    }
    setCurrentStep((value) => value + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((value) => value - 1);
    }
  };

  return (
    <main className="bg-white text-slate-950">
      <section className="mx-auto min-h-screen max-w-[1280px] px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[68%_32%]">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-sm shadow-slate-950/5">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">INVESTIGAÇÃO</p>
                <h1 className="max-w-[780px] text-[3rem] leading-[0.96] tracking-tight text-slate-950 sm:text-[3.75rem]">
                  Vamos compreender o problema.
                </h1>
                <p className="max-w-[680px] text-[18px] leading-8 text-slate-600">
                  A ATLAZ fará perguntas estratégicas para eliminar hipóteses, separar fatos de opiniões e construir uma investigação baseada em evidências.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-sm shadow-slate-950/5">
              <div className="space-y-8">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm shadow-slate-950/5">
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white">
                        Etapa {currentStep + 1} de {investigationBlocks.length}
                      </span>
                      <p className="text-xs uppercase tracking-[0.32em] text-slate-500">{activeBlock.step}</p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg leading-8 text-slate-700">{activeBlock.intro}</p>
                      <div className="rounded-3xl bg-slate-50 p-5 text-slate-900">
                        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{activeBlock.step}</p>
                        <p className="mt-3 text-xl font-semibold leading-8 text-slate-950">{activeBlock.question}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <textarea
                        value={currentAnswer}
                        onChange={(event) => handleAnswerChange(event.target.value)}
                        placeholder={activeBlock.placeholder}
                        className="min-h-[260px] w-full resize-none rounded-[1.75rem] border border-slate-200 bg-slate-50 px-6 py-6 text-lg leading-7 text-slate-950 outline-none transition duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                          {currentAnswer.length} caracteres
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          {currentStep > 0 ? (
                            <Button variant="secondary" type="button" onClick={handleBack} className="w-full sm:w-auto">
                              Rever
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            onClick={handleContinue}
                            disabled={!currentAnswer.trim()}
                            className="w-full sm:w-auto"
                          >
                            {isLastStep ? 'Consolidar compreensão' : 'Descobrir próximo insight'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="lg:sticky lg:top-6">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold text-slate-950">Mapa da investigação</h2>
                  <nav aria-label="Mapa da investigação">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {updatedProgress.map((step) => {
                        const isActive = step.status === 'active';
                        const isComplete = step.status === 'complete';
                        return (
                          <div
                            key={step.label}
                            className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            aria-current={isActive ? 'true' : undefined}
                          >
                            <span
                              className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                                isActive
                                  ? 'bg-[#5B5CEB] text-white'
                                  : isComplete
                                  ? 'bg-slate-950 text-white'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {isComplete ? '✓' : isActive ? '●' : '○'}
                            </span>
                            <span className={`text-sm ${isActive ? 'text-slate-950' : isComplete ? 'text-slate-900' : 'text-slate-500'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </nav>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
                <h3 className="text-lg font-semibold text-slate-950">Resumo até agora</h3>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                  {summaryItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-xs text-white">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
