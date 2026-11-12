import React, { useState } from 'react';
import { Application, Interview } from '../types.ts';
import { Video, Calendar, Clock, Sparkles, X, Loader2, Check } from 'lucide-react';

interface ScheduleInterviewModalProps {
  application: Application;
  onClose: () => void;
  onScheduled: (interview: Interview) => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  application,
  onClose,
  onScheduled,
}) => {
  const [interviewType, setInterviewType] = useState<
    'AI Technical' | 'AI HR' | 'Recruiter' | 'Mixed'
  >('AI Technical');
  const [difficulty, setDifficulty] = useState<'Junior' | 'Mid' | 'Senior' | 'Lead'>('Senior');
  const [topicCount, setTopicCount] = useState(4);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [technicalTopics, setTechnicalTopics] = useState('Data Structures, System Design, REST APIs, Concurrency');
  const [hrTopics, setHrTopics] = useState('STAR Conflict Resolution, Cross-Team Mentorship, Culture Fit');
  const [scheduledAt, setScheduledAt] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSchedule = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          type: interviewType,
          durationMinutes,
          difficulty,
          topicCount,
          technicalTopics,
          hrTopics,
          scheduledAt,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to schedule interview');
      }

      const data = await res.json();
      onScheduled(data.interview);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error scheduling interview');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 my-8 space-y-5">
        <div className="flex items-start justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Recruiter Interview Scheduler • SRS FR-11
            </span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mt-1">Schedule AI-Assisted Interview</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Candidate: <strong>{application.candidateName}</strong> for {application.jobTitle}
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">Interview Format & Focus (FR-11)</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
            >
              <option value="AI Technical">AI Technical Interview (Core CS, Coding & Architecture)</option>
              <option value="AI HR">AI HR Interview (Behavioral, STAR & Culture Fit)</option>
              <option value="Recruiter">Recruiter Interview (Screening & Experience Verification)</option>
              <option value="Mixed">Mixed Interview (50% Technical Architecture + 50% STAR Leadership)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">Calibrated Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              >
                <option value="Junior">Junior / Entry</option>
                <option value="Mid">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Staff / Principal</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">Questions Count</label>
              <select
                value={topicCount}
                onChange={(e) => setTopicCount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              >
                <option value={3}>3 Questions (~20 mins)</option>
                <option value={4}>4 Questions (~30 mins)</option>
                <option value={5}>5 Questions (~40 mins)</option>
              </select>
            </div>
          </div>

          {(interviewType === 'AI Technical' || interviewType === 'Mixed') && (
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">Technical Topics (FR-11)</label>
              <input
                type="text"
                value={technicalTopics}
                onChange={(e) => setTechnicalTopics(e.target.value)}
                placeholder="e.g. Distributed Caching, Redis, WebRTC, Concurrency"
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>
          )}

          {(interviewType === 'AI HR' || interviewType === 'Mixed' || interviewType === 'Recruiter') && (
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">HR & Behavioral Topics (FR-11)</label>
              <input
                type="text"
                value={hrTopics}
                onChange={(e) => setHrTopics(e.target.value)}
                placeholder="e.g. STAR conflict resolution, cross-functional ownership"
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">Target Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Dynamic Question Generation:</strong> Upon scheduling, Gemini AI analyzes the specific job description, custom topics, and candidate profile to craft grounded, non-generic interview questions with custom evaluation rubrics.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={isGenerating}
            className="inline-flex items-center px-5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Generating Custom Questions...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Confirm & Generate Interview
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
