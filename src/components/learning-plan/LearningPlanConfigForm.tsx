"use client";

import { useState } from 'react';
import { NeonButton } from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Zap,
  Target,
  BookOpen,
  TrendingUp,
  BarChart3
} from "lucide-react";

export type StudyDuration = '1-week' | '2-weeks' | '1-month' | 'custom';
export type StudyIntensity = 'light' | 'moderate' | 'intensive';

export interface LearningPlanConfig {
  duration: StudyDuration;
  customDays?: number;
  intensity: StudyIntensity;
  learningGoals: string;
  hoursPerDay: number;
  startDate: string;
}

export interface LearningPlanConfigFormProps {
  selectedDocumentCount: number;
  onGenerate: (config: LearningPlanConfig) => void;
  isGenerating?: boolean;
}

export function LearningPlanConfigForm({
  selectedDocumentCount,
  onGenerate,
  isGenerating = false,
}: LearningPlanConfigFormProps) {
  const [duration, setDuration] = useState<StudyDuration>('2-weeks');
  const [customDays, setCustomDays] = useState(21);
  const [intensity, setIntensity] = useState<StudyIntensity>('moderate');
  const [learningGoals, setLearningGoals] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0] ?? '';
  });

  const canGenerate = selectedDocumentCount > 0 && !isGenerating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canGenerate) {
      onGenerate({
        duration,
        customDays: duration === 'custom' ? customDays : undefined,
        intensity,
        learningGoals,
        hoursPerDay,
        startDate,
      });
    }
  };

  const getDurationDays = (): number => {
    switch (duration) {
      case '1-week': return 7;
      case '2-weeks': return 14;
      case '1-month': return 30;
      case 'custom': return customDays;
    }
  };

  const getTotalHours = (): number => {
    return getDurationDays() * hoursPerDay;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Study Duration Selector */}
      <div>
        <label className="mb-3 block text-sm font-bold text-gray-900">
          Study Duration
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: '1-week', label: '1 Week', days: 7 },
            { value: '2-weeks', label: '2 Weeks', days: 14 },
            { value: '1-month', label: '1 Month', days: 30 },
            { value: 'custom', label: 'Custom', days: null },
          ].map((option) => {
            const isSelected = duration === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuration(option.value as StudyDuration)}
                disabled={isGenerating}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all",
                  isSelected
                    ? "border-black bg-black text-brand-neon shadow-lg"
                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50 bg-white"
                )}
              >
                <span className="font-bold text-sm">{option.label}</span>
                {option.days && (
                  <span className={cn("text-xs", isSelected ? "text-gray-400" : "text-gray-400")}>{option.days} days</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Duration Slider */}
        {duration === 'custom' && (
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Custom Days</span>
              <span className="font-mono font-bold">{customDays} days</span>
            </div>
            <input
              type="range"
              min={3}
              max={90}
              step={1}
              value={customDays}
              onChange={(e) => setCustomDays(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-black focus:outline-none"
              disabled={isGenerating}
            />
          </div>
        )}
      </div>

      {/* Study Intensity */}
      <div>
        <label className="mb-3 block text-sm font-bold text-gray-900">
          Study Intensity
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              value: 'light',
              label: 'Light',
              desc: 'Relaxed pace',
              icon: BookOpen,
            },
            {
              value: 'moderate',
              label: 'Moderate',
              desc: 'Steady progress',
              icon: TrendingUp,
            },
            {
              value: 'intensive',
              label: 'Intensive',
              desc: 'Fast-paced',
              icon: Zap,
            },
          ].map((option) => {
            const isSelected = intensity === option.value;
            const Icon = option.icon;
            return (
              <div
                key={option.value}
                onClick={() => !isGenerating && setIntensity(option.value as StudyIntensity)}
                className={cn(
                  "cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
                  isSelected
                    ? "border-brand-neon bg-white shadow-neon-glow ring-1 ring-brand-neon"
                    : "border-gray-100 bg-white hover:border-gray-200"
                )}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={cn(
                    "rounded-full p-2 transition-colors",
                    isSelected ? "bg-brand-neon text-black" : "bg-gray-100 text-gray-400"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className={cn("block font-bold text-sm", isSelected ? "text-black" : "text-gray-900")}>
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500">{option.desc}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Study Time Per Day Slider */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Clock className="h-4 w-4 text-brand-neon fill-black" />
            Study Time / Day
          </label>
          <span className="flex h-8 w-20 items-center justify-center rounded-lg bg-black font-mono font-bold text-brand-neon text-xs">
            {hoursPerDay} hours
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={8}
          step={0.5}
          value={hoursPerDay}
          onChange={(e) => setHoursPerDay(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-black focus:outline-none"
          disabled={isGenerating}
        />
        <p className="mt-4 text-xs font-medium text-gray-500 flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          Total: ~{getTotalHours()} hours over {getDurationDays()} days
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Start Date */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-900">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isGenerating}
              className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50 py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 focus:border-black focus:bg-white focus:outline-none transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Learning Goals */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-900">
            Goals <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              placeholder="e.g. Master Machine Learning"
              disabled={isGenerating}
              className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50 py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-black focus:bg-white focus:outline-none transition-all"
            />
          </div>
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
          {isGenerating ? "Creating Plan..." : "Generate Learning Plan"}
        </NeonButton>
      </div>
    </form>
  );
}
