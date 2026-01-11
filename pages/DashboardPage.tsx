import React, { useState } from 'react';
import { User, UserRole, Job, Application } from '../types';
import { ResumeUpload } from '../components/ResumeUpload';
import { JobCard } from '../components/JobCard';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { FileText, Briefcase, Award, Plus, X, Check, Eye, CheckCircle } from 'lucide-react';
import { updateApplicationStatus } from '../services/database';

interface DashboardPageProps {
  user: User;
  onUpdateResume: (text: string) => void;
  applications: Application[];
  jobs: Job[];
  navigate: (path: string) => void;
  onDataChange?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onUpdateResume, applications, jobs, navigate, onDataChange }) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- JOB SEEKER VIEW ---
  if (user.role === UserRole.JOB_SEEKER) {
      const myApplications = applications.filter(app => app.userId === user.id);
      const appliedJobIds = new Set(myApplications.map(a => a.jobId));
      const recommendedJobs = jobs.filter(j => !appliedJobIds.has(j.id)).slice(0, 2);

      const stats = [
          { label: 'Applied Jobs', value: myApplications.length, icon: Briefcase, color: 'text-primary-custom', bg: 'bg-primary-custom bg-opacity-10' },
          { label: 'Profile Views', value: 12, icon: Eye, color: 'text-info', bg: 'bg-info bg-opacity-10' },
          { label: 'Interviews', value: myApplications.filter(a => a.status === 'Interview').length, icon: Award, color: 'text-success', bg: 'bg-success bg-opacity-10' }
      ];

      return (
        <div className="container py-5">
          <div className="mb-5">
              <h2 className="fw-bold text-dark">Welcome back, {user.name} 👋</h2>
              <p className="text-secondary">Here is what's happening with your job search today.</p>
          </div>
          
          <div className="row g-4 mb-5">
            {stats.map((stat, i) => (
                <div key={i} className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm p-3">
                        <div className="card-body d-flex align-items-center">
                            <div className={`rounded-circle p-3 me-3 ${stat.bg}`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0 text-dark">{stat.value}</h3>
                                <p className="text-secondary small fw-bold mb-0 text-uppercase tracking-wide" style={{fontSize: '0.75rem'}}>{stat.label}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
                <div className="card mb-5 border-0 shadow-sm">
                    <div className="card-header bg-white py-3 border-bottom-0">
                        <h5 className="mb-0 fw-bold">Recent Applications</h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead className="bg-light text-uppercase small text-secondary">
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <th className="ps-4 border-0 py-3">Job Role</th>
                                    <th className="border-0 py-3">Company</th>
                                    <th className="border-0 py-3">Date</th>
                                    <th className="border-0 py-3">Match</th>
                                    <th className="border-0 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="border-top-0">
                                {myApplications.length > 0 ? myApplications.map(app => {
                                    const job = jobs.find(j => j.id === app.jobId);
                                    return (
                                        <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td className="fw-bold text-dark ps-4">{job?.title}</td>
                                            <td className="text-secondary">{job?.company}</td>
                                            <td className="text-secondary small">{app.appliedDate}</td>
                                            <td>
                                                <span 
                                                    className="badge rounded-pill fw-medium" 
                                                    style={{ 
                                                        backgroundColor: app.matchScore && app.matchScore > 80 ? '#d1fae5' : '#fef3c7', 
                                                        color: app.matchScore && app.matchScore > 80 ? '#065f46' : '#92400e' 
                                                    }}
                                                >
                                                    {app.matchScore}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill fw-medium ${app.status === 'Accepted' ? 'bg-success bg-opacity-10 text-success' : app.status === 'Rejected' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary-custom bg-opacity-10 text-primary-custom'}`}>
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
                    <h5 className="fw-bold mb-3 text-dark">AI Recommended Jobs</h5>
                    <div className="row">
                        {recommendedJobs.length > 0 ? recommendedJobs.map(job => (
                             <JobCard 
                                key={job.id} 
                                job={job} 
                                onClick={(id) => navigate(`/jobs/${id}`)} 
                                matchScore={85}
                                className="col-md-6 mb-4" 
                             />
                        )) : <p className="text-secondary">No recommendations available at the moment. Try updating your resume!</p>}
                    </div>
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
  const candidates = applications.filter(a => myJobIds.has(a.jobId));
  
  const statusCounts = [
      { name: 'Applied', value: candidates.filter(c => c.status === 'Applied').length, color: '#4F46E5' },
      { name: 'Interview', value: candidates.filter(c => c.status === 'Interview').length, color: '#EAB308' },
      { name: 'Accepted', value: candidates.filter(c => c.status === 'Accepted').length, color: '#10B981' },
      { name: 'Rejected', value: candidates.filter(c => c.status === 'Rejected').length, color: '#EF4444' }
  ].filter(d => d.value > 0);

  const handleStatusUpdate = async (status: Application['status']) => {
      if (selectedApp) {
          await updateApplicationStatus(selectedApp.id, status);
          if (onDataChange) onDataChange();
          
          if (status === 'Interview') setSuccessMessage("Interview has been scheduled successfully!");
          else if (status === 'Accepted') setSuccessMessage("Candidate has been accepted successfully!");
          else if (status === 'Rejected') setSuccessMessage("Candidate application has been rejected.");
          else setSuccessMessage("Application status updated.");
      }
  };

  const closeModal = () => {
      setSelectedApp(null);
      setSuccessMessage(null);
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold text-dark">Recruiter Dashboard</h2>
            <p className="text-secondary mb-0">Overview of your active job listings and candidates.</p>
          </div>
          <button onClick={() => navigate('/post-job')} className="btn btn-primary-custom d-flex align-items-center shadow-sm">
             <Plus size={18} className="me-2" /> Post New Job
          </button>
      </div>

      <div className="row g-4 mb-4">
          <div className="col-lg-8">
              <div className="row g-4">
                  <div className="col-md-6">
                      <div className="card p-4 h-100 bg-gradient-custom text-white border-0 shadow">
                          <h6 className="opacity-75 small fw-bold mb-3 text-uppercase">Total Candidates</h6>
                          <div className="d-flex align-items-end justify-content-between">
                            <span className="display-4 fw-bold">{candidates.length}</span>
                            <div className="text-end">
                                <span className="d-block small opacity-75">Active Jobs</span>
                                <span className="h4 fw-bold">{myJobs.length}</span>
                            </div>
                          </div>
                      </div>
                  </div>
                  <div className="col-md-6">
                      <div className="card p-4 h-100 border-0 shadow-sm">
                           <h6 className="text-secondary small fw-bold mb-3 text-uppercase">Application Status</h6>
                           <div style={{ width: '100%', height: '150px' }}>
                                {statusCounts.length > 0 ? (
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie 
                                                data={statusCounts} 
                                                dataKey="value" 
                                                nameKey="name" 
                                                cx="50%" 
                                                cy="50%" 
                                                innerRadius={40} 
                                                outerRadius={60} 
                                                paddingAngle={5}
                                            >
                                                {statusCounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 text-secondary small">
                                        No data yet
                                    </div>
                                )}
                           </div>
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="col-lg-4">
               <div className="card p-4 h-100 border-0 shadow-sm">
                    <h6 className="text-secondary small fw-bold mb-4 text-uppercase">Action Required</h6>
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
                        <span className="fw-medium text-dark">New Applications</span>
                        <span className="badge bg-primary-custom rounded-pill">{candidates.filter(c => c.status === 'Applied').length}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
                        <span className="fw-medium text-dark">Interviews Scheduled</span>
                        <span className="badge bg-warning text-dark rounded-pill">{candidates.filter(c => c.status === 'Interview').length}</span>
                    </div>
               </div>
          </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-bottom-0">
            <h5 className="mb-0 fw-bold">Candidate Applications</h5>
        </div>
        <div className="table-responsive">
            <table className="table align-middle mb-0">
                <thead className="bg-light small text-uppercase text-secondary">
                    <tr>
                        <th className="ps-4 border-0 py-3">Job Role</th>
                        <th className="border-0 py-3">Applicant ID</th>
                        <th className="border-0 py-3">Date</th>
                        <th className="border-0 py-3">Match Score</th>
                        <th className="border-0 py-3">Status</th>
                        <th className="border-0 py-3">Action</th>
                    </tr>
                </thead>
                <tbody className="border-top-0">
                    {candidates.length > 0 ? candidates.map(app => {
                        const job = jobs.find(j => j.id === app.jobId);
                        return (
                         <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                             <td className="fw-bold ps-4">{job?.title}</td>
                             <td className="text-secondary small">{app.userId}</td>
                             <td className="text-secondary small">{app.appliedDate}</td>
                             <td>
                                <span className={`fw-bold ${app.matchScore && app.matchScore > 80 ? 'text-success' : 'text-warning'}`}>
                                    {app.matchScore ? `${app.matchScore}%` : 'N/A'}
                                </span>
                             </td>
                             <td>
                                 <span className={`badge rounded-pill fw-medium ${
                                     app.status === 'Accepted' ? 'bg-success bg-opacity-10 text-success' : 
                                     app.status === 'Rejected' ? 'bg-danger bg-opacity-10 text-danger' : 
                                     app.status === 'Interview' ? 'bg-warning bg-opacity-10 text-warning-dark' : 'bg-light text-dark border'
                                 }`}>
                                     {app.status}
                                 </span>
                             </td>
                             <td>
                                 <button 
                                    className="btn btn-sm btn-outline-primary fw-medium"
                                    onClick={() => setSelectedApp(app)}
                                 >
                                     Review
                                 </button>
                             </td>
                         </tr>
                        );
                    }) : (
                        <tr><td colSpan={6} className="text-center py-5 text-secondary">No candidates yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
              <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg">
                      <div className="modal-header border-0 pb-0">
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
                                  <div className="mb-4">
                                      <label className="small fw-bold text-secondary text-uppercase mb-1">Candidate ID</label>
                                      <p className="mb-0 fw-medium bg-light p-2 rounded">{selectedApp.userId}</p>
                                  </div>
                                  <div className="mb-4">
                                      <label className="small fw-bold text-secondary text-uppercase mb-2">AI Match Score</label>
                                      <div className="progress" style={{ height: '24px', borderRadius: '12px' }}>
                                          <div 
                                            className={`progress-bar ${selectedApp.matchScore && selectedApp.matchScore > 80 ? 'bg-success' : 'bg-warning'}`} 
                                            style={{ width: `${selectedApp.matchScore}%` }}
                                          >
                                              {selectedApp.matchScore}%
                                          </div>
                                      </div>
                                  </div>
                                  
                                  <div className="d-grid gap-2">
                                      <button onClick={() => handleStatusUpdate('Interview')} className="btn btn-warning text-dark fw-bold py-2">Schedule Interview</button>
                                      <div className="d-flex gap-2">
                                          <button onClick={() => handleStatusUpdate('Accepted')} className="btn btn-success flex-grow-1 fw-bold py-2"><Check size={18} className="me-1"/> Accept</button>
                                          <button onClick={() => handleStatusUpdate('Rejected')} className="btn btn-danger flex-grow-1 fw-bold py-2"><X size={18} className="me-1"/> Reject</button>
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