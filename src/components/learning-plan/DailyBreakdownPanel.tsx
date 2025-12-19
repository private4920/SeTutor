"use client";

import { useState, useCallback } from 'react';
import { DailyPlan } from './mockLearningPlanGenerator';

export interface DailyBreakdownPanelProps {
  day: DailyPlan;
  onClose?: () => void;
  onCompletionChange?: (dayId: string, isCompleted: boolean) => void;
  onNotesChange?: (dayId: string, notes: string) => void;
}

interface TopicWithTime {
  name: string;
  estimatedMinutes: number;
}

function getTopicsWithTime(topics: string[], totalMinutes: number): TopicWithTime[] {
  if (topics.length === 0) return [];
  const minutesPerTopic = Math.floor(totalMinutes / topics.length);
  const remainder = totalMinutes % topics.length;
  
  return topics.map((topic, index) => ({
    name: topic,
    estimatedMinutes: minutesPerTopic + (index < remainder ? 1 : 0),
  }));
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function DailyBreakdownPanel({
  day,
  onClose,
  onCompletionChange,
  onNotesChange,
}: DailyBreakdownPanelProps) {
  const [notes, setNotes] = useState(day.notes || '');
  const [isCompleted, setIsCompleted] = useState(day.isCompleted);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const handleCompletionToggle = useCallback(() => {
    const newValue = !isCompleted;
    setIsCompleted(newValue);
    onCompletionChange?.(day.id, newValue);
  }, [isCompleted, day.id, onCompletionChange]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  }, []);

  const handleNotesSave = useCallback(() => {
    onNotesChange?.(day.id, notes);
    setIsEditingNotes(false);
  }, [day.id, notes, onNotesChange]);

  const handleNotesCancel = useCallback(() => {
    setNotes(day.notes || '');
    setIsEditingNotes(false);
  }, [day.notes]);

  const topicsWithTime = getTopicsWithTime(day.topics, day.estimatedMinutes);

  const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-lg border border-blue-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-blue-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Completion Checkbox */}
            <button
              onClick={handleCompletionToggle}
              className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                isCompleted
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
              aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {isCompleted && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">
                  Day {day.dayNumber}
                </h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  day.isRestDay 
                    ? 'bg-amber-100 text-amber-700' 
                    : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                }`}>
                  {day.isRestDay ? 'Rest Day' : isCompleted ? 'Completed' : 'Study Day'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{formattedDate}</p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-white/50 hover:text-gray-700 transition-colors"
              aria-label="Close details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {day.isRestDay ? (
          /* Rest Day Content */
          <div className="flex items-center gap-4 rounded-lg bg-amber-50 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-amber-900">Take a well-deserved break!</p>
              <p className="text-sm text-amber-700 mt-1">
                Rest days are essential for consolidating what you&apos;ve learned. 
                Light review is optional but can help reinforce key concepts.
              </p>
            </div>
          </div>
        ) : (
          /* Study Day Content */
          <div className="space-y-6">
            {/* Topics Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Topics to Cover
              </h4>
              <div className="space-y-2">
                {topicsWithTime.map((topic, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-800">{topic.name}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                      {formatTime(topic.estimatedMinutes)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-end gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Total: <strong>{formatTime(day.estimatedMinutes)}</strong></span>
              </div>
            </div>

            {/* Related Materials Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Related Materials
              </h4>
              {day.materials.length > 0 ? (
                <ul className="space-y-2">
                  {day.materials.map((material, index) => (
                    <li 
                      key={index} 
                      className="flex items-center gap-3 text-sm text-gray-700 rounded-lg bg-amber-50 px-4 py-2.5 border border-amber-100"
                    >
                      <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {material}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No specific materials assigned for this day.</p>
              )}
            </div>

            {/* Suggested Activities Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Suggested Activities
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {day.activities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2 rounded-lg bg-purple-50 px-3 py-2.5 border border-purple-100"
                  >
                    <svg className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm text-gray-700">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Personal Notes Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Personal Notes
            </h4>
            {!isEditingNotes && notes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>
          
          {isEditingNotes ? (
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add your personal notes, reflections, or reminders for this day..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                rows={4}
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleNotesCancel}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNotesSave}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Save Notes
                </button>
              </div>
            </div>
          ) : notes ? (
            <div className="rounded-lg bg-green-50 px-4 py-3 border border-green-100">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="w-full rounded-lg border-2 border-dashed border-gray-200 px-4 py-4 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add personal notes for this day
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
