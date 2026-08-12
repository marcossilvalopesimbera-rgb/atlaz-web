'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { InvestigationPageFrame } from '@components/ui/cognitive/InvestigationPageFrame';
import type { InvestigationQuestion } from '@/runtime/artifacts/AdaptiveInvestigationState';
import AdaptiveInvestigationEngine from '@/runtime/engines/AdaptiveInvestigationEngine';
import {
  createRuntimeRequestId,
  readInvestigationState,
  readOrCreateRuntimeSessionId,
  writeInvestigationState,
} from '@/lib/investigationStateStorage';

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
  const isLastStep = !stateSnapshot?.currentQuestion;

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

    const updatedState = adaptiveInvestigationEngine.registerAnswer(stateSnapshot, currentAnswer, {
      sessionId: readOrCreateRuntimeSessionId(),
      requestId: createRuntimeRequestId(),
      retryCount: 0,
    });
    writeInvestigationState(updatedState);
    setStateSnapshot(updatedState);
    setCurrentAnswer('');

    if (!updatedState.currentQuestion) {
      router.push('/compreender');
    }
  };

  return (
    <InvestigationPageFrame
      stageLabel="Investigar"
      title="Cada resposta precisa mover a investigação para frente."
      subtitle="A conversa agora funciona como condução especialista: primeiro contexto, depois interpretação, em seguida atualização e, só então, a próxima pergunta."
      state={stateSnapshot}
    >
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            {activeBlock.step}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {activeBlock.objective}
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-semibold leading-tight text-slate-950">{activeBlock.question}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{activeBlock.intro}</p>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Registrar resposta</p>
        <textarea
          value={currentAnswer}
          onChange={(event) => handleAnswerChange(event.target.value)}
          placeholder={activeBlock.placeholder}
          disabled={isLastStep || !isLoaded || Boolean(errorMessage)}
          className="mt-3 min-h-[220px] w-full resize-none rounded-[1.25rem] border border-slate-200 bg-slate-50 px-5 py-5 text-base leading-7 text-slate-950 outline-none transition duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />

        {errorMessage ? (
          <p className="mt-4 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{currentAnswer.length} caracteres registrados</p>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={(!currentAnswer.trim() && !isLastStep) || Boolean(errorMessage)}
            className="w-full sm:w-auto"
          >
            {isLastStep ? 'Consolidar compreensão' : 'Avançar investigação'}
          </Button>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Estado da condução</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {stateSnapshot?.investigationOutput.decision.rationale || 'A ATLAZ está usando as respostas para reduzir incerteza e fechar lacunas relevantes.'}
        </p>
      </div>
    </InvestigationPageFrame>
  );
}
