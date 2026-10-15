// frontend/src/services/learningService.ts

export interface GrammarTopic {
  id: string;
  category: string;
  title: string;
  explanation: string;
  incorrectExample: string;
  correctedExample: string;
  practiceTip: string;
  tags?: string[];
}

export interface QuizQuestionItem {
  id: string;
  topic: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function fetchGrammarTopics(): Promise<GrammarTopic[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/learning/topics`);
  if (!response.ok) {
    throw new Error('Failed to fetch grammar topics');
  }
  return response.json();
}

export async function fetchQuizQuestions(): Promise<QuizQuestionItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/learning/quiz`);
  if (!response.ok) {
    throw new Error('Failed to fetch quiz questions');
  }
  return response.json();
}