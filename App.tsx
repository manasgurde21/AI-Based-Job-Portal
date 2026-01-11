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
import { getCurrentUser, getJobs, getApplications, logoutUser, updateUserResume, createApplication } from './services/database';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const initData = async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        setLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const refreshData = async () => {
    setLoading(true);
    setCurrentUser(getCurrentUser());
    const [fetchedJobs, fetchedApps] = await Promise.all([
        getJobs(),
        getApplications()
    ]);
    setJobs(fetchedJobs);
    setApplications(fetchedApps);
    setLoading(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    refreshData();
    navigate('/');
  };

  const handleUpdateResume = async (text: string) => {
    if (currentUser) {
        const updatedUser = await updateUserResume(currentUser.id, text);
        if (updatedUser) {
            setCurrentUser(updatedUser);
            alert("Resume updated successfully!");
        }
    }
  };

  const handleApply = async (jobId: string) => {
      if (!currentUser) {
          alert("Please login to apply");
          navigate('/login');
          return;
      }
      
      await createApplication({
          jobId,
          userId: currentUser.id,
          matchScore: 0 // In a real app with backend, this would be calc'd on apply or async
      });
      
      await refreshData();
      alert("Application sent successfully!");
  };

  if (loading && jobs.length === 0) {
      return (
          <div className="d-flex justify-content-center align-items-center vh-100">
              <div className="spinner-border text-primary-custom" role="status">
                  <span className="visually-hidden">Loading...</span>
              </div>
          </div>
      );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        navigate={navigate} 
      />
      
      <div className="flex-grow-1">
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
                        onUpdateResume={handleUpdateResume}
                        navigate={navigate}
                        onDataChange={refreshData}
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
                        onProfileUpdate={refreshData}
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
                            navigate('/dashboard');
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