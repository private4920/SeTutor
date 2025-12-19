"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/lib/firebase/ProtectedRoute";
import { useAuth } from "@/lib/firebase/AuthContext";
import { DashboardLayout } from "@/components/dashboard";
import { DocumentSelectionTree } from "@/components/flashcards";
import { 
  QuizConfigForm, 
  QuizConfig, 
  QuizTaker, 
  QuizResults,
  GeneratedQuiz, 
  QuizResult,
  generateMockQuizAsync 
} from "@/components/quiz";
import { useFolders } from "@/lib/hooks/useFolders";
import { useDocuments } from "@/lib/hooks/useDocuments";

type GeneratorState = 'selection' | 'generating' | 'taking' | 'results';

function QuizGeneratorContent() {
  const { user } = useAuth();
  const { folders, fetchFolders, loading: foldersLoading } = useFolders();
  const { documents, fetchDocuments, loading: documentsLoading } = useDocuments();
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(new Set());
  const [generatorState, setGeneratorState] = useState<GeneratorState>('selection');
  const [currentConfig, setCurrentConfig] = useState<QuizConfig | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<GeneratedQuiz | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Fetch folders and documents on mount
  useEffect(() => {
    if (user?.uid) {
      fetchFolders();
      fetchDocuments();
    }
  }, [user?.uid, fetchFolders, fetchDocuments]);

  const handleSelectionChange = useCallback((newSelection: Set<string>) => {
    setSelectedDocumentIds(newSelection);
  }, []);

  const handleGenerate = useCallback(async (config: QuizConfig) => {
    setCurrentConfig(config);
    setGeneratorState('generating');
    setGenerationProgress(0);
    
    try {
      const quiz = await generateMockQuizAsync(
        config,
        Array.from(selectedDocumentIds),
        (progress) => setGenerationProgress(progress)
      );
      setCurrentQuiz(quiz);
      setGeneratorState('taking');
    } catch (error) {
      console.error('Quiz generation failed:', error);
      setGeneratorState('selection');
      setCurrentConfig(null);
    }
  }, [selectedDocumentIds]);

  const handleQuizComplete = useCallback((result: QuizResult) => {
    setQuizResult(result);
    setGeneratorState('results');
  }, []);

  const handleBackToSelection = useCallback(() => {
    setGeneratorState('selection');
    setCurrentConfig(null);
    setCurrentQuiz(null);
    setQuizResult(null);
  }, []);

  const isLoading = foldersLoading || documentsLoading;
  const selectedCount = selectedDocumentIds.size;
  const isGenerating = generatorState === 'generating';

  const handleRetakeQuiz = useCallback(() => {
    // Reset to taking state with the same quiz
    if (currentQuiz) {
      setQuizResult(null);
      setGeneratorState('taking');
    }
  }, [currentQuiz]);

  const handleSaveResults = useCallback(() => {
    // In a real app this would save to database
    // Could show a toast notification here
  }, []);

  const handleShareResults = useCallback(() => {
    // Share is handled inside QuizResults component
  }, []);

  // Render results state
  if (generatorState === 'results' && quizResult && currentQuiz) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl">
          <QuizResults
            quiz={currentQuiz}
            result={quizResult}
            onRetake={handleRetakeQuiz}
            onSaveResults={handleSaveResults}
            onShare={handleShareResults}
            onBack={handleBackToSelection}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Render quiz taking state
  if (generatorState === 'taking' && currentQuiz) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-6xl">
          <QuizTaker
            quiz={currentQuiz}
            onComplete={handleQuizComplete}
            onBack={handleBackToSelection}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Render loading state during generation
  if (generatorState === 'generating' && currentConfig) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Generating Quiz</h1>
            <p className="mt-1 text-sm text-gray-600">
              Please wait while we analyze your documents and create quiz questions.
            </p>
          </div>

          {/* Loading State */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <svg
                  className="h-16 w-16 animate-spin text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="mt-4 text-lg font-medium text-gray-900">
                Generating {currentConfig.questionCount} questions...
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Analyzing {selectedCount} document{selectedCount !== 1 ? 's' : ''}
              </p>
              
              {/* Progress bar */}
              <div className="mt-4 w-full max-w-xs">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-xs text-gray-500">
                  {Math.round(generationProgress)}% complete
                </p>
              </div>
              
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {currentConfig.questionTypes.map((type) => (
                  <span
                    key={type}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {type === 'multiple-choice' && 'Multiple Choice'}
                    {type === 'true-false' && 'True/False'}
                    {type === 'short-answer' && 'Short Answer'}
                  </span>
                ))}
              </div>
              {currentConfig.timeLimit && (
                <p className="mt-3 text-sm text-gray-500">
                  Time limit: {currentConfig.timeLimit} minutes
                </p>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Default: Selection state
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Quiz</h1>
          <p className="mt-1 text-sm text-gray-600">
            Select documents to generate AI-powered quizzes to test your knowledge.
          </p>
        </div>

        {/* Source Selection Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Source Documents</h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose the PDF documents you want to generate quiz questions from.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="h-8 w-8 animate-spin text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm text-gray-500">Loading documents...</span>
              </div>
            </div>
          ) : (
            <DocumentSelectionTree
              folders={folders}
              documents={documents}
              selectedDocumentIds={selectedDocumentIds}
              onSelectionChange={handleSelectionChange}
            />
          )}
        </div>

        {/* Selection Summary */}
        {selectedCount > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-blue-700">
                  Ready to configure quiz generation options.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Configuration Options</h2>
            <p className="mt-1 text-sm text-gray-500">
              Customize your quiz generation settings.
            </p>
          </div>
          <QuizConfigForm
            selectedDocumentCount={selectedCount}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function QuizGeneratorPage() {
  return (
    <ProtectedRoute redirectTo="/">
      <QuizGeneratorContent />
    </ProtectedRoute>
  );
}
