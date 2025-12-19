"use client";

import { useState, useCallback, useMemo } from 'react';
import { GeneratedLearningPlan, DailyPlan } from './mockLearningPlanGenerator';

export interface LearningPlanProgressTrackingProps {
  plan: GeneratedLearningPlan;
  onPlanUpdate?: (updatedPlan: GeneratedLearningPlan) => void;
  onSave?: () => void;
  onShare?: () => void;
  onReset?: () => void;
  onDuplicate?: () => void;
  onExport?: (format: 'google-calendar' | 'ical' | 'pdf') => void;
}

interface DraggableTopic {
  dayId: string;
  topicIndex: number;
  topic: string;
}

function CircularProgress({ percentage, size = 120, strokeWidth = 10 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-blue-600 transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        <span className="text-xs text-gray-500">Complete</span>
      </div>
    </div>
  );
}

function CompletionCalendar({ dailyPlans }: { dailyPlans: DailyPlan[] }) {
  const weeks = useMemo(() => {
    const result: DailyPlan[][] = [];
    for (let i = 0; i < dailyPlans.length; i += 7) {
      result.push(dailyPlans.slice(i, i + 7));
    }
    return result;
  }, [dailyPlans]);

  return (
    <div className="space-y-1">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex gap-1">
          {week.map((day) => (
            <div
              key={day.id}
              className={`h-6 w-6 rounded-sm flex items-center justify-center text-[10px] font-medium ${
                day.isCompleted
                  ? 'bg-green-500 text-white'
                  : day.isRestDay
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
              title={`Day ${day.dayNumber}: ${day.isCompleted ? 'Completed' : day.isRestDay ? 'Rest' : 'Pending'}`}
            >
              {day.dayNumber}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}


function UpcomingTopicsPreview({ dailyPlans }: { dailyPlans: DailyPlan[] }) {
  const upcomingDays = useMemo(() => {
    return dailyPlans
      .filter(day => !day.isCompleted && !day.isRestDay)
      .slice(0, 3);
  }, [dailyPlans]);

  if (upcomingDays.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        All study days completed! 🎉
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingDays.map((day) => (
        <div key={day.id} className="rounded-lg bg-gray-50 p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Day {day.dayNumber}</span>
            <span className="text-xs text-gray-500">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="space-y-1">
            {day.topics.slice(0, 2).map((topic, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="truncate">{topic}</span>
              </div>
            ))}
            {day.topics.length > 2 && (
              <span className="text-xs text-gray-400">+{day.topics.length - 2} more</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function DraggableTopicItem({
  topic,
  index,
  dayId,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: {
  topic: string;
  index: number;
  dayId: string;
  onDragStart: (e: React.DragEvent, data: DraggableTopic) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetIndex: number, targetDayId: string) => void;
  isDragging: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, { dayId, topicIndex: index, topic })}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index, dayId)}
      className={`flex items-center gap-2 rounded-lg bg-white px-3 py-2 border border-gray-200 cursor-move hover:border-blue-300 hover:shadow-sm transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
      </svg>
      <span className="text-sm text-gray-700 flex-1">{topic}</span>
    </div>
  );
}

export function LearningPlanProgressTracking({
  plan,
  onPlanUpdate,
  onSave,
  onShare,
  onReset,
  onDuplicate,
  onExport,
}: LearningPlanProgressTrackingProps) {
  const [draggedTopic, setDraggedTopic] = useState<DraggableTopic | null>(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editedTopics, setEditedTopics] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Calculate progress metrics
  const progressPercentage = useMemo(() => {
    return Math.round((plan.completedDays / plan.totalDays) * 100);
  }, [plan.completedDays, plan.totalDays]);

  const studyStreak = useMemo(() => {
    let streak = 0;
    const sortedDays = [...plan.dailyPlans].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const day of sortedDays) {
      if (day.isCompleted && !day.isRestDay) {
        streak++;
      } else if (!day.isRestDay) {
        break;
      }
    }
    return streak;
  }, [plan.dailyPlans]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, data: DraggableTopic) => {
    setDraggedTopic(data);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number, targetDayId: string) => {
    e.preventDefault();
    if (!draggedTopic || !onPlanUpdate) return;

    const updatedDailyPlans = plan.dailyPlans.map(day => {
      if (day.id === draggedTopic.dayId && day.id === targetDayId) {
        // Reordering within same day
        const newTopics = [...day.topics];
        const [removed] = newTopics.splice(draggedTopic.topicIndex, 1);
        if (removed) {
          newTopics.splice(targetIndex, 0, removed);
        }
        return { ...day, topics: newTopics };
      }
      return day;
    });

    onPlanUpdate({
      ...plan,
      dailyPlans: updatedDailyPlans,
      updatedAt: new Date().toISOString(),
    });
    setDraggedTopic(null);
  }, [draggedTopic, plan, onPlanUpdate]);

  // Edit day's plan handlers
  const handleStartEdit = useCallback((day: DailyPlan) => {
    setEditingDayId(day.id);
    setEditedTopics([...day.topics]);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingDayId || !onPlanUpdate) return;

    const updatedDailyPlans = plan.dailyPlans.map(day =>
      day.id === editingDayId ? { ...day, topics: editedTopics } : day
    );

    onPlanUpdate({
      ...plan,
      dailyPlans: updatedDailyPlans,
      updatedAt: new Date().toISOString(),
    });
    setEditingDayId(null);
    setEditedTopics([]);
  }, [editingDayId, editedTopics, plan, onPlanUpdate]);

  const handleCancelEdit = useCallback(() => {
    setEditingDayId(null);
    setEditedTopics([]);
  }, []);

  const handleTopicChange = useCallback((index: number, value: string) => {
    setEditedTopics(prev => {
      const newTopics = [...prev];
      newTopics[index] = value;
      return newTopics;
    });
  }, []);

  const handleAddTopic = useCallback(() => {
    setEditedTopics(prev => [...prev, '']);
  }, []);

  const handleRemoveTopic = useCallback((index: number) => {
    setEditedTopics(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Get next incomplete study day for editing
  const nextStudyDay = useMemo(() => {
    return plan.dailyPlans.find(day => !day.isCompleted && !day.isRestDay);
  }, [plan.dailyPlans]);

  return (
    <div className="space-y-6">
      {/* Progress Overview Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress Tracking</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Circular Progress */}
          <div className="flex flex-col items-center justify-center">
            <CircularProgress percentage={progressPercentage} />
            <p className="mt-3 text-sm text-gray-600">
              {plan.completedDays} of {plan.totalDays} days
            </p>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            <div className="rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-4 border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">{studyStreak}</p>
                  <p className="text-xs text-orange-600">Day Streak</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {plan.dailyPlans.filter(d => d.isCompleted && !d.isRestDay).length}
                  </p>
                  <p className="text-xs text-green-600">Study Days Done</p>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Calendar */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Completion Calendar</p>
            <CompletionCalendar dailyPlans={plan.dailyPlans} />
          </div>
        </div>
      </div>


      {/* Upcoming Topics Preview */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Topics</h3>
        <UpcomingTopicsPreview dailyPlans={plan.dailyPlans} />
      </div>

      {/* Drag to Reorder Topics */}
      {nextStudyDay && !nextStudyDay.isRestDay && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Day {nextStudyDay.dayNumber} Topics
            </h3>
            {editingDayId === nextStudyDay.id ? (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleStartEdit(nextStudyDay)}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Plan
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            {editingDayId === nextStudyDay.id 
              ? 'Edit topics or drag to reorder them.'
              : 'Drag topics to reorder them for this day.'}
          </p>

          {editingDayId === nextStudyDay.id ? (
            <div className="space-y-2">
              {editedTopics.map((topic, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => handleTopicChange(index, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter topic..."
                  />
                  <button
                    onClick={() => handleRemoveTopic(index)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label="Remove topic"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddTopic}
                className="w-full rounded-lg border-2 border-dashed border-gray-200 px-3 py-2 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                + Add Topic
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {nextStudyDay.topics.map((topic, index) => (
                <DraggableTopicItem
                  key={`${nextStudyDay.id}-${index}`}
                  topic={topic}
                  index={index}
                  dayId={nextStudyDay.id}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragging={draggedTopic?.dayId === nextStudyDay.id && draggedTopic?.topicIndex === index}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onSave}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors"
          >
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Save</span>
          </button>

          <button
            onClick={onShare}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-green-300 transition-colors"
          >
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Share</span>
          </button>

          <button
            onClick={onReset}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-amber-300 transition-colors"
          >
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Reset</span>
          </button>

          <button
            onClick={onDuplicate}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-purple-300 transition-colors"
          >
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Duplicate</span>
          </button>
        </div>

        {/* Export Options */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export Plan
              <svg className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showExportMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-10">
                <button
                  onClick={() => { onExport?.('google-calendar'); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM12 18a6 6 0 110-12 6 6 0 010 12z"/>
                  </svg>
                  Google Calendar
                </button>
                <button
                  onClick={() => { onExport?.('ical'); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  iCal (.ics)
                </button>
                <button
                  onClick={() => { onExport?.('pdf'); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
