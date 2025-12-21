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
import { BrainCircuit, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
            onRetry={handleRetakeQuiz}
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
        <div className="mx-auto flex h-[80vh] max-w-2xl flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-pulse rounded-full bg-brand-neon/20 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl border border-gray-100">
              <BrainCircuit className="h-12 w-12 text-black animate-pulse" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Generating Quiz...
          </h2>
          <p className="mb-8 text-gray-500 max-w-md">
            Analyzing your documents and creating {currentConfig.questionCount} {currentConfig.difficulty} questions.
          </p>

          <div className="w-full max-w-xs space-y-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-black transition-all duration-500 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-400">
              <span>AI Processing</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
          </div>

          <div className="mt-8 flex gap-2">
            {currentConfig.questionTypes.map((type) => (
              <span key={type} className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                {type === 'multiple-choice' && 'Multiple Choice'}
                {type === 'true-false' && 'True/False'}
                {type === 'short-answer' && 'Short Answer'}
              </span>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Default: Selection state
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Generate Quiz</h1>
          <p className="mt-2 text-gray-500">
            Select documents to generate AI-powered quizzes to test your knowledge.
          </p>
        </div>

        {/* Source Selection Section */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Select Source Documents</h2>
            <p className="text-sm text-gray-500">
              Choose the PDF documents you want to generate quiz questions from.
            </p>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-neon" />
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
        </section>

        {/* Configuration Section */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Configuration Options</h2>
            <p className="text-sm text-gray-500">
              Customize your quiz generation settings.
            </p>
          </div>
          <div className="p-6">
            <QuizConfigForm
              selectedDocumentCount={selectedCount}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        </section>
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
