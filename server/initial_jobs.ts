import { Job } from '../src/types.ts';

export const initialJobs: Job[] = [
  // 1. Software Engineering
  {
    id: 'job-1',
    recruiterId: 'rec-1',
    companyName: 'CloudScale AI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Senior Full-Stack Engineer (Real-Time & WebRTC)',
    department: 'Software Engineering',
    description: `About the Role:
We are looking for a Senior Full-Stack Engineer to join our Core Real-Time Team. You will architect and build low-latency interactive collaboration experiences, peer-to-peer WebRTC video/audio streaming rooms, and resilient Express/Node microservices.

Key Responsibilities:
- Design and scale real-time media streaming, WebSockets, and WebRTC peer connection signaling.
- Build high-performance, accessible React user interfaces with responsive state and smooth animation cycles.
- Partner with product managers and AI researchers to embed intelligent candidate evaluation and scoring workflows.
- Champion code quality, observability, automated regression testing, and security best practices.

Requirements:
- 5+ years of full-stack software development experience.
- Strong proficiency in TypeScript, React, Node.js, and modern CSS/Tailwind.
- Practical experience with WebRTC (SDP offer/answer, STUN/TURN, ICE candidates) or real-time WebSockets.
- Familiarity with relational databases (PostgreSQL) and caching layers (Redis).
- Passion for transparent, human-in-the-loop AI assistive technologies.`,
    skills: {
      required: ['TypeScript', 'React', 'Node.js', 'WebRTC', 'PostgreSQL'],
      preferred: ['Docker', 'Redis', 'Kubernetes', 'AWS', 'Tailwind CSS'],
    },
    experienceMinYears: 5,
    experienceLevel: 'Senior',
    educationRequired: 'Bachelor’s in CS or equivalent practical experience',
    location: 'San Francisco, CA / Remote',
    remoteType: 'Hybrid',
    salaryRange: {
      min: 165000,
      max: 215000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-06-30',
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
    applicantCount: 12,
  },
  {
    id: 'job-4',
    recruiterId: 'rec-1',
    companyName: 'Nexus Core Systems',
    companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&auto=format&fit=crop&q=80',
    title: 'Senior Backend & Distributed Systems Engineer',
    department: 'Software Engineering',
    description: `About the Role:
Nexus Core Systems builds ultra-reliable distributed ledger and high-throughput transactional backends. As a Senior Backend Engineer, you will build and optimize distributed microservices capable of handling millions of concurrent operations with strict fault tolerance and sub-millisecond tail latency.

Key Responsibilities:
- Architect, implement, and benchmark distributed services in Go and Node.js.
- Implement event-driven architectures utilizing Apache Kafka, Redis Streams, and PostgreSQL.
- Build resilient gRPC and REST communication layers across federated services.
- Define service level objectives (SLOs), distributed tracing, and automated chaos engineering drills.

Requirements:
- 5+ years building distributed backend services at scale.
- Strong command of Go, Node.js/TypeScript, and high-performance SQL (PostgreSQL).
- Deep experience with message brokers (Kafka, RabbitMQ) and caching topologies (Redis).
- Solid grasp of concurrency, consensus protocols, and network socket programming.`,
    skills: {
      required: ['Go', 'Node.js', 'PostgreSQL', 'Redis', 'Distributed Systems'],
      preferred: ['Kafka', 'gRPC', 'Docker', 'Kubernetes', 'AWS'],
    },
    experienceMinYears: 5,
    experienceLevel: 'Senior',
    educationRequired: 'Bachelor’s or Master’s in Computer Science or related field',
    location: 'Austin, TX / Remote',
    remoteType: 'Hybrid',
    salaryRange: {
      min: 160000,
      max: 210000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-07-15',
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
    applicantCount: 9,
  },
  {
    id: 'job-5',
    recruiterId: 'rec-1',
    companyName: 'Apex Mobility',
    companyLogo: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&auto=format&fit=crop&q=80',
    title: 'Mobile Applications Engineer (iOS & React Native)',
    department: 'Software Engineering',
    description: `About the Role:
Apex Mobility is reimagining mobile productivity and intelligent connected experiences. We are looking for an experienced Mobile Engineer to craft silky-smooth, battery-efficient, and accessible iOS & React Native mobile applications.

Key Responsibilities:
- Build high-fidelity cross-platform mobile interfaces in React Native and native Swift modules.
- Optimize offline-first sync engines, local SQLite/WatermelonDB storage, and push notifications.
- Ensure 60fps animations and flawless interaction fidelity across various iOS and Android screen form factors.
- Manage CI/CD deployment pipelines through Fastlane, TestFlight, and Google Play Console.

Requirements:
- 4+ years of dedicated native iOS (Swift) and React Native application development.
- Deep familiarity with mobile performance tuning, memory leak detection, and offline state management.
- Experience consuming GraphQL and RESTful APIs with strict client caching.`,
    skills: {
      required: ['React Native', 'Swift', 'TypeScript', 'Mobile Architecture', 'iOS SDK'],
      preferred: ['Kotlin', 'GraphQL', 'Fastlane', 'Jest', 'Redux Toolkit'],
    },
    experienceMinYears: 4,
    experienceLevel: 'Mid',
    educationRequired: 'Bachelor’s degree in Computer Science or equivalent',
    location: 'New York, NY / Remote',
    remoteType: 'Remote',
    salaryRange: {
      min: 140000,
      max: 185000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-06-25',
    createdAt: '2026-03-02T11:00:00.000Z',
    updatedAt: '2026-03-02T11:00:00.000Z',
    applicantCount: 7,
  },

  // 2. DevOps & Cloud Infrastructure
  {
    id: 'job-6',
    recruiterId: 'rec-1',
    companyName: 'CloudScale AI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Staff DevOps & Cloud Platform Engineer',
    department: 'DevOps & Cloud Infrastructure',
    description: `About the Role:
As Staff DevOps & Infrastructure Engineer, you will own the architectural foundation of our multi-region Kubernetes clusters, automated GitOps deployment pipelines, and global edge network infrastructure.

Key Responsibilities:
- Architect and maintain enterprise-grade Kubernetes (EKS/GKE) clusters with autoscaling and zero downtime deployments.
- Author modular, reusable Infrastructure as Code (IaC) using Terraform and Helm.
- Build robust CI/CD pipelines with automated security linting, container scanning, and canary rollouts.
- Lead site reliability engineering (SRE) practices, APM instrumentation (Datadog/Prometheus), and disaster recovery drills.

Requirements:
- 6+ years of dedicated DevOps/Platform/SRE experience in AWS or GCP environments.
- Expert-level Kubernetes, Docker container lifecycle, and Linux network kernel tuning.
- Mastery of Terraform, ArgoCD/Flux GitOps, and cloud networking (VPC peering, Transit Gateways).`,
    skills: {
      required: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD Pipelines'],
      preferred: ['ArgoCD', 'Prometheus', 'Datadog', 'Go', 'GCP'],
    },
    experienceMinYears: 6,
    experienceLevel: 'Lead',
    educationRequired: 'B.S. in Computer Science or equivalent practical experience',
    location: 'San Francisco, CA / Remote',
    remoteType: 'Remote',
    salaryRange: {
      min: 175000,
      max: 230000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-07-01',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
    applicantCount: 11,
  },

  // 3. AI & Data Science
  {
    id: 'job-2',
    recruiterId: 'rec-1',
    companyName: 'CloudScale AI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'AI/ML Systems Platform Engineer',
    department: 'AI & Data Science',
    description: `About the Role:
Build and optimize distributed inference pipelines, NLP resume extraction models, and semantic matching engines. You will work directly on high-throughput LLM integrations, retrieval augmented generation, and model evaluation systems.

Responsibilities:
- Build low-latency Python/FastAPI microservices interfacing with modern LLMs and vector embeddings.
- Ensure rigorous AI fairness guardrails: bias mitigation, transparent explainability factors, and human-in-the-loop review.
- Optimize batch inference throughput, GPU memory caching, and fallback resilience.`,
    skills: {
      required: ['Python', 'FastAPI', 'PyTorch', 'Vector Databases', 'Transformers'],
      preferred: ['LangChain', 'Docker', 'Kubernetes', 'GCP', 'PostgreSQL'],
    },
    experienceMinYears: 4,
    experienceLevel: 'Mid',
    educationRequired: 'B.S. or M.S. in Computer Science or related STEM field',
    location: 'Seattle, WA / Remote',
    remoteType: 'Remote',
    salaryRange: {
      min: 155000,
      max: 195000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-06-15',
    createdAt: '2026-02-20T09:00:00.000Z',
    updatedAt: '2026-02-20T09:00:00.000Z',
    applicantCount: 14,
  },
  {
    id: 'job-7',
    recruiterId: 'rec-1',
    companyName: 'Horizon Insights AI',
    companyLogo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
    title: 'Lead Data Scientist & Predictive Modeling',
    department: 'AI & Data Science',
    description: `About the Role:
Horizon Insights transforms complex organizational telemetry into predictive hiring and talent retention signals. We are seeking a Lead Data Scientist to direct algorithmic discovery, causal inference models, and multi-factor workforce intelligence models.

Key Responsibilities:
- Design, train, and validate supervised and unsupervised predictive models in Python/R.
- Conduct robust hypothesis testing, randomized A/B experimentation, and bias audit benchmarks.
- Collaborate with engineering to convert exploratory research notebooks into production scoring pipelines.
- Translate statistical findings into actionable executive dashboards and data stories.

Requirements:
- 5+ years applied statistical modeling and machine learning experience.
- Deep expertise in statistical inference, regression analysis, random forests, and gradient boosting.
- Strong SQL proficiency across columnar data warehouses (Snowflake, BigQuery).`,
    skills: {
      required: ['Python', 'SQL', 'Machine Learning', 'Statistical Modeling', 'Scikit-learn'],
      preferred: ['Pandas', 'XGBoost', 'A/B Testing', 'Tableau', 'BigQuery'],
    },
    experienceMinYears: 5,
    experienceLevel: 'Senior',
    educationRequired: 'Master’s or Ph.D. in Data Science, Statistics, Mathematics or related field',
    location: 'Boston, MA / Remote',
    remoteType: 'Hybrid',
    salaryRange: {
      min: 160000,
      max: 210000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-07-20',
    createdAt: '2026-03-03T10:00:00.000Z',
    updatedAt: '2026-03-03T10:00:00.000Z',
    applicantCount: 8,
  },
  {
    id: 'job-8',
    recruiterId: 'rec-1',
    companyName: 'DataStream Core',
    companyLogo: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=100&auto=format&fit=crop&q=80',
    title: 'Big Data Platform & Analytics Engineer',
    department: 'AI & Data Science',
    description: `About the Role:
DataStream Core ingests petabytes of streaming events daily. We are looking for an Analytics & Data Platform Engineer to design reliable data pipelines, ELT frameworks, and unified analytical warehouses.

Key Responsibilities:
- Build batch and real-time data pipelines using Apache Spark, Kafka, and dbt.
- Model dimensional data marts and maintain schema migrations in Snowflake and Databricks.
- Enforce automated data quality assertions, lineage tracing, and metadata catalogs.
- Partner with BI analysts to minimize query execution latencies and cloud computing expenditure.

Requirements:
- 4+ years of data engineering experience with modern cloud data stacks.
- Advanced SQL and Python data manipulation skills.
- Hands-on experience with Apache Airflow or Prefect orchestration and dbt data transformations.`,
    skills: {
      required: ['Apache Spark', 'Snowflake', 'Python', 'SQL', 'dbt'],
      preferred: ['Airflow', 'Kafka', 'Databricks', 'AWS Redshift', 'Data Modeling'],
    },
    experienceMinYears: 4,
    experienceLevel: 'Mid',
    educationRequired: 'Bachelor’s in Computer Science, Information Systems, or equivalent',
    location: 'Chicago, IL / Remote',
    remoteType: 'Remote',
    salaryRange: {
      min: 150000,
      max: 190000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-06-30',
    createdAt: '2026-03-04T08:00:00.000Z',
    updatedAt: '2026-03-04T08:00:00.000Z',
    applicantCount: 6,
  },

  // 4. Product Management
  {
    id: 'job-9',
    recruiterId: 'rec-1',
    companyName: 'CloudScale AI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Senior Technical Product Manager (Cloud Platform & APIs)',
    department: 'Product Management',
    description: `About the Role:
Join CloudScale AI as Senior Technical Product Manager driving our core developer platform, partner APIs, and enterprise integration ecosystem.

Key Responsibilities:
- Own the multi-quarter roadmap for external APIs, SDKs, webhook infrastructure, and developer documentation.
- Conduct in-depth customer interviews with CTOs and lead architects to identify high-impact platform capabilities.
- Write crisp product requirement documents (PRDs), user stories, and acceptance criteria in an agile environment.
- Coordinate go-to-market launches with Developer Relations, Product Marketing, and Customer Success.

Requirements:
- 5+ years of product management experience focused on developer tooling, cloud platforms, or APIs.
- Technical background (CS degree or previous engineering/architecture experience).
- Proven track record taking zero-to-one API products to market and measuring API adoption metrics.`,
    skills: {
      required: ['Product Strategy', 'API Design', 'Technical Roadmapping', 'Agile/Scrum', 'PRDs'],
      preferred: ['SQL', 'JIRA', 'Developer Relations', 'Postman', 'User Research'],
    },
    experienceMinYears: 5,
    experienceLevel: 'Senior',
    educationRequired: 'Bachelor’s in Computer Science, Engineering, or equivalent experience',
    location: 'San Francisco, CA',
    remoteType: 'Hybrid',
    salaryRange: {
      min: 165000,
      max: 215000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-07-10',
    createdAt: '2026-03-02T14:00:00.000Z',
    updatedAt: '2026-03-02T14:00:00.000Z',
    applicantCount: 10,
  },
  {
    id: 'job-10',
    recruiterId: 'rec-1',
    companyName: 'Nova Apps & Consumer Labs',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80',
    title: 'Growth & Mobile Product Manager',
    department: 'Product Management',
    description: `About the Role:
Nova creates consumer digital products used by millions. We need an analytical, experiment-driven Growth Product Manager to optimize onboarding funnels, activation loops, and subscription conversion mechanics.

Key Responsibilities:
- Design, hypothesize, and execute continuous A/B test iterations across user signup and freemium-to-paid conversion funnels.
- Partner with product designers and mobile engineers to test viral loops and referral mechanics.
- Deep-dive into behavioral cohort analytics using Mixpanel, Amplitude, and SQL to isolate drop-off points.
- Align cross-functional squads around North Star retention and Lifetime Value (LTV) metrics.

Requirements:
- 3+ years of dedicated growth or consumer product management experience.
- Strong quantitative acumen and fluency in cohort analysis, funnel diagnostics, and statistical significance.
- Empathy for seamless, delightful user experiences.`,
    skills: {
      required: ['Product Analytics', 'Growth Experimentation', 'A/B Testing', 'Amplitude/Mixpanel', 'Funnel Optimization'],
      preferred: ['SQL', 'User Psychology', 'Mobile UX', 'Subscription Monetization'],
    },
    experienceMinYears: 3,
    experienceLevel: 'Mid',
    educationRequired: 'Bachelor’s degree in Business, Economics, Computer Science, or related field',
    location: 'Los Angeles, CA / Remote',
    remoteType: 'Remote',
    salaryRange: {
      min: 135000,
      max: 175000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-06-20',
    createdAt: '2026-03-04T12:00:00.000Z',
    updatedAt: '2026-03-04T12:00:00.000Z',
    applicantCount: 15,
  },

  // 5. Design & Creative
  {
    id: 'job-3',
    recruiterId: 'rec-1',
    companyName: 'CloudScale AI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Staff Frontend Architect (Design Systems & WebGL)',
    department: 'Design & Creative',
    description: `Drive frontend technical vision across our recruitment and analytics suite. Craft micro-interactions, responsive dashboard visualizations, and accessible component architectures.`,
    skills: {
      required: ['TypeScript', 'React', 'Tailwind CSS', 'Performance Optimization', 'Design Systems'],
      preferred: ['Next.js', 'WebGL', 'Framer Motion', 'Micro-frontends'],
    },
    experienceMinYears: 7,
    experienceLevel: 'Lead',
    educationRequired: 'Bachelor’s degree or equivalent experience',
    location: 'New York, NY / Remote',
    remoteType: 'Remote',
    salaryRange: {
      min: 180000,
      max: 235000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-06-30',
    createdAt: '2026-02-25T11:00:00.000Z',
    updatedAt: '2026-02-25T11:00:00.000Z',
    applicantCount: 5,
  },
  {
    id: 'job-11',
    recruiterId: 'rec-1',
    companyName: 'Lumina Design Lab',
    companyLogo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=100&auto=format&fit=crop&q=80',
    title: 'Senior UI/UX & Product Experience Designer',
    department: 'Design & Creative',
    description: `About the Role:
Lumina Design Lab crafts world-class enterprise SaaS interfaces with consumer-grade polish. We are seeking a Senior Product Designer to establish intuitive workflows, responsive design token libraries, and high-fidelity interaction prototypes.

Key Responsibilities:
- Lead end-to-end product design from user discovery interviews to final pixel-perfect developer handoff in Figma.
- Maintain and scale a centralized multi-brand design system with accessible WCAG AAA color systems and typography.
- Create interactive micro-prototypes to validate complex interactions before engineering kick-off.
- Facilitate design critiques and partner closely with engineers to ensure flawless implementation.

Requirements:
- 5+ years designing responsive web applications and mobile products.
- Expert-level Figma mastery (Variables, Auto-layout, component variants, and interactive prototyping).
- Outstanding portfolio exhibiting clear problem framing, information architecture, and typographic hierarchy.`,
    skills: {
      required: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Wireframing & Prototyping'],
      preferred: ['WCAG Accessibility', 'Design Tokens', 'User Journey Mapping', 'Motion Design'],
    },
    experienceMinYears: 5,
    experienceLevel: 'Senior',
    educationRequired: 'Degree in HCI, Graphic/Product Design, or equivalent practical portfolio',
    location: 'San Francisco, CA / Remote',
    remoteType: 'Hybrid',
    salaryRange: {
      min: 145000,
      max: 190000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-07-05',
    createdAt: '2026-03-03T15:00:00.000Z',
    updatedAt: '2026-03-03T15:00:00.000Z',
    applicantCount: 16,
  },

  // 6. Cybersecurity & Trust
  {
    id: 'job-12',
    recruiterId: 'rec-1',
    companyName: 'Fortify Sentinel Corp',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
    title: 'Lead Cloud Security & DevSecOps Architect',
    department: 'Cybersecurity & Trust',
    description: `About the Role:
Fortify Sentinel provides automated threat intelligence and zero-trust perimeter defense for enterprise customers. We are hiring a Lead Cloud Security Architect to harden cloud infrastructure, manage compliance certifications (SOC 2, ISO 27001), and spearhead proactive vulnerability assessments.

Key Responsibilities:
- Design and implement Zero Trust architecture across multi-cloud environments (AWS and GCP).
- Embed automated SAST/DAST and software composition analysis (SCA) into continuous deployment pipelines.
- Conduct threat modeling, penetration testing drills, and coordinate external third-party security audits.
- Lead security incident response workflows, forensic root-cause analysis, and executive threat briefs.

Requirements:
- 6+ years in information security, cloud security engineering, and penetration testing.
- Hands-on expertise with AWS IAM, GuardDuty, KMS, HashiCorp Vault, and Kubernetes security controls.
- Active professional certifications (CISSP, CCSP, or AWS Certified Security - Specialty).`,
    skills: {
      required: ['Cloud Security', 'SOC 2 & Compliance', 'Zero Trust', 'Penetration Testing', 'IAM Security'],
      preferred: ['HashiCorp Vault', 'Kubernetes Security', 'Threat Modeling', 'CISSP', 'SIEM'],
    },
    experienceMinYears: 6,
    experienceLevel: 'Senior',
    educationRequired: 'Bachelor’s in Cybersecurity, Computer Science, or equivalent experience',
    location: 'Washington, DC / Remote',
    remoteType: 'Remote',
    salaryRange: {
      min: 180000,
      max: 240000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-07-30',
    createdAt: '2026-03-05T09:00:00.000Z',
    updatedAt: '2026-03-05T09:00:00.000Z',
    applicantCount: 4,
  },

  // 7. Marketing & Growth
  {
    id: 'job-13',
    recruiterId: 'rec-1',
    companyName: 'CloudScale AI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Director of Product Marketing & Go-To-Market',
    department: 'Marketing & Growth',
    description: `About the Role:
CloudScale AI is seeking an accomplished Product Marketing Director to own positioning, competitive intelligence, and high-velocity go-to-market execution across our enterprise AI portfolio.

Key Responsibilities:
- Formulate clear, differentiated value propositions and customer persona messaging for enterprise buyers.
- Architect tier-1 product launch campaigns across web, analyst relations, webinars, and customer case studies.
- Arm our enterprise sales force with high-impact pitch decks, competitive battlecards, and ROI calculators.
- Partner with Product Management to influence roadmap priorities based on market trends and buyer feedback.

Requirements:
- 7+ years of B2B SaaS product marketing experience, preferably in cloud, developer platforms, or AI.
- Demonstrated success leading major enterprise product launches that drove measurable pipeline expansion.
- Exceptional storytelling, executive presentation, and strategic writing capabilities.`,
    skills: {
      required: ['Product Marketing', 'Go-To-Market Strategy', 'B2B SaaS Messaging', 'Competitive Intelligence', 'Content Strategy'],
      preferred: ['Analyst Relations (Gartner/Forrester)', 'Sales Enablement', 'Webinar Presentations', 'HubSpot'],
    },
    experienceMinYears: 7,
    experienceLevel: 'Lead',
    educationRequired: 'Bachelor’s degree in Marketing, Communications, Business, or related discipline',
    location: 'San Francisco, CA',
    remoteType: 'Hybrid',
    salaryRange: {
      min: 170000,
      max: 220000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-06-30',
    createdAt: '2026-03-05T13:00:00.000Z',
    updatedAt: '2026-03-05T13:00:00.000Z',
    applicantCount: 7,
  },
  {
    id: 'job-14',
    recruiterId: 'rec-1',
    companyName: 'ScalePulse Digital',
    companyLogo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&auto=format&fit=crop&q=80',
    title: 'Performance Growth & Technical SEO Manager',
    department: 'Marketing & Growth',
    description: `About the Role:
ScalePulse Digital accelerates acquisition for leading tech innovators. We are seeking a Performance Growth Manager to optimize multi-channel inbound traffic, technical SEO audits, and high-ROI digital demand generation campaigns.

Key Responsibilities:
- Manage multi-platform paid acquisition campaigns (Google Search, LinkedIn Ads) maintaining strict CAC/LTV targets.
- Conduct technical SEO site audits, core web vitals optimization, backlink strategy, and keyword clusters.
- Run continuous landing page A/B tests to optimize visitor-to-lead conversion rates.
- Build comprehensive attribution models and multi-touch reporting dashboards in GA4 and Looker Studio.

Requirements:
- 4+ years managing digital performance marketing and technical SEO for B2B or B2C technology brands.
- Deep familiarity with Google Search Console, Ahrefs/Semrush, Google Tag Manager, and GA4.
- High analytical rigor with spreadsheets, pivot tables, and statistical testing methodologies.`,
    skills: {
      required: ['Technical SEO', 'Paid Acquisition (PPC/SEM)', 'Google Analytics 4', 'Conversion Rate Optimization (CRO)', 'A/B Testing'],
      preferred: ['Looker Studio', 'Google Tag Manager', 'Ahrefs', 'Landing Page Optimization'],
    },
    experienceMinYears: 4,
    experienceLevel: 'Mid',
    educationRequired: 'Bachelor’s degree in Marketing, Analytics, or relevant experience',
    location: 'Denver, CO / Remote',
    remoteType: 'Remote',
    salaryRange: {
      min: 125000,
      max: 160000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-06-25',
    createdAt: '2026-03-06T10:00:00.000Z',
    updatedAt: '2026-03-06T10:00:00.000Z',
    applicantCount: 13,
  },

  // 8. Sales & Business Development
  {
    id: 'job-15',
    recruiterId: 'rec-1',
    companyName: 'CloudScale AI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Enterprise Account Executive (B2B SaaS & AI Solutions)',
    department: 'Sales & Partnerships',
    description: `About the Role:
We are expanding our Enterprise Sales team to accelerate adoption of CloudScale AI across Fortune 1000 organizations. You will manage complex, multi-stakeholder sales cycles from initial discovery to commercial negotiation.

Key Responsibilities:
- Build, manage, and close a multimillion-dollar pipeline of enterprise opportunities in assigned territories.
- Navigate complex procurement, infosec reviews, legal redlines, and executive sponsor consensus.
- Conduct strategic discovery with VP and C-level buyers to align CloudScale capabilities with strategic business outcomes.
- Partner with Solutions Architects to deliver compelling technical proof-of-concepts (POCs).

Requirements:
- 5+ years of direct quota-carrying software sales experience in enterprise SaaS or cloud infrastructure.
- Track record of consistently exceeding quota ($1M+ ARR annual targets).
- Mastery of modern sales methodologies (MEDDPICC, Command of the Message, Challenger Sale).`,
    skills: {
      required: ['Enterprise Sales', 'SaaS Quota Achievement', 'MEDDPICC', 'Contract Negotiation', 'Salesforce CRM'],
      preferred: ['C-Level Discovery', 'Cloud Infrastructure Sales', 'Pipeline Forecasting'],
    },
    experienceMinYears: 5,
    experienceLevel: 'Senior',
    educationRequired: 'Bachelor’s degree in Business Administration, Communications, or equivalent',
    location: 'New York, NY',
    remoteType: 'Hybrid',
    salaryRange: {
      min: 150000,
      max: 260000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-07-15',
    createdAt: '2026-03-04T09:00:00.000Z',
    updatedAt: '2026-03-04T09:00:00.000Z',
    applicantCount: 11,
  },
  {
    id: 'job-16',
    recruiterId: 'rec-1',
    companyName: 'CloudScale AI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Senior Solutions Architect & Pre-Sales Consultant',
    department: 'Sales & Partnerships',
    description: `About the Role:
As Senior Solutions Architect, you will serve as the trusted technical advisor to enterprise prospects, translating complex architectural requirements into seamless CloudScale deployment plans.

Key Responsibilities:
- Partner with Account Executives on technical qualification, RFP responses, and customized architecture diagrams.
- Deliver tailored live product demonstrations and design hands-on Proof of Concept (POC) validation environments.
- Address technical objections surrounding data privacy, latency, cloud security, and API integrations.
- Provide a critical feedback bridge between enterprise customers and our internal engineering teams.

Requirements:
- 5+ years in a customer-facing technical role (Solutions Architecture, Sales Engineering, or Technical Consulting).
- Solid technical grounding in cloud architecture, REST/GraphQL APIs, distributed networking, and containerization.
- Polished presentation, whiteboard communication, and executive stakeholder presence.`,
    skills: {
      required: ['Technical Pre-Sales', 'Solution Architecture', 'Client Presentations', 'API Integrations', 'RFP Responses'],
      preferred: ['AWS/GCP Certified', 'Cloud Networking', 'Proof of Concept (POC) Management'],
    },
    experienceMinYears: 5,
    experienceLevel: 'Senior',
    educationRequired: 'Bachelor’s degree in Computer Science, Information Systems, or Engineering',
    location: 'Chicago, IL / Remote',
    remoteType: 'Remote',
    salaryRange: {
      min: 165000,
      max: 215000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-06-30',
    createdAt: '2026-03-05T11:00:00.000Z',
    updatedAt: '2026-03-05T11:00:00.000Z',
    applicantCount: 6,
  },

  // 9. Human Resources & People Operations
  {
    id: 'job-17',
    recruiterId: 'rec-1',
    companyName: 'CloudScale AI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Senior Technical Talent Partner & Recruiter',
    department: 'Human Resources & People',
    description: `About the Role:
CloudScale AI is scaling rapidly. We are searching for an agile, highly empathetic Senior Technical Recruiter to partner with engineering leadership and attract exceptional software, AI, and platform engineering talent.

Key Responsibilities:
- Manage full-cycle technical recruiting across senior, staff, and leadership engineering positions.
- Develop creative passive sourcing strategies on GitHub, LinkedIn Recruiter, and tech communities.
- Coach hiring managers on inclusive interview evaluation rubrics and structured assessment scorecards.
- Deliver an unforgettable, transparent candidate experience from first touch through signed offer.

Requirements:
- 4+ years of technical recruiting experience in high-growth tech startups or tech agencies.
- Deep comprehension of software engineering roles, tech stacks, and modern compensation benchmarking.
- Proficiency in Greenhouse, Ashby, or Workday ATS platforms.`,
    skills: {
      required: ['Technical Recruiting', 'Full-Lifecycle Sourcing', 'Candidate Experience', 'Greenhouse/ATS', 'Offer Negotiation'],
      preferred: ['Diversity & Inclusion (DEI)', 'Compensation Benchmarking', 'Data-Driven Hiring Metrics'],
    },
    experienceMinYears: 4,
    experienceLevel: 'Mid',
    educationRequired: 'Bachelor’s degree or equivalent practical talent experience',
    location: 'San Francisco, CA / Remote',
    remoteType: 'Remote',
    salaryRange: {
      min: 120000,
      max: 160000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-06-30',
    createdAt: '2026-03-02T10:00:00.000Z',
    updatedAt: '2026-03-02T10:00:00.000Z',
    applicantCount: 18,
  },
  {
    id: 'job-18',
    recruiterId: 'rec-1',
    companyName: 'TalentPulse Global',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80',
    title: 'People Operations & Culture Business Partner (HRBP)',
    department: 'Human Resources & People',
    description: `About the Role:
TalentPulse is looking for an experienced HR Business Partner to nurture our distributed team culture, spearhead performance management cycles, and champion employee engagement initiatives.

Key Responsibilities:
- Partner directly with department executives on organizational design, headcount planning, and succession pipelines.
- Resolve complex employee relations questions with empathy, equity, and confidentiality.
- Design and execute remote-first onboarding bootcamps, continuous learning stipends, and wellness programs.
- Track workforce health metrics (eNPS, retention, burnout signals) and provide proactive interventions.

Requirements:
- 5+ years of progressive HR/People Operations experience, with at least 2 years in an HRBP capacity.
- Thorough knowledge of federal and state labor standards, FMLA, leave administration, and compensation laws.
- High emotional intelligence, conflict resolution, and change management mastery.`,
    skills: {
      required: ['People Operations', 'HR Business Partnering (HRBP)', 'Employee Relations', 'Performance Management', 'Culture & Engagement'],
      preferred: ['SHRM-CP/PHR Certification', 'Organizational Design', 'Remote Team Culture'],
    },
    experienceMinYears: 5,
    experienceLevel: 'Senior',
    educationRequired: 'Bachelor’s degree in Human Resources, Psychology, or related field',
    location: 'Austin, TX',
    remoteType: 'Hybrid',
    salaryRange: {
      min: 130000,
      max: 175000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-07-20',
    createdAt: '2026-03-04T16:00:00.000Z',
    updatedAt: '2026-03-04T16:00:00.000Z',
    applicantCount: 14,
  },

  // 10. Finance & Accounting
  {
    id: 'job-19',
    recruiterId: 'rec-1',
    companyName: 'Vantage Capital Group',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    title: 'Strategic Finance & Corporate FP&A Manager',
    department: 'Finance & Accounting',
    description: `About the Role:
Vantage Capital Group guides high-growth technology investments and enterprise capital allocation. We are seeking a Strategic Finance & FP&A Manager to lead corporate budget forecasting, SaaS unit economics modeling, and board presentation packages.

Key Responsibilities:
- Build dynamic financial models forecasting ARR, gross margins, cash burn runway, and headcount expenditures.
- Lead the annual strategic planning and quarterly budget re-forecast processes across all global business units.
- Deliver monthly variance analyses and strategic KPIs (CAC payback, Net Retention Rate, Magic Number) to executive leadership.
- Assist in capital fundraising due diligence, debt facility compliance, and M&A evaluation.

Requirements:
- 5+ years of strategic finance, investment banking, private equity, or corporate FP&A experience.
- Elite financial modeling skills in Excel/Google Sheets; SQL data extraction proficiency is strongly preferred.
- Deep familiarity with SaaS revenue recognition (ASC 606) and enterprise billing cycles.`,
    skills: {
      required: ['Financial Modeling', 'Corporate FP&A', 'SaaS Unit Economics', 'Budget Forecasting', 'Variance Analysis'],
      preferred: ['SQL', 'NetSuite', 'ChartMogul', 'CFA/CPA Credential', 'Board Reporting'],
    },
    experienceMinYears: 5,
    experienceLevel: 'Senior',
    educationRequired: 'Bachelor’s degree in Finance, Accounting, Economics, or Mathematics',
    location: 'New York, NY',
    remoteType: 'On-site',
    salaryRange: {
      min: 150000,
      max: 195000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-07-15',
    createdAt: '2026-03-05T14:00:00.000Z',
    updatedAt: '2026-03-05T14:00:00.000Z',
    applicantCount: 8,
  },

  // 11. Customer Success & Operations
  {
    id: 'job-20',
    recruiterId: 'rec-1',
    companyName: 'CloudScale AI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Enterprise Customer Success & Implementation Director',
    department: 'Customer Success & Operations',
    description: `About the Role:
Our Enterprise Customer Success organization ensures our strategic enterprise customers realize rapid time-to-value and achieve lasting transformation. As Director of Customer Success, you will lead account health, executive business reviews (EBRs), and renewals.

Key Responsibilities:
- Own Net Revenue Retention (NRR) and gross renewal targets across high-touch enterprise accounts.
- Lead onboarding workshops and technical integration milestones with customer stakeholders and IT admins.
- Establish proactive health scoring metrics to identify expansion opportunities and flag churn risks early.
- Build a consultative team of Customer Success Managers and implementation specialists.

Requirements:
- 6+ years in enterprise customer success, account management, or management consulting in SaaS.
- Proven history retaining and expanding multi-million-dollar account portfolios.
- Exceptional executive presence, escalation management, and customer advocacy skills.`,
    skills: {
      required: ['Customer Success', 'Enterprise Client Management', 'Renewals & NRR', 'Implementation Strategy', 'Executive EBRs'],
      preferred: ['Gainsight', 'Salesforce', 'Churn Risk Mitigation', 'Team Leadership'],
    },
    experienceMinYears: 6,
    experienceLevel: 'Lead',
    educationRequired: 'Bachelor’s degree in Business, Communications, or related discipline',
    location: 'Seattle, WA / Remote',
    remoteType: 'Remote',
    salaryRange: {
      min: 155000,
      max: 205000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-06-30',
    createdAt: '2026-03-06T12:00:00.000Z',
    updatedAt: '2026-03-06T12:00:00.000Z',
    applicantCount: 9,
  },

  // 12. Legal & Compliance
  {
    id: 'job-21',
    recruiterId: 'rec-1',
    companyName: 'CloudScale AI',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    title: 'Corporate Legal Counsel & AI Ethics Officer',
    department: 'Legal & Compliance',
    description: `About the Role:
CloudScale AI is at the forefront of ethical AI and enterprise cloud automation. We are seeking Corporate Legal Counsel to manage enterprise software licenses, vendor contracts, data privacy governance, and emerging AI regulatory compliance.

Key Responsibilities:
- Draft, review, and negotiate enterprise SaaS agreements, vendor contracts, NDAs, and data processing addenda (DPAs).
- Counsel product and engineering teams on global data protection frameworks (GDPR, CCPA, CPRA, EU AI Act).
- Formulate responsible AI governance policies, model audit transparency rules, and algorithmic risk mitigation.
- Manage intellectual property portfolio registrations, corporate compliance filings, and external legal counsel.

Requirements:
- J.D. from an accredited law school and active state bar license in good standing.
- 5+ years of legal practice in-house at a technology company or top-tier law firm focusing on commercial tech transactions.
- Deep comprehension of data privacy statutes and passion for artificial intelligence legal frontier issues.`,
    skills: {
      required: ['Commercial Contracts', 'Tech SaaS Agreements', 'Data Privacy (GDPR/CCPA)', 'AI Governance & Ethics', 'Legal Risk Analysis'],
      preferred: ['EU AI Act', 'Intellectual Property', 'Corporate Governance', 'Negotiation'],
    },
    experienceMinYears: 5,
    experienceLevel: 'Senior',
    educationRequired: 'Juris Doctor (J.D.) degree and active Bar membership',
    location: 'San Francisco, CA',
    remoteType: 'Hybrid',
    salaryRange: {
      min: 185000,
      max: 245000,
      currency: 'USD',
    },
    jobType: 'Full-time',
    status: 'OPEN',
    deadline: '2026-07-31',
    createdAt: '2026-03-05T15:00:00.000Z',
    updatedAt: '2026-03-05T15:00:00.000Z',
    applicantCount: 5,
  },
];
