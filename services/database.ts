import { User, Job, Application } from '../types';
import { MOCK_JOBS, MOCK_APPLICATIONS, MOCK_USER, MOCK_RECRUITER } from '../constants';

const KEYS = {
  USERS: 'tm_users',
  JOBS: 'tm_jobs',
  APPLICATIONS: 'tm_applications',
  SESSION: 'tm_session'
};

// Initialize LocalStorage with Mock Data if empty
const initStorage = () => {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(KEYS.JOBS)) {
        localStorage.setItem(KEYS.JOBS, JSON.stringify(MOCK_JOBS));
    }
    if (!localStorage.getItem(KEYS.APPLICATIONS)) {
        localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(MOCK_APPLICATIONS));
    }
    if (!localStorage.getItem(KEYS.USERS)) {
        // Create a default user set including the mock users
        const initialUsers = [MOCK_USER, MOCK_RECRUITER];
        localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
    }
};

initStorage();

// --- Auth Operations ---

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  
  // In a real app, we would check password hash. 
  // For this local demo, we accept the login if the user exists.
  if (user) {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
    return user;
  }
  return null;
};

export const registerUser = async (userData: Omit<User, 'id'>): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  
  if (users.find((u: User) => u.email.toLowerCase() === userData.email.toLowerCase())) {
    return null; // User already exists
  }

  const newUser: User = {
    ...userData,
    id: 'u' + Date.now().toString(),
    resumeText: ''
  };

  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(KEYS.SESSION, JSON.stringify(newUser));
  
  return newUser;
};

export const logoutUser = async (): Promise<void> => {
  localStorage.removeItem(KEYS.SESSION);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(KEYS.SESSION);
  return session ? JSON.parse(session) : null;
};

export const updateUserResume = async (userId: string, resumeText: string): Promise<User | null> => {
    return updateUserProfile(userId, { resumeText });
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User | null> => {
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const index = users.findIndex((u: User) => u.id === userId);
    
    if (index !== -1) {
        const updatedUser = { ...users[index], ...data };
        users[index] = updatedUser;
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        
        // Update session if it's the current user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            localStorage.setItem(KEYS.SESSION, JSON.stringify(updatedUser));
        }
        return updatedUser;
    }
    return null;
};

// --- Job Operations ---

export const getJobs = async (): Promise<Job[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  return JSON.parse(localStorage.getItem(KEYS.JOBS) || '[]');
};

export const getJobById = async (id: string): Promise<Job | undefined> => {
  const jobs = await getJobs();
  return jobs.find(j => j.id === id);
};

export const createJob = async (jobData: Omit<Job, 'id' | 'postedDate'>): Promise<Job | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const jobs = await getJobs();
  
  const newJob: Job = {
    ...jobData,
    id: 'j' + Date.now().toString(),
    postedDate: new Date().toISOString()
  };
  
  // Add to beginning
  jobs.unshift(newJob);
  localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
  return newJob;
};

// --- Application Operations ---

export const getApplications = async (): Promise<Application[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return JSON.parse(localStorage.getItem(KEYS.APPLICATIONS) || '[]');
};

export const createApplication = async (appData: Omit<Application, 'id' | 'appliedDate' | 'status'>): Promise<Application | null> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const apps = await getApplications();
  
  // Prevent duplicate applications
  if (apps.find(a => a.jobId === appData.jobId && a.userId === appData.userId)) {
      console.warn("Already applied");
      return null;
  }

  const newApp: Application = {
    ...appData,
    id: 'a' + Date.now().toString(),
    status: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0]
  };
  
  apps.push(newApp);
  localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  return newApp;
};

export const updateApplicationStatus = async (appId: string, status: Application['status']): Promise<void> => {
    const apps = await getApplications();
    const index = apps.findIndex(a => a.id === appId);
    
    if (index !== -1) {
        apps[index].status = status;
        localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
    }
};