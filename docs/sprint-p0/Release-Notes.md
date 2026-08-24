# ATLAZ Sprint P0 - Evidence Intake Layer

## Resumo executivo

Adicionada a capacidade de anexar evidências continuamente durante investigações abertas. A experiência preserva o caso atual e encaminha conteúdo estruturado ao Cognitive Runtime existente para reavaliação.

## Entregas

- Ação persistente `Adicionar evidência` no frame de investigação.
- Upload múltiplo e associação automática ao `investigationId` atual.
- Extração e normalização para formatos textuais já suportados pela infraestrutura do navegador.
- Registro de auditoria com processamento, conteúdo extraído e vínculo com evidências produzidas pelo Runtime.
- Comunicação de incorporação, ausência de informação relevante, formatos pendentes de extração e contradição identificada pelo Runtime.

## Preservação arquitetural

Nenhum arquivo em `runtime/` foi modificado. A Evidence Intake Layer é anterior ao Runtime e delega a reavaliação à API pública já existente. Não há motor paralelo de decisão ou atualização direta de hipóteses.