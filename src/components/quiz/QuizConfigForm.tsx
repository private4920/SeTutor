"use client";

import { useState } from 'react';
import { NeonButton } from "@/components/ui/NeonButton";
import {
    Zap,
    Clock,
    Brain,
    BookOpen,
    CheckSquare,
    AlignLeft,
    CheckCircle2,
    HelpCircle,
    Sliders
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface QuizConfig {
    questionCount: number;
    questionTypes: QuestionType[];
    difficulty: DifficultyLevel;
    timeLimit: number | null;
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
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Question Quantity Slider */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
                <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <Sliders className="h-4 w-4 text-brand-neon fill-black" />
                        Number of Questions
                    </label>
                    <span className="flex h-8 w-12 items-center justify-center rounded-lg bg-black font-mono font-bold text-brand-neon">
                        {questionCount}
                    </span>
                </div>

                <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-black focus:outline-none focus:ring-2 focus:ring-brand-neon/50"
                    disabled={isGenerating}
                />
                <div className="mt-2 flex justify-between text-xs font-medium text-gray-400">
                    <span>5</span>
                    <span>30</span>
                </div>
            </div>

            {/* Question Types */}
            <div>
                <label className="mb-3 block text-sm font-bold text-gray-900">
                    Question Types
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        { id: 'multiple-choice', label: 'Multiple Choice', icon: CheckSquare },
                        { id: 'true-false', label: 'True / False', icon: CheckCircle2 },
                        { id: 'short-answer', label: 'Short Answer', icon: AlignLeft },
                    ].map((type) => {
                        const isSelected = questionTypes.includes(type.id as QuestionType);
                        const Icon = type.icon;
                        return (
                            <div
                                key={type.id}
                                onClick={() => !isGenerating && handleQuestionTypeToggle(type.id as QuestionType)}
                                className={cn(
                                    "cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
                                    isSelected
                                        ? "border-black bg-black text-brand-neon shadow-lg"
                                        : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                <div className="flex flex-col gap-2">
                                    <Icon className={cn("h-6 w-6", isSelected && "text-brand-neon")} />
                                    <span className="font-bold text-sm">{type.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Difficulty Level */}
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
            </div>

            {/* Time Limit */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                            timeLimitEnabled ? "bg-black text-brand-neon" : "bg-gray-100 text-gray-400"
                        )}>
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Time Limit</p>
                            <p className="text-xs text-gray-500">
                                {timeLimitEnabled ? `${timeLimit} minutes` : 'No time limit'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setTimeLimitEnabled(!timeLimitEnabled)}
                        className={cn(
                            "relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none",
                            timeLimitEnabled ? "bg-black" : "bg-gray-200"
                        )}
                    >
                        <span
                            className={cn(
                                "absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition-transform duration-200 shadow-sm",
                                timeLimitEnabled ? "translate-x-5 bg-brand-neon" : "translate-x-0"
                            )}
                        />
                    </button>
                </div>

                {timeLimitEnabled && (
                    <div className="mt-4 pl-[52px]">
                        <input
                            type="range"
                            min={5}
                            max={60}
                            step={5}
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(Number(e.target.value))}
                            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-black focus:outline-none"
                        />
                    </div>
                )}
            </div>

            {/* Generate Button */}
            <div className="pt-2">
                <NeonButton
                    type="submit"
                    fullWidth
                    disabled={!canGenerate}
                    isLoading={isGenerating}
                >
                    {isGenerating ? "Generating Quiz..." : "Start Quiz Generation"}
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
