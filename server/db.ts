import fs from 'fs';
import path from 'path';
import {
  User,
  CandidateProfile,
  RecruiterProfile,
  Job,
  Application,
  Interview,
  InterviewResult,
  AppNotification,
} from '../src/types.ts';
import { initialJobs } from './initial_jobs.ts';
import { connectToMongoDB, getMongoDb, isMongoConnected } from './mongodb.ts';

const DB_FILE = path.join(process.cwd(), 'server', 'data.json');

export interface DatabaseSchema {
  users: User[];
  candidates: CandidateProfile[];
  recruiters: RecruiterProfile[];
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  interviewResults: InterviewResult[];
  notifications: AppNotification[];
}

function getInitialData(): DatabaseSchema {
  const users: User[] = [
    {
      id: 'usr-cand-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      role: 'candidate',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-15T09:30:00.000Z',
    },
    {
      id: 'usr-rec-1',
      name: 'Sarah Lin',
      email: 'sarah.lin@cloudscale.ai',
      role: 'recruiter',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T08:00:00.000Z',
    },
    {
      id: 'usr-adm-1',
      name: 'Marcus Vance',
      email: 'admin@platform.internal',
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'usr-cand-2',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      role: 'candidate',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-01T11:20:00.000Z',
    },
    {
      id: 'usr-cand-3',
      name: 'David Chen',
      email: 'david.chen@example.com',
      role: 'candidate',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-10T14:45:00.000Z',
    },
  ];

  const candidates: CandidateProfile[] = [
    {
      id: 'cand-1',
      userId: 'usr-cand-1',
      headline: 'Senior Full-Stack Engineer | Distributed Systems & React Architect',
      bio: 'Passionate full-stack engineer with 6+ years building real-time collaboration platforms, high-throughput Node.js microservices, and modern React 19 web applications.',
      location: 'San Francisco, CA (Open to Remote)',
      phone: '+1 (555) 349-8821',
      yearsOfExperience: 6,
      education: [
        {
          id: 'edu-1',
          institution: 'UC Berkeley',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startYear: '2016',
          endYear: '2020',
          gpa: '3.85',
        },
      ],
      skills: [
        'TypeScript',
        'React',
        'Node.js',
        'Express',
        'WebRTC',
        'PostgreSQL',
        'Docker',
        'Kubernetes',
        'Redis',
        'Tailwind CSS',
        'GraphQL',
        'System Design',
      ],
      experience: [
        {
          id: 'exp-1',
          company: 'Nexus Realtime Inc.',
          role: 'Senior Full-Stack Engineer',
          location: 'San Francisco, CA',
          startDate: '2022-03',
          endDate: 'Present',
          current: true,
          description:
            'Architected WebRTC multi-party video conferencing engine with low-latency media signaling, scaling to 150K concurrent daily calls. Reduced median latency by 35% through custom WebSocket connection multiplexing.',
          skillsUsed: ['WebRTC', 'TypeScript', 'Node.js', 'Redis', 'React'],
        },
        {
          id: 'exp-2',
          company: 'StreamScale Labs',
          role: 'Full-Stack Developer',
          location: 'San Jose, CA',
          startDate: '2020-07',
          endDate: '2022-02',
          current: false,
          description:
            'Developed real-time metrics dashboards and RESTful ingest APIs processing 25k writes/sec using PostgreSQL and Express.',
          skillsUsed: ['React', 'Express', 'PostgreSQL', 'Docker'],
        },
      ],
      projects: [
        {
          id: 'proj-1',
          title: 'PulseRTC - Audio/Video P2P Engine',
          description: 'Open-source WebRTC room coordinator with automated ICE signaling and fallback audio streaming.',
          technologies: ['TypeScript', 'WebRTC', 'WebSockets', 'React'],
          link: 'https://github.com/example/pulsertc',
        },
      ],
      certifications: ['AWS Certified Solutions Architect - Associate', 'Certified Kubernetes Application Developer'],
      links: {
        github: 'https://github.com/alexrivera-dev',
        linkedin: 'https://linkedin.com/in/alexrivera-eng',
        portfolio: 'https://alexrivera.dev',
      },
      resumeFileName: 'Alex_Rivera_Senior_FullStack_Resume.pdf',
      experienceTrack: 'experienced',
      onboardingCompleted: true,
      experiencedDetails: {
        currentRole: 'Senior Full-Stack Engineer',
        currentCompany: 'Nexus Realtime Inc.',
        totalYears: 6,
        domain: 'Distributed Systems & Real-time Media',
        targetSeniority: 'Senior',
        primaryTechStack: ['TypeScript', 'React', 'Node.js', 'WebRTC', 'PostgreSQL', 'Redis', 'Docker'],
        systemArchitectureFocus: ['Microservices', 'High Concurrency', 'Caching & CDNs', 'Event-Driven Architecture'],
        notableAchievement: 'Architected WebRTC multi-party video conferencing engine with low-latency media signaling, scaling to 150K concurrent daily calls.',
        interviewPrepFocus: 'system_design',
      },
      resumeRawText: `ALEX RIVERA
alex.rivera@example.com | (555) 349-8821 | San Francisco, CA | github.com/alexrivera-dev

PROFESSIONAL SUMMARY
Senior Full-Stack Engineer with 6+ years of specialized experience in scalable distributed systems, real-time media/WebRTC streaming, React architectures, and high-throughput Node.js microservices.

SKILLS
Languages: TypeScript, JavaScript, Python, SQL, Go
Frameworks: React, Next.js, Express, Node.js, Tailwind CSS
Databases & Cloud: PostgreSQL, MongoDB, Redis, AWS, Docker, Kubernetes
Protocols & Real-time: WebRTC, WebSockets, REST APIs, gRPC

WORK EXPERIENCE
Nexus Realtime Inc. — Senior Full-Stack Engineer (March 2022 - Present)
- Engineered scalable WebRTC video conferencing engine handling 150k daily active sessions
- Led full-stack TypeScript migration, slashing production runtime errors by 42%
- Built comprehensive CI/CD pipelines with automated end-to-end integration tests

StreamScale Labs — Full-Stack Developer (July 2020 - Feb 2022)
- Built high-throughput telemetry analytics dashboard serving 1,200 enterprise customers
- Optimized PostgreSQL indexing and query execution plans, decreasing p95 latency by 45%

EDUCATION
B.S. in Computer Science — UC Berkeley (2016 - 2020)`,
      updatedAt: '2026-03-01T12:00:00.000Z',
    },
    {
      id: 'cand-2',
      userId: 'usr-cand-2',
      headline: 'Machine Learning & AI Platform Engineer',
      bio: 'Specialist in generative AI pipelines, LLM fine-tuning, retrieval-augmented generation (RAG), and high-scale Python microservices.',
      location: 'Seattle, WA',
      phone: '+1 (555) 812-4491',
      yearsOfExperience: 5,
      education: [
        {
          id: 'edu-2',
          institution: 'University of Washington',
          degree: 'M.S. in Computer Science (AI/ML)',
          fieldOfStudy: 'Artificial Intelligence',
          startYear: '2019',
          endYear: '2021',
        },
      ],
      skills: ['Python', 'PyTorch', 'FastAPI', 'LangChain', 'Transformers', 'Docker', 'GCP', 'PostgreSQL', 'Vector DBs'],
      experience: [
        {
          id: 'exp-3',
          company: 'Aether AI Labs',
          role: 'AI Infrastructure Engineer',
          location: 'Seattle, WA',
          startDate: '2021-08',
          endDate: 'Present',
          current: true,
          description: 'Designed production LLM evaluation harnesses, embedding pipelines, and semantic retrieval systems.',
          skillsUsed: ['Python', 'FastAPI', 'PyTorch', 'Vector DBs'],
        },
      ],
      projects: [],
      certifications: ['Google Cloud Professional ML Engineer'],
      links: {
        github: 'https://github.com/priyasharma-ai',
      },
      resumeFileName: 'Priya_Sharma_ML_Engineer.pdf',
      experienceTrack: 'experienced',
      onboardingCompleted: true,
      updatedAt: '2026-03-05T10:00:00.000Z',
    },
    {
      id: 'cand-3',
      userId: 'usr-cand-3',
      headline: 'Aspiring Software Engineer | Recent Computer Science Graduate',
      bio: 'Energetic and driven CS graduate with a solid grounding in Data Structures, Algorithms, OOPs, and modern full-stack web development. Eager to contribute to high-impact production engineering teams.',
      location: 'San Jose, CA',
      phone: '+1 (555) 723-9912',
      yearsOfExperience: 0,
      experienceTrack: 'fresher',
      onboardingCompleted: true,
      fresherDetails: {
        collegeName: 'San Jose State University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        graduationYear: '2025',
        targetRole: 'Graduate Software Engineer / Associate Frontend Dev',
        primarySkills: ['Java', 'Python', 'JavaScript', 'React', 'SQL', 'Git', 'Data Structures', 'REST APIs'],
        coreCoursework: [
          'Data Structures & Algorithms',
          'Object-Oriented Programming (OOP)',
          'Database Management Systems (DBMS)',
          'Operating Systems',
          'Computer Networks',
        ],
        finalYearProjectTitle: 'PeerCollab — Collaborative Coding Classroom',
        finalYearProjectSummary: 'Built a real-time syntax-highlighting code editor with WebSockets room synchronization, Docker sandbox code execution, and multi-user chat.',
        immediateGoal: 'campus_placements',
        practiceTrack: 'dsa_core',
      },
      education: [
        {
          id: 'edu-3',
          institution: 'San Jose State University',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startYear: '2021',
          endYear: '2025',
          gpa: '3.78',
        },
      ],
      skills: ['Java', 'Python', 'JavaScript', 'React', 'HTML/CSS', 'SQL', 'Git', 'Data Structures', 'Algorithms', 'OOPs'],
      experience: [],
      projects: [
        {
          id: 'proj-fresher-1',
          title: 'PeerCollab — Collaborative Coding Classroom',
          description: 'Web application enabling students to pair-code with real-time cursor sync and automated code test execution using Docker containers.',
          technologies: ['React', 'Node.js', 'Socket.io', 'Docker', 'SQLite'],
          link: 'https://github.com/davidchen-cs/peercollab',
        },
        {
          id: 'proj-fresher-2',
          title: 'Algoverse — Interactive Algorithm Visualizer',
          description: 'Animated sorting and graph traversal visualizer helping 2,000+ peers understand Dijkstra, A*, QuickSort, and MergeSort concepts.',
          technologies: ['React', 'TypeScript', 'Tailwind CSS'],
          link: 'https://github.com/davidchen-cs/algoverse',
        },
      ],
      certifications: ['AWS Certified Cloud Practitioner', 'HackerRank Problem Solving (Gold)'],
      links: {
        github: 'https://github.com/davidchen-cs',
        linkedin: 'https://linkedin.com/in/davidchen-cs',
      },
      resumeFileName: 'David_Chen_CS_Graduate_Resume.pdf',
      resumeRawText: `DAVID CHEN
david.chen@example.com | (555) 723-9912 | San Jose, CA | github.com/davidchen-cs

OBJECTIVE
Motivated Computer Science graduate seeking an entry-level Software Engineer / Graduate Associate position to apply rigorous algorithmic problem-solving and full-stack web skills.

EDUCATION
B.S. in Computer Science — San Jose State University (2021 - 2025)
GPA: 3.78 / 4.0
Relevant Coursework: Data Structures & Algorithms, Object-Oriented Software Engineering, Operating Systems, Database Management Systems, Computer Networks.

KEY PROJECTS
PeerCollab — Real-Time Collaborative Coding Room (React, Node.js, Socket.io, Docker)
- Designed synchronized code editor allowing 20+ simultaneous room participants with sub-50ms latency.
- Implemented secure backend code evaluation sandbox utilizing ephemeral Docker containers.

Algoverse — Interactive Algorithm Visualizer (TypeScript, React)
- Visualized 8 search and sorting algorithms with step-by-step playback, helping 2,000+ college peers.

TECHNICAL SKILLS
Languages: Java, Python, JavaScript, TypeScript, SQL, C++
Web & Tools: React, Node.js, Express, Git, Docker, Linux, REST APIs
Core Fundamentals: Data Structures, Algorithms, OOPs, DBMS, Operating Systems`,
      updatedAt: '2026-03-08T14:00:00.000Z',
    },
  ];

  const recruiters: RecruiterProfile[] = [
    {
      id: 'rec-1',
      userId: 'usr-rec-1',
      companyName: 'CloudScale AI',
      designation: 'Head of Technical Talent Acquisition',
      companyDetails: {
        industry: 'Enterprise Cloud & Applied AI',
        size: '250-500 employees',
        website: 'https://cloudscale.ai',
        location: 'San Francisco, CA (Hybrid / Remote Friendly)',
        about:
          'CloudScale AI powers mission-critical real-time intelligence for global enterprise infrastructure, trusted by Fortune 500 engineering teams.',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      },
      updatedAt: '2026-02-01T08:00:00.000Z',
    },
  ];

  const jobs: Job[] = initialJobs;

  const applications: Application[] = [
    {
      id: 'app-1',
      candidateId: 'cand-1',
      candidateName: 'Alex Rivera',
      candidateEmail: 'alex.rivera@example.com',
      candidateHeadline: 'Senior Full-Stack Engineer | Distributed Systems & React Architect',
      jobId: 'job-1',
      jobTitle: 'Senior Full-Stack Engineer (Real-Time & WebRTC)',
      companyName: 'CloudScale AI',
      resumeFileName: 'Alex_Rivera_Senior_FullStack_Resume.pdf',
      status: 'INTERVIEW_SCHEDULED',
      matchScore: {
        overallScore: 94,
        breakdown: {
          skillMatch: 95,
          experienceMatch: 96,
          educationMatch: 92,
          keywordMatch: 94,
          softSkillsMatch: 90,
        },
        strengths: [
          'Direct production experience architecting WebRTC peer connection pipelines',
          '6 years experience exceeds the 5-year requirement',
          'Demonstrated expertise across full stack: React, Node.js, and distributed media',
        ],
        missingSkills: ['Kubernetes in production (has certification)'],
        experienceRelevanceSummary:
          'Remarkable alignment with real-time media streaming requirements from Nexus Realtime Inc.',
        aiExplanation:
          'Evaluated against required competencies (TypeScript, React, Node.js, WebRTC, PostgreSQL). High semantic overlap across distributed networking and media signaling.',
        isAdvisoryOnly: true,
      },
      appliedAt: '2026-02-18T14:20:00.000Z',
      updatedAt: '2026-02-22T10:00:00.000Z',
      recruiterNotes: 'Very strong candidate background. Scheduled technical video interview.',
      interviewsCount: 1,
    },
    {
      id: 'app-2',
      candidateId: 'cand-2',
      candidateName: 'Priya Sharma',
      candidateEmail: 'priya.sharma@example.com',
      candidateHeadline: 'Machine Learning & AI Platform Engineer',
      jobId: 'job-2',
      jobTitle: 'AI/ML Systems Platform Engineer',
      companyName: 'CloudScale AI',
      resumeFileName: 'Priya_Sharma_ML_Engineer.pdf',
      status: 'UNDER_REVIEW',
      matchScore: {
        overallScore: 91,
        breakdown: {
          skillMatch: 94,
          experienceMatch: 88,
          educationMatch: 96,
          keywordMatch: 90,
          softSkillsMatch: 86,
        },
        strengths: [
          'M.S. in CS/AI directly matches target academic pedigree',
          'Deep practical vector embedding and FastAPI deployment background',
        ],
        missingSkills: ['Extensive GCP Kubernetes tooling'],
        experienceRelevanceSummary: 'Relevant experience building LLM evaluation harnesses at Aether AI.',
        aiExplanation:
          'Strong candidate for ML Platform team. Candidate matches 4 of 5 core required competencies.',
        isAdvisoryOnly: true,
      },
      appliedAt: '2026-02-23T16:00:00.000Z',
      updatedAt: '2026-02-24T09:15:00.000Z',
      recruiterNotes: 'Reviewed resume. Preparing shortlist recommendation.',
      interviewsCount: 0,
    },
  ];

  const sampleQuestions = [
    {
      id: 'q-sample-1',
      category: 'Technical' as const,
      question:
        'How would you design a WebRTC video streaming session with resilient ICE candidate handling and fallback when a peer is behind a symmetric NAT?',
      expectedKeyPoints: [
        'Role of STUN vs TURN servers for NAT traversal',
        'Trickle ICE candidates exchange via WebSocket signaling',
        'Handling media bitrate degradation and connection state renegotiation',
      ],
      suggestedDurationSeconds: 120,
      difficulty: 'Medium' as const,
    },
    {
      id: 'q-sample-2',
      category: 'System Architecture' as const,
      question:
        'Walk through how you prevent memory leaks and handle high concurrent WebSocket connections on a Node.js server under heavy load.',
      expectedKeyPoints: [
        'Cleaning up event listeners on connection close',
        'Horizontal clustering with Redis Pub/Sub backplane',
        'Backpressure handling and streaming binary payloads',
      ],
      suggestedDurationSeconds: 150,
      difficulty: 'Hard' as const,
    },
    {
      id: 'q-sample-3',
      category: 'Behavioral (STAR)' as const,
      question:
        'Tell me about a time when an architectural choice you made did not scale as anticipated in production. What happened, and how did you resolve it?',
      expectedKeyPoints: [
        'Situation & Context with honesty and ownership',
        'Diagnosis through metrics and APM tracing',
        'Actionable remediation, blameless post-mortem, long-term fix',
      ],
      suggestedDurationSeconds: 150,
      difficulty: 'Medium' as const,
    },
    {
      id: 'q-sample-4',
      category: 'HR & Culture' as const,
      question:
        'In a fast-paced environment where product specs can evolve quickly, how do you balance speed to market with maintaining strict code hygiene and test coverage?',
      expectedKeyPoints: [
        'Pragmatic prioritization of high-risk business logic for automated tests',
        'Feature flagging and incremental delivery',
        'Clear documentation of technical debt with repayment schedules',
      ],
      suggestedDurationSeconds: 90,
      difficulty: 'Easy' as const,
    },
  ];

  const interviews: Interview[] = [
    {
      id: 'int-1',
      applicationId: 'app-1',
      candidateId: 'cand-1',
      candidateName: 'Alex Rivera',
      jobId: 'job-1',
      jobTitle: 'Senior Full-Stack Engineer (Real-Time & WebRTC)',
      companyName: 'CloudScale AI',
      recruiterId: 'rec-1',
      type: 'AI Technical',
      scheduledAt: '2026-03-12T18:00:00.000Z',
      durationMinutes: 30,
      difficulty: 'Senior',
      topicCount: 4,
      status: 'SCHEDULED',
      meetingId: 'meet-cloudscale-8821',
      questions: sampleQuestions,
      currentQuestionIndex: 0,
      createdAt: '2026-02-22T10:00:00.000Z',
    },
  ];

  const interviewResults: InterviewResult[] = [];

  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      userId: 'usr-cand-1',
      title: 'Interview Scheduled',
      message: 'Your WebRTC AI Technical interview for Senior Full-Stack Engineer has been scheduled.',
      type: 'interview_scheduled',
      read: false,
      timestamp: '2026-02-22T10:05:00.000Z',
      linkTab: 'candidate-dashboard',
    },
    {
      id: 'notif-2',
      userId: 'usr-cand-1',
      title: 'AI Resume Match Calculated',
      message: 'Your resume achieved a 94% Advisory Match Score for CloudScale AI.',
      type: 'application_submitted',
      read: true,
      timestamp: '2026-02-18T14:22:00.000Z',
      linkTab: 'candidate-dashboard',
    },
    {
      id: 'notif-3',
      userId: 'usr-rec-1',
      title: 'New Application Received',
      message: 'Priya Sharma applied for AI/ML Systems Platform Engineer with 91% Match Score.',
      type: 'application_submitted',
      read: false,
      timestamp: '2026-02-23T16:01:00.000Z',
      linkTab: 'recruiter-dashboard',
    },
    {
      id: 'notif-4',
      userId: 'usr-adm-1',
      title: 'Fairness Guardrail Audit Clean',
      message: 'All AI models operating with zero protected attributes in prompt vectors.',
      type: 'status_change',
      read: true,
      timestamp: '2026-03-01T08:00:00.000Z',
      linkTab: 'admin-dashboard',
    },
  ];

  return {
    users,
    candidates,
    recruiters,
    jobs,
    applications,
    interviews,
    interviewResults,
    notifications,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    this.initMongo();
  }

  private async initMongo() {
    try {
      const mongoDb = await connectToMongoDB();
      if (mongoDb) {
        // If MongoDB has existing records, hydrate from MongoDB; otherwise seed initial data into collections
        const usersCount = await mongoDb.collection('users').countDocuments();
        if (usersCount > 0) {
          console.log('🔄 [MongoDB] Hydrating in-memory store from MongoDB Atlas...');
          const [users, candidates, recruiters, jobs, applications, interviews, interviewResults, notifications] =
            await Promise.all([
              mongoDb.collection<User>('users').find({}, { projection: { _id: 0 } }).toArray(),
              mongoDb.collection<CandidateProfile>('candidates').find({}, { projection: { _id: 0 } }).toArray(),
              mongoDb.collection<RecruiterProfile>('recruiters').find({}, { projection: { _id: 0 } }).toArray(),
              mongoDb.collection<Job>('jobs').find({}, { projection: { _id: 0 } }).toArray(),
              mongoDb.collection<Application>('applications').find({}, { projection: { _id: 0 } }).toArray(),
              mongoDb.collection<Interview>('interviews').find({}, { projection: { _id: 0 } }).toArray(),
              mongoDb.collection<InterviewResult>('interviewResults').find({}, { projection: { _id: 0 } }).toArray(),
              mongoDb.collection<AppNotification>('notifications').find({}, { projection: { _id: 0 } }).toArray(),
            ]);

          this.data = {
            users: users.length ? users : this.data.users,
            candidates: candidates.length ? candidates : this.data.candidates,
            recruiters: recruiters.length ? recruiters : this.data.recruiters,
            jobs: jobs.length ? jobs : this.data.jobs,
            applications: applications.length ? applications : this.data.applications,
            interviews: interviews.length ? interviews : this.data.interviews,
            interviewResults: interviewResults.length ? interviewResults : this.data.interviewResults,
            notifications: notifications.length ? notifications : this.data.notifications,
          };
          this.saveToDisk(this.data);
          console.log('✅ [MongoDB] Hydration complete.');
        } else {
          console.log('🌱 [MongoDB] Empty database detected. Seeding collections to MongoDB...');
          await this.syncAllToMongo(mongoDb);
          console.log('✅ [MongoDB] Initial collections successfully seeded to MongoDB.');
        }
      }
    } catch (err) {
      console.warn('⚠️ [MongoDB] Initialization sync error:', err);
    }
  }

  private async syncAllToMongo(mongoDb: any) {
    try {
      if (this.data.users.length) await mongoDb.collection('users').insertMany(this.data.users.map((u) => ({ ...u })));
      if (this.data.candidates.length) await mongoDb.collection('candidates').insertMany(this.data.candidates.map((c) => ({ ...c })));
      if (this.data.recruiters.length) await mongoDb.collection('recruiters').insertMany(this.data.recruiters.map((r) => ({ ...r })));
      if (this.data.jobs.length) await mongoDb.collection('jobs').insertMany(this.data.jobs.map((j) => ({ ...j })));
      if (this.data.applications.length) await mongoDb.collection('applications').insertMany(this.data.applications.map((a) => ({ ...a })));
      if (this.data.interviews.length) await mongoDb.collection('interviews').insertMany(this.data.interviews.map((i) => ({ ...i })));
      if (this.data.interviewResults.length) await mongoDb.collection('interviewResults').insertMany(this.data.interviewResults.map((r) => ({ ...r })));
      if (this.data.notifications.length) await mongoDb.collection('notifications').insertMany(this.data.notifications.map((n) => ({ ...n })));
    } catch (e) {
      console.warn('⚠️ [MongoDB] Error during initial seed:', e);
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.notifications) parsed.notifications = [];
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read persistent db file, initializing with defaults:', e);
    }
    const initial = getInitialData();
    this.saveToDisk(initial);
    return initial;
  }

  private saveToDisk(dataToSave: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed writing database to disk:', e);
    }
  }

  private persist(collectionName?: keyof DatabaseSchema, document?: any) {
    // 1. Immediately write to disk store for zero-latency local durability
    this.saveToDisk(this.data);

    // 2. Asynchronously upsert to MongoDB when connected
    const mongoDb = getMongoDb();
    if (mongoDb && collectionName && document && document.id) {
      const { _id: _ignored, ...cleanDoc } = document;
      mongoDb.collection(collectionName).updateOne(
        { id: cleanDoc.id } as any,
        { $set: cleanDoc },
        { upsert: true }
      ).catch((err) => {
        console.warn(`⚠️ [MongoDB] Failed to upsert to collection "${collectionName}":`, err.message);
      });
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.persist('users', user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist('users', this.data.users[idx]);
    return this.data.users[idx];
  }

  // Candidates
  getCandidates(): CandidateProfile[] {
    return this.data.candidates;
  }

  getCandidateByUserId(userId: string): CandidateProfile | undefined {
    return this.data.candidates.find((c) => c.userId === userId);
  }

  getCandidateById(id: string): CandidateProfile | undefined {
    return this.data.candidates.find((c) => c.id === id);
  }

  upsertCandidate(profile: CandidateProfile): CandidateProfile {
    const idx = this.data.candidates.findIndex((c) => c.id === profile.id || c.userId === profile.userId);
    if (idx >= 0) {
      this.data.candidates[idx] = { ...this.data.candidates[idx], ...profile, updatedAt: new Date().toISOString() };
      this.persist('candidates', this.data.candidates[idx]);
      return this.data.candidates[idx];
    } else {
      this.data.candidates.push(profile);
      this.persist('candidates', profile);
      return profile;
    }
  }

  // Recruiters
  getRecruiters(): RecruiterProfile[] {
    return this.data.recruiters;
  }

  getRecruiterByUserId(userId: string): RecruiterProfile | undefined {
    return this.data.recruiters.find((r) => r.userId === userId);
  }

  upsertRecruiter(profile: RecruiterProfile): RecruiterProfile {
    const idx = this.data.recruiters.findIndex((r) => r.id === profile.id || r.userId === profile.userId);
    if (idx >= 0) {
      this.data.recruiters[idx] = { ...this.data.recruiters[idx], ...profile, updatedAt: new Date().toISOString() };
      this.persist('recruiters', this.data.recruiters[idx]);
      return this.data.recruiters[idx];
    } else {
      this.data.recruiters.push(profile);
      this.persist('recruiters', profile);
      return profile;
    }
  }

  // Jobs
  getJobs(): Job[] {
    return this.data.jobs;
  }

  getJobById(id: string): Job | undefined {
    return this.data.jobs.find((j) => j.id === id);
  }

  createJob(job: Job): Job {
    this.data.jobs.unshift(job);
    this.persist('jobs', job);
    return job;
  }

  updateJob(id: string, updates: Partial<Job>): Job | null {
    const idx = this.data.jobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    this.data.jobs[idx] = { ...this.data.jobs[idx], ...updates, updatedAt: new Date().toISOString() };
    this.persist('jobs', this.data.jobs[idx]);
    return this.data.jobs[idx];
  }

  deleteJob(id: string): boolean {
    const len = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter((j) => j.id !== id);
    if (this.data.jobs.length !== len) {
      this.persist();
      const mongoDb = getMongoDb();
      if (mongoDb) {
        mongoDb.collection('jobs').deleteOne({ id } as any).catch((err) => {
          console.warn('⚠️ [MongoDB] Failed to delete job:', err.message);
        });
      }
      return true;
    }
    return false;
  }

  // Applications
  getApplications(): Application[] {
    return this.data.applications;
  }

  getApplicationById(id: string): Application | undefined {
    return this.data.applications.find((a) => a.id === id);
  }

  getApplicationsByCandidateId(candidateId: string): Application[] {
    return this.data.applications.filter((a) => a.candidateId === candidateId);
  }

  getApplicationsByJobId(jobId: string): Application[] {
    return this.data.applications.filter((a) => a.jobId === jobId);
  }

  createApplication(app: Application): Application {
    this.data.applications.unshift(app);
    // increment job applicant count
    const job = this.data.jobs.find((j) => j.id === app.jobId);
    if (job) {
      job.applicantCount = (job.applicantCount || 0) + 1;
      this.persist('jobs', job);
    }
    this.persist('applications', app);
    return app;
  }

  updateApplication(id: string, updates: Partial<Application>): Application | null {
    const idx = this.data.applications.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.applications[idx] = {
      ...this.data.applications[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist('applications', this.data.applications[idx]);
    return this.data.applications[idx];
  }

  // Interviews
  getInterviews(): Interview[] {
    return this.data.interviews;
  }

  getInterviewById(id: string): Interview | undefined {
    return this.data.interviews.find((i) => i.id === id);
  }

  createInterview(interview: Interview): Interview {
    this.data.interviews.unshift(interview);
    // Update application status
    const app = this.data.applications.find((a) => a.id === interview.applicationId);
    if (app) {
      app.status = 'INTERVIEW_SCHEDULED';
      app.interviewsCount = (app.interviewsCount || 0) + 1;
      this.persist('applications', app);
    }
    this.persist('interviews', interview);
    return interview;
  }

  updateInterview(id: string, updates: Partial<Interview>): Interview | null {
    const idx = this.data.interviews.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    this.data.interviews[idx] = { ...this.data.interviews[idx], ...updates };
    this.persist('interviews', this.data.interviews[idx]);
    return this.data.interviews[idx];
  }

  // Interview Results
  getInterviewResults(): InterviewResult[] {
    return this.data.interviewResults;
  }

  getInterviewResultByInterviewId(interviewId: string): InterviewResult | undefined {
    return this.data.interviewResults.find((r) => r.interviewId === interviewId);
  }

  saveInterviewResult(result: InterviewResult): InterviewResult {
    const idx = this.data.interviewResults.findIndex((r) => r.interviewId === result.interviewId);
    if (idx >= 0) {
      this.data.interviewResults[idx] = result;
    } else {
      this.data.interviewResults.unshift(result);
    }
    const interview = this.data.interviews.find((i) => i.id === result.interviewId);
    if (interview) {
      interview.status = 'COMPLETED';
      this.persist('interviews', interview);
    }
    this.persist('interviewResults', result);
    return result;
  }

  // Notifications (SRS Section 24)
  getNotifications(userId?: string): AppNotification[] {
    if (!this.data.notifications) this.data.notifications = [];
    if (!userId) return this.data.notifications;
    return this.data.notifications.filter((n) => n.userId === userId || n.userId === 'all');
  }

  createNotification(notification: AppNotification): AppNotification {
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift(notification);
    this.persist('notifications', notification);
    return notification;
  }

  markNotificationAsRead(id: string): boolean {
    if (!this.data.notifications) return false;
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist('notifications', notif);
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(userId?: string): boolean {
    if (!this.data.notifications) return false;
    this.data.notifications.forEach((n) => {
      if (!userId || n.userId === userId || n.userId === 'all') {
        n.read = true;
        this.persist('notifications', n);
      }
    });
    return true;
  }

  // Admin Metrics
  getAdminMetrics() {
    const activeCandidates = this.data.users.filter((u) => u.role === 'candidate' && u.status === 'active').length;
    const activeRecruiters = this.data.users.filter((u) => u.role === 'recruiter' && u.status === 'active').length;
    return {
      totalUsers: this.data.users.length,
      activeCandidates,
      activeRecruiters,
      candidatesCount: this.data.candidates.length,
      recruitersCount: this.data.recruiters.length,
      totalJobs: this.data.jobs.length,
      jobsCount: this.data.jobs.length,
      openJobsCount: this.data.jobs.filter((j) => j.status === 'OPEN').length,
      totalApplications: this.data.applications.length,
      applicationsCount: this.data.applications.length,
      interviewsConducted: this.data.interviews.filter((i) => i.status === 'COMPLETED').length,
      avgMatchScore:
        Math.round(
          this.data.applications.reduce((acc, a) => acc + (a.matchScore?.overallScore || 0), 0) /
            Math.max(1, this.data.applications.filter((a) => a.matchScore).length)
        ) || 88,
      statusBreakdown: {
        APPLIED: this.data.applications.filter((a) => a.status === 'APPLIED').length,
        UNDER_REVIEW: this.data.applications.filter((a) => a.status === 'UNDER_REVIEW').length,
        SHORTLISTED: this.data.applications.filter((a) => a.status === 'SHORTLISTED').length,
        INTERVIEW_SCHEDULED: this.data.applications.filter((a) => a.status === 'INTERVIEW_SCHEDULED').length,
        SELECTED: this.data.applications.filter((a) => a.status === 'SELECTED').length,
        REJECTED: this.data.applications.filter((a) => a.status === 'REJECTED').length,
      },
    };
  }
}

export const db = new Database();
