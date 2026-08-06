import { HomeHero } from '@components/ui/marketing/HomeHero';

const workflowSteps = [
  'Você descreve o problema',
  'ATLAZ interpreta',
  'Organiza o contexto',
  'Constrói hipóteses',
  'Busca evidências',
  'Valida causas',
  'Propõe decisões',
  'Perpetua o conhecimento',
];

export default function HomePage() {
  return (
    <main className="bg-white text-slate-950">
      <HomeHero />

      <section id="method" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-[900px] space-y-6 text-center">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">MÉTODO</p>
            <h2 className="text-[2.25rem] leading-tight tracking-tight text-slate-950 sm:text-[2.75rem]">
              Como a ATLAZ pensa
            </h2>
            <p className="mx-auto max-w-[760px] text-[18px] leading-8 text-slate-600">
              Toda investigação segue um método estruturado para reduzir incertezas antes da tomada de decisão.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-[860px] rounded-[2rem] border border-slate-200 bg-slate-50 p-8 sm:p-10">
            <ol className="space-y-3 text-center text-sm font-medium text-slate-700 sm:text-base">
              {workflowSteps.map((step, index) => (
                <li key={step} className="space-y-3">
                  <p className="leading-7">{step}</p>
                  {index < workflowSteps.length - 1 ? (
                    <p aria-hidden="true" className="text-lg leading-none text-slate-400">
                      ↓
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
