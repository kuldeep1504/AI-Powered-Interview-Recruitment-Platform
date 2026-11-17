import React, { useEffect } from 'react';
import { User, CandidateProfile, Application, Interview, Job } from '../types.ts';
import {
  FileText,
  Briefcase,
  Video,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Layers,
  Cpu,
  BookOpen,
  Code2,
  Award,
  Zap,
  RefreshCw,
  Compass,
  Building,
  Target,
  Flame,
  Trophy,
  Plus,
  Loader2,
  Bot,
} from 'lucide-react';

interface CandidateDashboardProps {
  currentUser?: User;
  profile: CandidateProfile;
  applications: Application[];
  interviews: Interview[];
  jobs: Job[];
  onNavigateTab: (tab: string) => void;
  onJoinInterview: (interview: Interview) => void;
  onViewInterviewResult: (interviewId: string) => void;
  onOpenATSModal?: () => void;
  onStartTrackMockInterview?: (track: 'fresher' | 'experienced', focusArea?: string) => void;
  onOpenOnboarding?: () => void;
  onGenerateAITask?: () => void;
  onEnsureAITask?: () => void;
  isGeneratingAITask?: boolean;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  currentUser,
  profile,
  applications,
  interviews,
  jobs,
  onNavigateTab,
  onJoinInterview,
  onViewInterviewResult,
  onOpenATSModal,
  onStartTrackMockInterview,
  onOpenOnboarding,
  onGenerateAITask,
  onEnsureAITask,
  isGeneratingAITask = false,
}) => {
  const isFresher = profile.experienceTrack === 'fresher';

  // Compute profile completion percentage
  const hasResume = !!profile.resumeFileName;
  const hasSkills = profile.skills.length >= 5;
  const hasExp = isFresher ? profile.projects.length >= 1 : profile.experience.length >= 1;
  const hasEdu = profile.education.length >= 1;
  const hasHeadline = !!profile.headline;

  const score =
    (hasResume ? 25 : 0) +
    (hasSkills ? 20 : 0) +
    (hasExp ? 20 : 0) +
    (hasEdu ? 15 : 0) +
    (hasHeadline ? 20 : 0);

  const candidateInterviews = interviews.filter(
    (i) =>
      i.candidateId === profile.id ||
      (currentUser?.email && i.candidateEmail?.toLowerCase() === currentUser.email.toLowerCase())
  );
  const activeInterviews = candidateInterviews.filter(
    (i) => i.status !== 'COMPLETED' && i.status !== 'CANCELLED'
  );
  const completedInterviews = candidateInterviews.filter((i) => i.status === 'COMPLETED');

  useEffect(() => {
    if (activeInterviews.length === 0 && !isGeneratingAITask && onEnsureAITask) {
      onEnsureAITask();
    }
  }, [activeInterviews.length, isGeneratingAITask, onEnsureAITask]);

  // Daily streak & points calculation
  const now = new Date();
  const formatLocalDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayStr = formatLocalDate(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterdayDate);

  const completedDatesSet = new Set(profile.completedDates || []);
  const completedToday = completedDatesSet.has(todayStr) || profile.lastCompletedDate === todayStr;
  const isStreakAlive = completedToday || profile.lastCompletedDate === yesterdayStr;
  const activeStreak = isStreakAlive ? (profile.currentStreak || 0) : 0;
  const longestStreak = profile.longestStreak || activeStreak;
  const totalPoints = profile.totalPoints ?? completedInterviews.length * 10;
  const completedTasksCount = profile.completedTasksCount ?? completedInterviews.length;

  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - idx));
    const key = formatLocalDate(d);
    const label = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    return { key, label, done: completedDatesSet.has(key), isToday: key === todayStr };
  });

  // Filter jobs based on track
  const recommendedJobs = isFresher
    ? jobs.filter((j) => j.experienceLevel === 'Entry' || j.experienceMinYears <= 1 || j.title.toLowerCase().includes('junior') || j.title.toLowerCase().includes('associate') || j.title.toLowerCase().includes('graduate'))
    : jobs.filter((j) => j.experienceLevel === 'Senior' || j.experienceLevel === 'Mid' || j.experienceLevel === 'Lead' || j.experienceMinYears >= 2);

  const displayJobs = recommendedJobs.length > 0 ? recommendedJobs : jobs;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Track Indicator & Calibration Switcher Top Bar */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        isFresher
          ? 'bg-emerald-500/10 border-emerald-300 dark:border-emerald-800/80 dark:bg-emerald-950/30'
          : 'bg-blue-500/10 border-blue-300 dark:border-blue-800/80 dark:bg-blue-950/30'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
            isFresher ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            {isFresher ? <GraduationCap className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                isFresher
                  ? 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300'
                  : 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-300'
              }`}>
                {isFresher ? '🎓 Fresher Candidate Track' : '💼 Experienced Professional Track'}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium hidden md:inline">
                • {isFresher ? 'Campus & Entry-Level Job Readiness' : 'Senior Engineering & System Architecture'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mt-1">
              {isFresher
                ? `${profile.fresherDetails?.collegeName || 'University'} (${profile.fresherDetails?.graduationYear || '2025'}) • Target: ${profile.fresherDetails?.targetRole || 'Graduate Software Engineer'}`
                : `${profile.experiencedDetails?.currentRole || 'Senior Engineer'} at ${profile.experiencedDetails?.currentCompany || 'Tech'} • ${profile.yearsOfExperience} YOE • Target: ${profile.experiencedDetails?.targetSeniority || 'Senior'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
              <span>Recalibrate Track</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Welcome Banner + User Profile Details */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 md:p-8 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            {currentUser?.avatar && (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
              />
            )}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {isFresher ? 'Fresher Job Readiness Portal' : 'Senior Technical Portal'}
              </span>
              <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Welcome back, {currentUser?.name || profile.parsedResumeData?.name || 'User'}
              </h2>

              {profile.headline && profile.headline !== 'Candidate' && (
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 max-w-2xl">
                  {profile.headline}
                </p>
              )}

              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.skills.slice(0, 6).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.skills.length > 6 && (
                    <span className="px-2 py-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                      +{profile.skills.length - 6} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Profile Strength Card */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700 min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              <span>{isFresher ? 'Fresher Profile Strength' : 'Executive Profile Strength'}</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">{score}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>Resume: {hasResume ? 'Parsed & Active' : 'Missing'}</span>
              <button
                onClick={() => onNavigateTab('user-profile')}
                className="text-neutral-900 dark:text-neutral-200 font-semibold hover:underline cursor-pointer"
              >
                Update Profile →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled & Always-On AI Task Interviews Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-base leading-tight">
                {isFresher ? 'AI Task Interviews & Campus Schedule' : 'AI Task Interviews & Active Rooms'}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Always-ready AI tasks • Complete any interview for +10 pts & daily streak
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
              {activeInterviews.length} Active
            </span>
            {onGenerateAITask && (
              <button
                onClick={onGenerateAITask}
                disabled={isGeneratingAITask}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isGeneratingAITask ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>{isGeneratingAITask ? 'Generating...' : 'New AI Task'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Daily Streak & Points Bar */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/80 via-emerald-50/50 to-neutral-50 dark:from-amber-950/30 dark:via-emerald-950/20 dark:to-neutral-800/60 border border-amber-200/70 dark:border-amber-800/40 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="grid grid-cols-3 gap-3 flex-1">
            <div className="flex items-center space-x-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                completedToday
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-300/60 dark:border-orange-700/50'
              }`}>
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-neutral-900 dark:text-white leading-none">
                  {activeStreak} {activeStreak === 1 ? 'Day' : 'Days'}
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                  Daily Streak • Best {longestStreak}d
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-300/60 dark:border-amber-700/50 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-neutral-900 dark:text-white leading-none">
                  {totalPoints} pts
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                  +10 pts / interview
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-700/50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-neutral-900 dark:text-white leading-none">
                  {completedTasksCount} Done
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                  {completedToday ? 'Streak active today' : 'Complete 1 today'}
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Activity Dots */}
          <div className="flex items-center space-x-1.5 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-amber-200/50 dark:border-neutral-700/60">
            {last7Days.map((day) => (
              <div key={day.key} className="flex flex-col items-center space-y-1">
                <div
                  title={day.key}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-colors ${
                    day.done
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : day.isToday
                        ? 'bg-white dark:bg-neutral-900 border-orange-400 text-orange-600 dark:text-orange-400 border-dashed'
                        : 'bg-white/70 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400'
                  }`}
                >
                  {day.done ? '✓' : day.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {activeInterviews.length > 0 ? (
          <div className="mt-4 space-y-3">
            {activeInterviews.map((interview) => (
              <div
                key={interview.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 inline-flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{interview.isAITask ? 'AI Task Interview' : interview.type}</span>
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      +{interview.rewardPoints || 10} pts
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      • {interview.difficulty} • {interview.questions?.length || 3} Qs • {interview.durationMinutes} mins
                    </span>
                  </div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm mt-1.5">{interview.jobTitle}</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                    {interview.isAITask
                      ? `Focus: ${interview.taskFocus || 'AI Adaptive Practice'} • Ready anytime`
                      : `${new Date(interview.scheduledAt).toLocaleDateString()} at ${new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                </div>

                <button
                  onClick={() => onJoinInterview(interview)}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
                >
                  <Video className="w-4 h-4 mr-1.5" />
                  {interview.isAITask ? 'Start AI Interview' : 'Enter WebRTC Room'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 p-5 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin shrink-0" />
              <div className="text-xs text-neutral-700 dark:text-neutral-300">
                <span className="font-bold block text-neutral-900 dark:text-white">
                  Preparing your next AI Task Interview...
                </span>
                Tailoring questions to your {isFresher ? 'fresher' : 'experienced'} profile and skills.
              </div>
            </div>
            {onGenerateAITask && (
              <button
                onClick={onGenerateAITask}
                disabled={isGeneratingAITask}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0"
              >
                Generate Now
              </button>
            )}
          </div>
        )}

        {/* Completed Interviews with AI Feedback Review */}
        {completedInterviews.length > 0 && (
          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Completed AI Interview Evaluations ({completedInterviews.length})
            </h4>
            <div className="space-y-2">
              {completedInterviews.map((ci) => (
                <div
                  key={ci.id}
                  className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/60 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-neutral-900 dark:text-white text-xs">{ci.jobTitle}</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                        +{ci.rewardPoints || 10} pts
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {ci.type} Session • Evaluated with Gemini AI
                    </div>
                  </div>

                  <button
                    onClick={() => onViewInterviewResult(ci.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors shrink-0"
                  >
                    View AI Feedback Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Track Prep Suite & Active Applications */}
        <div className="lg:col-span-2 space-y-6">
          {/* ================= TRACK-SPECIFIC INTERVIEW & PREPARATION SUITE ================= */}
          {isFresher ? (
            /* ================= FRESHER PREP MODULE: CRACK JOBS AS A FRESHER ================= */
            <div className="bg-gradient-to-br from-emerald-950 via-neutral-900 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-900/60 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Fresher Job Cracking Hub</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Prepare to Crack Entry-Level Tech Jobs & Campus Placements
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                    Master the 4 core pillars technical interviewers test college freshers on: Core CS Fundamentals, Capstone Project Defense, Behavioral Rounds, and ATS Resume Formatting.
                  </p>
                </div>

                <button
                  onClick={() => onStartTrackMockInterview ? onStartTrackMockInterview('fresher') : onNavigateTab('job-board')}
                  className="inline-flex items-center justify-center px-5 py-3.5 rounded-2xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md transition-all shrink-0 space-x-2"
                >
                  <Zap className="w-4 h-4 text-neutral-950" />
                  <span>Launch Fresher AI Mock Interview</span>
                </button>
              </div>

              {/* 4 Interactive Fresher Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* Pillar 1: DSA & Core CS */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white">DSA & Core CS Drill</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Arrays, HashMaps, Trees, OOP 4 pillars, DBMS joins, and OS process scheduling.
                    </p>
                  </div>
                  <button
                    onClick={() => onStartTrackMockInterview?.('fresher', 'Core CS Fundamentals')}
                    className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                  >
                    <span>Start CS Drill</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Pillar 2: Project Defense */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Project Defense Simulator</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Learn to explain your final-year project architecture, database tradeoffs, and difficult bugs.
                    </p>
                  </div>
                  <button
                    onClick={() => onStartTrackMockInterview?.('fresher', 'Academic Project Defense')}
                    className="mt-4 text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                  >
                    <span>Practice Pitch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Pillar 3: HR & Behavioral */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Fresher HR & Behavioral</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      "Tell me about yourself", handling college deadlines, and showcasing fast learning ability.
                    </p>
                  </div>
                  <button
                    onClick={() => onStartTrackMockInterview?.('fresher', 'Fresher HR Behavioral')}
                    className="mt-4 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                  >
                    <span>Practice HR Round</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Pillar 4: ATS Resume Booster */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Fresher ATS Booster</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Format coursework, GitHub repositories, and certifications to score 90%+ without corporate exp.
                    </p>
                  </div>
                  {onOpenATSModal && (
                    <button
                      onClick={onOpenATSModal}
                      className="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      <span>Test Resume ATS</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ================= EXPERIENCED PREP MODULE: SENIOR ENGINEERING & ARCHITECTURE ================= */
            <div className="bg-gradient-to-br from-blue-950 via-neutral-900 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-blue-900/60 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Professional Engineering Suite</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Senior Technical Calibration & System Architecture
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                    Practice high-level architectural trade-offs, distributed concurrency, production outage post-mortems, and executive STAR leadership drills.
                  </p>
                </div>

                <button
                  onClick={() => onStartTrackMockInterview ? onStartTrackMockInterview('experienced') : onNavigateTab('job-board')}
                  className="inline-flex items-center justify-center px-5 py-3.5 rounded-2xl text-xs font-black bg-blue-500 hover:bg-blue-400 text-neutral-950 shadow-md transition-all shrink-0 space-x-2"
                >
                  <Zap className="w-4 h-4 text-neutral-950" />
                  <span>Launch Senior Architecture Interview</span>
                </button>
              </div>

              {/* 4 Interactive Senior Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* Pillar 1: High-Scale System Design */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white">System Design & Scale</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Microservices, distributed caching (Redis/CDN), database sharding, and message queues.
                    </p>
                  </div>
                  <button
                    onClick={() => onStartTrackMockInterview?.('experienced', 'High-Scale System Design')}
                    className="mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <span>Start Design Drill</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Pillar 2: Production Incident Triage */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Incident & Concurrency Triage</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Memory leak diagnosis, race conditions, connection pool exhaustion, and blameless post-mortems.
                    </p>
                  </div>
                  <button
                    onClick={() => onStartTrackMockInterview?.('experienced', 'Incident Triage & Concurrency')}
                    className="mt-4 text-xs font-bold text-red-400 hover:text-red-300 flex items-center space-x-1"
                  >
                    <span>Triage Drill</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Pillar 3: STAR Leadership */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white">STAR Leadership & Conflict</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Cross-functional alignment, technical debt vs feature velocity, and engineering mentorship.
                    </p>
                  </div>
                  <button
                    onClick={() => onStartTrackMockInterview?.('experienced', 'Senior STAR Leadership')}
                    className="mt-4 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                  >
                    <span>Practice Leadership</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Pillar 4: Executive ATS XYZ Metrics */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Executive XYZ Resume</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Rewrite bullet points into Google's XYZ formula: "Accomplished [X] measured by [Y] by doing [Z]".
                    </p>
                  </div>
                  {onOpenATSModal && (
                    <button
                      onClick={onOpenATSModal}
                      className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                    >
                      <span>Test Senior ATS</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Job Applications Tracking Pipeline */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-6 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">Application Status Tracking</h3>
              </div>
              <button
                onClick={() => onNavigateTab('job-board')}
                className="text-xs font-semibold text-neutral-900 dark:text-white hover:underline flex items-center"
              >
                {isFresher ? 'Browse Fresher Jobs' : 'Browse Senior Positions'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {applications.length > 0 ? (
              <div className="mt-4 space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-neutral-50/60 dark:bg-neutral-800 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-emerald-400 text-sm tracking-tight">{app.jobTitle}</h4>
                        <div className="text-xs text-neutral-500 dark:text-neutral-300 mt-0.5">
                          {app.companyName} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {app.matchScore && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {app.matchScore.overallScore}% AI Match
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            app.status === 'INTERVIEW_SCHEDULED'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : app.status === 'SHORTLISTED'
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              : app.status === 'UNDER_REVIEW'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : app.status === 'SELECTED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                          }`}
                        >
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {app.recruiterNotes && (
                      <p className="mt-2.5 text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/80 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-700 italic">
                        "Recruiter update: {app.recruiterNotes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
                You have not applied to any positions yet. Visit the Job Board to apply with one-click AI match scoring.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Matched Positions & Resume Widget */}
        <div className="space-y-6">
          {/* Active Parsed Resume Widget */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wider">
                  {isFresher ? 'Fresher Resume' : 'Professional Resume'}
                </h4>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                AI Parsed
              </span>
            </div>

            <div className="mt-3">
              <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {profile.resumeFileName || (isFresher ? 'David_Chen_CS_Graduate_Resume.pdf' : 'Alex_Rivera_Senior_FullStack_Resume.pdf')}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                {isFresher
                  ? `Recent Graduate • ${profile.skills.length} skills indexed`
                  : `${profile.yearsOfExperience} years verified experience • ${profile.skills.length} skills indexed`}
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {profile.skills.slice(0, 8).map((s, i) => (
                  <span key={i} className="text-[11px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded">
                    {s}
                  </span>
                ))}
                {profile.skills.length > 8 && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded">
                    +{profile.skills.length - 8} more
                  </span>
                )}
              </div>

              <button
                onClick={() => onNavigateTab('candidate-profile')}
                className="mt-4 w-full py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                Re-upload / Edit Resume
              </button>
            </div>
          </div>

          {/* Matched Jobs Filtered by Track */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wider">
                  {isFresher ? 'Matched Graduate Roles' : 'Matched Senior Positions'}
                </h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isFresher ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}>
                {isFresher ? 'Entry Level' : 'Mid - Senior'}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {displayJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  onClick={() => onNavigateTab('job-board')}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition-all bg-neutral-50/50 dark:bg-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 dark:text-white text-xs truncate max-w-[180px]">
                      {job.title}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-500">
                      {job.experienceLevel}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {job.companyName} • ${(job.salaryRange.min / 1000).toFixed(0)}k - ${(job.salaryRange.max / 1000).toFixed(0)}k
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-2 flex items-center">
                    Apply with 1-Click Match →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
