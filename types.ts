
export enum UserRole {
  JOB_SEEKER = 'JOB_SEEKER',
  RECRUITER = 'RECRUITER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, this would be hashed
  role: UserRole;
  resumeText?: string;
  title?: string; // Job title for profile
  phoneNumber?: string;
  address?: string;
  dob?: string;
  bio?: string;
  profilePicture?: string; // Base64 string for the image
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  recruiterId: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'Applied' | 'Reviewing' | 'Interview' | 'Rejected' | 'Accepted';
  matchScore?: number;
  appliedDate: string;
}

export interface MatchResult {
  score: number;
  missingSkills: string[];
  analysis: string;
}
