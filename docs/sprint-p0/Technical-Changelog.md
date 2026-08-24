# Technical Changelog

## Sprint P0 - Evidence Intake Layer

### Criados

- `lib/evidenceIntake.ts`: extração textual, normalização, metadados, persistência e encaminhamento ao Runtime.
- `components/ui/cognitive/EvidenceIntakeControl.tsx`: upload persistente, feedback executivo e disclosure de arquivos.
- `tests/runtime/evidence-intake.test.ts`: regressões de extração, associação, múltiplos uploads, síntese parcial e fluxo sem upload.
- `docs/sprint-p0/*`: arquitetura, release notes e changelog da Sprint.

### Alterados

- `InvestigationPageFrame`: inclui o controle de intake como parte da experiência de investigação.
- `app/context`, `app/workspace` e `app/compreender`: recebem o estado reavaliado após um upload.

### Limites arquiteturais

- Não houve alteração sob `runtime/`.
- A camada de intake não modifica diretamente hipóteses, confiança, decisões ou governança.
- Formatos binários não recebem parser inventado; são auditados como pendentes de extração até que uma capacidade compatível seja introduzida.