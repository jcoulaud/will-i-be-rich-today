import { PerspectiveResponse } from '@/types/fortune';

const PERSPECTIVE_API_URL = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

// Adjust these thresholds to make the filter more or less strict
const CONTENT_THRESHOLDS = {
  TOXICITY: 0.7, // General toxicity
  SEVERE_TOXICITY: 0.5, // More severe toxic content
  PROFANITY: 0.8, // Swear words and profane content
  SEXUALLY_EXPLICIT: 0.8, // Sexual content
  THREAT: 0.5, // Threatening content
  INSULT: 0.7, // Insulting content
} as const;

export const checkToxicity = async (text: string): Promise<PerspectiveResponse> => {
  try {
    const response = await fetch(`${PERSPECTIVE_API_URL}?key=${process.env.PERSPECTIVE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: { text },
        languages: ['en'],
        requestedAttributes: {
          TOXICITY: {},
          SEVERE_TOXICITY: {},
          PROFANITY: {},
          SEXUALLY_EXPLICIT: {},
          THREAT: {},
          INSULT: {},
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to check content');
    }

    const data = await response.json();

    // Check each attribute against its threshold
    for (const [attribute, threshold] of Object.entries(CONTENT_THRESHOLDS)) {
      const score = data.attributeScores[attribute]?.summaryScore?.value;
      if (score && score > threshold) {
        return {
          success: false,
          error: `Content was flagged for ${attribute.toLowerCase().replace('_', ' ')}`,
          data,
        };
      }
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
