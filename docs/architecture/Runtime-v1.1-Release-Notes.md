# ATLAZ Cognitive Runtime v1.1 — Release Notes

## Resumo executivo
A versão v1.1 introduz o Confidence & Evidence Framework (CEF) como componente central do runtime cognitivo. O objetivo é eliminar confirmações prematuras de hipóteses e forçar decisões baseadas em evidência ponderada, explicável e rastreável.

## Principais entregas

### 1. Novo componente central: CEF
- Lifecycle explícito de hipóteses:
  - Draft
  - Candidate
  - Plausible
  - Supported
  - Validated
  - Confirmed
  - Rejected
- Regras de transição progressiva (sem salto direto para Confirmed).
- Bloqueio de confirmação com lacunas de evidência abertas.

### 2. Evidence Registry expandido
Cada evidência passa a carregar:
- id único
- origem
- pergunta
- resposta
- timestamp
- confidence
- evidenceType
- weight
- weightLevel
- relatedHypothesisId
- relation (Support | Contradiction | Neutral)
- temporalCorrelation
- consistency

### 3. Confidence Engine ponderado
A confiança deixa de ser derivada por contagem simples e passa a considerar:
- qualidade da evidência
- quantidade útil de evidência
- penalidade de contradição
- lacunas de evidência
- consistência
- correlação temporal

### 4. Explainability nativa
Cada hipótese expõe:
- confidence atual
- lifecycleStatus atual
- evidências de suporte
- evidências contraditórias
- evidências faltantes
- próxima investigação recomendada
- histórico de confiança
- reasoning summary

### 5. Investigation Output unificado
Todas as telas investigativas agora consomem `investigationOutput` gerado pelo runtime:
- problem
- hypotheses
- confidence
- evidence
- missingEvidence
- recommendedInvestigation
- decision

## Integração de UI (Phase 2)
As telas de investigação foram conectadas ao runtime v1.1:
- `context`
- `workspace`
- `compreender`
- `decidir`
- `evoluir`

Heurísticas legadas de renderização decisória foram removidas do fluxo principal.

## Compatibilidade
- Compatível com estado legado por fallback no parser de estado.
- Estrutura preparada para evolução Bayesiana futura sem ruptura de arquitetura.

## Qualidade e validação
- Build de produção validado com sucesso.
- Suíte de testes unitários executada com sucesso.

## Riscos conhecidos
- A qualidade da decisão ainda depende da qualidade da entrada textual do usuário.
- Pesos e thresholds exigem calibração contínua por domínio operacional.

## Próximos passos recomendados
- Instrumentar telemetria por estágio de lifecycle.
- Adicionar testes de regressão para fluxos de UI orientados a `investigationOutput`.
- Evoluir o CEF para suporte Bayesiano incremental.

## Governança obrigatória
A partir desta versão, toda evolução do Cognitive Runtime requer ADR aprovado antes de implementação.
Referência: `ADR-0007`.

## Sprint 1 — Runtime Stabilization (AR-001 / RSP-001)

Esta sprint executa alinhamento de implementação com baseline arquitetural aprovado, sem alterar arquitetura cognitiva, ECF ou CEF.

### Entregas de estabilização

1. Lifecycle Integrity
- Promoção de lifecycle passou a ser governada por um mecanismo independente (`HypothesisLifecycleGovernor`) acoplado ao runtime apenas como etapa de validação.
- Teto por categoria predominante de evidência aplicado antes da promoção final.
- Bloqueio explícito de saltos de lifecycle mantido pela governança.

2. Decision Logic Integrity
- Decisão final passou a depender de evidência classificada válida, provenance, consistência e ausência de contradição dominante (`DecisionIntegrityGuard`).
- Hipótese em `Confirmed` sem `Validation` válida não libera `ready-for-decision`.

3. Explainability Integrity
- Toda promoção de lifecycle agora gera trilha auditável (`lifecycleAuditTrail`) com:
  - hipótese,
  - estado anterior,
  - estado novo,
  - regra aplicada,
  - evidência promotora,
  - categoria,
  - peso,
  - qualidade,
  - justificativa textual.

4. Runtime Initialization
- Inicialização recebeu instrumentação com `sessionId` e `requestId` desde o primeiro bootstrap.
- Leitura/escrita de estado em storage ganhou logs de falha estruturados para diagnóstico de primeira execução.

5. Runtime Telemetry
- Runtime passou a registrar `runtimeTelemetry` por execução com:
  - `sessionId`,
  - `runtimeId`,
  - `requestId`,
  - `retryCount`,
  - tempos por módulo,
  - eventos,
  - erros,
  - tempo total.

### Validação
- Suíte runtime executada com sucesso: 17/17 testes aprovados.
