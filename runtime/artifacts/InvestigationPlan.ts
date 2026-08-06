export interface InvestigationPlan {
  artifact: "InvestigationPlan";
  version: string;
  operationalObjectId: string;
  objectives: string[];
  workstreams: string[];
  suspectedDomains: string[];
  requiredInformation: string[];
  confidence: number;
}