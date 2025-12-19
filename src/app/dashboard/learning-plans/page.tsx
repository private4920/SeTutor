"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/lib/firebase/ProtectedRoute";
import { useAuth } from "@/lib/firebase/AuthContext";
import { DashboardLayout } from "@/components/dashboard";
import { DocumentSelectionTree } from "@/components/flashcards";
import { 
  LearningPlanConfigForm, 
  LearningPlanConfig,
  LearningPlanOverview,
  LearningPlanTimeline,
  DailyBreakdownPanel,
  LearningPlanProgressTracking,
  GeneratedLearningPlan,
  DailyPlan,
  generateMockLearningPlan,
  generateRealistic2WeekPlan,
} from "@/components/learning-plan";
import { useFolders } from "@/lib/hooks/useFolders";
import { useDocuments } from "@/lib/hooks/useDocuments";

type GeneratorState = 'selection' | 'generating' | 'results';

function LearningPlanGeneratorContent() {
  const { user } = useAuth();
  const { folders, fetchFolders, loading: foldersLoading } = useFolders();
  const { documents, fetchDocuments, loading: documentsLoading } = useDocuments();
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(new Set());
  const [generatorState, setGeneratorState] = useState<GeneratorState>('selection');
  const [currentConfig, setCurrentConfig] = useState<LearningPlanConfig | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedLearningPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<DailyPlan | null>(null);

  // Fetch folders and documents on mount
  useEffect(() => {
    if (user?.uid) {
      fetchFolders();
      fetchDocuments();
    }
  }, [user?.uid, fetchFolders, fetchDocuments]);

  const handleSelectionChange = useCallback((newSelection: Set<string>) => {
    setSelectedDocumentIds(newSelection);
  }, []);

  const getDurationLabel = (config: LearningPlanConfig): string => {
    switch (config.duration) {
      case '1-week': return '1 week';
      case '2-weeks': return '2 weeks';
      case '1-month': return '1 month';
      case 'custom': return `${config.customDays} days`;
    }
  };

  const handleGenerate = useCallback(async (config: LearningPlanConfig) => {
    setCurrentConfig(config);
    setGeneratorState('generating');
    setGenerationProgress(0);

    // Simulate generation progress (mock implementation)
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate generation completion and create mock learning plan
    setTimeout(() => {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Generate the mock learning plan
      const plan = generateMockLearningPlan(config, Array.from(selectedDocumentIds));
      setGeneratedPlan(plan);
      setGeneratorState('results');
    }, 3500);
  }, [selectedDocumentIds]);

  const handleBackToSelection = useCallback(() => {
    setGeneratorState('selection');
    setCurrentConfig(null);
    setGenerationProgress(0);
    setGeneratedPlan(null);
    setSelectedDay(null);
  }, []);

  const handleDayClick = useCallback((day: DailyPlan) => {
    setSelectedDay(prevDay => prevDay?.id === day.id ? null : day);
  }, []);

  const handleTitleChange = useCallback((newTitle: string) => {
    if (generatedPlan) {
      setGeneratedPlan({
        ...generatedPlan,
        title: newTitle,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [generatedPlan]);

  const handleCompletionChange = useCallback((dayId: string, isCompleted: boolean) => {
    if (generatedPlan) {
      const updatedDailyPlans = generatedPlan.dailyPlans.map(day =>
        day.id === dayId ? { ...day, isCompleted } : day
      );
      const completedDays = updatedDailyPlans.filter(d => d.isCompleted).length;
      
      setGeneratedPlan({
        ...generatedPlan,
        dailyPlans: updatedDailyPlans,
        completedDays,
        updatedAt: new Date().toISOString(),
      });
      
      // Update selected day if it's the one being changed
      if (selectedDay?.id === dayId) {
        setSelectedDay({ ...selectedDay, isCompleted });
      }
    }
  }, [generatedPlan, selectedDay]);

  const handleNotesChange = useCallback((dayId: string, notes: string) => {
    if (generatedPlan) {
      const updatedDailyPlans = generatedPlan.dailyPlans.map(day =>
        day.id === dayId ? { ...day, notes } : day
      );
      
      setGeneratedPlan({
        ...generatedPlan,
        dailyPlans: updatedDailyPlans,
        updatedAt: new Date().toISOString(),
      });
      
      // Update selected day if it's the one being changed
      if (selectedDay?.id === dayId) {
        setSelectedDay({ ...selectedDay, notes });
      }
    }
  }, [generatedPlan, selectedDay]);

  const handlePlanUpdate = useCallback((updatedPlan: GeneratedLearningPlan) => {
    setGeneratedPlan(updatedPlan);
  }, []);

  const handleSave = useCallback(() => {
    // In a real app, this would save to the backend
    alert('Learning plan saved successfully!');
  }, []);

  const handleShare = useCallback(() => {
    // In a real app, this would generate a shareable link
    if (navigator.share) {
      navigator.share({
        title: generatedPlan?.title || 'My Learning Plan',
        text: 'Check out my learning plan!',
        url: window.location.href,
      }).catch(() => {
        // User cancelled or share failed
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }, [generatedPlan?.title]);

  const handleReset = useCallback(() => {
    if (generatedPlan && confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      const resetDailyPlans = generatedPlan.dailyPlans.map(day => ({
        ...day,
        isCompleted: false,
        notes: '',
      }));
      
      const resetMilestones = generatedPlan.milestones.map(m => ({
        ...m,
        isCompleted: false,
      }));
      
      setGeneratedPlan({
        ...generatedPlan,
        dailyPlans: resetDailyPlans,
        milestones: resetMilestones,
        completedDays: 0,
        currentStreak: 0,
        updatedAt: new Date().toISOString(),
      });
      setSelectedDay(null);
    }
  }, [generatedPlan]);

  const handleDuplicate = useCallback(() => {
    if (generatedPlan) {
      const duplicatedPlan: GeneratedLearningPlan = {
        ...generatedPlan,
        id: `plan-${Date.now()}`,
        title: `${generatedPlan.title} (Copy)`,
        dailyPlans: generatedPlan.dailyPlans.map(day => ({
          ...day,
          id: `day-copy-${day.dayNumber}`,
          isCompleted: false,
          notes: '',
        })),
        milestones: generatedPlan.milestones.map(m => ({
          ...m,
          id: `milestone-copy-${m.targetDay}`,
          isCompleted: false,
        })),
        completedDays: 0,
        currentStreak: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setGeneratedPlan(duplicatedPlan);
      alert('Plan duplicated! You can now modify this copy.');
    }
  }, [generatedPlan]);

  const handleExport = useCallback((format: 'google-calendar' | 'ical' | 'pdf') => {
    if (!generatedPlan) return;

    switch (format) {
      case 'google-calendar': {
        // Generate Google Calendar URL
        const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
        const title = encodeURIComponent(generatedPlan.title);
        const startDate = generatedPlan.startDate.replace(/-/g, '');
        const endDate = generatedPlan.endDate.replace(/-/g, '');
        const details = encodeURIComponent(`Learning plan with ${generatedPlan.totalDays} days of study.`);
        const url = `${baseUrl}&text=${title}&dates=${startDate}/${endDate}&details=${details}`;
        window.open(url, '_blank');
        break;
      }
      case 'ical': {
        // Generate iCal file content
        const events = generatedPlan.dailyPlans
          .filter(day => !day.isRestDay)
          .map(day => {
            const dateStr = day.date.replace(/-/g, '');
            return `BEGIN:VEVENT
DTSTART:${dateStr}
DTEND:${dateStr}
SUMMARY:Day ${day.dayNumber}: ${day.topics.join(', ')}
DESCRIPTION:Topics: ${day.topics.join(', ')}\\nActivities: ${day.activities.join(', ')}
END:VEVENT`;
          }).join('\n');

        const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SeTutor//Learning Plan//EN
${events}
END:VCALENDAR`;

        const blob = new Blob([icalContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generatedPlan.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
        a.click();
        URL.revokeObjectURL(url);
        break;
      }
      case 'pdf': {
        // For PDF, we'll use the browser's print functionality
        window.print();
        break;
      }
    }
  }, [generatedPlan]);

  // Demo: Load a realistic 2-week plan for demonstration
  const handleLoadDemoPlan = useCallback(() => {
    const demoPlan = generateRealistic2WeekPlan(
      Array.from(selectedDocumentIds),
      'Master Web Development Fundamentals'
    );
    setGeneratedPlan(demoPlan);
    setGeneratorState('results');
  }, [selectedDocumentIds]);

  const isLoading = foldersLoading || documentsLoading;
  const selectedCount = selectedDocumentIds.size;
  const isGenerating = generatorState === 'generating';

  // Render loading state during generation
  if (generatorState === 'generating' && currentConfig) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Generating Learning Plan</h1>
            <p className="mt-1 text-sm text-gray-600">
              Please wait while we analyze your documents and create a personalized study schedule.
            </p>
          </div>

          {/* Loading State */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <svg
                  className="h-16 w-16 animate-spin text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="mt-4 text-lg font-medium text-gray-900">
                Creating your {getDurationLabel(currentConfig)} learning plan...
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Analyzing {selectedCount} document{selectedCount !== 1 ? 's' : ''}
              </p>
              
              {/* Progress bar */}
              <div className="mt-4 w-full max-w-xs">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-xs text-gray-500">
                  {Math.round(generationProgress)}% complete
                </p>
              </div>
              
              {/* Config summary */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {getDurationLabel(currentConfig)}
                </span>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 capitalize">
                  {currentConfig.intensity} intensity
                </span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {currentConfig.hoursPerDay} hr{currentConfig.hoursPerDay !== 1 ? 's' : ''}/day
                </span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render results state with LearningPlanOverview and Timeline
  if (generatorState === 'results' && generatedPlan) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-6 print:space-y-4">
          <LearningPlanOverview
            plan={generatedPlan}
            onTitleChange={handleTitleChange}
            onBack={handleBackToSelection}
          />
          
          {/* Progress Tracking Section */}
          <LearningPlanProgressTracking
            plan={generatedPlan}
            onPlanUpdate={handlePlanUpdate}
            onSave={handleSave}
            onShare={handleShare}
            onReset={handleReset}
            onDuplicate={handleDuplicate}
            onExport={handleExport}
          />
          
          {/* Timeline Section */}
          <LearningPlanTimeline
            dailyPlans={generatedPlan.dailyPlans}
            milestones={generatedPlan.milestones}
            startDate={generatedPlan.startDate}
            onDayClick={handleDayClick}
            selectedDayId={selectedDay?.id}
          />
          
          {/* Daily Breakdown Panel */}
          {selectedDay && (
            <DailyBreakdownPanel
              day={selectedDay}
              onClose={() => setSelectedDay(null)}
              onCompletionChange={handleCompletionChange}
              onNotesChange={handleNotesChange}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Default: Selection state
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Learning Plan</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a personalized study schedule based on your documents and learning goals.
          </p>
        </div>

        {/* Source Selection Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Source Documents</h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose the PDF documents you want to include in your learning plan.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="h-8 w-8 animate-spin text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm text-gray-500">Loading documents...</span>
              </div>
            </div>
          ) : (
            <DocumentSelectionTree
              folders={folders}
              documents={documents}
              selectedDocumentIds={selectedDocumentIds}
              onSelectionChange={handleSelectionChange}
            />
          )}
        </div>

        {/* Selection Summary */}
        {selectedCount > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-blue-700">
                  Ready to configure your learning plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Configuration Options</h2>
            <p className="mt-1 text-sm text-gray-500">
              Customize your learning plan settings.
            </p>
          </div>
          <LearningPlanConfigForm
            selectedDocumentCount={selectedCount}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Demo Plan Button */}
        <div className="rounded-lg border border-dashed border-purple-300 bg-purple-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-purple-900">Try a Demo Plan</h3>
              <p className="mt-1 text-sm text-purple-700">
                Load a realistic 2-week learning plan to explore all features.
              </p>
            </div>
            <button
              onClick={handleLoadDemoPlan}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              Load Demo Plan
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function LearningPlanGeneratorPage() {
  return (
    <ProtectedRoute redirectTo="/">
      <LearningPlanGeneratorContent />
    </ProtectedRoute>
  );
}
