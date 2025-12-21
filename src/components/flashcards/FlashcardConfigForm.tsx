"use client";

import { useState } from 'react';
import { NeonButton } from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";
import { Zap, Brain, BookOpen, Layers, HelpCircle, Sliders } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Quantity Slider */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6 transition-colors hover:border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Layers className="h-4 w-4 text-brand-neon fill-black" />
            Number of Flashcards
          </label>
          <span className="flex h-8 w-12 items-center justify-center rounded-lg bg-black font-mono font-bold text-brand-neon">
            {quantity}
          </span>
        </div>

        <input
          type="range"
          min={5}
          max={50}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-black focus:outline-none focus:ring-2 focus:ring-brand-neon/50"
          disabled={isGenerating}
        />
        <div className="mt-2 flex justify-between text-xs font-medium text-gray-400">
          <span>5 cards</span>
          <span>50 cards</span>
        </div>
      </div>

      {/* Difficulty Level Selector */}
      <div>
        <label className="mb-3 block text-sm font-bold text-gray-900">
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'easy', label: 'Easy', icon: BookOpen, desc: 'Basic recall' },
            { id: 'medium', label: 'Medium', icon: Brain, desc: 'Balanced' },
            { id: 'hard', label: 'Hard', icon: Zap, desc: 'Advanced' },
          ].map((level) => {
            const isSelected = difficulty === level.id;
            const Icon = level.icon;
            return (
              <div
                key={level.id}
                onClick={() => !isGenerating && setDifficulty(level.id as DifficultyLevel)}
                className={cn(
                  "relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-200",
                  isSelected
                    ? "border-brand-neon bg-white shadow-neon-glow ring-1 ring-brand-neon"
                    : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                )}
              >
                {isSelected && (
                  <div className="absolute -right-3 -top-3 h-10 w-10 bg-brand-neon blur-xl opacity-20" />
                )}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={cn(
                    "rounded-full p-2 transition-colors",
                    isSelected ? "bg-brand-neon text-black" : "bg-gray-100 text-gray-400"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn("font-bold text-sm", isSelected ? "text-black" : "text-gray-500")}>
                    {level.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center">
          {difficulty === 'easy' && 'Focuses on definitions and key terms.'}
          {difficulty === 'medium' && 'Mixes conceptual understanding and recall.'}
          {difficulty === 'hard' && 'Challenges deep understanding and application.'}
        </p>
      </div>

      {/* Focus Topics Input */}
      <div>
        <label htmlFor="focusTopics" className="mb-2 block text-sm font-bold text-gray-900">
          Focus Topics <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <div className="relative group">
          <Sliders className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
          <input
            type="text"
            id="focusTopics"
            value={focusTopics}
            onChange={(e) => setFocusTopics(e.target.value)}
            placeholder="e.g., Chapter 3, Machine Learning, Key Concepts"
            disabled={isGenerating}
            className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50 py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="pt-2">
        <NeonButton
          type="submit"
          fullWidth
          disabled={!canGenerate}
          isLoading={isGenerating}
        >
          {isGenerating ? "Generating Flashcards..." : "Generate Flashcards"}
        </NeonButton>

        {selectedDocumentCount === 0 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 py-2 rounded-lg">
            <HelpCircle className="h-4 w-4" />
            Please select at least one document
          </div>
        )}
      </div>
    </form>
  );
}
