import { Job, User, UserRole, Application } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  role: UserRole.JOB_SEEKER,
  resumeText: `
    Senior React Developer with 5 years of experience.
    Proficient in TypeScript, Next.js, Tailwind CSS, and Node.js.
    Experience with state management (Redux, Context API).
    Strong background in UI/UX design principles.
    History of leading frontend teams and delivering scalable web applications.
  `
};

export const MOCK_RECRUITER: User = {
  id: 'r1',
  name: 'Sarah Connor',
  email: 'sarah@techcorp.com',
  role: UserRole.RECRUITER
};

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Senior Frontend Engineer',
    company: 'TechCorp',
    location: 'Remote',
    salary: '$120k - $150k',
    type: 'Full-time',
    postedDate: '2023-10-25',
    recruiterId: 'r1',
    description: 'We are looking for a Senior Frontend Engineer to join our core product team. You will be responsible for building high-performance web applications using React and TypeScript.',
    requirements: ['React', 'TypeScript', 'Tailwind CSS', '5+ years experience', 'CI/CD']
  },
  {
    id: 'j2',
    title: 'Full Stack Developer',
    company: 'InnovateAI',
    location: 'San Francisco, CA',
    salary: '$130k - $160k',
    type: 'Full-time',
    postedDate: '2023-10-24',
    recruiterId: 'r2',
    description: 'Join our AI team to build the next generation of generative AI tools. You will work on both the backend (Python/FastAPI) and frontend (React).',
    requirements: ['Python', 'React', 'FastAPI', 'PostgreSQL', 'AI/ML interest']
  },
  {
    id: 'j3',
    title: 'UI/UX Designer',
    company: 'Creative Studio',
    location: 'New York, NY',
    salary: '$90k - $110k',
    type: 'Contract',
    postedDate: '2023-10-20',
    recruiterId: 'r3',
    description: 'Looking for a creative UI/UX designer to revamp our mobile application.',
    requirements: ['Figma', 'Adobe XD', 'Mobile Design', 'Prototyping']
  },
  {
    id: 'j4',
    title: 'Backend Engineer',
    company: 'FinTech Solutions',
    location: 'Austin, TX',
    salary: '$115k - $145k',
    type: 'Full-time',
    postedDate: '2023-10-22',
    recruiterId: 'r1',
    description: 'Scale our financial payment processing system. High concurrency and security focus.',
    requirements: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Security']
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'a1',
    jobId: 'j1',
    userId: 'u1',
    status: 'Reviewing',
    matchScore: 88,
    appliedDate: '2023-10-26'
  },
  {
    id: 'a2',
    jobId: 'j2',
    userId: 'u1',
    status: 'Applied',
    matchScore: 65,
    appliedDate: '2023-10-27'
  }
];
