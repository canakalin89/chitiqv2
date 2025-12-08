export interface EvaluationScores {
  rapport: number;
  organisation: number;
  delivery: number;
  languageUse: number;
  creativity: number;
}

export interface EvaluationFeedback {
  rapport: string;
  organisation: string;
  delivery: string;
  languageUse: string;
  creativity: string;
  pronunciation: string;
  summary: string;
  transcription: string;
}

export interface EvaluationResultData {
  topic: string;
  scores: EvaluationScores;
  overallScore: number;
  feedback: EvaluationFeedback;
}

export interface Evaluation extends EvaluationResultData {
  id: string;
  date: string; // ISO 8601 format
}