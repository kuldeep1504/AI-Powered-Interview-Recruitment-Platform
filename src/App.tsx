/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  CandidateProfile,
  Job,
  Application,
  Interview,
  InterviewResult,
  ApplicationStatus,
  ExperienceTrack,
  FresherDetails,
  ExperiencedDetails,
} from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { CandidateDashboard } from './components/CandidateDashboard.tsx';
import { CandidateOnboardingForm } from './components/CandidateOnboardingForm.tsx';
import { JobBoard } from './components/JobBoard.tsx';
import { CandidateProfileView } from './components/CandidateProfileView.tsx';
import { RecruiterDashboard } from './components/RecruiterDashboard.tsx';
import { RecruiterJobManager } from './components/RecruiterJobManager.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { InterviewRoom } from './components/InterviewRoom.tsx';
import { InterviewReportModal } from './components/InterviewReportModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ATSResumeCheckerModal } from './components/ATSResumeCheckerModal.tsx';
import { SRSModal } from './components/SRSModal.tsx';
import { Loader2, Sparkles, BrainCircuit, ShieldAlert, BookOpen } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeTab, setActiveTab] = useState<string>('candidate-dashboard');

  // Overlays
  const [activeInterviewRoom, setActiveInterviewRoom] = useState<Interview | null>(null);
  const [activeReportResult, setActiveReportResult] = useState<InterviewResult | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isATSModalOpen, setIsATSModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSRSModalOpen, setIsSRSModalOpen] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Initialize data from server
  useEffect(() => {
    async function loadBootstrapData() {
      try {
        const [meRes, profRes, jobsRes, appsRes, intRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/candidates/profile'),
          fetch('/api/jobs'),
          fetch('/api/applications'),
          fetch('/api/interviews'),
        ]);

        const meData = await meRes.json();
        const profData = await profRes.json();
        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();
        const intData = await intRes.json();

        setCurrentUser(meData.user);
        setCandidateProfile(profData.profile);
        setJobs(jobsData.jobs || []);
        setApplications(appsData.applications || []);
        setInterviews(intData.interviews || []);
      } catch (err) {
        console.error('Bootstrap data load error:', err);
      } finally {
        setLoadingInitial(false);
      }
    }

    loadBootstrapData();
  }, []);

  // Handle switching user role (Candidate, Recruiter, Admin)
  const handleSwitchRole = (role: UserRole) => {
    if (!currentUser) return;
    let updatedUser: User;

    if (role === 'candidate') {
      updatedUser = {
        id: 'usr-1',
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        role: 'candidate',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        createdAt: new Date().toISOString(),
      };
      setActiveTab('candidate-dashboard');
    } else if (role === 'recruiter') {
      updatedUser = {
        id: 'usr-2',
        name: 'Sarah Lin',
        email: 'sarah.lin@cloudscale.ai',
        role: 'recruiter',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        createdAt: new Date().toISOString(),
      };
      setActiveTab('recruiter-dashboard');
    } else {
      updatedUser = {
        id: 'usr-3',
        name: 'Marcus Vance',
        email: 'marcus.admin@talentpulse.ai',
        role: 'admin',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        createdAt: new Date().toISOString(),
      };
      setActiveTab('admin-dashboard');
    }

    setCurrentUser(updatedUser);
  };

  // Quick Open Live Interview Room
  const handleOpenInterviewQuick = () => {
    if (interviews.length > 0) {
      const scheduled = interviews.find((i) => i.status !== 'COMPLETED') || interviews[0];
      setActiveInterviewRoom(scheduled);
    } else if (jobs.length > 0 && candidateProfile) {
      // Create quick on-demand interview
      const dummyInt: Interview = {
        id: `int-${Date.now()}`,
        applicationId: applications[0]?.id || 'app-1',
        candidateId: candidateProfile.id,
        candidateName: candidateProfile.parsedResumeData?.name || 'Alex Rivera',
        jobId: jobs[0].id,
        jobTitle: jobs[0].title,
        companyName: jobs[0].companyName,
        recruiterId: 'rec-1',
        type: 'AI Technical',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 30,
        difficulty: 'Senior',
        topicCount: 4,
        status: 'SCHEDULED',
        meetingId: `meet-${Math.random().toString(36).substring(2, 9)}`,
        questions: [
          {
            id: 'q-live-1',
            category: 'System Architecture',
            question:
              'How do you design a high-throughput WebRTC signaling channel and handle fallback for peers behind restrictive symmetric NATs?',
            difficulty: 'Hard',
            expectedKeyPoints: [
              'STUN/TURN relay mechanics (RFC 5766)',
              'ICE candidate gathering and Trickle ICE',
              'Signaling transport via WebSockets and fallback to HTTPS long-polling',
            ],
            suggestedDurationSeconds: 180,
          },
          {
            id: 'q-live-2',
            category: 'System Architecture',
            question:
              'When processing audio streams for live speech transcription, how do you prevent dropped packets and handle intermittent client connectivity?',
            difficulty: 'Hard',
            expectedKeyPoints: [
              'Client-side buffer rings',
              'Backpressure flow control',
              'WebSocket reconnect logic with sequence acknowledgements',
            ],
            suggestedDurationSeconds: 180,
          },
        ],
        currentQuestionIndex: 0,
        createdAt: new Date().toISOString(),
      };
      setActiveInterviewRoom(dummyInt);
    }
  };

  // View results modal
  const handleViewInterviewResult = async (interviewId: string) => {
    try {
      const res = await fetch(`/api/interviews/${interviewId}/results`);
      if (res.ok) {
        const data = await res.json();
        setActiveReportResult(data.result);
      } else {
        alert('Evaluation report is not ready yet or interview is pending.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Status updates
  const handleUpdateApplicationStatus = async (
    appId: string,
    status: ApplicationStatus,
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, recruiterNotes: notes }),
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(applications.map((a) => (a.id === appId ? data.application : a)));
      }
    } catch (e) {
      console.error('Error updating application status:', e);
    }
  };

  const handleSaveOnboarding = async (
    track: ExperienceTrack,
    fresherData?: FresherDetails,
    expData?: ExperiencedDetails
  ) => {
    try {
      const res = await fetch('/api/candidates/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceTrack: track,
          fresherDetails: fresherData,
          experiencedDetails: expData,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCandidateProfile(data.profile);
        setIsOnboardingOpen(false);
      }
    } catch (err) {
      console.error('Failed to save candidate track onboarding:', err);
    }
  };

  const handleStartTrackMockInterview = (track: 'fresher' | 'experienced', focusArea?: string) => {
    if (!candidateProfile) return;
    const isFresher = track === 'fresher';

    let questions: any[];
    let jobTitle = isFresher
      ? (focusArea ? `Fresher Drill: ${focusArea}` : 'Junior Software Engineer & Campus Placement AI Interview')
      : (focusArea ? `Senior Drill: ${focusArea}` : 'Senior Principal System Architect & Staff Leadership AI Interview');
    let companyName = isFresher ? 'Campus Placements & Early Career Accelerator' : 'High-Scale Enterprise Cloud Infrastructure';
    let difficulty = isFresher ? 'Entry-Level' : 'Senior';

    if (isFresher) {
      if (focusArea === 'Core CS Fundamentals') {
        questions = [
          {
            id: `q-${Date.now()}-1`,
            category: 'Data Structures & Algorithms',
            question: 'Explain how a HashMap handles hash collisions internally in Java or JavaScript. What is the difference between Separate Chaining and Open Addressing, and what is the worst-case time complexity?',
            difficulty: 'Medium',
            expectedKeyPoints: ['Hash function & bucket indexing', 'Collisions handled via linked lists or red-black trees', 'O(1) average lookup vs O(N) worst-case'],
            suggestedDurationSeconds: 150,
          },
          {
            id: `q-${Date.now()}-2`,
            category: 'Operating Systems & Concurrency',
            question: 'What is the primary difference between a Process and a Thread? How do threads share memory space, and why can race conditions occur without mutexes?',
            difficulty: 'Medium',
            expectedKeyPoints: ['Processes have independent address space', 'Threads share heap and code segments within same process', 'Race conditions and synchronization primitives'],
            suggestedDurationSeconds: 150,
          },
          {
            id: `q-${Date.now()}-3`,
            category: 'DBMS & SQL',
            question: 'Explain the ACID properties of relational databases with a real-world banking transaction example. What is the difference between an INNER JOIN and a LEFT JOIN?',
            difficulty: 'Medium',
            expectedKeyPoints: ['Atomicity, Consistency, Isolation, Durability', 'Debit/credit balance rollback on error', 'INNER JOIN vs LEFT JOIN row matching'],
            suggestedDurationSeconds: 150,
          },
          {
            id: `q-${Date.now()}-4`,
            category: 'Fresher Behavioral',
            question: 'Tell me about a technical concept or tool you had to learn quickly on your own during college to build a project. How did you approach learning it?',
            difficulty: 'Easy',
            expectedKeyPoints: ['Self-directed learning strategy', 'Documentation & practical building', 'Proactive debugging and reflection'],
            suggestedDurationSeconds: 120,
          },
        ];
      } else if (focusArea === 'Academic Project Defense') {
        questions = [
          {
            id: `q-${Date.now()}-1`,
            category: 'Architecture Overview',
            question: 'Walk me through the complete end-to-end architecture of your main academic or capstone project. What was the problem statement, tech stack, and user flow?',
            difficulty: 'Medium',
            expectedKeyPoints: ['Problem statement & client/server architecture', 'Tech stack justification', 'Data flow from client to backend to DB'],
            suggestedDurationSeconds: 180,
          },
          {
            id: `q-${Date.now()}-2`,
            category: 'Database Schema & State',
            question: 'How did you design your database schema and handle state management in this project? What trade-offs did you make between relational and NoSQL storage?',
            difficulty: 'Medium',
            expectedKeyPoints: ['Entity relationships & foreign keys/indexing', 'Frontend state management', 'Storage trade-offs for project scale'],
            suggestedDurationSeconds: 150,
          },
          {
            id: `q-${Date.now()}-3`,
            category: 'Problem-Solving & Debugging',
            question: 'What was the toughest bug, performance bottleneck, or edge-case you ran into during the project, and how did you diagnose and resolve it?',
            difficulty: 'Medium',
            expectedKeyPoints: ['Systematic debugging process (logs, DevTools, stack traces)', 'Root cause analysis', 'Testing the fix and verifying stability'],
            suggestedDurationSeconds: 150,
          },
        ];
      } else if (focusArea === 'Fresher HR Behavioral') {
        questions = [
          {
            id: `q-${Date.now()}-1`,
            category: 'Introduction & Ambition',
            question: 'Tell me about yourself, your academic background, and why you are specifically excited to start your career in software engineering.',
            difficulty: 'Easy',
            expectedKeyPoints: ['Concise elevator pitch highlighting projects & skills', 'Passion for engineering and technology', 'Genuine interest in team growth'],
            suggestedDurationSeconds: 120,
          },
          {
            id: `q-${Date.now()}-2`,
            category: 'Teamwork & Conflict',
            question: 'Describe a college group project where team members had differing opinions on task allocation or deadlines. How did you communicate and resolve the conflict?',
            difficulty: 'Easy',
            expectedKeyPoints: ['Active listening and empathy', 'Focus on shared milestone goals', 'Constructive compromise and accountability'],
            suggestedDurationSeconds: 120,
          },
          {
            id: `q-${Date.now()}-3`,
            category: 'Feedback & Adaptability',
            question: 'As a fresher entering a fast-paced engineering team, how do you handle critical code review feedback and adapt to new engineering conventions?',
            difficulty: 'Easy',
            expectedKeyPoints: ['Receptive mindset without defensiveness', 'Asking clarifying questions', 'Translating feedback into actionable improvement'],
            suggestedDurationSeconds: 120,
          },
        ];
      } else {
        // General Fresher Mock
        questions = [
          {
            id: `q-${Date.now()}-1`,
            category: 'Core Programming & Data Structures',
            question: 'Compare an Array versus a LinkedList. In what operational scenarios would you choose a LinkedList over a dynamic contiguous array?',
            difficulty: 'Easy',
            expectedKeyPoints: ['Memory layout (contiguous vs node pointers)', 'O(1) insertion at head vs O(N) traversal', 'Cache locality advantages of arrays'],
            suggestedDurationSeconds: 150,
          },
          {
            id: `q-${Date.now()}-2`,
            category: 'Web & API Fundamentals',
            question: 'Explain what happens under the hood when a user types a URL into a web browser and hits enter until the page is rendered on screen.',
            difficulty: 'Medium',
            expectedKeyPoints: ['DNS resolution', 'TCP handshake & TLS negotiation', 'HTTP request/response', 'DOM/CSSOM parsing and layout tree rendering'],
            suggestedDurationSeconds: 180,
          },
          {
            id: `q-${Date.now()}-3`,
            category: 'Project Walkthrough',
            question: 'Pick one significant coding project you built. What technical decision or library choice worked well, and what would you improve if starting from scratch today?',
            difficulty: 'Medium',
            expectedKeyPoints: ['Project context', 'Self-awareness of technical trade-offs', 'Engineering maturity in reflecting on improvements'],
            suggestedDurationSeconds: 150,
          },
        ];
      }
    } else {
      // EXPERIENCED CANDIDATE QUESTIONS
      if (focusArea === 'High-Scale System Design') {
        questions = [
          {
            id: `q-${Date.now()}-1`,
            category: 'System Architecture & Scale',
            question: 'Design a distributed rate-limiting system for an API gateway serving 500,000 requests/sec across 3 geographical regions. How do you implement sliding-window rate limiting with Redis without generating excessive replication lag?',
            difficulty: 'Hard',
            expectedKeyPoints: ['Token bucket or sliding-window log algorithms', 'Redis Lua scripts for atomicity', 'Local in-memory token buffers with batched sync', 'Graceful 429 Too Many Requests headers and retry-after'],
            suggestedDurationSeconds: 180,
          },
          {
            id: `q-${Date.now()}-2`,
            category: 'Data Storage & Sharding',
            question: 'How do you partition a multi-terabyte transactional PostgreSQL database with billions of rows while preserving relational joins and minimizing distributed cross-shard two-phase commits?',
            difficulty: 'Hard',
            expectedKeyPoints: ['Consistent hashing & tenant-based partitioning keys', 'Read replicas with CQRS pattern', 'Handling distributed transactions (Saga pattern vs 2PC)'],
            suggestedDurationSeconds: 180,
          },
          {
            id: `q-${Date.now()}-3`,
            category: 'Event-Driven Systems',
            question: 'When designing an asynchronous order processing pipeline, compare Apache Kafka event log semantics with RabbitMQ AMQP broker semantics. In what scenarios would you choose each?',
            difficulty: 'Hard',
            expectedKeyPoints: ['Kafka partitioned commit log, consumer groups, replayability', 'RabbitMQ smart broker/dumb consumer with message acknowledgements', 'Idempotency and out-of-order event handling'],
            suggestedDurationSeconds: 180,
          },
        ];
      } else if (focusArea === 'Incident Triage & Concurrency') {
        questions = [
          {
            id: `q-${Date.now()}-1`,
            category: 'Production Triage & Post-Mortem',
            question: 'Walk me through a high-severity P0 production outage you led the triage for. How did you isolate root cause, protect downstream systems, and facilitate a blameless post-mortem?',
            difficulty: 'Hard',
            expectedKeyPoints: ['Incident command structure and communication cadence', 'Observability telemetry (metrics, traces, logs)', 'Mitigation first (circuit breaker, rollback) before debugging', 'Actionable post-mortem preventative items'],
            suggestedDurationSeconds: 180,
          },
          {
            id: `q-${Date.now()}-2`,
            category: 'Concurrency & Memory',
            question: 'How do you detect and fix subtle memory leaks or event-loop blocking in high-throughput Node.js / Go backend microservices under persistent load?',
            difficulty: 'Hard',
            expectedKeyPoints: ['Heap snapshot diffing and garbage collection churn', 'Event-loop lag monitoring and async CPU profiling', 'Connection leaks and unclosed event listeners'],
            suggestedDurationSeconds: 180,
          },
        ];
      } else if (focusArea === 'Senior STAR Leadership') {
        questions = [
          {
            id: `q-${Date.now()}-1`,
            category: 'Architectural Governance',
            question: 'Describe a situation where product management pushed for rapid feature delivery while the engineering team recognized severe technical debt risks. How did you negotiate and align priorities?',
            difficulty: 'Hard',
            expectedKeyPoints: ['Quantifying technical debt into business risk & SLA impact', 'Phased refactoring embedded into sprint roadmap', 'Maintaining trust between product and engineering'],
            suggestedDurationSeconds: 150,
          },
          {
            id: `q-${Date.now()}-2`,
            category: 'Engineering Mentorship & Culture',
            question: 'How do you mentor mid-level and junior engineers into senior contributors? Give an example of how you coached an engineer through architectural design or code quality hurdles.',
            difficulty: 'Hard',
            expectedKeyPoints: ['Design doc reviews and guiding questions rather than prescriptive answers', 'Pair programming on complex outage triage', 'Fostering ownership and psychological safety'],
            suggestedDurationSeconds: 150,
          },
        ];
      } else {
        // General Experienced Professional
        questions = [
          {
            id: `q-${Date.now()}-1`,
            category: 'Zero-Downtime Infrastructure',
            question: 'How do you design a zero-downtime database migration process for expanding a core database table schema holding 250M rows while active write traffic continues?',
            difficulty: 'Hard',
            expectedKeyPoints: ['Expand and contract pattern (dual-write / shadow column)', 'Backfilling in asynchronous micro-batches', 'Atomic swap and validation before dropping legacy column'],
            suggestedDurationSeconds: 180,
          },
          {
            id: `q-${Date.now()}-2`,
            category: 'Distributed Real-Time Media',
            question: 'When scaling WebRTC audio/video sessions for multi-party calls, what are the trade-offs between Mesh, SFU (Selective Forwarding Unit), and MCU (Multipoint Control Unit)?',
            difficulty: 'Hard',
            expectedKeyPoints: ['Mesh client bandwidth explosion (N-1 upstream)', 'SFU packet forwarding efficiency without transcoding', 'Simulcast & SVC adaptation to fluctuating bandwidth'],
            suggestedDurationSeconds: 180,
          },
          {
            id: `q-${Date.now()}-3`,
            category: 'Staff Engineering Trade-offs',
            question: 'Tell me about a time you chose a simpler, less trendy architectural approach over a complex new paradigm. What was the trade-off and business outcome?',
            difficulty: 'Hard',
            expectedKeyPoints: ['Pragmatic engineering over resume-driven development', 'Operational simplicity and cognitive load on on-call team', 'Measurable business impact and stability'],
            suggestedDurationSeconds: 150,
          },
        ];
      }
    }

    const newInterview: Interview = {
      id: `int-${Date.now()}`,
      applicationId: applications[0]?.id || 'app-track-mock',
      candidateId: candidateProfile.id,
      candidateName: candidateProfile.parsedResumeData?.name || (isFresher ? 'David Chen' : 'Alex Rivera'),
      jobId: jobs[0]?.id || 'job-track',
      jobTitle,
      companyName,
      recruiterId: 'rec-1',
      type: isFresher ? 'AI Technical' : 'AI Technical',
      scheduledAt: new Date().toISOString(),
      durationMinutes: isFresher ? 30 : 45,
      difficulty: difficulty as any,
      topicCount: questions.length,
      status: 'SCHEDULED',
      meetingId: `room-${Math.random().toString(36).substring(2, 9)}`,
      questions,
      currentQuestionIndex: 0,
      createdAt: new Date().toISOString(),
    };

    setInterviews((prev) => [newInterview, ...prev]);
    setActiveInterviewRoom(newInterview);
  };

  const handleLoginSuccess = async (user: User, isSignUp?: boolean) => {
    setCurrentUser(user);
    if (user.role === 'candidate') {
      setActiveTab('candidate-dashboard');
      try {
        const profRes = await fetch('/api/candidates/profile');
        const profData = await profRes.json();
        if (profData.profile) {
          setCandidateProfile(profData.profile);
          // If the candidate just signed up or has not completed onboarding, pop up the onboarding form!
          if (isSignUp || !profData.profile.onboardingCompleted) {
            setIsOnboardingOpen(true);
          }
        }
      } catch (e) {
        console.error('Error fetching profile after login:', e);
      }
    } else if (user.role === 'recruiter') {
      setActiveTab('recruiter-dashboard');
    } else if (user.role === 'admin') {
      setActiveTab('admin-dashboard');
    }
  };

  const handleApplyCorrectedResume = async (correctedText: string) => {
    try {
      const res = await fetch('/api/ai/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: correctedText }),
      });
      const data = await res.json();
      if (data.parsed && candidateProfile) {
        const parsed = data.parsed;
        const flatSkills = [
          ...(parsed.skills?.languages || []),
          ...(parsed.skills?.frameworks || []),
          ...(parsed.skills?.toolsAndDatabases || []),
        ];
        const updatedProfile: CandidateProfile = {
          ...candidateProfile,
          headline: parsed.headline || candidateProfile.headline,
          bio: parsed.summary || candidateProfile.bio,
          yearsOfExperience: parsed.yearsOfExperience || candidateProfile.yearsOfExperience,
          parsedResumeData: parsed,
          skills: Array.from(new Set([...candidateProfile.skills, ...flatSkills])),
          education: parsed.education?.length ? parsed.education : candidateProfile.education,
          experience: parsed.experience?.length ? parsed.experience : candidateProfile.experience,
          updatedAt: new Date().toISOString(),
        };
        setCandidateProfile(updatedProfile);

        await fetch('/api/candidates/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProfile),
        });
      }
    } catch (err) {
      console.error('Error syncing corrected resume to profile:', err);
    }
  };

  if (loadingInitial || !currentUser || !candidateProfile) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
          <BrainCircuit className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
        <div className="text-sm font-semibold text-neutral-300">Initializing TalentPulse AI Platform...</div>
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans flex flex-col transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInterviewQuick={handleOpenInterviewQuick}
        onOpenATSModal={() => setIsATSModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSRSModal={() => setIsSRSModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Candidate Views */}
        {currentUser.role === 'candidate' && (
          <>
            {activeTab === 'candidate-dashboard' && (
              <CandidateDashboard
                profile={candidateProfile}
                applications={applications}
                interviews={interviews}
                jobs={jobs}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onJoinInterview={(intv) => setActiveInterviewRoom(intv)}
                onViewInterviewResult={handleViewInterviewResult}
                onOpenATSModal={() => setIsATSModalOpen(true)}
                onStartTrackMockInterview={handleStartTrackMockInterview}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
              />
            )}

            {activeTab === 'job-board' && (
              <JobBoard
                jobs={jobs}
                candidateProfile={candidateProfile}
                applications={applications}
                onApplySuccess={(newApp) => setApplications([newApp, ...applications])}
                onOpenInterviewRoom={(jobId) => handleOpenInterviewQuick()}
              />
            )}

            {activeTab === 'candidate-profile' && (
              <CandidateProfileView
                profile={candidateProfile}
                onUpdateProfile={(updated) => setCandidateProfile(updated)}
                onOpenATSModal={() => setIsATSModalOpen(true)}
              />
            )}
          </>
        )}

        {/* Recruiter Views */}
        {currentUser.role === 'recruiter' && (
          <>
            {(activeTab === 'recruiter-dashboard' || activeTab === 'recruiter-interviews') && (
              <RecruiterDashboard
                jobs={jobs}
                applications={applications}
                interviews={interviews}
                onUpdateApplicationStatus={handleUpdateApplicationStatus}
                onInterviewScheduled={(newIntv) => {
                  setInterviews([newIntv, ...interviews]);
                  // Also update application status
                  handleUpdateApplicationStatus(newIntv.applicationId, 'INTERVIEW_SCHEDULED');
                }}
                onViewInterviewResult={handleViewInterviewResult}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'recruiter-jobs' && (
              <RecruiterJobManager
                jobs={jobs}
                onJobCreated={(newJob) => setJobs([newJob, ...jobs])}
                onJobUpdated={(updatedJob) =>
                  setJobs(jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j)))
                }
                onJobDeleted={(jobId) => setJobs(jobs.filter((j) => j.id !== jobId))}
              />
            )}
          </>
        )}

        {/* Admin Views */}
        {currentUser.role === 'admin' && <AdminDashboard currentUser={currentUser} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 py-6 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-800 dark:text-neutral-200">TalentPulse Platform</span>
            <span>•</span>
            <span>AI-Assisted Recruitment & Video Interviews</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span>Model: Gemini 3.8-Flash</span>
            <span>•</span>
            <span>Zero Protected Attribute AI Policy</span>
            <span>•</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Human-in-the-Loop Enforced</span>
            <span>•</span>
            <button
              onClick={() => setIsSRSModalOpen(true)}
              className="text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 underline font-medium cursor-pointer"
            >
              View SRS Specifications & Architecture (B.Tech Final Year)
            </button>
          </div>
        </div>
      </footer>

      {/* Full-Screen WebRTC AI Interview Room Overlay */}
      {activeInterviewRoom && (
        <InterviewRoom
          interview={activeInterviewRoom}
          onClose={() => setActiveInterviewRoom(null)}
          onInterviewCompleted={(result) => {
            setActiveInterviewRoom(null);
            setActiveReportResult(result);
            // Refresh interviews list
            setInterviews((prev) =>
              prev.map((i) => (i.id === result.interviewId ? { ...i, status: 'COMPLETED' } : i))
            );
          }}
        />
      )}

      {/* Post-Interview Evaluation Report Card Modal */}
      {activeReportResult && (
        <InterviewReportModal
          result={activeReportResult}
          onClose={() => setActiveReportResult(null)}
          viewerRole={currentUser.role}
        />
      )}

      {/* Authentication (Login & Sign-Up) Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Free ATS Resume Checker & Auto-Correction Modal */}
      <ATSResumeCheckerModal
        isOpen={isATSModalOpen}
        onClose={() => setIsATSModalOpen(false)}
        candidateProfile={candidateProfile}
        initialResumeText={
          candidateProfile?.parsedResumeData
            ? `${candidateProfile.parsedResumeData.name || 'Alex Rivera'}
${candidateProfile.parsedResumeData.email || 'alex.rivera@example.com'} | ${candidateProfile.parsedResumeData.phone || '(555) 234-5678'}

SUMMARY
${candidateProfile.bio || candidateProfile.headline}

EXPERIENCE
${candidateProfile.experience
  .map(
    (exp) =>
      `${exp.company} — ${exp.title} (${exp.startDate} - ${exp.endDate || 'Present'})
${exp.description || ''}`
  )
  .join('\n\n')}

SKILLS
${candidateProfile.skills.join(', ')}

EDUCATION
${candidateProfile.education.map((edu) => `${edu.degree} in ${edu.field} — ${edu.institution} (${edu.endYear || ''})`).join('\n')}`
            : undefined
        }
        onApplyCorrectedProfile={handleApplyCorrectedResume}
      />

      {/* Candidate Track Onboarding & Calibration Modal */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm p-4 sm:p-6 md:p-10 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            <CandidateOnboardingForm
              initialProfile={candidateProfile}
              onSaveOnboarding={handleSaveOnboarding}
              onCancel={() => setIsOnboardingOpen(false)}
            />
          </div>
        </div>
      )}

      {/* B.Tech Capstone Project SRS Interactive Documentation Modal */}
      <SRSModal isOpen={isSRSModalOpen} onClose={() => setIsSRSModalOpen(false)} />
    </div>
  );
}
