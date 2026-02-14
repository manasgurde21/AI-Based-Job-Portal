import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { JobListingPage } from './pages/JobListingPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PostJobPage } from './pages/PostJobPage';
import { ProfilePage } from './pages/ProfilePage';
import { User, Application, Job } from './types';
import { getCurrentUser, getJobs, getApplications, getAllUsers, logoutUser, updateUserResume, createApplication } from './services/database';
import { analyzeResumeMatch } from './services/geminiService';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  // Load initial data
  useEffect(() => {
    const initData = async () => {
        await refreshData();
    };
    initData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const refreshData = async () => {
    setLoading(true);

    setCurrentUser(getCurrentUser());
    
    // Fetch data independently
    try {
        const jobsData = await getJobs();
        setJobs(jobsData);
    } catch (e: any) {
        console.error("Error fetching jobs:", e);
    }

    try {
        const appsData = await getApplications();
        setApplications(appsData);
    } catch (e: any) {
        console.error("Error fetching applications:", e);
    }

    try {
        const usersData = await getAllUsers();
        setAllUsers(usersData);
    } catch (e: any) {
        console.error("Error fetching users:", e);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    refreshData();
    navigate('/');
  };

  const handleUpdateResume = async (text: string) => {
    if (currentUser) {
        try {
            const updatedUser = await updateUserResume(currentUser.id, text);
            if (updatedUser) {
                setCurrentUser(updatedUser);
                alert("Resume updated successfully!");
            }
        } catch (e) {
            alert("Failed to update resume.");
        }
    }
  };

  const handleApply = async (jobId: string) => {
      if (!currentUser) {
          alert("Please login to apply");
          navigate('/login');
          return;
      }

      if (!currentUser.resumeText || currentUser.resumeText.length < 50) {
          const confirmRedirect = window.confirm("You need a resume to apply and get an AI Match Score. Go to Dashboard to upload one?");
          if (confirmRedirect) navigate('/dashboard');
          return;
      }
      
      setIsApplying(true);
      let matchScore = 0;

      try {
          // Calculate Match Score immediately
          const job = jobs.find(j => j.id === jobId);
          if (job) {
             const result = await analyzeResumeMatch(currentUser.resumeText, job.description + " " + job.requirements.join(", "));
             matchScore = result.score;
          }
      } catch (error) {
          console.error("AI scoring failed, proceeding with default score", error);
      }
      
      try {
        await createApplication({
            jobId,
            userId: currentUser.id,
            matchScore: matchScore 
        });
        await refreshData();
        alert(`Application sent successfully! AI Match Score: ${matchScore}%`);
      } catch (e: any) {
          alert(e.message || "Failed to send application. Please try again later.");
      }
      
      setIsApplying(false);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        navigate={navigate} 
      />
      
      {loading && jobs.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center vh-100">
              <div className="spinner-border text-primary-custom" role="status">
                  <span className="visually-hidden">Loading...</span>
              </div>
          </div>
      ) : (
        <div className="flex-grow-1 position-relative">
            {isApplying && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 2000}}>
                    <div className="text-center">
                        <Loader2 className="animate-spin text-primary-custom mb-2" size={48} />
                        <h5 className="fw-bold">Analyzing Resume & Applying...</h5>
                    </div>
                </div>
            )}
            <Routes>
            <Route path="/" element={<HomePage navigate={navigate} />} />
            <Route path="/jobs" element={<JobListingPage jobs={jobs} navigate={navigate} />} />
            <Route 
                path="/jobs/:id" 
                element={
                    <JobDetailsWrapper 
                        jobs={jobs} 
                        currentUser={currentUser} 
                        onApply={handleApply} 
                    />
                } 
            />
            <Route 
                path="/dashboard" 
                element={
                    currentUser ? (
                        <DashboardPage 
                            user={currentUser} 
                            jobs={jobs}
                            applications={applications}
                            allUsers={allUsers}
                            onUpdateResume={handleUpdateResume}
                            navigate={navigate}
                            onDataChange={() => refreshData()}
                        />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                } 
            />
            <Route 
                path="/profile" 
                element={
                    currentUser ? (
                        <ProfilePage 
                            currentUser={currentUser} 
                            navigate={navigate}
                            onProfileUpdate={() => refreshData()}
                        />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                } 
            />
            <Route 
                path="/post-job"
                element={
                    currentUser && currentUser.role === 'RECRUITER' ? (
                        <PostJobPage 
                            currentUser={currentUser}
                            onJobPosted={async () => {
                                await refreshData();
                            }}
                            navigate={navigate}
                        />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />
            <Route path="/login" element={<LoginPage onLoginSuccess={() => { refreshData(); navigate('/dashboard'); }} navigate={navigate} />} />
            <Route path="/register" element={<RegisterPage onLoginSuccess={() => { refreshData(); navigate('/dashboard'); }} navigate={navigate} />} />
            </Routes>
        </div>
      )}

      <footer className="bg-white border-top py-5 text-center text-secondary small mt-5">
        <div className="container">
            <p className="mb-2 fw-bold text-dark h5">HireSense AI</p>
            <p className="mb-0">&copy; {new Date().getFullYear()} HireSense AI. Intelligent Recruitment Solutions.</p>
        </div>
      </footer>
    </div>
  );
};

import { useParams } from 'react-router-dom';
const JobDetailsWrapper = ({ jobs, currentUser, onApply }: { jobs: any[], currentUser: any, onApply: any }) => {
    const { id } = useParams();
    const job = jobs.find(j => j.id === id);
    if (!job) return <div className="container py-5 text-center">Job not found</div>;
    return <JobDetailsPage job={job} currentUser={currentUser} onApply={onApply} />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;