export interface LearningRecord {
  artifact: "LearningRecord";
  version: string;
  decisionPackageId: string;
  outcomes: string[];
  lessonsLearned: string[];
  followUpActions: string[];
  confidence: number;
}