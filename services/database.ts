
import { User, Job, Application, UserRole } from '../types';
import { MOCK_JOBS, MOCK_USER } from '../constants';

const API_URL = 'http://localhost:5000/api';
const SESSION_KEY = 'hs_session';
const OFFLINE_DATA_KEY = 'hs_offline_data';

// --- Frontend Mock Data (Fallback) ---
const loadOfflineData = () => {
    const stored = localStorage.getItem(OFFLINE_DATA_KEY);
    return stored ? JSON.parse(stored) : {
        users: [MOCK_USER],
        jobs: MOCK_JOBS,
        applications: []
    };
};

const saveOfflineData = (data: any) => {
    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(data));
};

// --- Helpers ---
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || response.statusText || `Request failed with status ${response.status}`);
    }
    return response.json();
};

const mockBackendHandler = async (url: string, options: RequestInit = {}) => {
    const data = loadOfflineData();
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : null;
    await new Promise(r => setTimeout(r, 400));

    if (url.includes('/auth/login')) {
        const user = data.users.find((u: User) => u.email.toLowerCase() === body.email.toLowerCase());
        if (user) return user;
        throw new Error('Invalid credentials (Offline Mode)');
    }
    if (url.includes('/auth/register')) {
        const newUser = { ...body, id: 'u' + Date.now() };
        data.users.push(newUser);
        saveOfflineData(data);
        return newUser;
    }
    if (url.includes('/jobs')) {
        if (method === 'GET') {
             const idMatch = url.match(/\/jobs\/([^\/]+)$/);
             if (idMatch) return data.jobs.find((j: Job) => j.id === idMatch[1]);
             return data.jobs;
        }
        if (method === 'POST') {
            const newJob = { ...body, id: 'j' + Date.now(), postedDate: new Date().toISOString() };
            data.jobs.unshift(newJob);
            saveOfflineData(data);
            return newJob;
        }
    }
    if (url.includes('/applications')) {
         if (method === 'GET') return data.applications;
         if (method === 'POST') {
             const newApp = { ...body, id: 'a' + Date.now(), status: 'Applied', appliedDate: new Date().toISOString().split('T')[0] };
             data.applications.push(newApp);
             saveOfflineData(data);
             return newApp;
         }
         if (method === 'PATCH') {
             const idMatch = url.match(/\/applications\/([^\/]+)$/);
             if (idMatch) {
                 const appIndex = data.applications.findIndex((a: Application) => a.id === idMatch[1]);
                 if (appIndex > -1) {
                     data.applications[appIndex] = { ...data.applications[appIndex], ...body };
                     saveOfflineData(data);
                     return data.applications[appIndex];
                 }
             }
         }
    }
    if (url.includes('/users')) {
        if (method === 'GET') return data.users;
        if (method === 'PATCH') {
            const idMatch = url.match(/\/users\/([^\/]+)$/);
            if (idMatch) {
                const userIndex = data.users.findIndex((u: User) => u.id === idMatch[1]);
                if (userIndex > -1) {
                    data.users[userIndex] = { ...data.users[userIndex], ...body };
                    saveOfflineData(data);
                    return data.users[userIndex];
                }
            }
        }
    }
    return [];
};

const safeFetch = async (url: string, options?: RequestInit) => {
    try {
        const response = await fetch(url, options);
        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.includes("application/json")) {
             throw new Error(`Invalid server response: ${response.status} ${response.statusText}`);
        }
        return await handleResponse(response);
    } catch (error: any) {
        console.warn(`Backend unreachable (${error.message}). Switching to offline data for: ${url}`);
        return mockBackendHandler(url, options);
    }
}

// --- Auth & Session ---
export const checkBackendHealth = async (): Promise<{ status: boolean; mode: 'postgres' | 'local_file' | 'memory' | 'offline' }> => {
    try {
        const res = await fetch(`${API_URL}/health`);
        if (res.ok) {
            const data = await res.json();
            return { 
                status: true, 
                mode: data.database as 'postgres' | 'local_file' | 'memory' 
            };
        }
        return { status: false, mode: 'offline' };
    } catch {
        return { status: false, mode: 'offline' };
    }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
    const user = await safeFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
};

export const registerUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const user = await safeFetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
};

export const logoutUser = async (): Promise<void> => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const getAllUsers = async (): Promise<User[]> => {
    return await safeFetch(`${API_URL}/users`);
};

export const updateUserResume = async (userId: string, resumeText: string): Promise<User> => {
    return updateUserProfile(userId, { resumeText });
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User> => {
    const updatedUser = await safeFetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    }
    return updatedUser;
};

export const getJobs = async (): Promise<Job[]> => {
    return await safeFetch(`${API_URL}/jobs`);
};

export const getJobById = async (id: string): Promise<Job> => {
    return await safeFetch(`${API_URL}/jobs/${id}`);
};

export const createJob = async (jobData: Omit<Job, 'id' | 'postedDate'>): Promise<Job> => {
    return await safeFetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
    });
};

export const getApplications = async (): Promise<Application[]> => {
    return await safeFetch(`${API_URL}/applications`);
};

export const createApplication = async (appData: Omit<Application, 'id' | 'appliedDate' | 'status'>): Promise<Application> => {
    return await safeFetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
    });
};

export const updateApplicationStatus = async (appId: string, status: Application['status']): Promise<void> => {
    await safeFetch(`${API_URL}/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
};
