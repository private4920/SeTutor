"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/lib/firebase/ProtectedRoute";
import { useAuth } from "@/lib/firebase/AuthContext";
import { DashboardLayout } from "@/components/dashboard";
import { DocumentSelectionTree } from "@/components/flashcards";
import {
  SummaryConfigForm,
  SummaryConfig,
  SummaryDisplay,
  generateMockSummaryAsync,
  GeneratedSummary,
  SummaryLoading,
} from "@/components/summary";
import { useFolders } from "@/lib/hooks/useFolders";
import { useDocuments } from "@/lib/hooks/useDocuments";

type GeneratorState = 'selection' | 'generating' | 'results';

function SummaryGeneratorContent() {
  const { user } = useAuth();
  const { folders, fetchFolders, loading: foldersLoading } = useFolders();
  const { documents, fetchDocuments, loading: documentsLoading } = useDocuments();
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(new Set());
  const [generatorState, setGeneratorState] = useState<GeneratorState>('selection');
  const [currentConfig, setCurrentConfig] = useState<SummaryConfig | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<GeneratedSummary | null>(null);
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

  const handleGenerate = useCallback(async (config: SummaryConfig) => {
    setCurrentConfig(config);
    setGeneratorState('generating');
    setGenerationProgress(0);

    try {
      const summary = await generateMockSummaryAsync(
        config,
        Array.from(selectedDocumentIds),
        (progress) => setGenerationProgress(progress)
      );
      setGeneratedSummary(summary);
      setGeneratorState('results');
    } catch (error) {
      console.error('Summary generation failed:', error);
      setGeneratorState('selection');
      setCurrentConfig(null);
    }
  }, [selectedDocumentIds]);

  const handleBackToSelection = useCallback(() => {
    setGeneratorState('selection');
    setCurrentConfig(null);
    setGeneratedSummary(null);
    setGenerationProgress(0);
  }, []);

  const isLoading = foldersLoading || documentsLoading;
  const selectedCount = selectedDocumentIds.size;
  const isGenerating = generatorState === 'generating';

  // Render loading state during generation
  if (generatorState === 'generating' && currentConfig) {
    return (
      <DashboardLayout>
        <SummaryLoading
          config={currentConfig}
          documentCount={selectedCount}
          progress={generationProgress}
        />
      </DashboardLayout>
    );
  }

  // Render results state with full SummaryDisplay component
  if (generatorState === 'results' && generatedSummary) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl">
          <SummaryDisplay
            summary={generatedSummary}
            onRegenerate={handleGenerate}
            onBack={handleBackToSelection}
            isRegenerating={isGenerating}
          />
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
          <h1 className="text-2xl font-bold text-gray-900">Generate Summary</h1>
          <p className="mt-1 text-sm text-gray-600">
            Select documents to generate AI-powered summaries with key takeaways.
          </p>
        </div>

        {/* Source Selection Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Source Documents</h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose the PDF documents you want to summarize.
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
                  Ready to configure summary generation options.
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
              Customize your summary generation settings.
            </p>
          </div>
          <SummaryConfigForm
            selectedDocumentCount={selectedCount}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SummaryGeneratorPage() {
  return (
    <ProtectedRoute redirectTo="/">
      <SummaryGeneratorContent />
    </ProtectedRoute>
  );
}
