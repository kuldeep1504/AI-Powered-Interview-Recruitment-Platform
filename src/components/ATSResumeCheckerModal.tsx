import React, { useState, useRef, useEffect } from 'react';
import { ATSAnalysisResult, ATSCorrectionResult, CandidateProfile } from '../types.ts';
import {
  X,
  FileCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Copy,
  Download,
  Loader2,
  UploadCloud,
  FileText,
  RotateCcw,
  Zap,
  ChevronRight,
  Target,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Paperclip,
} from 'lucide-react';

interface ATSResumeCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialResumeText?: string;
  candidateProfile?: CandidateProfile | null;
  onApplyCorrectedProfile?: (correctedText: string) => void;
}

export const ATSResumeCheckerModal: React.FC<ATSResumeCheckerModalProps> = ({
  isOpen,
  onClose,
  initialResumeText,
  candidateProfile,
  onApplyCorrectedProfile,
}) => {
  const defaultText =
    initialResumeText ||
    `ALEX RIVERA
alex.rivera@example.com | (555) 234-5678 | San Francisco, CA

SUMMARY
Full-Stack Engineer with 5+ years of experience in JavaScript and Python.

EXPERIENCE
Apex Tech Solutions — Senior Software Engineer (2022 - Present)
• Worked on WebRTC video streaming and helped backend team with Node.js
• Built React frontend components and fixed bugs
• Participated in sprint planning and assisted with code reviews

Beacon Systems — Full-Stack Developer (2019 - 2022)
• Handled REST API development in Express and PostgreSQL
• Improved website loading speed and worked with Docker containers

EDUCATION
B.S. in Computer Science — State University (2019)

SKILLS
JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, Docker, Git`;

  const [resumeText, setResumeText] = useState(defaultText);
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Engineer');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [correctionResult, setCorrectionResult] = useState<ATSCorrectionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'correction'>('audit');
  const [copied, setCopied] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File upload states
  const [inputMethod, setInputMethod] = useState<'upload' | 'text'>('upload');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    mimeType: string;
    base64?: string;
  } | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showExtractedPreview, setShowExtractedPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (candidateProfile?.headline?.trim()) {
      setTargetRole(candidateProfile.headline.trim());
    }
    if (initialResumeText && initialResumeText.trim()) {
      setResumeText(initialResumeText);
      setInputMethod('text');
      setUploadedFile(null);
      setAnalysisResult(null);
      setCorrectionResult(null);
      setErrorMessage(null);
      setAppliedSuccess(false);
    }
  }, [isOpen, initialResumeText, candidateProfile]);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleProcessFile = async (file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit. Please upload a smaller resume file.');
      return;
    }

    setErrorMessage(null);
    const mimeType =
      file.type ||
      (file.name.endsWith('.pdf')
        ? 'application/pdf'
        : file.name.endsWith('.docx')
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'text/plain');

    // For plain text or markdown files: direct client read
    if (
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      mimeType.startsWith('text/')
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        setResumeText(text);
        setUploadedFile({
          name: file.name,
          size: file.size,
          mimeType: 'text/plain',
        });
      };
      reader.readAsText(file);
      return;
    }

    // For PDF / Word documents: read base64 and extract text with AI
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = (e.target?.result as string) || '';
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

      setUploadedFile({
        name: file.name,
        size: file.size,
        mimeType,
        base64,
      });

      setIsExtracting(true);
      try {
        const res = await fetch('/api/ai/resume/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            mimeType,
            fileName: file.name,
          }),
        });
        const data = await res.json();
        if (res.ok && data.text && data.text.trim()) {
          setResumeText(data.text.trim());
        }
      } catch (extractErr) {
        console.warn('Text extraction fallback notice:', extractErr);
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Step 1: Run ATS Analysis
  const handleRunAnalysis = async () => {
    if (!resumeText.trim() && !uploadedFile?.base64) {
      setErrorMessage('Please upload a resume file or provide resume text to scan.');
      return;
    }
    setIsAnalyzing(true);
    setErrorMessage(null);
    setCorrectionResult(null);
    setAppliedSuccess(false);

    try {
      const res = await fetch('/api/ai/resume/ats-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetRole,
          fileData: uploadedFile?.base64
            ? { base64: uploadedFile.base64, mimeType: uploadedFile.mimeType }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ATS scan failed');
      setAnalysisResult(data.analysis);
      setActiveTab('audit');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error scanning resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 2: Run AI Resume Correction & Rewrite
  const handleRunCorrection = async () => {
    if (!resumeText.trim()) {
      setErrorMessage('Please provide resume text or wait for file text extraction to complete.');
      return;
    }
    setIsCorrecting(true);
    setErrorMessage(null);
    setAppliedSuccess(false);
    try {
      const res = await fetch('/api/ai/resume/ats-correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Correction failed');
      setCorrectionResult(data.correction);
      setActiveTab('correction');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error generating corrections');
    } finally {
      setIsCorrecting(false);
    }
  };

  const handleCopyCorrected = () => {
    if (!correctionResult) return;
    navigator.clipboard.writeText(correctionResult.correctedResumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!correctionResult) return;
    const element = document.createElement('a');
    const file = new Blob([correctionResult.correctedResumeText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'ATS_Optimized_Resume.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleApplyToProfile = () => {
    if (!correctionResult || !onApplyCorrectedProfile) return;
    onApplyCorrectedProfile(correctionResult.correctedResumeText);
    setAppliedSuccess(true);
  };

  // Sample Resumes for testing
  const loadUnoptimizedSample = () => {
    setResumeText(`JOHN DOE
johndoe@email.com | 555-0192

SUMMARY
Looking for a coding job where I can use my skills.

EXPERIENCE
Web Corp — Developer (2021-Present)
• Worked on company website
• Helped teammates fix bugs
• Handled frontend stuff with JavaScript
• Assisted with database updates

Small Apps Inc — Junior Programmer (2019-2021)
• Did some coding in Python
• Worked on tests

EDUCATION
College of Tech — B.S. (2019)

SKILLS
Coding, Python, JavaScript, HTML, CSS`);
    setAnalysisResult(null);
    setCorrectionResult(null);
  };

  const loadStrongSample = () => {
    setResumeText(`PRIYA SHARMA
priya.sharma@example.com | (206) 555-0199 | Seattle, WA | github.com/priyasharma-ai

PROFESSIONAL SUMMARY
AI Infrastructure & Machine Learning Systems Engineer with 5+ years of experience scaling production LLM inference pipelines, semantic retrieval engines, and distributed vector databases.

TECHNICAL SKILLS
• Languages: Python, C++, SQL, Bash
• Frameworks: PyTorch, TensorFlow, FastAPI, LangChain, Transformers
• Cloud & Data Infrastructure: GCP (Vertex AI), Docker, Kubernetes, PostgreSQL, Redis, Pinecone, Milvus

PROFESSIONAL EXPERIENCE

Aether AI Labs — AI Infrastructure Engineer | 2021 – Present
• Architected semantic retrieval pipelines serving 1.5M+ embeddings daily, reducing query latency by 42% via custom vector indexing.
• Deployed high-concurrency LLM inference endpoints in FastAPI and Triton, increasing GPU throughput by 3.2x under peak traffic.
• Implemented automated evaluation harnesses to benchmark hallucination rates, improving safety alignment score to 99.4%.

DataStream Tech — Machine Learning Engineer | 2019 – 2021
• Engineered production recommendation pipelines processing 25M daily user events with 99.95% SLA uptime.
• Automated model training workflows on Kubernetes, slashing retraining cycle times from 18 hours to 4 hours.

EDUCATION
M.S. in Machine Learning — University of Washington (2019)
B.S. in Computer Science — IIT (2017)`);
    setAnalysisResult(null);
    setCorrectionResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 my-8 space-y-6 max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              100% Free ATS Compatibility Scanner
            </span>
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Tested against Workday, Greenhouse, Lever, Taleo & iCIMS
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            ATS Resume Checker & Score Analyzer
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Detect formatting red flags, uncover missing high-value keywords, score quantifiable impact, and let AI auto-correct your resume with power action verbs.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs animate-in fade-in">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Active My Resume Source Banner */}
        {initialResumeText && initialResumeText.trim() && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Loaded resume from <span className="font-bold">My Resume</span>
                {candidateProfile?.resumeFileName ? ` (${candidateProfile.resumeFileName})` : ''}.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {resumeText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        )}

        {/* Resume Input Area */}
        <div className="bg-neutral-50/80 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/90 dark:border-neutral-700/80 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                Target Job Title / Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer, Product Designer, DevOps Lead"
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              />
            </div>

            {/* Quick Sample Selectors */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">
                Test with Presets:
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    handleRemoveUploadedFile();
                    loadUnoptimizedSample();
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  Weak Resume (Test Fix)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRemoveUploadedFile();
                    loadStrongSample();
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  Strong Tech Resume
                </button>
              </div>
            </div>
          </div>

          {/* Source Toggle Tabs */}
          <div className="flex items-center space-x-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
            <button
              type="button"
              onClick={() => setInputMethod('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                inputMethod === 'upload'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Resume File</span>
              {uploadedFile && (
                <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setInputMethod('text')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                inputMethod === 'text'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste / Edit Plain Text</span>
              <span className="text-[10px] opacity-75">
                ({resumeText.trim().split(/\s+/).filter(Boolean).length} words)
              </span>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.rtf,.md,application/pdf"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Tab 1: Upload Mode */}
          {inputMethod === 'upload' && (
            <div className="space-y-3">
              {!uploadedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-400'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white/70 dark:bg-neutral-900/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                    Drop your resume file here or click to browse
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 max-w-md mx-auto">
                    Upload your PDF, DOCX, TXT, or MD resume. Our AI extracts and analyzes formatting, keyword density, and section scores against ATS benchmarks.
                  </p>
                  <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 shadow-xs">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Select Resume Document</span>
                  </div>
                  <div className="mt-3 text-[11px] text-neutral-400">
                    Supports files up to 10MB • Preserves privacy & confidentiality
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* File Uploaded Card */}
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[240px] sm:max-w-xs">
                            {uploadedFile.name}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-semibold">
                            {formatFileSize(uploadedFile.size)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          {isExtracting ? (
                            <span className="inline-flex items-center text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              Extracting text with AI...
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                              Ready for ATS Scan ({resumeText.trim().split(/\s+/).filter(Boolean).length} words detected)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                      >
                        Replace File
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveUploadedFile}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Extracted Text Collapsible Preview */}
                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-800">
                    <button
                      type="button"
                      onClick={() => setShowExtractedPreview(!showExtractedPreview)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100/70 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        {showExtractedPreview ? (
                          <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-neutral-500" />
                        )}
                        <span>
                          {showExtractedPreview ? 'Hide' : 'View & Edit'} Extracted Plain Text ({resumeText.trim().split(/\s+/).filter(Boolean).length} words)
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-normal">
                        Click to {showExtractedPreview ? 'collapse' : 'expand'}
                      </span>
                    </button>

                    {showExtractedPreview && (
                      <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
                        <textarea
                          rows={5}
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          placeholder="Extracted resume text appears here..."
                          className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-neutral-800 dark:text-neutral-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Plain Text Editor Mode */}
          {inputMethod === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Resume Plain Text / Content
                </label>
                <span className="text-[11px] text-neutral-400">
                  {resumeText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your raw resume text here or use a preset..."
                className="w-full text-xs p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-neutral-800 dark:text-neutral-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-neutral-500 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Free instant scanning • No credit card or sign-in required</span>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Scanning ATS Compatibility...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>Run Free ATS Scan & Score</span>
                  </>
                )}
              </button>

              {/* Special requested button: Analyze & Resume Correction */}
              <button
                type="button"
                onClick={handleRunCorrection}
                disabled={isCorrecting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isCorrecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Auto-Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze & Auto-Correct Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results View */}
        {(analysisResult || correctionResult) && (
          <div className="space-y-6 pt-4 border-t border-neutral-200">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    activeTab === 'audit'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>ATS Audit & Scorecard</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!correctionResult) {
                      handleRunCorrection();
                    } else {
                      setActiveTab('correction');
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    activeTab === 'correction'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {correctionResult ? 'View AI Corrected Resume' : 'Analyze & Auto-Correct (AI)'}
                  </span>
                </button>
              </div>

              {correctionResult && (
                <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Projected ATS Score: {correctionResult.estimatedNewScore}/100</span>
                </div>
              )}
            </div>

            {/* TAB 1: ATS AUDIT SCORECARD */}
            {activeTab === 'audit' && analysisResult && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Score Banner */}
                <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                  <div className="flex items-center space-x-5">
                    <div className="relative w-24 h-24 rounded-2xl bg-neutral-800 border border-neutral-700 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-emerald-400">
                        {analysisResult.overallScore}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                        / 100 ATS
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                            analysisResult.overallScore >= 80
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : analysisResult.overallScore >= 65
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          Grade {analysisResult.grade}
                        </span>
                        <span className="text-xs text-neutral-400">• {targetRole}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {analysisResult.overallScore >= 80
                          ? 'Passes Top-Tier ATS Parsers'
                          : 'Potential ATS Filtering Risk Detected'}
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1 max-w-xl leading-relaxed">
                        {analysisResult.verdict}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRunCorrection}
                    disabled={isCorrecting}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs transition-colors shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Apply Auto-Correction Now</span>
                  </button>
                </div>

                {/* 5 Core Pillars Grid */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-3">
                    ATS Audit Dimensions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-semibold text-neutral-500">Formatting</div>
                      <div className="text-xl font-black text-neutral-900 mt-1">
                        {analysisResult.breakdown.formattingAndParseability}%
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Parseable structure</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-semibold text-neutral-500">Keyword Density</div>
                      <div className="text-xl font-black text-neutral-900 mt-1">
                        {analysisResult.breakdown.keywordDensity}%
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Tech skill matches</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-semibold text-neutral-500">Quantifiable Impact</div>
                      <div
                        className={`text-xl font-black mt-1 ${
                          analysisResult.breakdown.quantifiableImpact < 70
                            ? 'text-amber-600'
                            : 'text-neutral-900'
                        }`}
                      >
                        {analysisResult.breakdown.quantifiableImpact}%
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Metrics & % numbers</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-semibold text-neutral-500">Section Health</div>
                      <div className="text-xl font-black text-neutral-900 mt-1">
                        {analysisResult.breakdown.sectionCompleteness}%
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Standard headers</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-semibold text-neutral-500">Length & Readability</div>
                      <div className="text-xl font-black text-neutral-900 mt-1">
                        {analysisResult.breakdown.readabilityAndLength}%
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Word count balance</div>
                    </div>
                  </div>
                </div>

                {/* Red Flags & Action Verbs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Crucial Red Flags */}
                  <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                    <div className="flex items-center space-x-2 text-rose-900 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Crucial ATS Red Flags</span>
                    </div>
                    <ul className="space-y-2 text-rose-950">
                      {analysisResult.crucialRedFlags.map((flag, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span className="text-[11px] leading-relaxed">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weak Action Verbs Replacement Guide */}
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                    <div className="flex items-center space-x-2 text-amber-900 font-bold">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>Action Verb Power-Up</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Replace passive filler words with authoritative executive verbs:
                    </p>
                    <div className="space-y-1.5">
                      {analysisResult.weakVerbsIdentified.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-amber-200 text-[11px]"
                        >
                          <span className="line-through text-neutral-500 font-mono font-medium">
                            "{item.weak}"
                          </span>
                          <ArrowRight className="w-3 h-3 text-amber-600" />
                          <span className="font-bold text-emerald-800">{item.suggestedReplacement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Missing Keywords & Section Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Missing Keywords */}
                  <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 flex items-center space-x-1.5">
                        <Target className="w-4 h-4 text-neutral-700" />
                        <span>Recommended Keywords for "{targetRole}"</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.missingKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 text-[11px] font-semibold border border-neutral-200"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Section Checklist */}
                  <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-2.5">
                    <span className="font-bold text-neutral-900 block mb-1">
                      Required Sections Verification
                    </span>
                    <div className="space-y-1.5">
                      {analysisResult.detectedSections.map((sec, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 text-[11px]"
                        >
                          <div className="flex items-center space-x-2">
                            {sec.status === 'OPTIMAL' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span className="font-semibold text-neutral-800">{sec.name}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              sec.status === 'OPTIMAL'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {sec.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI RESUME CORRECTION (Side-by-side & improvements) */}
            {activeTab === 'correction' && correctionResult && (
              <div className="space-y-6 animate-in fade-in duration-150 text-xs">
                {/* Top Success Banner */}
                <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>ATS Auto-Correction Complete</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Score Boosted to ~{correctionResult.estimatedNewScore}/100
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1 max-w-xl leading-relaxed">
                      {correctionResult.summaryOfCorrections}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCopyCorrected}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors flex items-center space-x-1.5 border border-white/20"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                    </button>

                    <button
                      onClick={handleDownload}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors flex items-center space-x-1.5 border border-white/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .txt</span>
                    </button>

                    {onApplyCorrectedProfile && (
                      <button
                        onClick={handleApplyToProfile}
                        disabled={appliedSuccess}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black transition-colors flex items-center space-x-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{appliedSuccess ? 'Applied to Profile!' : 'Save to Profile'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Specific Improvements Made */}
                <div className="space-y-3">
                  <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                    Detailed Improvements & Bullet Point Rewrites
                  </h4>
                  <div className="space-y-3">
                    {correctionResult.improvements.map((imp, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-neutral-900">{imp.section}</span>
                          <span className="text-emerald-700 font-semibold">{imp.reason}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                          <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/80">
                            <span className="font-bold text-rose-800 block mb-1">Before:</span>
                            <span className="text-neutral-700">{imp.before}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                            <span className="font-bold text-emerald-800 block mb-1">
                              After (STAR/XYZ Optimized):
                            </span>
                            <span className="text-neutral-900 font-medium">{imp.after}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Corrected Resume Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                      Full ATS-Compliant Output
                    </h4>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Single-column • Standard hierarchy • Clean parsing
                    </span>
                  </div>
                  <pre className="p-5 rounded-2xl bg-neutral-900 text-neutral-200 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-neutral-800 max-h-96 overflow-y-auto">
                    {correctionResult.correctedResumeText}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
