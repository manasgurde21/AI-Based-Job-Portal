import { User, Job, Application, UserRole } from '../types';
import { MOCK_JOBS, MOCK_APPLICATIONS, MOCK_USER, MOCK_RECRUITER } from '../constants';

// --- MOCK DATABASE IMPLEMENTATION (LocalStorage) ---

const KEYS = {
  USERS: 'hs_users',
  JOBS: 'hs_jobs',
  APPLICATIONS: 'hs_applications',
  SESSION: 'hs_session'
};

// Initialize Mock Data if empty
const initializeMockData = () => {
    if (!localStorage.getItem(KEYS.JOBS)) {
        localStorage.setItem(KEYS.JOBS, JSON.stringify(MOCK_JOBS));
    }
    if (!localStorage.getItem(KEYS.APPLICATIONS)) {
        localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(MOCK_APPLICATIONS));
    }
    if (!localStorage.getItem(KEYS.USERS)) {
        // Pre-populate with the mock users from constants.ts so you can login easily
        const users = [MOCK_USER, MOCK_RECRUITER];
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
};

// Run initialization immediately
initializeMockData();

// --- Helper Functions ---
const getLocal = <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const setLocal = (key: string, data: any[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const checkBackendHealth = async (): Promise<boolean> => {
    // Always true in mock mode
    return true; 
}

// --- Auth Operations ---

export const loginUser = async (email: string, password: string): Promise<User | null> => {
    await new Promise(r => setTimeout(r, 500)); // Simulate delay
    const users = getLocal<User>(KEYS.USERS);
    // Simple mock login - in real app check password hash
    const user = users.find(u => u.email === email);
    
    // For testing ease, if password is 'password', allow it, or match existing logic
    if (user && (user.password === password || password === 'password' || password === '123456')) {
        localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
        return user;
    }
    return null;
};

export const registerUser = async (userData: Omit<User, 'id'>): Promise<User | null> => {
    await new Promise(r => setTimeout(r, 800)); // Simulate delay
    const users = getLocal<User>(KEYS.USERS);
    
    if (users.find(u => u.email === userData.email)) {
        return null; // User exists
    }

    const newUser: User = {
        ...userData,
        id: 'u' + Date.now().toString()
    };
    
    users.push(newUser);
    setLocal(KEYS.USERS, users);
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
    const users = getLocal<User>(KEYS.USERS);
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        const updatedUser = { ...users[index], ...data };
        users[index] = updatedUser;
        setLocal(KEYS.USERS, users);
        
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
  await new Promise(r => setTimeout(r, 300));
  return getLocal<Job>(KEYS.JOBS);
};

export const getJobById = async (id: string): Promise<Job | undefined> => {
    const jobs = getLocal<Job>(KEYS.JOBS);
    return jobs.find(j => j.id === id);
};

export const createJob = async (jobData: Omit<Job, 'id' | 'postedDate'>): Promise<Job | null> => {
    await new Promise(r => setTimeout(r, 600));
    const jobs = getLocal<Job>(KEYS.JOBS);
    
    const newJob: Job = {
        ...jobData,
        id: 'j' + Date.now().toString(),
        postedDate: new Date().toISOString()
    };
    
    jobs.unshift(newJob); // Add to beginning
    setLocal(KEYS.JOBS, jobs);
    return newJob;
};

// --- Application Operations ---

export const getApplications = async (): Promise<Application[]> => {
  await new Promise(r => setTimeout(r, 300));
  return getLocal<Application>(KEYS.APPLICATIONS);
};

export const createApplication = async (appData: Omit<Application, 'id' | 'appliedDate' | 'status'>): Promise<Application | null> => {
    await new Promise(r => setTimeout(r, 600));
    const apps = getLocal<Application>(KEYS.APPLICATIONS);
    
    if (apps.find(a => a.jobId === appData.jobId && a.userId === appData.userId)) {
        throw new Error("Already applied");
    }

    const newApp: Application = {
        ...appData,
        id: 'a' + Date.now().toString(),
        status: 'Applied',
        appliedDate: new Date().toISOString().split('T')[0]
    };
    
    apps.push(newApp);
    setLocal(KEYS.APPLICATIONS, apps);
    return newApp;
};

export const updateApplicationStatus = async (appId: string, status: Application['status']): Promise<void> => {
    const apps = getLocal<Application>(KEYS.APPLICATIONS);
    const index = apps.findIndex(a => a.id === appId);
    
    if (index !== -1) {
        apps[index].status = status;
        setLocal(KEYS.APPLICATIONS, apps);
    }
};