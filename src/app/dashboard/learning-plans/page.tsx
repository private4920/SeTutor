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
import { BrainCircuit, Loader2 } from "lucide-react";

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
    alert('Learning plan saved successfully!');
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: generatedPlan?.title || 'My Learning Plan',
        text: 'Check out my learning plan!',
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }, [generatedPlan?.title]);

  const handleReset = useCallback(() => {
    if (generatedPlan && confirm('Are you sure you want to reset all progress?')) {
      const resetDailyPlans = generatedPlan.dailyPlans.map(day => ({
        ...day,
        isCompleted: false,
        notes: '',
      }));
      setGeneratedPlan({
        ...generatedPlan,
        dailyPlans: resetDailyPlans,
        completedDays: 0,
        currentStreak: 0,
        updatedAt: new Date().toISOString(),
      });
      setSelectedDay(null);
    }
  }, [generatedPlan]);

  const handleDuplicate = useCallback(() => {
    if (generatedPlan) {
      setGeneratedPlan({
        ...generatedPlan,
        id: `plan-${Date.now()}`,
        title: `${generatedPlan.title} (Copy)`,
      });
      alert('Plan duplicated!');
    }
  }, [generatedPlan]);

  const handleExport = useCallback((format: 'google-calendar' | 'ical' | 'pdf') => {
    if (!generatedPlan) return;
    if (format === 'pdf') window.print();
    else alert(`${format} export started...`);
  }, [generatedPlan]);

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
        <div className="mx-auto flex h-[80vh] max-w-2xl flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-pulse rounded-full bg-brand-neon/20 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl border border-gray-100">
              <BrainCircuit className="h-12 w-12 text-black animate-pulse" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900">Creating Your Plan...</h2>
          <p className="mb-8 text-gray-500 max-w-md">
            Designing a {getDurationLabel(currentConfig)} schedule with {currentConfig.intensity} intensity.
          </p>

          <div className="w-full max-w-xs space-y-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-black transition-all duration-500 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-400">
              <span>Structuring Timeline</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render results
  if (generatorState === 'results' && generatedPlan) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-6 print:space-y-4">
          <LearningPlanOverview
            plan={generatedPlan}
            onTitleChange={handleTitleChange}
            onBack={handleBackToSelection}
          />
          <LearningPlanProgressTracking
            plan={generatedPlan}
            onPlanUpdate={handlePlanUpdate}
            onSave={handleSave}
            onShare={handleShare}
            onReset={handleReset}
            onDuplicate={handleDuplicate}
            onExport={handleExport}
          />
          <LearningPlanTimeline
            dailyPlans={generatedPlan.dailyPlans}
            milestones={generatedPlan.milestones}
            startDate={generatedPlan.startDate}
            onDayClick={handleDayClick}
            selectedDayId={selectedDay?.id}
          />
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
      <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Generate Learning Plan</h1>
          <p className="mt-2 text-gray-500">
            Create a personalized study schedule based on your documents and learning goals.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Select Source Documents</h2>
            <p className="text-sm text-gray-500">Choose the PDF documents you want to include in your learning plan.</p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-neon" />
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
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Configuration Options</h2>
            <p className="text-sm text-gray-500">Customize your learning plan settings.</p>
          </div>
          <div className="p-6">
            <LearningPlanConfigForm
              selectedDocumentCount={selectedCount}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        </section>

        {/* Demo Plan Button */}
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Try a Demo Plan</h3>
            <p className="mt-1 text-sm text-gray-500">
              Load a realistic 2-week learning plan to explore all features.
            </p>
          </div>
          <button
            onClick={handleLoadDemoPlan}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Load Demo Plan
          </button>
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
