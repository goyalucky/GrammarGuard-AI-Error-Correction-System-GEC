import { useState, useCallback, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  GraduationCap,
  ArrowRight,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import {
  fetchGrammarTopics,
  fetchQuizQuestions,
  type GrammarTopic,
  type QuizQuestionItem,
} from '@/services/learningService';
import StatusBadge from '@/components/common/StatusBadge';

export default function GrammarLearning() {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ─── Topic cards state ────────────────────────────── */
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  /* ─── Quiz state ───────────────────────────────────── */
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answersLog, setAnswersLog] = useState<boolean[]>([]);

  useEffect(() => {
    Promise.all([fetchGrammarTopics(), fetchQuizQuestions()])
      .then(([fetchedTopics, fetchedQuiz]) => {
        setTopics(fetchedTopics);
        setQuizQuestions(fetchedQuiz);
      })
      .catch((err) => {
        console.error('Failed to load learning resources:', err);
        setError('Failed to fetch grammar topics and quiz from the knowledge base.');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleTopic = (id: string) => {
    setExpandedTopic((prev) => (prev === id ? null : id));
  };

  const question = quizQuestions[currentQ];

  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null || !question) return;
    const isCorrect = selectedAnswer === question.correctIndex;
    setSubmitted(true);
    setAnswersLog((prev) => [...prev, isCorrect]);
    if (isCorrect) setScore((s) => s + 1);
  }, [selectedAnswer, question]);

  const handleNext = useCallback(() => {
    if (currentQ + 1 >= quizQuestions.length) {
      setQuizFinished(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    }
  }, [currentQ, quizQuestions.length]);

  const handleRestart = useCallback(() => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setAnswersLog([]);
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Grammar Learning</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Explore rule explanations indexed from the Qdrant semantic knowledge base and test your comprehension.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Topics from Qdrant Knowledge Base */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Grammar Knowledge Base ({topics.length} Rules)</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const isExpanded = expandedTopic === topic.id;
            return (
              <div
                key={topic.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{topic.title}</span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="space-y-3 border-t border-gray-100 p-4">
                    <p className="text-sm text-gray-600">{topic.explanation}</p>
                    <div>
                      <p className="text-xs font-medium text-red-600">Common Mistake:</p>
                      <p className="mt-0.5 rounded-md bg-red-50/50 px-2 py-1 text-sm text-red-700 font-mono">
                        {topic.incorrectExample}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-emerald-600">Standard Form:</p>
                      <p className="mt-0.5 rounded-md bg-emerald-50/50 px-2 py-1 text-sm text-emerald-700 font-mono">
                        {topic.correctedExample}
                      </p>
                    </div>
                    {topic.practiceTip && (
                      <div className="flex items-start gap-1.5 rounded-md bg-amber-50/60 p-2.5 text-xs text-amber-800 border border-amber-200/50">
                        <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-900">Pedagogical Tip: </span>
                          <span>{topic.practiceTip}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Interactive Quiz */}
      {quizQuestions.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-semibold text-gray-900">Interactive Practice Quiz</h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500">
                Question {Math.min(currentQ + 1, quizQuestions.length)} of {quizQuestions.length}
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-700">
                Score: {score}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{
                width: `${((quizFinished ? quizQuestions.length : currentQ) / quizQuestions.length) * 100}%`,
              }}
            />
          </div>

          {quizFinished ? (
            /* Results screen */
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <GraduationCap className="h-8 w-8" />
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {score} / {quizQuestions.length}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {score === quizQuestions.length
                  ? 'Outstanding! Full mastery across all tested rules.'
                  : score >= quizQuestions.length / 2
                    ? 'Good effort! Review the rules above to reinforce weaker areas.'
                    : 'Review the explanations in the knowledge base cards and retry.'}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {answersLog.map((isCorrect, idx) => (
                  <span
                    key={idx}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                      isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                ))}
              </div>
              <button
                onClick={handleRestart}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <RotateCcw className="h-4 w-4" />
                Restart Quiz
              </button>
            </div>
          ) : question ? (
            /* Question screen */
            <div>
              <div className="mb-1">
                <StatusBadge status="in_progress" label={question.topic} />
              </div>
              <p className="mb-4 text-base font-medium text-gray-900">{question.question}</p>

              <div className="space-y-2">
                {question.choices.map((choice, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrectAnswer = idx === question.correctIndex;

                  let buttonClass = 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/30';

                  if (submitted) {
                    if (isCorrectAnswer) {
                      buttonClass = 'border-emerald-300 bg-emerald-50 text-emerald-800';
                    } else if (isSelected) {
                      buttonClass = 'border-red-300 bg-red-50 text-red-800';
                    } else {
                      buttonClass = 'border-gray-200 bg-white text-gray-400';
                    }
                  } else if (isSelected) {
                    buttonClass = 'border-indigo-400 bg-indigo-50 text-indigo-800';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !submitted && setSelectedAnswer(idx)}
                      disabled={submitted}
                      className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${buttonClass}`}
                    >
                      <span>{choice}</span>
                      {submitted && isCorrectAnswer && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      )}
                      {submitted && isSelected && !isCorrectAnswer && (
                        <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback box */}
              {submitted && (
                <div
                  className={`mt-4 rounded-lg p-3 text-sm ${
                    selectedAnswer === question.correctIndex
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <p className="font-medium">
                    {selectedAnswer === question.correctIndex ? 'Correct!' : 'Incorrect.'}
                  </p>
                  <p className="mt-1 text-sm">{question.explanation}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 flex gap-3">
                {!submitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    {currentQ + 1 >= quizQuestions.length ? 'Finish Quiz' : 'Next Question'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {!submitted && (
                  <button
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restart
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}