import { SummaryConfig, SummaryLength } from './SummaryConfigForm';

export interface GeneratedSummary {
  id: string;
  title: string;
  content: string;
  keyTakeaways: string[];
  wordCount: number;
  readingTimeMinutes: number;
  sourceDocuments: string[];
  generatedAt: Date;
  config: SummaryConfig;
}

const MOCK_SUMMARIES: Record<SummaryLength, { content: string; keyTakeaways: string[] }> = {
  short: {
    content: `This document provides a comprehensive overview of the subject matter, highlighting the fundamental principles and their practical applications in modern contexts. The key findings demonstrate significant advancements in the field, with particular emphasis on innovative methodologies that have emerged in recent years.

The research establishes a clear framework for understanding complex concepts, making them accessible to both beginners and advanced practitioners. Notable conclusions include the importance of systematic approaches and the value of interdisciplinary collaboration in achieving meaningful results.

The practical implications extend across multiple domains, offering actionable insights for professionals seeking to implement these concepts in real-world scenarios.`,
    keyTakeaways: [
      'Fundamental principles form the foundation for advanced applications',
      'Recent methodological innovations have transformed the field',
      'Interdisciplinary collaboration enhances outcomes',
      'Practical implementation guidelines support real-world application',
    ],
  },
  medium: {
    content: `**Introduction and Context**

This comprehensive document explores the multifaceted aspects of the subject matter, providing readers with a thorough understanding of both theoretical foundations and practical implementations. The analysis begins with an examination of core principles that have shaped the field over decades of research and development, establishing a solid groundwork for the discussions that follow.

**Methodology and Approaches**

The methodology section presents innovative approaches that have emerged from recent studies, demonstrating how traditional techniques can be enhanced through modern technological advancements. These methods have been validated through extensive testing and peer review, establishing their reliability and effectiveness across diverse application scenarios.

**Key Findings**

Key findings from the research indicate significant progress in addressing previously challenging problems. The data supports the hypothesis that systematic, evidence-based approaches yield superior results compared to ad-hoc methods. Furthermore, the integration of cross-disciplinary insights has opened new avenues for exploration and discovery.

**Practical Applications**

The practical implications of these findings are substantial. Organizations and individuals can leverage these insights to improve their processes, enhance decision-making, and achieve better outcomes. The document provides specific recommendations for implementation that can be adapted to various contexts and requirements.

**Conclusions**

The document concludes with recommendations for implementation and suggestions for future research directions. The evidence presented strongly supports the adoption of these methodologies in both academic and professional settings.`,
    keyTakeaways: [
      'Core principles provide essential foundation for understanding',
      'Modern technological advancements enhance traditional methodologies',
      'Evidence-based approaches consistently outperform ad-hoc methods',
      'Cross-disciplinary integration opens new research opportunities',
      'Practical implementation guidelines support real-world application',
    ],
  },
  long: {
    content: `This extensive document presents a thorough examination of the subject matter, encompassing historical context, theoretical frameworks, methodological approaches, empirical findings, and future directions. The analysis draws upon a rich body of literature and primary research to construct a comprehensive understanding of the field.

**Historical Context and Evolution**

The field has undergone significant transformation since its inception. Early pioneers established foundational concepts that continue to influence contemporary thinking. Over time, these ideas have been refined, challenged, and expanded through rigorous academic discourse and practical experimentation. Understanding this historical trajectory is essential for appreciating current developments and anticipating future trends.

**Theoretical Framework**

The theoretical underpinnings of this work rest on several key constructs. First, the principle of systematic analysis provides a structured approach to complex problems. Second, the integration of quantitative and qualitative methods enables a more nuanced understanding of phenomena. Third, the recognition of contextual factors acknowledges that solutions must be adapted to specific circumstances.

**Methodological Approaches**

The research employs a mixed-methods design that combines statistical analysis with interpretive techniques. Data collection involved multiple sources, including surveys, interviews, and archival records. This triangulation approach enhances the validity and reliability of findings while providing rich, contextual insights.

**Key Findings and Analysis**

The empirical results reveal several significant patterns. Quantitative analysis demonstrates strong correlations between key variables, supporting the primary hypotheses. Qualitative data provides depth and nuance, illuminating the mechanisms underlying observed relationships. Together, these findings paint a comprehensive picture of the phenomenon under study.

**Practical Implications**

The implications of this research extend beyond academic interest. Practitioners can apply these insights to improve processes, enhance outcomes, and address persistent challenges. The document provides specific recommendations for implementation, including step-by-step guidelines and best practices derived from successful case studies.

**Future Directions**

While this research makes substantial contributions, it also identifies areas requiring further investigation. Emerging technologies present new opportunities for exploration, and changing contextual factors necessitate ongoing adaptation of existing frameworks. The document concludes with a research agenda that outlines priority areas for future study.`,
    keyTakeaways: [
      'Historical evolution provides essential context for current developments',
      'Theoretical framework integrates systematic analysis with contextual awareness',
      'Mixed-methods approach enhances validity and provides rich insights',
      'Strong empirical support for primary hypotheses and relationships',
      'Practical recommendations enable real-world implementation',
      'Future research agenda identifies priority areas for continued study',
      'Cross-disciplinary perspectives enrich understanding and application',
    ],
  },
};

function generateId(): string {
  return `summary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function calculateWordCount(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

function calculateReadingTime(wordCount: number): number {
  // Average reading speed is ~200-250 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function generateMockSummary(
  config: SummaryConfig,
  sourceDocumentIds: string[]
): GeneratedSummary {
  const mockData = MOCK_SUMMARIES[config.length];
  const wordCount = calculateWordCount(mockData.content);

  return {
    id: generateId(),
    title: 'Document Summary',
    content: mockData.content,
    keyTakeaways: mockData.keyTakeaways,
    wordCount,
    readingTimeMinutes: calculateReadingTime(wordCount),
    sourceDocuments: sourceDocumentIds,
    generatedAt: new Date(),
    config,
  };
}

export async function generateMockSummaryAsync(
  config: SummaryConfig,
  sourceDocumentIds: string[],
  onProgress?: (progress: number) => void
): Promise<GeneratedSummary> {
  // Simulate generation time based on length
  const totalSteps = config.length === 'brief' ? 3 : config.length === 'standard' ? 5 : 7;
  const stepDuration = 500; // ms per step

  for (let step = 1; step <= totalSteps; step++) {
    await new Promise(resolve => setTimeout(resolve, stepDuration));
    if (onProgress) {
      onProgress((step / totalSteps) * 100);
    }
  }

  return generateMockSummary(config, sourceDocumentIds);
}
