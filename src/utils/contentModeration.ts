// Common variations and l33t speak replacements
const LEET_SPEAK_MAP: Record<string, string[]> = {
  a: ['a', '@', '4', 'α', 'д'],
  e: ['e', '3', 'є', 'е'],
  i: ['i', '1', '!', 'í', 'і'],
  o: ['o', '0', 'о', 'θ'],
  s: ['s', '5', '$', 'ѕ'],
  t: ['t', '7', '+', 'т'],
} as const;

// Function to generate variations of a word using l33t speak
const generateWordVariations = (word: string): string[] => {
  const variations: string[] = [word];

  // Generate all possible combinations of leetspeak substitutions
  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase();
    const replacements = LEET_SPEAK_MAP[char];

    if (replacements) {
      const newVariations: string[] = [];
      for (const variation of variations) {
        for (const replacement of replacements) {
          newVariations.push(variation.slice(0, i) + replacement + variation.slice(i + 1));
        }
      }
      variations.push(...newVariations);
    }
  }

  return [...new Set(variations)]; // Remove duplicates
};

// List of banned words and their variations
const BANNED_WORDS = [
  'fuck',
  'shit',
  'ass',
  'bitch',
  'dick',
  'pussy',
  'cock',
  'whore',
  'slut',
  'bastard',
  'cunt',
  'nigger',
  'faggot',
  'retard',
  // Add more banned words as needed
].flatMap((word) => generateWordVariations(word));

// Function to check if text contains any banned words
export const containsBannedWords = (text: string): boolean => {
  const normalizedText = text.toLowerCase().replace(/\s+/g, '');

  // Check for exact matches and variations
  return BANNED_WORDS.some((word) => normalizedText.includes(word.toLowerCase()));
};

// Function to check for spam patterns
export const containsSpamPatterns = (text: string): boolean => {
  // Check for repeated characters (more than 3 times)
  if (/(.)\1{3,}/.test(text)) {
    return true;
  }

  // Check for repeated words
  const words = text.toLowerCase().split(/\s+/);
  const wordCounts = new Map<string, number>();
  for (const word of words) {
    const count = (wordCounts.get(word) || 0) + 1;
    if (count > 2) {
      // More than 2 occurrences of the same word
      return true;
    }
    wordCounts.set(word, count);
  }

  return false;
};

// Function to check for suspicious patterns
export const containsSuspiciousPatterns = (text: string): boolean => {
  // Check for potential attempts to bypass filters
  const suspiciousPatterns = [
    /\b[a-zA-Z]\s+[a-zA-Z]\s+[a-zA-Z]\b/, // Spaced out letters
    /(.)\1{4,}/, // Excessive character repetition
    /[!?.,]{3,}/, // Excessive punctuation
    /\s{3,}/, // Excessive spacing
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(text));
};
