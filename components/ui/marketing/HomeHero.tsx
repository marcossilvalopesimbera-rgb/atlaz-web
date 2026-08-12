'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AbstractGraphic } from '@components/ui/AbstractGraphic';
import { Button } from '@components/ui/Button';

const principles = [
  'Toda investigação começa entendendo o contexto.',
  'A clareza vem antes da decisão.',
  'Hipóteses fortes nascem de evidências reais.',
  'Método estruturado reduz incerteza.',
];

export function HomeHero() {
  const router = useRouter();
  const principle = useMemo(
    () => principles[Math.floor(Math.random() * principles.length)],
    []
  );

  return (
    <section className="bg-[radial-gradient(circle_at_top_left,_rgba(91,92,235,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.08),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_45%,_#f8fafc_100%)] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1360px] gap-16 px-6 py-12 lg:grid-cols-[58%_42%] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center gap-14">
          <div className="space-y-8">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">ATLAZ · Cognitive Investigation Experience</p>

            <div className="max-w-[640px] space-y-4 text-[3.7rem] font-semibold leading-[0.96] tracking-tight text-slate-950 sm:text-[4.8rem]">
              <h1 className="animate-fade-in" style={{ animationDelay: '0s' }}>Conduza a investigação</h1>
              <h1 className="animate-fade-in" style={{ animationDelay: '0.08s' }}>como um especialista.</h1>
            </div>

            <p className="max-w-[600px] text-[18px] leading-8 text-slate-600">
              A ATLAZ transforma problemas complexos em investigações conduzidas com linguagem, profundidade e ritmo do domínio identificado.
            </p>

            <p className="max-w-[560px] text-sm italic leading-7 text-slate-500">{principle}</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => router.push('/new')}
            >
              Iniciar investigação
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => router.push('/new')}
            >
              Descobrir o método
            </Button>
          </div>

          <div id="product" className="grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.22)]">
              <p className="text-sm font-semibold text-slate-950">Persona de domínio</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Cada investigação fala como um especialista do contexto identificado.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.22)]">
              <p className="text-sm font-semibold text-slate-950">Resumo executivo</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">A situação fica clara em segundos com menos ruído e mais direção.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.22)]">
              <p className="text-sm font-semibold text-slate-950">Explainability em camadas</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">O detalhe técnico existe, mas aparece apenas quando solicitado.</p>
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
