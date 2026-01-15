# HireSense AI - Intelligent Recruitment Platform

![React](https://img.shields.io/badge/React-19.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple) ![Gemini API](https://img.shields.io/badge/AI-Google%20Gemini-orange) ![Bootstrap](https://img.shields.io/badge/UI-Bootstrap%205-blueviolet)

**HireSense AI** is a modern, AI-powered job portal that bridges the gap between talent and opportunity. By leveraging **Google's Gemini 1.5 Flash model**, the application provides real-time resume parsing, automated job matching scores, and intelligent feedback for job seekers.

This project is built as a **Single Page Application (SPA)** using React and Vite, utilizing LocalStorage for persistence (no database server required for the demo), making it easy to deploy and test.

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
- **Architecture:** Client-side React with TypeScript.
- **Styling:** Bootstrap 5 with custom CSS variables and glassmorphism effects.
- **Icons:** Lucide React.
- **Charts:** Recharts for data visualization.
- **Build Tool:** Vite for lightning-fast HMR and bundling.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19
- **Language:** TypeScript
- **AI Model:** Google Gemini 1.5 Flash (`@google/genai` SDK)
- **Bundler:** Vite
- **PDF Processing:** PDF.js
- **State/Storage:** React State & LocalStorage (Browser-based persistence)

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/hiresense-ai.git
cd hiresense-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Key
To use the AI features, you need a Google Gemini API Key.
1. Get a key from [Google AI Studio](https://aistudio.google.com/).
2. Create a file named `.env` in the root directory.
3. Add your key:

```env
API_KEY=your_actual_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the app.

---

## 🚀 Deployment (Vercel)

This application is configured for seamless deployment on Vercel.

1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. **Important:** In the "Environment Variables" section, add:
   - **Key:** `API_KEY`
   - **Value:** `your_google_gemini_api_key`
5. Click **Deploy**.

---

## 📂 Project Structure

```
hiresense-ai/
├── components/       # Reusable UI components (Navbar, JobCard, etc.)
├── pages/            # Main page views (Dashboard, JobDetails, etc.)
├── services/         # Logic layer
│   ├── database.ts       # LocalStorage wrapper (mocks DB)
│   └── geminiService.ts  # Google GenAI integration logic
├── types.ts          # TypeScript interfaces
├── constants.ts      # Mock data for initial state
├── App.tsx           # Main router configuration
└── main.tsx          # Entry point
```

## 🔒 Privacy & Data

This demo version uses **LocalStorage** to store user data, jobs, and applications. This means:
1. Data persists in your specific browser.
2. If you clear your browser cache, the data resets to the defaults.
3. No data is sent to a backend server (except for the resume text sent to Google Gemini for analysis).

## 📄 License

This project is open-source and available under the MIT License.
