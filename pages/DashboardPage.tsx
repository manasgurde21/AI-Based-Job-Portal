import React, { useState } from 'react';
import { User, UserRole, Job, Application } from '../types';
import { ResumeUpload } from '../components/ResumeUpload';
import { JobCard } from '../components/JobCard';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { FileText, Briefcase, Award, Plus, X, Check, Eye, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
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
          { label: 'Applications', value: myApplications.length, icon: Briefcase, color: '#4361ee', bg: 'rgba(67, 97, 238, 0.1)' },
          { label: 'Interviews', value: myApplications.filter(a => a.status === 'Interview').length, icon: Calendar, color: '#f72585', bg: 'rgba(247, 37, 133, 0.1)' },
          { label: 'Profile Views', value: 24, icon: Eye, color: '#4cc9f0', bg: 'rgba(76, 201, 240, 0.1)' },
      ];

      return (
        <div className="container py-5">
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
                            <button className="btn btn-sm btn-light rounded-pill px-3">View All</button>
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
                                                            className={`progress-bar rounded-pill ${app.matchScore && app.matchScore > 80 ? 'bg-success' : 'bg-warning'}`} 
                                                            style={{width: `${app.matchScore}%`}}
                                                        ></div>
                                                    </div>
                                                    <span className="small fw-bold">{app.matchScore}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill fw-medium px-3 py-2 ${
                                                    app.status === 'Accepted' ? 'bg-success bg-opacity-10 text-success' : 
                                                    app.status === 'Rejected' ? 'bg-danger bg-opacity-10 text-danger' : 
                                                    app.status === 'Interview' ? 'bg-warning bg-opacity-10 text-warning-dark' : 'bg-primary-custom bg-opacity-10 text-primary-custom'
                                                }`}>
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
                    <div className="row">
                        {recommendedJobs.length > 0 ? recommendedJobs.map(job => (
                             <JobCard 
                                key={job.id} 
                                job={job} 
                                onClick={(id) => navigate(`/jobs/${id}`)} 
                                matchScore={88}
                                className="col-md-6 mb-4" 
                             />
                        )) : <p className="text-secondary">No recommendations available. Try updating your resume.</p>}
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
      { name: 'Applied', value: candidates.filter(c => c.status === 'Applied').length, color: '#4361ee' },
      { name: 'Interview', value: candidates.filter(c => c.status === 'Interview').length, color: '#f72585' },
      { name: 'Accepted', value: candidates.filter(c => c.status === 'Accepted').length, color: '#10b981' },
      { name: 'Rejected', value: candidates.filter(c => c.status === 'Rejected').length, color: '#ef476f' }
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
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold text-dark">Recruiter Dashboard</h2>
            <p className="text-secondary mb-0">Overview of your active job listings and candidates.</p>
          </div>
          <button onClick={() => navigate('/post-job')} className="btn btn-primary-custom d-flex align-items-center shadow-md">
             <Plus size={18} className="me-2" /> Post New Job
          </button>
      </div>

      <div className="row g-4 mb-4">
          <div className="col-lg-8">
              <div className="row g-4">
                  <div className="col-md-6">
                      <div className="card p-4 h-100 bg-gradient-custom text-white border-0 shadow-md overflow-hidden position-relative">
                          <div className="position-relative z-2">
                             <h6 className="opacity-75 small fw-bold mb-3 text-uppercase">Total Candidates</h6>
                             <div className="d-flex align-items-end justify-content-between">
                                <span className="display-3 fw-bold">{candidates.length}</span>
                                <div className="text-end">
                                    <span className="d-block small opacity-75">Active Jobs</span>
                                    <span className="h4 fw-bold">{myJobs.length}</span>
                                </div>
                             </div>
                          </div>
                          {/* Decorative Circles */}
                          <div className="position-absolute top-0 end-0 rounded-circle bg-white opacity-10" style={{width: 200, height: 200, transform: 'translate(30%, -30%)'}}></div>
                          <div className="position-absolute bottom-0 start-0 rounded-circle bg-white opacity-10" style={{width: 150, height: 150, transform: 'translate(-30%, 30%)'}}></div>
                      </div>
                  </div>
                  <div className="col-md-6">
                      <div className="card p-4 h-100 border-0 shadow-sm">
                           <h6 className="text-secondary small fw-bold mb-3 text-uppercase">Application Pipeline</h6>
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
                                                innerRadius={45} 
                                                outerRadius={65} 
                                                paddingAngle={5}
                                                stroke="none"
                                            >
                                                {statusCounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
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
               <div className="card p-4 h-100 border-0 shadow-sm bg-white">
                    <h6 className="text-secondary small fw-bold mb-4 text-uppercase">Quick Actions</h6>
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
                        <span className="fw-medium text-dark">Review New Apps</span>
                        <span className="badge bg-primary-custom rounded-pill">{candidates.filter(c => c.status === 'Applied').length}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                        <span className="fw-medium text-dark">Upcoming Interviews</span>
                        <span className="badge bg-warning text-dark rounded-pill">{candidates.filter(c => c.status === 'Interview').length}</span>
                    </div>
                    <button className="btn btn-light w-100 btn-sm fw-bold">View All Activity</button>
               </div>
          </div>
      </div>

      <div className="card border-0 shadow-md overflow-hidden">
        <div className="card-header bg-white py-4 px-4 border-bottom">
            <h5 className="mb-0 fw-bold">Candidate Applications</h5>
        </div>
        <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover">
                <thead className="bg-light small text-uppercase text-secondary fw-bold">
                    <tr>
                        <th className="ps-4 py-3 border-bottom-0">Candidate</th>
                        <th className="py-3 border-bottom-0">Job Role</th>
                        <th className="py-3 border-bottom-0">Date</th>
                        <th className="py-3 border-bottom-0">Match Score</th>
                        <th className="py-3 border-bottom-0">Status</th>
                        <th className="py-3 border-bottom-0">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.length > 0 ? candidates.map(app => {
                        const job = jobs.find(j => j.id === app.jobId);
                        return (
                         <tr key={app.id}>
                             <td className="ps-4 py-3">
                                 <div className="d-flex align-items-center">
                                     <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center me-2 text-secondary fw-bold" style={{width: 32, height: 32}}>
                                        {app.userId.charAt(0).toUpperCase()}
                                     </div>
                                     <span className="fw-bold text-dark small">ID: {app.userId}</span>
                                 </div>
                             </td>
                             <td className="fw-medium text-secondary">{job?.title}</td>
                             <td className="text-secondary small">{app.appliedDate}</td>
                             <td>
                                <div className="d-flex align-items-center">
                                    <div className="progress w-100 me-2" style={{height: 6, width: 40}}>
                                        <div 
                                            className={`progress-bar rounded-pill ${app.matchScore && app.matchScore > 80 ? 'bg-success' : 'bg-warning'}`} 
                                            style={{width: `${app.matchScore}%`}}
                                        ></div>
                                    </div>
                                    <span className={`fw-bold small ${app.matchScore && app.matchScore > 80 ? 'text-success' : 'text-warning'}`}>
                                        {app.matchScore}%
                                    </span>
                                </div>
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
                                    className="btn btn-sm btn-outline-primary fw-medium rounded-pill px-3"
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
                                          <span className="fw-bold text-dark">{selectedApp.userId}</span>
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