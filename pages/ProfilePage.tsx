import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { updateUserProfile } from '../services/database';
import { Loader2, Calendar } from 'lucide-react';

interface ProfilePageProps {
  currentUser: User;
  navigate: (path: string) => void;
  onProfileUpdate: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, navigate, onProfileUpdate }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
        name: currentUser.name,
        email: currentUser.email,
        title: currentUser.title || '',
        phoneNumber: currentUser.phoneNumber || '',
        address: currentUser.address || '',
        dob: currentUser.dob || '',
        bio: currentUser.bio || ''
    });
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      await updateUserProfile(currentUser.id, formData);
      onProfileUpdate();
      setLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container py-5">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: '800px' }}>
        <div className="card-header bg-primary-custom text-white p-4">
            <h2 className="h4 mb-0 fw-bold">My Profile</h2>
            <p className="mb-0 opacity-75 small">Manage your personal information</p>
        </div>
        <div className="card-body p-4">
            {isSaved && <div className="alert alert-success">Profile updated successfully!</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Full Name</label>
                        <input type="text" className="form-control" name="name" value={formData.name || ''} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Email</label>
                        <input type="email" className="form-control" name="email" value={formData.email || ''} disabled />
                        <small className="text-secondary">Email cannot be changed</small>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Job Title / Headline</label>
                        <input type="text" className="form-control" name="title" placeholder="e.g. Senior Frontend Engineer" value={formData.title || ''} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Phone Number</label>
                        <input type="tel" className="form-control" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Date of Birth</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white text-secondary"><Calendar size={18} /></span>
                            <input 
                                type="date" 
                                className="form-control border-start-0 ps-0" 
                                name="dob" 
                                value={formData.dob || ''} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold">Location / Address</label>
                        <input type="text" className="form-control" name="address" value={formData.address || ''} onChange={handleChange} />
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold">Bio / Summary</label>
                        <textarea className="form-control" rows={4} name="bio" placeholder="Tell us about yourself..." value={formData.bio || ''} onChange={handleChange}></textarea>
                    </div>

                    <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-light" onClick={() => navigate('/dashboard')}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary-custom px-4 fw-bold d-flex align-items-center">
                            {loading ? <Loader2 className="animate-spin me-2" size={18} /> : null}
                            Save Changes
                        </button>
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};