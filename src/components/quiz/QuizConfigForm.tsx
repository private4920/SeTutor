"use client";

import { useState } from 'react';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface QuizConfig {
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: DifficultyLevel;
  timeLimit: number | null; // null means no time limit
}

export interface QuizConfigFormProps {
  selectedDocumentCount: number;
  onGenerate: (config: QuizConfig) => void;
  isGenerating?: boolean;
}

export function QuizConfigForm({
  selectedDocumentCount,
  onGenerate,
  isGenerating = false,
}: QuizConfigFormProps) {
  const [questionCount, setQuestionCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['multiple-choice']);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState(15);

  const canGenerate = selectedDocumentCount > 0 && questionTypes.length > 0 && !isGenerating;

  const handleQuestionTypeToggle = (type: QuestionType) => {
    setQuestionTypes(prev => {
      if (prev.includes(type)) {
        // Don't allow removing the last type
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canGenerate) {
      onGenerate({
        questionCount,
        questionTypes,
        difficulty,
        timeLimit: timeLimitEnabled ? timeLimit : null,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Quantity Slider */}
      <div>
        <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700">
          Number of Questions
        </label>
        <div className="mt-2">
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="questionCount"
              min={5}
              max={30}
              step={1}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
              disabled={isGenerating}
            />
            <span className="w-12 text-center text-sm font-semibold text-gray-900">
              {questionCount}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>5</span>
            <span>30</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Choose how many questions to generate (5-30)
        </p>
      </div>

      {/* Question Types Checkboxes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Question Types
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Select at least one question type
        </p>
        <div className="mt-3 space-y-3">
          {/* Multiple Choice */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={questionTypes.includes('multiple-choice')}
              onChange={() => handleQuestionTypeToggle('multiple-choice')}
              disabled={isGenerating}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-sm text-gray-700">Multiple Choice</span>
            </div>
          </label>

          {/* True/False */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={questionTypes.includes('true-false')}
              onChange={() => handleQuestionTypeToggle('true-false')}
              disabled={isGenerating}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-700">True / False</span>
            </div>
          </label>

          {/* Short Answer */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={questionTypes.includes('short-answer')}
              onChange={() => handleQuestionTypeToggle('short-answer')}
              disabled={isGenerating}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm text-gray-700">Short Answer</span>
            </div>
          </label>
        </div>
      </div>

      {/* Difficulty Level Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Difficulty Level
        </label>
        <div className="mt-2 flex gap-3">
          {(['easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              disabled={isGenerating}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                difficulty === level
                  ? level === 'easy'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : level === 'medium'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              } ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <div className="flex flex-col items-center gap-1">
                {level === 'easy' && (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {level === 'medium' && (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
                {level === 'hard' && (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                )}
                <span className="capitalize">{level}</span>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {difficulty === 'easy' && 'Basic recall questions focusing on key terms and definitions'}
          {difficulty === 'medium' && 'Balanced mix of recall and comprehension questions'}
          {difficulty === 'hard' && 'Advanced questions requiring analysis and application'}
        </p>
      </div>

      {/* Time Limit Toggle and Slider */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Time Limit
          </label>
          <button
            type="button"
            onClick={() => setTimeLimitEnabled(!timeLimitEnabled)}
            disabled={isGenerating}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              timeLimitEnabled ? 'bg-blue-600' : 'bg-gray-200'
            } ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}`}
            role="switch"
            aria-checked={timeLimitEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                timeLimitEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        
        {timeLimitEnabled && (
          <div className="mt-3">
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="timeLimit"
                min={5}
                max={60}
                step={5}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
                disabled={isGenerating}
              />
              <span className="w-20 text-center text-sm font-semibold text-gray-900">
                {timeLimit} min
              </span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {timeLimitEnabled 
            ? `Quiz will have a ${timeLimit} minute time limit`
            : 'No time limit - take as long as you need'}
        </p>
      </div>

      {/* Generate Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!canGenerate}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
            canGenerate
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Generate Quiz</span>
            </>
          )}
        </button>
        {selectedDocumentCount === 0 && (
          <p className="mt-2 text-center text-xs text-amber-600">
            Please select at least one document to generate a quiz
          </p>
        )}
        {selectedDocumentCount > 0 && questionTypes.length === 0 && (
          <p className="mt-2 text-center text-xs text-amber-600">
            Please select at least one question type
          </p>
        )}
      </div>
    </form>
  );
}
