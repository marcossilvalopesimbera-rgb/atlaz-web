# Technical Changelog

## Sprint 2

### Adições
- Novos módulos cognitivos sob runtime/semantic, runtime/hypotheses, runtime/planning, runtime/communication e runtime/memory.
- Extensão de AdaptiveInvestigationState com perfis semânticos, competição, justificativa e target evidence.
- Enriquecimento do AdaptiveInvestigationEngine com interpretação semântica, competição de hipóteses, planificação de evidência e justificativa de perguntas.
- Novos testes automatizados em tests/runtime/cognitive-investigation-engine.test.ts.

### Preservação arquitetural
- ECF, CEF, Governor, Decision Logic e Architectural Decision Gate permaneceram intactos em sua lógica de base.
