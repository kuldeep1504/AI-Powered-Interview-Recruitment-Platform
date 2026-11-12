import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import {
  parseResumeWithAI,
  analyzeJobWithAI,
  computeMatchScoreWithAI,
  generateInterviewQuestionsWithAI,
  evaluateAnswerWithAI,
  summarizeInterviewWithAI,
  analyzeResumeATSScoreWithAI,
  correctAndOptimizeResumeWithAI,
  extractTextFromFileWithAI,
} from './server/gemini.ts';
import { Job, CandidateProfile, Application, Interview, InterviewResult } from './src/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Helper middleware for session/role simulation
  app.use((req, res, next) => {
    // Check Authorization header or default to first user
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const user = db.getUserById(token) || db.getUserByEmail(token);
      if (user) {
        (req as any).currentUser = user;
      }
    }
    next();
  });

  // Health check & Database Status
  app.get('/api/health', (req, res) => {
    const { isMongoConnected } = require('./server/mongodb.ts');
    res.json({
      status: 'ok',
      database: {
        engine: isMongoConnected() ? 'MongoDB' : 'Local Document Store (MongoDB Fallback)',
        isMongoConnected: isMongoConnected(),
        storageTarget: isMongoConnected() ? (process.env.MONGODB_DB_NAME || 'talentpulse_db') : 'server/data.json',
      },
      time: new Date().toISOString(),
    });
  });

  // ---------------- AUTH API ----------------
  app.post('/api/auth/register', (req, res) => {
    const { name, email, role, password } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required.' });
    }
    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    const newUser = db.createUser({
      id: `usr-${Date.now()}`,
      name,
      email,
      role: role === 'recruiter' ? 'recruiter' : role === 'admin' ? 'admin' : 'candidate',
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    });

    if (newUser.role === 'candidate') {
      db.upsertCandidate({
        id: `cand-${Date.now()}`,
        userId: newUser.id,
        headline: 'Candidate',
        bio: '',
        location: '',
        phone: '',
        yearsOfExperience: 0,
        education: [],
        skills: [],
        experience: [],
        projects: [],
        certifications: [],
        links: {},
        onboardingCompleted: false,
        updatedAt: new Date().toISOString(),
      });
    } else if (newUser.role === 'recruiter') {
      db.upsertRecruiter({
        id: `rec-${Date.now()}`,
        userId: newUser.id,
        companyName: 'Company Inc.',
        designation: 'Hiring Manager',
        companyDetails: {
          industry: 'Technology',
          size: '50-100',
          website: '',
          location: '',
          about: '',
        },
        updatedAt: new Date().toISOString(),
      });
    }

    res.status(201).json({ user: newUser, token: newUser.id });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found with that email address.' });
    }
    res.json({ user, token: user.id });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = (req as any).currentUser || db.getUsers()[0];
    res.json({ user });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // ---------------- CANDIDATE API ----------------
  app.get('/api/candidates/profile', (req, res) => {
    const user = (req as any).currentUser || db.getUsers().find((u) => u.role === 'candidate');
    if (!user) return res.status(404).json({ error: 'Candidate not found' });
    let profile = db.getCandidateByUserId(user.id);
    if (!profile) {
      profile = db.getCandidates()[0];
    }
    res.json({ profile, user });
  });

  app.put('/api/candidates/profile', (req, res) => {
    const user = (req as any).currentUser || db.getUsers().find((u) => u.role === 'candidate');
    if (!user) return res.status(403).json({ error: 'Not authenticated' });
    let existing = db.getCandidateByUserId(user.id);
    const updated = db.upsertCandidate({
      ...(existing || {
        id: `cand-${Date.now()}`,
        userId: user.id,
        education: [],
        skills: [],
        experience: [],
        projects: [],
        certifications: [],
        links: {},
        updatedAt: new Date().toISOString(),
      }),
      ...req.body,
      userId: user.id,
    });
    res.json({ profile: updated });
  });

  app.post('/api/candidates/onboarding', (req, res) => {
    const user = (req as any).currentUser || db.getUsers().find((u) => u.role === 'candidate');
    if (!user) return res.status(403).json({ error: 'Not authenticated' });
    let existing = db.getCandidateByUserId(user.id);
    const { experienceTrack, fresherDetails, experiencedDetails } = req.body;

    const baseProfile: CandidateProfile = existing || {
      id: `cand-${Date.now()}`,
      userId: user.id,
      headline: '',
      bio: '',
      location: '',
      phone: '',
      yearsOfExperience: 0,
      education: [],
      skills: [],
      experience: [],
      projects: [],
      certifications: [],
      links: {},
      experienceTrack: 'fresher',
      onboardingCompleted: false,
      updatedAt: new Date().toISOString(),
    };

    let headline = baseProfile.headline;
    let bio = baseProfile.bio;
    let yearsOfExperience = baseProfile.yearsOfExperience;
    let skills = [...baseProfile.skills];
    let education = [...baseProfile.education];

    if (experienceTrack === 'fresher' && fresherDetails) {
      yearsOfExperience = 0;
      headline = `${fresherDetails.targetRole || 'Aspiring Software Engineer'} | ${fresherDetails.degree || 'CS Graduate'} (${fresherDetails.graduationYear || '2025'})`;
      bio = `Motivated graduate from ${fresherDetails.collegeName || 'University'} specializing in ${fresherDetails.fieldOfStudy || 'Computer Science'}. Preparing for entry-level tech roles with solid fundamentals in DSA, OOP, and modern software development.`;
      if (fresherDetails.primarySkills && fresherDetails.primarySkills.length > 0) {
        skills = Array.from(new Set([...skills, ...fresherDetails.primarySkills]));
      }
      if (fresherDetails.collegeName && education.length === 0) {
        education.push({
          id: `edu-${Date.now()}`,
          institution: fresherDetails.collegeName,
          degree: fresherDetails.degree || 'Bachelor of Science',
          fieldOfStudy: fresherDetails.fieldOfStudy || 'Computer Science',
          startYear: String(parseInt(fresherDetails.graduationYear || '2025') - 4),
          endYear: fresherDetails.graduationYear || '2025',
        });
      }
    } else if (experienceTrack === 'experienced' && experiencedDetails) {
      yearsOfExperience = Number(experiencedDetails.totalYears) || 3;
      headline = `${experiencedDetails.currentRole || 'Software Engineer'} | ${experiencedDetails.domain || 'Full-Stack'} (${yearsOfExperience}+ Years Experience)`;
      bio = `${experiencedDetails.totalYears}+ years experienced professional at ${experiencedDetails.currentCompany || 'Tech'}. Specializing in ${experiencedDetails.domain || 'Software Engineering'} and targeting ${experiencedDetails.targetSeniority || 'Senior'} positions.`;
      if (experiencedDetails.primaryTechStack && experiencedDetails.primaryTechStack.length > 0) {
        skills = Array.from(new Set([...skills, ...experiencedDetails.primaryTechStack]));
      }
    }

    const updated = db.upsertCandidate({
      ...baseProfile,
      headline,
      bio,
      yearsOfExperience,
      skills,
      education,
      experienceTrack,
      fresherDetails: experienceTrack === 'fresher' ? fresherDetails : baseProfile.fresherDetails,
      experiencedDetails: experienceTrack === 'experienced' ? experiencedDetails : baseProfile.experiencedDetails,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });

    res.json({ profile: updated });
  });

  app.post('/api/candidates/resume', async (req, res) => {
    try {
      const { rawText, fileName } = req.body;
      if (!rawText) {
        return res.status(400).json({ error: 'Resume raw text is required.' });
      }
      const user = (req as any).currentUser || db.getUsers().find((u) => u.role === 'candidate');
      const parsed = await parseResumeWithAI(rawText);

      // Merge into candidate profile
      if (user) {
        const existing = db.getCandidateByUserId(user.id) || db.getCandidates()[0];
        const flatSkills = [
          ...(parsed.skills.languages || []),
          ...(parsed.skills.frameworks || []),
          ...(parsed.skills.toolsAndDatabases || []),
        ];

        const updatedProfile = db.upsertCandidate({
          ...existing,
          headline: parsed.headline || existing.headline,
          bio: parsed.summary || existing.bio,
          resumeFileName: fileName || 'Uploaded_Resume.pdf',
          resumeRawText: rawText,
          parsedResumeData: parsed,
          skills: Array.from(new Set([...existing.skills, ...flatSkills])),
          updatedAt: new Date().toISOString(),
        });

        return res.json({ parsed, profile: updatedProfile });
      }

      res.json({ parsed });
    } catch (err: any) {
      console.error('Resume upload error:', err);
      res.status(500).json({ error: 'Failed to process resume', details: err.message });
    }
  });

  app.get('/api/candidates/applications', (req, res) => {
    const user = (req as any).currentUser || db.getUsers().find((u) => u.role === 'candidate');
    const profile = user ? db.getCandidateByUserId(user.id) : db.getCandidates()[0];
    const candidateId = profile ? profile.id : 'cand-1';
    const applications = db.getApplicationsByCandidateId(candidateId);
    res.json({ applications });
  });

  // ---------------- JOBS API ----------------
  app.get('/api/jobs', (req, res) => {
    const { search, remote, type, status } = req.query;
    let jobs = db.getJobs();

    if (status) {
      jobs = jobs.filter((j) => j.status === status);
    }
    if (remote) {
      jobs = jobs.filter((j) => j.remoteType.toLowerCase() === String(remote).toLowerCase());
    }
    if (type) {
      jobs = jobs.filter((j) => j.jobType.toLowerCase() === String(type).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.skills.required.some((s) => s.toLowerCase().includes(q))
      );
    }

    res.json({ jobs });
  });

  app.get('/api/jobs/:id', (req, res) => {
    const job = db.getJobById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  });

  app.post('/api/jobs', async (req, res) => {
    try {
      const {
        title,
        department,
        description,
        skills,
        experienceMinYears,
        experienceLevel,
        educationRequired,
        location,
        remoteType,
        salaryRange,
        jobType,
        deadline,
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
      }

      // Analyze job with AI in background or synchronously
      const analyzed = await analyzeJobWithAI(title, description);

      const newJob: Job = {
        id: `job-${Date.now()}`,
        recruiterId: 'rec-1',
        companyName: 'CloudScale AI',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        title,
        department: department || 'Engineering',
        description,
        skills: skills || {
          required: analyzed.requiredSkills,
          preferred: analyzed.preferredSkills,
        },
        experienceMinYears: Number(experienceMinYears) || analyzed.minimumExperienceYears || 3,
        experienceLevel: experienceLevel || 'Mid',
        educationRequired: educationRequired || 'Bachelor’s in CS or equivalent',
        location: location || 'San Francisco, CA / Remote',
        remoteType: remoteType || 'Hybrid',
        salaryRange: salaryRange || { min: 140000, max: 190000, currency: 'USD' },
        jobType: jobType || 'Full-time',
        status: 'OPEN',
        deadline: deadline || '2026-06-30',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analyzedData: analyzed,
        applicantCount: 0,
      };

      db.createJob(newJob);
      res.status(201).json({ job: newJob });
    } catch (err: any) {
      console.error('Job creation error:', err);
      res.status(500).json({ error: 'Failed to create job', details: err.message });
    }
  });

  app.put('/api/jobs/:id', (req, res) => {
    const updated = db.updateJob(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Job not found' });
    res.json({ job: updated });
  });

  app.delete('/api/jobs/:id', (req, res) => {
    const success = db.deleteJob(req.params.id);
    if (!success) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true });
  });

  // ---------------- APPLICATIONS API ----------------
  app.get('/api/applications', (req, res) => {
    const { jobId, candidateId, status } = req.query;
    let apps = db.getApplications();
    if (jobId) {
      apps = apps.filter((a) => a.jobId === jobId);
    }
    if (candidateId) {
      apps = apps.filter((a) => a.candidateId === candidateId);
    }
    if (status) {
      apps = apps.filter((a) => a.status === status);
    }
    res.json({ applications: apps });
  });

  app.post('/api/applications', async (req, res) => {
    try {
      const { jobId, candidateId } = req.body;
      const job = db.getJobById(jobId);
      if (!job) return res.status(404).json({ error: 'Job not found' });

      const candidate = candidateId
        ? db.getCandidateById(candidateId) || db.getCandidates()[0]
        : db.getCandidates()[0];

      // Check if already applied
      const existingApp = db.getApplications().find((a) => a.jobId === jobId && a.candidateId === candidate.id);
      if (existingApp) {
        return res.status(409).json({ error: 'You have already applied to this job.' });
      }

      // Compute AI Match Score as advisory signal
      const matchScore = await computeMatchScoreWithAI(job, candidate);

      const newApp: Application = {
        id: `app-${Date.now()}`,
        candidateId: candidate.id,
        candidateName: candidate.parsedResumeData?.name || 'Alex Rivera',
        candidateEmail: candidate.parsedResumeData?.email || 'alex.rivera@example.com',
        candidateHeadline: candidate.headline,
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        resumeFileName: candidate.resumeFileName || 'Resume.pdf',
        matchScore,
        status: 'APPLIED',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        interviewsCount: 0,
      };

      db.createApplication(newApp);

      // Trigger notifications (SRS Section 24)
      const candUser = db.getUserById(candidate.userId);
      if (candUser) {
        db.createNotification({
          id: `notif-${Date.now()}-1`,
          userId: candUser.id,
          title: 'Application Submitted',
          message: `Your application for ${newApp.jobTitle} at ${newApp.companyName} was successfully submitted with an AI Match Score of ${matchScore.overallScore}%.`,
          type: 'application_submitted',
          read: false,
          timestamp: new Date().toISOString(),
          linkTab: 'candidate-dashboard',
        });
      }
      db.createNotification({
        id: `notif-${Date.now()}-2`,
        userId: 'usr-rec-1',
        title: 'New Candidate Application',
        message: `${newApp.candidateName} submitted an application for ${newApp.jobTitle} (${matchScore.overallScore}% AI match).`,
        type: 'application_submitted',
        read: false,
        timestamp: new Date().toISOString(),
        linkTab: 'recruiter-dashboard',
      });

      res.status(201).json({ application: newApp });
    } catch (err: any) {
      console.error('Application error:', err);
      res.status(500).json({ error: 'Failed to submit application', details: err.message });
    }
  });

  app.patch('/api/applications/:id', (req, res) => {
    const { status, recruiterNotes } = req.body;
    const updated = db.updateApplication(req.params.id, {
      ...(status ? { status } : {}),
      ...(recruiterNotes !== undefined ? { recruiterNotes } : {}),
    });
    if (!updated) return res.status(404).json({ error: 'Application not found' });

    if (status) {
      const cand = db.getCandidateById(updated.candidateId);
      if (cand) {
        db.createNotification({
          id: `notif-${Date.now()}`,
          userId: cand.userId,
          title: 'Application Status Updated',
          message: `Your application for ${updated.jobTitle} has been moved to: ${status.replace('_', ' ')}.`,
          type: 'status_change',
          read: false,
          timestamp: new Date().toISOString(),
          linkTab: 'candidate-dashboard',
        });
      }
    }

    res.json({ application: updated });
  });

  // ---------------- INTERVIEWS API ----------------
  app.get('/api/interviews', (req, res) => {
    const { candidateId, recruiterId, status } = req.query;
    let list = db.getInterviews();
    if (candidateId) list = list.filter((i) => i.candidateId === candidateId);
    if (recruiterId) list = list.filter((i) => i.recruiterId === recruiterId);
    if (status) list = list.filter((i) => i.status === status);
    res.json({ interviews: list });
  });

  app.get('/api/interviews/:id', (req, res) => {
    const interview = db.getInterviewById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    const result = db.getInterviewResultByInterviewId(interview.id);
    res.json({ interview, result });
  });

  app.post('/api/interviews', async (req, res) => {
    try {
      const {
        applicationId,
        type = 'AI Technical',
        durationMinutes = 30,
        difficulty = 'Senior',
        topicCount = 4,
        scheduledAt,
      } = req.body;

      const appRecord = db.getApplicationById(applicationId);
      if (!appRecord) return res.status(404).json({ error: 'Application not found' });

      const job = db.getJobById(appRecord.jobId);
      const candidate = db.getCandidateById(appRecord.candidateId) || db.getCandidates()[0];

      if (!job) return res.status(404).json({ error: 'Associated job not found' });

      // Generate targeted questions via Gemini AI
      const questions = await generateInterviewQuestionsWithAI(
        job,
        candidate,
        type,
        difficulty,
        topicCount
      );

      const newInterview: Interview = {
        id: `int-${Date.now()}`,
        applicationId: appRecord.id,
        candidateId: candidate.id,
        candidateName: appRecord.candidateName,
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        recruiterId: 'rec-1',
        type,
        scheduledAt: scheduledAt || new Date().toISOString(),
        durationMinutes: Number(durationMinutes) || 30,
        difficulty,
        topicCount: Number(topicCount) || 4,
        status: 'SCHEDULED',
        meetingId: `meet-${Math.random().toString(36).substring(2, 9)}`,
        questions,
        currentQuestionIndex: 0,
        createdAt: new Date().toISOString(),
      };

      db.createInterview(newInterview);

      // Notification triggers (SRS Section 24)
      const candUser = db.getUserById(candidate.userId);
      if (candUser) {
        db.createNotification({
          id: `notif-${Date.now()}-int-cand`,
          userId: candUser.id,
          title: 'Interview Scheduled',
          message: `Your ${newInterview.type} session for ${newInterview.jobTitle} is scheduled for ${new Date(newInterview.scheduledAt).toLocaleDateString()} at ${new Date(newInterview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          type: 'interview_scheduled',
          read: false,
          timestamp: new Date().toISOString(),
          linkTab: 'candidate-dashboard',
        });
      }
      db.createNotification({
        id: `notif-${Date.now()}-int-rec`,
        userId: 'usr-rec-1',
        title: 'Interview Confirmed',
        message: `${newInterview.type} session successfully scheduled for ${newInterview.candidateName}.`,
        type: 'interview_scheduled',
        read: false,
        timestamp: new Date().toISOString(),
        linkTab: 'recruiter-dashboard',
      });

      res.status(201).json({ interview: newInterview });
    } catch (err: any) {
      console.error('Interview schedule error:', err);
      res.status(500).json({ error: 'Failed to schedule interview', details: err.message });
    }
  });

  app.post('/api/interviews/:id/start', (req, res) => {
    const updated = db.updateInterview(req.params.id, { status: 'IN_PROGRESS' });
    if (!updated) return res.status(404).json({ error: 'Interview not found' });
    res.json({ interview: updated });
  });

  app.post('/api/interviews/:id/complete', async (req, res) => {
    try {
      const { answers, consentGiven } = req.body;
      const interview = db.getInterviewById(req.params.id);
      if (!interview) return res.status(404).json({ error: 'Interview not found' });

      // Generate comprehensive dual-perspective summary & scoring
      const summary = await summarizeInterviewWithAI(interview, answers || []);

      const finalResult: InterviewResult = {
        id: `res-${Date.now()}`,
        interviewId: interview.id,
        candidateId: interview.candidateId,
        candidateName: interview.candidateName,
        jobId: interview.jobId,
        jobTitle: interview.jobTitle,
        overallScore: summary.overallScore,
        categoryScores: summary.categoryScores,
        feedbackForCandidate: summary.feedbackForCandidate,
        feedbackForRecruiter: summary.feedbackForRecruiter,
        perQuestionEvals: summary.perQuestionEvals,
        transcriptFull: summary.transcriptFull,
        consentGiven: !!consentGiven,
        evaluatedAt: new Date().toISOString(),
      };

      db.saveInterviewResult(finalResult);

      // Note: Do NOT auto-reject or auto-select! Status remains advisory.
      // Update application note with interview advisory completion:
      const appRecord = db.getApplicationById(interview.applicationId);
      if (appRecord) {
        db.updateApplication(appRecord.id, {
          recruiterNotes: `Interview completed with AI advisory score ${finalResult.overallScore}/100. Recommendation: ${finalResult.feedbackForRecruiter.humanRecommendationAdvisory}. Requires human recruiter decision.`,
        });
      }

      // Notifications on completion (SRS Section 24)
      const cand = db.getCandidateById(interview.candidateId);
      if (cand) {
        db.createNotification({
          id: `notif-${Date.now()}-comp-cand`,
          userId: cand.userId,
          title: 'Interview Evaluation Report Ready',
          message: `Your comprehensive AI evaluation for ${interview.jobTitle} is ready. Overall Advisory Score: ${finalResult.overallScore}/100.`,
          type: 'interview_completed',
          read: false,
          timestamp: new Date().toISOString(),
          linkTab: 'candidate-dashboard',
        });
      }
      db.createNotification({
        id: `notif-${Date.now()}-comp-rec`,
        userId: 'usr-rec-1',
        title: 'Candidate Interview Completed',
        message: `${interview.candidateName} completed ${interview.type}. AI Recommendation: ${finalResult.feedbackForRecruiter.humanRecommendationAdvisory}.`,
        type: 'interview_completed',
        read: false,
        timestamp: new Date().toISOString(),
        linkTab: 'recruiter-dashboard',
      });

      res.json({ result: finalResult });
    } catch (err: any) {
      console.error('Interview completion error:', err);
      res.status(500).json({ error: 'Failed to finalize interview report', details: err.message });
    }
  });

  app.get('/api/interviews/:id/results', (req, res) => {
    const result = db.getInterviewResultByInterviewId(req.params.id);
    if (!result) return res.status(404).json({ error: 'Results not yet generated for this interview' });
    res.json({ result });
  });

  app.get('/api/interview-results', (req, res) => {
    const results = db.getInterviewResults();
    res.json({ results });
  });

  // ---------------- AI MICROSERVICES API (SRS Section 5) ----------------
  app.post('/api/ai/resume/analyze', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Text is required' });
      const parsed = await parseResumeWithAI(text);
      res.json({ parsed });
    } catch (err: any) {
      res.status(500).json({ error: 'Resume parsing failed', details: err.message });
    }
  });

  app.post('/api/ai/resume/extract-text', async (req, res) => {
    try {
      const { fileBase64, mimeType, fileName } = req.body;
      if (!fileBase64) return res.status(400).json({ error: 'File data is required for text extraction' });
      const text = await extractTextFromFileWithAI(fileBase64, mimeType || 'application/pdf', fileName);
      res.json({ text });
    } catch (err: any) {
      res.status(500).json({ error: 'Text extraction from resume file failed', details: err.message });
    }
  });

  app.post('/api/ai/resume/ats-check', async (req, res) => {
    try {
      const { resumeText, targetRole, fileData } = req.body;
      if (!resumeText && !fileData?.base64) {
        return res.status(400).json({ error: 'Resume text or uploaded file is required for ATS audit' });
      }
      const analysis = await analyzeResumeATSScoreWithAI(resumeText || '', targetRole, fileData);
      res.json({ analysis });
    } catch (err: any) {
      res.status(500).json({ error: 'ATS resume audit failed', details: err.message });
    }
  });

  app.post('/api/ai/resume/ats-correct', async (req, res) => {
    try {
      const { resumeText, targetRole } = req.body;
      if (!resumeText) return res.status(400).json({ error: 'Resume text is required for correction' });
      const correction = await correctAndOptimizeResumeWithAI(resumeText, targetRole);
      res.json({ correction });
    } catch (err: any) {
      res.status(500).json({ error: 'ATS resume correction failed', details: err.message });
    }
  });

  app.post('/api/ai/job/analyze', async (req, res) => {
    try {
      const { title, description } = req.body;
      if (!title || !description) return res.status(400).json({ error: 'Title and description required' });
      const analysis = await analyzeJobWithAI(title, description);
      res.json({ analysis });
    } catch (err: any) {
      res.status(500).json({ error: 'Job analysis failed', details: err.message });
    }
  });

  app.post('/api/ai/match', async (req, res) => {
    try {
      const { jobId, candidateId } = req.body;
      const job = db.getJobById(jobId) || db.getJobs()[0];
      const candidate = db.getCandidateById(candidateId) || db.getCandidates()[0];
      const matchScore = await computeMatchScoreWithAI(job, candidate);
      res.json({ matchScore });
    } catch (err: any) {
      res.status(500).json({ error: 'Match evaluation failed', details: err.message });
    }
  });

  app.post('/api/ai/questions/generate', async (req, res) => {
    try {
      const { jobId, candidateId, type = 'AI Technical', difficulty = 'Senior', count = 4 } = req.body;
      const job = db.getJobById(jobId) || db.getJobs()[0];
      const candidate = db.getCandidateById(candidateId) || db.getCandidates()[0];
      const questions = await generateInterviewQuestionsWithAI(job, candidate, type, difficulty, Number(count) || 4);
      res.json({ questions });
    } catch (err: any) {
      res.status(500).json({ error: 'Question generation failed', details: err.message });
    }
  });

  app.post('/api/ai/answer/evaluate', async (req, res) => {
    try {
      const { question, transcript } = req.body;
      if (!question || !transcript) {
        return res.status(400).json({ error: 'Question and transcript are required' });
      }
      const evaluation = await evaluateAnswerWithAI(question, transcript);
      res.json({ evaluation });
    } catch (err: any) {
      res.status(500).json({ error: 'Answer evaluation failed', details: err.message });
    }
  });

  app.post('/api/ai/interview/summarize', async (req, res) => {
    try {
      const { interview, answers } = req.body;
      if (!interview || !answers) {
        return res.status(400).json({ error: 'Interview metadata and answers are required' });
      }
      const summary = await summarizeInterviewWithAI(interview, answers);
      res.json({ summary });
    } catch (err: any) {
      res.status(500).json({ error: 'Interview summarization failed', details: err.message });
    }
  });

  // ---------------- ADMIN API ----------------
  app.get('/api/admin/metrics', (req, res) => {
    const metrics = db.getAdminMetrics();
    res.json({ metrics });
  });

  app.get('/api/admin/users', (req, res) => {
    const users = db.getUsers();
    res.json({ users });
  });

  app.patch('/api/admin/users/:id', (req, res) => {
    const updated = db.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ user: updated });
  });

  // ---------------- NOTIFICATIONS API (SRS Section 24) ----------------
  app.get('/api/notifications', (req, res) => {
    const userId = req.query.userId as string | undefined;
    const notifications = db.getNotifications(userId);
    res.json({ notifications });
  });

  app.patch('/api/notifications/:id/read', (req, res) => {
    const success = db.markNotificationAsRead(req.params.id);
    if (!success) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  });

  app.post('/api/notifications/read-all', (req, res) => {
    const { userId } = req.body;
    db.markAllNotificationsAsRead(userId);
    res.json({ success: true });
  });

  // ---------------- VITE MIDDLEWARE ----------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
