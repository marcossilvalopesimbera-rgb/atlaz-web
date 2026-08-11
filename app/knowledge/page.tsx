import { buildPageMetadata } from '@/lib/seo';
import { knowledgeCenterCategories, knowledgeGraph, glossaryTerms } from '@/lib/knowledge/knowledgeGraph';

export const metadata = buildPageMetadata({
  title: 'Knowledge Center',
  description: 'Centro de conhecimento da ATLAZ com glossário, estruturas semânticas e categorias de conteúdo.',
  path: '/knowledge',
});

export default function KnowledgeCenterPage() {
  return (
    <main className="bg-white text-slate-950">
      <section className="mx-auto max-w-[1280px] px-6 py-16 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">KNOWLEDGE CENTER</p>
            <h1 className="text-4xl font-semibold tracking-tight">Knowledge Center da ATLAZ</h1>
            <p className="max-w-[760px] text-lg leading-8 text-slate-600">
              Estrutura inicial para organizar conceitos, frameworks, domínios e glossário oficial com base semântica.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-2xl font-semibold">Categorias</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {knowledgeCenterCategories.map((category) => (
                <div key={category.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-semibold">{category.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{category.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-semibold">Glossário oficial</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {glossaryTerms.slice(0, 10).map((term) => (
                <div key={term.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">{term.term}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{term.shortDescription}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-semibold">Knowledge Graph</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {knowledgeGraph.slice(0, 8).map((concept) => (
                <div key={concept.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">{concept.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{concept.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
