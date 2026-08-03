'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';

const steps = ['Definir', 'Investigar', 'Compreender', 'Decidir', 'Evoluir'];
const principle = 'Toda investigação começa entendendo o contexto.';

export default function NewInvestigationPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 260)}px`;
  }, [description]);

  const charCount = description.length;
  const isReady = charCount > 0;

  const progressItems = useMemo(
    () =>
      steps.map((step, index) => ({
        label: step,
        active: index === 0,
        number: index + 1,
      })),
    []
  );

  return (
    <main className="bg-white text-slate-950">
      <section className="mx-auto min-h-screen max-w-[1280px] px-6 py-16 lg:px-8">
        <div className="space-y-10">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
            <div className="space-y-8 text-center">
              <div className="overflow-hidden rounded-[2rem] bg-white/0">
                  <div className="mx-auto flex max-w-[780px] flex-col gap-6 text-center">
                  <nav aria-label="Progresso da investigação">
                    <div className="flex items-center justify-center gap-3">
                      {progressItems.map((item, index) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3"
                          aria-current={item.active ? 'true' : undefined}
                        >
                          {index > 0 && <div className="h-px w-10 bg-slate-200" />}
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                                item.active
                                  ? 'border-[#5B5CEB] bg-[#5B5CEB] text-white'
                                  : 'border-slate-300 bg-white text-slate-500'
                              }`}
                            >
                              {item.number}
                            </div>
                            <span className="text-xs uppercase tracking-[0.32em] text-slate-500">
                              {item.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </nav>
                </div>
              </div>

              <div className="space-y-6">
                <h1 className="mx-auto max-w-[760px] text-[3rem] leading-[0.96] tracking-tight text-slate-950 sm:text-[3.75rem]">
                  O que você deseja resolver hoje?
                </h1>
                <div className="mx-auto max-w-[640px] space-y-4 text-[18px] leading-8 text-slate-600">
                  <p>Descreva o problema em suas palavras. Foque no impacto e nos sinais que você observou.</p>
                  <p>A ATLAZ transforma esse contexto em pistas e prioridades para investigação.</p>
                </div>
                <p className="mx-auto max-w-[640px] text-sm italic leading-7 text-slate-500">
                  {principle}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
              <div className="space-y-6">
                <textarea
                  ref={textareaRef}
                  value={description}
                  maxLength={3000}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Conte tudo o que você sabe. Mesmo informações aparentemente desconectadas podem ser importantes."
                  className="min-h-[260px] w-full resize-none rounded-[1.75rem] border border-slate-200 bg-white px-6 py-6 text-lg leading-7 text-slate-950 outline-none transition duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />

                <label className="group block rounded-[1.75rem] border border-dashed border-slate-300 bg-white/90 px-6 py-8 text-center transition duration-200 hover:border-slate-400 hover:bg-slate-50">
                  <input type="file" className="sr-only" />
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm shadow-slate-950/10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 5V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7 19H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-950">Arraste arquivos aqui ou selecione um arquivo</p>
                  <p className="mt-2 text-sm text-slate-500">Suportado: PDF, DOCX, XLSX, TXT</p>
                </label>

                <div className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">
                    {charCount}/3000 caracteres
                  </div>
                  <p className="text-sm text-slate-500">Quanto mais contexto, mais precisa será a investigação.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-950/5">
              <p className="text-sm font-semibold text-slate-950">ATLAZ ajudará você a:</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                {[
                  'Organizar informações dispersas',
                  'Identificar causas reais',
                  'Separar fatos de opiniões',
                  'Construir hipóteses',
                  'Recomendar próximos passos',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-xs text-white">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                disabled={!isReady}
                onClick={() => router.push('/workspace')}
                className={`w-full max-w-[360px] ${!isReady ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                Explorar pistas
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-slate-950">
              <p className="text-sm font-semibold">Método estruturado</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">Uma sequência clara para transformar dúvidas em decisões.</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-slate-950">
              <p className="text-sm font-semibold">Baseado em evidências</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">Conteúdo e descobertas documentados para decisões confiáveis.</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-slate-950">
              <p className="text-sm font-semibold">Aprendizado contínuo</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">Cada investigação deixa seu processo mais rápido e preciso.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
