# Cognitive Runtime Roadmap

## Diretriz de governança (obrigatória)
A partir de v1.1, toda evolução de runtime só pode iniciar após ADR aprovado.

Regra operacional:
1. Proposta arquitetural
2. ADR
3. Aprovação
4. Implementação
5. Testes
6. Release Notes + Changelog

Sem ADR aprovado, implementação não deve começar.

## Estado atual
- Runtime: v1.1
- Núcleo de confiança: CEF ativo
- UI investigativa: conectada a `investigationOutput`
- Testes de CEF: ativos

## v1.2 — Instrumentação e confiabilidade
Objetivos:
- Telemetria por estágio de lifecycle
- Métricas de transição por hipótese
- Alertas de contradição persistente
- Testes de regressão de fluxo investigativo

Entregas previstas:
- ADR-0008 (observabilidade de lifecycle)
- Dashboard técnico de qualidade de evidência

## v1.3 — Evidência avançada e validação cruzada
Objetivos:
- Estratégia automática de validação para evidência contraditória
- Priorização de lacunas por impacto operacional
- Scoring de robustez por hipótese

Entregas previstas:
- ADR-0009 (cross-validation engine)
- Novos tipos de evidência industrial

## v1.4 — Decision Intelligence robusta
Objetivos:
- Matriz decisória com cenários e trade-offs
- Risco residual por opção
- Plano de ação condicionado por confiança mínima

Entregas previstas:
- ADR-0010 (decision intelligence thresholds)
- Integração completa com DecisionPackage e InvestigationPlan

## v1.5+ — Evolução Bayesiana
Objetivos:
- Camada bayesiana incremental sobre CEF
- Atualização dinâmica de crença por nova evidência
- Priors configuráveis por domínio

Entregas previstas:
- ADR-0011 (bayesian extension strategy)
- Simulador de sensibilidade de evidência

## Políticas de qualidade contínua
- Nenhuma hipótese Confirmed com lacunas explícitas.
- Toda decisão deve incluir rationale explicável.
- Toda mudança de threshold/peso exige teste unitário dedicado.
- Toda evolução de runtime exige:
  - ADR
  - testes
  - changelog
  - release notes

## Checklist de evolução futura
- ADR criado e aprovado.
- Critérios de aceitação definidos.
- Testes escritos antes do merge.
- Build e suíte verdes.
- Documentação atualizada em `/docs/architecture`.
