export interface OrganizationalChangePackage {
  artifact: "OrganizationalChangePackage";
  version: string;
  learningRecordId: string;
  changeSummary: string;
  stakeholders: string[];
  rolloutPlan: string[];
  risks: string[];
  confidence: number;
}