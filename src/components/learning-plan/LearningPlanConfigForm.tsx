"use client";

import { useState } from 'react';

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Study Duration Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Study Duration
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([
            { value: '1-week', label: '1 Week', days: 7 },
            { value: '2-weeks', label: '2 Weeks', days: 14 },
            { value: '1-month', label: '1 Month', days: 30 },
            { value: 'custom', label: 'Custom', days: null },
          ] as const).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDuration(option.value)}
              disabled={isGenerating}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                duration === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              } ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span>{option.label}</span>
                {option.days && (
                  <span className="text-xs text-gray-400">{option.days} days</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Duration Slider */}
        {duration === 'custom' && (
          <div className="mt-3">
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="customDays"
                min={3}
                max={90}
                step={1}
                value={customDays}
                onChange={(e) => setCustomDays(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
                disabled={isGenerating}
              />
              <span className="w-20 text-center text-sm font-semibold text-gray-900">
                {customDays} days
              </span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>3 days</span>
              <span>90 days</span>
            </div>
          </div>
        )}
      </div>

      {/* Study Intensity Radio Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Study Intensity
        </label>
        <div className="mt-3 space-y-3">
          {([
            { 
              value: 'light', 
              label: 'Light', 
              description: 'Relaxed pace with more review time',
              icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ),
              color: 'green'
            },
            { 
              value: 'moderate', 
              label: 'Moderate', 
              description: 'Balanced learning with steady progress',
              icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ),
              color: 'yellow'
            },
            { 
              value: 'intensive', 
              label: 'Intensive', 
              description: 'Fast-paced with comprehensive coverage',
              icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              color: 'red'
            },
          ] as const).map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                intensity === option.value
                  ? option.color === 'green'
                    ? 'border-green-500 bg-green-50'
                    : option.color === 'yellow'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input
                type="radio"
                name="intensity"
                value={option.value}
                checked={intensity === option.value}
                onChange={() => setIntensity(option.value)}
                disabled={isGenerating}
                className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-start gap-3">
                <div className={`${
                  option.color === 'green' ? 'text-green-600' :
                  option.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {option.icon}
                </div>
                <div>
                  <span className="block font-medium text-gray-900">{option.label}</span>
                  <span className="block text-sm text-gray-500">{option.description}</span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Learning Goals Text Area */}
      <div>
        <label htmlFor="learningGoals" className="block text-sm font-medium text-gray-700">
          Learning Goals <span className="text-gray-400">(optional)</span>
        </label>
        <div className="mt-2">
          <textarea
            id="learningGoals"
            value={learningGoals}
            onChange={(e) => setLearningGoals(e.target.value)}
            placeholder="e.g., Master the fundamentals of machine learning, Prepare for certification exam, Understand key concepts for project..."
            disabled={isGenerating}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Describe what you want to achieve with this learning plan
        </p>
      </div>

      {/* Study Time Per Day Slider */}
      <div>
        <label htmlFor="hoursPerDay" className="block text-sm font-medium text-gray-700">
          Study Time Per Day
        </label>
        <div className="mt-2">
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="hoursPerDay"
              min={0.5}
              max={8}
              step={0.5}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
              disabled={isGenerating}
            />
            <span className="w-20 text-center text-sm font-semibold text-gray-900">
              {hoursPerDay} hr{hoursPerDay !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>0.5 hr</span>
            <span>8 hrs</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Total study time: approximately {getTotalHours()} hours over {getDurationDays()} days
        </p>
      </div>

      {/* Start Date Picker */}
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <div className="mt-2">
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isGenerating}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          When do you want to start your learning plan?
        </p>
      </div>

      {/* Generate Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!canGenerate}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
            canGenerate
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Generate Learning Plan</span>
            </>
          )}
        </button>
        {selectedDocumentCount === 0 && (
          <p className="mt-2 text-center text-xs text-amber-600">
            Please select at least one document to generate a learning plan
          </p>
        )}
      </div>
    </form>
  );
}
