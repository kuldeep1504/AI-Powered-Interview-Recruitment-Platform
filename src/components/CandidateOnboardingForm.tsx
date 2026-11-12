import React, { useState } from 'react';
import { CandidateProfile, ExperienceTrack, FresherDetails, ExperiencedDetails } from '../types.ts';
import {
  GraduationCap,
  Briefcase,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Cpu,
  Layers,
  Award,
  Building,
  Target,
  Code2,
  Calendar,
  Compass,
  Zap,
} from 'lucide-react';

interface CandidateOnboardingFormProps {
  initialProfile?: CandidateProfile | null;
  onSaveOnboarding: (track: ExperienceTrack, fresherData?: FresherDetails, expData?: ExperiencedDetails) => Promise<void>;
  onCancel?: () => void;
}

const COMMON_FRESHER_ROLES = [
  'Graduate Software Engineer',
  'Associate Frontend Developer',
  'Junior Full-Stack Developer',
  'Junior Backend Engineer (Python/Java)',
  'Associate Cloud & DevOps Trainee',
  'Junior Data Analyst / ML Associate',
  'Quality Assurance & Automation Trainee',
];

const COMMON_FRESHER_COURSEWORK = [
  'Data Structures & Algorithms',
  'Object-Oriented Programming (OOP)',
  'Database Management Systems (DBMS)',
  'Operating Systems',
  'Computer Networks',
  'Full-Stack Web Development',
  'REST APIs & Backend Architecture',
  'Git & Version Control',
];

const COMMON_EXPERIENCED_DOMAINS = [
  'Distributed Systems & Cloud Infrastructure',
  'Full-Stack TypeScript & React Architecture',
  'Backend Microservices & High-Throughput APIs',
  'AI / ML Platform & LLM Infrastructure',
  'Mobile Architecture (iOS / Android / React Native)',
  'DevOps, SRE & Observability Engineering',
];

const COMMON_EXPERIENCED_STACK = [
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Go',
  'Java',
  'PostgreSQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Kafka',
  'WebSockets',
  'System Design',
];

export const CandidateOnboardingForm: React.FC<CandidateOnboardingFormProps> = ({
  initialProfile,
  onSaveOnboarding,
  onCancel,
}) => {
  // Track choice
  const [track, setTrack] = useState<ExperienceTrack>(
    initialProfile?.experienceTrack || (initialProfile?.yearsOfExperience === 0 ? 'fresher' : 'experienced')
  );

  // Fresher details state
  const existingFresher = initialProfile?.fresherDetails;
  const [collegeName, setCollegeName] = useState(
    existingFresher?.collegeName || initialProfile?.education?.[0]?.institution || 'San Jose State University'
  );
  const [degree, setDegree] = useState(
    existingFresher?.degree || initialProfile?.education?.[0]?.degree || 'Bachelor of Science'
  );
  const [fieldOfStudy, setFieldOfStudy] = useState(
    existingFresher?.fieldOfStudy || initialProfile?.education?.[0]?.fieldOfStudy || 'Computer Science'
  );
  const [graduationYear, setGraduationYear] = useState(
    existingFresher?.graduationYear || initialProfile?.education?.[0]?.endYear || '2025'
  );
  const [targetRole, setTargetRole] = useState(
    existingFresher?.targetRole || 'Graduate Software Engineer'
  );
  const [fresherSkills, setFresherSkills] = useState<string[]>(
    existingFresher?.primarySkills?.length ? existingFresher.primarySkills : ['Java', 'Python', 'JavaScript', 'React', 'SQL', 'Git', 'Data Structures']
  );
  const [coreCoursework, setCoreCoursework] = useState<string[]>(
    existingFresher?.coreCoursework?.length ? existingFresher.coreCoursework : [
      'Data Structures & Algorithms',
      'Object-Oriented Programming (OOP)',
      'Database Management Systems (DBMS)',
      'Operating Systems',
    ]
  );
  const [projectTitle, setProjectTitle] = useState(
    existingFresher?.finalYearProjectTitle || initialProfile?.projects?.[0]?.title || 'PeerCollab — Collaborative Coding Classroom'
  );
  const [projectSummary, setProjectSummary] = useState(
    existingFresher?.finalYearProjectSummary || initialProfile?.projects?.[0]?.description || 'Built a real-time syntax-highlighting code editor with WebSockets synchronization and Docker sandbox code execution.'
  );
  const [fresherGoal, setFresherGoal] = useState<FresherDetails['immediateGoal']>(
    existingFresher?.immediateGoal || 'campus_placements'
  );

  // Experienced details state
  const existingExp = initialProfile?.experiencedDetails;
  const [currentRole, setCurrentRole] = useState(
    existingExp?.currentRole || initialProfile?.experience?.[0]?.role || 'Senior Full-Stack Engineer'
  );
  const [currentCompany, setCurrentCompany] = useState(
    existingExp?.currentCompany || initialProfile?.experience?.[0]?.company || 'Nexus Realtime Inc.'
  );
  const [totalYears, setTotalYears] = useState<number>(
    existingExp?.totalYears || (initialProfile?.yearsOfExperience ? initialProfile.yearsOfExperience : 5)
  );
  const [domain, setDomain] = useState(
    existingExp?.domain || 'Distributed Systems & Real-time Media'
  );
  const [targetSeniority, setTargetSeniority] = useState<ExperiencedDetails['targetSeniority']>(
    existingExp?.targetSeniority || 'Senior'
  );
  const [techStack, setTechStack] = useState<string[]>(
    existingExp?.primaryTechStack?.length ? existingExp.primaryTechStack : ['TypeScript', 'React', 'Node.js', 'WebRTC', 'PostgreSQL', 'Redis', 'Docker']
  );
  const [achievement, setAchievement] = useState(
    existingExp?.notableAchievement || 'Architected WebRTC multi-party video conferencing engine with low-latency media signaling, scaling to 150K concurrent daily calls.'
  );
  const [expFocus, setExpFocus] = useState<ExperiencedDetails['interviewPrepFocus']>(
    existingExp?.interviewPrepFocus || 'system_design'
  );

  const [saving, setSaving] = useState(false);

  // Toggle helpers for skills
  const toggleFresherCoursework = (item: string) => {
    setCoreCoursework((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleTechStack = (item: string) => {
    setTechStack((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Sample Presets
  const applySampleFresher = () => {
    setTrack('fresher');
    setCollegeName('San Jose State University');
    setDegree('Bachelor of Science');
    setFieldOfStudy('Computer Science');
    setGraduationYear('2025');
    setTargetRole('Graduate Software Engineer');
    setFresherSkills(['Java', 'Python', 'JavaScript', 'React', 'SQL', 'Git', 'Data Structures']);
    setCoreCoursework([
      'Data Structures & Algorithms',
      'Object-Oriented Programming (OOP)',
      'Database Management Systems (DBMS)',
      'Operating Systems',
    ]);
    setProjectTitle('PeerCollab — Collaborative Coding Classroom');
    setProjectSummary('Web app enabling peers to pair-code with real-time cursor sync and automated code test execution using Docker containers.');
    setFresherGoal('campus_placements');
  };

  const applySampleExperienced = () => {
    setTrack('experienced');
    setCurrentRole('Senior Full-Stack Engineer');
    setCurrentCompany('Nexus Realtime Inc.');
    setTotalYears(6);
    setDomain('Distributed Systems & Real-time Media');
    setTargetSeniority('Senior');
    setTechStack(['TypeScript', 'React', 'Node.js', 'WebRTC', 'PostgreSQL', 'Redis', 'Docker', 'System Design']);
    setAchievement('Architected WebRTC video streaming engine handling 150k daily active sessions with 99.99% uptime.');
    setExpFocus('system_design');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (track === 'fresher') {
        const fresherData: FresherDetails = {
          collegeName,
          degree,
          fieldOfStudy,
          graduationYear,
          targetRole,
          primarySkills: fresherSkills,
          coreCoursework,
          finalYearProjectTitle: projectTitle,
          finalYearProjectSummary: projectSummary,
          immediateGoal: fresherGoal,
          practiceTrack: 'dsa_core',
        };
        await onSaveOnboarding('fresher', fresherData, undefined);
      } else {
        const expData: ExperiencedDetails = {
          currentRole,
          currentCompany,
          totalYears,
          domain,
          targetSeniority,
          primaryTechStack: techStack,
          systemArchitectureFocus: ['Microservices', 'High Concurrency', 'Caching & CDNs', 'Fault Tolerance'],
          notableAchievement: achievement,
          interviewPrepFocus: expFocus,
        };
        await onSaveOnboarding('experienced', undefined, expData);
      }
    } catch (err) {
      console.error('Onboarding save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Step 1: Experience & Career Calibration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              Candidate Profile & Interview Calibration
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
              Tell us whether you are starting your tech career or bringing industry experience. We will customize your entire dashboard, interview simulations, and job benchmarks to match your exact level.
            </p>
          </div>

          {/* Quick Preset Buttons for Instant Demo Testing */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={applySampleFresher}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              Autofill Fresher
            </button>
            <button
              type="button"
              onClick={applySampleExperienced}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              Autofill Experienced
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Track Selection Cards */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 shadow-xs">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-4">
            Select Your Candidate Track
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Fresher Card */}
            <div
              onClick={() => setTrack('fresher')}
              className={`p-5 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${
                track === 'fresher'
                  ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
              }`}
            >
              {track === 'fresher' && (
                <span className="absolute top-4 right-4 flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected</span>
                </span>
              )}

              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>

              <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                Fresher / College Graduate
              </h2>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                0 to 1 Years of Professional Experience
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                Looking for entry-level roles, campus placements, or internships. Prepare to crack jobs with core CS fundamentals, coding rounds, and college project defense.
              </p>

              <div className="mt-4 pt-4 border-t border-neutral-200/80 dark:border-neutral-800 space-y-1.5 text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>DSA & Core CS Subjects (OOP, DBMS, OS, Networks)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Final-Year & Capstone Project Defense Drills</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Behavioral & HR Round Coaching for Freshers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Entry-Level & Graduate Job Matches</span>
                </div>
              </div>
            </div>

            {/* Experienced Card */}
            <div
              onClick={() => setTrack('experienced')}
              className={`p-5 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${
                track === 'experienced'
                  ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
              }`}
            >
              {track === 'experienced' && (
                <span className="absolute top-4 right-4 flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected</span>
                </span>
              )}

              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6" />
              </div>

              <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                Experienced Professional
              </h2>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
                2+ Years of Industry Work Experience
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                Currently working or transitioning into Mid, Senior, Staff, or Lead positions. Practice deep technical architecture, system design, and leadership drills.
              </p>

              <div className="mt-4 pt-4 border-t border-neutral-200/80 dark:border-neutral-800 space-y-1.5 text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>High-Scale System Architecture & Distributed Systems</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Production Incident Triage & High-Concurrency Drills</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Executive & STAR Leadership Behavioral Round</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Mid/Senior Tier Positions ($120k–$200k+)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Track Form Fields */}
        {track === 'fresher' ? (
          /* ================= FRESHER FORM ================= */
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Fresher Academic & Preparation Details
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Help us tune your entry-level interview questions and job match recommendations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* College */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  College / University Name *
                </label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. San Jose State University / IIT Delhi"
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Degree & Field */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Degree *
                  </label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Bachelor of Science">B.S. / B.Sc</option>
                    <option value="Bachelor of Technology">B.Tech / B.E.</option>
                    <option value="Master of Science">M.S. / M.Sc</option>
                    <option value="Master of Computer Applications">MCA</option>
                    <option value="Associate Degree">Associate Degree</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Graduation Year *
                  </label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="2024">2024 (Recent Grad)</option>
                    <option value="2025">2025 (Final Year)</option>
                    <option value="2026">2026 (Pre-Final Year)</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              {/* Target Role */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Target Entry-Level Role *
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-1.5"
                >
                  {COMMON_FRESHER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Immediate Goal */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Primary Preparation Goal *
                </label>
                <select
                  value={fresherGoal}
                  onChange={(e) => setFresherGoal(e.target.value as FresherDetails['immediateGoal'])}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="campus_placements">Campus Placement Drives</option>
                  <option value="off_campus_drives">Off-Campus Tech Applications</option>
                  <option value="first_internship">First Tech Internship</option>
                  <option value="startup_entry_role">Early-Stage Tech Startup Role</option>
                </select>
              </div>
            </div>

            {/* Core Coursework & Subjects */}
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Core Subjects & Fundamentals for Interview Practice
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_FRESHER_COURSEWORK.map((item) => {
                  const selected = coreCoursework.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleFresherCoursework(item)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      {item} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Capstone / Final Year Project */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Capstone / Major Academic Project (Used for AI Project Defense Drills)</span>
              </div>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Project Title (e.g. PeerCollab — Collaborative Coding Classroom)"
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
              <textarea
                rows={2}
                value={projectSummary}
                onChange={(e) => setProjectSummary(e.target.value)}
                placeholder="Brief summary of architecture, tools used, and challenges solved..."
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
          </div>
        ) : (
          /* ================= EXPERIENCED FORM ================= */
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Professional Experience & Seniority Calibration
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Calibrate your executive mock interviews, system design drills, and high-impact metric benchmarking.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Role */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Current / Latest Title *
                </label>
                <input
                  type="text"
                  required
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Current Company */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Current / Past Company *
                </label>
                <input
                  type="text"
                  required
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  placeholder="e.g. Nexus Realtime / Stripe"
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Total Years of Experience */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Years of Experience: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{totalYears} YOE</span>
                </label>
                <div className="flex items-center space-x-3 pt-1.5">
                  <input
                    type="range"
                    min={2}
                    max={15}
                    value={totalYears}
                    onChange={(e) => setTotalYears(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-xs font-mono font-bold w-10 text-right">{totalYears} yrs</span>
                </div>
              </div>

              {/* Domain Specialization */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Domain & Architecture Specialization *
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COMMON_EXPERIENCED_DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Seniority */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Target Seniority Level *
                </label>
                <select
                  value={targetSeniority}
                  onChange={(e) => setTargetSeniority(e.target.value as ExperiencedDetails['targetSeniority'])}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Mid-Level">Mid-Level Engineer (2-4 yrs)</option>
                  <option value="Senior">Senior Engineer (5-8 yrs)</option>
                  <option value="Staff / Principal">Staff / Principal Architect (8+ yrs)</option>
                  <option value="Lead / Engineering Manager">Lead / Engineering Manager</option>
                </select>
              </div>
            </div>

            {/* Core Tech Stack */}
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Core Production Tech Stack
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_EXPERIENCED_STACK.map((item) => {
                  const selected = techStack.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleTechStack(item)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-semibold'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      {item} {selected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* High Impact Achievement */}
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                Notable High-Impact Achievement / Scaled System
              </label>
              <textarea
                rows={2}
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                placeholder="e.g. Scaled database read replicas to support 50k QPS while slashing p99 latency by 45%..."
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Prep Focus */}
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                Primary Professional Interview Focus
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'system_design', label: 'System Design & Scalability' },
                  { id: 'high_concurrency', label: 'Concurrency & Distributed Systems' },
                  { id: 'incident_triage', label: 'Production Incident Post-Mortem' },
                  { id: 'star_leadership', label: 'STAR Leadership & Conflict' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExpFocus(item.id as ExperiencedDetails['interviewPrepFocus'])}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                      expFocus === item.id
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-bold'
                        : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tailored Dashboard Output Preview */}
        <div className="p-5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Dashboard Customization Preview:
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                  track === 'fresher'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                }`}
              >
                {track === 'fresher' ? 'Fresher Job Cracking Hub' : 'Senior Professional Interview Suite'}
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              {track === 'fresher'
                ? 'Your dashboard will unlock Core CS Drills (DSA, OOP, DBMS, OS), Project Defense simulators, Entry-Level Job matching, and friendly conceptual mock interviews.'
                : 'Your dashboard will unlock High-Scale System Design drills, Production Outage Post-Mortems, Executive STAR Leadership questions, and Senior Job compensation bands.'}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-black text-white shadow-md transition-all ${
                track === 'fresher'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <span>{saving ? 'Calibrating...' : 'Launch Tailored Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
