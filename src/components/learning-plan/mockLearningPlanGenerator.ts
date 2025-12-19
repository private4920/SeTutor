import { LearningPlanConfig, StudyDuration, StudyIntensity } from './LearningPlanConfigForm';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDay: number;
  isCompleted: boolean;
}

export interface DailyPlan {
  id: string;
  dayNumber: number;
  date: string;
  isRestDay: boolean;
  isCompleted: boolean;
  topics: string[];
  estimatedMinutes: number;
  materials: string[];
  activities: string[];
  notes: string;
}

export interface GeneratedLearningPlan {
  id: string;
  title: string;
  userId: string;
  sourceDocuments: string[];
  config: LearningPlanConfig;
  totalDays: number;
  totalStudyHours: number;
  studyDaysCount: number;
  restDaysCount: number;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  dailyPlans: DailyPlan[];
  completedDays: number;
  currentStreak: number;
  createdAt: string;
  updatedAt: string;
}

function getDurationDays(duration: StudyDuration, customDays?: number): number {
  switch (duration) {
    case '1-week': return 7;
    case '2-weeks': return 14;
    case '1-month': return 30;
    case 'custom': return customDays || 14;
  }
}

function getRestDayFrequency(intensity: StudyIntensity): number {
  switch (intensity) {
    case 'light': return 2; // Rest every 2 days
    case 'moderate': return 4; // Rest every 4 days
    case 'intensive': return 7; // Rest every 7 days
  }
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0] ?? '';
}

function generateMilestones(totalDays: number): Milestone[] {
  const milestones: Milestone[] = [];
  const milestoneCount = Math.min(5, Math.max(3, Math.floor(totalDays / 5)));
  
  const milestoneTemplates = [
    { title: 'Foundation Complete', description: 'Master the fundamental concepts and terminology' },
    { title: 'Core Concepts Mastered', description: 'Understand and apply core principles' },
    { title: 'Intermediate Progress', description: 'Connect concepts and build deeper understanding' },
    { title: 'Advanced Topics', description: 'Tackle complex topics and edge cases' },
    { title: 'Final Review', description: 'Comprehensive review and knowledge consolidation' },
  ];

  for (let i = 0; i < milestoneCount; i++) {
    const targetDay = Math.floor((totalDays / milestoneCount) * (i + 1));
    const template = milestoneTemplates[i] || milestoneTemplates[milestoneTemplates.length - 1];
    
    milestones.push({
      id: `milestone-${i + 1}`,
      title: template?.title ?? `Milestone ${i + 1}`,
      description: template?.description ?? 'Complete this phase of learning',
      targetDay,
      isCompleted: false,
    });
  }

  return milestones;
}

function generateDailyPlans(
  totalDays: number,
  startDate: string,
  hoursPerDay: number,
  intensity: StudyIntensity
): DailyPlan[] {
  const dailyPlans: DailyPlan[] = [];
  const restFrequency = getRestDayFrequency(intensity);
  
  const sampleTopics = [
    'Introduction and Overview',
    'Key Terminology and Definitions',
    'Fundamental Principles',
    'Core Concepts Deep Dive',
    'Practical Applications',
    'Case Studies Analysis',
    'Problem-Solving Techniques',
    'Advanced Topics',
    'Integration and Synthesis',
    'Review and Practice',
    'Assessment Preparation',
    'Knowledge Consolidation',
  ];

  const sampleActivities = [
    'Read chapter materials',
    'Watch video explanations',
    'Complete practice exercises',
    'Review flashcards',
    'Take practice quiz',
    'Write summary notes',
    'Discuss with study group',
    'Apply concepts to examples',
    'Create mind maps',
    'Review previous topics',
  ];

  for (let day = 1; day <= totalDays; day++) {
    const isRestDay = day % restFrequency === 0;
    const date = addDays(startDate, day - 1);
    
    if (isRestDay) {
      dailyPlans.push({
        id: `day-${day}`,
        dayNumber: day,
        date,
        isRestDay: true,
        isCompleted: false,
        topics: ['Rest and Review'],
        estimatedMinutes: 0,
        materials: [],
        activities: ['Light review of previous topics', 'Rest and recharge'],
        notes: '',
      });
    } else {
      const topicIndex = (day - 1) % sampleTopics.length;
      const dayTopics = [
        sampleTopics[topicIndex] ?? 'Study Session',
        sampleTopics[(topicIndex + 1) % sampleTopics.length] ?? 'Practice',
      ];
      
      const dayActivities = [
        sampleActivities[day % sampleActivities.length] ?? 'Study',
        sampleActivities[(day + 1) % sampleActivities.length] ?? 'Review',
        sampleActivities[(day + 2) % sampleActivities.length] ?? 'Practice',
      ];

      dailyPlans.push({
        id: `day-${day}`,
        dayNumber: day,
        date,
        isRestDay: false,
        isCompleted: false,
        topics: dayTopics,
        estimatedMinutes: hoursPerDay * 60,
        materials: ['Selected documents', 'Supplementary resources'],
        activities: dayActivities,
        notes: '',
      });
    }
  }

  return dailyPlans;
}

export function generateMockLearningPlan(
  config: LearningPlanConfig,
  selectedDocumentIds: string[]
): GeneratedLearningPlan {
  const totalDays = getDurationDays(config.duration, config.customDays);
  const restFrequency = getRestDayFrequency(config.intensity);
  const restDaysCount = Math.floor(totalDays / restFrequency);
  const studyDaysCount = totalDays - restDaysCount;
  const totalStudyHours = studyDaysCount * config.hoursPerDay;
  
  const endDate = addDays(config.startDate, totalDays - 1);
  
  const milestones = generateMilestones(totalDays);
  const dailyPlans = generateDailyPlans(
    totalDays,
    config.startDate,
    config.hoursPerDay,
    config.intensity
  );

  return {
    id: `plan-${Date.now()}`,
    title: config.learningGoals
      ? `Learning Plan: ${config.learningGoals.substring(0, 50)}${config.learningGoals.length > 50 ? '...' : ''}`
      : 'My Learning Plan',
    userId: 'current-user',
    sourceDocuments: selectedDocumentIds,
    config,
    totalDays,
    totalStudyHours,
    studyDaysCount,
    restDaysCount,
    startDate: config.startDate,
    endDate,
    milestones,
    dailyPlans,
    completedDays: 0,
    currentStreak: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generates a realistic 2-week learning plan with detailed topics and activities
 * for a comprehensive study experience.
 */
export function generateRealistic2WeekPlan(
  selectedDocumentIds: string[] = [],
  learningGoals: string = 'Master Web Development Fundamentals'
): GeneratedLearningPlan {
  const today = new Date();
  const startDate = today.toISOString().split('T')[0] ?? '';
  
  const realisticTopics = [
    // Week 1
    { day: 1, topics: ['HTML5 Fundamentals', 'Document Structure & Semantics'], activities: ['Read documentation', 'Build a basic webpage', 'Complete practice exercises'] },
    { day: 2, topics: ['CSS3 Basics', 'Selectors and Properties'], activities: ['Style your webpage', 'Practice with Flexbox', 'Review CSS specificity'] },
    { day: 3, topics: ['CSS Layout Techniques', 'Responsive Design Principles'], activities: ['Create responsive layouts', 'Use media queries', 'Test on different devices'] },
    { day: 4, topics: ['JavaScript Fundamentals', 'Variables, Types, and Operators'], activities: ['Write basic scripts', 'Practice in browser console', 'Complete coding challenges'] },
    { day: 5, isRest: true },
    { day: 6, topics: ['JavaScript Functions', 'Scope and Closures'], activities: ['Build utility functions', 'Debug common issues', 'Review best practices'] },
    { day: 7, topics: ['DOM Manipulation', 'Event Handling'], activities: ['Create interactive elements', 'Handle user input', 'Build a simple app'] },
    // Week 2
    { day: 8, topics: ['Modern JavaScript (ES6+)', 'Arrow Functions and Destructuring'], activities: ['Refactor old code', 'Practice new syntax', 'Review documentation'] },
    { day: 9, topics: ['Asynchronous JavaScript', 'Promises and Async/Await'], activities: ['Fetch API practice', 'Handle errors gracefully', 'Build async features'] },
    { day: 10, isRest: true },
    { day: 11, topics: ['React Fundamentals', 'Components and JSX'], activities: ['Set up React project', 'Create first components', 'Understand component lifecycle'] },
    { day: 12, topics: ['React State Management', 'Hooks Introduction'], activities: ['Use useState and useEffect', 'Build stateful components', 'Practice state patterns'] },
    { day: 13, topics: ['Project Integration', 'Putting It All Together'], activities: ['Build a complete project', 'Apply all learned concepts', 'Code review and refactor'] },
    { day: 14, topics: ['Final Review', 'Knowledge Assessment'], activities: ['Take practice quiz', 'Review weak areas', 'Plan next learning steps'] },
  ];

  const dailyPlans: DailyPlan[] = realisticTopics.map((dayData, index) => {
    const date = addDays(startDate, index);
    const isRestDay = dayData.isRest ?? false;
    
    return {
      id: `day-${dayData.day}`,
      dayNumber: dayData.day,
      date,
      isRestDay,
      isCompleted: dayData.day <= 3, // First 3 days completed for demo
      topics: isRestDay ? ['Rest and Review'] : (dayData.topics ?? []),
      estimatedMinutes: isRestDay ? 0 : 120,
      materials: isRestDay ? [] : ['Course materials', 'Documentation', 'Practice exercises'],
      activities: isRestDay ? ['Light review', 'Rest and recharge'] : (dayData.activities ?? []),
      notes: dayData.day === 1 ? 'Great start! Covered all basics.' : '',
    };
  });

  const milestones: Milestone[] = [
    {
      id: 'milestone-1',
      title: 'HTML & CSS Mastery',
      description: 'Complete foundational web styling skills',
      targetDay: 4,
      isCompleted: true,
    },
    {
      id: 'milestone-2',
      title: 'JavaScript Fundamentals',
      description: 'Master core JavaScript concepts',
      targetDay: 7,
      isCompleted: false,
    },
    {
      id: 'milestone-3',
      title: 'Modern JS & React Basics',
      description: 'Learn modern development practices',
      targetDay: 12,
      isCompleted: false,
    },
    {
      id: 'milestone-4',
      title: 'Course Completion',
      description: 'Complete all modules and final project',
      targetDay: 14,
      isCompleted: false,
    },
  ];

  const config: LearningPlanConfig = {
    duration: '2-weeks',
    intensity: 'moderate',
    learningGoals,
    hoursPerDay: 2,
    startDate,
  };

  return {
    id: `plan-realistic-${Date.now()}`,
    title: `Learning Plan: ${learningGoals}`,
    userId: 'current-user',
    sourceDocuments: selectedDocumentIds,
    config,
    totalDays: 14,
    totalStudyHours: 24,
    studyDaysCount: 12,
    restDaysCount: 2,
    startDate,
    endDate: addDays(startDate, 13),
    milestones,
    dailyPlans,
    completedDays: 3,
    currentStreak: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
