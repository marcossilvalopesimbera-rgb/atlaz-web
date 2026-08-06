import { OperationalObject } from "../artifacts/OperationalObject";
import { Impact } from "../types/Impact";
import { Severity } from "../types/Severity";
import { Urgency } from "../types/Urgency";
import { OperationalObjectSchema } from "./OperationalObjectSchema";

type SafeParseResult =
  | { success: true; data: OperationalObject }
  | { success: false; error: Error };

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error("Unknown operational object validation error");

const normalizeRawResponse = (rawResponse: string): string => {
  const trimmed = rawResponse.trim();

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  return trimmed;
};

const extractJsonCandidate = (rawResponse: string): string | null => {
  const normalized = normalizeRawResponse(rawResponse);

  if (normalized.startsWith("{") && normalized.endsWith("}")) {
    return normalized;
  }

  const firstBrace = normalized.indexOf("{");
  const lastBrace = normalized.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return normalized.slice(firstBrace, lastBrace + 1);
  }

  return null;
};

const parseJsonCandidate = (rawResponse: string): unknown | null => {
  const candidate = extractJsonCandidate(rawResponse);

  if (!candidate) {
    return null;
  }

  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
};

const inferSeverity = (text: string): Severity => {
  if (/(critical|critico|crítico|parada total|seguranca|segurança|acidente)/i.test(text)) {
    return Severity.Critical;
  }
  if (/(alto impacto|alta|falha grave|vazamento|cliente)/i.test(text)) {
    return Severity.High;
  }
  if (/(moderado|medio|médio|desvio)/i.test(text)) {
    return Severity.Medium;
  }
  return Severity.Low;
};

const inferUrgency = (text: string): Urgency => {
  if (/(agora|imediat|urgente|hoje|parada)/i.test(text)) {
    return Urgency.Critical;
  }
  if (/(rapido|rápido|esta semana|cliente reclam)/i.test(text)) {
    return Urgency.High;
  }
  if (/(curto prazo|dias)/i.test(text)) {
    return Urgency.Medium;
  }
  return Urgency.Low;
};

const inferImpact = (text: string): Impact => {
  if (/(parada total|risco ao cliente|seguranca|segurança|multas)/i.test(text)) {
    return Impact.Critical;
  }
  if (/(scrap|retrabalho|atraso|custo|vazamento|falha)/i.test(text)) {
    return Impact.High;
  }
  if (/(variacao|variação|desvio|instabilidade)/i.test(text)) {
    return Impact.Medium;
  }
  return Impact.Low;
};

const inferDomain = (text: string): string => {
  if (/(cliente|qualidade|nao conformidade|não conformidade|defeito|scrap|retrabalho)/i.test(text)) {
    return "Qualidade";
  }
  if (/(maquina|máquina|parada|manutencao|manutenção|equipamento)/i.test(text)) {
    return "Manutenção";
  }
  if (/(fornecedor|supply|materia prima|matéria prima|logistica|logística)/i.test(text)) {
    return "Cadeia de Suprimentos";
  }
  if (/(producao|produção|processo|linha|operacao|operação)/i.test(text)) {
    return "Operações";
  }
  if (/(engenharia|projeto|design|parametro|parâmetro)/i.test(text)) {
    return "Engenharia";
  }
  return "Operações";
};

const inferCategory = (text: string, domain: string): string => {
  if (/(vazamento|defeito|falha|nao conformidade|não conformidade)/i.test(text)) {
    return "Desvio de Qualidade";
  }
  if (/(atraso|plano de producao|plano de produção|meta|entrega)/i.test(text)) {
    return "Desvio de Desempenho";
  }
  if (/(maquina|máquina|parada|quebra)/i.test(text)) {
    return "Confiabilidade de Equipamento";
  }
  return `Investigação de ${domain}`;
};

const inferProcess = (text: string, domain: string): string => {
  if (/(linha\s?\d+|montagem|producao|produção)/i.test(text)) {
    return "Linha de Produção";
  }
  if (/(cliente|atendimento|campo)/i.test(text)) {
    return "Operações com Cliente";
  }
  if (/(fornecedor|compras|supply)/i.test(text)) {
    return "Processo de Suprimentos";
  }
  return `Processo de ${domain}`;
};

const inferSuspectedDomains = (text: string, primaryDomain: string): string[] => {
  const domains = new Set<string>([primaryDomain]);

  if (/(qualidade|defeito|scrap|retrabalho|vazamento)/i.test(text)) {
    domains.add("Qualidade");
  }
  if (/(producao|produção|linha|processo|operacao|operação)/i.test(text)) {
    domains.add("Operações");
  }
  if (/(fornecedor|supply|logistica|logística|materia prima|matéria prima)/i.test(text)) {
    domains.add("Cadeia de Suprimentos");
  }
  if (/(maquina|máquina|parada|manutencao|manutenção)/i.test(text)) {
    domains.add("Manutenção");
  }
  if (/(engenharia|parametro|parâmetro|projeto)/i.test(text)) {
    domains.add("Engenharia");
  }

  return Array.from(domains).slice(0, 4);
};

const normalizeText = (rawResponse: string): string =>
  rawResponse.replace(/\s+/g, " ").trim();

const buildFallbackRequiredInformation = (text: string): string[] => {
  const questions: string[] = [
    "O problema ainda está ocorrendo ou foi um evento isolado?",
    "Em qual etapa do processo a falha é detectada pela primeira vez?",
  ];

  if (/(maquina|máquina|equipamento|linha|estacao|estação)/i.test(text)) {
    questions.push("Isso ocorre em todas as máquinas/estações ou apenas em equipamentos específicos?");
  } else {
    questions.push("Isso afeta todos os produtos/processos ou apenas modelos específicos?");
  }

  if (/(fornecedor|lote|batch|material|insumo)/i.test(text)) {
    questions.push("Houve troca recente de fornecedor, lote ou material antes do início do problema?");
  } else {
    questions.push("Houve alguma mudança recente antes do problema aparecer (material, software, manutenção, operador ou processo)?");
  }

  questions.push("Existe diferença mensurável entre casos afetados e não afetados?");
  questions.push("Qual evidência objetiva falta para aumentar a confiança na hipótese principal?");

  if (/(turno|noite|dia|manha|manhã|tarde)/i.test(text)) {
    questions.push("O comportamento muda entre turnos? Quais diferenças foram medidas?");
  }

  return Array.from(new Set(questions)).slice(0, 7);
};

export const tryParseOperationalObject = (value: unknown): SafeParseResult => {
  try {
    return {
      success: true,
      data: OperationalObjectSchema.parse(value),
    };
  } catch (error) {
    return {
      success: false,
      error: toError(error),
    };
  }
};

export const reconstructOperationalObjectFromText = (
  rawResponse: string,
  problemStatement: string
): OperationalObject => {
  const mergedText = `${problemStatement} ${normalizeText(rawResponse)}`.trim();
  const domain = inferDomain(mergedText);
  const category = inferCategory(mergedText, domain);
  const process = inferProcess(mergedText, domain);

  return {
    artifact: "OperationalObject",
    version: "1.0.0",
    problemStatement: problemStatement.trim(),
    domain,
    category,
    process,
    severity: inferSeverity(mergedText),
    urgency: inferUrgency(mergedText),
    impact: inferImpact(mergedText),
    suspectedDomains: inferSuspectedDomains(mergedText, domain),
    requiredInformation: buildFallbackRequiredInformation(mergedText),
    confidence: 0.55,
  };
};

export const validateOrRecoverOperationalObject = (
  rawResponse: string,
  problemStatement: string
): OperationalObject => {
  const parsed = parseJsonCandidate(rawResponse);

  if (parsed !== null) {
    const parsedResult = tryParseOperationalObject(parsed);
    if (parsedResult.success) {
      return parsedResult.data;
    }
  }

  const recovered = reconstructOperationalObjectFromText(rawResponse, problemStatement);
  return OperationalObjectSchema.parse(recovered);
};
