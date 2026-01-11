import React, { useState } from 'react';
import { Job, User, MatchResult } from '../types';
import { analyzeResumeMatch } from '../services/geminiService';
import { MapPin, DollarSign, Briefcase, AlertCircle, Loader2 } from 'lucide-react';

interface JobDetailsPageProps {
  job: Job;
  currentUser: User | null;
  onApply: (jobId: string) => void;
}

export const JobDetailsPage: React.FC<JobDetailsPageProps> = ({ job, currentUser, onApply }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const handleApply = () => {
      onApply(job.id);
      setHasApplied(true);
  };

  const runAiAnalysis = async () => {
    if (!currentUser?.resumeText) {
        alert("Please upload/paste your resume text in the Dashboard first.");
        return;
    }
    setIsAnalyzing(true);
    const result = await analyzeResumeMatch(currentUser.resumeText, job.description + " " + job.requirements.join(", "));
    setMatchResult(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="container py-5">
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="bg-primary-custom p-5 text-white position-relative">
            <h1 className="fw-bold mb-3">{job.title}</h1>
            <div className="d-flex flex-wrap gap-4 text-white-50">
                <div className="d-flex align-items-center"><Briefcase size={18} className="me-2" /> {job.company}</div>
                <div className="d-flex align-items-center"><MapPin size={18} className="me-2" /> {job.location}</div>
                <div className="d-flex align-items-center"><DollarSign size={18} className="me-2" /> {job.salary}</div>
            </div>
            
            <div className="position-absolute top-50 end-0 translate-middle-y me-5 d-none d-md-block">
                 <button 
                    onClick={handleApply}
                    disabled={hasApplied}
                    className={`btn btn-lg fw-bold shadow ${hasApplied ? 'btn-secondary' : 'btn-accent-custom'}`}
                >
                    {hasApplied ? 'Applied' : 'Apply Now'}
                </button>
            </div>
        </div>
        
        {/* Mobile Apply Button */}
        <div className="d-md-none p-3 bg-light border-bottom">
            <button 
                onClick={handleApply}
                disabled={hasApplied}
                className={`btn w-100 fw-bold ${hasApplied ? 'btn-secondary' : 'btn-accent-custom'}`}
            >
                {hasApplied ? 'Applied' : 'Apply Now'}
            </button>
        </div>

        <div className="row g-0">
            {/* Main Content */}
            <div className="col-lg-8 p-4 p-md-5 border-end">
                <h4 className="fw-bold text-dark mb-3">Job Description</h4>
                <p className="text-secondary mb-5" style={{ lineHeight: '1.7' }}>{job.description}</p>
                
                <h4 className="fw-bold text-dark mb-3">Requirements</h4>
                <ul className="text-secondary mb-4">
                    {job.requirements.map((req, i) => (
                        <li key={i} className="mb-2">{req}</li>
                    ))}
                </ul>
            </div>

            {/* Sidebar / AI Analysis */}
            <div className="col-lg-4 p-4 p-md-5 bg-light">
                <h5 className="fw-bold text-dark mb-4 d-flex align-items-center">
                    <span className="text-primary-custom">AI Compatibility</span>
                </h5>

                {!currentUser ? (
                    <div className="alert alert-secondary small">
                        Please login to see your match score.
                    </div>
                ) : !matchResult ? (
                    <div className="text-center py-4">
                        <p className="text-secondary small mb-3">Discover how well your resume matches this job description.</p>
                        <button 
                            onClick={runAiAnalysis}
                            disabled={isAnalyzing}
                            className="btn btn-outline-primary w-100"
                        >
                            {isAnalyzing ? <><Loader2 className="spinner-border spinner-border-sm me-2"/> Analyzing...</> : "Analyze Match"}
                        </button>
                    </div>
                ) : (
                    <div className="fade-in">
                        <div className="d-flex justify-content-center mb-4">
                             <div className="position-relative d-flex justify-content-center align-items-center" style={{ width: '120px', height: '120px' }}>
                                <svg width="120" height="120" viewBox="0 0 36 36">
                                    <path className="text-secondary opacity-25" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path 
                                        strokeDasharray={`${matchResult.score}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                        fill="none" 
                                        stroke={matchResult.score > 75 ? '#10B981' : matchResult.score > 50 ? '#EAB308' : '#EF4444'}
                                        strokeWidth="3" 
                                    />
                                </svg>
                                <span className="position-absolute h3 fw-bold mb-0 text-dark">{matchResult.score}%</span>
                            </div>
                        </div>
                        
                        <div className="card border mb-3">
                            <div className="card-body p-3">
                                <h6 className="text-uppercase text-secondary small fw-bold mb-2">AI Analysis</h6>
                                <p className="small text-dark mb-0">{matchResult.analysis}</p>
                            </div>
                        </div>

                        {matchResult.missingSkills.length > 0 && (
                            <div className="alert alert-danger p-3 border-danger-subtle bg-danger-subtle text-danger">
                                <h6 className="small fw-bold text-uppercase mb-2 d-flex align-items-center">
                                    <AlertCircle size={14} className="me-1" /> Missing Skills
                                </h6>
                                <div className="d-flex flex-wrap gap-1">
                                    {matchResult.missingSkills.map((skill, i) => (
                                        <span key={i} className="badge bg-white text-danger border border-danger-subtle fw-normal">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};