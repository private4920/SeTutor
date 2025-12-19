"use client";

import { useState } from 'react';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface FlashcardConfig {
  quantity: number;
  difficulty: DifficultyLevel;
  focusTopics: string;
}

export interface FlashcardConfigFormProps {
  selectedDocumentCount: number;
  onGenerate: (config: FlashcardConfig) => void;
  isGenerating?: boolean;
}

export function FlashcardConfigForm({
  selectedDocumentCount,
  onGenerate,
  isGenerating = false,
}: FlashcardConfigFormProps) {
  const [quantity, setQuantity] = useState(15);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [focusTopics, setFocusTopics] = useState('');

  const canGenerate = selectedDocumentCount > 0 && !isGenerating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canGenerate) {
      onGenerate({ quantity, difficulty, focusTopics });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quantity Slider */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
          Number of Flashcards
        </label>
        <div className="mt-2">
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="quantity"
              min={5}
              max={50}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
              disabled={isGenerating}
            />
            <span className="w-12 text-center text-sm font-semibold text-gray-900">
              {quantity}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>5</span>
            <span>50</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Choose how many flashcards to generate (5-50)
        </p>
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

      {/* Focus Topics Input */}
      <div>
        <label htmlFor="focusTopics" className="block text-sm font-medium text-gray-700">
          Focus Topics <span className="text-gray-400">(optional)</span>
        </label>
        <div className="mt-2">
          <input
            type="text"
            id="focusTopics"
            value={focusTopics}
            onChange={(e) => setFocusTopics(e.target.value)}
            placeholder="e.g., Chapter 3, Machine Learning, Key Concepts"
            disabled={isGenerating}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Specify topics to focus on, separated by commas
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Generate Flashcards</span>
            </>
          )}
        </button>
        {selectedDocumentCount === 0 && (
          <p className="mt-2 text-center text-xs text-amber-600">
            Please select at least one document to generate flashcards
          </p>
        )}
      </div>
    </form>
  );
}
