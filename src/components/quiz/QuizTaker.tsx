"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { GeneratedQuiz, QuizQuestion, QuizAnswer, QuizResult, calculateQuizResult } from './mockQuizGenerator';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { NeonButton } from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Circle,
    HelpCircle,
    AlertCircle,
    Flag,
    Menu
} from 'lucide-react';

export interface QuizTakerProps {
    quiz: GeneratedQuiz;
    onComplete: (result: QuizResult) => void;
    onBack?: () => void;
}

type QuestionStatus = 'unanswered' | 'answered' | 'current';

export function QuizTaker({ quiz, onComplete, onBack }: QuizTakerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, string>>(new Map());
    const [timeRemaining, setTimeRemaining] = useState<number | null>(
        quiz.timeLimit ? quiz.timeLimit * 60 : null
    );
    const [startTime] = useState<number>(Date.now());
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const currentQuestion = quiz.questions[currentIndex];
    const totalQuestions = quiz.questions.length;
    const answeredCount = answers.size;

    // Timer logic
    useEffect(() => {
        if (quiz.timeLimit === null) return;

        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev === null || prev <= 0) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [quiz.timeLimit]);

    // Auto-submit logic
    const handleSubmitRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        handleSubmitRef.current = () => {
            if (timerRef.current) clearInterval(timerRef.current);

            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            const quizAnswers: QuizAnswer[] = quiz.questions.map(q => ({
                questionId: q.id,
                answer: answers.get(q.id) || '',
            }));

            const result = calculateQuizResult(quiz, quizAnswers, timeTaken);
            onComplete(result);
        };
    }, [quiz, answers, startTime, onComplete]);

    useEffect(() => {
        if (timeRemaining === 0 && handleSubmitRef.current) {
            handleSubmitRef.current();
        }
    }, [timeRemaining]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getQuestionStatus = (index: number): QuestionStatus => {
        if (index === currentIndex) return 'current';
        const question = quiz.questions[index];
        if (question && answers.has(question.id)) return 'answered';
        return 'unanswered';
    };

    const handleAnswerChange = useCallback((questionId: string, answer: string) => {
        setAnswers(prev => {
            const newAnswers = new Map(prev);
            newAnswers.set(questionId, answer);
            return newAnswers;
        });
    }, []);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const handleNext = useCallback(() => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, totalQuestions]);

    const handleGoToQuestion = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    const handleSubmit = useCallback(() => {
        if (handleSubmitRef.current) {
            handleSubmitRef.current();
        }
    }, []);

    const handleSubmitClick = useCallback(() => {
        const unansweredCount = totalQuestions - answeredCount;
        if (unansweredCount > 0) {
            setShowSubmitConfirm(true);
        } else {
            handleSubmit();
        }
    }, [totalQuestions, answeredCount, handleSubmit]);


    const renderAnswerInput = (question: QuizQuestion) => {
        const currentAnswer = answers.get(question.id) || '';

        if (question.type === 'multiple-choice' || question.type === 'true-false') {
            return (
                <div className="space-y-3">
                    {question.options?.map((option, index) => {
                        const isSelected = currentAnswer === option;
                        return (
                            <div
                                key={index}
                                onClick={() => handleAnswerChange(question.id, option)}
                                className={cn(
                                    "group relative flex cursor-pointer items-center gap-4 rounded-xl border-2 p-5 transition-all duration-300",
                                    isSelected
                                        ? "border-brand-neon bg-white shadow-[0_0_15px_rgba(204,255,0,0.15)] ring-1 ring-brand-neon/50 scale-[1.01]"
                                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm hover:scale-[1.005]"
                                )}
                            >
                                {/* Custom Radio Circle */}
                                <div className={cn(
                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300",
                                    isSelected
                                        ? "border-brand-neon bg-brand-neon"
                                        : "border-gray-200 group-hover:border-gray-300 bg-gray-50"
                                )}>
                                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-black shadow-sm" />}
                                </div>
                                <span className={cn(
                                    "text-base font-medium transition-colors",
                                    isSelected ? "text-black" : "text-gray-600 group-hover:text-gray-900"
                                )}>
                                    {option}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (question.type === 'short-answer') {
            return (
                <div className="relative">
                    <input
                        type="text"
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-4 text-lg text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-brand-neon focus:outline-none focus:ring-4 focus:ring-brand-neon/10"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        Press Enter to confirm
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="group flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-black"
                            >
                                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{quiz.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                <span className="inline-block h-2 w-2 rounded-full bg-brand-neon animate-pulse" />
                                In Progress
                            </div>
                        </div>
                    </div>

                    {timeRemaining !== null && (
                        <div className={cn(
                            "flex items-center gap-2 rounded-xl px-4 py-2 border font-mono font-bold transition-all",
                            timeRemaining <= 60
                                ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
                                : "bg-black text-brand-neon border-black shadow-lg shadow-brand-neon/20"
                        )}>
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(timeRemaining)}</span>
                        </div>
                    )}
                </div>

                {/* Question Area */}
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm relative overflow-hidden">
                    {/* Decorative top border */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-neon to-transparent opacity-50" />

                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
                            Question {currentIndex + 1} <span className="text-gray-300">/</span> {totalQuestions}
                        </span>
                        <div className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                            "bg-gray-100 text-gray-600 border border-gray-200"
                        )}>
                            {currentQuestion.type.replace('-', ' ')}
                        </div>
                    </div>

                    <h3 className="mb-8 text-2xl font-bold leading-relaxed text-gray-900">
                        {currentQuestion.question}
                    </h3>

                    {renderAnswerInput(currentQuestion)}
                </div>

                {/* Navigation Actions */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                            currentIndex === 0
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100 hover:text-black"
                        )}
                    >
                        <ChevronLeft className="h-5 w-5" />
                        Previous
                    </button>

                    <div className="flex gap-3">
                        {currentIndex === totalQuestions - 1 ? (
                            <NeonButton onClick={handleSubmitClick} className="w-full sm:w-auto px-8">
                                Submit Quiz
                            </NeonButton>
                        ) : (
                            <NeonButton variant="outline" onClick={handleNext} className="w-full sm:w-auto px-8">
                                Next Question
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </NeonButton>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Summary</h3>
                        <div className="flex items-center gap-2 text-xs font-medium bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                            <CheckCircle2 className="h-3.5 w-3.5 text-brand-neon fill-black" />
                            {answeredCount}/{totalQuestions} Done
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2 mb-6">
                        {quiz.questions.map((question, index) => {
                            const status = getQuestionStatus(index);
                            return (
                                <button
                                    key={question.id}
                                    onClick={() => handleGoToQuestion(index)}
                                    className={cn(
                                        "h-10 w-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all relative",
                                        status === 'current'
                                            ? "bg-brand-neon text-black shadow-lg shadow-brand-neon/30 ring-2 ring-black scale-105 z-10"
                                            : status === 'answered'
                                                ? "bg-black text-brand-neon border border-gray-800"
                                                : "bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100 hover:border-gray-200"
                                    )}
                                >
                                    {index + 1}
                                    {status === 'current' && (
                                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-black border border-white" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-3 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="h-3 w-3 rounded bg-brand-neon ring-1 ring-black" />
                            <span>Current Question</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="h-3 w-3 rounded bg-black border border-brand-neon/50 text-brand-neon flex items-center justify-center" />
                            <span>Answered</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="h-3 w-3 rounded bg-gray-50 border border-gray-200" />
                            <span>Not visited</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit confirmation dialog */}
            <ConfirmDialog
                isOpen={showSubmitConfirm}
                title="Finish Quiz?"
                message={`You have ${totalQuestions - answeredCount} unanswered questions remaining. Are you sure you want to finish?`}
                confirmLabel="Yes, Submit"
                cancelLabel="Keep Going"
                variant="warning"
                onConfirm={() => {
                    setShowSubmitConfirm(false);
                    handleSubmit();
                }}
                onCancel={() => setShowSubmitConfirm(false)}
            />
        </div>
    );
}
