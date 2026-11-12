import React from 'react';
import { Application, InterviewResult, CandidateRankingWeights } from '../types.ts';
import {
  X,
  Scale,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  FileText,
  Video,
} from 'lucide-react';

interface CandidateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
  interviewResults: InterviewResult[];
  rankingWeights: CandidateRankingWeights;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  isOpen,
  onClose,
  applications,
  interviewResults,
  rankingWeights,
}) => {
  if (!isOpen || applications.length === 0) return null;

  // Calculate composite rank score for each application
  const getComputedScore = (app: Application) => {
    const resumeScore = app.matchScore?.overallScore || 70;
    const result = interviewResults.find((r) => r.candidateId === app.candidateId);
    const techInterviewScore = result ? result.overallScore : (app.matchScore?.breakdown?.skillMatch || 75);
    const expRelevance = app.matchScore?.breakdown?.experienceMatch || 70;
    const skillCoverage = app.matchScore?.breakdown?.skillMatch || 75;
    const interviewEval = result ? (result.categoryScores?.technicalCorrectness || 80) : 70;

    const totalWeight =
      rankingWeights.resumeMatch +
      rankingWeights.technicalInterview +
      rankingWeights.experienceRelevance +
      rankingWeights.requiredSkillCoverage +
      rankingWeights.interviewEvaluation;

    const weighted =
      (resumeScore * rankingWeights.resumeMatch +
        techInterviewScore * rankingWeights.technicalInterview +
        expRelevance * rankingWeights.experienceRelevance +
        skillCoverage * rankingWeights.requiredSkillCoverage +
        interviewEval * rankingWeights.interviewEvaluation) /
      Math.max(1, totalWeight);

    return Math.round(weighted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 my-auto overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center space-x-1">
                <Scale className="w-3 h-3 mr-1" />
                <span>Candidate Side-by-Side Comparison</span>
              </span>
              <span className="text-xs text-neutral-400">• SRS Section 4.2 & Section 20</span>
            </div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white mt-1.5 tracking-tight">
              Compare Shortlisted Candidates
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Evaluating {applications.length} candidates using weighted criteria (Resume: {rankingWeights.resumeMatch}%, Technical: {rankingWeights.technicalInterview}%, Skills: {rankingWeights.requiredSkillCoverage}%, Experience: {rankingWeights.experienceRelevance}%)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(3, applications.length)} gap-6`}>
            {applications.map((app) => {
              const composite = getComputedScore(app);
              const interview = interviewResults.find((r) => r.candidateId === app.candidateId);

              return (
                <div
                  key={app.id}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-800/30 p-5 flex flex-col justify-between space-y-5"
                >
                  {/* Candidate Header */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {app.status.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-1.5 text-xs font-black">
                        <span className="text-emerald-600 dark:text-emerald-400 text-lg">{composite}</span>
                        <span className="text-neutral-400 text-[10px]">/ 100 Composite</span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-base text-neutral-900 dark:text-white mt-2">
                      {app.candidateName}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                      {app.candidateHeadline || app.candidateEmail}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Applied for: {app.jobTitle}</p>
                  </div>

                  {/* Factor Breakdown */}
                  <div className="space-y-3 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 text-xs">
                    <div className="font-bold text-neutral-900 dark:text-white text-[11px] uppercase tracking-wider">
                      Underlying Ranking Factors (SRS FR-15)
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">Resume Match Score:</span>
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {app.matchScore?.overallScore || 70}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${app.matchScore?.overallScore || 70}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">Technical Interview:</span>
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {interview ? `${interview.overallScore}%` : 'Pending Exam'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${interview ? interview.overallScore : 0}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">Required Skill Coverage:</span>
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {app.matchScore?.breakdown?.skillMatch || 75}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${app.matchScore?.breakdown?.skillMatch || 75}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">Experience Relevance:</span>
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {app.matchScore?.breakdown?.experienceMatch || 70}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${app.matchScore?.breakdown?.experienceMatch || 70}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Missing Skills */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center space-x-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Verified Strengths</span>
                      </div>
                      <ul className="space-y-1 text-neutral-600 dark:text-neutral-400 text-[11px]">
                        {app.matchScore?.strengths?.slice(0, 2).map((s, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-emerald-500">•</span>
                            <span>{s}</span>
                          </li>
                        )) || <li>Solid core credentials match.</li>}
                      </ul>
                    </div>

                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center space-x-1 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Areas Needing Human Verification</span>
                      </div>
                      <ul className="space-y-1 text-neutral-600 dark:text-neutral-400 text-[11px]">
                        {app.matchScore?.missingSkills?.slice(0, 2).map((m, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-amber-500">•</span>
                            <span>{m}</span>
                          </li>
                        )) || <li>None noted. Verify in live stage.</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Recruiter Notes / AI Advisory */}
                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300">
                    <div className="font-bold mb-0.5 text-neutral-900 dark:text-white">AI Advisory:</div>
                    <p className="line-clamp-2">
                      {interview
                        ? interview.feedbackForRecruiter.humanRecommendationAdvisory
                        : app.matchScore?.aiExplanation || 'Requires review.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Human-in-the-Loop Principle: All scores remain advisory. Recruiter confirmation required for final advancement.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white hover:bg-neutral-800 transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
