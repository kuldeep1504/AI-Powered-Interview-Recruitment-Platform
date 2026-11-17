import React, { useState, useRef, useEffect } from 'react';
import { AIParsedResume, CandidateProfile } from '../types.ts';
import { getAuthToken } from '../utils/authToken.ts';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';

interface ResumeUploaderProps {
  currentParsed?: AIParsedResume;
  currentFileName?: string;
  currentRawText?: string;
  onRemoveResume?: () => void;
  onParsedSuccess: (
    parsed: AIParsedResume,
    meta?: { rawText: string; fileName: string; profile?: CandidateProfile }
  ) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  currentParsed,
  currentFileName,
  currentRawText,
  onRemoveResume,
  onParsedSuccess,
}) => {
  const [resumeText, setResumeText] = useState(currentRawText || '');
  const [fileName, setFileName] = useState<string>(currentFileName || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentFileName !== undefined) {
      setFileName(currentFileName);
    }
  }, [currentFileName]);

  useEffect(() => {
    if (currentRawText !== undefined) {
      setResumeText(currentRawText);
    }
  }, [currentRawText]);

  const processSelectedFile = async (file: File) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15MB limit. Please upload a smaller resume file.');
      return;
    }

    setFileName(file.name);
    setError(null);

    const lowerName = file.name.toLowerCase();
    const isPlainText =
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.md') ||
      (file.type && file.type.startsWith('text/'));

    if (isPlainText) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const content = (evt.target?.result as string) || '';
        if (!content.trim()) {
          setError('The uploaded text file appears to be empty.');
          return;
        }
        setResumeText(content);
        await triggerAnalysis(content, file.name);
      };
      reader.readAsText(file);
      return;
    }

    const mimeType =
      file.type ||
      (lowerName.endsWith('.pdf')
        ? 'application/pdf'
        : lowerName.endsWith('.docx')
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : lowerName.endsWith('.doc')
            ? 'application/msword'
            : 'application/pdf');

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const dataUrl = (evt.target?.result as string) || '';
        const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        if (!base64) {
          throw new Error('Could not read file contents.');
        }

        const token = getAuthToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const extractRes = await fetch('/api/ai/resume/extract-text', {
          method: 'POST',
          headers,
          body: JSON.stringify({ fileBase64: base64, mimeType, fileName: file.name }),
        });
        const extractData = await extractRes.json().catch(() => ({}));
        if (!extractRes.ok || !extractData.text?.trim()) {
          throw new Error(
            extractData.error ||
              extractData.details ||
              'Could not extract text from this document. Try pasting your resume text or uploading a PDF/TXT file.'
          );
        }

        setResumeText(extractData.text);
        await triggerAnalysis(extractData.text, file.name);
      } catch (err: any) {
        setError(err?.message || 'Failed to read and extract resume document.');
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processSelectedFile(file);
    }
    e.target.value = '';
  };

  const handleRemoveUploaded = () => {
    setFileName('');
    setResumeText('');
    setError(null);
    onRemoveResume?.();
  };

  const triggerAnalysis = async (textToParse: string, nameOfFile: string) => {
    if (!textToParse.trim()) {
      setError('Please provide resume text to analyze.');
      return;
    }
    setIsAnalyzing(true);
    setError(null);

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/candidates/resume', {
        method: 'POST',
        headers,
        body: JSON.stringify({ rawText: textToParse, fileName: nameOfFile }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to analyze resume with AI service');
      }

      if (data.parsed) {
        onParsedSuccess(data.parsed, {
          rawText: textToParse,
          fileName: nameOfFile,
          profile: data.profile,
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during resume parsing');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs p-6 text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-neutral-100 dark:border-neutral-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">AI Resume Parser & Skill Extraction</h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Phase 2 Engine
            </span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Extracts structured skills, work history, and education to power explainable job matching and tailored interview questions.
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id="resume-file-input"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Upload Zone / Uploaded Resume Card */}
      {(() => {
          const displayName = (currentFileName || fileName || '').trim();
          const hasUploadedResume = Boolean(displayName || currentParsed || (currentRawText || resumeText).trim());
          const uploadedWordCount = (currentRawText ?? resumeText).trim().split(/\s+/).filter(Boolean).length;

          if (hasUploadedResume) {
            return (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[260px] sm:max-w-sm">
                        {displayName || 'Uploaded_Resume.pdf'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Resume Uploaded
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                      {currentParsed?.name ? `${currentParsed.name} • ` : ''}
                      {uploadedWordCount > 0 ? `${uploadedWordCount} words extracted` : 'Ready for AI analysis & ATS scoring'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Replace File</span>
                  </button>
                  {onRemoveResume && (
                    <button
                      type="button"
                      onClick={handleRemoveUploaded}
                      disabled={isAnalyzing}
                      className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer disabled:opacity-50"
                      title="Remove uploaded resume"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 text-center bg-neutral-50/50 dark:bg-neutral-800/70">
              <div className="mx-auto w-11 h-11 rounded-xl bg-white dark:bg-neutral-800 shadow-xs border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 mb-3">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Upload your resume document
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-4">
                Supports PDF, DOCX, and TXT files up to 15MB
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 transition-colors shadow-xs cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 mr-1.5" />
                <span>Select Resume File</span>
              </button>
            </div>
          );
        })()}

      {/* Loading state indicator */}
      {isAnalyzing && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center space-x-3 text-emerald-900 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <div>
            <div className="font-semibold">Processing resume with NLP extraction model...</div>
            <div className="text-xs text-emerald-700">Extracting skills, duration metrics, work impact, and domain taxonomy</div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Current Structured Parsed Data Preview */}
      {currentParsed && (
        <div className="mt-6 pt-6 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-neutral-900 text-sm">Extracted Structured Profile</h4>
            </div>
            <span className="text-xs text-neutral-400">File: {fileName}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Candidate Identity */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Identified Candidate</div>
              <div className="font-bold text-neutral-900 text-base">{currentParsed.name}</div>
              <div className="text-xs text-neutral-600 mt-0.5">{currentParsed.headline}</div>
              <div className="text-xs text-neutral-500 mt-2">{currentParsed.email} • {currentParsed.phone}</div>
            </div>

            {/* Extracted Skills categorization */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 md:col-span-2">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Verified Skills Taxonomy</span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {(currentParsed.skills?.languages?.length || 0) +
                    (currentParsed.skills?.frameworks?.length || 0) +
                    (currentParsed.skills?.toolsAndDatabases?.length || 0)}{' '}
                  competencies detected
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(currentParsed.skills?.languages || []).map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                    {s}
                  </span>
                ))}
                {(currentParsed.skills?.frameworks || []).map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                    {s}
                  </span>
                ))}
                {(currentParsed.skills?.toolsAndDatabases || []).map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                    {s}
                  </span>
                ))}
                {(currentParsed.skills?.softSkills || []).map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Experience Highlights */}
          {currentParsed.experience && currentParsed.experience.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Work History Extract</div>
              <div className="space-y-3">
                {currentParsed.experience.slice(0, 2).map((exp, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex items-center justify-between font-semibold text-neutral-900">
                      <span>{exp.role} @ {exp.company}</span>
                      <span className="text-neutral-500 font-normal">{exp.duration}</span>
                    </div>
                    {exp.highlights && exp.highlights[0] && (
                      <p className="text-neutral-600 mt-1 text-[11px] leading-relaxed line-clamp-2">
                        • {exp.highlights[0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
