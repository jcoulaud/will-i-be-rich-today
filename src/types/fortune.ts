export interface FortuneResponse {
  text: string;
  createdAt: string;
  isDefault?: boolean;
}

interface AttributeScore {
  summaryScore: {
    value: number;
  };
}

export interface ToxicityResponse {
  attributeScores: {
    TOXICITY: AttributeScore;
    SEVERE_TOXICITY: AttributeScore;
    PROFANITY: AttributeScore;
    SEXUALLY_EXPLICIT: AttributeScore;
    THREAT: AttributeScore;
    INSULT: AttributeScore;
    [key: string]: AttributeScore;
  };
}

export interface PerspectiveResponse {
  success: boolean;
  data?: ToxicityResponse;
  error?: string;
}
