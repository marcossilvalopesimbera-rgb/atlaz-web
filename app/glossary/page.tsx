import { buildPageMetadata } from '@/lib/seo';
import { glossaryTerms } from '@/lib/knowledge/knowledgeGraph';

export const metadata = buildPageMetadata({
  title: 'Glossário Oficial',
  description: 'Glossário oficial da ATLAZ com definições, sinônimos e contexto de uso.',
  path: '/glossary',
});

export default function GlossaryPage() {
  return (
    <main className="bg-white text-slate-950">
      <section className="mx-auto max-w-[1280px] px-6 py-16 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">GLOSSÁRIO</p>
            <h1 className="text-4xl font-semibold tracking-tight">Glossário Oficial da ATLAZ</h1>
            <p className="max-w-[760px] text-lg leading-8 text-slate-600">
              Base reutilizável para documentação, UI, runtime e futuros conteúdos semânticos.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {glossaryTerms.map((term) => (
              <article key={term.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-semibold">{term.term}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{term.definition}</p>
                <p className="mt-3 text-sm leading-7 text-slate-500">{term.shortDescription}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
