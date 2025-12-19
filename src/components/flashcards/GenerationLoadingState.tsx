"use client";

import { useState, useEffect } from 'react';

export interface GenerationLoadingStateProps {
  totalDocuments: number;
  cardCount: number;
  onCancel?: () => void;
}

const PROGRESS_MESSAGES = [
  'Analyzing document content...',
  'Extracting key concepts...',
  'Identifying important topics...',
  'Generating question-answer pairs...',
  'Optimizing flashcard difficulty...',
  'Finalizing flashcards...',
];

export function GenerationLoadingState({
  totalDocuments,
  cardCount,
  onCancel,
}: GenerationLoadingStateProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Estimate total time based on documents and cards
  // Base: 2 seconds per document + 0.5 seconds per card
  const estimatedTotalSeconds = Math.max(5, totalDocuments * 2 + cardCount * 0.5);

  useEffect(() => {
    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Slow down as we approach 90% to simulate waiting for completion
        const increment = prev < 50 ? 3 : prev < 80 ? 2 : prev < 90 ? 0.5 : 0;
        return Math.min(prev + increment, 90);
      });
    }, 200);

    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 2500);

    // Elapsed time counter
    const timeInterval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const remainingSeconds = Math.max(0, Math.ceil(estimatedTotalSeconds - elapsedSeconds));
  const remainingDisplay = remainingSeconds > 60 
    ? `${Math.ceil(remainingSeconds / 60)} min` 
    : `${remainingSeconds} sec`;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Animated Spinner */}
      <div className="relative mb-6">
        {/* Outer ring */}
        <div className="h-24 w-24 rounded-full border-4 border-gray-200" />
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 h-24 w-24 animate-spin rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600" 
          style={{ animationDuration: '1.5s' }} 
        />
        {/* Inner content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-800">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 w-full max-w-xs">
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Progress Message */}
      <div className="mb-2 flex items-center gap-2">
        <svg
          className="h-5 w-5 animate-pulse text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700">
          {PROGRESS_MESSAGES[messageIndex]}
        </p>
      </div>

      {/* Estimated Time Remaining */}
      <p className="mb-6 text-xs text-gray-500">
        Estimated time remaining: <span className="font-medium">{remainingDisplay}</span>
      </p>

      {/* Generation Details */}
      <div className="mb-6 rounded-lg bg-gray-50 px-6 py-3">
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{totalDocuments} document{totalDocuments !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>{cardCount} flashcards</span>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
        >
          Cancel Generation
        </button>
      )}
    </div>
  );
}
