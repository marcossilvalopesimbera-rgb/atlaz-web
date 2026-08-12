'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { InvestigationPageFrame } from '@components/ui/cognitive/InvestigationPageFrame';
import AdaptiveInvestigationEngine from '@/runtime/engines/AdaptiveInvestigationEngine';
import {
  createRuntimeRequestId,
  readInvestigationState,
  readOrCreateRuntimeSessionId,
  writeInvestigationState,
} from '@/lib/investigationStateStorage';
import type { AdaptiveInvestigationState } from '@/runtime/artifacts/AdaptiveInvestigationState';
import {
  reconstructOperationalObjectFromText,
  tryParseOperationalObject,
} from '@/runtime/schemas/OperationalObjectRecovery';
import { buildConversationLayer, detectPersona } from '@/lib/cixExperience';

const OPERATIONAL_OBJECT_STORAGE_KEY = 'atlaz.runtime.operationalObject';
const adaptiveInvestigationEngine = new AdaptiveInvestigationEngine();

type OperationalObjectLike = {
  requiredInformation?: string[];
  problemStatement?: string;
};

export default function ContextBuildingPage() {
  const router = useRouter();
  const [firstQuestion, setFirstQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stateSnapshot, setStateSnapshot] = useState<AdaptiveInvestigationState | null>(null);

  useEffect(() => {
    const sessionId = readOrCreateRuntimeSessionId();
    const requestId = createRuntimeRequestId();
    const existingState = readInvestigationState();

    if (existingState?.currentQuestion?.question) {
      setFirstQuestion(existingState.currentQuestion.question);
      setStateSnapshot(existingState);
      return;
    }

    const raw = sessionStorage.getItem(OPERATIONAL_OBJECT_STORAGE_KEY);

    if (!raw) {
      setErrorMessage('Nenhuma interpretação foi encontrada. Inicie em "Resolver um Problema".');
      return;
    }

    try {
      const parsed = JSON.parse(raw) as OperationalObjectLike;
      const validation = tryParseOperationalObject(parsed);

      if (validation.success) {
        const initializedState = adaptiveInvestigationEngine.initialize(validation.data, {
          sessionId,
          requestId,
          retryCount: 0,
        });
        writeInvestigationState(initializedState);
        setStateSnapshot(initializedState);
        setFirstQuestion(initializedState.currentQuestion?.question ?? validation.data.requiredInformation[0]);
        return;
      }

      if (typeof parsed.problemStatement === 'string' && parsed.problemStatement.trim().length > 0) {
        const recovered = reconstructOperationalObjectFromText(raw, parsed.problemStatement);
        sessionStorage.setItem(OPERATIONAL_OBJECT_STORAGE_KEY, JSON.stringify(recovered));
        const recoveredState = adaptiveInvestigationEngine.initialize(recovered, {
          sessionId,
          requestId,
          retryCount: 1,
        });
        writeInvestigationState(recoveredState);
        setStateSnapshot(recoveredState);
        setFirstQuestion(recoveredState.currentQuestion?.question ?? recovered.requiredInformation[0]);
        return;
      }

      setErrorMessage('Não foi possível identificar a primeira pergunta contextual no resultado da interpretação.');
    } catch (error) {
      console.error(
        '[ATLAZ][Runtime][ContextBootstrapFailure]',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          sessionId,
          requestId,
          errorMessage: error instanceof Error ? error.message : 'Unknown bootstrap error',
        })
      );
      setErrorMessage('Não foi possível carregar a interpretação inicial.');
    }
  }, []);

  const handleSubmitAnswer = () => {
    if (!stateSnapshot) {
      setErrorMessage('Nenhum estado investigativo foi encontrado. Inicie em "Resolver um Problema".');
      return;
    }

    if (!answer.trim()) {
      return;
    }

    if (!stateSnapshot.currentQuestion) {
      router.push('/compreender');
      return;
    }

    const updatedState = adaptiveInvestigationEngine.registerAnswer(stateSnapshot, answer.trim(), {
      sessionId: readOrCreateRuntimeSessionId(),
      requestId: createRuntimeRequestId(),
      retryCount: 0,
    });
    writeInvestigationState(updatedState);
    setStateSnapshot(updatedState);
    setAnswer('');

    if (updatedState.currentQuestion) {
      router.push('/workspace');
      return;
    }

    router.push('/compreender');
  };

  const persona = detectPersona(stateSnapshot);
  const conversationLayer = stateSnapshot?.currentQuestion
    ? buildConversationLayer(persona, stateSnapshot.currentQuestion, stateSnapshot)
    : null;

  return (
    <InvestigationPageFrame
      stageLabel="Delimitar contexto"
      title="Agora vamos fechar o contexto com precisão."
      subtitle="Eu vou conduzir a leitura do caso, explicar o que cada resposta muda e manter o foco no que realmente reduz incerteza."
      state={stateSnapshot}
    >
      {errorMessage ? (
        <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-sm leading-7 text-rose-700">
          {errorMessage}
        </div>
      ) : (
        <>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pergunta em foco</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-950">
              {firstQuestion || 'A primeira pergunta contextual ainda está sendo preparada.'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{stateSnapshot?.currentQuestion?.whyAsked}</p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Conversa guiada</p>
            <div className="mt-4 space-y-3">
              <p className="text-base font-semibold text-slate-950">{conversationLayer?.recognition ?? 'Entendi.'}</p>
              <p className="text-sm leading-7 text-slate-600">
                {conversationLayer?.interpretation ?? 'Sua resposta ajuda a reduzir incerteza antes de avançarmos.'}
              </p>
              <p className="text-sm leading-7 text-slate-600">
                {conversationLayer?.update ?? 'A investigação está sendo atualizada em tempo real com cada resposta.'}
              </p>
              <p className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900">
                {conversationLayer?.conduction ?? `Vamos avançar com precisão: ${firstQuestion}`}
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Sua resposta</p>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={stateSnapshot?.currentQuestion?.placeholder ?? 'Descreva o contexto com detalhes objetivos.'}
              className="mt-3 min-h-[180px] w-full resize-none rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-base leading-7 text-slate-900 outline-none transition duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{answer.length} caracteres registrados</p>
              <Button type="button" onClick={handleSubmitAnswer} disabled={!answer.trim()}>
                Continuar investigação
              </Button>
            </div>
          </div>
        </>
      )}
    </InvestigationPageFrame>
  );
}
