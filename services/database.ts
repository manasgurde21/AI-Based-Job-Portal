import { User, Job, Application } from '../types';

// We use a relative URL now. Vite proxy (configured in vite.config.ts) will forward 
// requests starting with /api to http://localhost:5000/api
const API_URL = '/api';

const KEYS = {
  SESSION: 'tm_session'
};

// --- Helper for API Calls ---
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        throw error; // Re-throw to handle in UI
    }
}

export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        await apiCall('/health');
        return true;
    } catch (e) {
        return false;
    }
}

// --- Auth Operations ---

export const loginUser = async (email: string, password: string): Promise<User | null> => {
    try {
        const user = await apiCall<User>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Save session locally to keep user logged in on refresh
        localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
        return user;
    } catch (error) {
        console.error("Login failed:", error);
        return null;
    }
};

export const registerUser = async (userData: Omit<User, 'id'>): Promise<User | null> => {
    try {
        const user = await apiCall<User>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
        return user;
    } catch (error) {
        console.error("Registration failed:", error);
        return null;
    }
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
    try {
        const updatedUser = await apiCall<User>(`/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });

        // Update local session if it matches the current user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            localStorage.setItem(KEYS.SESSION, JSON.stringify(updatedUser));
        }
        return updatedUser;
    } catch (error) {
        console.error("Update profile failed:", error);
        return null;
    }
};

// --- Job Operations ---

export const getJobs = async (): Promise<Job[]> => {
  try {
      return await apiCall<Job[]>('/jobs');
  } catch (error) {
      console.error("Fetch jobs failed:", error);
      // We return empty array here but component will check health separately
      return [];
  }
};

export const getJobById = async (id: string): Promise<Job | undefined> => {
    try {
        return await apiCall<Job>(`/jobs/${id}`);
    } catch (error) {
        console.error("Fetch job failed:", error);
        return undefined;
    }
};

export const createJob = async (jobData: Omit<Job, 'id' | 'postedDate'>): Promise<Job | null> => {
  try {
      return await apiCall<Job>('/jobs', {
          method: 'POST',
          body: JSON.stringify(jobData)
      });
  } catch (error) {
      console.error("Create job failed:", error);
      return null;
  }
};

// --- Application Operations ---

export const getApplications = async (): Promise<Application[]> => {
  try {
      return await apiCall<Application[]>('/applications');
  } catch (error) {
      console.error("Fetch applications failed:", error);
      return [];
  }
};

export const createApplication = async (appData: Omit<Application, 'id' | 'appliedDate' | 'status'>): Promise<Application | null> => {
  try {
      return await apiCall<Application>('/applications', {
          method: 'POST',
          body: JSON.stringify(appData)
      });
  } catch (error) {
      console.error("Create application failed:", error);
      return null;
  }
};

export const updateApplicationStatus = async (appId: string, status: Application['status']): Promise<void> => {
    try {
        await apiCall<Application>(`/applications/${appId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    } catch (error) {
        console.error("Update status failed:", error);
    }
};