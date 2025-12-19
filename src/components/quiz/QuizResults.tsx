"use client";

import { useState, useMemo } from 'react';
import { GeneratedQuiz, QuizResult, QuizQuestion } from './mockQuizGenerator';

export interface QuizResultsProps {
  quiz: GeneratedQuiz;
  result: QuizResult;
  onRetake: () => void;
  onSaveResults?: () => void;
  onShare?: () => void;
  onBack?: () => void;
}

type ViewMode = 'summary' | 'review';

interface QuestionReviewProps {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
  questionNumber: number;
}

function QuestionReview({ question, userAnswer, isCorrect, questionNumber }: QuestionReviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`rounded-lg border-2 p-4 transition-all ${
      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {questionNumber}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              question.type === 'multiple-choice' 
                ? 'bg-blue-100 text-blue-700'
                : question.type === 'true-false'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {question.type === 'multiple-choice' && 'Multiple Choice'}
              {question.type === 'true-false' && 'True/False'}
              {question.type === 'short-answer' && 'Short Answer'}
            </span>
            {isCorrect ? (
              <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Correct
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-red-700">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Incorrect
              </span>
            )}
          </div>
          <p className="text-gray-900 font-medium">{question.question}</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 rounded-lg p-2 text-gray-500 hover:bg-white hover:text-gray-700"
        >
          <svg className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          {/* User's Answer */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Your Answer</p>
            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {userAnswer || <span className="italic text-gray-400">No answer provided</span>}
            </p>
          </div>

          {/* Correct Answer (only show if incorrect) */}
          {!isCorrect && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Correct Answer</p>
              <p className="text-sm text-green-700 font-medium">{question.correctAnswer}</p>
            </div>
          )}

          {/* Explanation */}
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Explanation</p>
            <p className="text-sm text-gray-700">{question.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Circular progress component for score visualization
function CircularProgress({ percentage, size = 160 }: { percentage: number; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return { stroke: '#22c55e', bg: '#dcfce7' }; // green
    if (percentage >= 60) return { stroke: '#3b82f6', bg: '#dbeafe' }; // blue
    if (percentage >= 40) return { stroke: '#f59e0b', bg: '#fef3c7' }; // amber
    return { stroke: '#ef4444', bg: '#fee2e2' }; // red
  };

  const colors = getColor();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.bg}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-gray-900">{percentage}%</span>
        <span className="text-sm text-gray-500">Score</span>
      </div>
    </div>
  );
}

export function QuizResults({ quiz, result, onRetake, onSaveResults, onShare, onBack }: QuizResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Calculate performance breakdown by question type
  const performanceBreakdown = useMemo(() => {
    const breakdown: Record<string, { correct: number; total: number }> = {};
    
    quiz.questions.forEach((question) => {
      const answer = result.answers.find(a => a.questionId === question.id);
      const type = question.type;
      
      if (!breakdown[type]) {
        breakdown[type] = { correct: 0, total: 0 };
      }
      breakdown[type].total++;
      if (answer?.isCorrect) {
        breakdown[type].correct++;
      }
    });

    return breakdown;
  }, [quiz.questions, result.answers]);

  const correctCount = result.answers.filter(a => a.isCorrect).length;
  const incorrectCount = result.totalQuestions - correctCount;

  // Format time taken
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins}m ${secs}s`;
  };

  // Get grade label
  const getGradeLabel = (score: number): { label: string; color: string } => {
    if (score >= 90) return { label: 'Excellent!', color: 'text-green-600' };
    if (score >= 80) return { label: 'Great Job!', color: 'text-green-600' };
    if (score >= 70) return { label: 'Good Work!', color: 'text-blue-600' };
    if (score >= 60) return { label: 'Not Bad!', color: 'text-blue-600' };
    if (score >= 50) return { label: 'Keep Practicing', color: 'text-amber-600' };
    return { label: 'Needs Improvement', color: 'text-red-600' };
  };

  const grade = getGradeLabel(result.score);

  const handleShare = async () => {
    const shareText = `I scored ${result.score}% on "${quiz.name}"! ${correctCount}/${result.totalQuestions} correct answers.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quiz Results',
          text: shareText,
        });
      } catch {
        // User cancelled or share failed, copy to clipboard instead
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
    onShare?.();
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'multiple-choice': return 'Multiple Choice';
      case 'true-false': return 'True/False';
      case 'short-answer': return 'Short Answer';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
            <p className="text-sm text-gray-500">{quiz.name}</p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setViewMode('summary')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'summary'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode('review')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'review'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Review Answers
          </button>
        </div>
      </div>


      {viewMode === 'summary' ? (
        <>
          {/* Score Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Circular Progress */}
              <div className="flex-shrink-0">
                <CircularProgress percentage={result.score} />
              </div>

              {/* Score Details */}
              <div className="flex-1 text-center md:text-left">
                <h2 className={`text-3xl font-bold ${grade.color}`}>{grade.label}</h2>
                <p className="mt-2 text-gray-600">
                  You answered {correctCount} out of {result.totalQuestions} questions correctly.
                </p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{correctCount}</p>
                      <p className="text-xs text-gray-500">Correct</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                      <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{incorrectCount}</p>
                      <p className="text-xs text-gray-500">Incorrect</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatTime(result.timeTaken)}</p>
                      <p className="text-xs text-gray-500">Time Taken</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Question Type</h3>
            <div className="space-y-4">
              {Object.entries(performanceBreakdown).map(([type, stats]) => {
                const percentage = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{getTypeLabel(type)}</span>
                      <span className="text-sm text-gray-500">
                        {stats.correct}/{stats.total} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{result.totalQuestions}</p>
              <p className="text-sm text-gray-500">Total Questions</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              <p className="text-sm text-gray-500">Correct</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
              <p className="text-sm text-gray-500">Incorrect</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{formatTime(result.timeTaken)}</p>
              <p className="text-sm text-gray-500">Time Taken</p>
            </div>
          </div>
        </>
      ) : (
        /* Review Mode */
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Click on any question to expand and see the explanation.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  {correctCount} Correct
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  {incorrectCount} Incorrect
                </span>
              </div>
            </div>
          </div>

          {quiz.questions.map((question, index) => {
            const answer = result.answers.find(a => a.questionId === question.id);
            return (
              <QuestionReview
                key={question.id}
                question={question}
                userAnswer={answer?.answer || ''}
                isCorrect={answer?.isCorrect || false}
                questionNumber={index + 1}
              />
            );
          })}
        </div>
      )}


      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={onRetake}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retake Quiz
        </button>

        {onSaveResults && (
          <button
            onClick={onSaveResults}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Results
          </button>
        )}

        <button
          onClick={handleShare}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all relative"
        >
          {shareSuccess ? (
            <>
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Score
            </>
          )}
        </button>
      </div>
    </div>
  );
}
