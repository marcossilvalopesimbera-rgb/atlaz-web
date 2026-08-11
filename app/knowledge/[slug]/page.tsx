import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import { knowledgeGraph } from '@/lib/knowledge/knowledgeGraph';

export async function generateStaticParams() {
  return knowledgeGraph.map((concept) => ({ slug: concept.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const concept = knowledgeGraph.find((item) => item.slug === resolvedParams.slug);

  if (!concept) {
    return buildPageMetadata({
      title: 'Knowledge Concept',
      description: 'Página de conceito do Knowledge Center da ATLAZ.',
      path: '/knowledge',
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: concept.title,
    description: concept.summary,
    path: `/knowledge/${concept.slug}`,
    noIndex: true,
  });
}

export default async function KnowledgeConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const concept = knowledgeGraph.find((item) => item.slug === resolvedParams.slug);

  if (!concept) {
    notFound();
  }

  return (
    <main className="bg-white text-slate-950">
      <section className="mx-auto max-w-[1280px] px-6 py-16 lg:px-8">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.32em] text-slate-500">KNOWLEDGE GRAPH</p>
          <h1 className="text-4xl font-semibold tracking-tight">{concept.title}</h1>
          <p className="max-w-[760px] text-lg leading-8 text-slate-600">{concept.description}</p>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Resumo</p>
            <p className="mt-3 text-base leading-8 text-slate-700">{concept.summary}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
