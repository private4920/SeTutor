"use client";

import { useState, useCallback } from 'react';
import { GeneratedLearningPlan, Milestone } from './mockLearningPlanGenerator';

export interface LearningPlanOverviewProps {
  plan: GeneratedLearningPlan;
  onTitleChange?: (newTitle: string) => void;
  onBack?: () => void;
}

function MilestoneItem({ 
  milestone, 
  isLast,
  currentDay,
}: { 
  milestone: Milestone; 
  isLast: boolean;
  currentDay: number;
}) {
  const isPast = currentDay >= milestone.targetDay;
  const isCurrent = !isPast && currentDay >= milestone.targetDay - 3;
  
  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
          milestone.isCompleted
            ? 'border-green-500 bg-green-500 text-white'
            : isCurrent
            ? 'border-blue-500 bg-blue-50 text-blue-600'
            : isPast
            ? 'border-amber-500 bg-amber-50 text-amber-600'
            : 'border-gray-300 bg-white text-gray-400'
        }`}>
          {milestone.isCompleted ? (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 ${
            milestone.isCompleted ? 'bg-green-300' : 'bg-gray-200'
          }`} />
        )}
      </div>
      
      {/* Milestone content */}
      <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className={`font-medium ${
              milestone.isCompleted
                ? 'text-green-700'
                : isCurrent
                ? 'text-blue-700'
                : 'text-gray-900'
            }`}>
              {milestone.title}
            </h4>
            <p className="mt-0.5 text-sm text-gray-500">{milestone.description}</p>
          </div>
          <span className={`flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
            milestone.isCompleted
              ? 'bg-green-100 text-green-700'
              : isCurrent
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            Day {milestone.targetDay}
          </span>
        </div>
      </div>
    </div>
  );
}

export function LearningPlanOverview({
  plan,
  onTitleChange,
  onBack,
}: LearningPlanOverviewProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(plan.title);

  const handleTitleSave = useCallback(() => {
    if (editedTitle.trim() && editedTitle !== plan.title) {
      onTitleChange?.(editedTitle.trim());
    }
    setIsEditingTitle(false);
  }, [editedTitle, plan.title, onTitleChange]);

  const handleTitleCancel = useCallback(() => {
    setEditedTitle(plan.title);
    setIsEditingTitle(false);
  }, [plan.title]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  }, [handleTitleSave, handleTitleCancel]);

  // Format dates for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate current day (for demo, assume day 1)
  const currentDay = plan.completedDays + 1;

  // Calculate progress percentage
  const progressPercentage = Math.round((plan.completedDays / plan.totalDays) * 100);

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label="Go back"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <div>
            <p className="text-sm text-gray-500">Learning Plan</p>
            <h1 className="text-2xl font-bold text-gray-900">Plan Overview</h1>
          </div>
        </div>
      </div>

      {/* Plan Title Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="flex-1 rounded-lg border border-blue-300 px-3 py-2 text-xl font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter plan title..."
                />
                <button
                  onClick={handleTitleSave}
                  className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 transition-colors"
                  aria-label="Save title"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleTitleCancel}
                  className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 transition-colors"
                  aria-label="Cancel editing"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">{plan.title}</h2>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="rounded p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600 transition-all"
                  aria-label="Edit title"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Created on {formatDate(plan.createdAt)}
            </p>
          </div>
          
          {/* Intensity Badge */}
          <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
            plan.config.intensity === 'light'
              ? 'bg-green-100 text-green-700'
              : plan.config.intensity === 'moderate'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {plan.config.intensity} Intensity
          </span>
        </div>

        {/* Learning Goals */}
        {plan.config.learningGoals && (
          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Learning Goals</p>
                <p className="mt-1 text-sm text-blue-900">{plan.config.learningGoals}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Duration Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{plan.totalDays}</p>
              <p className="text-xs text-gray-500">Total Days</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{plan.totalStudyHours}</p>
              <p className="text-xs text-gray-500">Study Hours</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{plan.studyDaysCount}</p>
              <p className="text-xs text-gray-500">Study Days</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{plan.restDaysCount}</p>
              <p className="text-xs text-gray-500">Rest Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range and Completion */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(plan.startDate)}</p>
            </div>
            <div className="hidden sm:block">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estimated Completion</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(plan.endDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{plan.config.hoursPerDay} hrs/day</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">{plan.sourceDocuments.length} document{plan.sourceDocuments.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{progressPercentage}% complete</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {plan.completedDays} of {plan.totalDays} days completed
          </p>
        </div>
      </div>

      {/* Key Milestones */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Key Milestones</h3>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            {plan.milestones.filter(m => m.isCompleted).length}/{plan.milestones.length} completed
          </span>
        </div>
        
        <div className="space-y-0">
          {plan.milestones.map((milestone, index) => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              isLast={index === plan.milestones.length - 1}
              currentDay={currentDay}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
