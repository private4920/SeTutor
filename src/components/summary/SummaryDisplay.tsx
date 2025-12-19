"use client";

import { useState, useCallback } from 'react';
import { GeneratedSummary } from './mockSummaryGenerator';
import { SummaryConfig } from './SummaryConfigForm';

export interface SummaryDisplayProps {
  summary: GeneratedSummary;
  onRegenerate: (config: SummaryConfig) => void;
  onBack: () => void;
  isRegenerating?: boolean;
}

export function SummaryDisplay({
  summary,
  onRegenerate,
  onBack,
  isRegenerating = false,
}: SummaryDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(summary.content);
  const [editedTitle, setEditedTitle] = useState(summary.title);
  const [editedTakeaways, setEditedTakeaways] = useState(summary.keyTakeaways);
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calculate word count and reading time for edited content
  const currentWordCount = editedContent.split(/\s+/).filter(word => word.length > 0).length;
  const currentReadingTime = Math.max(1, Math.ceil(currentWordCount / 200));

  const handleCopyToClipboard = useCallback(async () => {
    const textToCopy = `${editedTitle}\n\nKey Takeaways:\n${editedTakeaways.map(t => `• ${t}`).join('\n')}\n\n${editedContent}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [editedTitle, editedTakeaways, editedContent]);

  const handleSave = useCallback(() => {
    // In a real app, this would save to the backend
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 2000);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditedContent(summary.content);
    setEditedTitle(summary.title);
    setEditedTakeaways(summary.keyTakeaways);
    setIsEditing(false);
  }, [summary]);


  const handleTakeawayChange = useCallback((index: number, value: string) => {
    setEditedTakeaways(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const handleAddTakeaway = useCallback(() => {
    setEditedTakeaways(prev => [...prev, '']);
  }, []);

  const handleRemoveTakeaway = useCallback((index: number) => {
    setEditedTakeaways(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleExportPDF = useCallback(() => {
    // Create a printable version and trigger print dialog
    const printContent = `
      <html>
        <head>
          <title>${editedTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
            h1 { color: #1f2937; margin-bottom: 24px; }
            .takeaways { background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
            .takeaways h2 { color: #1e40af; margin-top: 0; font-size: 18px; }
            .takeaways ul { margin: 0; padding-left: 20px; }
            .takeaways li { color: #1e3a8a; margin-bottom: 8px; }
            .content { line-height: 1.6; color: #374151; }
            .content p { margin-bottom: 16px; }
            .meta { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <h1>${editedTitle}</h1>
          <div class="meta">${currentWordCount} words • ${currentReadingTime} min read</div>
          <div class="takeaways">
            <h2>Key Takeaways</h2>
            <ul>
              ${editedTakeaways.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          <div class="content">
            ${editedContent.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }, [editedTitle, editedTakeaways, editedContent, currentWordCount, currentReadingTime]);

  const handleExportWord = useCallback(() => {
    // Create a Word-compatible HTML document
    const wordContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
        <head>
          <meta charset="utf-8">
          <title>${editedTitle}</title>
        </head>
        <body>
          <h1>${editedTitle}</h1>
          <p><em>${currentWordCount} words • ${currentReadingTime} min read</em></p>
          <h2>Key Takeaways</h2>
          <ul>
            ${editedTakeaways.map(t => `<li>${t}</li>`).join('')}
          </ul>
          <hr>
          ${editedContent.split('\n\n').map(p => `<p>${p}</p>`).join('')}
        </body>
      </html>
    `;
    
    const blob = new Blob([wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${editedTitle.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [editedTitle, editedTakeaways, editedContent, currentWordCount, currentReadingTime]);

  const handleRegenerate = useCallback(() => {
    onRegenerate(summary.config);
  }, [onRegenerate, summary.config]);


  return (
    <div className="space-y-6">
      {/* Success Notifications */}
      {copySuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Copied to clipboard!</span>
        </div>
      )}
      
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Summary saved!</span>
        </div>
      )}

      {/* Header with Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Summary Generated</h1>
          <p className="mt-1 text-sm text-gray-600">
            Your AI-powered summary is ready to review.
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Selection
        </button>
      </div>

      {/* Main Summary Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Title and Meta */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xl font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-900">{editedTitle}</h2>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {currentWordCount} words
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~{currentReadingTime} min read
              </span>
            </div>
          </div>
        </div>


        {/* Key Takeaways Box */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h3 className="font-semibold text-blue-900">Key Takeaways</h3>
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              {editedTakeaways.map((takeaway, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-blue-500">•</span>
                  <input
                    type="text"
                    value={takeaway}
                    onChange={(e) => handleTakeawayChange(index, e.target.value)}
                    className="flex-1 rounded border border-blue-200 bg-white px-3 py-1.5 text-sm text-blue-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleRemoveTakeaway(index)}
                    className="rounded p-1 text-blue-400 hover:bg-blue-100 hover:text-blue-600"
                    title="Remove takeaway"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddTakeaway}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add takeaway
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {editedTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {takeaway}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Summary Content */}
        <div className="p-6">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={15}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <div className="prose prose-sm max-w-none text-gray-700">
              {editedContent.split('\n\n').map((paragraph, index) => {
                // Check if paragraph starts with ** for bold headings
                if (paragraph.startsWith('**') && paragraph.includes('**')) {
                  const headingMatch = paragraph.match(/^\*\*(.+?)\*\*/);
                  if (headingMatch) {
                    const heading = headingMatch[1];
                    const rest = paragraph.replace(/^\*\*.+?\*\*\s*/, '');
                    return (
                      <div key={index} className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{heading}</h4>
                        {rest && <p>{rest}</p>}
                      </div>
                    );
                  }
                }
                return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
              })}
            </div>
          )}
        </div>


        {/* Action Buttons - Requirements 1.3, 6.4: Responsive design */}
        <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3">
            {/* Left side - Edit/Save actions */}
            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRegenerating ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    Regenerate
                  </button>
                </>
              )}
            </div>

            {/* Right side - Export and Copy actions */}
            {!isEditing && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                
                {/* Export Dropdown */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={handleExportPDF}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      Export as PDF
                    </button>
                    <button
                      onClick={handleExportWord}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      Export as Word
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Source Documents Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Generated from {summary.sourceDocuments.length} document{summary.sourceDocuments.length !== 1 ? 's' : ''}</span>
          <span className="text-gray-400">•</span>
          <span>{new Date(summary.generatedAt).toLocaleDateString()} at {new Date(summary.generatedAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
