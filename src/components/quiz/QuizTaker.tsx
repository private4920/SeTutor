"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { GeneratedQuiz, QuizQuestion, QuizAnswer, QuizResult, calculateQuizResult } from './mockQuizGenerator';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export interface QuizTakerProps {
  quiz: GeneratedQuiz;
  onComplete: (result: QuizResult) => void;
  onBack?: () => void;
}

type QuestionStatus = 'unanswered' | 'answered' | 'current';

export function QuizTaker({ quiz, onComplete, onBack }: QuizTakerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [startTime] = useState<number>(Date.now());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = answers.size;

  // Timer logic - only start once on mount if there's a time limit
  useEffect(() => {
    if (quiz.timeLimit === null) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz.timeLimit]);

  // Auto-submit when time runs out - use ref to avoid dependency issues
  const handleSubmitRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    handleSubmitRef.current = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const quizAnswers: QuizAnswer[] = quiz.questions.map(q => ({
        questionId: q.id,
        answer: answers.get(q.id) || '',
      }));
      
      const result = calculateQuizResult(quiz, quizAnswers, timeTaken);
      onComplete(result);
    };
  }, [quiz, answers, startTime, onComplete]);

  useEffect(() => {
    if (timeRemaining === 0 && handleSubmitRef.current) {
      handleSubmitRef.current();
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (timeRemaining === null) return 'text-gray-600';
    if (timeRemaining <= 60) return 'text-red-600 animate-pulse';
    if (timeRemaining <= 300) return 'text-orange-500';
    return 'text-gray-600';
  };

  const getQuestionStatus = (index: number): QuestionStatus => {
    if (index === currentIndex) return 'current';
    const question = quiz.questions[index];
    if (question && answers.has(question.id)) return 'answered';
    return 'unanswered';
  };

  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, answer);
      return newAnswers;
    });
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  const handleGoToQuestion = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleSubmit = useCallback(() => {
    if (handleSubmitRef.current) {
      handleSubmitRef.current();
    }
  }, []);

  const handleSubmitClick = useCallback(() => {
    const unansweredCount = totalQuestions - answeredCount;
    if (unansweredCount > 0) {
      setShowSubmitConfirm(true);
    } else {
      handleSubmit();
    }
  }, [totalQuestions, answeredCount, handleSubmit]);


  // Render answer input based on question type
  const renderAnswerInput = (question: QuizQuestion) => {
    const currentAnswer = answers.get(question.id) || '';

    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      return (
        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <label
              key={index}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                currentAnswer === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={currentAnswer === option}
                onChange={() => handleAnswerChange(question.id, option)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      );
    }

    if (question.type === 'short-answer') {
      return (
        <div>
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-2 text-xs text-gray-500">
            Enter your answer. Spelling and capitalization are flexible.
          </p>
        </div>
      );
    }

    return null;
  };

  const getStatusColor = (status: QuestionStatus): string => {
    switch (status) {
      case 'current':
        return 'bg-blue-600 text-white';
      case 'answered':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'unanswered':
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
      {/* Main content area - Requirements 1.3, 6.4: Responsive design */}
      <div className="flex-1 space-y-4 sm:space-y-6">
        {/* Header with timer and progress */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 p-1.5 -ml-1.5 text-gray-600 hover:text-gray-900 active:scale-95"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{quiz.name}</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {answeredCount} of {totalQuestions} answered
              </p>
            </div>
          </div>
          
          {/* Timer display */}
          {timeRemaining !== null && (
            <div className={`flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 ${
              timeRemaining <= 60 ? 'bg-red-50' : timeRemaining <= 300 ? 'bg-orange-50' : 'bg-gray-50'
            }`}>
              <svg className={`h-5 w-5 ${getTimerColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-base sm:text-lg font-mono font-semibold ${getTimerColor()}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Question display */}
        {currentQuestion && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {/* Question number and type indicator */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                currentQuestion.type === 'multiple-choice' 
                  ? 'bg-blue-100 text-blue-700'
                  : currentQuestion.type === 'true-false'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {currentQuestion.type === 'multiple-choice' && 'Multiple Choice'}
                {currentQuestion.type === 'true-false' && 'True / False'}
                {currentQuestion.type === 'short-answer' && 'Short Answer'}
              </span>
            </div>

            {/* Question text */}
            <h3 className="mb-6 text-xl font-medium text-gray-900">
              {currentQuestion.question}
            </h3>

            {/* Answer options */}
            {renderAnswerInput(currentQuestion)}
          </div>
        )}


        {/* Navigation buttons - touch-friendly on mobile */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1 sm:gap-2 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors active:scale-95 ${
              currentIndex === 0
                ? 'cursor-not-allowed text-gray-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>

          <button
            onClick={handleSubmitClick}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-purple-700 active:scale-[0.98]"
          >
            <svg className="h-4 sm:h-5 w-4 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Submit Quiz</span>
            <span className="sm:hidden">Submit</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === totalQuestions - 1}
            className={`flex items-center gap-1 sm:gap-2 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors active:scale-95 ${
              currentIndex === totalQuestions - 1
                ? 'cursor-not-allowed text-gray-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span>Next</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Question navigation sidebar - collapsible on mobile */}
      <div className="lg:w-64">
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm lg:sticky lg:top-4">
          <h3 className="mb-3 sm:mb-4 text-sm font-semibold text-gray-900">Questions</h3>
          
          {/* Status legend - compact on mobile */}
          <div className="mb-3 sm:mb-4 flex flex-wrap gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-blue-600"></span>
              <span className="text-gray-600">Current</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">Answered</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-gray-300"></span>
              <span className="text-gray-600">Unanswered</span>
            </div>
          </div>

          {/* Question grid - touch-friendly buttons */}
          <div className="grid grid-cols-6 sm:grid-cols-5 gap-1.5 sm:gap-2">
            {quiz.questions.map((question, index) => {
              const status = getQuestionStatus(index);
              return (
                <button
                  key={question.id}
                  onClick={() => handleGoToQuestion(index)}
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border text-xs sm:text-sm font-medium transition-all active:scale-95 ${getStatusColor(status)}`}
                  title={`Question ${index + 1} - ${status}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Progress summary */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">
                {Math.round((answeredCount / totalQuestions) * 100)}%
              </span>
            </div>
            <div className="mt-2 h-1.5 sm:h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-1.5 sm:h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation dialog */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title="Submit Quiz?"
        message={`You have ${totalQuestions - answeredCount} unanswered question${totalQuestions - answeredCount !== 1 ? 's' : ''}. Are you sure you want to submit?`}
        confirmLabel="Submit Anyway"
        cancelLabel="Continue Quiz"
        variant="warning"
        onConfirm={() => {
          setShowSubmitConfirm(false);
          handleSubmit();
        }}
        onCancel={() => setShowSubmitConfirm(false)}
      />
    </div>
  );
}
