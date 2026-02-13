
import React, { useState, useEffect } from 'react';
import { User, UserRole, Job, Application } from '../types';
import { ResumeUpload } from '../components/ResumeUpload';
import { JobCard } from '../components/JobCard';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { FileText, Briefcase, Award, Plus, X, Check, Eye, CheckCircle, TrendingUp, Calendar, UploadCloud, Sparkles, LayoutGrid, List, BarChart2, Star, Clock, BrainCircuit, Users } from 'lucide-react';
import { updateApplicationStatus } from '../services/database';
import { recommendJobsBasedOnResume } from '../services/geminiService';

interface DashboardPageProps {
  user: User;
  onUpdateResume: (text: string) => void;
  applications: Application[];
  jobs: Job[];
  allUsers?: User[]; // Added for recruiter sorting
  navigate: (path: string) => void;
  onDataChange?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onUpdateResume, applications, jobs, allUsers = [], navigate, onDataChange }) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Job Seeker AI Recommendations State
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Recruiter States
  const [activeRecruiterTab, setActiveRecruiterTab] = useState<'overview' | 'my-jobs'>('overview');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'overall' | 'skills' | 'experience'>('overall');

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
        case 'Accepted': return { bg: '#dcfce7', text: '#15803d' };
        case 'Rejected': return { bg: '#fee2e2', text: '#b91c1c' };
        case 'Interview': return { bg: '#fef9c3', text: '#a16207' };
        default: return { bg: '#e0e7ff', text: '#4361ee' }; // Applied/Reviewing
    }
  };

  // --- RECRUITER SORTING HELPER ---
  const getSortedApplications = (apps: Application[], job?: Job) => {
    return [...apps].sort((a, b) => {
        if (sortBy === 'overall') {
            return (b.matchScore || 0) - (a.matchScore || 0);
        }
        
        // Find users for these applications to analyze resume
        const userA = allUsers.find(u => u.id === a.userId);
        const userB = allUsers.find(u => u.id === b.userId);
        const resumeA = userA?.resumeText || '';
        const resumeB = userB?.resumeText || '';

        if (sortBy === 'experience') {
             // Basic heuristic: find "X years" in resume
             const extractYears = (text: string) => {
                 const match = text.match(/(\d+)\+?\s*(years|yrs)/i);
                 return match ? parseInt(match[1]) : 0;
             };
             return extractYears(resumeB) - extractYears(resumeA);
        }

        if (sortBy === 'skills' && job) {
            // Count how many requirements appear in resume
            const countSkills = (text: string) => {
                const lowerText = text.toLowerCase();
                return job.requirements.reduce((acc, req) => {
                    return acc + (lowerText.includes(req.toLowerCase()) ? 1 : 0);
                }, 0);
            };
            return countSkills(resumeB) - countSkills(resumeA);
        }

        return 0;
    });
  };


  // --- JOB SEEKER VIEW ---
  if (user.role === UserRole.JOB_SEEKER) {
      const myApplications = applications.filter(app => app.userId === user.id);
      
      useEffect(() => {
          const fetchRecommendations = async () => {
              if (user.resumeText && user.resumeText.length > 50) {
                  setIsLoadingRecs(true);
                  // Get jobs the user hasn't applied to yet
                  const appliedJobIds = new Set(myApplications.map(a => a.jobId));
                  const availableForRec = jobs.filter(j => !appliedJobIds.has(j.id));
                  
                  // Call AI Service
                  const recommendedIds = await recommendJobsBasedOnResume(user.resumeText, availableForRec);
                  
                  // Filter jobs based on AI return
                  const recs = jobs.filter(j => recommendedIds.includes(j.id));
                  setRecommendedJobs(recs.length > 0 ? recs : availableForRec.slice(0, 2)); // Fallback if AI returns empty
                  setIsLoadingRecs(false);
              } else {
                  setRecommendedJobs([]);
              }
          };

          fetchRecommendations();
      }, [user.resumeText, jobs.length]); 

      const stats = [
          { label: 'Applications', value: myApplications.length, icon: Briefcase, color: '#4361ee', bg: 'rgba(67, 97, 238, 0.1)' },
          { label: 'Interviews', value: myApplications.filter(a => a.status === 'Interview').length, icon: Calendar, color: '#f72585', bg: 'rgba(247, 37, 133, 0.1)' },
          { label: 'Profile Views', value: 24, icon: Eye, color: '#4cc9f0', bg: 'rgba(76, 201, 240, 0.1)' },
      ];

      return (
        <div className="container py-5">
          {/* ... Keeping existing Job Seeker layout ... */}
          <div className="row mb-5 align-items-center">
              <div className="col-md-8">
                  <h2 className="fw-bold text-dark mb-2">Hello, {user.name} 👋</h2>
                  <p className="text-secondary mb-0">Track your applications and resume performance.</p>
              </div>
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <button className="btn btn-primary-custom px-4 shadow-sm" onClick={() => navigate('/jobs')}>
                      Find Jobs
                  </button>
              </div>
          </div>
          
          <div className="row g-4 mb-5">
            {stats.map((stat, i) => (
                <div key={i} className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm p-4 card-hover">
                        <div className="d-flex align-items-center">
                            <div className="rounded-xl p-3 me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: stat.bg, width: 60, height: 60 }}>
                                <stat.icon color={stat.color} size={28} strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0 text-dark display-6">{stat.value}</h3>
                                <p className="text-secondary small fw-bold mb-0 text-uppercase tracking-wide">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
                <div className="card mb-5 border-0 shadow-md overflow-hidden">
                    <div className="card-header bg-white py-4 px-4 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Recent Applications</h5>
                            <button className="btn btn-sm btn-light rounded-pill px-3" onClick={() => navigate('/jobs')}>View All</button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table align-middle mb-0 table-hover">
                            <thead className="bg-light text-uppercase small text-secondary fw-bold">
                                <tr>
                                    <th className="ps-4 py-3 border-bottom-0">Company</th>
                                    <th className="py-3 border-bottom-0">Job Title</th>
                                    <th className="py-3 border-bottom-0">Date</th>
                                    <th className="py-3 border-bottom-0">Match</th>
                                    <th className="py-3 border-bottom-0">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myApplications.length > 0 ? myApplications.map(app => {
                                    const job = jobs.find(j => j.id === app.jobId);
                                    const badgeStyle = getStatusBadgeStyle(app.status);
                                    return (
                                        <tr key={app.id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 fw-bold text-primary-custom" style={{width: 40, height: 40, border: '1px solid #e2e8f0'}}>
                                                        {job?.company.charAt(0)}
                                                    </div>
                                                    <span className="fw-bold text-dark">{job?.company}</span>
                                                </div>
                                            </td>
                                            <td className="text-secondary fw-medium">{job?.title}</td>
                                            <td className="text-secondary small">{app.appliedDate}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="progress w-100 me-2" style={{height: 6, width: 50}}>
                                                        <div 
                                                            className={`progress-bar rounded-pill ${app.matchScore && app.matchScore > 80 ? 'bg-success' : app.matchScore && app.matchScore > 50 ? 'bg-warning' : 'bg-danger'}`} 
                                                            style={{width: `${app.matchScore || 0}%`}}
                                                        ></div>
                                                    </div>
                                                    <span className="small fw-bold">{app.matchScore || 0}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span 
                                                    className="badge rounded-pill fw-medium px-3 py-2"
                                                    style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
                                                >
                                                    {app.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={5} className="text-center py-5 text-secondary">No applications yet. Start exploring!</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <h5 className="fw-bold mb-4 text-dark d-flex align-items-center">
                        <TrendingUp size={20} className="me-2 text-primary-custom" /> Recommended for You
                    </h5>
                    {/* ... Recommended jobs logic ... */}
                    {isLoadingRecs ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary-custom" role="status"></div>
                            <p className="mt-2 text-secondary small">AI is curating jobs based on your resume...</p>
                        </div>
                    ) : user.resumeText ? (
                        <div className="row">
                            {recommendedJobs.length > 0 ? recommendedJobs.map(job => (
                                 <JobCard 
                                    key={job.id} 
                                    job={job} 
                                    onClick={(id) => navigate(`/jobs/${id}`)} 
                                    className="col-md-6 mb-4" 
                                 />
                            )) : (
                                <div className="col-12 text-center py-4 text-secondary">
                                    No specific recommendations found. Try applying to more jobs!
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card border-0 shadow-sm bg-light-subtle p-5 text-center">
                            <div className="mb-3 d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{width: 64, height: 64}}>
                                <Sparkles size={32} className="text-primary-custom" />
                            </div>
                            <h4 className="fw-bold">Unlock AI Recommendations</h4>
                            <p className="text-secondary mx-auto" style={{maxWidth: '400px'}}>
                                Upload your resume to let our AI analyze your skills and match you with the perfect job opportunities.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="col-lg-4">
                <ResumeUpload onUpload={onUpdateResume} currentResumeText={user.resumeText} />
            </div>
          </div>
        </div>
      );
  }

  // --- RECRUITER VIEW ---
  
  const myJobs = jobs.filter(j => j.recruiterId === user.id);
  const myJobIds = new Set(myJobs.map(j => j.id));
  // Filter candidates: if a job is selected, show only for that job, otherwise show all
  const filteredApplications = selectedJobId 
    ? applications.filter(a => a.jobId === selectedJobId)
    : applications.filter(a => myJobIds.has(a.jobId));
  
  const activeJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) : undefined;
  const sortedCandidates = getSortedApplications(filteredApplications, activeJob);

  const statusCounts = [
      { name: 'Applied', value: filteredApplications.filter(c => c.status === 'Applied').length, color: '#4361ee' },
      { name: 'Interview', value: filteredApplications.filter(c => c.status === 'Interview').length, color: '#f72585' },
      { name: 'Accepted', value: filteredApplications.filter(c => c.status === 'Accepted').length, color: '#10b981' },
      { name: 'Rejected', value: filteredApplications.filter(c => c.status === 'Rejected').length, color: '#ef476f' }
  ].filter(d => d.value > 0);

  const handleStatusUpdate = async (status: Application['status']) => {
      if (selectedApp) {
          await updateApplicationStatus(selectedApp.id, status);
          if (onDataChange) onDataChange();
          
          if (status === 'Interview') setSuccessMessage("Interview scheduled.");
          else if (status === 'Accepted') setSuccessMessage("Candidate accepted.");
          else if (status === 'Rejected') setSuccessMessage("Candidate rejected.");
          else setSuccessMessage("Status updated.");
      }
  };

  const closeModal = () => {
      setSelectedApp(null);
      setSuccessMessage(null);
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* LEFT SIDEBAR */}
        <div className="col-lg-3">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '100px', zIndex: 100 }}>
                <div className="card-body p-2">
                    <div className="d-flex align-items-center p-3 mb-2 border-bottom">
                         <div className="rounded-circle bg-primary-custom text-white d-flex align-items-center justify-content-center me-2 fw-bold" style={{width: 36, height: 36}}>
                             {user.name.charAt(0)}
                         </div>
                         <div>
                             <h6 className="mb-0 fw-bold">{user.name}</h6>
                             <small className="text-secondary">Recruiter</small>
                         </div>
                    </div>
                    
                    <div className="list-group list-group-flush">
                        <button 
                            className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 d-flex align-items-center ${activeRecruiterTab === 'overview' && !selectedJobId ? 'bg-primary bg-opacity-10 text-primary-custom fw-bold' : ''}`}
                            onClick={() => { setActiveRecruiterTab('overview'); setSelectedJobId(null); }}
                        >
                            <BarChart2 size={18} className="me-2" /> Overview
                        </button>
                        <button 
                            className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 d-flex align-items-center ${activeRecruiterTab === 'my-jobs' || selectedJobId ? 'bg-primary bg-opacity-10 text-primary-custom fw-bold' : ''}`}
                            onClick={() => { setActiveRecruiterTab('my-jobs'); setSelectedJobId(null); }}
                        >
                            <Briefcase size={18} className="me-2" /> My Jobs
                            <span className="badge bg-secondary ms-auto">{myJobs.length}</span>
                        </button>
                         <button 
                            className="list-group-item list-group-item-action border-0 rounded-3 mb-1 d-flex align-items-center text-dark"
                            onClick={() => navigate('/post-job')}
                        >
                            <Plus size={18} className="me-2" /> Post New Job
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="col-lg-9">
            
            {/* OVERVIEW TAB */}
            {activeRecruiterTab === 'overview' && !selectedJobId && (
                <div className="fade-in">
                    <h4 className="fw-bold mb-4">Dashboard Overview</h4>
                     <div className="row g-4 mb-4">
                        <div className="col-md-6">
                            <div className="card p-4 h-100 bg-gradient-custom text-white border-0 shadow-md position-relative overflow-hidden">
                                <div className="position-relative z-2">
                                    <h6 className="opacity-75 small fw-bold mb-3 text-uppercase">Total Candidates</h6>
                                    <span className="display-4 fw-bold">{applications.filter(a => myJobIds.has(a.jobId)).length}</span>
                                </div>
                                <div className="position-absolute top-0 end-0 rounded-circle bg-white opacity-10" style={{width: 150, height: 150, transform: 'translate(30%, -30%)'}}></div>
                            </div>
                        </div>
                        <div className="col-md-6">
                             <div className="card p-4 h-100 border-0 shadow-sm">
                                <h6 className="text-secondary small fw-bold mb-2 text-uppercase">Active Pipelines</h6>
                                <div style={{ width: '100%', height: '120px' }}>
                                    {statusCounts.length > 0 ? (
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={5} stroke="none">
                                                    {statusCounts.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                </Pie>
                                                <RechartsTooltip />
                                                <Legend verticalAlign="middle" align="right" layout="vertical" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-muted small mt-4 text-center">No applications yet</p>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MY JOBS LIST */}
            {activeRecruiterTab === 'my-jobs' && !selectedJobId && (
                <div className="fade-in">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold mb-0">My Posted Jobs</h4>
                        <button onClick={() => navigate('/post-job')} className="btn btn-sm btn-primary-custom rounded-pill px-3"><Plus size={16} className="me-1"/> Create Job</button>
                    </div>

                    <div className="row g-3">
                        {myJobs.map(job => {
                            const appCount = applications.filter(a => a.jobId === job.id).length;
                            return (
                                <div className="col-md-6" key={job.id}>
                                    <div className="card h-100 border-0 shadow-sm card-hover p-3" onClick={() => setSelectedJobId(job.id)} style={{cursor: 'pointer'}}>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="fw-bold text-primary mb-0">{job.title}</h5>
                                            <span className="badge bg-light text-secondary border">{job.type}</span>
                                        </div>
                                        <p className="text-secondary small mb-3">{job.location} • {job.salary}</p>
                                        <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                                            <div className="d-flex align-items-center text-dark fw-medium">
                                                <Users size={16} className="me-2 text-primary-custom" />
                                                {appCount} Applicants
                                            </div>
                                            <span className="btn btn-sm btn-light rounded-pill">Manage <CheckCircle size={14} className="ms-1"/></span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {myJobs.length === 0 && (
                            <div className="col-12 text-center py-5 text-secondary">
                                <Briefcase size={40} className="mb-3 opacity-50"/>
                                <p>You haven't posted any jobs yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* JOB DETAILS / CANDIDATES LIST */}
            {(selectedJobId || (activeRecruiterTab === 'overview' && !selectedJobId)) && (
                <div className="card border-0 shadow-md overflow-hidden mt-2">
                    <div className="card-header bg-white py-4 px-4 border-bottom">
                         <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                            <div>
                                {selectedJobId && <button className="btn btn-link p-0 text-decoration-none small mb-1" onClick={() => setSelectedJobId(null)}>← Back to Jobs</button>}
                                <h5 className="mb-0 fw-bold">{selectedJobId ? `Candidates for: ${activeJob?.title}` : "All Recent Applications"}</h5>
                            </div>
                            
                            {/* SORTING TABS */}
                            <div className="bg-light p-1 rounded-pill d-flex">
                                <button 
                                    className={`btn btn-sm rounded-pill px-3 ${sortBy === 'overall' ? 'bg-white shadow-sm fw-bold text-primary-custom' : 'text-secondary'}`}
                                    onClick={() => setSortBy('overall')}
                                >
                                    <Star size={14} className="me-1 mb-1"/> Overall Best
                                </button>
                                <button 
                                    className={`btn btn-sm rounded-pill px-3 ${sortBy === 'experience' ? 'bg-white shadow-sm fw-bold text-primary-custom' : 'text-secondary'}`}
                                    onClick={() => setSortBy('experience')}
                                >
                                    <Clock size={14} className="me-1 mb-1"/> Experience
                                </button>
                                <button 
                                    className={`btn btn-sm rounded-pill px-3 ${sortBy === 'skills' ? 'bg-white shadow-sm fw-bold text-primary-custom' : 'text-secondary'}`}
                                    onClick={() => setSortBy('skills')}
                                >
                                    <BrainCircuit size={14} className="me-1 mb-1"/> Skills Match
                                </button>
                            </div>
                         </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table align-middle mb-0 table-hover">
                            <thead className="bg-light small text-uppercase text-secondary fw-bold">
                                <tr>
                                    <th className="ps-4 py-3 border-bottom-0">Candidate</th>
                                    <th className="py-3 border-bottom-0">Job Role</th>
                                    <th className="py-3 border-bottom-0">Date</th>
                                    <th className="py-3 border-bottom-0">
                                        {sortBy === 'overall' ? 'Match Score' : sortBy === 'experience' ? 'Est. Exp' : 'Skill Overlap'}
                                    </th>
                                    <th className="py-3 border-bottom-0">Status</th>
                                    <th className="py-3 border-bottom-0">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCandidates.length > 0 ? sortedCandidates.map(app => {
                                    const job = jobs.find(j => j.id === app.jobId);
                                    const candidateUser = allUsers.find(u => u.id === app.userId);
                                    const badgeStyle = getStatusBadgeStyle(app.status);
                                    
                                    // Calculate dynamic metric based on sort
                                    let sortMetricDisplay = `${app.matchScore || 0}%`;
                                    if (sortBy === 'experience') {
                                        const match = candidateUser?.resumeText?.match(/(\d+)\+?\s*(years|yrs)/i);
                                        sortMetricDisplay = match ? `${match[1]} Yrs` : 'N/A';
                                    } else if (sortBy === 'skills' && job) {
                                        const lowerText = candidateUser?.resumeText?.toLowerCase() || '';
                                        const count = job.requirements.reduce((acc, req) => acc + (lowerText.includes(req.toLowerCase()) ? 1 : 0), 0);
                                        sortMetricDisplay = `${count} / ${job.requirements.length}`;
                                    }

                                    return (
                                     <tr key={app.id}>
                                         <td className="ps-4 py-3">
                                             <div className="d-flex align-items-center">
                                                 <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center me-2 text-secondary fw-bold overflow-hidden" style={{width: 32, height: 32}}>
                                                    {candidateUser?.profilePicture ? (
                                                        <img src={candidateUser.profilePicture} alt="p" className="w-100 h-100 object-fit-cover" />
                                                    ) : (
                                                        app.userId.charAt(0).toUpperCase()
                                                    )}
                                                 </div>
                                                 <div>
                                                     <span className="fw-bold text-dark small d-block">{candidateUser?.name || app.userId}</span>
                                                     <span className="text-secondary small" style={{fontSize: '10px'}}>{candidateUser?.email}</span>
                                                 </div>
                                             </div>
                                         </td>
                                         <td className="fw-medium text-secondary">{job?.title}</td>
                                         <td className="text-secondary small">{app.appliedDate}</td>
                                         <td>
                                            <div className="d-flex align-items-center">
                                                {sortBy === 'overall' && (
                                                    <div className="progress w-100 me-2" style={{height: 6, width: 40}}>
                                                        <div 
                                                            className={`progress-bar rounded-pill ${app.matchScore && app.matchScore > 80 ? 'bg-success' : app.matchScore && app.matchScore > 50 ? 'bg-warning' : 'bg-danger'}`} 
                                                            style={{width: `${app.matchScore || 0}%`}}
                                                        ></div>
                                                    </div>
                                                )}
                                                <span className={`fw-bold small text-dark`}>
                                                    {sortMetricDisplay}
                                                </span>
                                            </div>
                                         </td>
                                         <td>
                                             <span 
                                                 className="badge rounded-pill fw-medium"
                                                 style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
                                             >
                                                 {app.status}
                                             </span>
                                         </td>
                                         <td>
                                             <button 
                                                className="btn btn-sm btn-outline-primary fw-medium rounded-pill px-3"
                                                onClick={() => setSelectedApp(app)}
                                             >
                                                 Review
                                             </button>
                                         </td>
                                     </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={6} className="text-center py-5 text-secondary">No candidates found for this selection.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Review Modal - Glass Effect */}
      {selectedApp && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0, 0.4)', backdropFilter: 'blur(5px)' }}>
              <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg rounded-2xl overflow-hidden">
                      <div className="modal-header border-0 pb-0 pt-4 px-4">
                          <h5 className="modal-title fw-bold">
                            {successMessage ? "Status Updated" : "Review Application"}
                          </h5>
                          <button type="button" className="btn-close" onClick={closeModal}></button>
                      </div>
                      <div className="modal-body p-4">
                          {successMessage ? (
                              <div className="text-center py-3">
                                  <div className="mb-3 d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle" style={{width: '80px', height: '80px'}}>
                                    <CheckCircle size={40} />
                                  </div>
                                  <h4 className="fw-bold text-dark mb-2">Success!</h4>
                                  <p className="text-secondary mb-4">{successMessage}</p>
                                  <button onClick={closeModal} className="btn btn-primary-custom w-100 fw-bold">
                                      Done
                                  </button>
                              </div>
                          ) : (
                              <>
                                  <div className="card bg-light border-0 p-3 mb-4 rounded-xl">
                                      <div className="d-flex justify-content-between mb-2">
                                          <span className="small fw-bold text-secondary text-uppercase">Candidate</span>
                                          <span className="fw-bold text-dark">{allUsers.find(u => u.id === selectedApp.userId)?.name || selectedApp.userId}</span>
                                      </div>
                                      <div className="d-flex justify-content-between align-items-center">
                                          <span className="small fw-bold text-secondary text-uppercase">AI Match Score</span>
                                          <span className={`badge ${selectedApp.matchScore && selectedApp.matchScore > 80 ? 'bg-success' : 'bg-warning'} rounded-pill`}>
                                              {selectedApp.matchScore}% Match
                                          </span>
                                      </div>
                                  </div>
                                  
                                  <div className="d-grid gap-3">
                                      <button onClick={() => handleStatusUpdate('Interview')} className="btn btn-warning text-dark fw-bold py-2 shadow-sm border-0" style={{backgroundColor: '#ffb703'}}>
                                        Schedule Interview
                                      </button>
                                      <div className="d-flex gap-3">
                                          <button onClick={() => handleStatusUpdate('Accepted')} className="btn btn-success flex-grow-1 fw-bold py-2 shadow-sm border-0 bg-gradient"><Check size={18} className="me-1"/> Accept</button>
                                          <button onClick={() => handleStatusUpdate('Rejected')} className="btn btn-danger flex-grow-1 fw-bold py-2 shadow-sm border-0 bg-gradient"><X size={18} className="me-1"/> Reject</button>
                                      </div>
                                  </div>
                              </>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
