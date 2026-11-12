import React, { useState } from 'react';
import { AIParsedResume } from '../types.ts';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Code2,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

interface ResumeUploaderProps {
  currentParsed?: AIParsedResume;
  onParsedSuccess: (parsed: AIParsedResume) => void;
}

const SAMPLE_RESUMES = {
  alex: {
    title: 'Alex Rivera — Senior Full-Stack & WebRTC Engineer',
    text: `ALEX RIVERA
alex.rivera@example.com | (555) 349-8821 | San Francisco, CA | github.com/alexrivera-dev

PROFESSIONAL SUMMARY
Senior Full-Stack Engineer with 6+ years building real-time media platforms, WebRTC peer connection pipelines, high-throughput Node.js microservices, and React 19 web applications.

CORE TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, Go
Frameworks & Libraries: React, Next.js, Express, Node.js, Tailwind CSS
Protocols & Real-Time: WebRTC, WebSockets, REST APIs, ICE/STUN/TURN
Cloud & Data: PostgreSQL, MongoDB, Redis, AWS, Docker, Kubernetes

WORK HISTORY
Nexus Realtime Inc. — Senior Full-Stack Engineer (March 2022 - Present)
- Engineered scalable WebRTC video conferencing engine handling 150k daily active sessions with low latency.
- Built real-time media signaling service in Node.js and Redis Pub/Sub, reducing packet retransmissions by 35%.
- Spearheaded frontend architecture rewrite using React and modern headless design systems.

StreamScale Labs — Full-Stack Developer (July 2020 - Feb 2022)
- Developed telemetry dashboard visualizers and ingestion APIs processing 25,000 writes/second in PostgreSQL.
- Slashed median API latency by 45% through aggressive query optimization and Redis caching.

EDUCATION
B.S. in Computer Science — UC Berkeley (2016 - 2020)

CERTIFICATIONS
- AWS Certified Solutions Architect
- Certified Kubernetes Application Developer (CKAD)`,
  },
  priya: {
    title: 'Priya Sharma — AI/ML Platform Engineer',
    text: `PRIYA SHARMA
priya.sharma@example.com | (555) 812-4491 | Seattle, WA

PROFESSIONAL SUMMARY
Machine Learning & AI Platform Engineer specializing in high-throughput LLM inference, embedding pipelines, vector databases, and Python microservices.

CORE SKILLS
Languages: Python, C++, SQL
Frameworks: PyTorch, FastAPI, LangChain, Transformers, HuggingFace
Cloud & Tools: Docker, Kubernetes, GCP, PostgreSQL, Milvus, Redis

WORK HISTORY
Aether AI Labs — AI Infrastructure Engineer (August 2021 - Present)
- Designed production LLM evaluation harnesses and semantic search retrieval pipelines with sub-50ms latency.
- Scaled distributed model inference workers utilizing GPU batch scheduling and tensor parallelism.

EDUCATION
M.S. in Computer Science (Artificial Intelligence) — University of Washington (2019 - 2021)`,
  },
};

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ currentParsed, onParsedSuccess }) => {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState<string>('Uploaded_Resume.pdf');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setResumeText(content);
        triggerAnalysis(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const content = evt.target?.result as string;
        if (content) {
          setResumeText(content);
          triggerAnalysis(content, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const loadSample = (key: 'alex' | 'priya') => {
    const sample = SAMPLE_RESUMES[key];
    setResumeText(sample.text);
    setFileName(`${key === 'alex' ? 'Alex_Rivera_Resume' : 'Priya_Sharma_Resume'}.pdf`);
    triggerAnalysis(sample.text, `${key}_Resume.pdf`);
  };

  const triggerAnalysis = async (textToParse: string, nameOfFile: string) => {
    if (!textToParse.trim()) {
      setError('Please provide resume text to analyze.');
      return;
    }
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/candidates/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: textToParse, fileName: nameOfFile }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze resume with AI service');
      }

      const data = await res.json();
      if (data.parsed) {
        onParsedSuccess(data.parsed);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during resume parsing');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs p-6 text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-neutral-100 dark:border-neutral-800 gap-3">
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

        {/* Sample Loaders */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => loadSample('alex')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Load Alex's Full-Stack Resume
          </button>
          <button
            type="button"
            onClick={() => loadSample('priya')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Load Priya's AI/ML Resume
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mt-4 mb-4 border-b border-neutral-100 dark:border-neutral-800 text-sm">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-2.5 font-medium transition-colors border-b-2 ${
            activeTab === 'upload'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Upload Document (PDF / DOCX / TXT)
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`pb-2.5 font-medium transition-colors border-b-2 ${
            activeTab === 'text'
              ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Paste Raw Resume Text
        </button>
      </div>

      {/* Upload Zone */}
      {activeTab === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-800'
          }`}
        >
          <input
            type="file"
            id="resume-file-input"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="mx-auto w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 shadow-xs border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 mb-3">
            <UploadCloud className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
          </div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Drag & drop your resume, or <span className="text-emerald-700 dark:text-emerald-400 underline">browse files</span>
          </h4>
          <p className="text-xs text-neutral-500 mt-1">Supports PDF, DOCX, and TXT files up to 15MB</p>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            rows={7}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your plain text resume content here..."
            className="w-full text-xs font-mono p-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50/50"
          />
          <div className="flex justify-end">
            <button
              onClick={() => triggerAnalysis(resumeText, 'Pasted_Resume.txt')}
              disabled={isAnalyzing || !resumeText.trim()}
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white disabled:opacity-50 transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2 text-emerald-400" />
                  Parse Resume with AI
                </>
              )}
            </button>
          </div>
        </div>
      )}

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
                  {currentParsed.skills.languages.length +
                    currentParsed.skills.frameworks.length +
                    currentParsed.skills.toolsAndDatabases.length}{' '}
                  competencies detected
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentParsed.skills.languages.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                    {s}
                  </span>
                ))}
                {currentParsed.skills.frameworks.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                    {s}
                  </span>
                ))}
                {currentParsed.skills.toolsAndDatabases.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                    {s}
                  </span>
                ))}
                {currentParsed.skills.softSkills.map((s, idx) => (
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
