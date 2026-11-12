import React, { useState } from 'react';
import {
  X,
  FileText,
  Layers,
  Cpu,
  Shield,
  CheckCircle2,
  Video,
  Brain,
  Database,
  Terminal,
  Code2,
  Sparkles,
  GitBranch,
  BookOpen,
  Check,
} from 'lucide-react';

interface SRSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SRSModal: React.FC<SRSModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'usecases' | 'testcases' | 'nlp_pipeline' | 'governance'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 backdrop-blur-xs p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-5xl w-full h-[90vh] max-h-[850px] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Fixed Modal Header (Never scrolls) */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between bg-neutral-50/80 dark:bg-neutral-900/90 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                B.Tech CSE Final Year Project SRS
              </span>
              <span className="text-xs text-neutral-400">• IEEE 830-1998 Aligned</span>
            </div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white mt-1.5 tracking-tight">
              AI-Powered Interview & Recruitment Platform
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Software Requirements Specification (SRS), Technical Architecture, NLP Pipelines & Test Matrix
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fixed Tab Navigation (Never scrolls) */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-6 bg-neutral-50/40 dark:bg-neutral-900/40 overflow-x-auto text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'architecture'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>5-Tier Architecture (Section 5)</span>
          </button>

          <button
            onClick={() => setActiveTab('nlp_pipeline')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'nlp_pipeline'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>NLP & LLM Evaluation (Section 8, 16)</span>
          </button>

          <button
            onClick={() => setActiveTab('usecases')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'usecases'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Use Cases UC-01 to UC-06 (Section 27)</span>
          </button>

          <button
            onClick={() => setActiveTab('testcases')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'testcases'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Test Cases TC-01 to TC-12 (Section 49)</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'governance'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Ethics & Advisory Rule (Section 50)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-neutral-700 dark:text-neutral-300 text-xs">
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                <h4 className="font-extrabold text-sm mb-1 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>5-Tier System Architecture (SRS Section 5.1)</span>
                </h4>
                <p className="text-xs leading-relaxed">
                  Decoupled microservices architecture designed to scale interview media streams independently of high-throughput resume parsing and NLP evaluation tasks.
                </p>
              </div>

              {/* Visual ASCII/Diagram of Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2">
                  <div className="font-bold text-neutral-900 dark:text-white flex items-center space-x-1.5">
                    <Code2 className="w-4 h-4 text-emerald-500" />
                    <span>Tier 1: Frontend</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    React 18, Vite, Tailwind CSS, MediaDevices WebRTC API, Lucide Icons, Web Speech API client.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2">
                  <div className="font-bold text-neutral-900 dark:text-white flex items-center space-x-1.5">
                    <Terminal className="w-4 h-4 text-blue-500" />
                    <span>Tier 2: Backend API</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Node.js & Express REST API, JWT auth tokens, routing, candidate & job controllers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2">
                  <div className="font-bold text-neutral-900 dark:text-white flex items-center space-x-1.5">
                    <Database className="w-4 h-4 text-amber-500" />
                    <span>Tier 3: Database</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    MongoDB / Persistent Document Store: Users, Resumes, Jobs, Applications, Transcripts.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2">
                  <div className="font-bold text-neutral-900 dark:text-white flex items-center space-x-1.5">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span>Tier 4: AI & NLP</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Python NLP services, spaCy, NLTK, Gemini LLM for scoring, rubrics, and feedback generation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2">
                  <div className="font-bold text-neutral-900 dark:text-white flex items-center space-x-1.5">
                    <Video className="w-4 h-4 text-rose-500" />
                    <span>Tier 5: WebRTC</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    P2P Video stream, STUN/TURN signaling, real-time media track management, audio analyser.
                  </p>
                </div>
              </div>

              {/* End-to-End Flow */}
              <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  SRS Lifecycle Workflow (Section 6)
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-semibold">1. Candidate Sign-Up & Track Calibration</span>
                  <span className="text-neutral-400">➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-semibold">2. Resume Upload & PDF NLP Parsing</span>
                  <span className="text-neutral-400">➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-semibold">3. Job Matching (Cosine + TF-IDF)</span>
                  <span className="text-neutral-400">➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-semibold">4. Interview Scheduled</span>
                  <span className="text-neutral-400">➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-semibold">5. WebRTC Video Room</span>
                  <span className="text-neutral-400">➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-semibold">6. Speech-to-Text & LLM Scoring</span>
                  <span className="text-neutral-400">➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-semibold">7. Candidate Ranking (Weighted)</span>
                  <span className="text-neutral-400">➔</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 font-bold text-emerald-800 dark:text-emerald-300">8. Human Recruiter Decision</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NLP & EVALUATION */}
          {activeTab === 'nlp_pipeline' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                <h4 className="font-extrabold text-sm mb-1 flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Resume Parsing & Speech NLP Pipeline (SRS Section 8 & 16)</span>
                </h4>
                <p className="text-xs leading-relaxed">
                  Dual-phase evaluation: Extraction of structured entities from raw document text, followed by semantic vector matching and LLM-grounded rubric evaluation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Resume Parsing Pipeline (FR-07)</h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                      <span><strong>Document Text Extraction:</strong> PDF/DOCX stream extracted to plain text.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                      <span><strong>Named Entity Recognition (NER):</strong> Extracts Candidate Name, Email, Phone, Degrees, and Companies.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                      <span><strong>Skill Dictionary & Taxonomy:</strong> Matches technical tokens (React, Python, Docker) and soft skills.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[10px]">4</span>
                      <span><strong>Match Scoring:</strong> Skill Match (40%), Experience Match (30%), Education (15%), Domain Keywords (15%).</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Interview Answer Scoring (FR-14 & Section 17)</h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                      <span><strong>Speech-to-Text:</strong> Web Speech API transcribes candidate audio in real time.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                      <span><strong>Technical Correctness (0-100):</strong> Evaluates factual validity against question rubric.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                      <span><strong>STAR Methodology Alignment:</strong> Verifies Situation, Task, Action, Result in behavioral drills.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-[10px]">4</span>
                      <span><strong>Dual Feedback Generation:</strong> Actionable growth guide for candidate; verification notes for recruiter.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USE CASES */}
          {activeTab === 'usecases' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-500">
                Core Use Cases detailed in SRS Section 27 (UC-01 through UC-06):
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'UC-01',
                    title: 'Candidate Registration & Track Selection',
                    actors: 'Candidate',
                    pre: 'User has internet access',
                    post: 'Candidate profile and track calibration saved',
                    desc: 'Candidate signs up, selects Fresher (campus/entry) or Experienced track, and uploads resume.',
                  },
                  {
                    id: 'UC-02',
                    title: 'Resume Upload & AI Parsing',
                    actors: 'Candidate, NLP Service',
                    pre: 'Candidate authenticated',
                    post: 'Parsed skills, education, and experience stored',
                    desc: 'System extracts text from PDF, parses entities, and provides real-time ATS optimization feedback.',
                  },
                  {
                    id: 'UC-03',
                    title: 'Job Posting & AI Requirements Extraction',
                    actors: 'Recruiter, AI Service',
                    pre: 'Recruiter authenticated',
                    post: 'Job opening active with structured skill requirements',
                    desc: 'Recruiter publishes position; AI derives required and preferred technical competencies.',
                  },
                  {
                    id: 'UC-04',
                    title: 'AI Resume Match Computation',
                    actors: 'System / AI Microservice',
                    pre: 'Application submitted',
                    post: 'Advisory match score computed with factor breakdown',
                    desc: 'System compares candidate vector against job vector, outputting transparent match percentages.',
                  },
                  {
                    id: 'UC-05',
                    title: 'Conduct AI WebRTC Video Interview',
                    actors: 'Candidate, WebRTC Engine, Speech AI',
                    pre: 'Interview scheduled and verified',
                    post: 'Audio transcribed and answers recorded',
                    desc: 'Candidate enters video room, grants camera/mic permissions, and answers AI-generated technical questions.',
                  },
                  {
                    id: 'UC-06',
                    title: 'Candidate Evaluation & Recruiter Decision',
                    actors: 'Recruiter, AI Scoring Engine',
                    pre: 'Interview completed',
                    post: 'Application shortlisted/selected by human recruiter',
                    desc: 'Recruiter inspects AI evaluation report, compares candidates, and submits final human hiring decision.',
                  },
                ].map((uc) => (
                  <div key={uc.id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-neutral-900 dark:text-white">
                        {uc.id}: {uc.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Actor: {uc.actors}
                      </span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300 text-xs mb-2 leading-relaxed">{uc.desc}</p>
                    <div className="flex flex-wrap gap-4 text-[11px] text-neutral-500 dark:text-neutral-400">
                      <span><strong>Precondition:</strong> {uc.pre}</span>
                      <span><strong>Postcondition:</strong> {uc.post}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TEST CASES */}
          {activeTab === 'testcases' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-500">
                Formal Acceptance Test Cases from SRS Section 49 (TC-01 through TC-12):
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Test ID</th>
                      <th className="py-2.5 px-3">Feature</th>
                      <th className="py-2.5 px-4">Test Input / Action</th>
                      <th className="py-2.5 px-4">Expected Result</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {[
                      { id: 'TC-01', feat: 'Registration', input: 'Valid email, role selection', expected: 'Account created with JWT token', pass: true },
                      { id: 'TC-02', feat: 'Track Calibration', input: 'Fresher vs Experienced choice', expected: 'Targeted dashboard and prep rendered', pass: true },
                      { id: 'TC-03', feat: 'Resume Upload', input: 'Valid PDF/DOCX file', expected: 'File parsed and skills categorized', pass: true },
                      { id: 'TC-04', feat: 'Invalid File', input: 'Corrupt or unsupported format', expected: 'Graceful error message returned', pass: true },
                      { id: 'TC-05', feat: 'Job Posting', input: 'Job details with required skills', expected: 'Opening published on Job Board', pass: true },
                      { id: 'TC-06', feat: 'Application', input: 'Candidate clicks Apply', expected: 'AI Match Score calculated instantly', pass: true },
                      { id: 'TC-07', feat: 'Question Gen', input: 'Job title & candidate profile', expected: 'Targeted questions and rubrics generated', pass: true },
                      { id: 'TC-08', feat: 'WebRTC Room', input: 'Enter meeting with camera/mic', expected: 'Live video and mic meter functioning', pass: true },
                      { id: 'TC-09', feat: 'Speech-to-Text', input: 'Spoken verbal answer', expected: 'Transcribed text captured in state', pass: true },
                      { id: 'TC-10', feat: 'AI Evaluation', input: 'Completed interview answers', expected: 'Dual candidate/recruiter report created', pass: true },
                      { id: 'TC-11', feat: 'Candidate Ranking', input: 'Weighted factor sliders adjusted', expected: 'Dynamic re-ranking of pipeline list', pass: true },
                      { id: 'TC-12', feat: 'Decision Guardrail', input: 'Low AI match score', expected: 'No auto-rejection; human must confirm', pass: true },
                    ].map((tc) => (
                      <tr key={tc.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{tc.id}</td>
                        <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">{tc.feat}</td>
                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">{tc.input}</td>
                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">{tc.expected}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 mr-1" />
                            VERIFIED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ETHICS & GOVERNANCE */}
          {activeTab === 'governance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200">
                <h4 className="font-extrabold text-sm mb-1 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Ethical AI, Algorithmic Fairness & Human Decision Authority (Section 50)</span>
                </h4>
                <p className="text-xs leading-relaxed">
                  The TalentPulse system is architected to assist human recruiters rather than automate hiring judgments. The following non-negotiable governance principles are enforced:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <h5 className="font-bold text-neutral-900 dark:text-white">Strict Advisory Status</h5>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
                    AI match scores and interview evaluations serve solely as recommendations. The system is programmed with a hard technical constraint: no candidate can be automatically rejected or hired without human recruiter confirmation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <h5 className="font-bold text-neutral-900 dark:text-white">Protected Attribute Exclusion</h5>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
                    Candidate age, gender, race, religion, nationality, and marital status are strictly excluded from all embedding representations, scoring prompts, and ranking models.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <h5 className="font-bold text-neutral-900 dark:text-white">Explainable Breakdown</h5>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
                    Every score must be decomposable into transparent contributing factors (Skills match, Experience duration, Education, Topic coverage), completely banning opaque "black box" decisions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <h5 className="font-bold text-neutral-900 dark:text-white">Candidate Privacy & Consent</h5>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
                    Audio transcription and video recording require explicit candidate consent prior to commencing any live WebRTC interview session.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer (Never scrolls) */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
            TalentPulse Recruitment System • B.Tech CSE Final Year Capstone Project
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white hover:bg-neutral-800 transition-colors"
          >
            Close Specification Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
