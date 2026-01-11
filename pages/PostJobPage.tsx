import React, { useState } from 'react';
import { User } from '../types';
import { createJob } from '../services/database';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface PostJobPageProps {
  currentUser: User;
  onJobPosted: () => void;
  navigate: (path: string) => void;
}

export const PostJobPage: React.FC<PostJobPageProps> = ({ currentUser, onJobPosted, navigate }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [type, setType] = useState('Full-time');
  const [description, setDescription] = useState('');
  const [requirementsStr, setRequirementsStr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await createJob({
      title,
      company,
      location,
      salary,
      description,
      type: type as any,
      recruiterId: currentUser.id,
      requirements: requirementsStr.split(',').map(s => s.trim()).filter(s => s.length > 0)
    });

    setLoading(false);
    onJobPosted();
  };

  return (
    <div className="container py-5">
      <button onClick={() => navigate('/dashboard')} className="btn btn-link text-decoration-none mb-3 ps-0">
        <ArrowLeft size={16} className="me-1" /> Back to Dashboard
      </button>

      <div className="card shadow-sm">
        <div className="card-header bg-primary-custom text-white p-4">
           <h2 className="h4 mb-0 fw-bold">Post a New Job</h2>
           <p className="mb-0 opacity-75 small">Find the perfect candidate for your team</p>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
             <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label fw-bold">Job Title</label>
                    <input type="text" className="form-control" required value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold">Company Name</label>
                    <input type="text" className="form-control" required value={company} onChange={e => setCompany(e.target.value)} />
                </div>
                
                <div className="col-md-4">
                    <label className="form-label fw-bold">Location</label>
                    <input type="text" className="form-control" required value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <div className="col-md-4">
                    <label className="form-label fw-bold">Salary Range</label>
                    <input type="text" className="form-control" placeholder="$100k - $120k" required value={salary} onChange={e => setSalary(e.target.value)} />
                </div>
                <div className="col-md-4">
                    <label className="form-label fw-bold">Job Type</label>
                    <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Remote">Remote</option>
                    </select>
                </div>

                <div className="col-12">
                    <label className="form-label fw-bold">Requirements (Comma separated)</label>
                    <input type="text" className="form-control" placeholder="React, TypeScript, 3+ years experience" value={requirementsStr} onChange={e => setRequirementsStr(e.target.value)} />
                </div>

                <div className="col-12">
                    <label className="form-label fw-bold">Job Description</label>
                    <textarea className="form-control" rows={6} required value={description} onChange={e => setDescription(e.target.value)}></textarea>
                </div>

                <div className="col-12 mt-4">
                    <button type="submit" disabled={loading} className="btn btn-primary-custom px-5 fw-bold d-flex align-items-center">
                        {loading ? <Loader2 className="animate-spin me-2" size={18} /> : null}
                        Publish Job
                    </button>
                </div>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
};