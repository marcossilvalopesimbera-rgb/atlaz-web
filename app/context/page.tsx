import { SectionShell } from '@components/ui/SectionShell';

export default function ContextBuildingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <SectionShell>
        <h1 className="text-3xl font-semibold">Context Building</h1>
        <p className="mt-3 text-slate-300">
          A workspace for aggregating context, references, and domain insights.
        </p>
      </SectionShell>
    </main>
  );
}
