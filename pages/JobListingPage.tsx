import React, { useState } from 'react';
import { Job } from '../types';
import { JobCard } from '../components/JobCard';
import { Filter, Search } from 'lucide-react';

interface JobListingPageProps {
  jobs: Job[];
  navigate: (path: string) => void;
}

export const JobListingPage: React.FC<JobListingPageProps> = ({ jobs, navigate }) => {
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = jobs.filter(job => {
      const matchesType = filterType === 'All' || job.type === filterType;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = job.title.toLowerCase().includes(searchLower) ||
                            job.company.toLowerCase().includes(searchLower) ||
                            job.location.toLowerCase().includes(searchLower) ||
                            job.requirements.some(req => req.toLowerCase().includes(searchLower));
      
      return matchesType && matchesSearch;
  });

  return (
    <div className="container py-5">
      <div className="d-flex flex-column mb-4">
        <h2 className="fw-bold text-dark mb-4">Browse Opportunities</h2>
        
        <div className="card p-3 shadow-sm border-0 bg-white">
            <div className="row g-3">
                <div className="col-md-8">
                     <div className="input-group">
                        <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-secondary" /></span>
                        <input 
                            type="text" 
                            className="form-control border-start-0 ps-0" 
                            placeholder="Search by job title, skills, company or location..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                </div>
                <div className="col-md-4">
                     <div className="d-flex align-items-center">
                       <Filter size={20} className="text-secondary me-2" />
                       <select 
                         className="form-select"
                         value={filterType}
                         onChange={(e) => setFilterType(e.target.value)}
                        >
                         <option value="All">All Job Types</option>
                         <option value="Full-time">Full-time</option>
                         <option value="Contract">Contract</option>
                         <option value="Remote">Remote</option>
                       </select>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <p className="text-secondary mb-4">Showing {filteredJobs.length} jobs available</p>

      <div className="row">
        {filteredJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onClick={(id) => navigate(`/jobs/${id}`)}
              className="col-12 col-md-6 col-lg-4 mb-4"
            />
        ))}
      </div>
      
      {filteredJobs.length === 0 && (
          <div className="text-center py-5 text-secondary">
              <h4>No jobs found</h4>
              <p>Try adjusting your search terms or filters to see more results.</p>
          </div>
      )}
    </div>
  );
};