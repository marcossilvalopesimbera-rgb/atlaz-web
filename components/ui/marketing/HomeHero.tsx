'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AbstractGraphic } from '@components/ui/AbstractGraphic';
import { Button } from '@components/ui/Button';

const principles = [
  'Toda investigação começa entendendo o contexto.',
  'Boas decisões nascem de boas perguntas.',
  'Cada problema merece um método.',
  'A clareza vem antes da solução.',
];

export function HomeHero() {
  const router = useRouter();
  const principle = useMemo(
    () => principles[Math.floor(Math.random() * principles.length)],
    []
  );

  return (
    <section className="bg-white text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1280px] gap-28 px-6 py-16 lg:grid-cols-[55%_45%] lg:px-8">
        <div className="flex flex-col justify-center gap-14">
          <div className="space-y-8">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">ATLAZ</p>

            <div className="space-y-3 max-w-[560px] text-[4.5rem] font-semibold leading-[0.92] tracking-tight text-slate-950 sm:text-[5.25rem]">
              <h1 className="animate-fade-in" style={{ animationDelay: '0s' }}>Resolva.</h1>
              <h1 className="animate-fade-in" style={{ animationDelay: '0.08s' }}>Aprenda.</h1>
              <h1 className="animate-fade-in" style={{ animationDelay: '0.16s' }}>Evolua.</h1>
            </div>

            <p className="max-w-[560px] text-[18px] leading-8 text-slate-600">
              Transforme problemas complexos em decisões estruturadas e confiáveis através de uma investigação guiada por IA.
            </p>

            <p className="max-w-[560px] text-sm italic leading-7 text-slate-500">{principle}</p>
          </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => router.push('/new')}
            >
              Explorar um problema
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => router.push('/new')}
            >
              Descobrir o método
            </Button>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-semibold text-slate-950">+40%</span>
              <span>Decisões mais rápidas</span>
            </div>
            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-4">
              <span className="text-3xl font-semibold text-slate-950">100%</span>
              <span>Rastreabilidade</span>
            </div>
            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-4">
              <span className="text-3xl font-semibold text-slate-950">24/7</span>
              <span>IA Especialista</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="animate-fade-in-slow w-full max-w-[520px]" style={{ animationDelay: '0.2s' }}>
            <AbstractGraphic />
          </div>
        </div>
      </div>
    </section>
  );
}
