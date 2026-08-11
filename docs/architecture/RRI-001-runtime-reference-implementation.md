# RRI-001 — Runtime Reference Implementation (Sprint 1.1)

Status: Aprovado para referência técnica interna
Data de consolidação: 2026-08-10
Escopo: comportamento efetivamente implementado e validado do ATLAZ Cognitive Runtime após Sprint 1.1

## Fonte de verdade desta referência
Esta referência descreve o runtime conforme implementação executável e testes automatizados aprovados no repositório.

Quando há diferença entre intenção documental e comportamento real, prevalece o comportamento implementado e validado.

## 1. Runtime Overview
O Cognitive Runtime opera como um ciclo investigativo orientado por estado, com os seguintes blocos de execução:

1. Entrada inicial via Operational Object.
2. Inicialização do estado adaptativo com hipóteses em Draft, gaps iniciais, evidência contextual de bootstrap e saída investigativa inicial.
3. Seleção de próxima pergunta investigativa por templates e contexto textual acumulado.
4. Registro de resposta do usuário, criação de evidência com provenance explícito e classificação ECF.
5. Reavaliação por hipótese via CEF (confiança, sinais de suporte/contradição, proposta de lifecycle).
6. Governança de lifecycle via HypothesisLifecycleGovernor (teto de categoria, bloqueios, antijump, evidência promotora).
7. Atualização de histórico investigativo, trilha de promoção auditável e questionamento subsequente.
8. Gate de decisão via DecisionIntegrityGuard para emissão de status decisório final em investigationOutput.
9. Telemetria por execução (sucesso, erro ou interrupção) com tempos por módulo e eventos.
10. Persistência em sessionStorage com leitura validada por schema + autenticação arquitetural.

Resultados expostos ao consumidor:
- Estado completo: AdaptiveInvestigationState.
- Saída unificada para UI: investigationOutput.
- Rastreabilidade técnica: lifecycleAuditTrail + runtimeTelemetry + logs estruturados.

## 2. Runtime State Machine
### 2.1 Estados do runtime
O estado de execução global usa dois estados:
- ongoing
- ready-for-synthesis

### 2.2 Eventos observáveis no fluxo
Eventos funcionais:
- initialize
- registerAnswer

Eventos de telemetria registrados:
- RuntimeInitializationStarted
- RuntimeInitializationCompleted
- RuntimeInitializationFailed
- AnswerRegistrationStarted
- AnswerRegistrationCompleted
- AnswerRegistrationInterrupted
- AnswerRegistrationFailed

### 2.3 Transições válidas
Transições efetivamente aplicadas:
- initialize define status ongoing quando há próxima pergunta.
- initialize define status ready-for-synthesis quando não há pergunta aplicável.
- registerAnswer mantém/retorna ongoing quando nova pergunta é selecionada.
- registerAnswer move para ready-for-synthesis quando não restam perguntas aplicáveis.

### 2.4 Transições proibidas e invariantes de estado
Invariantes rejeitadas por autenticação arquitetural no parse:
- status ongoing com currentQuestion nulo é inválido.
- status ready-for-synthesis com currentQuestion não nulo é inválido.

Além disso, interrupções de execução não mudam estado funcional quando:
- currentQuestion ausente.
- resposta vazia.

Nesses casos o estado é retornado sem mutação funcional, com telemetria result=interrupted.

## 3. Operational Object
Operational Object é o contrato de entrada para iniciar investigação:

Campos obrigatórios:
- artifact: OperationalObject
- version: string
- problemStatement: string
- domain: string
- category: string
- process: string
- severity: enum Severity
- urgency: enum Urgency
- impact: enum Impact
- suspectedDomains: string[]
- requiredInformation: string[]
- confidence: number

Papel no runtime:
- Define o problema investigado e o contexto operacional base.
- Alimenta hipóteses iniciais, lacunas iniciais e confidence inicial.
- Determina direcionamento das perguntas investigativas e do recommendedInvestigation inicial.

Validação:
- OperationalObjectSchema faz validação estrita de estrutura e tipos.
- Se origem LLM vier inválida no fluxo de interpretação, há recuperação heurística (OperationalObjectRecovery) antes de reinjetar no schema.

## 4. Hypothesis Lifecycle
### 4.1 Estados de lifecycle
- Draft
- Candidate
- Plausible
- Supported
- Validated
- Confirmed
- Rejected

### 4.2 Regras de promoção implementadas
A promoção ocorre em duas etapas:
1. CEF calcula proposta de lifecycle a partir das categorias de evidência presentes.
2. Governor governa a proposta e aplica bloqueios/ajustes arquiteturais.

Mapeamento de teto por categoria predominante (ECF):
- Contextual -> teto Plausible
- Correlational -> teto Supported
- Experimental -> teto Validated
- Validation -> teto Confirmed
- Contradictory -> Rejected

Regras de governança aplicadas:
- CategoryCeilingEnforced: impede promoção acima do teto da categoria predominante.
- MissingEvidenceBlock: impede Confirmed quando há missingEvidence.
- NoLifecycleJump: impede salto de lifecycle (promoção máxima de um nível por ciclo, exceto Rejected).
- EvidenceCompatibilityBlock: bloqueia promoção sem evidência compatível com estado alvo.
- MissingPromoterEvidenceBlock: bloqueia promoção sem evidência promotora verificável.
- ContradictionDominance: permite transição para Rejected com evidência contraditória predominante.

### 4.3 Regras de rejeição
- Evidência classificada como Contradictory pode levar a Rejected.
- Rejected pode ocorrer independentemente da adjacência, por regra explícita de contradição.

### 4.4 Limitações impostas pelo ECF
- Evidência contextual não promove além de Plausible.
- Entrevista contextual (ContextualInterview) permanece contextual, mesmo com texto de validação.
- Confirmed exige base de Validation, sujeita a governança e gate de integridade de decisão.

## 5. Architectural Decision Flow
Ordem exata de execução em registerAnswer:

1. Início da telemetria runtime.registerAnswer.
2. Gate de interrupção:
- Sem currentQuestion -> interrupted(MissingCurrentQuestion).
- Resposta vazia -> interrupted(EmptyAnswer).
3. Atualização de gaps (runtime.gapUpdate).
4. Criação de evidências por hipótese (runtime.evidenceCreation), usando CEF.createEvidenceRecord.
5. Avaliação por hipótese no CEF:
- confidence recalculada
- proposta de lifecycle
- reasoningSummary
- supporting/contradicting IDs
- nextRecommendedInvestigation
6. Governança de lifecycle por hipótese (runtime.lifecycleGovernance) via HypothesisLifecycleGovernor.resolve.
7. Em caso de promoção governada, criação de LifecyclePromotionAuditEntry com governanceEvaluationId e promoterEvidence.
8. Atualização do estado (hypotheses, history, askedQuestionIds, knownInformation, gaps, audit trail).
9. Seleção de próxima pergunta (runtime.questionSelection).
10. Geração de investigationOutput com decisão via DecisionIntegrityGuard (runtime.decisionIntegrity).
11. Finalização de telemetria e append em runtimeTelemetry.

### Papel de cada componente
ECF:
- Classifica evidência por provenance.kind em evidenceCategory/evidenceType/relation.
- Resolve teto de lifecycle por categorias presentes.

CEF:
- Calcula confiança ponderada por suporte, contradição, quantidade, penalidades e lacunas.
- Propõe lifecycle incremental com base no ECF.
- Produz reasoningSummary e recomendações.

Governor:
- Aplica regras arquiteturais finais de promoção/rejeição.
- Garante compatibilidade de evidência, antijump e trilha de promoção auditável.

Decision Integrity Guard:
- Libera ready-for-decision apenas com critérios arquiteturais completos.
- Bloqueia decisão final mesmo com hipótese Confirmed se faltar prova arquitetural.

Decision Engine:
- Constrói DecisionPackage a partir do estado.
- Usa status do DecisionIntegrityGuard para definir recomendação:
- se ready-for-decision, prioriza opção vinculada a hipótese Confirmed.
- caso contrário, mantém recomendação padrão (primeira opção disponível).

## 6. Explainability
Artefatos de explicabilidade atualmente produzidos:

1. investigationOutput
- problema
- hipóteses com confidence, lifecycleStatus e reasoningSummary
- confiança global e hipótese mais forte
- evidências supporting/contradicting
- missingEvidence consolidado
- recommendedInvestigation
- decision (status + rationale)

2. hypothesis.confidenceHistory
- snapshots temporais de confiança
- lifecycle no instante do snapshot
- reasoningSummary correspondente

3. history (InvestigationTurn)
- pergunta feita
- resposta do usuário
- por que a pergunta foi feita
- incerteza alvo reduzida
- objetivo da pergunta
- hipóteses fortalecidas/enfraquecidas
- confiança antes/depois
- gaps remanescentes

4. lifecycleAuditTrail
- prova detalhada de promoção governada:
- from/to
- ruleApplied
- predominantCategory
- promoterEvidence
- governanceEvaluationId
- justificativa textual

5. runtimeTelemetry
- trilha de execução técnica por request.

## 7. Runtime Telemetry
### 7.1 IDs e correlação
Por trace:
- id
- sessionId
- runtimeId
- requestId
- retryCount

### 7.2 Resultado de execução
Campo result:
- success
- error
- interrupted

Campo opcional:
- interruptionReason (ex.: MissingCurrentQuestion, EmptyAnswer)

### 7.3 Métricas
- startedAt
- endedAt
- totalDurationMs
- moduleTimings[] com duração por módulo

Módulos observados no runtime principal:
- runtime.initialize
- runtime.registerAnswer
- runtime.gapUpdate
- runtime.evidenceCreation
- runtime.lifecycleGovernance
- runtime.questionSelection
- runtime.decisionIntegrity

### 7.4 Eventos e erros
events[] registra marcos de execução.
errors[] registra falhas por módulo (timestamp, módulo, mensagem).

### 7.5 Persistência e retenção
- runtimeTelemetry é anexado ao estado e truncado para as últimas 40 execuções.
- finalize fecha módulos abertos automaticamente para manter rastreabilidade.

### 7.6 Logs estruturados complementares
Client storage:
- [ATLAZ][Runtime][StateReadFailure]
- [ATLAZ][Runtime][StateWriteFailure]

API problem-interpreter:
- [ATLAZ][Runtime][ProblemInterpreterRequest] (start/success)
- [ATLAZ][ProblemInterpreter][RouteFailure] (erro)

## 8. Runtime Invariants
Invariantes garantidas pela implementação (schema + autenticação + governança + guard):

1. Coerência de estado global:
- ongoing exige currentQuestion != null.
- ready-for-synthesis exige currentQuestion == null.

2. Coerência evidência/proveniência:
- evidenceCategory deve ser compatível com provenance.kind.
- evidenceType deve ser compatível com provenance.kind.

3. Autenticidade de promoções:
- hipótese fora de Draft exige lifecycleAuditTrail.
- deve existir entrada de promoção para o lifecycle atual.
- governanceEvaluationId da entrada deve existir e não vazio.
- promoterEvidence referenciado deve existir e pertencer à hipótese.
- promoterEvidenceCategory da trilha deve bater com a evidência promotora real.

4. Integridade de transição:
- transições devem ser adjacentes (exceto Rejected).
- lifecycle atual não pode exceder teto ECF da categoria predominante de suporte.

5. Requisitos por estado alto:
- Validated exige suporte Experimental ou Validation.
- Confirmed exige:
- missingEvidence vazio
- suporte Validation com provenance ValidationArtifact
- predominantCategory = Validation na promoção correspondente

6. Liberação decisória:
- ready-for-decision exige hipótese Confirmed autenticada por promoção governada.
- exige evidência Validation com provenance rastreável.
- exige sinal de suporte >= 0.6.
- exige sinal de contradição < 70% do suporte.

## 9. Runtime Failure Conditions
### 9.1 Rejeição de estado (parse/autenticação)
AdaptiveInvestigationStateSchema lança erro quando:
- envelope do estado inválido (artifact, version, ids, datas, status, tipos obrigatórios).
- history inválido.
- lifecycleAuditTrail malformado.
- runtimeTelemetry malformado (incluindo ausência de result válido por trace).
- OperationalObject inválido.
- quebra de invariantes arquiteturais no RuntimeStateAuthenticator.

Efeitos operacionais na leitura de storage:
- estado inválido é descartado do sessionStorage.
- log estruturado de StateReadFailure é emitido.

### 9.2 Bloqueio de promoção
HypothesisLifecycleGovernor bloqueia ou ajusta promoção quando:
- promoção excede teto ECF.
- tentativa de Confirmed com missingEvidence.
- tentativa de salto de lifecycle.
- ausência de evidência compatível com estado alvo.
- ausência de evidência promotora verificável.

### 9.3 Bloqueio de decisão final
DecisionIntegrityGuard retorna não pronto para decisão quando:
- Confirmed sem promoção auditada válida.
- Confirmed com missingEvidence.
- ausência de Validation com provenance ValidationArtifact.
- provenance de validação sem source.
- contradição dominante sobre sinal de suporte.

### 9.4 Interrupções de execução sem falha fatal
registerAnswer retorna estado sem mutação funcional (com telemetria interrupted) quando:
- currentQuestion ausente.
- resposta vazia.

### 9.5 Falhas de execução tratadas
Em exceções internas durante registerAnswer:
- erro é registrado em telemetria.
- estado anterior é retornado com trace de erro anexado.

Em exceções durante initialize:
- erro é registrado em telemetria.
- exceção é propagada para o chamador.

## 10. Known Limitations
Limitações existentes e reconhecidas na implementação atual:

1. Tolerância parcial a legado no parse de evidências
O parser de evidenceRegistry ainda aplica defaults e coerções para campos ausentes/legados antes da autenticação arquitetural.

2. Divergência potencial entre hypotheses e hypothesisRegistry
A autenticação atual valida autenticidade sobre hypotheses e não impõe, de forma explícita, equivalência estrutural total com hypothesisRegistry.items.

3. Tratamento de erro assimétrico entre initialize e registerAnswer
initialize propaga exceção após registrar telemetria; registerAnswer captura exceção e devolve estado anterior com erro telemétrico.

4. Heurística textual na seleção de perguntas
A seleção de perguntas permanece baseada em padrões regex de texto acumulado (context build + applicability templates).

5. Retenção limitada de telemetria em estado
Somente as últimas 40 traces são mantidas no runtimeTelemetry persistido.

6. Camada decisória de pacote ainda simplificada
DecisionEngine, EvidenceEngine, HypothesisEngine e OperationalDecisionMatrix atuam como projeções/sumarizações do estado, sem regras adicionais de governança além das já aplicadas no pipeline principal.

---

## Evidência de validação usada nesta referência
Base factual desta RRI:
- Comportamento implementado em runtime/ecf, runtime/cef, runtime/governance, runtime/engines, runtime/schemas, runtime/telemetry e lib/investigationStateStorage.
- Testes automatizados aprovados em tests/runtime/confidence-evidence-framework.test.ts e tests/runtime/runtime-stabilization.test.ts.
- Terminologia e baseline de estabilização descritos em Runtime v1.1 Release Notes e Technical Changelog.
