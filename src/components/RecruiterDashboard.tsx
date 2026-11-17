import React, { useState, useEffect } from 'react';
import { Application, Job, Interview, ApplicationStatus, InterviewResult, CandidateRankingWeights } from '../types.ts';
import { ScheduleInterviewModal } from './ScheduleInterviewModal.tsx';
import { CandidateComparisonModal } from './CandidateComparisonModal.tsx';
import {
  Users,
  Briefcase,
  Video,
  CheckCircle2,
  Search,
  ShieldCheck,
  FileText,
  Calendar,
  Award,
  Sliders,
  Scale,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Code2,
  Globe,
  Github,
  Linkedin,
  Clock,
  X,
  Eye,
  ExternalLink,
} from 'lucide-react';

interface RecruiterDashboardProps {
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  viewMode?: 'pipeline' | 'interviews';
  onUpdateApplicationStatus: (appId: string, status: ApplicationStatus, notes?: string) => void;
  onInterviewScheduled: (interview: Interview) => void;
  onViewInterviewResult: (interviewId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  jobs,
  applications,
  interviews,
  viewMode = 'pipeline',
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
  const [scheduleTarget, setScheduleTarget] = useState<{
    application: Application;
    existingInterview?: Interview | null;
  } | null>(null);
  const [profileDetailApp, setProfileDetailApp] = useState<Application | null>(null);
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
      const q = searchQuery.toLowerCase().trim();
      const matchesJob = selectedJobFilter === 'All' || app.jobId === selectedJobFilter;
      const matchesStatus = selectedStatusFilter === 'All' || app.status === selectedStatusFilter;
      const matchesQuery =
        !q ||
        app.candidateName.toLowerCase().includes(q) ||
        (app.candidateEmail || '').toLowerCase().includes(q) ||
        (app.candidateHeadline || '').toLowerCase().includes(q) ||
        app.jobTitle.toLowerCase().includes(q) ||
        (app.candidateProfile?.skills || []).some((s) => s.toLowerCase().includes(q));
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
    const matching = interviews.filter((i) => i.applicationId === appId);
    if (matching.length === 0) return undefined;
    return (
      matching.find((i) => i.status === 'COMPLETED') ||
      matching.find((i) => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS') ||
      matching[0]
    );
  };

  const selectedAppsForComparison = applications.filter((a) => selectedCandidateIds.includes(a.id));

  const scheduledInterviews = interviews
    .filter((i) => i.status === 'SCHEDULED')
    .filter((intv) => {
      const q = searchQuery.toLowerCase().trim();
      const linkedApp = applications.find((a) => a.id === intv.applicationId);
      const matchesJob = selectedJobFilter === 'All' || intv.jobId === selectedJobFilter;
      const matchesQuery =
        !q ||
        intv.candidateName.toLowerCase().includes(q) ||
        (intv.candidateEmail || linkedApp?.candidateEmail || '').toLowerCase().includes(q) ||
        (intv.candidateHeadline || linkedApp?.candidateHeadline || '').toLowerCase().includes(q) ||
        intv.jobTitle.toLowerCase().includes(q) ||
        intv.type.toLowerCase().includes(q) ||
        (linkedApp?.candidateProfile?.skills || []).some((s) => s.toLowerCase().includes(q));
      return matchesJob && matchesQuery;
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const buildFallbackAppFromInterview = (intv: Interview): Application => ({
    id: intv.applicationId,
    candidateId: intv.candidateId,
    candidateName: intv.candidateName,
    candidateEmail: intv.candidateEmail || '',
    candidateHeadline: intv.candidateHeadline,
    candidateAvatar: intv.candidateAvatar,
    candidateProfile: intv.candidateProfile,
    jobId: intv.jobId,
    jobTitle: intv.jobTitle,
    companyName: intv.companyName,
    resumeFileName: intv.candidateProfile?.resumeFileName,
    status: 'INTERVIEW_SCHEDULED',
    appliedAt: intv.createdAt,
    updatedAt: intv.createdAt,
  });

  return (
    <div className="space-y-6">
      {viewMode === 'interviews' ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Scheduled Interviews
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {scheduledInterviews.length} Scheduled
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Showing only interviews currently in SCHEDULED status with live candidate profile details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Filter scheduled interviews..."
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6">Candidate &amp; Applied Role</th>
                  <th className="py-3 px-4">Interview Format</th>
                  <th className="py-3 px-4">Scheduled Date &amp; Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {scheduledInterviews.length > 0 ? (
                  scheduledInterviews.map((intv) => {
                    const matchedApp =
                      applications.find((a) => a.id === intv.applicationId) ||
                      applications.find((a) => a.candidateId === intv.candidateId && a.jobId === intv.jobId);
                    const candProfile = matchedApp?.candidateProfile || intv.candidateProfile;
                    const linkedApp: Application = matchedApp
                      ? { ...matchedApp, candidateProfile: candProfile }
                      : buildFallbackAppFromInterview(intv);
                    const isFresher = candProfile?.experienceTrack === 'fresher';
                    const displayName = linkedApp.candidateName || intv.candidateName;
                    const displayEmail = linkedApp.candidateEmail || intv.candidateEmail || '';
                    const rawHeadline = linkedApp.candidateHeadline || intv.candidateHeadline || candProfile?.headline || '';
                    const displayHeadline = rawHeadline && rawHeadline !== 'Candidate' ? rawHeadline : '';
                    const displayAvatar = linkedApp.candidateAvatar || intv.candidateAvatar;
                    const initials = displayName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr
                        key={intv.id}
                        className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="py-4 px-6 align-top">
                          <div className="flex items-start space-x-3">
                            {displayAvatar ? (
                              <img
                                src={displayAvatar}
                                alt={displayName}
                                onClick={() => setProfileDetailApp(linkedApp)}
                                className="w-11 h-11 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
                                title="View full candidate profile"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => setProfileDetailApp(linkedApp)}
                                className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer"
                                title="View full candidate profile"
                              >
                                {initials || 'C'}
                              </button>
                            )}

                            <div className="min-w-0 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setProfileDetailApp(linkedApp)}
                                  className="font-bold text-neutral-900 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                >
                                  {displayName}
                                </button>
                                {candProfile?.experienceTrack && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                                      isFresher
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                    }`}
                                  >
                                    {isFresher
                                      ? 'Fresher / Graduate'
                                      : `Experienced • ${candProfile.yearsOfExperience || 0} yrs`}
                                  </span>
                                )}
                              </div>

                              {displayHeadline && (
                                <div className="text-neutral-700 dark:text-neutral-200 text-[11px] font-medium">
                                  {displayHeadline}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                                {displayEmail && (
                                  <span className="inline-flex items-center">
                                    <Mail className="w-3 h-3 mr-1 text-neutral-400" />
                                    {displayEmail}
                                  </span>
                                )}
                                {candProfile?.phone && (
                                  <span className="inline-flex items-center">
                                    <Phone className="w-3 h-3 mr-1 text-neutral-400" />
                                    {candProfile.phone}
                                  </span>
                                )}
                                {candProfile?.location && (
                                  <span className="inline-flex items-center">
                                    <MapPin className="w-3 h-3 mr-1 text-neutral-400" />
                                    {candProfile.location}
                                  </span>
                                )}
                              </div>

                              {candProfile?.bio && (
                                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 max-w-xl leading-relaxed">
                                  {candProfile.bio}
                                </p>
                              )}

                              {/* Career Track / Education / Experience / Projects / Resume details added by candidate */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-neutral-600 dark:text-neutral-300">
                                <span className="inline-flex items-center font-semibold text-neutral-800 dark:text-neutral-200">
                                  <Briefcase className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                                  {intv.jobTitle} ({intv.companyName})
                                </span>

                                {isFresher && candProfile?.fresherDetails?.collegeName && (
                                  <span className="inline-flex items-center">
                                    <GraduationCap className="w-3 h-3 mr-1 text-neutral-400" />
                                    {candProfile.fresherDetails.collegeName}
                                    {candProfile.fresherDetails.graduationYear
                                      ? ` (${candProfile.fresherDetails.graduationYear})`
                                      : ''}
                                  </span>
                                )}

                                {!isFresher && candProfile?.experiencedDetails?.currentRole && (
                                  <span className="inline-flex items-center">
                                    <Briefcase className="w-3 h-3 mr-1 text-neutral-400" />
                                    {candProfile.experiencedDetails.currentRole}
                                    {candProfile.experiencedDetails.currentCompany
                                      ? ` at ${candProfile.experiencedDetails.currentCompany}`
                                      : ''}
                                  </span>
                                )}

                                {candProfile?.education && candProfile.education.length > 0 && (
                                  <span className="inline-flex items-center">
                                    <GraduationCap className="w-3 h-3 mr-1 text-neutral-400" />
                                    {candProfile.education[0].degree}
                                    {candProfile.education[0].institution
                                      ? ` • ${candProfile.education[0].institution}`
                                      : ''}
                                    {candProfile.education.length > 1
                                      ? ` (+${candProfile.education.length - 1})`
                                      : ''}
                                  </span>
                                )}

                                {candProfile?.experience && candProfile.experience.length > 0 && (
                                  <span className="inline-flex items-center">
                                    <Briefcase className="w-3 h-3 mr-1 text-neutral-400" />
                                    {candProfile.experience.length} Exp Role{candProfile.experience.length > 1 ? 's' : ''}
                                  </span>
                                )}

                                {candProfile?.projects && candProfile.projects.length > 0 && (
                                  <span className="inline-flex items-center">
                                    <Code2 className="w-3 h-3 mr-1 text-neutral-400" />
                                    {candProfile.projects.length} Project{candProfile.projects.length > 1 ? 's' : ''}
                                  </span>
                                )}

                                {candProfile?.certifications && candProfile.certifications.length > 0 && (
                                  <span className="inline-flex items-center">
                                    <Award className="w-3 h-3 mr-1 text-neutral-400" />
                                    {candProfile.certifications.length} Cert{candProfile.certifications.length > 1 ? 's' : ''}
                                  </span>
                                )}

                                {(candProfile?.resumeFileName || linkedApp.resumeFileName) && (
                                  <span className="inline-flex items-center font-mono text-neutral-500 dark:text-neutral-400">
                                    <FileText className="w-3 h-3 mr-1 text-neutral-400" />
                                    {candProfile?.resumeFileName || linkedApp.resumeFileName}
                                  </span>
                                )}
                              </div>

                              {(candProfile?.links?.github || candProfile?.links?.linkedin || candProfile?.links?.portfolio) && (
                                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                  {candProfile.links.github && (
                                    <a
                                      href={candProfile.links.github}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 underline"
                                    >
                                      <Github className="w-3 h-3 mr-1" /> GitHub
                                    </a>
                                  )}
                                  {candProfile.links.linkedin && (
                                    <a
                                      href={candProfile.links.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 underline"
                                    >
                                      <Linkedin className="w-3 h-3 mr-1" /> LinkedIn
                                    </a>
                                  )}
                                  {candProfile.links.portfolio && (
                                    <a
                                      href={candProfile.links.portfolio}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 underline"
                                    >
                                      <Globe className="w-3 h-3 mr-1" /> Portfolio
                                    </a>
                                  )}
                                </div>
                              )}

                              {candProfile?.skills && candProfile.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {candProfile.skills.slice(0, 6).map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-medium border border-neutral-200/70 dark:border-neutral-700"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {candProfile.skills.length > 6 && (
                                    <span className="px-1.5 py-0.5 text-[10px] text-neutral-400">
                                      +{candProfile.skills.length - 6} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-neutral-900 dark:text-white">{intv.type}</div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {intv.difficulty} • {intv.durationMinutes} mins • {intv.topicCount} questions
                          </div>
                          <div className="text-[10px] font-mono text-neutral-400 mt-1">
                            Room: {intv.meetingId}
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <div className="font-semibold text-neutral-900 dark:text-white flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                            {new Date(intv.scheduledAt).toLocaleDateString()}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1.5 text-neutral-400" />
                            {new Date(intv.scheduledAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            SCHEDULED
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right align-top">
                          <div className="inline-flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setProfileDetailApp(linkedApp)}
                              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                              Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => setScheduleTarget({ application: linkedApp, existingInterview: intv })}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 transition-colors cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                              Reschedule
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-neutral-400">
                      No scheduled interviews found. Schedule an interview from the Candidate Pipeline to see it here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
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

                      {/* Candidate Column (Synchronized with Candidate Profile & Interview) */}
                      <td className="py-4 px-4 align-top">
                        {(() => {
                          const candProfile = app.candidateProfile;
                          const isFresher = candProfile?.experienceTrack === 'fresher';
                          const initials = app.candidateName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase();

                          return (
                            <div className="flex items-start space-x-3">
                              {app.candidateAvatar ? (
                                <img
                                  src={app.candidateAvatar}
                                  alt={app.candidateName}
                                  onClick={() => setProfileDetailApp(app)}
                                  className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
                                  title="View candidate profile"
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setProfileDetailApp(app)}
                                  className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer"
                                  title="View candidate profile"
                                >
                                  {initials || 'C'}
                                </button>
                              )}

                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setProfileDetailApp(app)}
                                    className="font-bold text-neutral-900 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                                    title="View full candidate profile"
                                  >
                                    {app.candidateName}
                                  </button>
                                  {candProfile?.experienceTrack && (
                                    <span
                                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                                        isFresher
                                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                      }`}
                                    >
                                      {isFresher
                                        ? 'Fresher'
                                        : `Experienced • ${candProfile.yearsOfExperience || 0} yrs`}
                                    </span>
                                  )}
                                </div>

                                <div className="text-neutral-600 dark:text-neutral-300 text-[11px] font-medium line-clamp-1">
                                  {app.candidateHeadline || app.candidateEmail}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                                  {app.candidateEmail && (
                                    <span className="inline-flex items-center">
                                      <Mail className="w-3 h-3 mr-1 text-neutral-400" />
                                      {app.candidateEmail}
                                    </span>
                                  )}
                                  {candProfile?.location && (
                                    <span className="inline-flex items-center">
                                      <MapPin className="w-3 h-3 mr-1 text-neutral-400" />
                                      {candProfile.location}
                                    </span>
                                  )}
                                  {candProfile?.phone && (
                                    <span className="inline-flex items-center">
                                      <Phone className="w-3 h-3 mr-1 text-neutral-400" />
                                      {candProfile.phone}
                                    </span>
                                  )}
                                </div>

                                <div className="text-neutral-500 dark:text-neutral-400 text-[10px] flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
                                  <span className="inline-flex items-center font-medium text-neutral-700 dark:text-neutral-300">
                                    <Briefcase className="w-3 h-3 mr-1 text-neutral-400" />
                                    {app.jobTitle}
                                  </span>
                                  {interview && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold">
                                      <Calendar className="w-2.5 h-2.5 mr-1" />
                                      {interview.type} ({interview.status.replace('_', ' ')}) •{' '}
                                      {new Date(interview.scheduledAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>

                                {candProfile?.skills && candProfile.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {candProfile.skills.slice(0, 4).map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-medium border border-neutral-200/70 dark:border-neutral-700"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {candProfile.skills.length > 4 && (
                                      <span className="px-1.5 py-0.5 text-[10px] text-neutral-400">
                                        +{candProfile.skills.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
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
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setProfileDetailApp(app)}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                            title="View full candidate profile details"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                            Profile
                          </button>

                          {interview && interview.status === 'COMPLETED' ? (
                            <button
                              onClick={() => onViewInterviewResult(interview.id)}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 mr-1" />
                              AI Report
                            </button>
                          ) : (
                            <button
                              onClick={() => setScheduleTarget({ application: app, existingInterview: interview || null })}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 transition-colors cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                              {interview ? 'Reschedule' : 'Schedule Interview'}
                            </button>
                          )}
                        </div>
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
        </>
      )}

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

      {/* Schedule / Reschedule Interview Modal */}
      {scheduleTarget && (
        <ScheduleInterviewModal
          application={scheduleTarget.application}
          existingInterview={scheduleTarget.existingInterview}
          onClose={() => setScheduleTarget(null)}
          onScheduled={(intv) => {
            onInterviewScheduled(intv);
            setScheduleTarget(null);
          }}
        />
      )}

      {/* Candidate Profile Details Modal (Exact match with Candidate's Profile) */}
      {profileDetailApp && (() => {
        const candProfile = profileDetailApp.candidateProfile;
        const linkedInterview = findInterviewForApp(profileDetailApp.id);
        const isFresher = candProfile?.experienceTrack === 'fresher';
        const initials = profileDetailApp.candidateName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 my-auto overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between gap-4 bg-neutral-50/70 dark:bg-neutral-900">
                <div className="flex items-start space-x-4">
                  {profileDetailApp.candidateAvatar ? (
                    <img
                      src={profileDetailApp.candidateAvatar}
                      alt={profileDetailApp.candidateName}
                      className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-black text-xl flex items-center justify-center shrink-0">
                      {initials || 'C'}
                    </div>
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-neutral-900 dark:text-white">
                        {profileDetailApp.candidateName}
                      </h2>
                      {candProfile?.experienceTrack && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isFresher
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {isFresher
                            ? 'Fresher / Graduate Track'
                            : `Experienced • ${candProfile.yearsOfExperience || 0} Years`}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                        {profileDetailApp.status.replace('_', ' ')}
                      </span>
                    </div>

                    {profileDetailApp.candidateHeadline && (
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mt-1">
                        {profileDetailApp.candidateHeadline}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                      {profileDetailApp.candidateEmail && (
                        <span className="inline-flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                          {profileDetailApp.candidateEmail}
                        </span>
                      )}
                      {candProfile?.phone && (
                        <span className="inline-flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                          {candProfile.phone}
                        </span>
                      )}
                      {candProfile?.location && (
                        <span className="inline-flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                          {candProfile.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setProfileDetailApp(null)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  aria-label="Close candidate profile"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs">
                {/* Application & Interview Synchronization Strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                    <div className="font-bold uppercase tracking-wider text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Applied Position Details</span>
                    </div>
                    <div className="font-bold text-sm text-neutral-900 dark:text-white">
                      {profileDetailApp.jobTitle}
                    </div>
                    <div className="text-neutral-500 dark:text-neutral-400">
                      {profileDetailApp.companyName} • Applied on{' '}
                      {new Date(profileDetailApp.appliedAt).toLocaleDateString()}
                    </div>
                    {profileDetailApp.matchScore && (
                      <div className="pt-1 font-semibold text-emerald-700 dark:text-emerald-400">
                        AI Advisory Match: {profileDetailApp.matchScore.overallScore}% (Skills:{' '}
                        {profileDetailApp.matchScore.breakdown.skillMatch}%, Experience:{' '}
                        {profileDetailApp.matchScore.breakdown.experienceMatch}%)
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-1.5">
                    <div className="font-bold uppercase tracking-wider text-[10px] text-purple-700 dark:text-purple-400 flex items-center space-x-1.5">
                      <Video className="w-3.5 h-3.5" />
                      <span>Interview Details (Candidate: {linkedInterview?.candidateName || profileDetailApp.candidateName})</span>
                    </div>
                    {linkedInterview ? (
                      <>
                        <div className="font-bold text-sm text-neutral-900 dark:text-white">
                          {linkedInterview.type} • {linkedInterview.status.replace('_', ' ')}
                        </div>
                        <div className="text-neutral-600 dark:text-neutral-300 flex items-center space-x-3">
                          <span className="inline-flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-purple-500" />
                            {new Date(linkedInterview.scheduledAt).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                          <span className="inline-flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-purple-500" />
                            {linkedInterview.durationMinutes} mins ({linkedInterview.difficulty})
                          </span>
                        </div>
                        <div className="pt-1">
                          {linkedInterview.status === 'COMPLETED' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setProfileDetailApp(null);
                                onViewInterviewResult(linkedInterview.id);
                              }}
                              className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] cursor-pointer"
                            >
                              <Award className="w-3 h-3 mr-1" /> View AI Evaluation Report
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const targetApp = profileDetailApp;
                                setProfileDetailApp(null);
                                setScheduleTarget({ application: targetApp, existingInterview: linkedInterview });
                              }}
                              className="inline-flex items-center px-3 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-[11px] cursor-pointer"
                            >
                              <Video className="w-3 h-3 mr-1" /> Update / Reschedule Interview
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-neutral-500 dark:text-neutral-400">
                          No interview scheduled yet for this candidate application.
                        </div>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const targetApp = profileDetailApp;
                              setProfileDetailApp(null);
                              setScheduleTarget({ application: targetApp, existingInterview: null });
                            }}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-[11px] cursor-pointer"
                          >
                            <Video className="w-3 h-3 mr-1" /> Schedule Interview
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Personal & Career Overview (Bio) */}
                {candProfile?.bio && (
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Personal &amp; Career Summary</span>
                    </h4>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50/70 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-700">
                      {candProfile.bio}
                    </p>
                  </div>
                )}

                {/* Career Track Specifics */}
                {candProfile?.experienceTrack === 'fresher' && candProfile.fresherDetails && (
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Fresher Track &amp; Academic Preferences</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                      <div>
                        <span className="text-neutral-400 block">College / University</span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {candProfile.fresherDetails.collegeName || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Degree &amp; Field</span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {[candProfile.fresherDetails.degree, candProfile.fresherDetails.fieldOfStudy]
                            .filter(Boolean)
                            .join(' in ') || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Graduation Year</span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {candProfile.fresherDetails.graduationYear || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Target Entry-Level Role</span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {candProfile.fresherDetails.targetRole || '—'}
                        </span>
                      </div>
                      {candProfile.fresherDetails.finalYearProjectTitle && (
                        <div className="sm:col-span-2">
                          <span className="text-neutral-400 block">Final Year / Capstone Project</span>
                          <span className="font-bold text-neutral-900 dark:text-white block">
                            {candProfile.fresherDetails.finalYearProjectTitle}
                          </span>
                          {candProfile.fresherDetails.finalYearProjectSummary && (
                            <span className="text-neutral-600 dark:text-neutral-300 text-[11px]">
                              {candProfile.fresherDetails.finalYearProjectSummary}
                            </span>
                          )}
                        </div>
                      )}
                      {candProfile.fresherDetails.coreCoursework && candProfile.fresherDetails.coreCoursework.length > 0 && (
                        <div className="sm:col-span-3">
                          <span className="text-neutral-400 block mb-1">Core Coursework</span>
                          <div className="flex flex-wrap gap-1">
                            {candProfile.fresherDetails.coreCoursework.map((cw, cIdx) => (
                              <span
                                key={cIdx}
                                className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-medium text-neutral-700 dark:text-neutral-300"
                              >
                                {cw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {candProfile?.experienceTrack !== 'fresher' && candProfile?.experiencedDetails && (
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Experienced Track Details</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                      <div>
                        <span className="text-neutral-400 block">Current / Latest Role</span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {candProfile.experiencedDetails.currentRole || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Current / Past Company</span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {candProfile.experiencedDetails.currentCompany || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Target Seniority &amp; Experience</span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {candProfile.experiencedDetails.targetSeniority || '—'} ({candProfile.experiencedDetails.totalYears ?? candProfile.yearsOfExperience ?? 0} yrs)
                        </span>
                      </div>
                      {candProfile.experiencedDetails.domain && (
                        <div>
                          <span className="text-neutral-400 block">Domain Focus</span>
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {candProfile.experiencedDetails.domain}
                          </span>
                        </div>
                      )}
                      {candProfile.experiencedDetails.notableAchievement && (
                        <div className="sm:col-span-2">
                          <span className="text-neutral-400 block">Notable Achievement</span>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {candProfile.experiencedDetails.notableAchievement}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Social & Portfolio Links */}
                {(candProfile?.links?.github || candProfile?.links?.linkedin || candProfile?.links?.portfolio) && (
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Social &amp; Portfolio Links</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candProfile.links.github && (
                        <a
                          href={candProfile.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold border border-neutral-200 dark:border-neutral-700"
                        >
                          <Github className="w-3.5 h-3.5 mr-1.5" /> GitHub <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                        </a>
                      )}
                      {candProfile.links.linkedin && (
                        <a
                          href={candProfile.links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold border border-neutral-200 dark:border-neutral-700"
                        >
                          <Linkedin className="w-3.5 h-3.5 mr-1.5" /> LinkedIn <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                        </a>
                      )}
                      {candProfile.links.portfolio && (
                        <a
                          href={candProfile.links.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold border border-neutral-200 dark:border-neutral-700"
                        >
                          <Globe className="w-3.5 h-3.5 mr-1.5" /> Portfolio <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Technical Skills ({candProfile?.skills?.length || 0})
                  </h4>
                  {candProfile?.skills && candProfile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {candProfile.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-400">No skills added yet.</p>
                  )}
                </div>

                {/* Work Experience */}
                {candProfile?.experience && candProfile.experience.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Work Experience ({candProfile.experience.length})
                    </h4>
                    <div className="space-y-2.5">
                      {candProfile.experience.map((exp, idx) => (
                        <div
                          key={exp.id || idx}
                          className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-neutral-900 dark:text-white text-sm">
                              {exp.role} {exp.company ? `• ${exp.company}` : ''}
                            </span>
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                              {exp.location ? ` • ${exp.location}` : ''}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed pt-1">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {candProfile?.education && candProfile.education.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Education &amp; Degrees ({candProfile.education.length})
                    </h4>
                    <div className="space-y-2">
                      {candProfile.education.map((edu, idx) => (
                        <div
                          key={edu.id || idx}
                          className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white">
                              {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                            </div>
                            <div className="text-neutral-500 dark:text-neutral-400">{edu.institution}</div>
                          </div>
                          <div className="text-right text-neutral-500 dark:text-neutral-400">
                            <div>
                              {edu.startYear ? `${edu.startYear} – ` : ''}
                              {edu.endYear}
                            </div>
                            {edu.gpa && <div className="font-semibold">GPA: {edu.gpa}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {candProfile?.projects && candProfile.projects.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Projects ({candProfile.projects.length})</span>
                    </h4>
                    <div className="space-y-2.5">
                      {candProfile.projects.map((proj, idx) => (
                        <div
                          key={proj.id || idx}
                          className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-neutral-900 dark:text-white">{proj.title}</span>
                            {proj.link && (
                              <a
                                href={proj.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                              >
                                View <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            )}
                          </div>
                          {proj.description && (
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{proj.description}</p>
                          )}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {proj.technologies.map((tech, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-medium text-neutral-700 dark:text-neutral-300"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {candProfile?.certifications && candProfile.certifications.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Certifications ({candProfile.certifications.length})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candProfile.certifications.map((cert, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Resume & Raw Text */}
                {(candProfile?.resumeFileName || candProfile?.resumeRawText || profileDetailApp.resumeFileName) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Attached Resume</span>
                      </h4>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {candProfile?.resumeFileName || profileDetailApp.resumeFileName}
                      </span>
                    </div>
                    {candProfile?.resumeRawText && (
                      <pre className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                        {candProfile.resumeRawText}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Live profile view synced with candidate&apos;s User Profile &amp; My Resume
                </span>
                <button
                  type="button"
                  onClick={() => setProfileDetailApp(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
