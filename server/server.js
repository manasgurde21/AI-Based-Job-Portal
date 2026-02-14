
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
// Enable CORS for all routes and origins
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));
// Explicitly handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));

// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Database Connection
const CONNECTION_STRING = 'mongodb+srv://manasgurde45_db_user:tiHDD5NL8CuzINrK@cluster0.6siaz2n.mongodb.net/hiresense?retryWrites=true&w=majority&appName=Cluster0';

// Connect with a timeout so we don't hang indefinitely if IP is not allowed
mongoose.connect(CONNECTION_STRING, {
    serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
  .then(() => console.log('✅ Connected to MongoDB Atlas (Database: hiresense)'))
  .catch(err => {
      console.error('❌ MongoDB Connection Error:', err);
      console.log('---------------------------------------------------');
      console.log('HINT: If you see "bad auth" or "timeout", check your MongoDB Atlas "Network Access".');
      console.log('      You must whitelist your current IP address (or use 0.0.0.0/0 for testing).');
      console.log('---------------------------------------------------');
  });

// --- Schemas & Models ---
// Use existing models if they exist (prevents OverwriteModelError during hot reloads)

const UserSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  resumeText: String,
  title: String,
  phoneNumber: String,
  address: String,
  dob: String,
  bio: String,
  profilePicture: String
});

const JobSchema = new mongoose.Schema({
  id: String,
  title: String,
  company: String,
  location: String,
  salary: String,
  description: String,
  requirements: [String],
  postedDate: String,
  recruiterId: String,
  type: String
});

const ApplicationSchema = new mongoose.Schema({
  id: String,
  jobId: String,
  userId: String,
  status: String,
  matchScore: Number,
  appliedDate: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);

// --- API Routes ---

// Health Check
app.get('/', (req, res) => {
    res.send('<h1>HireSense Backend is Running 🚀</h1><p>Connected to MongoDB Atlas</p>');
});

app.get('/api/health', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.json({ 
        status: 'ok', 
        database: isDbConnected ? 'connected' : 'disconnected' 
    });
});

// Auth
app.post('/api/auth/register', async (req, res) => {
  console.log("📝 Register Request Received:", req.body.email);
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Case insensitive check
    const existing = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    
    if (existing) {
        console.log("⚠️ User already exists:", email);
        return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = new User({
      ...req.body,
      email: email.toLowerCase(), // Store normalized email
      id: 'u' + Date.now().toString()
    });
    await newUser.save();
    console.log("✅ User Registered:", newUser.email);
    res.json(newUser);
  } catch (e) {
    console.error("❌ Register Error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Case insensitive login
    const user = await User.findOne({ 
        email: { $regex: new RegExp(`^${email}$`, 'i') }, 
        password 
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(user);
  } catch (e) {
    console.error("Login Error:", e);
    res.status(500).json({ error: e.message });
  }
});

// User Profile
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-profilePicture'); 
        res.json(users);
    } catch (e) {
        console.error("Fetch Users Error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedDate: -1 });
    res.json(jobs);
  } catch (e) {
    console.error("Fetch Jobs Error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findOne({ id: req.params.id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const newJob = new Job({
      ...req.body,
      id: 'j' + Date.now().toString(),
      postedDate: new Date().toISOString()
    });
    await newJob.save();
    res.json(newJob);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Applications
app.get('/api/applications', async (req, res) => {
  try {
    const apps = await Application.find();
    res.json(apps);
  } catch (e) {
    console.error("Fetch Apps Error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const { jobId, userId } = req.body;
    
    // Check for existing application
    const existing = await Application.findOne({ jobId, userId });
    if (existing) {
        return res.status(400).json({ error: 'Already applied' });
    }

    const newApp = new Application({
      ...req.body,
      id: 'a' + Date.now().toString(),
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0]
    });
    await newApp.save();
    res.json(newApp);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/applications/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findOneAndUpdate({ id: req.params.id }, { status }, { new: true });
    res.json(app);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Start Server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use! Please stop the other process using 'lsof -i :${PORT}' or Task Manager.`);
    } else {
        console.error('❌ Server Error:', e);
    }
});
