"use client";

import { QuizResult, GeneratedQuiz } from "./mockQuizGenerator";
import { NeonButton } from "@/components/ui/NeonButton";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Clock, Target, Lightbulb, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuizResultsProps {
    result: QuizResult;
    quiz: GeneratedQuiz;
    onRetry: () => void;
    onBack: () => void;
}

export function QuizResults({ result, quiz, onRetry, onBack }: QuizResultsProps) {
    // Calculate stats safely
    const correctCount = result.answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctCount / result.totalQuestions) * 100);
    const isPassing = percentage >= 70;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Minimalist Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Completed on {new Date().toLocaleDateString()}
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Back
                </button>
            </div>

            {/* Compact Score Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className={cn(
                        "size-16 rounded-2xl flex items-center justify-center shrink-0 border-2",
                        isPassing ? "border-brand-neon bg-brand-neon text-black" : "border-gray-200 bg-gray-50 text-gray-400"
                    )}>
                        <Trophy className="size-8" strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900 tracking-tight">
                            {percentage}%
                        </div>
                        <div className={cn("text-sm font-medium", isPassing ? "text-green-600" : "text-gray-500")}>
                            {isPassing ? "Excellent work!" : "Keep practicing"}
                        </div>
                    </div>
                </div>

                {/* Divider on desktop */}
                <div className="hidden sm:block w-px h-12 bg-gray-100" />

                <div className="flex w-full sm:w-auto gap-8 sm:gap-12 justify-center sm:justify-end">
                    <div className="text-center sm:text-left">
                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1 justify-center sm:justify-start">
                            <Target className="size-3" /> Score
                        </div>
                        <div className="font-semibold text-gray-900">
                            {correctCount} <span className="text-gray-400 font-normal">/ {result.totalQuestions}</span>
                        </div>
                    </div>
                    <div className="text-center sm:text-left">
                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1 justify-center sm:justify-start">
                            <Clock className="size-3" /> Time
                        </div>
                        <div className="font-semibold text-gray-900">
                            {formatTime(result.timeTaken)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Clean Answer Review */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Review Answers</h2>
                <div className="grid gap-4">
                    {quiz.questions.map((question, index) => {
                        const answer = result.answers.find(a => a.questionId === question.id);
                        const isCorrect = answer?.isCorrect;

                        return (
                            <div
                                key={question.id}
                                className={cn(
                                    "group rounded-xl border p-5 transition-all hover:shadow-md",
                                    isCorrect
                                        ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                                        : "border-red-200 bg-red-50/50 hover:bg-red-50"
                                )}
                            >
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "mt-0.5 size-6 rounded-full flex items-center justify-center shrink-0 border",
                                        isCorrect
                                            ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                                            : "border-red-200 bg-red-100 text-red-700"
                                    )}>
                                        <span className="text-xs font-bold">{index + 1}</span>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <p className="font-medium text-gray-900 leading-snug">
                                            {question.question}
                                        </p>

                                        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                {isCorrect
                                                    ? <CheckCircle2 className="size-4 text-emerald-500" />
                                                    : <XCircle className="size-4 text-red-500" />
                                                }
                                                <span className="text-gray-500">Your answer:</span>
                                                <span className={cn("font-medium", isCorrect ? "text-emerald-700" : "text-red-700")}>
                                                    {answer?.answer || "Skipped"}
                                                </span>
                                            </div>

                                            {!isCorrect && (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="size-4 text-emerald-500" />
                                                    <span className="text-gray-500">Correct:</span>
                                                    <span className="font-medium text-emerald-700">
                                                        {question.correctAnswer}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-start gap-2 text-sm text-gray-500 bg-white/50 p-3 rounded-lg border border-black/5">
                                            <Lightbulb className="size-4 text-brand-neon shrink-0 fill-brand-neon/20 mt-0.5" />
                                            <span className="leading-relaxed">{question.explanation}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4 pt-4 pb-8">
                <NeonButton variant="outline" onClick={onBack}>
                    Back to Dashboard
                </NeonButton>
                <NeonButton onClick={onRetry}>
                    <RotateCcw className="size-4 mr-2" />
                    Retry Quiz
                </NeonButton>
            </div>
        </div>
    );
}
