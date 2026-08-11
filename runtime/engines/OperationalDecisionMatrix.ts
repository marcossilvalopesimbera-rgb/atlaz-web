import { InvestigationPlan } from "../artifacts/InvestigationPlan";
import { AdaptiveInvestigationState } from "../artifacts/AdaptiveInvestigationState";
import { DecisionPackage } from "../artifacts/DecisionPackage";

export default class OperationalDecisionMatrix {
  constructor() {}

  public evaluate(state?: AdaptiveInvestigationState, decisionPackage?: DecisionPackage): InvestigationPlan {
    const objectives = [
      "Reduzir incerteza com evidências objetivas",
      "Mitigar risco operacional imediato",
      "Aumentar rastreabilidade de decisão",
    ];

    const workstreams = [
      "Coleta e validação de evidências",
      "Teste de hipóteses com contradições",
      "Consolidação de recomendação operacional",
    ];

    if (decisionPackage?.recommendedOptionId) {
      workstreams.push(`Executar opção recomendada: ${decisionPackage.recommendedOptionId}`);
    }

    return {
      artifact: "InvestigationPlan",
      version: "1.1.0",
      operationalObjectId: state?.investigationId ?? "unavailable",
      objectives,
      workstreams,
      suspectedDomains: state?.operationalObject.suspectedDomains ?? [],
      requiredInformation: state?.remainingInformationGaps ?? [],
      confidence: state?.currentConfidence ?? 0,
    };
  }
}