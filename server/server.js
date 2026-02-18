
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '50mb' }));

// --- DATABASE CONFIGURATION ---
// We support both PostgreSQL and Local File System.
// We prioritize the user-provided credentials for 'hiresensedb'.

let dbType = 'loading'; // 'postgres' | 'local_file'
let pgPool = null;

// --- INITIAL MOCK DATA ---
const INITIAL_JOBS = [
    {
        id: 'j1',
        title: 'Senior Frontend Engineer',
        company: 'TechCorp',
        location: 'Remote',
        salary: '$120k - $150k',
        type: 'Full-time',
        postedDate: '2023-10-25',
        recruiterId: 'r1',
        description: 'We are looking for a Senior Frontend Engineer.',
        requirements: ['React', 'TypeScript', 'Tailwind CSS']
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
        description: 'Join our AI team to build the next generation of generative AI tools.',
        requirements: ['Python', 'React', 'FastAPI']
    }
];

// --- POSTGRES INITIALIZATION ---
const initPostgres = async () => {
    // 1. CONFIGURATION
    // Use environment variable if available, otherwise use the specific credentials provided
    const USER_PROVIDED_CREDENTIALS = 'postgres://postgres:manas@localhost:5432/hiresensedb';
    const connectionString = process.env.DATABASE_URL || USER_PROVIDED_CREDENTIALS;

    console.log(`🔌 Attempting to connect to PostgreSQL...`);

    try {
        pgPool = new Pool({
            connectionString: connectionString,
            ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
            connectionTimeoutMillis: 2000 // Fail fast if DB is down so we can switch to local file
        });

        // 2. TEST CONNECTION
        await pgPool.query('SELECT NOW()');
        console.log("✅ Connected to PostgreSQL (hiresensedb)");

        // 3. SCHEMA MIGRATION
        // Create Tables with JSONB for flexibility (Hybrid Schema)
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                data JSONB NOT NULL
            );
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                posted_date TIMESTAMP DEFAULT NOW(),
                data JSONB NOT NULL
            );
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                job_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                status TEXT NOT NULL,
                data JSONB NOT NULL
            );
        `);

        // 4. SEED DATA
        // Check if jobs exist, if not seed initial data
        const jobCount = await pgPool.query('SELECT COUNT(*) FROM jobs');
        if (parseInt(jobCount.rows[0].count) === 0) {
            console.log("🌱 Seeding initial jobs to PostgreSQL...");
            for (const job of INITIAL_JOBS) {
                await pgPool.query(
                    'INSERT INTO jobs (id, posted_date, data) VALUES ($1, $2, $3)',
                    [job.id, job.postedDate, JSON.stringify(job)]
                );
            }
        }

        return true;
    } catch (err) {
        console.error("❌ PostgreSQL Connection Failed:", err.message);
        console.log("⚠️  Ideally, ensure PostgreSQL is running on localhost:5432 and database 'hiresensedb' exists.");
        return false;
    }
};

// --- DATA ACCESS LAYER (DAO) ---
// Abstracts the database difference so API routes don't care which DB is used.

const DAO = {
    // USERS
    getUserByEmail: async (email) => {
        if (dbType === 'postgres') {
            const res = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (res.rows.length === 0) return null;
            const { data, ...rest } = res.rows[0];
            return { ...rest, ...data };
        } else {
            const db = readLocalDb();
            return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
        }
    },
    createUser: async (user) => {
        if (dbType === 'postgres') {
            const { id, email, password, role, ...rest } = user;
            await pgPool.query(
                'INSERT INTO users (id, email, password, role, data) VALUES ($1, $2, $3, $4, $5)',
                [id, email, password, role, JSON.stringify(rest)]
            );
            return user;
        } else {
            const db = readLocalDb();
            db.users.push(user);
            writeLocalDb(db);
            return user;
        }
    },
    getAllUsers: async () => {
        if (dbType === 'postgres') {
            const res = await pgPool.query('SELECT * FROM users');
            return res.rows.map(row => {
                const { data, ...rest } = row;
                const { profilePicture, ...safeData } = data; 
                return { ...rest, ...safeData }; 
            });
        } else {
            const db = readLocalDb();
            return db.users.map(({ profilePicture, ...rest }) => rest);
        }
    },
    updateUser: async (id, updates) => {
        if (dbType === 'postgres') {
            const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
            if (res.rows.length === 0) return null;
            
            const existing = res.rows[0];
            const newData = { ...existing.data, ...updates };
            const newRole = updates.role || existing.role;

            await pgPool.query(
                'UPDATE users SET role = $1, data = $2 WHERE id = $3',
                [newRole, JSON.stringify(newData), id]
            );
            return { ...existing, ...newData, role: newRole };
        } else {
            const db = readLocalDb();
            const idx = db.users.findIndex(u => u.id === id);
            if (idx === -1) return null;
            db.users[idx] = { ...db.users[idx], ...updates };
            writeLocalDb(db);
            return db.users[idx];
        }
    },

    // JOBS
    getAllJobs: async () => {
        if (dbType === 'postgres') {
            const res = await pgPool.query('SELECT * FROM jobs ORDER BY posted_date DESC');
            return res.rows.map(row => ({ ...row.data }));
        } else {
            const db = readLocalDb();
            return db.jobs.reverse();
        }
    },
    getJobById: async (id) => {
        if (dbType === 'postgres') {
            const res = await pgPool.query('SELECT * FROM jobs WHERE id = $1', [id]);
            return res.rows.length ? res.rows[0].data : null;
        } else {
            const db = readLocalDb();
            return db.jobs.find(j => j.id === id) || null;
        }
    },
    createJob: async (job) => {
        if (dbType === 'postgres') {
            await pgPool.query(
                'INSERT INTO jobs (id, posted_date, data) VALUES ($1, $2, $3)',
                [job.id, job.postedDate, JSON.stringify(job)]
            );
            return job;
        } else {
            const db = readLocalDb();
            db.jobs.push(job);
            writeLocalDb(db);
            return job;
        }
    },

    // APPLICATIONS
    getAllApplications: async () => {
        if (dbType === 'postgres') {
            const res = await pgPool.query('SELECT * FROM applications');
            return res.rows.map(row => ({ ...row.data, status: row.status }));
        } else {
            const db = readLocalDb();
            return db.applications;
        }
    },
    createApplication: async (app) => {
        if (dbType === 'postgres') {
            await pgPool.query(
                'INSERT INTO applications (id, job_id, user_id, status, data) VALUES ($1, $2, $3, $4, $5)',
                [app.id, app.jobId, app.userId, app.status, JSON.stringify(app)]
            );
            return app;
        } else {
            const db = readLocalDb();
            db.applications.push(app);
            writeLocalDb(db);
            return app;
        }
    },
    updateApplicationStatus: async (id, status) => {
        if (dbType === 'postgres') {
            await pgPool.query(`
                UPDATE applications 
                SET status = $1, 
                    data = jsonb_set(data, '{status}', to_jsonb($1::text)) 
                WHERE id = $2
            `, [status, id]);
            
            const res = await pgPool.query('SELECT * FROM applications WHERE id = $1', [id]);
            return res.rows.length ? res.rows[0].data : null;
        } else {
            const db = readLocalDb();
            const idx = db.applications.findIndex(a => a.id === id);
            if (idx === -1) return null;
            db.applications[idx].status = status;
            writeLocalDb(db);
            return db.applications[idx];
        }
    }
};


// --- LOCAL FILE HELPERS (FALLBACK) ---
const readLocalDb = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            const defaults = { users: [], jobs: [...INITIAL_JOBS], applications: [] };
            fs.writeFileSync(DB_FILE, JSON.stringify(defaults, null, 2));
            return defaults;
        }
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (err) {
        return { users: [], jobs: [], applications: [] };
    }
};

const writeLocalDb = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Local DB Write Error:", err);
    }
};

// --- INITIALIZE SERVER ---
(async () => {
    const isPostgresConnected = await initPostgres();
    dbType = isPostgresConnected ? 'postgres' : 'local_file';
    console.log(`🚀 Database System Initialized. Mode: ${dbType.toUpperCase()}`);
})();


// --- API ROUTES ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: dbType });
});

// Auth
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email } = req.body;
        const existing = await DAO.getUserByEmail(email);
        if (existing) return res.status(400).json({ error: 'User already exists' });

        const newUser = {
            ...req.body,
            id: 'u' + Date.now().toString(),
            email: email.toLowerCase()
        };
        await DAO.createUser(newUser);
        res.json(newUser);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await DAO.getUserByEmail(email);
        
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await DAO.getAllUsers();
        res.json(users);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/users/:id', async (req, res) => {
    try {
        const updated = await DAO.updateUser(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: 'User not found' });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await DAO.getAllJobs();
        res.json(jobs);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/jobs/:id', async (req, res) => {
    try {
        const job = await DAO.getJobById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json(job);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/jobs', async (req, res) => {
    try {
        const newJob = {
            ...req.body,
            id: 'j' + Date.now().toString(),
            postedDate: new Date().toISOString()
        };
        await DAO.createJob(newJob);
        res.json(newJob);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Applications
app.get('/api/applications', async (req, res) => {
    try {
        const apps = await DAO.getAllApplications();
        res.json(apps);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/applications', async (req, res) => {
    try {
        const { jobId, userId } = req.body;
        // Simple duplicate check (in-memory for now, ideally DB constraint)
        const allApps = await DAO.getAllApplications();
        if (allApps.find(a => a.jobId === jobId && a.userId === userId)) {
            return res.status(400).json({ error: 'Already applied' });
        }

        const newApp = {
            ...req.body,
            id: 'a' + Date.now().toString(),
            status: 'Applied',
            appliedDate: new Date().toISOString().split('T')[0]
        };
        await DAO.createApplication(newApp);
        res.json(newApp);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/applications/:id', async (req, res) => {
    try {
        const updated = await DAO.updateApplicationStatus(req.params.id, req.body.status);
        if (!updated) return res.status(404).json({ error: 'Application not found' });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
