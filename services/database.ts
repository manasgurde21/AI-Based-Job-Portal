
import { User, Job, Application } from '../types';

// Use relative path to leverage Vite Proxy defined in vite.config.ts
// Requests to /api will be forwarded to http://127.0.0.1:5000
const API_URL = '/api';
const SESSION_KEY = 'hs_session';

// --- Helpers ---

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        // Try to parse JSON error message from server
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || response.statusText || 'Request failed');
    }
    return response.json();
};

// --- Auth & Session ---

export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const res = await fetch(`${API_URL}/health`);
        return res.ok;
    } catch {
        return false;
    }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
    const user = await handleResponse(await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    }));
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
};

export const registerUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const user = await handleResponse(await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    }));
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

// --- Users ---

export const getAllUsers = async (): Promise<User[]> => {
    return await handleResponse(await fetch(`${API_URL}/users`));
};

export const updateUserResume = async (userId: string, resumeText: string): Promise<User> => {
    return updateUserProfile(userId, { resumeText });
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User> => {
    const updatedUser = await handleResponse(await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }));

    // Update local session if it matches current user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    }
    return updatedUser;
};

// --- Jobs ---

export const getJobs = async (): Promise<Job[]> => {
    return await handleResponse(await fetch(`${API_URL}/jobs`));
};

export const getJobById = async (id: string): Promise<Job> => {
    return await handleResponse(await fetch(`${API_URL}/jobs/${id}`));
};

export const createJob = async (jobData: Omit<Job, 'id' | 'postedDate'>): Promise<Job> => {
    return await handleResponse(await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
    }));
};

// --- Applications ---

export const getApplications = async (): Promise<Application[]> => {
    return await handleResponse(await fetch(`${API_URL}/applications`));
};

export const createApplication = async (appData: Omit<Application, 'id' | 'appliedDate' | 'status'>): Promise<Application> => {
    return await handleResponse(await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
    }));
};

export const updateApplicationStatus = async (appId: string, status: Application['status']): Promise<void> => {
    await handleResponse(await fetch(`${API_URL}/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    }));
};
