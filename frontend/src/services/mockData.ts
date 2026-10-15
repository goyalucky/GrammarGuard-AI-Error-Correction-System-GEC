import type {
  ActivityRecord,
  CorrectionResult,
  ErrorCategory,
  GrammarError,
} from '@/types/correction';

/**
 * Mock correction examples — keyed by the exact input string.
 * The mock service looks up these entries to produce deterministic,
 * explainable results for the demo workspace.
 */
interface MockCorrectionEntry {
  correctedText: string;
  errors: Omit<GrammarError, 'id' | 'startIndex' | 'endIndex'>[];
}

const mockCorrections: Record<string, MockCorrectionEntry> = {
  'She have completed the work yesterday.': {
    correctedText: 'She has completed the work yesterday.',
    errors: [
      {
        originalText: 'She have',
        correctedText: 'She has',
        category: 'subject_verb_agreement',
        explanation:
          'The third-person singular pronoun "She" requires the verb "has", not "have".',
        severity: 'high',
      },
      {
        originalText: 'completed the work yesterday',
        correctedText: 'completed the work yesterday',
        category: 'verb_tense',
        explanation:
          'When using "yesterday", the simple past ("completed") is appropriate. Consider using "She completed the work yesterday" for more natural phrasing.',
        severity: 'low',
      },
    ],
  },
  "He don't likes playing cricket.": {
    correctedText: "He doesn't like playing cricket.",
    errors: [
      {
        originalText: "He don't",
        correctedText: "He doesn't",
        category: 'subject_verb_agreement',
        explanation:
          'Third-person singular "He" requires "doesn\'t" (does not), not "don\'t" (do not).',
        severity: 'high',
      },
      {
        originalText: 'likes',
        correctedText: 'like',
        category: 'verb_tense',
        explanation:
          'After the auxiliary "doesn\'t", the main verb takes the base form "like", not "likes".',
        severity: 'high',
      },
    ],
  },
  'They was going to school when it start raining.': {
    correctedText: 'They were going to school when it started raining.',
    errors: [
      {
        originalText: 'They was',
        correctedText: 'They were',
        category: 'subject_verb_agreement',
        explanation:
          'The plural subject "They" requires the plural verb "were", not "was".',
        severity: 'high',
      },
      {
        originalText: 'it start',
        correctedText: 'it started',
        category: 'verb_tense',
        explanation:
          'The past continuous "was going" pairs with the simple past "started" to describe an interrupted action.',
        severity: 'high',
      },
    ],
  },
  'I am working here since two years.': {
    correctedText: 'I have been working here for two years.',
    errors: [
      {
        originalText: 'am working',
        correctedText: 'have been working',
        category: 'verb_tense',
        explanation:
          '"Since" and "for" with a duration up to the present require the present perfect continuous tense.',
        severity: 'high',
      },
      {
        originalText: 'since two years',
        correctedText: 'for two years',
        category: 'prepositions',
        explanation:
          '"Since" is used with a point in time (since 2020); "for" is used with a duration (for two years).',
        severity: 'medium',
      },
    ],
  },
};

export interface MockCorrectionMatch {
  correctedText: string;
  errors: Omit<GrammarError, 'id' | 'startIndex' | 'endIndex'>[];
}

export function findMockCorrection(text: string): MockCorrectionMatch | null {
  const normalized = text.trim();
  if (mockCorrections[normalized]) {
    return mockCorrections[normalized];
  }
  return null;
}

/* ─── Analytics mock data ─────────────────────────────────────── */

export const correctionsOverTimeData = [
  { date: 'Jan', corrections: 12, errors: 28 },
  { date: 'Feb', corrections: 19, errors: 41 },
  { date: 'Mar', corrections: 25, errors: 52 },
  { date: 'Apr', corrections: 31, errors: 67 },
  { date: 'May', corrections: 28, errors: 58 },
  { date: 'Jun', corrections: 35, errors: 72 },
  { date: 'Jul', corrections: 42, errors: 85 },
  { date: 'Aug', corrections: 38, errors: 79 },
  { date: 'Sep', corrections: 45, errors: 91 },
];

export const errorCategoryData: { category: ErrorCategory; count: number; label: string }[] = [
  { category: 'subject_verb_agreement', count: 34, label: 'Subject–Verb Agreement' },
  { category: 'verb_tense', count: 28, label: 'Verb Tense' },
  { category: 'articles', count: 19, label: 'Articles' },
  { category: 'prepositions', count: 22, label: 'Prepositions' },
  { category: 'punctuation', count: 14, label: 'Punctuation' },
  { category: 'word_order', count: 8, label: 'Word Order' },
];

export const frequentMistakesData = [
  { mistake: 'Subject–Verb Agreement', count: 34 },
  { mistake: 'Verb Tense', count: 28 },
  { mistake: 'Prepositions', count: 22 },
  { mistake: 'Articles', count: 19 },
  { mistake: 'Punctuation', count: 14 },
];

export const progressData = [
  { month: 'Jan', score: 62 },
  { month: 'Feb', score: 65 },
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 72 },
  { month: 'May', score: 75 },
  { month: 'Jun', score: 78 },
  { month: 'Jul', score: 81 },
  { month: 'Aug', score: 83 },
  { month: 'Sep', score: 86 },
];

/* ─── Dashboard mock data ─────────────────────────────────────── */

export const dashboardStats = {
  totalCorrections: 275,
  grammarErrorsDetected: 532,
  writingSessions: 48,
  averageQuality: 87,
};

export const recentActivityRecords: ActivityRecord[] = [
  {
    id: 'act-001',
    title: 'Cover letter — Senior Analyst role',
    date: '2025-10-12',
    errorsDetected: 6,
    status: 'completed',
    type: 'correction',
  },
  {
    id: 'act-002',
    title: 'Research paper abstract review',
    date: '2025-10-11',
    errorsDetected: 12,
    status: 'completed',
    type: 'document_review',
  },
  {
    id: 'act-003',
    title: 'Email to prospective client',
    date: '2025-10-10',
    errorsDetected: 3,
    status: 'completed',
    type: 'correction',
  },
  {
    id: 'act-004',
    title: 'Grammar practice — Verb tenses',
    date: '2025-10-09',
    errorsDetected: 4,
    status: 'completed',
    type: 'practice',
  },
  {
    id: 'act-005',
    title: 'Blog post draft — Phase 1 review',
    date: '2025-10-08',
    errorsDetected: 9,
    status: 'in_progress',
    type: 'document_review',
  },
];

/* ─── Grammar Learning quiz bank ──────────────────────────────── */

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'Subject–Verb Agreement',
    question: 'Choose the correct sentence:',
    choices: [
      'The team are winning the match.',
      'The team is winning the match.',
      'The team were winning the match.',
      'The team have won the match.',
    ],
    correctIndex: 1,
    explanation:
      'In standard English, collective nouns like "team" take a singular verb: "The team is winning."',
  },
  {
    id: 'q2',
    topic: 'Verb Tense',
    question: 'Fill in the blank: "By the time we arrived, the movie ____ already started."',
    choices: ['has', 'had', 'have', 'was'],
    correctIndex: 1,
    explanation:
      'The past perfect "had started" is used for an action completed before another past action ("arrived").',
  },
  {
    id: 'q3',
    topic: 'Articles',
    question: 'Choose the correct sentence:',
    choices: [
      'I bought a umbrella from the store.',
      'I bought an umbrella from the store.',
      'I bought umbrella from the store.',
      'I bought the umbrella from a store.',
    ],
    correctIndex: 1,
    explanation:
      'Use "an" before words beginning with a vowel sound: "an umbrella".',
  },
  {
    id: 'q4',
    topic: 'Prepositions',
    question: 'Choose the correct sentence:',
    choices: [
      'I have been here since three hours.',
      'I have been here for three hours.',
      'I have been here from three hours.',
      'I have been here at three hours.',
    ],
    correctIndex: 1,
    explanation:
      '"For" is used with a duration of time (for three hours), while "since" marks a starting point (since 2 PM).',
  },
  {
    id: 'q5',
    topic: 'Punctuation',
    question: 'Which sentence is correctly punctuated?',
    choices: [
      'My friend who lives in Paris is visiting next week.',
      'My friend, who lives in Paris, is visiting next week.',
      'My friend who lives in Paris, is visiting next week.',
      'My friend, who lives in Paris is visiting next week.',
    ],
    correctIndex: 1,
    explanation:
      'Non-restrictive relative clauses are set off by commas on both sides: "My friend, who lives in Paris, is visiting."',
  },
  {
    id: 'q6',
    topic: 'Sentence Structure',
    question: 'Which sentence has the correct word order?',
    choices: [
      'Rarely I have seen such a beautiful sunset.',
      'I rarely have seen such a beautiful sunset.',
      'Rarely have I seen such a beautiful sunset.',
      'Have I rarely seen such a beautiful sunset.',
    ],
    correctIndex: 2,
    explanation:
      'When a negative adverb like "rarely" starts a sentence, inversion follows: "Rarely have I seen..."',
  },
];

export interface GrammarTopic {
  id: string;
  title: string;
  icon: string;
  explanation: string;
  incorrectExample: string;
  correctedExample: string;
  practiceQuestion: string;
}

export const grammarTopics: GrammarTopic[] = [
  {
    id: 'sva',
    title: 'Subject–Verb Agreement',
    icon: 'Users',
    explanation:
      'The verb must agree with the subject in number and person. Singular subjects take singular verbs; plural subjects take plural verbs.',
    incorrectExample: 'The list of items are on the desk.',
    correctedExample: 'The list of items is on the desk.',
    practiceQuestion: 'The subject is "list" (singular), so the verb must be "is", not "are".',
  },
  {
    id: 'tenses',
    title: 'Verb Tenses',
    icon: 'Clock',
    explanation:
      'Tenses indicate when an action occurs. Using the wrong tense can change the meaning or make a sentence grammatically incorrect.',
    incorrectExample: 'I have seen him yesterday.',
    correctedExample: 'I saw him yesterday.',
    practiceQuestion: '"Yesterday" requires the simple past "saw", not the present perfect.',
  },
  {
    id: 'articles',
    title: 'Articles',
    icon: 'BookOpen',
    explanation:
      'Articles ("a", "an", "the") clarify whether a noun is specific or general. "A" precedes consonant sounds; "an" precedes vowel sounds.',
    incorrectExample: 'She is a honest person.',
    correctedExample: 'She is an honest person.',
    practiceQuestion: '"Honest" starts with a vowel sound (the "h" is silent), so "an" is correct.',
  },
  {
    id: 'prepositions',
    title: 'Prepositions',
    icon: 'MapPin',
    explanation:
      'Prepositions show relationships of time, place, or direction. Choosing the wrong preposition is a common source of confusion.',
    incorrectExample: 'He is afraid from dogs.',
    correctedExample: 'He is afraid of dogs.',
    practiceQuestion: 'The correct collocation is "afraid of", not "afraid from".',
  },
  {
    id: 'punctuation',
    title: 'Punctuation',
    icon: 'Type',
    explanation:
      'Punctuation marks organise sentences and clarify meaning. Missing or misplaced commas can change how a sentence is read.',
    incorrectExample: "Let's eat grandma.",
    correctedExample: "Let's eat, grandma.",
    practiceQuestion: 'The comma after "eat" changes the meaning from cannibalism to an invitation.',
  },
  {
    id: 'structure',
    title: 'Sentence Structure',
    icon: 'GitBranch',
    explanation:
      'Sentence structure governs how words are ordered. English follows Subject–Verb–Object order, and inversion is used in questions and after certain adverbs.',
    incorrectExample: 'What you are doing?',
    correctedExample: 'What are you doing?',
    practiceQuestion: 'Questions require subject–auxiliary inversion: "are you", not "you are".',
  },
];
