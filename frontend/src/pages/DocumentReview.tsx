import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  FileCheck2,
  AlertCircle,
  Download,
  Copy,
  Check,
  BookOpen,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import StatusBadge from '@/components/common/StatusBadge';
import { uploadAndReviewDocument, type DocumentReviewResponse } from '../services/documentService';
import { ERROR_CATEGORY_LABELS, mapBackendCategory } from '@/types/correction';

interface SelectedFile {
  raw: File;
  name: string;
  size: number;
  type: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export default function DocumentReview() {
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [result, setResult] = useState<DocumentReviewResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((selectedFile: File) => {
    setError(null);
    setResult(null);

    const ext = getFileExtension(selectedFile.name);
    const validExtensions = ['txt', 'docx', 'pdf'];

    if (!validExtensions.includes(ext)) {
      setError('Unsupported file type. Please upload a .txt, .docx, or .pdf file.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
      return;
    }

    setFile({
      raw: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
      type: ext.toUpperCase(),
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile],
  );

  const handleBrowse = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) handleFile(selectedFile);
    },
    [handleFile],
  );

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReview = async () => {
    if (!file) return;
    setIsReviewing(true);
    setError(null);

    try {
      const data = await uploadAndReviewDocument(file.raw, 'general');
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze document through backend pipeline.');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.corrected_text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.corrected_text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corrected-${file?.name || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 lg:p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Document Review</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Upload documents (.txt, .docx, .pdf) for chunked multi-agent grammar verification and RAG explanation.
        </p>
      </div>

      {/* Upload area */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 transition-colors ${
              isDragging
                ? 'border-indigo-400 bg-indigo-50/50'
                : 'border-gray-200 bg-gray-50/30'
            }`}
          >
            <Upload className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              Drag and drop your document here
            </p>
            <p className="text-xs text-gray-400">Supports .txt, .docx, and .pdf (up to 10 MB)</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <FileText className="h-4 w-4" />
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.docx,.pdf"
              onChange={handleBrowse}
              className="hidden"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.type} format
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}
      </div>

      {/* Review trigger */}
      {file && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleReview}
            disabled={isReviewing}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300"
          >
            {isReviewing ? 'Analyzing Document Chunks…' : 'Review Document'}
          </button>
          {result && <StatusBadge status="completed" label="Pipeline complete" />}
        </div>
      )}

      {/* Document Review Results */}
      {result && (
        <div className="space-y-5">
          {/* Summary metrics card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-semibold text-gray-900">Analysis Summary</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Multi-Agent Verified
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{result.error_count}</p>
                <p className="text-xs text-gray-500">Errors Detected</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-center">
                <p className="text-lg font-bold text-indigo-600">{result.sentence_count}</p>
                <p className="text-xs text-gray-500">Sentences Chunked</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{result.original_text.length}</p>
                <p className="text-xs text-gray-500">Characters</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-center">
                <p className="text-lg font-bold text-gray-900">
                  {result.original_text.trim().split(/\s+/).length}
                </p>
                <p className="text-xs text-gray-500">Words</p>
              </div>
            </div>
          </div>

          {/* Corrected Text Panel with Action Bar */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Processed Document Text</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .txt
                </button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-emerald-200 bg-emerald-50/30 p-4 text-sm leading-relaxed text-gray-800">
              {result.corrected_text}
            </div>
          </div>

          {/* Granular Error Findings Enriched with RAG */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Detailed Findings & Explanations</h3>
              <p className="text-xs text-gray-500">
                Rule definitions and correction tips retrieved via semantic search.
              </p>
            </div>

            {result.errors.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-3">No grammatical errors detected in the document.</p>
            ) : (
              <div className="space-y-3">
                {result.errors.map((error, idx) => (
                  <div
                    key={`doc-err-${idx}`}
                    className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 underline decoration-red-500 decoration-2 underline-offset-2">
                          {error.original_span}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 underline decoration-emerald-500 decoration-2 underline-offset-2">
                          {error.corrected_span}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                          {ERROR_CATEGORY_LABELS[mapBackendCategory(error.category)]}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">#{idx + 1}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      {error.rule_title && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                          <span>{error.rule_title}</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-600">{error.explanation}</p>
                    </div>

                    {error.pedagogical_tip && (
                      <div className="mt-2.5 flex items-start gap-2 rounded-md bg-amber-50/70 p-2 text-xs text-amber-800 border border-amber-200/50">
                        <Lightbulb className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-900">Tip: </span>
                          <span>{error.pedagogical_tip}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!file && !error && (
        <EmptyState
          title="No document uploaded"
          description="Upload a .txt, .docx, or .pdf file to process full documents with the agent pipeline."
          icon={<FileText className="h-6 w-6" />}
        />
      )}
    </div>
  );
}