import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserType,
  RecruiterProfile,
  CandidateProfile,
  ExperienceItem,
  EducationItem,
  ProjectItem,
} from '../types.ts';
import { getAuthToken } from '../utils/authToken.ts';
import {
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Github,
  Linkedin,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Plus,
  Trash2,
  Camera,
} from 'lucide-react';

interface UserProfileViewProps {
  currentUser: UserType;
  onUpdateUser: (updated: UserType) => void;
  candidateProfile?: CandidateProfile | null;
  onUpdateCandidateProfile?: (updated: CandidateProfile) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  candidateProfile,
  onUpdateCandidateProfile,
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');

  // Candidate profile state (user details only — no resume)
  const [candForm, setCandForm] = useState<CandidateProfile | null>(
    candidateProfile || null
  );
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  // Recruiter state
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyAbout, setCompanyAbout] = useState('');

  // Admin state
  const [organization, setOrganization] = useState(currentUser.adminDetails?.organization || '');
  const [department, setDepartment] = useState(currentUser.adminDetails?.department || '');
  const [adminTitle, setAdminTitle] = useState(currentUser.adminDetails?.adminTitle || '');
  const [governanceScope, setGovernanceScope] = useState(
    (currentUser.adminDetails?.governanceScope || []).join(', ')
  );

  const [loading, setLoading] = useState(currentUser.role === 'recruiter');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSaveError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }
    setSaveError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        try {
          const maxSide = 320;
          const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setAvatar(compressed);
            return;
          }
        } catch {
          // Fallback to original data URL if canvas compression is unavailable
        }
        setAvatar(result);
      };
      img.onerror = () => setAvatar(result);
      img.src = result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setAvatar(currentUser.avatar || '');
    setOrganization(currentUser.adminDetails?.organization || '');
    setDepartment(currentUser.adminDetails?.department || '');
    setAdminTitle(currentUser.adminDetails?.adminTitle || '');
    setGovernanceScope((currentUser.adminDetails?.governanceScope || []).join(', '));
  }, [currentUser]);

  useEffect(() => {
    if (candidateProfile) {
      setCandForm({
        ...candidateProfile,
        education: Array.isArray(candidateProfile.education) ? candidateProfile.education : [],
        skills: Array.isArray(candidateProfile.skills) ? candidateProfile.skills : [],
        experience: Array.isArray(candidateProfile.experience) ? candidateProfile.experience : [],
        projects: Array.isArray(candidateProfile.projects) ? candidateProfile.projects : [],
        certifications: Array.isArray(candidateProfile.certifications) ? candidateProfile.certifications : [],
        links: candidateProfile.links || {},
      });
    }
  }, [candidateProfile]);

  useEffect(() => {
    if (currentUser.role !== 'recruiter') {
      setLoading(false);
      return;
    }
    let active = true;
    async function loadRecruiterProfile() {
      try {
        const token = getAuthToken();
        const res = await fetch('/api/auth/profile', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        const rec: RecruiterProfile | null = data.recruiterProfile || null;
        if (rec) {
          setCompanyName(rec.companyName || '');
          setDesignation(rec.designation || '');
          setIndustry(rec.companyDetails?.industry || '');
          setCompanySize(rec.companyDetails?.size || '');
          setWebsite(rec.companyDetails?.website || '');
          setCompanyLocation(rec.companyDetails?.location || '');
          setCompanyAbout(rec.companyDetails?.about || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadRecruiterProfile();
    return () => {
      active = false;
    };
  }, [currentUser.id, currentUser.role]);

  const handleAddSkill = () => {
    if (!candForm) return;
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (!candForm.skills.includes(trimmed)) {
      setCandForm({ ...candForm, skills: [...candForm.skills, trimmed] });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    if (!candForm) return;
    setCandForm({ ...candForm, skills: candForm.skills.filter((s) => s !== skill) });
  };

  const handleAddCert = () => {
    if (!candForm) return;
    const trimmed = newCert.trim();
    if (!trimmed) return;
    if (!candForm.certifications.includes(trimmed)) {
      setCandForm({ ...candForm, certifications: [...candForm.certifications, trimmed] });
    }
    setNewCert('');
  };

  const handleRemoveCert = (cert: string) => {
    if (!candForm) return;
    setCandForm({ ...candForm, certifications: candForm.certifications.filter((c) => c !== cert) });
  };

  const handleAddExperience = () => {
    if (!candForm) return;
    const item: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      skillsUsed: [],
    };
    setCandForm({ ...candForm, experience: [...candForm.experience, item] });
  };

  const handleUpdateExperience = (idx: number, patch: Partial<ExperienceItem>) => {
    if (!candForm) return;
    setCandForm({
      ...candForm,
      experience: candForm.experience.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    });
  };

  const handleRemoveExperience = (idx: number) => {
    if (!candForm) return;
    setCandForm({
      ...candForm,
      experience: candForm.experience.filter((_, i) => i !== idx),
    });
  };

  const handleAddEducation = () => {
    if (!candForm) return;
    const item: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: '',
      endYear: '',
      gpa: '',
    };
    setCandForm({ ...candForm, education: [...candForm.education, item] });
  };

  const handleUpdateEducation = (idx: number, patch: Partial<EducationItem>) => {
    if (!candForm) return;
    setCandForm({
      ...candForm,
      education: candForm.education.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    });
  };

  const handleRemoveEducation = (idx: number) => {
    if (!candForm) return;
    setCandForm({
      ...candForm,
      education: candForm.education.filter((_, i) => i !== idx),
    });
  };

  const handleAddProject = () => {
    if (!candForm) return;
    const item: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: '',
      description: '',
      technologies: [],
      link: '',
    };
    setCandForm({ ...candForm, projects: [...candForm.projects, item] });
  };

  const handleUpdateProject = (idx: number, patch: Partial<ProjectItem>) => {
    if (!candForm) return;
    setCandForm({
      ...candForm,
      projects: candForm.projects.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    });
  };

  const handleRemoveProject = (idx: number) => {
    if (!candForm) return;
    setCandForm({
      ...candForm,
      projects: candForm.projects.filter((_, i) => i !== idx),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    if (!name.trim()) {
      setSaveError('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setSaveError('Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const payload: Record<string, any> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: avatar.trim(),
      };

      if (currentUser.role === 'recruiter') {
        payload.recruiterProfile = {
          companyName: companyName.trim(),
          designation: designation.trim(),
          companyDetails: {
            industry: industry.trim(),
            size: companySize.trim(),
            website: website.trim(),
            location: companyLocation.trim(),
            about: companyAbout.trim(),
          },
        };
      } else if (currentUser.role === 'admin') {
        payload.adminDetails = {
          organization: organization.trim(),
          department: department.trim(),
          adminTitle: adminTitle.trim(),
          governanceScope: governanceScope
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        };
      }

      const userRes = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      const userData = await userRes.json().catch(() => ({}));
      if (!userRes.ok) {
        throw new Error(userData.error || 'Failed to save user details.');
      }

      if (currentUser.role === 'candidate' && candForm) {
        // Send user profile details only (preserve resume fields on backend)
        const {
          resumeUrl: _rUrl,
          resumeFileName: _rFile,
          resumeRawText: _rRaw,
          parsedResumeData: _rParsed,
          ...candidateUserDetails
        } = candForm;

        const candRes = await fetch('/api/candidates/profile', {
          method: 'PUT',
          headers,
          body: JSON.stringify(candidateUserDetails),
        });
        const candData = await candRes.json().catch(() => ({}));
        if (!candRes.ok) {
          throw new Error(candData.error || 'Failed to save candidate details.');
        }
        if (candData.profile && onUpdateCandidateProfile) {
          onUpdateCandidateProfile(candData.profile);
        }
      }

      if (userData.user) {
        onUpdateUser(userData.user);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Error saving profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-10 flex items-center justify-center space-x-2 text-xs text-neutral-500">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
        <span>Loading profile details...</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 md:p-8 shadow-xs space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-neutral-100 dark:border-neutral-800 gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={
              avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            }
            alt={name || 'User avatar'}
            onClick={() => photoInputRef.current?.click()}
            title="Click to upload your photo"
            className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
          />
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                User Profile
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 capitalize">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              View and update all of your user information and personal details.
            </p>
            <div className="flex items-center space-x-3 mt-1.5">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Camera className="w-3 h-3" />
                <span>{avatar ? 'Change Photo' : 'Add Photo'}</span>
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="text-[11px] font-semibold text-neutral-500 hover:text-rose-500 cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-emerald-500 hover:bg-neutral-800 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Profile details saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Account Fields */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Account Information</span>
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
              ID: {currentUser.id}
            </span>
            <span className="inline-flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="capitalize">Status: {currentUser.status}</span>
            </span>
            {currentUser.createdAt && (
              <span className="inline-flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {new Date(currentUser.createdAt).toLocaleDateString()}</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="text"
              value={avatar.startsWith('data:image/') ? '' : avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder={avatar.startsWith('data:image/') ? 'Uploaded custom photo (or paste URL)' : 'https://...'}
              className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Candidate User Details (No Resume section here — Resume lives in My Resume) */}
      {currentUser.role === 'candidate' && candForm && (
        <>
          {/* Professional Overview & Contact */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Personal & Career Overview</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={candForm.headline}
                  onChange={(e) => setCandForm({ ...candForm, headline: e.target.value })}
                  placeholder="e.g. Full-Stack Engineer | React & Node.js"
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Years of Professional Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={candForm.yearsOfExperience}
                  onChange={(e) =>
                    setCandForm({ ...candForm, yearsOfExperience: Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Current Location / City
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={candForm.location}
                    onChange={(e) => setCandForm({ ...candForm, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Direct Phone
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={candForm.phone}
                    onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Bio & Career Summary
                </label>
                <textarea
                  rows={3}
                  value={candForm.bio}
                  onChange={(e) => setCandForm({ ...candForm, bio: e.target.value })}
                  placeholder="Summarize your background, focus areas, and career goals..."
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Career Track */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Experience Track & Career Preferences</span>
              </h3>
              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCandForm({ ...candForm, experienceTrack: 'fresher' })}
                  className={`px-3 py-1 rounded-lg font-semibold border cursor-pointer transition-colors ${
                    candForm.experienceTrack === 'fresher'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  Fresher / Graduate
                </button>
                <button
                  type="button"
                  onClick={() => setCandForm({ ...candForm, experienceTrack: 'experienced' })}
                  className={`px-3 py-1 rounded-lg font-semibold border cursor-pointer transition-colors ${
                    candForm.experienceTrack === 'experienced'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  Experienced Professional
                </button>
              </div>
            </div>

            {candForm.experienceTrack === 'fresher' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={candForm.fresherDetails?.collegeName || ''}
                    onChange={(e) =>
                      setCandForm({
                        ...candForm,
                        fresherDetails: {
                          collegeName: e.target.value,
                          degree: candForm.fresherDetails?.degree || 'Bachelor of Science',
                          fieldOfStudy: candForm.fresherDetails?.fieldOfStudy || 'Computer Science',
                          graduationYear: candForm.fresherDetails?.graduationYear || '2025',
                          targetRole: candForm.fresherDetails?.targetRole || 'Graduate Software Engineer',
                          primarySkills: candForm.fresherDetails?.primarySkills || [],
                          coreCoursework: candForm.fresherDetails?.coreCoursework || [],
                          immediateGoal: candForm.fresherDetails?.immediateGoal || 'campus_placements',
                          finalYearProjectTitle: candForm.fresherDetails?.finalYearProjectTitle || '',
                          finalYearProjectSummary: candForm.fresherDetails?.finalYearProjectSummary || '',
                        },
                      })
                    }
                    placeholder="University name"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Target Entry-Level Role
                  </label>
                  <input
                    type="text"
                    value={candForm.fresherDetails?.targetRole || ''}
                    onChange={(e) =>
                      setCandForm({
                        ...candForm,
                        fresherDetails: {
                          collegeName: candForm.fresherDetails?.collegeName || '',
                          degree: candForm.fresherDetails?.degree || 'Bachelor of Science',
                          fieldOfStudy: candForm.fresherDetails?.fieldOfStudy || 'Computer Science',
                          graduationYear: candForm.fresherDetails?.graduationYear || '2025',
                          targetRole: e.target.value,
                          primarySkills: candForm.fresherDetails?.primarySkills || [],
                          coreCoursework: candForm.fresherDetails?.coreCoursework || [],
                          immediateGoal: candForm.fresherDetails?.immediateGoal || 'campus_placements',
                          finalYearProjectTitle: candForm.fresherDetails?.finalYearProjectTitle || '',
                          finalYearProjectSummary: candForm.fresherDetails?.finalYearProjectSummary || '',
                        },
                      })
                    }
                    placeholder="Graduate Software Engineer"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    value={candForm.fresherDetails?.graduationYear || ''}
                    onChange={(e) =>
                      setCandForm({
                        ...candForm,
                        fresherDetails: {
                          collegeName: candForm.fresherDetails?.collegeName || '',
                          degree: candForm.fresherDetails?.degree || 'Bachelor of Science',
                          fieldOfStudy: candForm.fresherDetails?.fieldOfStudy || 'Computer Science',
                          graduationYear: e.target.value,
                          targetRole: candForm.fresherDetails?.targetRole || 'Graduate Software Engineer',
                          primarySkills: candForm.fresherDetails?.primarySkills || [],
                          coreCoursework: candForm.fresherDetails?.coreCoursework || [],
                          immediateGoal: candForm.fresherDetails?.immediateGoal || 'campus_placements',
                          finalYearProjectTitle: candForm.fresherDetails?.finalYearProjectTitle || '',
                          finalYearProjectSummary: candForm.fresherDetails?.finalYearProjectSummary || '',
                        },
                      })
                    }
                    placeholder="2025"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Current / Latest Role
                  </label>
                  <input
                    type="text"
                    value={candForm.experiencedDetails?.currentRole || ''}
                    onChange={(e) =>
                      setCandForm({
                        ...candForm,
                        experiencedDetails: {
                          currentRole: e.target.value,
                          currentCompany: candForm.experiencedDetails?.currentCompany || '',
                          totalYears: candForm.experiencedDetails?.totalYears || candForm.yearsOfExperience || 3,
                          domain: candForm.experiencedDetails?.domain || 'Full-Stack Architecture',
                          targetSeniority: candForm.experiencedDetails?.targetSeniority || 'Senior',
                          primaryTechStack: candForm.experiencedDetails?.primaryTechStack || [],
                          systemArchitectureFocus: candForm.experiencedDetails?.systemArchitectureFocus || [],
                          notableAchievement: candForm.experiencedDetails?.notableAchievement || '',
                          interviewPrepFocus: candForm.experiencedDetails?.interviewPrepFocus || 'system_design',
                        },
                      })
                    }
                    placeholder="Senior Software Engineer"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Current / Past Company
                  </label>
                  <input
                    type="text"
                    value={candForm.experiencedDetails?.currentCompany || ''}
                    onChange={(e) =>
                      setCandForm({
                        ...candForm,
                        experiencedDetails: {
                          currentRole: candForm.experiencedDetails?.currentRole || '',
                          currentCompany: e.target.value,
                          totalYears: candForm.experiencedDetails?.totalYears || candForm.yearsOfExperience || 3,
                          domain: candForm.experiencedDetails?.domain || 'Full-Stack Architecture',
                          targetSeniority: candForm.experiencedDetails?.targetSeniority || 'Senior',
                          primaryTechStack: candForm.experiencedDetails?.primaryTechStack || [],
                          systemArchitectureFocus: candForm.experiencedDetails?.systemArchitectureFocus || [],
                          notableAchievement: candForm.experiencedDetails?.notableAchievement || '',
                          interviewPrepFocus: candForm.experiencedDetails?.interviewPrepFocus || 'system_design',
                        },
                      })
                    }
                    placeholder="Company Name"
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Target Seniority
                  </label>
                  <select
                    value={candForm.experiencedDetails?.targetSeniority || 'Senior'}
                    onChange={(e) =>
                      setCandForm({
                        ...candForm,
                        experiencedDetails: {
                          currentRole: candForm.experiencedDetails?.currentRole || '',
                          currentCompany: candForm.experiencedDetails?.currentCompany || '',
                          totalYears: candForm.experiencedDetails?.totalYears || candForm.yearsOfExperience || 3,
                          domain: candForm.experiencedDetails?.domain || 'Full-Stack Architecture',
                          targetSeniority: e.target.value as any,
                          primaryTechStack: candForm.experiencedDetails?.primaryTechStack || [],
                          systemArchitectureFocus: candForm.experiencedDetails?.systemArchitectureFocus || [],
                          notableAchievement: candForm.experiencedDetails?.notableAchievement || '',
                          interviewPrepFocus: candForm.experiencedDetails?.interviewPrepFocus || 'system_design',
                        },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Staff / Principal">Staff / Principal</option>
                    <option value="Lead / Engineering Manager">Lead / Engineering Manager</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Social & Portfolio Links */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Social & Portfolio Links</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  GitHub URL
                </label>
                <div className="relative">
                  <Github className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="url"
                    value={candForm.links?.github || ''}
                    onChange={(e) =>
                      setCandForm({ ...candForm, links: { ...candForm.links, github: e.target.value } })
                    }
                    placeholder="https://github.com/username"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <Linkedin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="url"
                    value={candForm.links?.linkedin || ''}
                    onChange={(e) =>
                      setCandForm({ ...candForm, links: { ...candForm.links, linkedin: e.target.value } })
                    }
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  Portfolio / Website URL
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="url"
                    value={candForm.links?.portfolio || ''}
                    onChange={(e) =>
                      setCandForm({ ...candForm, links: { ...candForm.links, portfolio: e.target.value } })
                    }
                    placeholder="https://yourportfolio.dev"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
            <label className="font-bold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider block mb-2.5">
              Technical Skills ({candForm.skills.length})
            </label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add skill (e.g. TypeScript, Docker, Redis)..."
                className="text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3.5 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-semibold flex items-center cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {candForm.skills.length > 0 ? (
                candForm.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1.5 text-neutral-400 hover:text-rose-500 cursor-pointer"
                      aria-label={`Remove ${skill}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-400">No skills added yet.</span>
              )}
            </div>
          </div>

          {/* Work Experience */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                Work Experience ({candForm.experience.length})
              </label>
              <button
                type="button"
                onClick={handleAddExperience}
                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Experience
              </button>
            </div>

            {candForm.experience.length > 0 ? (
              <div className="space-y-3">
                {candForm.experience.map((exp, i) => (
                  <div
                    key={exp.id || i}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-700 dark:text-neutral-300">
                        Role #{i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(i)}
                        className="text-neutral-400 hover:text-rose-500 flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(i, { role: e.target.value })}
                        placeholder="Job Title / Role"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(i, { company: e.target.value })}
                        placeholder="Company Name"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => handleUpdateExperience(i, { location: e.target.value })}
                        placeholder="Location (optional)"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperience(i, { startDate: e.target.value })}
                        placeholder="Start Date (e.g. Jan 2022)"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={exp.current ? 'Present' : exp.endDate}
                        disabled={exp.current}
                        onChange={(e) => handleUpdateExperience(i, { endDate: e.target.value })}
                        placeholder="End Date (e.g. Dec 2024)"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white disabled:opacity-60"
                      />
                      <label className="flex items-center space-x-2 text-neutral-700 dark:text-neutral-300 px-2">
                        <input
                          type="checkbox"
                          checked={Boolean(exp.current)}
                          onChange={(e) =>
                            handleUpdateExperience(i, {
                              current: e.target.checked,
                              endDate: e.target.checked ? 'Present' : '',
                            })
                          }
                          className="rounded accent-emerald-600"
                        />
                        <span>Currently working here</span>
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => handleUpdateExperience(i, { description: e.target.value })}
                      placeholder="Key responsibilities and achievements..."
                      className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No work experience added yet.</p>
            )}
          </div>

          {/* Education */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                Education & Degrees ({candForm.education.length})
              </label>
              <button
                type="button"
                onClick={handleAddEducation}
                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Education
              </button>
            </div>

            {candForm.education.length > 0 ? (
              <div className="space-y-3">
                {candForm.education.map((edu, i) => (
                  <div
                    key={edu.id || i}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-700 dark:text-neutral-300">
                        Education #{i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(i)}
                        className="text-neutral-400 hover:text-rose-500 flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(i, { institution: e.target.value })}
                        placeholder="University / College"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(i, { degree: e.target.value })}
                        placeholder="Degree (e.g. B.Tech / B.S.)"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleUpdateEducation(i, { fieldOfStudy: e.target.value })}
                        placeholder="Field of Study (e.g. Computer Science)"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={edu.startYear}
                        onChange={(e) => handleUpdateEducation(i, { startYear: e.target.value })}
                        placeholder="Start Year (e.g. 2021)"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={edu.endYear}
                        onChange={(e) => handleUpdateEducation(i, { endYear: e.target.value })}
                        placeholder="Graduation Year (e.g. 2025)"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={edu.gpa || ''}
                        onChange={(e) => handleUpdateEducation(i, { gpa: e.target.value })}
                        placeholder="GPA / Percentage (optional)"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No education entries added yet.</p>
            )}
          </div>

          {/* Projects */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Projects ({candForm.projects.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddProject}
                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
              </button>
            </div>

            {candForm.projects.length > 0 ? (
              <div className="space-y-3">
                {candForm.projects.map((proj, i) => (
                  <div
                    key={proj.id || i}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-700 dark:text-neutral-300">
                        Project #{i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(i)}
                        className="text-neutral-400 hover:text-rose-500 flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleUpdateProject(i, { title: e.target.value })}
                        placeholder="Project Title"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                      <input
                        type="url"
                        value={proj.link || ''}
                        onChange={(e) => handleUpdateProject(i, { link: e.target.value })}
                        placeholder="GitHub / Live Demo URL (optional)"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={(proj.technologies || []).join(', ')}
                      onChange={(e) =>
                        handleUpdateProject(i, {
                          technologies: e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Technologies (comma-separated)"
                      className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => handleUpdateProject(i, { description: e.target.value })}
                      placeholder="Project summary and outcomes..."
                      className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No projects added yet.</p>
            )}
          </div>

          {/* Certifications */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <label className="font-bold text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Certifications ({candForm.certifications.length})</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCert())}
                placeholder="Add certification (e.g. AWS Solutions Architect)"
                className="w-full max-w-sm text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCert}
                className="px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {candForm.certifications.length > 0 ? (
                candForm.certifications.map((cert, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(cert)}
                      className="ml-1.5 text-emerald-600/70 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-400">No certifications added yet.</span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Recruiter Company Info */}
      {currentUser.role === 'recruiter' && (
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Recruiter & Company Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="CloudScale AI"
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Designation / Title
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Lead Technical Recruiter"
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="AI & Cloud Infrastructure"
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Company Size
              </label>
              <input
                type="text"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                placeholder="50-250 employees"
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Website
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.ai"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={companyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                About Company
              </label>
              <textarea
                rows={3}
                value={companyAbout}
                onChange={(e) => setCompanyAbout(e.target.value)}
                placeholder="Describe your company mission, stack, and hiring culture..."
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Admin Governance Details */}
      {currentUser.role === 'admin' && (
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>Administrator Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Organization
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="TalentPulse Governance"
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Trust & AI Ethics"
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Admin Title
              </label>
              <input
                type="text"
                value={adminTitle}
                onChange={(e) => setAdminTitle(e.target.value)}
                placeholder="Platform Administrator"
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-3">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                Governance Scope (comma-separated)
              </label>
              <input
                type="text"
                value={governanceScope}
                onChange={(e) => setGovernanceScope(e.target.value)}
                placeholder="Fairness Audits, User Access Control, Model Telemetry"
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
