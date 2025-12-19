"use client";

import { useState } from 'react';

export type SummaryLength = 'brief' | 'standard' | 'detailed';

export type SummaryFocus = 
  | 'key-concepts' 
  | 'definitions' 
  | 'examples' 
  | 'conclusions' 
  | 'methodology';

export interface SummaryConfig {
  length: SummaryLength;
  focusAreas: SummaryFocus[];
  customInstructions: string;
}

export interface SummaryConfigFormProps {
  selectedDocumentCount: number;
  onGenerate: (config: SummaryConfig) => void;
  isGenerating?: boolean;
}

const FOCUS_OPTIONS: { value: SummaryFocus; label: string; description: string }[] = [
  { value: 'key-concepts', label: 'Key Concepts', description: 'Main ideas and themes' },
  { value: 'definitions', label: 'Definitions', description: 'Important terms and meanings' },
  { value: 'examples', label: 'Examples', description: 'Illustrative cases and scenarios' },
  { value: 'conclusions', label: 'Conclusions', description: 'Final findings and takeaways' },
  { value: 'methodology', label: 'Methodology', description: 'Methods and approaches used' },
];

export function SummaryConfigForm({
  selectedDocumentCount,
  onGenerate,
  isGenerating = false,
}: SummaryConfigFormProps) {
  const [length, setLength] = useState<SummaryLength>('standard');
  const [focusAreas, setFocusAreas] = useState<SummaryFocus[]>(['key-concepts']);
  const [customInstructions, setCustomInstructions] = useState('');

  const canGenerate = selectedDocumentCount > 0 && !isGenerating;

  const handleFocusToggle = (focus: SummaryFocus) => {
    setFocusAreas(prev => 
      prev.includes(focus) 
        ? prev.filter(f => f !== focus)
        : [...prev, focus]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canGenerate) {
      onGenerate({ length, focusAreas, customInstructions });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Summary Length Radio Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Summary Length
        </label>
        <div className="mt-3 space-y-3">
          {([
            { value: 'brief', label: 'Brief', description: '1-2 paragraphs, ~100-200 words' },
            { value: 'standard', label: 'Standard', description: '3-4 paragraphs, ~300-500 words' },
            { value: 'detailed', label: 'Detailed', description: '5+ paragraphs, ~600-1000 words' },
          ] as const).map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                length === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input
                type="radio"
                name="summaryLength"
                value={option.value}
                checked={length === option.value}
                onChange={() => setLength(option.value)}
                disabled={isGenerating}
                className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="block font-medium text-gray-900">{option.label}</span>
                <span className="block text-sm text-gray-500">{option.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Summary Focus Checkboxes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Focus Areas <span className="text-gray-400">(optional)</span>
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Select specific areas to emphasize in the summary
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FOCUS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                focusAreas.includes(option.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input
                type="checkbox"
                checked={focusAreas.includes(option.value)}
                onChange={() => handleFocusToggle(option.value)}
                disabled={isGenerating}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900">{option.label}</span>
                <span className="block text-xs text-gray-500">{option.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Instructions Text Area */}
      <div>
        <label htmlFor="customInstructions" className="block text-sm font-medium text-gray-700">
          Custom Instructions <span className="text-gray-400">(optional)</span>
        </label>
        <div className="mt-2">
          <textarea
            id="customInstructions"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g., Focus on practical applications, Include comparison with other theories, Highlight recent developments..."
            disabled={isGenerating}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Add any specific instructions or preferences for the summary generation
        </p>
      </div>

      {/* Generate Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!canGenerate}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
            canGenerate
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Generate Summary</span>
            </>
          )}
        </button>
        {selectedDocumentCount === 0 && (
          <p className="mt-2 text-center text-xs text-amber-600">
            Please select at least one document to generate a summary
          </p>
        )}
      </div>
    </form>
  );
}
