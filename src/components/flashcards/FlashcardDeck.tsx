"use client";

import { useState, useCallback, useEffect } from 'react';
import { GeneratedFlashcard, GeneratedFlashcardDeck } from './mockFlashcardGenerator';
import { DifficultyLevel } from './FlashcardConfigForm';

export interface FlashcardDeckProps {
  deck: GeneratedFlashcardDeck;
  onSave?: (deck: GeneratedFlashcardDeck) => void;
  onDelete?: (deckId: string) => void;
  onShare?: (deck: GeneratedFlashcardDeck) => void;
  onBack?: () => void;
}

type ViewMode = 'browse' | 'practice' | 'edit';

interface EditingCard {
  id: string;
  question: string;
  answer: string;
}

export function FlashcardDeck({
  deck: initialDeck,
  onSave,
  onDelete,
  onShare,
  onBack,
}: FlashcardDeckProps) {
  const [deck, setDeck] = useState<GeneratedFlashcardDeck>(initialDeck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
  const [deckName, setDeckName] = useState(deck.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [practiceStats, setPracticeStats] = useState({ correct: 0, incorrect: 0, remaining: deck.flashcards.length });
  const [practiceCards, setPracticeCards] = useState<GeneratedFlashcard[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const currentCard = viewMode === 'practice'
    ? practiceCards[currentIndex]
    : deck.flashcards[currentIndex];
  const totalCards = viewMode === 'practice'
    ? practiceCards.length
    : deck.flashcards.length;

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, totalCards]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingCard || isEditingName) return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCard, isEditingName, handlePrevious, handleNext]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleGoToCard = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsFlipped(false);
  }, []);


  // Edit functionality
  const handleStartEdit = useCallback((card: GeneratedFlashcard) => {
    setEditingCard({
      id: card.id,
      question: card.question,
      answer: card.answer,
    });
    setViewMode('edit');
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingCard) return;

    setDeck(prev => ({
      ...prev,
      flashcards: prev.flashcards.map(card =>
        card.id === editingCard.id
          ? { ...card, question: editingCard.question, answer: editingCard.answer }
          : card
      ),
    }));
    setEditingCard(null);
    setViewMode('browse');
  }, [editingCard]);

  const handleCancelEdit = useCallback(() => {
    setEditingCard(null);
    setViewMode('browse');
  }, []);

  // Save deck with name
  const handleSaveDeck = useCallback(() => {
    const updatedDeck = { ...deck, name: deckName };
    setDeck(updatedDeck);
    onSave?.(updatedDeck);
    setIsEditingName(false);
  }, [deck, deckName, onSave]);

  // Practice mode
  const handleStartPractice = useCallback(() => {
    const shuffled = [...deck.flashcards].sort(() => Math.random() - 0.5);
    setPracticeCards(shuffled);
    setPracticeStats({ correct: 0, incorrect: 0, remaining: shuffled.length });
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewMode('practice');
  }, [deck.flashcards]);

  const handlePracticeResponse = useCallback((correct: boolean) => {
    setPracticeStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      remaining: prev.remaining - 1,
    }));

    if (currentIndex < practiceCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Practice complete - stay on last card to show results
    }
  }, [currentIndex, practiceCards.length]);

  const handleEndPractice = useCallback(() => {
    setViewMode('browse');
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  // Export functionality
  const handleExportPDF = useCallback(() => {
    // Create printable content
    const printContent = deck.flashcards.map((card, i) =>
      `Card ${i + 1}:\nQ: ${card.question}\nA: ${card.answer}\n`
    ).join('\n---\n\n');

    const blob = new Blob([`${deck.name}\n\n${printContent}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [deck]);

  const handleExportAnki = useCallback(() => {
    // Anki format: question;answer (tab-separated)
    const ankiContent = deck.flashcards.map(card =>
      `${card.question}\t${card.answer}`
    ).join('\n');

    const blob = new Blob([ankiContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.replace(/\s+/g, '_')}_anki.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [deck]);

  // Delete functionality
  const handleDelete = useCallback(() => {
    onDelete?.(deck.id);
    setShowDeleteConfirm(false);
  }, [deck.id, onDelete]);

  // Share functionality
  const handleShare = useCallback(() => {
    onShare?.(deck);
  }, [deck, onShare]);

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
    }
  };


  // Practice complete view
  if (viewMode === 'practice' && practiceStats.remaining === 0) {
    const totalAnswered = practiceStats.correct + practiceStats.incorrect;
    const percentage = totalAnswered > 0 ? Math.round((practiceStats.correct / totalAnswered) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice Complete!</h2>
          <p className="text-gray-600 mb-6">You&apos;ve reviewed all {totalAnswered} cards</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-3xl font-bold text-green-600">{practiceStats.correct}</p>
              <p className="text-sm text-green-700">Correct</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-3xl font-bold text-red-600">{practiceStats.incorrect}</p>
              <p className="text-sm text-red-700">Incorrect</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-3xl font-bold text-blue-600">{percentage}%</p>
              <p className="text-sm text-blue-700">Score</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleStartPractice}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-purple-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Practice Again
            </button>
            <button
              onClick={handleEndPractice}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Deck
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode view
  if (viewMode === 'edit' && editingCard) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Flashcard</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <textarea
                value={editingCard.question}
                onChange={(e) => setEditingCard(prev => prev ? { ...prev, question: e.target.value } : null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
              <textarea
                value={editingCard.answer}
                onChange={(e) => setEditingCard(prev => prev ? { ...prev, answer: e.target.value } : null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleCancelEdit}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header with deck name and actions - Requirements 1.3, 6.4: Responsive design */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 p-2 -ml-2 text-gray-600 hover:text-gray-900 active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          {isEditingName ? (
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-base sm:text-lg font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDeck}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 active:scale-95"
                >
                  Save
                </button>
                <button
                  onClick={() => { setDeckName(deck.name); setIsEditingName(false); }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{deck.name}</h2>
              <button
                onClick={() => setIsEditingName(true)}
                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 active:scale-95"
                title="Edit deck name"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Action buttons - responsive grid on mobile */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <button
            onClick={handleStartPractice}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 sm:py-2 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-purple-700 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Practice
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-10">
                <button
                  onClick={handleExportPDF}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Export as PDF
                </button>
                <button
                  onClick={handleExportAnki}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Export for Anki
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:inline">Share</span>
            <span className="sm:hidden">Share</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 sm:py-2 text-sm font-medium text-red-600 hover:bg-red-50 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Delete</span>
            <span className="sm:hidden">Delete</span>
          </button>
        </div>
      </div>


      {/* Practice mode header */}
      {viewMode === 'practice' && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-purple-900">Practice Mode</span>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓ {practiceStats.correct}</span>
                <span className="text-red-600">✗ {practiceStats.incorrect}</span>
                <span className="text-gray-600">Remaining: {practiceStats.remaining}</span>
              </div>
            </div>
            <button
              onClick={handleEndPractice}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              End Practice
            </button>
          </div>
        </div>
      )}

      {/* Flashcard display - Requirements 1.3, 6.4: Responsive design */}
      {currentCard && (
        <div className="flex flex-col items-center">
          {/* Card counter */}
          <div className="mb-3 sm:mb-4 text-sm text-gray-500">
            Card {currentIndex + 1} of {totalCards}
          </div>

          {/* Flip card container */}
          <div
            className="perspective-1000 w-full max-w-2xl cursor-pointer"
            onClick={handleFlip}
          >
            <div
              className={`relative h-64 sm:h-80 w-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''
                }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front of card (Question) */}
              <div
                className="absolute inset-0 rounded-xl border-2 border-gray-200 bg-white p-4 sm:p-8 shadow-lg backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Question</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
                      {currentCard.difficulty}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center overflow-y-auto">
                    <p className="text-base sm:text-lg text-gray-900 text-center leading-relaxed">
                      {currentCard.question}
                    </p>
                  </div>
                  <div className="text-center text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4">
                    Tap to flip
                  </div>
                </div>
              </div>

              {/* Back of card (Answer) */}
              <div
                className="absolute inset-0 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-8 shadow-lg backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-xs font-medium text-blue-500 uppercase tracking-wide">Answer</span>
                    {viewMode !== 'practice' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStartEdit(currentCard); }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 active:scale-95"
                        title="Edit this card"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-center overflow-y-auto">
                    <p className="text-base sm:text-lg text-gray-800 text-center leading-relaxed">
                      {currentCard.answer}
                    </p>
                  </div>
                  {viewMode === 'practice' && (
                    <div className="flex justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePracticeResponse(false); }}
                        className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-red-100 px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium text-red-700 hover:bg-red-200 active:scale-95"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="hidden sm:inline">Incorrect</span>
                        <span className="sm:hidden">Wrong</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePracticeResponse(true); }}
                        className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-green-100 px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-medium text-green-700 hover:bg-green-200 active:scale-95"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="hidden sm:inline">Correct</span>
                        <span className="sm:hidden">Right</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Navigation arrows */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${currentIndex === 0
                  ? 'cursor-not-allowed text-gray-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === totalCards - 1}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${currentIndex === totalCards - 1
                  ? 'cursor-not-allowed text-gray-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              Next
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Keyboard hint */}
          <p className="mt-4 text-xs text-gray-400 text-center">
            Use ← → arrow keys to navigate, Space or Enter to flip
          </p>
        </div>
      )}

      {/* Card thumbnails / quick navigation */}
      {viewMode === 'browse' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">All Cards</h3>
          <div className="flex flex-wrap gap-2">
            {deck.flashcards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleGoToCard(index)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${index === currentIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Flashcard Deck?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete &quot;{deck.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
