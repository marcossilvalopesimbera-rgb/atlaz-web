import { buildPageMetadata } from '@/lib/seo';
import { glossaryTerms, knowledgeGraph, knowledgeCenterCategories } from '@/lib/knowledge/knowledgeGraph';

export const metadata = buildPageMetadata({
  title: 'AI Readiness Dashboard',
  description: 'Painel interno de readiness para IA, SEO, knowledge graph e glossário.',
  path: '/ai-readiness',
  noIndex: true,
});

export default function AIReadinessPage() {
  return (
    <main className="bg-white text-slate-950">
      <section className="mx-auto max-w-[1280px] px-6 py-16 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">INTERNAL</p>
            <h1 className="text-4xl font-semibold tracking-tight">AI Readiness Dashboard</h1>
            <p className="max-w-[760px] text-lg leading-8 text-slate-600">
              Painel interno para rastrear cobertura de conhecimento, glossário, estrutura semântica e prontidão para IA.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Páginas indexáveis</p>
              <p className="mt-3 text-3xl font-semibold">10+</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Entidades documentadas</p>
              <p className="mt-3 text-3xl font-semibold">{knowledgeGraph.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Cobertura do glossário</p>
              <p className="mt-3 text-3xl font-semibold">{glossaryTerms.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Categorias de Knowledge Center</p>
              <p className="mt-3 text-3xl font-semibold">{knowledgeCenterCategories.length}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
