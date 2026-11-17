import React, { useState } from 'react';
import { Job, CandidateProfile, Application, AIMatchScore } from '../types.ts';
import { getAuthToken } from '../utils/authToken.ts';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Filter,
  Check,
  Building2,
  X,
  Loader2,
  Info,
} from 'lucide-react';

interface JobBoardProps {
  jobs: Job[];
  candidateProfile: CandidateProfile;
  applications: Application[];
  onApplySuccess: (newApplication: Application) => void;
  onOpenInterviewRoom: (jobId: string) => void;
}

export const JobBoard: React.FC<JobBoardProps> = ({
  jobs,
  candidateProfile,
  applications,
  onApplySuccess,
  onOpenInterviewRoom,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedRemote, setSelectedRemote] = useState<string>('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Application flow state
  const [isEvaluatingMatch, setIsEvaluatingMatch] = useState(false);
  const [activeMatchScore, setActiveMatchScore] = useState<AIMatchScore | null>(null);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);

  const departments: string[] = ['All', ...Array.from(new Set<string>(jobs.map((j) => j.department)))];

  const filteredJobs = jobs.filter((job) => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.companyName.toLowerCase().includes(query) ||
      job.department.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.skills.required.some((s) => s.toLowerCase().includes(query)) ||
      job.skills.preferred.some((s) => s.toLowerCase().includes(query));

    const matchesDept = selectedDepartment === 'All' || job.department === selectedDepartment;
    const matchesRemote = selectedRemote === 'All' || job.remoteType === selectedRemote;

    return matchesSearch && matchesDept && matchesRemote && job.status === 'OPEN';
  });

  const getApplicationForJob = (jobId: string) => {
    return applications.find((a) => a.jobId === jobId);
  };

  const handleStartApply = async (job: Job) => {
    setSelectedJob(job);
    setApplyModalOpen(true);
    setIsEvaluatingMatch(true);
    setActiveMatchScore(null);
    setApplySuccessMessage(null);

    try {
      // Calculate match score preview
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers,
        body: JSON.stringify({ jobId: job.id, candidateId: candidateProfile.id }),
      });
      const data = await res.json();
      if (data.matchScore) {
        setActiveMatchScore(data.matchScore);
      }
    } catch (e) {
      console.error('Error evaluating match:', e);
    } finally {
      setIsEvaluatingMatch(false);
    }
  };

  const handleConfirmApply = async () => {
    if (!selectedJob) return;
    setIsSubmittingApp(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jobId: selectedJob.id,
          candidateId: candidateProfile.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit application');
      }

      const data = await res.json();
      onApplySuccess(data.application);
      setApplySuccessMessage('Application submitted successfully! Your application is now in review.');
      setTimeout(() => {
        setApplyModalOpen(false);
        setApplySuccessMessage(null);
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Could not submit application');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-5 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, skill (e.g. WebRTC, React, TypeScript), or company..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm bg-neutral-50/50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d} className="dark:bg-neutral-900 dark:text-white">
                  {d === 'All' ? 'All Domains' : `Domain: ${d}`}
                </option>
              ))}
            </select>

            <select
              value={selectedRemote}
              onChange={(e) => setSelectedRemote(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm bg-neutral-50/50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 focus:outline-none"
            >
              <option value="All" className="dark:bg-neutral-900 dark:text-white">All Workplaces</option>
              <option value="Remote" className="dark:bg-neutral-900 dark:text-white">Remote</option>
              <option value="Hybrid" className="dark:bg-neutral-900 dark:text-white">Hybrid</option>
              <option value="On-site" className="dark:bg-neutral-900 dark:text-white">On-site</option>
            </select>
          </div>
        </div>

        {/* Quick Domain Filter Chips */}
        <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-400 dark:text-neutral-500 whitespace-nowrap font-medium pr-1">Domains:</span>
          {departments.map((dept) => {
            const count = dept === 'All'
              ? jobs.filter((j) => j.status === 'OPEN').length
              : jobs.filter((j) => j.department === dept && j.status === 'OPEN').length;
            const isSelected = selectedDepartment === dept;
            return (
              <button
                key={dept}
                id={`filter-dept-${dept.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setSelectedDepartment(dept)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                <span>{dept === 'All' ? 'All Domains' : dept}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isSelected
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-neutral-900'
                    : 'bg-neutral-200/80 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Listings Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <span>Showing {filteredJobs.length} open position{filteredJobs.length === 1 ? '' : 's'}</span>
            <span>AI match previews personalized for Alex Rivera</span>
          </div>

          {filteredJobs.map((job) => {
            const existingApp = getApplicationForJob(job.id);
            const isSelected = selectedJob?.id === job.id;

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`bg-white dark:bg-neutral-900 rounded-2xl border p-6 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 dark:border-white shadow-md ring-1 ring-neutral-900 dark:ring-white'
                    : 'border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={job.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80'}
                      alt={job.companyName}
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium flex items-center space-x-2 mt-0.5">
                        <span>{job.companyName}</span>
                        <span>•</span>
                        <span>{job.department}</span>
                      </div>
                    </div>
                  </div>

                  {existingApp ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {existingApp.status.replace('_', ' ')}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {job.jobType}
                    </span>
                  )}
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                    {job.location} ({job.remoteType})
                  </span>
                  <span className="flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                    {job.experienceMinYears}+ yrs exp ({job.experienceLevel})
                  </span>
                  <span className="flex items-center font-semibold text-neutral-900 dark:text-white">
                    <DollarSign className="w-3.5 h-3.5 text-neutral-400 -mr-0.5" />
                    {(job.salaryRange.min / 1000).toFixed(0)}k - {(job.salaryRange.max / 1000).toFixed(0)}k {job.salaryRange.currency}
                  </span>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  {job.skills.required.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                  {job.skills.preferred.slice(0, 3).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs font-medium bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-md border border-neutral-200/60 dark:border-neutral-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs text-neutral-400">
                    {job.applicantCount || 0} applicants • Deadline {job.deadline}
                  </span>

                  <div className="flex items-center space-x-2">
                    {existingApp ? (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Applied
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartApply(job);
                        }}
                        className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                        Apply with AI Match
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Job Detail Panel (1 col) */}
        <div className="lg:col-span-1">
          {selectedJob ? (
            <div className="sticky top-20 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-6 shadow-xs space-y-5 transition-colors">
              <div>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {selectedJob.department}
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-2">{selectedJob.title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{selectedJob.companyName} • {selectedJob.location}</p>
              </div>

              {/* Salary & Type Box */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-neutral-400 font-medium">Compensation</div>
                  <div className="font-bold text-neutral-900 dark:text-white mt-0.5">
                    ${(selectedJob.salaryRange.min / 1000).toFixed(0)}k - ${(selectedJob.salaryRange.max / 1000).toFixed(0)}k
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400 font-medium">Experience Level</div>
                  <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{selectedJob.experienceLevel} ({selectedJob.experienceMinYears}+ yrs)</div>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Description</h4>
                <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line pr-1 font-sans">
                  {selectedJob.description}
                </div>
              </div>

              {/* Required competencies */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Required Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills.required.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                {getApplicationForJob(selectedJob.id) ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Application Active: {getApplicationForJob(selectedJob.id)?.status.replace('_', ' ')}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartApply(selectedJob)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shadow-xs flex items-center justify-center transition-colors"
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-emerald-400 dark:text-emerald-600" />
                    Apply for this Position
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
              Select a job position to preview full role specifications and AI match breakdown.
            </div>
          )}
        </div>
      </div>

      {/* AI Match & Apply Modal */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 my-8 space-y-5 text-neutral-900 dark:text-white transition-colors">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Candidate Job Application</span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-1">{selectedJob.title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{selectedJob.companyName} • {selectedJob.location}</p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Advisory Match Score Container */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/90 dark:border-neutral-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    AI Match Evaluation (Assistive Signal)
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                  Advisory Only
                </span>
              </div>

              {isEvaluatingMatch ? (
                <div className="py-8 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 dark:text-emerald-400" />
                  <div className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">Computing semantic resume-to-job match breakdown...</div>
                </div>
              ) : activeMatchScore ? (
                <div className="space-y-4">
                  {/* Big score dial + breakdown */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex flex-col items-center justify-center font-bold shadow-xs">
                      <span className="text-xl leading-none">{activeMatchScore.overallScore}</span>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-100 mt-0.5">/100</span>
                    </div>

                    <div className="flex-1 space-y-1 text-xs">
                      <div className="flex justify-between font-semibold text-neutral-700 dark:text-neutral-300">
                        <span>Skills Alignment</span>
                        <span>{activeMatchScore.breakdown.skillMatch}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full"
                          style={{ width: `${activeMatchScore.breakdown.skillMatch}%` }}
                        />
                      </div>

                      <div className="flex justify-between font-semibold text-neutral-700 dark:text-neutral-300 pt-1">
                        <span>Experience Relevance</span>
                        <span>{activeMatchScore.breakdown.experienceMatch}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                          style={{ width: `${activeMatchScore.breakdown.experienceMatch}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Missing skills */}
                  <div className="text-xs space-y-2 pt-2 border-t border-neutral-200/80 dark:border-neutral-700">
                    <div className="font-semibold text-neutral-900 dark:text-white">Key Strengths Identified:</div>
                    <ul className="space-y-1 text-neutral-600 dark:text-neutral-300 pl-4 list-disc text-[11px]">
                      {activeMatchScore.strengths.slice(0, 3).map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300 flex items-start space-x-2">
                    <Info className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
                    <span>
                      <strong>Human-in-the-Loop Guarantee:</strong> This AI score is an assistive evaluation signal for the recruiter. It never triggers automated rejection.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Ready to compute alignment score with your resume.</div>
              )}
            </div>

            {/* Resume attaching confirmation */}
            <div className="text-xs text-neutral-600 dark:text-neutral-300">
              Applying as <strong>{candidateProfile.headline}</strong> using attached resume{' '}
              <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-200">
                {candidateProfile.resumeFileName || 'Alex_Rivera_Resume.pdf'}
              </span>
            </div>

            {applySuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{applySuccessMessage}</span>
              </div>
            )}

            {/* Modal actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={isSubmittingApp || !!applySuccessMessage}
                className="inline-flex items-center px-5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 disabled:opacity-50 transition-colors shadow-xs"
              >
                {isSubmittingApp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Confirm & Submit Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
