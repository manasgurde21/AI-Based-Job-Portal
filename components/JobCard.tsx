import React from 'react';
import { Job } from '../types';
import { MapPin, DollarSign, Clock, Building } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: (jobId: string) => void;
  matchScore?: number;
  className?: string;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick, matchScore, className }) => {
  return (
    <div className={className}>
        <div 
          className="card card-hover h-100 border-0 shadow-sm p-3"
          onClick={() => onClick(job.id)}
        >
          <div className="card-body p-2">
            <div className="d-flex justify-content-between mb-3">
                 <div 
                    className="rounded-3 d-flex align-items-center justify-content-center fw-bold text-white bg-gradient-custom shadow-sm"
                    style={{ width: '48px', height: '48px', fontSize: '1.25rem' }}
                >
                    {job.company.charAt(0)}
                </div>
                {matchScore !== undefined && (
                    <div className="text-end">
                        <span 
                            className="badge rounded-pill fw-bold"
                            style={{ 
                                backgroundColor: matchScore > 80 ? '#dcfce7' : matchScore > 50 ? '#fef9c3' : '#f3f4f6',
                                color: matchScore > 80 ? '#166534' : matchScore > 50 ? '#854d0e' : '#374151',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}
                        >
                          {matchScore}% Match
                        </span>
                    </div>
                )}
            </div>

            <h5 className="card-title fw-bold text-dark mb-1">{job.title}</h5>
            <div className="d-flex align-items-center text-secondary small mb-3 fw-medium">
                <Building size={14} className="me-1" />
                {job.company}
            </div>

            <div className="mb-4">
                {job.requirements.slice(0, 3).map((req, idx) => (
                    <span key={idx} className="badge bg-light text-secondary border me-1 mb-1 fw-medium px-2 py-1">
                        {req}
                    </span>
                ))}
            </div>

            <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                <div className="d-flex align-items-center text-secondary small">
                    <MapPin size={14} className="me-1" />
                    {job.location}
                </div>
                <div className="d-flex align-items-center fw-bold text-primary-custom small">
                    <DollarSign size={14} />
                    {job.salary.replace('$', '')}
                </div>
                <div className="d-flex align-items-center text-secondary small">
                    <Clock size={14} className="me-1" />
                    {new Date(job.postedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                </div>
            </div>
          </div>
        </div>
    </div>
  );
};