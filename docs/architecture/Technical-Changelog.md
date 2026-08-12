# Technical Changelog

## [v1.1.0] - 2026-08-09

## Added
- Novo módulo `runtime/cef`:
  - `ConfidenceEvidenceFramework.ts`
  - `config.ts`
  - `index.ts`
- Novo contrato de saída investigativa: `investigationOutput`.
- Novos tipos de domínio no estado adaptativo:
  - `HypothesisLifecycleStatus`
  - `EvidenceType`
  - `EvidenceWeightLevel`
  - `EvidenceRelation`
  - `HypothesisConfidenceSnapshot`
- Script de testes TypeScript com `tsx`.
- Suíte de testes unitários dedicada ao CEF.

## Changed
- `AdaptiveInvestigationEngine` refatorado para:
  - usar CEF na avaliação de hipóteses
  - criar evidência estruturada por resposta
  - recalcular confiança com pesos e penalidades
  - gerar `investigationOutput` consolidado
- `AdaptiveInvestigationState` expandido com explainability.
- `AdaptiveInvestigationStateSchema` expandido com parsing compatível para estado legado e novo estado v1.1.
- Runtime exports atualizados para incluir CEF.
- UI investigativa migrada para consumir exclusivamente `investigationOutput`.

## Removed
- Renderização decisória baseada em heurísticas locais nas telas de investigação.
- Dependência funcional de cálculos de decisão no frontend para fluxo principal.

## Fixed
- Prevenção de confirmação de hipótese quando há evidência faltante explícita.
- Redução de confiança diante de evidência contraditória ponderada.

## Tests
- Cobertura adicionada para:
  - transições de lifecycle
  - cálculo de confiança
  - penalidades por contradição
  - bloqueio por missing evidence
  - explainability output
  - thresholds configuráveis

## Build & Quality
- Build de produção aprovado.
- Type-check aprovado.
- Testes automatizados aprovados.

## Governance
- Regra técnica estabelecida: nenhuma evolução futura de runtime sem ADR prévio aprovado.
- ADR de referência: `ADR-0007`.

## [v1.2.0] - 2026-08-12

## Added
- Camada compartilhada de experiência CIX em `lib/cixExperience.ts`.
- Frame executivo de investigação em `components/ui/cognitive/InvestigationPageFrame.tsx`.
- Disclosure técnico opcional mantido em `components/ui/cognitive/TechnicalAnalysisPanel.tsx`.

## Changed
- Páginas `context`, `workspace`, `compreender`, `decidir` e `evoluir` redesenhadas para narrativa conversacional e resumo executivo.
- Home hero e header ajustados para a nova linguagem de investigação.
- Estilo global refinado para a nova hierarquia visual da CIX.

## Removed
- Exposição direta de internals do runtime na visão principal das páginas investigativas.
- Blocos longos de texto e listas extensas na jornada principal.

## Fixed
- Detecção de persona passou a considerar também o texto consolidado do problema operacional.
- Narrativa investigativa passou a seguir uma linguagem natural e orientada por especialista.

## Tests
- Alterações de UX permanecem vinculadas às validações de build, lint, type-check e teste automatizado do projeto.

## Build & Quality
- A Sprint 3 preserva o baseline arquitetural e se limita à camada de experiência.

## [v1.1.1] - 2026-08-10

## Added
- Novo módulo de governança independente de lifecycle:
  - `runtime/governance/HypothesisLifecycleGovernor.ts`
- Novo módulo de integridade de decisão:
  - `runtime/governance/DecisionIntegrityGuard.ts`
- Novo módulo de telemetria de execução:
  - `runtime/telemetry/RuntimeExecutionTelemetry.ts`
- Novos contratos no estado adaptativo:
  - `LifecyclePromotionAuditEntry`
  - `RuntimeExecutionTrace`
  - `RuntimeTelemetryModuleTiming`
  - `RuntimeTelemetryEvent`
  - `RuntimeTelemetryError`
- Nova suíte de estabilização:
  - `tests/runtime/runtime-stabilization.test.ts`

## Changed
- `AdaptiveInvestigationEngine`:
  - passou a aplicar governança de lifecycle após avaliação do CEF, sem alterar ECF/CEF;
  - passou a registrar `lifecycleAuditTrail` em cada promoção;
  - passou a registrar `runtimeTelemetry` por inicialização e por resposta.
- `DecisionEngine`:
  - recomendação alinhada com `DecisionIntegrityGuard` para evitar decisão baseada apenas em score/lifecycle.
- `AdaptiveInvestigationStateSchema`:
  - parsing compatível com estado legado e novo estado com auditoria/telemetria.
- `lib/investigationStateStorage`:
  - geração e persistência de `sessionId`;
  - geração de `requestId`;
  - logs estruturados em falhas de leitura/escrita.
- UI de entrada/fluxo investigativo (`new/context/workspace`):
  - passa `sessionId/requestId` para inicialização e registro de respostas.
- API `problem-interpreter`:
  - propaga `X-Session-ID`/`X-Request-ID`;
  - registra tempo total de execução e eventos de início/fim/erro.

## Fixed
- Integridade de promoção: evidência contextual não ultrapassa teto arquitetural.
- Integridade decisória: confirmação inválida sem validation/provenance não libera decisão final.
- Rastreabilidade: transições de lifecycle passaram a ser reconstruíveis de ponta a ponta.
- Diagnóstico de bootstrap: falhas de primeira execução agora deixam trilha de erro com IDs e tempos.

## Tests
- Cobertura adicionada para:
  - bloqueio de promoção contextual acima de `Plausible`;
  - bloqueio de decisão sem `Validation` com provenance válido;
  - liberação de decisão com critérios completos;
  - auditoria de promoção e telemetria obrigatória por execução.

## Build & Quality
- Testes runtime aprovados: 17/17.
