import { User, Job, Application, UserRole } from '../types';
import { MOCK_JOBS, MOCK_USER, MOCK_RECRUITER } from '../constants';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// In a real deployed app, these come from process.env
// For this demo, if these are empty, we fall back to LocalStorage
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''; 
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

// Helper to simulate async network delay when using LocalStorage
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const KEYS = {
  USERS: 'tm_users',
  JOBS: 'tm_jobs',
  APPS: 'tm_applications',
  SESSION: 'tm_session'
};

// Initialize DB with mock data if empty (LocalStorage only)
const initializeLocalDB = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    const users: User[] = [
      { ...MOCK_USER, password: 'password123' },
      { ...MOCK_RECRUITER, password: 'password123' }
    ];
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }
  if (!localStorage.getItem(KEYS.JOBS)) {
    localStorage.setItem(KEYS.JOBS, JSON.stringify(MOCK_JOBS));
  }
  if (!localStorage.getItem(KEYS.APPS)) {
    localStorage.setItem(KEYS.APPS, JSON.stringify([]));
  }
};

initializeLocalDB();

// --- Auth Operations ---

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  if (supabase) {
    // In a real Supabase app, use supabase.auth.signInWithPassword
    // For this hybrid demo, we might query a 'users' table if you set one up
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password) // In production, never store plain text passwords!
        .single();
    
    if (data && !error) {
        localStorage.setItem(KEYS.SESSION, JSON.stringify(data));
        return data as User;
    }
    return null;
  } else {
    // Local Fallback
    await delay(300);
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
      return user;
    }
    return null;
  }
};

export const registerUser = async (user: Omit<User, 'id'>): Promise<User | null> => {
  const newUser = { ...user, id: `u${Date.now()}` };

  if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
      
      if (data && !error) {
          localStorage.setItem(KEYS.SESSION, JSON.stringify(data));
          return data as User;
      }
      return null;
  } else {
    await delay(300);
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    if (users.find(u => u.email === user.email)) {
      return null; // User exists
    }
    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(KEYS.SESSION, JSON.stringify(newUser));
    return newUser;
  }
};

export const logoutUser = async (): Promise<void> => {
  if (supabase) await supabase.auth.signOut();
  localStorage.removeItem(KEYS.SESSION);
};

export const getCurrentUser = (): User | null => {
  // Session is typically kept local even with a DB for performance/state
  const session = localStorage.getItem(KEYS.SESSION);
  return session ? JSON.parse(session) : null;
};

export const updateUserResume = async (userId: string, resumeText: string): Promise<User | null> => {
    return updateUserProfile(userId, { resumeText });
}

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User | null> => {
    if (supabase) {
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(data)
            .eq('id', userId)
            .select()
            .single();
        
        if (updatedUser && !error) {
            // Update local session to match DB
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                const newSession = { ...currentUser, ...updatedUser };
                localStorage.setItem(KEYS.SESSION, JSON.stringify(newSession));
            }
            return updatedUser as User;
        }
        return null;
    } else {
        await delay(200);
        const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...data };
            localStorage.setItem(KEYS.USERS, JSON.stringify(users));
            
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                localStorage.setItem(KEYS.SESSION, JSON.stringify(users[index]));
            }
            return users[index];
        }
        return null;
    }
}

// --- Job Operations ---

export const getJobs = async (): Promise<Job[]> => {
  if (supabase) {
      const { data, error } = await supabase.from('jobs').select('*').order('postedDate', { ascending: false });
      return data && !error ? data as Job[] : [];
  } else {
    await delay(200);
    return JSON.parse(localStorage.getItem(KEYS.JOBS) || '[]');
  }
};

export const getJobById = async (id: string): Promise<Job | undefined> => {
  if (supabase) {
      const { data } = await supabase.from('jobs').select('*').eq('id', id).single();
      return data as Job;
  } else {
      const jobs = await getJobs();
      return jobs.find(j => j.id === id);
  }
};

export const createJob = async (job: Omit<Job, 'id' | 'postedDate'>): Promise<Job | null> => {
  const newJob = {
    ...job,
    id: `j${Date.now()}`, // Note: Supabase usually auto-generates IDs (UUID), but this works for hybrid
    postedDate: new Date().toISOString()
  };

  if (supabase) {
      const { data, error } = await supabase.from('jobs').insert([newJob]).select().single();
      return data && !error ? data as Job : null;
  } else {
    await delay(300);
    const jobs = JSON.parse(localStorage.getItem(KEYS.JOBS) || '[]');
    jobs.unshift(newJob);
    localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
    return newJob as Job;
  }
};

// --- Application Operations ---

export const getApplications = async (): Promise<Application[]> => {
  if (supabase) {
      const { data, error } = await supabase.from('applications').select('*');
      return data && !error ? data as Application[] : [];
  } else {
    await delay(200);
    return JSON.parse(localStorage.getItem(KEYS.APPS) || '[]');
  }
};

export const createApplication = async (app: Omit<Application, 'id' | 'appliedDate' | 'status'>): Promise<Application | null> => {
  const newApp = {
    ...app,
    id: `a${Date.now()}`,
    status: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0]
  };

  if (supabase) {
      const { data, error } = await supabase.from('applications').insert([newApp]).select().single();
      return data && !error ? data as Application : null;
  } else {
      await delay(300);
      const apps = JSON.parse(localStorage.getItem(KEYS.APPS) || '[]');
      apps.push(newApp);
      localStorage.setItem(KEYS.APPS, JSON.stringify(apps));
      return newApp as Application;
  }
};

export const updateApplicationStatus = async (appId: string, status: Application['status']): Promise<void> => {
    if (supabase) {
        await supabase.from('applications').update({ status }).eq('id', appId);
    } else {
        await delay(200);
        const apps = JSON.parse(localStorage.getItem(KEYS.APPS) || '[]');
        const index = apps.findIndex((a: Application) => a.id === appId);
        if (index !== -1) {
            apps[index].status = status;
            localStorage.setItem(KEYS.APPS, JSON.stringify(apps));
        }
    }
}