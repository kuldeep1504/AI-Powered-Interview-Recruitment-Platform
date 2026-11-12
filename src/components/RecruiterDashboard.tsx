import React, { useState, useEffect } from 'react';
import { Application, Job, Interview, ApplicationStatus, InterviewResult, CandidateRankingWeights } from '../types.ts';
import { ScheduleInterviewModal } from './ScheduleInterviewModal.tsx';
import { CandidateComparisonModal } from './CandidateComparisonModal.tsx';
import {
  Users,
  Briefcase,
  Video,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Filter,
  Search,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Calendar,
  Award,
  Sliders,
  Scale,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react';

interface RecruiterDashboardProps {
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  onUpdateApplicationStatus: (appId: string, status: ApplicationStatus, notes?: string) => void;
  onInterviewScheduled: (interview: Interview) => void;
  onViewInterviewResult: (interviewId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  jobs,
  applications,
  interviews,
  onUpdateApplicationStatus,
  onInterviewScheduled,
  onViewInterviewResult,
  onNavigateTab,
}) => {
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'composite' | 'resume' | 'recent'>('composite');

  // Candidate Ranking Weights (SRS Section 20 FR-15)
  const [showWeightsPanel, setShowWeightsPanel] = useState(false);
  const [weights, setWeights] = useState<CandidateRankingWeights>({
    resumeMatch: 25,
    technicalInterview: 30,
    experienceRelevance: 20,
    requiredSkillCoverage: 15,
    interviewEvaluation: 10,
  });

  // Candidate Selection for Side-by-Side Comparison (SRS Section 4.2 & Section 20)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [interviewResults, setInterviewResults] = useState<InterviewResult[]>([]);

  // Modals state
  const [scheduleTargetApp, setScheduleTargetApp] = useState<Application | null>(null);
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<{
    app: Application;
    newStatus: ApplicationStatus;
  } | null>(null);
  const [statusNotes, setStatusNotes] = useState('');

  // Fetch interview results for ranking scoring
  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/interview-results');
        if (res.ok) {
          const data = await res.json();
          setInterviewResults(data.results || []);
        }
      } catch (err) {
        console.warn('Failed to load interview results:', err);
      }
    }
    fetchResults();
  }, [interviews]);

  // Compute composite score for any application
  const computeCompositeScore = (app: Application) => {
    const resumeScore = app.matchScore?.overallScore || 70;
    const result = interviewResults.find((r) => r.candidateId === app.candidateId);
    const techInterviewScore = result ? result.overallScore : (app.matchScore?.breakdown?.skillMatch || 75);
    const expRelevance = app.matchScore?.breakdown?.experienceMatch || 70;
    const skillCoverage = app.matchScore?.breakdown?.skillMatch || 75;
    const interviewEval = result ? (result.categoryScores?.technicalCorrectness || 80) : 70;

    const totalWeight =
      weights.resumeMatch +
      weights.technicalInterview +
      weights.experienceRelevance +
      weights.requiredSkillCoverage +
      weights.interviewEvaluation;

    const weighted =
      (resumeScore * weights.resumeMatch +
        techInterviewScore * weights.technicalInterview +
        expRelevance * weights.experienceRelevance +
        skillCoverage * weights.requiredSkillCoverage +
        interviewEval * weights.interviewEvaluation) /
      Math.max(1, totalWeight);

    return Math.round(weighted);
  };

  // Toggle selection for comparison
  const toggleSelectCandidate = (appId: string) => {
    if (selectedCandidateIds.includes(appId)) {
      setSelectedCandidateIds(selectedCandidateIds.filter((id) => id !== appId));
    } else {
      if (selectedCandidateIds.length >= 3) {
        alert('You can compare up to 3 candidates simultaneously.');
        return;
      }
      setSelectedCandidateIds([...selectedCandidateIds, appId]);
    }
  };

  // Filter & sort applications
  const filteredApps = applications
    .filter((app) => {
      const matchesJob = selectedJobFilter === 'All' || app.jobId === selectedJobFilter;
      const matchesStatus = selectedStatusFilter === 'All' || app.status === selectedStatusFilter;
      const matchesQuery =
        app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesJob && matchesStatus && matchesQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'composite') {
        return computeCompositeScore(b) - computeCompositeScore(a);
      }
      if (sortBy === 'resume') {
        return (b.matchScore?.overallScore || 0) - (a.matchScore?.overallScore || 0);
      }
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    });

  // Calculate metrics
  const totalApps = applications.length;
  const activeJobsCount = jobs.filter((j) => j.status === 'OPEN').length;
  const completedInterviewsCount = interviews.filter((i) => i.status === 'COMPLETED').length;
  const scheduledInterviewsCount = interviews.filter(
    (i) => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS'
  ).length;

  const avgMatchScore =
    applications.length > 0
      ? Math.round(
          applications.reduce((acc, a) => acc + (a.matchScore?.overallScore || 70), 0) /
            applications.length
        )
      : 0;

  const handleConfirmStatusChange = () => {
    if (!statusConfirmTarget) return;
    onUpdateApplicationStatus(
      statusConfirmTarget.app.id,
      statusConfirmTarget.newStatus,
      statusNotes || undefined
    );
    setStatusConfirmTarget(null);
    setStatusNotes('');
  };

  const findInterviewForApp = (appId: string) => {
    return interviews.find((i) => i.applicationId === appId);
  };

  const selectedAppsForComparison = applications.filter((a) => selectedCandidateIds.includes(a.id));

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Active Open Roles
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">{activeJobsCount}</div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Across Engineering & Product</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Total Candidates
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-700 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">{totalApps}</div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
            Avg AI Match: {avgMatchScore}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Interviews Active
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">{scheduledInterviewsCount}</div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">WebRTC video rooms pending</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Evaluations Done
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">{completedInterviewsCount}</div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">With AI dual-perspective reports</div>
        </div>
      </div>

      {/* AI Fairness & Transparency Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <div className="text-emerald-950 dark:text-emerald-200">
            <strong className="font-bold">Human-in-the-Loop Governance (SRS Section 50):</strong> Candidate ranking exposes all underlying factor weights. Protected attributes are excluded, and hiring decisions strictly require explicit human confirmation.
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowWeightsPanel(!showWeightsPanel)}
            className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-neutral-800 text-emerald-900 dark:text-emerald-300 font-bold hover:bg-emerald-50 dark:hover:bg-neutral-700 transition-colors flex items-center space-x-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{showWeightsPanel ? 'Hide Ranking Weights' : 'Tune Ranking Weights (FR-15)'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('recruiter-jobs')}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 font-bold transition-colors"
          >
            Post Role →
          </button>
        </div>
      </div>

      {/* Candidate Ranking Weights Configuration Panel (SRS Section 20 & FR-15) */}
      {showWeightsPanel && (
        <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Multi-Factor Candidate Ranking Engine (SRS Section 20)</span>
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Calibrate how candidate scores are aggregated across resume heuristics, live technical performance, and skill coverage.
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() =>
                  setWeights({
                    resumeMatch: 25,
                    technicalInterview: 30,
                    experienceRelevance: 20,
                    requiredSkillCoverage: 15,
                    interviewEvaluation: 10,
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
              >
                Balanced
              </button>
              <button
                onClick={() =>
                  setWeights({
                    resumeMatch: 15,
                    technicalInterview: 45,
                    experienceRelevance: 15,
                    requiredSkillCoverage: 15,
                    interviewEvaluation: 10,
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
              >
                Technical Heavy
              </button>
              <button
                onClick={() =>
                  setWeights({
                    resumeMatch: 35,
                    technicalInterview: 20,
                    experienceRelevance: 30,
                    requiredSkillCoverage: 10,
                    interviewEvaluation: 5,
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
              >
                Experience Heavy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                <span>Resume Match:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{weights.resumeMatch}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={weights.resumeMatch}
                onChange={(e) => setWeights({ ...weights, resumeMatch: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                <span>Technical Interview:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{weights.technicalInterview}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={weights.technicalInterview}
                onChange={(e) => setWeights({ ...weights, technicalInterview: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                <span>Experience Relevance:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{weights.experienceRelevance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={weights.experienceRelevance}
                onChange={(e) => setWeights({ ...weights, experienceRelevance: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                <span>Skill Coverage:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{weights.requiredSkillCoverage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={weights.requiredSkillCoverage}
                onChange={(e) => setWeights({ ...weights, requiredSkillCoverage: Number(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                <span>Interview Rubrics:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{weights.interviewEvaluation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={weights.interviewEvaluation}
                onChange={(e) => setWeights({ ...weights, interviewEvaluation: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter & Candidate Ranking Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Candidate Pipeline & Explainable Ranking
              </h3>
              {selectedCandidateIds.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  {selectedCandidateIds.length} selected
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Review composite rankings, select candidates to compare side-by-side, and confirm human stage transitions.
            </p>
          </div>

          {/* Action & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Compare Button */}
            {selectedCandidateIds.length >= 2 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare {selectedCandidateIds.length} Candidates (SRS)</span>
              </button>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Filter by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none"
              />
            </div>

            <select
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none"
            >
              <option value="All">All Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="APPLIED">Applied</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Sort Toggle */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:outline-none font-semibold"
            >
              <option value="composite">Sort: Composite Score</option>
              <option value="resume">Sort: Resume Match</option>
              <option value="recent">Sort: Most Recent</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-8 text-center">Compare</th>
                <th className="py-3 px-4">Candidate & Applied Role</th>
                <th className="py-3 px-4">Composite Rank (SRS)</th>
                <th className="py-3 px-4">Resume Match (AI)</th>
                <th className="py-3 px-4">Skill Alignment</th>
                <th className="py-3 px-4">Stage & Human Decision</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredApps.length > 0 ? (
                filteredApps.map((app) => {
                  const interview = findInterviewForApp(app.id);
                  const compositeScore = computeCompositeScore(app);
                  const isSelected = selectedCandidateIds.includes(app.id);

                  return (
                    <tr
                      key={app.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-blue-50/40 dark:bg-blue-950/20'
                          : 'hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'
                      }`}
                    >
                      {/* Checkbox for comparison */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCandidate(app.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          title="Select to compare"
                        />
                      </td>

                      {/* Candidate Column */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white text-sm">{app.candidateName}</div>
                        <div className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5">
                          {app.candidateHeadline || app.candidateEmail}
                        </div>
                        <div className="text-neutral-400 text-[10px] mt-1 flex items-center">
                          <Briefcase className="w-3 h-3 mr-1 text-neutral-400" />
                          {app.jobTitle}
                        </div>
                      </td>

                      {/* Composite Ranking Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 font-black text-sm flex items-center justify-center">
                            {compositeScore}
                          </span>
                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Composite</span>
                            <div>{compositeScore >= 80 ? 'Top Tier' : 'Strong Fit'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Overall AI Match Column */}
                      <td className="py-4 px-4">
                        {app.matchScore ? (
                          <div className="flex items-center space-x-2">
                            <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center justify-center">
                              {app.matchScore.overallScore}
                            </span>
                            <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                              <span className="font-semibold text-neutral-700 dark:text-neutral-300">Advisory Score</span>
                              <div>{app.matchScore.overallScore >= 80 ? 'High Fit' : 'Moderate Fit'}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-neutral-400">Pending</span>
                        )}
                      </td>

                      {/* Skill breakdown */}
                      <td className="py-4 px-4">
                        <div className="w-24">
                          <div className="flex justify-between text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                            <span>Skills</span>
                            <span>{app.matchScore?.breakdown.skillMatch || 75}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${app.matchScore?.breakdown.skillMatch || 75}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status and dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            setStatusConfirmTarget({
                              app,
                              newStatus: e.target.value as ApplicationStatus,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs focus:outline-none"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                          <option value="SELECTED">Selected (Hire)</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        {interview && interview.status === 'COMPLETED' ? (
                          <button
                            onClick={() => onViewInterviewResult(interview.id)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                          >
                            <Award className="w-3.5 h-3.5 mr-1" />
                            AI Report
                          </button>
                        ) : (
                          <button
                            onClick={() => setScheduleTargetApp(app)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 transition-colors"
                          >
                            <Video className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                            Schedule Interview
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-neutral-400">
                    No candidates match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Human Decision Confirmation Modal (SRS Section 50 Fairness Constraint) */}
      {statusConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center space-x-2 text-neutral-900 dark:text-white font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Confirm Human Recruiter Decision</span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              You are updating candidate <strong>{statusConfirmTarget.app.candidateName}</strong> to{' '}
              <span className="font-mono font-bold text-neutral-900 dark:text-white px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">
                {statusConfirmTarget.newStatus}
              </span>
              . In compliance with SRS ethical AI recruitment fairness policies, this change must be authorized by a human recruiter.
            </p>

            <div>
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                Recruiter Rationale / Internal Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="e.g., Demonstrated strong WebRTC knowledge; invited to team architectural session..."
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setStatusConfirmTarget(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 shadow-xs"
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Comparison Modal (SRS Section 4.2 & Section 20) */}
      {isCompareModalOpen && (
        <CandidateComparisonModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          applications={selectedAppsForComparison}
          interviewResults={interviewResults}
          rankingWeights={weights}
        />
      )}

      {/* Schedule Interview Modal */}
      {scheduleTargetApp && (
        <ScheduleInterviewModal
          application={scheduleTargetApp}
          onClose={() => setScheduleTargetApp(null)}
          onScheduled={(intv) => {
            onInterviewScheduled(intv);
            setScheduleTargetApp(null);
          }}
        />
      )}
    </div>
  );
};
