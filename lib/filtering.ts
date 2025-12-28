/**
 * Pre-filter comments to identify questions and confusion signals
 * This runs BEFORE AI to reduce costs
 */

const QUESTION_STARTERS = [
  'how',
  'why',
  'what',
  'when',
  'where',
  'who',
  'which',
  'can',
  'could',
  'would',
  'should',
  'is',
  'are',
  'does',
  'do',
  'did',
  'will',
  'won\'t',
  'can\'t',
  'doesn\'t',
  'isn\'t',
  'aren\'t',
];

const CONFUSION_SIGNALS = [
  'doesn\'t work',
  'not working',
  'won\'t work',
  'can\'t get',
  'stuck',
  'error',
  'failed',
  'problem',
  'issue',
  'help',
  'confused',
  'don\'t understand',
  'unclear',
  'not sure',
  'wondering',
  'anyone know',
  'somebody help',
  'please help',
  'need help',
];

export interface FilteredComment {
  text: string;
  isQuestion: boolean;
  hasConfusion: boolean;
  score: number;
}

/**
 * Determine if a comment should be kept for analysis
 */
export function shouldKeepComment(text: string): boolean {
  const normalized = text.toLowerCase().trim();

  // Skip very short comments
  if (normalized.length < 10) return false;

  // Skip common noise
  const noisePatterns = [
    /^first$/i,
    /^nice$/i,
    /^great$/i,
    /^love it$/i,
    /^good video$/i,
    /^awesome$/i,
    /^cool$/i,
    /^thanks$/i,
    /^thank you$/i,
    /^\d+$/,  // Just numbers
    /^[👍👎❤️😂😮😢😡🔥💯✨]+$/,  // Just emojis
  ];

  for (const pattern of noisePatterns) {
    if (pattern.test(normalized)) return false;
  }

  // Keep if contains a question mark
  if (text.includes('?')) return true;

  // Keep if starts with question words
  for (const starter of QUESTION_STARTERS) {
    if (normalized.startsWith(starter + ' ')) return true;
  }

  // Keep if contains confusion signals
  for (const signal of CONFUSION_SIGNALS) {
    if (normalized.includes(signal)) return true;
  }

  return false;
}

/**
 * Analyze a comment and return metadata
 */
export function analyzeComment(text: string): FilteredComment {
  const normalized = text.toLowerCase();
  const hasQuestionMark = text.includes('?');
  
  let isQuestion = hasQuestionMark;
  if (!isQuestion) {
    for (const starter of QUESTION_STARTERS) {
      if (normalized.startsWith(starter + ' ')) {
        isQuestion = true;
        break;
      }
    }
  }

  let hasConfusion = false;
  for (const signal of CONFUSION_SIGNALS) {
    if (normalized.includes(signal)) {
      hasConfusion = true;
      break;
    }
  }

  // Calculate relevance score
  let score = 0;
  if (hasQuestionMark) score += 3;
  if (isQuestion) score += 2;
  if (hasConfusion) score += 2;
  if (text.length > 50) score += 1;
  if (text.length > 100) score += 1;

  return {
    text,
    isQuestion,
    hasConfusion,
    score,
  };
}

/**
 * Filter an array of comments
 */
export function filterComments(comments: string[]): string[] {
  return comments.filter(shouldKeepComment);
}

/**
 * Filter and score comments
 */
export function filterAndScoreComments(comments: string[]): FilteredComment[] {
  return comments
    .filter(shouldKeepComment)
    .map(analyzeComment)
    .sort((a, b) => b.score - a.score);
}