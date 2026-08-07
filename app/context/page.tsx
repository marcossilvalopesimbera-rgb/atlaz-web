'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import AdaptiveInvestigationEngine from '@/runtime/engines/AdaptiveInvestigationEngine';
import { readInvestigationState, writeInvestigationState } from '@/lib/investigationStateStorage';
import type { AdaptiveInvestigationState } from '@/runtime/artifacts/AdaptiveInvestigationState';
import {
  reconstructOperationalObjectFromText,
  tryParseOperationalObject,
} from '@/runtime/schemas/OperationalObjectRecovery';

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
        const initializedState = adaptiveInvestigationEngine.initialize(validation.data);
        writeInvestigationState(initializedState);
        setStateSnapshot(initializedState);
        setFirstQuestion(initializedState.currentQuestion?.question ?? validation.data.requiredInformation[0]);
        return;
      }

      if (typeof parsed.problemStatement === 'string' && parsed.problemStatement.trim().length > 0) {
        const recovered = reconstructOperationalObjectFromText(raw, parsed.problemStatement);
        sessionStorage.setItem(OPERATIONAL_OBJECT_STORAGE_KEY, JSON.stringify(recovered));
        const recoveredState = adaptiveInvestigationEngine.initialize(recovered);
        writeInvestigationState(recoveredState);
        setStateSnapshot(recoveredState);
        setFirstQuestion(recoveredState.currentQuestion?.question ?? recovered.requiredInformation[0]);
        return;
      }

      setErrorMessage('Não foi possível identificar a primeira pergunta contextual no resultado da interpretação.');
    } catch {
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

    const updatedState = adaptiveInvestigationEngine.registerAnswer(stateSnapshot, answer.trim());
    writeInvestigationState(updatedState);
    setStateSnapshot(updatedState);
    setAnswer('');

    if (updatedState.currentQuestion) {
      router.push('/workspace');
      return;
    }

    router.push('/compreender');
  };

  return (
    <main className="bg-white text-slate-950">
      <section className="mx-auto min-h-screen max-w-[920px] px-6 py-16 lg:px-8">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Contexto operacional</h1>

          <p className="max-w-[760px] text-lg leading-8 text-slate-700">
            Compreendi uma primeira visão do problema.
            <br />
            Antes de levantar hipóteses, preciso compreender melhor o contexto operacional.
          </p>

          {errorMessage ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Primeira pergunta contextual</p>
                <p className="mt-3 text-lg leading-8 text-slate-900">{firstQuestion}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sua resposta</p>
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={stateSnapshot?.currentQuestion?.placeholder ?? 'Descreva o contexto com detalhes objetivos.'}
                  className="mt-3 min-h-[180px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-base leading-7 text-slate-900 outline-none transition duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">{answer.length} caracteres registrados</p>
                  <Button type="button" onClick={handleSubmitAnswer} disabled={!answer.trim()}>
                    Continuar investigação
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
