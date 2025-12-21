"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/lib/firebase/ProtectedRoute";
import { useAuth } from "@/lib/firebase/AuthContext";
import { DashboardLayout } from "@/components/dashboard";
import {
  DocumentSelectionTree,
  FlashcardConfigForm,
  FlashcardConfig,
  FlashcardDeck,
  GenerationLoadingState,
  generateMockFlashcardsAsync,
  GeneratedFlashcardDeck,
} from "@/components/flashcards";
import { useFolders } from "@/lib/hooks/useFolders";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { Loader2 } from "lucide-react";

type GeneratorState = 'selection' | 'generating' | 'results';

function FlashcardGeneratorContent() {
  const { user } = useAuth();
  const { folders, fetchFolders, loading: foldersLoading } = useFolders();
  const { documents, fetchDocuments, loading: documentsLoading } = useDocuments();
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(new Set());
  const [generatorState, setGeneratorState] = useState<GeneratorState>('selection');
  const [currentConfig, setCurrentConfig] = useState<FlashcardConfig | null>(null);
  const [generatedDeck, setGeneratedDeck] = useState<GeneratedFlashcardDeck | null>(null);

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

  const handleGenerate = useCallback(async (config: FlashcardConfig) => {
    setCurrentConfig(config);
    setGeneratorState('generating');

    try {
      const deck = await generateMockFlashcardsAsync(
        config,
        Array.from(selectedDocumentIds)
      );
      setGeneratedDeck(deck);
      setGeneratorState('results');
    } catch {
      setGeneratorState('selection');
    }
  }, [selectedDocumentIds]);

  const handleCancelGeneration = useCallback(() => {
    setGeneratorState('selection');
    setCurrentConfig(null);
  }, []);

  const handleBackToSelection = useCallback(() => {
    setGeneratorState('selection');
    setGeneratedDeck(null);
    setCurrentConfig(null);
  }, []);

  const handleSaveDeck = useCallback((updatedDeck: GeneratedFlashcardDeck) => {
    setGeneratedDeck(updatedDeck);
  }, []);

  const handleDeleteDeck = useCallback(() => {
    setGeneratedDeck(null);
    setGeneratorState('selection');
    setCurrentConfig(null);
  }, []);

  const handleShareDeck = useCallback((deck: GeneratedFlashcardDeck) => {
    const shareText = `Check out my flashcard deck: ${deck.name} (${deck.flashcards.length} cards)`;
    if (navigator.share) {
      navigator.share({
        title: deck.name,
        text: shareText,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(() => { });
    }
  }, []);

  const isLoading = foldersLoading || documentsLoading;
  const selectedCount = selectedDocumentIds.size;
  const isGenerating = generatorState === 'generating';

  // Render loading state during generation
  if (generatorState === 'generating' && currentConfig) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <GenerationLoadingState
            totalDocuments={selectedCount}
            cardCount={currentConfig.quantity}
            onCancel={handleCancelGeneration}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Render results with FlashcardDeck component
  if (generatorState === 'results' && generatedDeck) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <FlashcardDeck
            deck={generatedDeck}
            onSave={handleSaveDeck}
            onDelete={handleDeleteDeck}
            onShare={handleShareDeck}
            onBack={handleBackToSelection}
          />
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Generate Flashcards</h1>
          <p className="mt-2 text-gray-500">
            Select documents to generate AI-powered flashcards for effective study sessions.
          </p>
        </div>

        {/* Source Selection Section */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Select Source Documents</h2>
            <p className="text-sm text-gray-500">Choose the PDF documents you want to generate flashcards from.</p>
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
            <p className="text-sm text-gray-500">Customize your flashcard generation settings.</p>
          </div>
          <div className="p-6">
            <FlashcardConfigForm
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

export default function FlashcardGeneratorPage() {
  return (
    <ProtectedRoute redirectTo="/">
      <FlashcardGeneratorContent />
    </ProtectedRoute>
  );
}
