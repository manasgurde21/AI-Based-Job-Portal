import { User, Job, Application, UserRole } from '../types';
import { MOCK_USER, MOCK_JOBS, MOCK_APPLICATIONS, MOCK_RECRUITER } from '../constants';

const SESSION_KEY = 'hs_session';
const STORAGE_PREFIX = 'hs_db_';

// --- Helpers ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = <T>(key: string, defaultVal: T): T => {
    try {
        const item = localStorage.getItem(STORAGE_PREFIX + key);
        return item ? JSON.parse(item) : defaultVal;
    } catch {
        return defaultVal;
    }
};

const setStorage = (key: string, value: any) => {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
};

// Initialize DB with Mock Data if empty
if (!localStorage.getItem(STORAGE_PREFIX + 'jobs')) {
    setStorage('jobs', MOCK_JOBS);
}
if (!localStorage.getItem(STORAGE_PREFIX + 'applications')) {
    setStorage('applications', MOCK_APPLICATIONS);
}
if (!localStorage.getItem(STORAGE_PREFIX + 'users')) {
    setStorage('users', [MOCK_USER, MOCK_RECRUITER]);
}

// --- Auth ---

export const checkBackendHealth = async (): Promise<boolean> => {
    return true; // Always true in mock mode
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
    await delay(500); // Simulate network latency
    
    // Check hardcoded mocks first for easy access
    if (email === MOCK_USER.email) return MOCK_USER;
    if (email === MOCK_RECRUITER.email) return MOCK_RECRUITER;

    // Check registered users in local storage
    const users = getStorage<User[]>('users', []);
    const user = users.find(u => u.email === email);
    
    // In a real app we would check password hash, here we just check existence
    if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
    }
    return null;
};

export const registerUser = async (userData: Omit<User, 'id'>): Promise<User | null> => {
    await delay(500);
    const users = getStorage<User[]>('users', []);
    
    if (users.find(u => u.email === userData.email)) {
        return null; // User exists
    }

    const newUser: User = { ...userData, id: `u_${Date.now()}` };
    users.push(newUser);
    setStorage('users', users);
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
};

export const logoutUser = async (): Promise<void> => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

// --- Users ---

export const getAllUsers = async (): Promise<User[]> => {
    await delay(200);
    return getStorage<User[]>('users', [MOCK_USER, MOCK_RECRUITER]);
};

export const updateUserResume = async (userId: string, resumeText: string): Promise<User | null> => {
    return updateUserProfile(userId, { resumeText });
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User | null> => {
    await delay(300);
    const users = getStorage<User[]>('users', []);
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        const updatedUser = { ...users[index], ...data };
        users[index] = updatedUser;
        setStorage('users', users);
        
        // Update session if it's the current user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
        }
        return updatedUser;
    }
    return null;
};

// --- Jobs ---

export const getJobs = async (): Promise<Job[]> => {
    await delay(300);
    return getStorage<Job[]>('jobs', MOCK_JOBS);
};

export const getJobById = async (id: string): Promise<Job | undefined> => {
    await delay(100);
    const jobs = getStorage<Job[]>('jobs', MOCK_JOBS);
    return jobs.find(j => j.id === id);
};

export const createJob = async (jobData: Omit<Job, 'id' | 'postedDate'>): Promise<Job | null> => {
    await delay(800); // Increased delay to ensure write completes before UI reads
    const jobs = getStorage<Job[]>('jobs', MOCK_JOBS);
    
    const newJob: Job = {
        ...jobData,
        id: `j_${Date.now()}`,
        postedDate: new Date().toISOString()
    };
    
    setStorage('jobs', [newJob, ...jobs]);
    return newJob;
};

// --- Applications ---

export const getApplications = async (): Promise<Application[]> => {
    await delay(300);
    return getStorage<Application[]>('applications', MOCK_APPLICATIONS);
};

export const createApplication = async (appData: Omit<Application, 'id' | 'appliedDate' | 'status'>): Promise<Application | null> => {
    await delay(500);
    const apps = getStorage<Application[]>('applications', MOCK_APPLICATIONS);
    
    // Check if already applied
    if (apps.find(a => a.jobId === appData.jobId && a.userId === appData.userId)) {
        return null;
    }

    const newApp: Application = {
        ...appData,
        id: `a_${Date.now()}`,
        status: 'Applied',
        appliedDate: new Date().toISOString().split('T')[0]
    };
    
    setStorage('applications', [...apps, newApp]);
    return newApp;
};

export const updateApplicationStatus = async (appId: string, status: Application['status']): Promise<void> => {
    await delay(300);
    const apps = getStorage<Application[]>('applications', MOCK_APPLICATIONS);
    const updatedApps = apps.map(app => 
        app.id === appId ? { ...app, status } : app
    );
    setStorage('applications', updatedApps);
};