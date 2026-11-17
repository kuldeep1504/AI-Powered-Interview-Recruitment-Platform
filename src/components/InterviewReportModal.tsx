import React, { useState } from 'react';
import { InterviewResult } from '../types.ts';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  X,
  FileText,
  User,
  Building2,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Flame,
  Trophy,
} from 'lucide-react';

interface InterviewReportModalProps {
  result: InterviewResult;
  onClose: () => void;
  viewerRole?: 'candidate' | 'recruiter' | 'admin';
}

export const InterviewReportModal: React.FC<InterviewReportModalProps> = ({
  result,
  onClose,
  viewerRole = 'candidate',
}) => {
  const [activeTab, setActiveTab] = useState<'candidate' | 'recruiter'>(
    viewerRole === 'recruiter' ? 'recruiter' : 'candidate'
  );
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-neutral-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                AI Evaluation Report
              </span>
              <span className="text-xs text-neutral-400">
                Session: {new Date(result.evaluatedAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mt-1">{result.jobTitle}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Candidate: <strong>{result.candidateName}</strong> • Evaluated via Gemini AI
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {typeof result.pointsAwarded === 'number' && result.pointsAwarded > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-neutral-900">
                  +{result.pointsAwarded} Points Earned! New AI Task Interview Ready
                </div>
                <div className="text-[11px] text-neutral-600">
                  Total Points: <strong>{result.totalPoints ?? result.pointsAwarded}</strong> • Tasks Completed:{' '}
                  <strong>{result.completedTasksCount ?? 1}</strong>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 text-xs font-bold shadow-2xs">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{result.currentStreak ?? 1} Day Streak</span>
            </div>
          </div>
        )}

        {/* Score Card Banner */}
        <div className="p-6 rounded-2xl bg-neutral-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex flex-col items-center justify-center text-white shrink-0 shadow-sm">
              <span className="text-2xl font-black">{result.overallScore}</span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-100">/ 100</span>
            </div>

            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Overall Calibrated Score</div>
              <h4 className="text-lg font-bold text-white mt-0.5">
                {result.overallScore >= 85
                  ? 'Exceptional Demonstration'
                  : result.overallScore >= 75
                  ? 'Strong Competency Alignment'
                  : 'Meets Baseline Requirements'}
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Advisory decision support signal based on multi-dimensional competency analysis.
              </p>
            </div>
          </div>

          {/* Radar / Bars preview */}
          <div className="space-y-1.5 min-w-[200px] text-xs">
            <div className="flex justify-between text-neutral-300">
              <span>Technical Correctness</span>
              <span className="font-bold text-white">{result.categoryScores.technicalCorrectness}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${result.categoryScores.technicalCorrectness}%` }}
              />
            </div>

            <div className="flex justify-between text-neutral-300 pt-1">
              <span>Communication Clarity</span>
              <span className="font-bold text-white">{result.categoryScores.communicationClarity}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${result.categoryScores.communicationClarity}%` }}
              />
            </div>

            <div className="flex justify-between text-neutral-300 pt-1">
              <span>STAR Problem Solving</span>
              <span className="font-bold text-white">{result.categoryScores.problemSolvingSTAR}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${result.categoryScores.problemSolvingSTAR}%` }}
              />
            </div>
          </div>
        </div>

        {/* Perspective Switcher */}
        <div className="flex space-x-2 border-b border-neutral-200 text-sm">
          <button
            onClick={() => setActiveTab('candidate')}
            className={`pb-3 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'candidate'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Candidate Growth Report</span>
          </button>
          <button
            onClick={() => setActiveTab('recruiter')}
            className={`pb-3 font-semibold transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'recruiter'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Recruiter Advisory Report</span>
          </button>
        </div>

        {/* Tab 1: Candidate Growth Feedback */}
        {activeTab === 'candidate' && (
          <div className="space-y-5">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Demonstrated Key Strengths</span>
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-700 pl-4 list-disc leading-relaxed">
                {result.feedbackForCandidate.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Growth areas */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Actionable Growth Areas</span>
              </div>
              <ul className="space-y-1.5 text-xs text-neutral-700 pl-4 list-disc leading-relaxed">
                {result.feedbackForCandidate.growthAreas.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>

            {/* Recommended Learning Resources */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <div className="flex items-center space-x-2 text-neutral-900 font-bold text-sm mb-2">
                <BookOpen className="w-4 h-4 text-neutral-700" />
                <span>Targeted Resources & Literature</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.feedbackForCandidate.recommendedResources.map((res, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-medium bg-white text-neutral-800 rounded-lg border border-neutral-200 shadow-2xs"
                  >
                    {res}
                  </span>
                ))}
              </div>
            </div>

            {/* Closing note */}
            <p className="text-xs text-neutral-600 italic bg-neutral-50 p-4 rounded-xl border border-neutral-200 leading-relaxed">
              "{result.feedbackForCandidate.encouragingClosing}"
            </p>
          </div>
        )}

        {/* Tab 2: Recruiter Advisory Report */}
        {activeTab === 'recruiter' && (
          <div className="space-y-5">
            {/* Executive Summary */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Executive Synthesis
              </div>
              <p className="text-xs text-neutral-800 leading-relaxed">
                {result.feedbackForRecruiter.executiveSummary}
              </p>
            </div>

            {/* Verified Skills & Flags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-900 mb-2 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Verified Proficiencies
                </div>
                <ul className="space-y-1 text-xs text-neutral-700 pl-4 list-disc">
                  {result.feedbackForRecruiter.verifiedSkillProficiency.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                <div className="text-xs font-bold text-amber-900 mb-2 flex items-center">
                  <HelpCircle className="w-4 h-4 mr-1.5 text-amber-600" />
                  Follow-up Verification Flags
                </div>
                <ul className="space-y-1 text-xs text-neutral-700 pl-4 list-disc">
                  {result.feedbackForRecruiter.verificationFlagsOrGaps.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Follow-up Questions */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                Recommended Onsite Questions for Human Interviewer
              </div>
              <ul className="space-y-2 text-xs text-neutral-700">
                {result.feedbackForRecruiter.recommendedFollowUpQuestions.map((q, idx) => (
                  <li key={idx} className="p-2.5 bg-white rounded-lg border border-neutral-200 font-medium">
                    • {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* Human Advisory Recommendation */}
            <div className="p-4 rounded-2xl bg-neutral-900 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                  Advisory Recommendation
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {result.feedbackForRecruiter.humanRecommendationAdvisory}
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-800 border border-neutral-700 text-neutral-300">
                Requires Recruiter Final Decision
              </span>
            </div>
          </div>
        )}

        {/* Per-Question Transcript & AI Eval Accordion */}
        {result.perQuestionEvals && result.perQuestionEvals.length > 0 && (
          <div className="pt-4 border-t border-neutral-100">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
              Per-Question Transcripts & Scoring
            </h4>
            <div className="space-y-2">
              {result.perQuestionEvals.map((ans, idx) => {
                const isExpanded = expandedQuestion === idx;
                return (
                  <div
                    key={idx}
                    className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50"
                  >
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-neutral-900 hover:bg-neutral-100/60 transition-colors"
                    >
                      <span className="truncate max-w-[85%]">
                        Q{idx + 1}: {ans.question}
                      </span>
                      <div className="flex items-center space-x-2 shrink-0">
                        {ans.evaluation && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            {ans.evaluation.relevance}%
                          </span>
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-neutral-200 bg-white text-xs space-y-3">
                        <div>
                          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                            Spoken Transcript
                          </div>
                          <p className="text-neutral-700 mt-1 italic leading-relaxed">
                            "{ans.transcript}"
                          </p>
                        </div>

                        {ans.evaluation && (
                          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                            <div className="text-[11px] font-bold text-neutral-900">
                              AI Evaluator Feedback:
                            </div>
                            <p className="text-neutral-600 leading-relaxed text-[11px]">
                              {ans.evaluation.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
