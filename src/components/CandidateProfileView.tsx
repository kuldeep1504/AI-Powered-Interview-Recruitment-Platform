import React, { useState } from 'react';
import { CandidateProfile, AIParsedResume } from '../types.ts';
import { ResumeUploader } from './ResumeUploader.tsx';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Globe,
  Github,
  Linkedin,
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
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleResumeParsed = (parsed: AIParsedResume) => {
    const flatSkills = [
      ...(parsed.skills.languages || []),
      ...(parsed.skills.frameworks || []),
      ...(parsed.skills.toolsAndDatabases || []),
    ];

    const merged: CandidateProfile = {
      ...formData,
      headline: parsed.headline || formData.headline,
      bio: parsed.summary || formData.bio,
      yearsOfExperience: parsed.yearsOfExperience || formData.yearsOfExperience,
      resumeFileName: 'Uploaded_Resume.pdf',
      parsedResumeData: parsed,
      skills: Array.from(new Set([...formData.skills, ...flatSkills])),
      education: parsed.education?.length ? parsed.education : formData.education,
      experience: parsed.experience?.length ? parsed.experience : formData.experience,
      updatedAt: new Date().toISOString(),
    };

    setFormData(merged);
    onUpdateProfile(merged);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/candidates/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      const data = await res.json();
      onUpdateProfile(data.profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e: any) {
      alert(e.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Resume Upload & NLP extraction at the top */}
      <ResumeUploader
        currentParsed={formData.parsedResumeData}
        onParsedSuccess={handleResumeParsed}
      />

      {/* Profile Form Details */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Candidate Profile & Technical Credentials</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Keep your profile updated for accurate semantic matching with open roles.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            {onOpenATSModal && (
              <button
                type="button"
                onClick={onOpenATSModal}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors shadow-2xs space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Run Free ATS Check</span>
              </button>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition-colors shadow-xs"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile details saved successfully!</span>
          </div>
        )}

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-700 block mb-1.5">Professional Headline</label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1.5">Years of Professional Experience</label>
            <input
              type="number"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1.5">Current Location / City</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1.5">Direct Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-neutral-700 block mb-1.5">Executive Bio & Career Summary</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-3 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Skills Tag Cloud */}
        <div className="pt-4 border-t border-neutral-100">
          <label className="font-semibold text-neutral-700 text-xs block mb-2">Technical Skills & Tooling</label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add skill (e.g. WebRTC, Docker, Redis)..."
              className="text-xs p-2 rounded-xl border border-neutral-200 w-64 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <button
              onClick={handleAddSkill}
              className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1.5 text-neutral-400 hover:text-neutral-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-neutral-700 text-xs uppercase tracking-wider">
              Experience History
            </label>
          </div>
          <div className="space-y-3">
            {formData.experience.map((exp, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                <div className="font-bold text-neutral-900">{exp.role} @ {exp.company}</div>
                <div className="text-neutral-500 mt-0.5">{exp.duration}</div>
                {exp.highlights && exp.highlights[0] && (
                  <p className="text-neutral-600 mt-1.5 leading-relaxed">• {exp.highlights[0]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education Details */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <label className="font-semibold text-neutral-700 text-xs uppercase tracking-wider">
            Education & Degrees
          </label>
          <div className="space-y-2">
            {formData.education.map((edu, i) => (
              <div key={i} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs flex justify-between">
                <div>
                  <span className="font-bold text-neutral-900">{edu.degree} in {edu.field}</span>
                  <div className="text-neutral-500">{edu.institution}</div>
                </div>
                <span className="text-neutral-500">{edu.graduationYear}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
