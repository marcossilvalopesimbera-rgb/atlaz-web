import { Impact } from "../types/Impact";
import { Severity } from "../types/Severity";
import { Urgency } from "../types/Urgency";

export interface DecisionPackage {
  artifact: "DecisionPackage";
  version: string;
  operationalObjectId: string;
  options: {
    id: string;
    title: string;
    description: string;
    expectedSeverity: Severity;
    expectedUrgency: Urgency;
    expectedImpact: Impact;
  }[];
  recommendedOptionId: string;
  confidence: number;
}