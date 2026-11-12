import React, { useState } from 'react';
import { Job } from '../types.ts';
import {
  Briefcase,
  Plus,
  Sparkles,
  MapPin,
  DollarSign,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  Loader2,
  X,
  Building2,
} from 'lucide-react';

interface RecruiterJobManagerProps {
  jobs: Job[];
  onJobCreated: (job: Job) => void;
  onJobUpdated: (job: Job) => void;
  onJobDeleted: (jobId: string) => void;
}

export const RecruiterJobManager: React.FC<RecruiterJobManagerProps> = ({
  jobs,
  onJobCreated,
  onJobUpdated,
  onJobDeleted,
}) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isAnalyzingJD, setIsAnalyzingJD] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('TypeScript, Node.js, WebRTC, React');
  const [preferredSkills, setPreferredSkills] = useState('Docker, Kubernetes, Redis, AWS');
  const [experienceMinYears, setExperienceMinYears] = useState(4);
  const [experienceLevel, setExperienceLevel] = useState<'Mid' | 'Senior' | 'Lead'>('Senior');
  const [location, setLocation] = useState('San Francisco, CA / Remote');
  const [remoteType, setRemoteType] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [minSalary, setMinSalary] = useState(150000);
  const [maxSalary, setMaxSalary] = useState(195000);

  const handleAIAssist = async () => {
    if (!title) {
      alert('Please enter a job title first so the AI can analyze requirements.');
      return;
    }
    setIsAnalyzingJD(true);
    try {
      const res = await fetch('/api/ai/job/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || `We are looking for an experienced ${title} to join our high-growth platform team.`,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setRequiredSkills(data.analysis.requiredSkills.join(', '));
        setPreferredSkills(data.analysis.preferredSkills.join(', '));
        if (data.analysis.minimumExperienceYears) {
          setExperienceMinYears(data.analysis.minimumExperienceYears);
        }
        if (!description) {
          setDescription(
            `Key Responsibilities:\n${data.analysis.coreResponsibilities.map((r: string) => `• ${r}`).join('\n')}`
          );
        }
      }
    } catch (e) {
      console.error('Job AI assist failed:', e);
    } finally {
      setIsAnalyzingJD(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setIsSubmitting(true);

    try {
      const payload = {
        title,
        department,
        description,
        skills: {
          required: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
          preferred: preferredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        },
        experienceMinYears,
        experienceLevel,
        location,
        remoteType,
        salaryRange: {
          min: Number(minSalary),
          max: Number(maxSalary),
          currency: 'USD',
        },
        jobType: 'Full-time',
        deadline: '2026-08-30',
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create job');
      const data = await res.json();
      onJobCreated(data.job);
      setCreateModalOpen(false);
      // Reset
      setTitle('');
      setDescription('');
    } catch (err: any) {
      alert(err.message || 'Error creating job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to remove this job posting?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        onJobDeleted(jobId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Talent Acquisition</span>
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mt-1">Company Job Postings</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage hiring requirements and leverage AI assistance to calibrate technical skill criteria.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Job Opening
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-neutral-100 text-neutral-700">
                    {job.department}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 mt-2">{job.title}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {job.location} ({job.remoteType})
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                  title="Delete job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mt-4">
                {job.skills.required.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-800 rounded">
                    {s}
                  </span>
                ))}
              </div>

              <p className="text-xs text-neutral-600 mt-4 line-clamp-3 leading-relaxed">
                {job.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800">
                ${(job.salaryRange.min / 1000).toFixed(0)}k - ${(job.salaryRange.max / 1000).toFixed(0)}k
              </span>
              <span>{job.applicantCount || 0} Candidates in Pipeline</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Job Modal with AI Assistant */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 my-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Recruiter Studio
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-1">Publish New Job Opening</h3>
                <p className="text-xs text-neutral-500">
                  Fill in the role details or use Gemini to extract key skills and responsibilities automatically.
                </p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1.5">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior WebRTC & Backend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1.5">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="AI Infrastructure">AI Infrastructure</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Data Platform">Data Platform</option>
                  </select>
                </div>
              </div>

              {/* AI Job Description Assistant Trigger */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-xs">Gemini Job Description Assistant</span>
                </div>
                <button
                  type="button"
                  onClick={handleAIAssist}
                  disabled={isAnalyzingJD}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center"
                >
                  {isAnalyzingJD ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Auto-Extract Skills & Rubric'
                  )}
                </button>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1.5">Job Description & Responsibilities</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Outline the core responsibilities, team charter, and technical context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1.5">Required Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={requiredSkills}
                    onChange={(e) => setRequiredSkills(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1.5">Preferred Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={preferredSkills}
                    onChange={(e) => setPreferredSkills(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1.5">Min Experience (Years)</label>
                  <input
                    type="number"
                    value={experienceMinYears}
                    onChange={(e) => setExperienceMinYears(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1.5">Workplace Policy</label>
                  <select
                    value={remoteType}
                    onChange={(e) => setRemoteType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1.5">Target Salary Max ($)</label>
                  <input
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Job Opening'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
