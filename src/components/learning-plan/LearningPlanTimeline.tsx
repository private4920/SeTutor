"use client";

import { useState, useMemo, useCallback } from 'react';
import { DailyPlan, Milestone } from './mockLearningPlanGenerator';

export interface LearningPlanTimelineProps {
  dailyPlans: DailyPlan[];
  milestones: Milestone[];
  startDate: string;
  onDayClick?: (day: DailyPlan) => void;
  selectedDayId?: string | null;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  dailyPlan?: DailyPlan;
  milestone?: Milestone;
  isToday: boolean;
}

function getWeeksForMonth(year: number, month: number, dailyPlans: DailyPlan[], milestones: Milestone[]): CalendarDay[][] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Create a map of dates to daily plans
  const plansByDate = new Map<string, DailyPlan>();
  dailyPlans.forEach(plan => {
    plansByDate.set(plan.date, plan);
  });
  
  // Create a map of day numbers to milestones
  const milestonesByDay = new Map<number, Milestone>();
  milestones.forEach(milestone => {
    milestonesByDay.set(milestone.targetDay, milestone);
  });
  
  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];
  
  // Add padding days from previous month
  const startDayOfWeek = firstDayOfMonth.getDay();
  for (let i = 0; i < startDayOfWeek; i++) {
    const date = new Date(year, month, -startDayOfWeek + i + 1);
    currentWeek.push({
      date,
      dayNumber: 0,
      isCurrentMonth: false,
      isToday: false,
    });
  }
  
  // Add days of current month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0] ?? '';
    const dailyPlan = plansByDate.get(dateStr);
    const milestone = dailyPlan ? milestonesByDay.get(dailyPlan.dayNumber) : undefined;
    
    currentWeek.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      dailyPlan,
      milestone,
      isToday: date.getTime() === today.getTime(),
    });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Add padding days from next month
  if (currentWeek.length > 0) {
    const remainingDays = 7 - currentWeek.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      currentWeek.push({
        date,
        dayNumber: 0,
        isCurrentMonth: false,
        isToday: false,
      });
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
}

function DayCell({
  calendarDay,
  isSelected,
  onClick,
}: {
  calendarDay: CalendarDay;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const { date, isCurrentMonth, dailyPlan, milestone, isToday } = calendarDay;
  const hasContent = !!dailyPlan;
  const isRestDay = dailyPlan?.isRestDay ?? false;
  const isCompleted = dailyPlan?.isCompleted ?? false;
  const hasMilestone = !!milestone;
  
  const handleClick = useCallback(() => {
    if (hasContent && onClick) {
      onClick();
    }
  }, [hasContent, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && hasContent && onClick) {
      e.preventDefault();
      onClick();
    }
  }, [hasContent, onClick]);
  
  return (
    <div
      role={hasContent ? "button" : undefined}
      tabIndex={hasContent ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative min-h-[80px] p-1 border-b border-r border-gray-200
        ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
        ${hasContent ? 'cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500' : ''}
        ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50' : ''}
        transition-colors
      `}
      aria-label={hasContent ? `Day ${dailyPlan?.dayNumber}: ${isRestDay ? 'Rest day' : 'Study day'}${hasMilestone ? `, Milestone: ${milestone?.title}` : ''}` : undefined}
    >
      {/* Date number */}
      <div className={`
        flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full
        ${isToday ? 'bg-blue-600 text-white' : ''}
        ${!isToday && !isCurrentMonth ? 'text-gray-400' : ''}
        ${!isToday && isCurrentMonth ? 'text-gray-900' : ''}
      `}>
        {date.getDate()}
      </div>
      
      {/* Day content indicators */}
      {hasContent && (
        <div className="mt-1 space-y-1">
          {/* Study/Rest day indicator */}
          <div className={`
            flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium
            ${isRestDay 
              ? 'bg-amber-100 text-amber-700' 
              : isCompleted 
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }
          `}>
            {isRestDay ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="hidden sm:inline">Rest</span>
              </>
            ) : isCompleted ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Done</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">Study</span>
              </>
            )}
          </div>
          
          {/* Milestone indicator */}
          {hasMilestone && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="hidden sm:inline truncate">{milestone?.title}</span>
            </div>
          )}
          
          {/* Day number badge */}
          <div className="absolute bottom-1 right-1 text-[10px] text-gray-400 font-medium">
            D{dailyPlan?.dayNumber}
          </div>
        </div>
      )}
      
      {/* Today marker ring */}
      {isToday && (
        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
      )}
    </div>
  );
}

export function LearningPlanTimeline({
  dailyPlans,
  milestones,
  startDate,
  onDayClick,
  selectedDayId,
}: LearningPlanTimelineProps) {
  // Parse start date and determine initial month to display
  const initialDate = useMemo(() => new Date(startDate), [startDate]);
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  
  // Calculate the date range of the plan
  const dateRange = useMemo(() => {
    if (dailyPlans.length === 0) return { start: new Date(), end: new Date() };
    const start = new Date(dailyPlans[0]?.date ?? startDate);
    const end = new Date(dailyPlans[dailyPlans.length - 1]?.date ?? startDate);
    return { start, end };
  }, [dailyPlans, startDate]);
  
  // Generate calendar weeks for current month
  const weeks = useMemo(() => {
    return getWeeksForMonth(currentYear, currentMonth, dailyPlans, milestones);
  }, [currentYear, currentMonth, dailyPlans, milestones]);
  
  // Navigation handlers
  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }, [currentMonth]);
  
  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }, [currentMonth]);
  
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  }, []);
  
  // Format month/year for display
  const monthYearLabel = useMemo(() => {
    const date = new Date(currentYear, currentMonth);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentYear, currentMonth]);
  
  // Check if we can navigate (within plan date range with some buffer)
  const canGoPrevious = useMemo(() => {
    const prevMonth = new Date(currentYear, currentMonth - 1);
    const bufferStart = new Date(dateRange.start);
    bufferStart.setMonth(bufferStart.getMonth() - 1);
    return prevMonth >= bufferStart;
  }, [currentYear, currentMonth, dateRange.start]);
  
  const canGoNext = useMemo(() => {
    const nextMonth = new Date(currentYear, currentMonth + 1);
    const bufferEnd = new Date(dateRange.end);
    bufferEnd.setMonth(bufferEnd.getMonth() + 1);
    return nextMonth <= bufferEnd;
  }, [currentYear, currentMonth, dateRange.end]);
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              disabled={!canGoPrevious}
              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="min-w-[140px] text-center text-sm font-medium text-gray-900">
              {monthYearLabel}
            </span>
            <button
              onClick={goToNextMonth}
              disabled={!canGoNext}
              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 px-4 py-2 bg-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
          <span>Study Day</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
          <span>Rest Day</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200" />
          <span>Milestone</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span>Today</span>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map(day => (
              <div
                key={day}
                className="py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar weeks */}
          <div>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7">
                {week.map((calendarDay, dayIndex) => (
                  <DayCell
                    key={`${weekIndex}-${dayIndex}`}
                    calendarDay={calendarDay}
                    isSelected={calendarDay.dailyPlan?.id === selectedDayId}
                    onClick={calendarDay.dailyPlan ? () => onDayClick?.(calendarDay.dailyPlan!) : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Summary Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{dailyPlans.filter(d => !d.isRestDay).length}</span> study days,{' '}
          <span className="font-medium">{dailyPlans.filter(d => d.isRestDay).length}</span> rest days
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{dailyPlans.filter(d => d.isCompleted).length}</span> of{' '}
          <span className="font-medium">{dailyPlans.length}</span> days completed
        </div>
      </div>
    </div>
  );
}
