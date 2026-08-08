'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { readInvestigationState } from '@/lib/investigationStateStorage';
import type { EvidenceItem, HypothesisState } from '@/runtime/artifacts/AdaptiveInvestigationState';

const progressSteps = ['Definir', 'Investigar', 'Compreender', 'Decidir', 'Evoluir'];

const methodsApplied = ['5G', '5 Whys', 'Ishikawa'];

type DecisionCard = {
  hypothesis: HypothesisState;
  supportingEvidence: EvidenceItem[];
  decision: string;
};

const toPercent = (value: number): string => `${Math.round(value * 100)}%`;

const deriveDecision = (description: string): string => {
  const normalized = description.toLowerCase();

  if (normalized.includes('variabilidade') || normalized.includes('processo')) {
    return 'Padronizar parâmetros críticos e reforçar checkpoints operacionais por turno.';
  }

  if (normalized.includes('controle') || normalized.includes('planejamento')) {
    return 'Reforçar governança entre planejamento e execução com critérios de aceite explícitos.';
  }

  if (normalized.includes('fornecedor') || normalized.includes('lote') || normalized.includes('material')) {
    return 'Aplicar contenção de lotes e validação reforçada antes da liberação para produção.';
  }

  return 'Executar plano de mitigação incremental com validação de evidências em cada etapa.';
};

const evidenceUploads = [
  { label: 'Adicionar nota', description: 'Registrar uma nova observação' },
  { label: 'Enviar documento', description: 'PDF, DOCX ou TXT' },
  { label: 'Enviar foto', description: 'Registrar evidência visual' },
  { label: 'Enviar planilha', description: 'Dados e métricas' },
  { label: 'Enviar vídeo', description: 'Contexto operacional' },
];

export default function DecidirPage() {
  const router = useRouter();
  const [decisionCards, setDecisionCards] = useState<DecisionCard[]>([]);
  const [confirmedEvidence, setConfirmedEvidence] = useState<EvidenceItem[]>([]);

  useEffect(() => {
    const state = readInvestigationState();

    if (!state) {
      return;
    }

    const evidenceById = new Map(state.evidenceRegistry.items.map((item) => [item.id, item]));

    const confirmed = state.hypothesisRegistry.items
      .filter((item) => item.status === 'Confirmed')
      .sort((a, b) => b.confidence - a.confidence);

    const cards = confirmed.map((hypothesis) => {
      const supportingEvidence = hypothesis.supportingEvidence
        .map((evidenceId) => evidenceById.get(evidenceId))
        .filter((item): item is EvidenceItem => Boolean(item));

      return {
        hypothesis,
        supportingEvidence,
        decision: deriveDecision(hypothesis.description),
      };
    });

    setDecisionCards(cards);
    setConfirmedEvidence(
      cards
        .flatMap((card) => card.supportingEvidence)
        .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index)
    );
  }, []);

  const progressItems = useMemo(
    () =>
      progressSteps.map((step, index) => ({
        step,
        active: index === 3,
        complete: index < 3,
        number: index + 1,
      })),
    []
  );

  return (
    <main className="bg-white text-slate-950">
      <section className="mx-auto min-h-screen max-w-[1280px] px-6 py-16 lg:px-8">
        <div className="space-y-10">
          <nav aria-label="Progresso da investigação" className="flex flex-wrap items-center gap-3">
            {progressItems.map((item) => (
              <div
                key={item.step}
                className={`flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] ${
                  item.complete
                    ? 'border-slate-200 bg-slate-100 text-slate-700'
                    : item.active
                    ? 'border-[#5B5CEB] bg-[#5B5CEB] text-white'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
                aria-current={item.active ? 'true' : undefined}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-semibold text-current">
                  {item.number}
                </span>
                {item.step}
              </div>
            ))}
          </nav>

          <div className="rounded-[2rem] border-2 border-slate-300 bg-white p-10 shadow-md shadow-slate-950/10">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">DECIDIR</p>
            <h1 className="mt-4 max-w-[780px] text-[2.9rem] leading-[0.96] tracking-tight text-slate-950 sm:text-[3.5rem]">
              O que a investigação revelou
            </h1>
            <p className="mt-5 max-w-[760px] text-[18px] leading-8 text-slate-600">
              A ATLAZ consolidou as evidências para indicar a melhor direção de decisão agora, os riscos envolvidos e os próximos movimentos recomendados.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[64%_36%]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border-2 border-slate-300 bg-white p-10 shadow-md shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Conclusão principal</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
                  {decisionCards.length > 0
                    ? decisionCards[0].decision
                    : 'Ainda não há hipóteses confirmadas para consolidar uma recomendação.'}
                </h2>

                <div className="mt-6 rounded-[1.5rem] bg-[#5B5CEB] p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-200">Recomendação executiva</p>
                  <p className="mt-3 text-lg font-semibold leading-8">
                    {decisionCards.length > 0
                      ? 'Decisões geradas exclusivamente a partir de hipóteses Confirmed e evidências rastreadas.'
                      : 'Continue investigando até confirmar hipóteses para habilitar recomendações.'}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-200/90">
                    Nenhuma recomendação é publicada sem trilha causal Evidence → Hypothesis → Decision.
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Evidências</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">O que sustenta esta decisão</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Dados claros
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {confirmedEvidence.map((item) => (
                    <div key={item.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-base font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">Fonte: {item.source}</p>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Confiança {toPercent(item.confidence)} · Etapa {item.investigationStep}
                      </p>
                    </div>
                  ))}
                  {confirmedEvidence.length === 0 ? (
                    <p className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                      Sem evidências confirmadas suficientes para gerar recomendação nesta etapa.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Insights</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">Ranking de confiança das hipóteses</h3>
                  <div className="mt-4 space-y-5">
                    {decisionCards.map((card) => (
                      <div key={card.hypothesis.id}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950">{card.hypothesis.description}</p>
                          <span className="text-sm font-semibold text-[#5B5CEB]">{toPercent(card.hypothesis.confidence)}</span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          Status: {card.hypothesis.status} · Evidências de suporte: {card.supportingEvidence.length}
                        </p>
                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                          <div className="h-2 rounded-full bg-[#5B5CEB]" style={{ width: toPercent(card.hypothesis.confidence) }} />
                        </div>
                      </div>
                    ))}
                    {decisionCards.length === 0 ? (
                      <p className="text-sm leading-7 text-slate-600">Sem hipóteses Confirmed para ranking decisório.</p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Suporte</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">Métodos aplicados</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    {methodsApplied.map((method) => (
                      <div key={method} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        {method}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Rastreabilidade</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Why this recommendation?</h3>
                <div className="mt-4 space-y-3">
                  {decisionCards.map((card) => (
                    <div key={`trace-${card.hypothesis.id}`} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                      <p><strong>Evidence:</strong> {card.supportingEvidence.map((item) => item.title).join(' | ') || 'N/A'}</p>
                      <p className="text-slate-400">↓</p>
                      <p><strong>Hypothesis:</strong> {card.hypothesis.description}</p>
                      <p className="text-slate-400">↓</p>
                      <p><strong>Decision:</strong> {card.decision}</p>
                    </div>
                  ))}
                  {decisionCards.length === 0 ? (
                    <p className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                      A recomendação será exibida quando houver hipóteses Confirmed conectadas a evidências coletadas.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Ação</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Escolha como avançar a partir da conclusão</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Novas notas, arquivos e registros podem atualizar automaticamente hipóteses e nível de confiança antes da definição final do plano.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {evidenceUploads.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                    >
                      <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                      <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button type="button" onClick={() => router.push('/evoluir')} className="w-full sm:w-auto">
                    Construir plano de ação
                  </Button>
                  <Button variant="secondary" type="button" onClick={() => router.push('/workspace')} className="w-full sm:w-auto">
                    Continuar investigando
                  </Button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm shadow-slate-950/5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Fechamento da etapa</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Decisão consolidada</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  A direção recomendada está conectada às evidências atuais e pronta para se transformar em plano executável na etapa final.
                </p>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Resumo de status</p>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">Progresso da investigação</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-[82%] rounded-full bg-[#5B5CEB]" />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">82% consolidado</p>
                </div>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">Confiança atual</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">87%</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Última atualização</p>
                <p className="mt-2">
                  A leitura atual foi consolidada há poucos minutos, com base em evidências já registradas no fluxo de investigação.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
