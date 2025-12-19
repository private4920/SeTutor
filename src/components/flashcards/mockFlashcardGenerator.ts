import { FlashcardConfig, DifficultyLevel } from './FlashcardConfigForm';

export interface GeneratedFlashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: DifficultyLevel;
}

export interface GeneratedFlashcardDeck {
  id: string;
  name: string;
  flashcards: GeneratedFlashcard[];
  sourceDocumentIds: string[];
  config: FlashcardConfig;
  createdAt: Date;
}

// Mock flashcard content based on difficulty
const MOCK_FLASHCARDS_BY_DIFFICULTY: Record<DifficultyLevel, Array<{ question: string; answer: string }>> = {
  easy: [
    { question: "What is the primary purpose of machine learning?", answer: "To enable computers to learn from data and make predictions or decisions without being explicitly programmed for each task." },
    { question: "Define 'algorithm' in simple terms.", answer: "A step-by-step set of instructions or rules designed to solve a specific problem or perform a task." },
    { question: "What does PDF stand for?", answer: "Portable Document Format - a file format developed by Adobe to present documents consistently across different platforms." },
    { question: "What is the difference between RAM and storage?", answer: "RAM (Random Access Memory) is temporary memory used for active processes, while storage (HDD/SSD) is permanent memory for saving files." },
    { question: "What is a database?", answer: "An organized collection of structured data stored electronically, designed for easy access, management, and updating." },
    { question: "What is the purpose of version control?", answer: "To track and manage changes to code or documents over time, allowing collaboration and the ability to revert to previous versions." },
    { question: "What is an API?", answer: "Application Programming Interface - a set of protocols and tools that allows different software applications to communicate with each other." },
    { question: "What is cloud computing?", answer: "The delivery of computing services (servers, storage, databases, networking, software) over the internet ('the cloud')." },
    { question: "What is the function of a web browser?", answer: "To retrieve, present, and traverse information resources on the World Wide Web, rendering HTML, CSS, and JavaScript." },
    { question: "What is encryption?", answer: "The process of converting information into a code to prevent unauthorized access, ensuring data security and privacy." },
  ],
  medium: [
    { question: "Explain the concept of 'overfitting' in machine learning.", answer: "Overfitting occurs when a model learns the training data too well, including noise and outliers, resulting in poor generalization to new, unseen data." },
    { question: "What is the difference between supervised and unsupervised learning?", answer: "Supervised learning uses labeled data to train models for prediction, while unsupervised learning finds patterns in unlabeled data without predefined outcomes." },
    { question: "Describe the MVC architectural pattern.", answer: "Model-View-Controller separates an application into three components: Model (data/logic), View (user interface), and Controller (handles input and updates model/view)." },
    { question: "What is the purpose of normalization in databases?", answer: "To organize data to reduce redundancy and dependency, improving data integrity by dividing tables and establishing relationships between them." },
    { question: "Explain the concept of 'Big O notation'.", answer: "A mathematical notation describing the upper bound of an algorithm's time or space complexity, indicating how performance scales with input size." },
    { question: "What is the difference between SQL and NoSQL databases?", answer: "SQL databases are relational with structured schemas and ACID compliance, while NoSQL databases are non-relational, offering flexible schemas and horizontal scaling." },
    { question: "Describe the concept of 'responsive design'.", answer: "A web design approach that makes pages render well on various devices and screen sizes through flexible layouts, images, and CSS media queries." },
    { question: "What is a RESTful API?", answer: "An API that follows REST principles: stateless communication, uniform interface, client-server architecture, and resource-based URLs with standard HTTP methods." },
    { question: "Explain the concept of 'dependency injection'.", answer: "A design pattern where dependencies are provided to a class rather than created internally, promoting loose coupling and easier testing." },
    { question: "What is the purpose of caching in web applications?", answer: "To store frequently accessed data temporarily for faster retrieval, reducing server load, database queries, and improving response times." },
  ],
  hard: [
    { question: "Compare and contrast gradient descent variants: batch, stochastic, and mini-batch.", answer: "Batch uses entire dataset (stable but slow), stochastic uses single samples (fast but noisy), mini-batch uses subsets (balanced approach with reduced variance and reasonable speed)." },
    { question: "Explain the CAP theorem and its implications for distributed systems.", answer: "CAP states distributed systems can only guarantee two of three: Consistency, Availability, Partition tolerance. This forces trade-offs in system design during network failures." },
    { question: "Describe the differences between optimistic and pessimistic concurrency control.", answer: "Optimistic assumes conflicts are rare, validates at commit time; pessimistic locks resources preemptively. Choice depends on conflict frequency and performance requirements." },
    { question: "Explain the concept of 'eventual consistency' and when it's appropriate.", answer: "A consistency model where updates propagate asynchronously, guaranteeing all replicas converge eventually. Suitable for high-availability systems where temporary inconsistency is acceptable." },
    { question: "What is the difference between horizontal and vertical scaling, and when would you choose each?", answer: "Vertical scaling adds resources to existing machines (simpler, limited); horizontal scaling adds more machines (complex, unlimited). Choose based on cost, complexity, and scalability needs." },
    { question: "Explain the concept of 'backpropagation' in neural networks.", answer: "An algorithm that calculates gradients of the loss function with respect to weights by propagating errors backward through the network, enabling weight updates via gradient descent." },
    { question: "Describe the trade-offs between microservices and monolithic architectures.", answer: "Microservices offer scalability, flexibility, and fault isolation but add complexity in deployment, testing, and data consistency. Monoliths are simpler but harder to scale and modify." },
    { question: "What is the purpose of a bloom filter and what are its limitations?", answer: "A probabilistic data structure for set membership testing with O(1) operations and low memory. Limitations: false positives possible, no deletion, and no element retrieval." },
    { question: "Explain the concept of 'sharding' in database design.", answer: "Horizontal partitioning of data across multiple database instances based on a shard key. Improves scalability but complicates queries spanning shards and requires careful key selection." },
    { question: "Describe the SOLID principles and their importance in software design.", answer: "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. They promote maintainable, extensible, and testable object-oriented code." },
  ],
};

function generateUniqueId(): string {
  return `fc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

export function generateMockFlashcards(
  config: FlashcardConfig,
  selectedDocumentIds: string[]
): GeneratedFlashcardDeck {
  const { quantity, difficulty, focusTopics } = config;
  
  // Get flashcards based on difficulty
  // For variety, we'll mix in some cards from adjacent difficulties
  let availableCards: Array<{ question: string; answer: string; difficulty: DifficultyLevel }> = [];
  
  if (difficulty === 'easy') {
    availableCards = [
      ...MOCK_FLASHCARDS_BY_DIFFICULTY.easy.map(c => ({ ...c, difficulty: 'easy' as DifficultyLevel })),
      ...MOCK_FLASHCARDS_BY_DIFFICULTY.medium.slice(0, 3).map(c => ({ ...c, difficulty: 'medium' as DifficultyLevel })),
    ];
  } else if (difficulty === 'medium') {
    availableCards = [
      ...MOCK_FLASHCARDS_BY_DIFFICULTY.easy.slice(0, 3).map(c => ({ ...c, difficulty: 'easy' as DifficultyLevel })),
      ...MOCK_FLASHCARDS_BY_DIFFICULTY.medium.map(c => ({ ...c, difficulty: 'medium' as DifficultyLevel })),
      ...MOCK_FLASHCARDS_BY_DIFFICULTY.hard.slice(0, 3).map(c => ({ ...c, difficulty: 'hard' as DifficultyLevel })),
    ];
  } else {
    availableCards = [
      ...MOCK_FLASHCARDS_BY_DIFFICULTY.medium.slice(0, 3).map(c => ({ ...c, difficulty: 'medium' as DifficultyLevel })),
      ...MOCK_FLASHCARDS_BY_DIFFICULTY.hard.map(c => ({ ...c, difficulty: 'hard' as DifficultyLevel })),
    ];
  }

  // Shuffle and select the requested quantity
  const shuffled = shuffleArray(availableCards);
  const selected = shuffled.slice(0, Math.min(quantity, shuffled.length));

  // If we need more cards than available, duplicate some with variations
  while (selected.length < quantity && shuffled.length > 0) {
    const baseCard = shuffled[selected.length % shuffled.length];
    if (baseCard) {
      selected.push({
        question: `${baseCard.question} (Variation ${Math.floor(selected.length / shuffled.length) + 1})`,
        answer: baseCard.answer,
        difficulty: baseCard.difficulty,
      });
    }
  }

  // Create flashcard objects
  const flashcards: GeneratedFlashcard[] = selected.map(card => ({
    id: generateUniqueId(),
    question: card.question,
    answer: card.answer,
    difficulty: card.difficulty,
  }));

  // Generate deck name based on focus topics or default
  const deckName = focusTopics && focusTopics.trim()
    ? `${(focusTopics.split(',')[0] || focusTopics).trim()} Flashcards`
    : `Study Flashcards - ${new Date().toLocaleDateString()}`;

  return {
    id: generateUniqueId(),
    name: deckName,
    flashcards,
    sourceDocumentIds: selectedDocumentIds,
    config,
    createdAt: new Date(),
  };
}

// Simulate async generation with delay
export function generateMockFlashcardsAsync(
  config: FlashcardConfig,
  selectedDocumentIds: string[],
  onProgress?: (progress: number) => void
): Promise<GeneratedFlashcardDeck> {
  return new Promise((resolve) => {
    // Simulate generation time based on quantity and documents
    const baseTime = 2000; // 2 seconds base
    const perDocTime = 500; // 0.5 seconds per document
    const perCardTime = 100; // 0.1 seconds per card
    const totalTime = baseTime + (selectedDocumentIds.length * perDocTime) + (config.quantity * perCardTime);
    
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 200;
      const progress = Math.min((elapsed / totalTime) * 100, 95);
      onProgress?.(progress);
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      onProgress?.(100);
      const deck = generateMockFlashcards(config, selectedDocumentIds);
      resolve(deck);
    }, totalTime);
  });
}
