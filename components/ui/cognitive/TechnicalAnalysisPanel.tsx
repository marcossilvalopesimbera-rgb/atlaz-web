import type { AdaptiveInvestigationState } from '@/runtime/artifacts/AdaptiveInvestigationState';

type TechnicalAnalysisPanelProps = {
  state: AdaptiveInvestigationState;
};

const toPercent = (value: number): string => `${Math.round(value * 100)}%`;

export function TechnicalAnalysisPanel({ state }: TechnicalAnalysisPanelProps) {
  const output = state.investigationOutput;

  return (
    <details className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.32)]">
      <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
        Ver análise técnica
      </summary>

      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">Lifecycle e competition</p>
          <ul className="mt-2 space-y-1">
            {state.hypothesisRegistry.items.slice(0, 4).map((item) => (
              <li key={item.id}>
                {item.description} - {item.lifecycleStatus} - dominância {toPercent(item.competition?.dominanceScore ?? 0)}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">Confidence e evidence</p>
          <p>Confiança global: {toPercent(output.confidence.global)}</p>
          <p>Evidências suporte: {output.evidence.supporting.length}</p>
          <p>Evidências contraditórias: {output.evidence.contradicting.length}</p>
          <p>Lacunas abertas: {output.missingEvidence.length}</p>
        </div>

        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">Governance e audit trail</p>
          <p>Auditorias de promoção: {state.lifecycleAuditTrail.length}</p>
          <p>Execuções rastreadas: {state.runtimeTelemetry.length}</p>
          <p>Status decisório: {output.decision.status}</p>
        </div>
      </div>
    </details>
  );
}
