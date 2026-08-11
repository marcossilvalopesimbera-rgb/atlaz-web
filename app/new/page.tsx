'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { CognitiveProgress, COGNITIVE_ENGINE_CONFIG } from '@components/ui/cognitive';
import AdaptiveInvestigationEngine from '@/runtime/engines/AdaptiveInvestigationEngine';
import { tryParseOperationalObject } from '@/runtime/schemas/OperationalObjectRecovery';
import { createRuntimeRequestId, readOrCreateRuntimeSessionId, writeInvestigationState } from '@/lib/investigationStateStorage';

const OPERATIONAL_OBJECT_STORAGE_KEY = 'atlaz.runtime.operationalObject';
const MAX_TEXTAREA_HEIGHT = 420;
const GENERIC_EXECUTION_ERROR = 'Não foi possível concluir a interpretação inicial no momento.';
const adaptiveInvestigationEngine = new AdaptiveInvestigationEngine();

export default function NewInvestigationPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [problem, setProblem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hasVerticalOverflow, setHasVerticalOverflow] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const autoResizeTextarea = useCallback(() => {
    const element = textareaRef.current;
    if (!element) {
      return;
    }

    element.style.height = 'auto';
    const nextHeight = Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT);
    element.style.height = `${nextHeight}px`;
    setHasVerticalOverflow(element.scrollHeight > MAX_TEXTAREA_HEIGHT);
  }, []);

  useEffect(() => {
    autoResizeTextarea();
  }, [problem, autoResizeTextarea]);

  const handleStartInvestigation = async (): Promise<void> => {
    setShowFallback(false);
    setIsComplete(false);
    setActiveStep(0);
    setIsLoading(true);

    const sessionId = readOrCreateRuntimeSessionId();
    const requestId = createRuntimeRequestId();

    try {
      const response = await fetch('/api/runtime/problem-interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
          'X-Request-ID': requestId,
        },
        body: JSON.stringify({ problem }),
      });

      setActiveStep(1);
      const data = (await response.json()) as unknown;

      if (!response.ok) {
        setShowFallback(true);
        setActiveStep(null);
        return;
      }

      setActiveStep(2);
      const parsedResult = tryParseOperationalObject(data);

      if (!parsedResult.success) {
        setShowFallback(true);
        setActiveStep(null);
        return;
      }

      sessionStorage.setItem(OPERATIONAL_OBJECT_STORAGE_KEY, JSON.stringify(parsedResult.data));
      const initialState = adaptiveInvestigationEngine.initialize(parsedResult.data, {
        sessionId,
        requestId,
        retryCount: 0,
      });
      writeInvestigationState(initialState);
      setActiveStep(3);
      setIsComplete(true);

      window.setTimeout(() => {
        router.push('/context');
      }, 1000);
    } catch {
      setShowFallback(true);
      setActiveStep(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = (): void => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/');
  };

  return (
    <main className="bg-white text-slate-950">
      <section className="mx-auto min-h-screen max-w-[920px] px-6 py-16 lg:px-8">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Descreva o problema. Nós conduziremos a investigação.
            </h1>
            <p className="max-w-[760px] text-lg leading-8 text-slate-600">
              Escreva o problema exatamente como ele aconteceu.
              <br />
              Não se preocupe com organização, metodologia ou terminologia.
              <br />
              A ATLAZ fará a interpretação inicial e conduzirá a investigação passo a passo.
            </p>
          </div>

          <textarea
            ref={textareaRef}
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            rows={6}
            placeholder={
              'Exemplos:\n\n• O scrap aumentou após a troca do fornecedor.\n\n• O cliente começou a reclamar de vazamentos.\n\n• A máquina apresentou cinco paradas hoje.\n\n• O plano de produção não foi atingido.\n\n• O consumo de energia aumentou nas últimas semanas.'
            }
            className={`w-full resize-none rounded-[1.5rem] border border-slate-200 bg-white px-6 py-5 text-base leading-7 text-slate-950 outline-none transition duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 ${
              hasVerticalOverflow ? 'overflow-y-auto' : 'overflow-y-hidden'
            }`}
          />

          <div className="space-y-4">
            <Button
              type="button"
              onClick={handleStartInvestigation}
              disabled={isLoading || problem.trim().length === 0}
              className={`w-full sm:w-auto ${isLoading || problem.trim().length === 0 ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              Iniciar investigação
            </Button>

            {isLoading && activeStep !== null ? (
              <CognitiveProgress
                engineKey="problemInterpreter"
                activeMessageIndex={activeStep}
              />
            ) : null}

            {isComplete ? (
              <div className="space-y-1 text-sm text-slate-700" aria-live="polite">
                <p className="font-medium text-slate-900">
                  {COGNITIVE_ENGINE_CONFIG.problemInterpreter.completionMessage}.
                </p>
                <p>Iniciando investigação...</p>
              </div>
            ) : null}

            {showFallback ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-slate-950">Não foi possível concluir a interpretação inicial.</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Encontramos uma instabilidade temporária ao organizar sua investigação.
                  <br />
                  Suas informações estão seguras.
                  <br />
                  Tente novamente em instantes.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button type="button" onClick={handleStartInvestigation} className="w-full sm:w-auto">
                    Tentar novamente
                  </Button>
                  <Button variant="secondary" type="button" onClick={handleBack} className="w-full sm:w-auto">
                    Voltar
                  </Button>
                </div>
              </div>
            ) : null}

            <p className="pt-1 text-xs leading-6 text-slate-500">
              {showFallback ? GENERIC_EXECUTION_ERROR : 'Toda conclusão será construída a partir de evidências.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
