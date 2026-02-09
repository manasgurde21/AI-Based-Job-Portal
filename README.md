# HireSense AI - Intelligent Recruitment Platform

![React](https://img.shields.io/badge/React-19.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple) ![Gemini API](https://img.shields.io/badge/AI-Google%20Gemini-orange) ![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)

**HireSense AI** is a modern, AI-powered job portal that bridges the gap between talent and opportunity. By leveraging **Google's Gemini 1.5 Flash model**, the application provides real-time resume parsing, automated job matching scores, and intelligent feedback for job seekers.

This project is built as a **Full Stack Application** using React (Frontend) and Node.js/Express + MongoDB (Backend).

---

## 🚀 Key Features

### 🤖 AI-Powered Capabilities
- **Smart Resume Matching:** Instantly analyzes a candidate's resume against job descriptions to calculate a **Match Score (0-100%)**.
- **Gap Analysis:** Identifies specific skills missing from a resume that are required for a job.
- **Resume Quality Review:** Provides an AI coach that rates resumes out of 10 and suggests specific improvements and strengths.
- **PDF Parsing:** Extracts text automatically from PDF resumes using `pdfjs-dist`.

### 👥 User Roles
- **Job Seekers:**
  - Browse and filter job listings.
  - Upload resumes (PDF or Text).
  - Track application status.
  - View AI-recommended jobs based on profile.
- **Recruiters:**
  - Post new job openings.
  - View dashboard of applicants.
  - See AI match scores for every applicant.
  - Schedule interviews or accept/reject candidates.

### 💻 Technical Highlights
- **Architecture:** Client-server (React + Node.js).
- **Database:** MongoDB Atlas.
- **Styling:** Bootstrap 5 with custom CSS variables and glassmorphism effects.
- **Icons:** Lucide React.
- **Build Tool:** Vite.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI Model:** Google Gemini 1.5 Flash (`@google/genai` SDK)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/hiresense-ai.git
cd hiresense-ai
```

### 2. Setup the Backend (Server)
The backend connects to MongoDB. You must start this first.

```bash
cd server
npm install
node server.js
```
The server will start on `http://localhost:5000`.

### 3. Setup the Frontend
Open a new terminal window in the root directory (`hiresense-ai`).

```bash
npm install
```

### 4. Configure API Key
To use the AI features, you need a Google Gemini API Key.
1. Create a file named `.env` in the root directory.
2. Add your key:

```env
API_KEY=your_actual_api_key_here
```

### 5. Run the Frontend
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the app.

---

## 📂 Project Structure

```
hiresense-ai/
├── server/           # Node.js Backend
│   ├── server.js         # API Endpoints & DB connection
│   └── package.json      # Backend dependencies
├── components/       # Reusable UI components
├── pages/            # Main page views
├── services/         # Logic layer
│   ├── database.ts       # API wrapper (fetches from backend)
│   └── geminiService.ts  # Google GenAI integration
├── types.ts          # TypeScript interfaces
└── App.tsx           # Main router
```

## 📄 License

This project is open-source and available under the MIT License.