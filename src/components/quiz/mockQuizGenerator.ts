import { QuizConfig, DifficultyLevel, QuestionType } from './QuizConfigForm';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: DifficultyLevel;
}

export interface GeneratedQuiz {
  id: string;
  name: string;
  questions: QuizQuestion[];
  sourceDocumentIds: string[];
  config: QuizConfig;
  timeLimit: number | null;
  createdAt: Date;
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
}

export interface QuizResult {
  quizId: string;
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  completedAt: Date;
}

// Mock questions by type and difficulty
const MOCK_MULTIPLE_CHOICE: Record<DifficultyLevel, Array<{ question: string; options: string[]; correctAnswer: string; explanation: string }>> = {
  easy: [
    { question: "What is the primary function of a CPU?", options: ["Store data permanently", "Process instructions and perform calculations", "Display graphics", "Connect to the internet"], correctAnswer: "Process instructions and perform calculations", explanation: "The CPU (Central Processing Unit) is the brain of the computer, responsible for executing instructions and performing calculations." },
    { question: "Which of the following is a programming language?", options: ["HTML", "CSS", "Python", "HTTP"], correctAnswer: "Python", explanation: "Python is a high-level programming language. HTML and CSS are markup/styling languages, and HTTP is a protocol." },
    { question: "What does RAM stand for?", options: ["Random Access Memory", "Read Access Memory", "Rapid Access Module", "Remote Access Memory"], correctAnswer: "Random Access Memory", explanation: "RAM stands for Random Access Memory, which is volatile memory used for temporary data storage during program execution." },
    { question: "Which company developed the Windows operating system?", options: ["Apple", "Google", "Microsoft", "IBM"], correctAnswer: "Microsoft", explanation: "Microsoft developed and maintains the Windows operating system, first released in 1985." },
    { question: "What is the file extension for a Python script?", options: [".java", ".py", ".js", ".cpp"], correctAnswer: ".py", explanation: "Python scripts use the .py file extension." },
  ],
  medium: [
    { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correctAnswer: "O(log n)", explanation: "Binary search has O(log n) time complexity because it halves the search space with each comparison." },
    { question: "Which data structure uses LIFO (Last In, First Out)?", options: ["Queue", "Stack", "Array", "Linked List"], correctAnswer: "Stack", explanation: "A stack follows LIFO principle where the last element added is the first one to be removed." },
    { question: "What is the purpose of an index in a database?", options: ["Store backup data", "Speed up data retrieval", "Encrypt sensitive data", "Compress table size"], correctAnswer: "Speed up data retrieval", explanation: "Database indexes improve query performance by providing quick access paths to data, similar to a book index." },
    { question: "Which HTTP method is typically used to update a resource?", options: ["GET", "POST", "PUT", "DELETE"], correctAnswer: "PUT", explanation: "PUT is used to update or replace an existing resource. POST creates new resources, GET retrieves, and DELETE removes." },
    { question: "What is polymorphism in OOP?", options: ["Hiding implementation details", "Objects taking multiple forms", "Inheriting from parent class", "Grouping related data"], correctAnswer: "Objects taking multiple forms", explanation: "Polymorphism allows objects of different classes to be treated as objects of a common parent class, enabling different behaviors." },
  ],
  hard: [
    { question: "Which algorithm is NOT suitable for finding the shortest path in a weighted graph with negative edges?", options: ["Bellman-Ford", "Dijkstra's", "Floyd-Warshall", "SPFA"], correctAnswer: "Dijkstra's", explanation: "Dijkstra's algorithm doesn't work correctly with negative edge weights because it assumes the shortest path to a node is finalized once visited." },
    { question: "What is the space complexity of merge sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: "O(n)", explanation: "Merge sort requires O(n) auxiliary space for the temporary arrays used during merging." },
    { question: "In distributed systems, what does the 'P' in CAP theorem stand for?", options: ["Performance", "Partition tolerance", "Persistence", "Parallelism"], correctAnswer: "Partition tolerance", explanation: "CAP theorem states that distributed systems can only guarantee two of: Consistency, Availability, and Partition tolerance." },
    { question: "Which design pattern ensures a class has only one instance?", options: ["Factory", "Observer", "Singleton", "Strategy"], correctAnswer: "Singleton", explanation: "The Singleton pattern restricts instantiation of a class to a single instance and provides global access to it." },
    { question: "What is the purpose of a bloom filter?", options: ["Sort data efficiently", "Test set membership probabilistically", "Compress data", "Balance binary trees"], correctAnswer: "Test set membership probabilistically", explanation: "Bloom filters are space-efficient probabilistic data structures for testing whether an element is in a set, with possible false positives but no false negatives." },
  ],
};


const MOCK_TRUE_FALSE: Record<DifficultyLevel, Array<{ question: string; correctAnswer: string; explanation: string }>> = {
  easy: [
    { question: "JavaScript and Java are the same programming language.", correctAnswer: "False", explanation: "Despite similar names, JavaScript and Java are completely different languages with different purposes and syntax." },
    { question: "HTML is a programming language.", correctAnswer: "False", explanation: "HTML (HyperText Markup Language) is a markup language used to structure content, not a programming language." },
    { question: "A byte consists of 8 bits.", correctAnswer: "True", explanation: "A byte is a unit of digital information that consists of 8 bits." },
    { question: "Python uses indentation to define code blocks.", correctAnswer: "True", explanation: "Python uses whitespace indentation to delimit code blocks, unlike languages that use braces." },
    { question: "The internet and the World Wide Web are the same thing.", correctAnswer: "False", explanation: "The internet is the global network infrastructure, while the World Wide Web is a service that runs on the internet." },
  ],
  medium: [
    { question: "In a binary search tree, the left child is always greater than the parent.", correctAnswer: "False", explanation: "In a BST, the left child is always less than the parent, and the right child is always greater." },
    { question: "TCP guarantees delivery of packets in order.", correctAnswer: "True", explanation: "TCP (Transmission Control Protocol) provides reliable, ordered delivery of data packets." },
    { question: "A hash table has O(1) average time complexity for lookups.", correctAnswer: "True", explanation: "Hash tables provide constant-time average case for insertions, deletions, and lookups." },
    { question: "REST APIs must use JSON for data exchange.", correctAnswer: "False", explanation: "REST APIs can use various formats including JSON, XML, HTML, or plain text. JSON is common but not required." },
    { question: "Recursion always uses more memory than iteration.", correctAnswer: "False", explanation: "While recursion typically uses stack space, tail-call optimization can make it as efficient as iteration in some languages." },
  ],
  hard: [
    { question: "In eventual consistency, all reads will immediately return the most recent write.", correctAnswer: "False", explanation: "Eventual consistency only guarantees that all replicas will eventually converge to the same value, not immediate consistency." },
    { question: "A red-black tree guarantees O(log n) time for insertions.", correctAnswer: "True", explanation: "Red-black trees are self-balancing BSTs that maintain O(log n) height, ensuring O(log n) operations." },
    { question: "Deadlock can occur with only one resource type.", correctAnswer: "False", explanation: "Deadlock requires circular wait, which needs at least two different resource types for processes to wait on each other." },
    { question: "The halting problem is decidable for all programs.", correctAnswer: "False", explanation: "The halting problem is undecidable - there's no general algorithm to determine if any program will halt." },
    { question: "Microservices architecture always improves system performance.", correctAnswer: "False", explanation: "Microservices add network overhead and complexity. They improve scalability and maintainability but may reduce performance." },
  ],
};

const MOCK_SHORT_ANSWER: Record<DifficultyLevel, Array<{ question: string; correctAnswer: string; explanation: string }>> = {
  easy: [
    { question: "What does HTTP stand for?", correctAnswer: "HyperText Transfer Protocol", explanation: "HTTP is the foundation of data communication on the World Wide Web." },
    { question: "Name the operator used for equality comparison in most programming languages.", correctAnswer: "==", explanation: "The double equals (==) operator is commonly used for equality comparison." },
    { question: "What is the output of 2 + 2 * 3?", correctAnswer: "8", explanation: "Following order of operations (PEMDAS), multiplication is performed before addition: 2 + 6 = 8." },
    { question: "What command is used to install packages in npm?", correctAnswer: "npm install", explanation: "The 'npm install' command installs packages from the npm registry." },
    { question: "What symbol is used for single-line comments in Python?", correctAnswer: "#", explanation: "Python uses the hash symbol (#) for single-line comments." },
  ],
  medium: [
    { question: "What is the Big O notation for accessing an element in an array by index?", correctAnswer: "O(1)", explanation: "Array access by index is constant time because arrays store elements in contiguous memory locations." },
    { question: "Name the HTTP status code for 'Not Found'.", correctAnswer: "404", explanation: "HTTP 404 indicates that the server cannot find the requested resource." },
    { question: "What design pattern is used when you want to notify multiple objects about state changes?", correctAnswer: "Observer", explanation: "The Observer pattern defines a one-to-many dependency between objects for state change notifications." },
    { question: "What is the default port for HTTPS?", correctAnswer: "443", explanation: "HTTPS uses port 443 by default, while HTTP uses port 80." },
    { question: "In Git, what command creates a new branch?", correctAnswer: "git branch", explanation: "The 'git branch <name>' command creates a new branch. 'git checkout -b' creates and switches to it." },
  ],
  hard: [
    { question: "What is the amortized time complexity of dynamic array insertion?", correctAnswer: "O(1)", explanation: "While individual insertions may be O(n) when resizing, the amortized cost over many insertions is O(1)." },
    { question: "Name the consensus algorithm used by Bitcoin.", correctAnswer: "Proof of Work", explanation: "Bitcoin uses Proof of Work (PoW) where miners solve computational puzzles to validate transactions." },
    { question: "What is the maximum number of children a node can have in a B-tree of order m?", correctAnswer: "m", explanation: "In a B-tree of order m, each node can have at most m children and m-1 keys." },
    { question: "What isolation level prevents phantom reads in SQL?", correctAnswer: "Serializable", explanation: "Serializable is the highest isolation level and prevents all concurrency anomalies including phantom reads." },
    { question: "Name the theorem that states it's impossible to have both safety and liveness in an asynchronous system.", correctAnswer: "FLP", explanation: "The FLP impossibility result shows consensus is impossible in asynchronous systems with even one faulty process." },
  ],
};


function generateUniqueId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = temp as T;
  }
  return shuffled;
}

function getQuestionsForType(
  type: QuestionType,
  difficulty: DifficultyLevel,
  count: number
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  if (type === 'multiple-choice') {
    const pool = MOCK_MULTIPLE_CHOICE[difficulty];
    const shuffled = shuffleArray(pool);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const q = shuffled[i];
      if (q) {
        questions.push({
          id: generateUniqueId(),
          type: 'multiple-choice',
          question: q.question,
          options: shuffleArray(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty,
        });
      }
    }
  } else if (type === 'true-false') {
    const pool = MOCK_TRUE_FALSE[difficulty];
    const shuffled = shuffleArray(pool);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const q = shuffled[i];
      if (q) {
        questions.push({
          id: generateUniqueId(),
          type: 'true-false',
          question: q.question,
          options: ['True', 'False'],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty,
        });
      }
    }
  } else if (type === 'short-answer') {
    const pool = MOCK_SHORT_ANSWER[difficulty];
    const shuffled = shuffleArray(pool);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const q = shuffled[i];
      if (q) {
        questions.push({
          id: generateUniqueId(),
          type: 'short-answer',
          question: q.question,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty,
        });
      }
    }
  }
  
  return questions;
}

export function generateMockQuiz(
  config: QuizConfig,
  selectedDocumentIds: string[]
): GeneratedQuiz {
  const { questionCount, questionTypes, difficulty, timeLimit } = config;
  
  // Distribute questions evenly among selected types
  const questionsPerType = Math.ceil(questionCount / questionTypes.length);
  let allQuestions: QuizQuestion[] = [];
  
  for (const type of questionTypes) {
    const typeQuestions = getQuestionsForType(type, difficulty, questionsPerType);
    allQuestions = [...allQuestions, ...typeQuestions];
  }
  
  // Shuffle and trim to exact count
  allQuestions = shuffleArray(allQuestions).slice(0, questionCount);
  
  // If we don't have enough questions, duplicate some with variations
  while (allQuestions.length < questionCount && allQuestions.length > 0) {
    const baseQuestion = allQuestions[allQuestions.length % allQuestions.length];
    if (baseQuestion) {
      allQuestions.push({
        ...baseQuestion,
        id: generateUniqueId(),
        question: `${baseQuestion.question} (Review)`,
      });
    }
  }

  return {
    id: generateUniqueId(),
    name: `Quiz - ${new Date().toLocaleDateString()}`,
    questions: allQuestions,
    sourceDocumentIds: selectedDocumentIds,
    config,
    timeLimit,
    createdAt: new Date(),
  };
}

export function generateMockQuizAsync(
  config: QuizConfig,
  selectedDocumentIds: string[],
  onProgress?: (progress: number) => void
): Promise<GeneratedQuiz> {
  return new Promise((resolve) => {
    const baseTime = 2000;
    const perDocTime = 300;
    const perQuestionTime = 100;
    const totalTime = baseTime + (selectedDocumentIds.length * perDocTime) + (config.questionCount * perQuestionTime);
    
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 200;
      const progress = Math.min((elapsed / totalTime) * 100, 95);
      onProgress?.(progress);
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      onProgress?.(100);
      const quiz = generateMockQuiz(config, selectedDocumentIds);
      resolve(quiz);
    }, totalTime);
  });
}

export function checkAnswer(question: QuizQuestion, userAnswer: string): boolean {
  if (question.type === 'short-answer') {
    // For short answer, do case-insensitive comparison and trim whitespace
    return userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
  }
  return userAnswer === question.correctAnswer;
}

export function calculateQuizResult(
  quiz: GeneratedQuiz,
  answers: QuizAnswer[],
  timeTaken: number
): QuizResult {
  const answersWithCorrectness = answers.map(answer => {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    const isCorrect = question ? checkAnswer(question, answer.answer) : false;
    return { ...answer, isCorrect };
  });

  const correctCount = answersWithCorrectness.filter(a => a.isCorrect).length;
  const score = Math.round((correctCount / quiz.questions.length) * 100);

  return {
    quizId: quiz.id,
    answers: answersWithCorrectness,
    score,
    totalQuestions: quiz.questions.length,
    timeTaken,
    completedAt: new Date(),
  };
}
