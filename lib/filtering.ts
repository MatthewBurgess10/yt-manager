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

const FEEDBACK_SIGNALS = [
  'wish', 'hope', 'please', 'love', 'hate', 'bad', 'great', 'amazing', 'terrible', 'worst', 'best', 'add', 'fix', 'change', 'stop', 'start', 'more of'
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

  // 1. Length Check: Too short = spam, Too long = rant (maybe keep long ones?)
  if (normalized.length < 15) return false; 
  if (normalized.length > 1000) return false; // Skip massive essays to save tokens

  // 2. Spam Filters (URLs, timestamps only, emojis only)
  if (normalized.includes('http') || normalized.includes('.com')) return false;
  if (/^[\d: ]+$/.test(normalized)) return false; // "10:02"
  
  // 3. Keep if Question
  if (text.includes('?')) return true;
  for (const start of QUESTION_STARTERS) {
    if (normalized.startsWith(start + ' ')) return true;
  }

  // 4. Keep if Strong Feedback
  for (const signal of FEEDBACK_SIGNALS) {
    if (normalized.includes(signal)) return true;
  }

  // 5. Keep if Confusion
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