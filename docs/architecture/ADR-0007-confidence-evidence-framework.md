# ADR-0007 — Confidence & Evidence Framework (CEF)

- Status: Accepted
- Data: 2026-08-09
- Decisores: Arquitetura do ATLAZ Cognitive Runtime
- Tipo: Arquitetura de Runtime

## Contexto
A validação inicial do runtime mostrou um problema crítico: hipóteses podiam atingir níveis de confiança incompatíveis com o estado real da evidência. Isso violava o princípio central da plataforma: investigar antes de concluir.

Exemplo observado:
- Hipótese com alta confiança declarada.
- Registro explícito de evidência insuficiente para confirmar/rejeitar.

Era necessário um mecanismo arquitetural central para governar confiança, contradição, lacunas e explainability.

## Decisão
Adotar o Confidence & Evidence Framework (CEF) como componente de núcleo do runtime, entre o Hypothesis Engine e os blocos de decisão operacional.

Fluxo arquitetural:
1. Problem Interpreter
2. Hypothesis Engine
3. Confidence & Evidence Framework
4. Evidence Engine
5. Decision Logic
6. Operational Recommendation

## Regras adotadas

### 1. Lifecycle explícito
Toda hipótese deve passar por estados:
- Draft
- Candidate
- Plausible
- Supported
- Validated
- Confirmed
- Rejected

Sem salto direto para Confirmed.

### 2. Registry de evidência estruturado
Toda evidência deve conter metadados mínimos de origem, contexto, peso e relação causal.

### 3. Confiança ponderada
Confiança é função de:
- quantidade útil
- qualidade
- contradições
- lacunas
- correlação temporal
- consistência

Contagem simples é proibida como critério de confiança.

### 4. Penalidade de contradição
Evidência contraditória reduz confiança e deve aparecer explicitamente no resumo de raciocínio.

### 5. Explainability mandatória
Toda hipótese deve ser auditável por:
- confiança atual
- status de lifecycle
- evidências de suporte
- evidências de contradição
- lacunas
- próxima investigação
- histórico de confiança
- resumo de raciocínio

### 6. Regra de bloqueio
Hipótese não pode ser Confirmed enquanto houver evidência faltante explícita.

### 7. Thresholds configuráveis
Faixas de decisão e pesos são configuráveis para adaptação por domínio.

## Consequências

### Positivas
- Melhora de rigor epistemológico do runtime.
- Saída explicável e auditável.
- Menor risco de falso positivo decisório.
- Base pronta para evolução Bayesiana.

### Negativas
- Maior complexidade de estado e schema.
- Custo adicional de calibração de pesos.
- Necessidade de maior disciplina de testes.

## Alternativas consideradas
1. Ajuste incremental do motor anterior de confiança
- Rejeitada por não resolver governança estrutural de evidência.

2. Resolver apenas em camada de UI
- Rejeitada por manter inconsistência entre raciocínio e apresentação.

3. Motor bayesiano completo imediato
- Adiado; custo e risco altos para o estágio atual.

## Compliance arquitetural
Este ADR define requisito obrigatório de governança:
- Toda evolução futura do Cognitive Runtime deve iniciar com ADR aprovado antes de qualquer implementação.
- PRs sem ADR correspondente devem ser bloqueados.

## Plano de evolução
- v1.2: calibração por domínio e observabilidade de lifecycle.
- v1.3: validação cruzada automatizada de conflitos.
- v1.4+: camada bayesiana incremental sobre o CEF.
