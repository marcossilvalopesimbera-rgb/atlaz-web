export interface HypothesisSet {
  artifact: "HypothesisSet";
  version: string;
  operationalObjectId: string;
  hypotheses: {
    id: string;
    statement: string;
    rationale: string;
    confidence: number;
  }[];
  confidence: number;
}