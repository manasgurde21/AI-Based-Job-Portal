const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
// Connects to your local MongoDB instance
mongoose.connect('mongodb://localhost:27017/hiresense')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Schemas & Models ---

const UserSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: { type: String, unique: true },
  password: String, // Note: In production, use bcrypt to hash passwords
  role: String,
  resumeText: String,
  title: String,
  phoneNumber: String,
  address: String,
  dob: String,
  bio: String
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

const User = mongoose.model('User', UserSchema);
const Job = mongoose.model('Job', JobSchema);
const Application = mongoose.model('Application', ApplicationSchema);

// --- API Routes ---

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const newUser = new User({
      ...req.body,
      id: 'u' + Date.now().toString()
    });
    await newUser.save();
    res.json(newUser);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// User Profile
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
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
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

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
