import React, { useState, useEffect } from 'react';
import {
  CandidateProfile,
  AIParsedResume,
  ExperienceItem,
  EducationItem,
  ProjectItem,
} from '../types.ts';
import { ResumeUploader } from './ResumeUploader.tsx';
import { getAuthToken } from '../utils/authToken.ts';
import {
  FileText,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface CandidateProfileViewProps {
  profile: CandidateProfile;
  onUpdateProfile: (updated: CandidateProfile) => void;
  onOpenATSModal?: () => void;
}

export const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenATSModal,
}) => {
  const [formData, setFormData] = useState<CandidateProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsingPasted, setIsParsingPasted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleResumeParsed = (
    parsed: AIParsedResume,
    meta?: { rawText: string; fileName: string; profile?: CandidateProfile }
  ) => {
    const flatSkills = [
      ...(parsed.skills?.languages || []),
      ...(parsed.skills?.frameworks || []),
      ...(parsed.skills?.toolsAndDatabases || []),
    ];

    const mappedExperience: ExperienceItem[] =
      Array.isArray(parsed.experience) && parsed.experience.length
        ? parsed.experience.map((exp, i) => ({
            id: `exp-parsed-${Date.now()}-${i}`,
            company: exp.company || '',
            role: exp.role || '',
            location: '',
            startDate: exp.duration || '',
            endDate: '',
            current: false,
            description: Array.isArray(exp.highlights) ? exp.highlights.join(' • ') : '',
            skillsUsed: [],
          }))
        : formData.experience;

    const mappedEducation: EducationItem[] =
      Array.isArray(parsed.education) && parsed.education.length
        ? parsed.education.map((edu, i) => ({
            id: `edu-parsed-${Date.now()}-${i}`,
            institution: edu.institution || '',
            degree: edu.degree || '',
            fieldOfStudy: '',
            startYear: '',
            endYear: edu.year || '',
          }))
        : formData.education;

    const mappedProjects: ProjectItem[] =
      Array.isArray(parsed.projects) && parsed.projects.length
        ? parsed.projects.map((proj, i) => ({
            id: `proj-parsed-${Date.now()}-${i}`,
            title: proj.name || '',
            description: proj.description || '',
            technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
          }))
        : formData.projects;

    const baseProfile = meta?.profile ? { ...formData, ...meta.profile } : formData;

    const merged: CandidateProfile = {
      ...baseProfile,
      headline: parsed.headline || baseProfile.headline,
      bio: parsed.summary || baseProfile.bio,
      phone: parsed.phone || baseProfile.phone,
      yearsOfExperience: parsed.yearsOfExperience ?? baseProfile.yearsOfExperience,
      resumeFileName: meta?.fileName || meta?.profile?.resumeFileName || baseProfile.resumeFileName || 'Uploaded_Resume.pdf',
      resumeRawText: meta?.rawText ?? meta?.profile?.resumeRawText ?? baseProfile.resumeRawText,
      parsedResumeData: parsed,
      skills: Array.from(new Set([...(baseProfile.skills || []), ...flatSkills])),
      certifications: Array.from(
        new Set([...(baseProfile.certifications || []), ...(parsed.certifications || [])])
      ),
      education: mappedEducation,
      experience: mappedExperience,
      projects: mappedProjects,
      updatedAt: new Date().toISOString(),
    };

    setFormData(merged);
    onUpdateProfile(merged);
  };

  const handleSaveResume = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/candidates/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          resumeFileName: formData.resumeFileName,
          resumeRawText: formData.resumeRawText,
          parsedResumeData: formData.parsedResumeData,
          skills: formData.skills,
          education: formData.education,
          experience: formData.experience,
          projects: formData.projects,
          certifications: formData.certifications,
          headline: formData.headline,
          bio: formData.bio,
          yearsOfExperience: formData.yearsOfExperience,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save resume details.');
      }
      if (data.profile) {
        onUpdateProfile(data.profile);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Error saving resume.');
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = (formData.resumeRawText || '').trim().split(/\s+/).filter(Boolean).length;
  const hasAddedResume = Boolean(formData.resumeRawText?.trim() || formData.parsedResumeData);

  const handleCheckAddedResumeATS = () => {
    onUpdateProfile(formData);
    onOpenATSModal?.();
  };

  const handleParsePastedRawText = async () => {
    const raw = (formData.resumeRawText || '').trim();
    if (!raw) {
      setSaveError('Please paste your resume raw text before analyzing.');
      return;
    }
    setSaveError(null);
    setSaveSuccess(false);
    setIsParsingPasted(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const targetFileName = formData.resumeFileName || 'Pasted_Resume.txt';
      const res = await fetch('/api/candidates/resume', {
        method: 'POST',
        headers,
        body: JSON.stringify({ rawText: raw, fileName: targetFileName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to analyze pasted resume text.');
      }
      if (data.parsed) {
        handleResumeParsed(data.parsed, {
          rawText: raw,
          fileName: targetFileName,
          profile: data.profile,
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Error analyzing pasted resume.');
    } finally {
      setIsParsingPasted(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar for My Resume */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">My Resume</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Upload, parse, and optimize your resume for ATS scoring and AI job matching.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenATSModal && (
            <button
              type="button"
              onClick={handleCheckAddedResumeATS}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors shadow-2xs space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Free ATS Checker</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveResume}
            disabled={isSaving}
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSaving ? 'Saving Resume...' : 'Save Resume'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Resume changes saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Resume Upload & NLP extraction */}
      <ResumeUploader
        currentParsed={formData.parsedResumeData}
        currentFileName={formData.resumeFileName}
        currentRawText={formData.resumeRawText}
        onRemoveResume={() => {
          const cleared: CandidateProfile = {
            ...formData,
            resumeFileName: '',
            resumeRawText: '',
            parsedResumeData: undefined,
          };
          setFormData(cleared);
          onUpdateProfile(cleared);
          const token = getAuthToken();
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers.Authorization = `Bearer ${token}`;
          void fetch('/api/candidates/profile', {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              resumeFileName: '',
              resumeRawText: '',
              parsedResumeData: null,
            }),
          }).catch(() => {});
        }}
        onParsedSuccess={handleResumeParsed}
      />

      {/* Integrated Free ATS Checker Section for the resume added in My Resume */}
      {onOpenATSModal && (
        <div className="bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/50 dark:from-emerald-950/30 dark:via-neutral-900 dark:to-emerald-950/20 rounded-3xl border border-emerald-200/90 dark:border-emerald-800/70 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Free ATS Resume Checker & Score Analyzer
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                  {hasAddedResume
                    ? `Ready: ${formData.resumeFileName || 'Resume Text'} (${wordCount} words)`
                    : 'Waiting for resume'}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                {hasAddedResume
                  ? 'Scan the resume you added in My Resume for ATS keyword gaps, formatting issues, impact score, and instant AI rewrite.'
                  : 'Upload a resume above or paste your resume text below, then run the ATS compatibility scan directly from here.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckAddedResumeATS}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs space-x-1.5 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{hasAddedResume ? 'Check Added Resume (ATS)' : 'Open Free ATS Checker'}</span>
          </button>
        </div>
      )}

      {/* Stored Resume Summary / Paste Resume Raw Text Here */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 shadow-xs space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <span className="font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 block">
              Paste Resume Raw Text Here
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Paste or edit your full resume text directly below, then analyze &amp; save or run an ATS check.
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>{formData.resumeFileName || 'Pasted_Resume.txt'}</span>
            <span>•</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {wordCount} words
            </span>
          </div>
        </div>
        <textarea
          rows={10}
          value={formData.resumeRawText || ''}
          onChange={(e) => setFormData({ ...formData, resumeRawText: e.target.value })}
          placeholder="Paste your complete resume raw text here (Name, Contact, Summary, Experience, Skills, Education)..."
          className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono text-[11px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div>
            {formData.resumeRawText?.trim() && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, resumeRawText: '' })}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Clear Text
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onOpenATSModal && (
              <button
                type="button"
                onClick={handleCheckAddedResumeATS}
                disabled={!formData.resumeRawText?.trim()}
                className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors disabled:opacity-50 cursor-pointer space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Check ATS Score</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleParsePastedRawText}
              disabled={isParsingPasted || !formData.resumeRawText?.trim()}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 transition-colors shadow-xs disabled:opacity-50 cursor-pointer space-x-1.5"
            >
              {isParsingPasted ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing &amp; Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Analyze &amp; Save Pasted Resume</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
