# ADR-0008 — Evidence Classification Framework (ECF)

- Status: Proposed
- Data: 2026-08-09
- Decisores: Arquitetura do ATLAZ Cognitive Runtime
- Tipo: Arquitetura de Runtime

## Contexto
A Validation Session 002 revelou uma falha de governança epistemológica: respostas contextuais de entrevista estavam sendo tratadas como evidência de validação. Isso cria um risco direto de falso positivo, porque o runtime hoje infere tipo de evidência por heurística textual e usa o mesmo caminho para classificar, ponderar e promover lifecycle.

O problema não é apenas de threshold. O boundary atual mistura três responsabilidades distintas:

1. classificar a natureza da evidência,
2. decidir se a evidência pode promover lifecycle,
3. calcular confiança e explicabilidade.

Quando essas responsabilidades ficam no mesmo componente, qualquer refinamento de taxonomia vira também um ajuste no motor de confiança, o que aumenta o risco de regressões semânticas.

## Decisão
Introduzir um Evidence Classification Framework (ECF) separado, upstream do Confidence & Evidence Framework (CEF).

### Papel de cada componente
- ECF: classifica evidência, valida provenance, determina admissibilidade e teto de promoção de lifecycle.
- CEF: consome evidência já classificada, calcula confiança, aplica penalidades, produz reasoning e decide a transição final dentro das regras permitidas pelo ECF.

### Motivo da decisão
Separar classificação de confiança evita que heurísticas de entrevista continuem “promovendo” evidência sem uma prova de origem compatível. O ECF passa a ser o guardião da semântica da evidência; o CEF permanece como motor de agregação e decisão.

## Taxonomia obrigatória
O ECF deve distinguir explicitamente as seguintes classes:

- Contextual: relato de entrevista, percepção do operador, descrição de cenário, observação de ambiente ou sintoma narrado.
- Correlational: tendência temporal, correlação estatística, co-variação de KPI, associação observada em dados históricos.
- Experimental: teste controlado, DOE, laboratório, MSA, replicação técnica ou ensaio com condição de controle.
- Validation: evidência de validação formal, verificação independente, confirmação por fonte ou método suficiente para liberar confirmação.
- Contradictory: evidência que nega, enfraquece ou invalida a hipótese ou uma parte central dela.

## Regra de provenance
O texto da resposta nunca pode elevar sozinho a categoria da evidência.

Se a origem for uma entrevista, o resultado deve ser contextual por padrão, mesmo quando a resposta usar vocabulário de validação, confirmação ou teste. A categoria validation só pode surgir quando o método, a origem e o artefato de prova forem compatíveis com validação formal.

## Matriz de promoção de lifecycle
As classes de evidência podem promover lifecycle apenas conforme a matriz abaixo:

| Lifecycle alvo | Categorias permitidas | Condição adicional |
| --- | --- | --- |
| Draft -> Candidate | Contextual | Apenas para delimitar problema e reduzir ambiguidade inicial |
| Candidate -> Plausible | Contextual, Correlational | Deve haver sinal consistente, sem contradição dominante |
| Plausible -> Supported | Correlational, Experimental | Exige fonte independente do relato puro de entrevista |
| Supported -> Validated | Experimental, Validation | Exige método verificável e rastreável |
| Validated -> Confirmed | Validation | Exige ausência de lacunas abertas relevantes e ausência de contradição dominante |
| Any -> Rejected | Contradictory | Contradição prevalecente pode bloquear ou rebaixar a hipótese |

## Restrição crítica
Uma investigação composta apenas por evidência contextual nunca pode produzir uma hipótese Confirmed.

Na prática, isso significa:

- entrevista-only investigations ficam limitadas no máximo a Plausible;
- Confirmed exige, no mínimo, evidência de classe Validation;
- respostas de entrevista não podem ser convertidas em Validation por inferência textual.

## Consequências

### Positivas
- Evita confirmação indevida por auto-relato.
- Torna a semântica da evidência audítavel e estável.
- Permite evoluir a taxonomia sem reescrever o motor de confiança.
- Facilita testes de regressão focados em admissibilidade e promotion ceiling.

### Negativas
- Introduz um componente a mais no pipeline.
- Exige migração dos pontos onde hoje o CEF infere evidência diretamente do texto.
- Requer revisão das mensagens de UI e testes para refletir a distinção entre classe de evidência e estado de lifecycle.

## Alternativas consideradas

### 1. Estender apenas o CEF
Rejeitada.

Motivo: manteria classificação, scoring e promoção no mesmo ponto, preservando o acoplamento que causou o problema. Corrige o sintoma, mas não a fronteira arquitetural.

### 2. Resolver apenas na UI
Rejeitada.

Motivo: a UI pode esconder o problema, mas não impede que o core do runtime continue produzindo estados semanticamente inválidos.

### 3. Refatorar para um motor bayesiano agora
Rejeitada neste momento.

Motivo: o risco e o custo são maiores do que o problema atual exige. A separação ECF + CEF é suficiente para corrigir a governança sem mudar o paradigma probabilístico do runtime.

## Diretrizes de implementação futura
Sem implementar agora, a direção arquitetural aprovada é:

1. criar um contrato explícito de classificação de evidência no boundary de entrada,
2. manter o CEF responsável por confiança, contradição e lifecycle,
3. remover inferência textual de “validação” do caminho de promoção,
4. adicionar testes que provem que entrevista-only investigations não confirmam hipóteses,
5. revisar documentação e mensagens de produto para refletir a nova taxonomia.

## Nota de governança
Este ADR deve ser aprovado antes de qualquer alteração de código relacionada à classificação, promoção de lifecycle ou confirmação de hipóteses.