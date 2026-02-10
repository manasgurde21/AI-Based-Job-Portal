import React from 'react';
import { Job } from '../types';
import { MapPin, DollarSign, Clock, Building, ArrowUpRight } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: (jobId: string) => void;
  matchScore?: number;
  className?: string;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick, matchScore, className }) => {
  // Generate a consistent color based on company name
  const getCompanyColor = (name: string) => {
    const colors = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#10b981', '#f59e0b'];
    const index = name.length % colors.length;
    return colors[index];
  };
  
  const bgGradient = `linear-gradient(135deg, ${getCompanyColor(job.company)} 0%, ${getCompanyColor(job.company)}dd 100%)`;

  return (
    <div className={className}>
        <div 
          className="card h-100 border-0 shadow-sm p-2 bg-white card-hover position-relative overflow-hidden group"
          onClick={() => onClick(job.id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-start mb-3">
                 <div 
                    className="rounded-xl d-flex align-items-center justify-content-center text-white shadow-sm"
                    style={{ width: '56px', height: '56px', background: bgGradient, fontSize: '1.5rem', fontWeight: 700 }}
                >
                    {job.company.charAt(0)}
                </div>
                {matchScore !== undefined ? (
                    <div className="text-end">
                        <span 
                            className="badge rounded-pill fw-bold border"
                            style={{ 
                                backgroundColor: matchScore > 80 ? '#ecfdf5' : matchScore > 50 ? '#fefce8' : '#fef2f2',
                                color: matchScore > 80 ? '#059669' : matchScore > 50 ? '#ca8a04' : '#dc2626',
                                borderColor: matchScore > 80 ? '#a7f3d0' : matchScore > 50 ? '#fde047' : '#fecaca',
                                padding: '0.5em 0.8em'
                            }}
                        >
                          {matchScore}% Match
                        </span>
                    </div>
                ) : (
                   <span className="badge bg-light text-secondary border fw-normal">{job.type}</span>
                )}
            </div>

            <div className="mb-3">
                <h5 className="card-title fw-bold text-dark mb-1 d-flex align-items-center justify-content-between">
                    {job.title}
                </h5>
                <div className="d-flex align-items-center text-secondary small fw-medium">
                    <Building size={14} className="me-1" />
                    {job.company}
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
                {job.requirements.slice(0, 3).map((req, idx) => (
                    <span key={idx} className="badge bg-light text-secondary fw-normal px-2 py-1" style={{ fontSize: '0.75rem' }}>
                        {req}
                    </span>
                ))}
                {job.requirements.length > 3 && (
                    <span className="badge bg-light text-secondary fw-normal px-2 py-1" style={{ fontSize: '0.75rem' }}>+{job.requirements.length - 3}</span>
                )}
            </div>

            <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                <div className="d-flex align-items-center text-secondary small">
                    <MapPin size={14} className="me-1" />
                    {job.location}
                </div>
                <div className="fw-bold text-dark small d-flex align-items-center">
                    <DollarSign size={14} className="text-success" />
                    {job.salary.replace('$', '')}
                </div>
            </div>
          </div>
          
          {/* Hover highlight line */}
          <div className="position-absolute bottom-0 start-0 w-100 bg-primary-custom" style={{ height: '3px', opacity: 0, transition: 'opacity 0.2s' }}></div>
        </div>
    </div>
  );
};