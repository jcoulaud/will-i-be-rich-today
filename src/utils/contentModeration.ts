// Common variations and l33t speak replacements
const LEET_SPEAK_MAP: Record<string, string[]> = {
  a: ['a', '@', '4', 'α', 'д', 'а'],
  e: ['e', '3', 'є', 'е', 'ё'],
  i: ['i', '1', '!', 'í', 'і', 'ї'],
  o: ['o', '0', 'о', 'θ', 'ө'],
  s: ['s', '5', '$', 'ѕ', 'с'],
  t: ['t', '7', '+', 'т'],
  u: ['u', 'υ', 'ц', 'μ'],
  x: ['x', '×', 'х'],
  y: ['y', 'ү', 'у', 'γ'],
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
  // Profanity
  'fuck',
  'fuk',
  'fck',
  'stfu',
  'shit',
  'sh1t',
  'shyt',
  'ass',
  'arse',
  'bitch',
  'b1tch',
  'bytch',
  'dick',
  'd1ck',
  'dik',
  'dck',
  'pussy',
  'puss',
  'cock',
  'cok',
  'c0ck',
  'whore',
  'hoe',
  'slut',
  'bastard',
  'cunt',
  // Racial slurs
  'nigger',
  'nigga',
  'negro',
  'chink',
  'faggot',
  'fag',
  'retard',
  'tard',
  // Sexual terms
  'anal',
  'cum',
  'suck',
  'sucker',
  'sucking',
  'blow',
  'blowing',
  'penis',
  'vagina',
  'sex',
  'porn',
  // Common combinations
  'suckmy',
  'suckit',
  'blowme',
  'fuckme',
  'fucku',
  'fuku',
].flatMap((word) => generateWordVariations(word));

// Common word combinations to check
const BANNED_WORD_COMBINATIONS = [
  ['suck', 'dick'],
  ['suck', 'cock'],
  ['blow', 'job'],
  ['fuck', 'you'],
  ['fuck', 'off'],
  ['go', 'fuck'],
];

// Function to check if text contains any banned words
export const containsBannedWords = (text: string): boolean => {
  const normalizedText = text.toLowerCase().replace(/\s+/g, '');

  // Check for exact matches and variations
  if (BANNED_WORDS.some((word) => normalizedText.includes(word.toLowerCase()))) {
    return true;
  }

  // Check for word combinations (with or without spaces)
  return BANNED_WORD_COMBINATIONS.some(([word1, word2]) => {
    // Check with spaces
    if (text.toLowerCase().includes(`${word1} ${word2}`)) {
      return true;
    }
    // Check without spaces
    if (normalizedText.includes(`${word1}${word2}`)) {
      return true;
    }
    // Check reverse order with spaces
    if (text.toLowerCase().includes(`${word2} ${word1}`)) {
      return true;
    }
    // Check reverse order without spaces
    if (normalizedText.includes(`${word2}${word1}`)) {
      return true;
    }
    return false;
  });
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
    /[^\w\s]{4,}/, // Excessive symbols
    /(\w)\1{2,}\1*/, // Repeated letters (like 'fuuuck')
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(text));
};
