export type UserRole = 'candidate' | 'recruiter' | 'admin';

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type InterviewType = 'AI Technical' | 'AI HR' | 'Recruiter' | 'Mixed';

export type InterviewStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface AdminDetails {
  organization: string;
  department: string;
  adminTitle: string;
  governanceScope: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  avatar?: string;
  adminDetails?: AdminDetails;
  createdAt: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  gpa?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  skillsUsed: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export type ExperienceTrack = 'fresher' | 'experienced';

export interface FresherDetails {
  collegeName: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
  targetRole: string;
  primarySkills: string[];
  coreCoursework: string[];
  finalYearProjectTitle?: string;
  finalYearProjectSummary?: string;
  immediateGoal: 'campus_placements' | 'off_campus_drives' | 'first_internship' | 'startup_entry_role';
  practiceTrack?: 'dsa_core' | 'project_defense' | 'behavioral_hr' | 'full_fresher_mock';
}

export interface ExperiencedDetails {
  currentRole: string;
  currentCompany: string;
  totalYears: number;
  domain: string;
  targetSeniority: 'Mid-Level' | 'Senior' | 'Staff / Principal' | 'Lead / Engineering Manager';
  primaryTechStack: string[];
  systemArchitectureFocus: string[];
  notableAchievement?: string;
  interviewPrepFocus: 'system_design' | 'high_concurrency' | 'incident_triage' | 'star_leadership' | 'executive_mock';
}

export interface CandidateProfile {
  id: string;
  userId: string;
  headline: string;
  bio: string;
  location: string;
  phone: string;
  yearsOfExperience: number;
  education: EducationItem[];
  skills: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  resumeUrl?: string;
  resumeFileName?: string;
  resumeRawText?: string;
  parsedResumeData?: AIParsedResume;
  experienceTrack?: ExperienceTrack;
  fresherDetails?: FresherDetails;
  experiencedDetails?: ExperiencedDetails;
  onboardingCompleted?: boolean;
  updatedAt: string;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  companyName: string;
  designation: string;
  companyDetails: {
    industry: string;
    size: string;
    website: string;
    location: string;
    about: string;
    logo?: string;
  };
  updatedAt: string;
}

export interface JobSkills {
  required: string[];
  preferred: string[];
}

export interface Job {
  id: string;
  recruiterId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  department: string;
  description: string;
  skills: JobSkills;
  experienceMinYears: number;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  educationRequired: string;
  location: string;
  remoteType: 'Remote' | 'Hybrid' | 'On-site';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status: 'OPEN' | 'PAUSED' | 'CLOSED';
  deadline: string;
  createdAt: string;
  updatedAt: string;
  analyzedData?: AIJobAnalysis;
  applicantCount?: number;
}

export interface AIMatchScore {
  overallScore: number; // 0-100
  breakdown: {
    skillMatch: number; // 0-100
    experienceMatch: number; // 0-100
    educationMatch: number; // 0-100
    keywordMatch: number; // 0-100
    softSkillsMatch: number; // 0-100
  };
  strengths: string[];
  missingSkills: string[];
  experienceRelevanceSummary: string;
  aiExplanation: string;
  isAdvisoryOnly: true; // Hard constraint: never automated verdict
}

export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateHeadline?: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  resumeFileName?: string;
  matchScore?: AIMatchScore;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  recruiterNotes?: string;
  interviewsCount?: number;
}

export interface InterviewQuestion {
  id: string;
  category: 'Technical' | 'Behavioral (STAR)' | 'HR & Culture' | 'System Architecture';
  question: string;
  expectedKeyPoints: string[];
  suggestedDurationSeconds: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface InterviewAnswerSubmission {
  questionId: string;
  question: string;
  transcript: string;
  durationSeconds: number;
  evaluation?: {
    relevance: number; // 0-100
    technicalCorrectness: number; // 0-100
    completeness: number; // 0-100
    communication: number; // 0-100
    conceptCoverage: string[];
    missedConcepts: string[];
    feedback: string;
  };
}

export interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  recruiterId: string;
  type: InterviewType;
  scheduledAt: string;
  durationMinutes: number;
  difficulty: 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
  topicCount: number;
  status: InterviewStatus;
  meetingId: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  createdAt: string;
}

export interface InterviewResult {
  id: string;
  interviewId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  overallScore: number; // 0-100 advisory
  categoryScores: {
    technicalCorrectness: number;
    communicationClarity: number;
    problemSolvingSTAR: number;
    completeness: number;
    conceptCoverage: number;
  };
  feedbackForCandidate: {
    strengths: string[];
    growthAreas: string[];
    recommendedResources: string[];
    encouragingClosing: string;
  };
  feedbackForRecruiter: {
    executiveSummary: string;
    verifiedSkillProficiency: string[];
    verificationFlagsOrGaps: string[];
    recommendedFollowUpQuestions: string[];
    humanRecommendationAdvisory: 'Strong Match for Onsite' | 'Meets Threshold with Verification' | 'Skills Gap for Role';
  };
  perQuestionEvals: InterviewAnswerSubmission[];
  transcriptFull: string;
  consentGiven: boolean;
  evaluatedAt: string;
}

export interface AIParsedResume {
  name: string;
  email: string;
  phone: string;
  headline: string;
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    toolsAndDatabases: string[];
    softSkills: string[];
  };
  experience: {
    company: string;
    role: string;
    duration: string;
    highlights: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications: string[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
  yearsOfExperience?: number;
}

export interface AdminMetrics {
  totalUsers: number;
  activeCandidates?: number;
  activeRecruiters?: number;
  candidatesCount?: number;
  recruitersCount?: number;
  totalJobs?: number;
  jobsCount?: number;
  openJobsCount?: number;
  totalApplications?: number;
  applicationsCount?: number;
  interviewsConducted: number;
  avgMatchScore?: number;
  statusBreakdown?: Record<string, number>;
}

export interface AIJobAnalysis {
  requiredSkills: string[];
  preferredSkills: string[];
  minimumExperienceYears: number;
  keyResponsibilities: string[];
  coreDomainKeywords: string[];
  suggestedInterviewTopics: string[];
}

export interface ATSAnalysisResult {
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  verdict: string;
  breakdown: {
    formattingAndParseability: number; // 0-100
    keywordDensity: number; // 0-100
    quantifiableImpact: number; // 0-100
    sectionCompleteness: number; // 0-100
    readabilityAndLength: number; // 0-100
  };
  detectedSections: {
    name: string;
    present: boolean;
    status: 'OPTIMAL' | 'NEEDS_WORK' | 'MISSING';
    feedback: string;
  }[];
  crucialRedFlags: string[];
  missingKeywords: string[];
  formattingWarnings: string[];
  weakVerbsIdentified: {
    weak: string;
    suggestedReplacement: string;
  }[];
  keyStrengths: string[];
  wordCount: number;
}

export interface ATSCorrectionResult {
  originalText: string;
  correctedResumeText: string;
  summaryOfCorrections: string;
  estimatedNewScore: number;
  improvements: {
    section: string;
    before: string;
    after: string;
    reason: string;
  }[];
  keywordsAdded: string[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'application_submitted'
    | 'status_change'
    | 'interview_scheduled'
    | 'interview_reminder'
    | 'interview_completed'
    | 'recruiter_message';
  read: boolean;
  timestamp: string;
  linkTab?: string;
  metadata?: Record<string, any>;
}

export interface CandidateRankingWeights {
  resumeMatch: number; // e.g. 25
  technicalInterview: number; // e.g. 30
  experienceRelevance: number; // e.g. 20
  requiredSkillCoverage: number; // e.g. 15
  interviewEvaluation: number; // e.g. 10
}

