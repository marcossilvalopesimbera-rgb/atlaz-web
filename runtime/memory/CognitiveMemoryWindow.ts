import type { AdaptiveInvestigationState } from '../artifacts/AdaptiveInvestigationState';

export interface QuestionCandidate {
  id: string;
  question: string;
  uncertaintyTarget?: string;
}

export default class CognitiveMemoryWindow {
  public shouldAskQuestion(candidate: QuestionCandidate, state: AdaptiveInvestigationState): boolean {
    const normalizedCandidate = candidate.question.toLowerCase();
    const duplicate = state.history.some((entry) => entry.questionAsked.toLowerCase() === normalizedCandidate);
    const openGap = state.remainingInformationGaps.some((gap) => gap.toLowerCase().includes((candidate.uncertaintyTarget ?? '').toLowerCase()));

    return !duplicate && openGap;
  }
}
