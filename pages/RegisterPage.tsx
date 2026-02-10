import React, { useState } from 'react';
import { registerUser } from '../services/database';
import { UserRole } from '../types';
import { Loader2, UserPlus } from 'lucide-react';

interface RegisterPageProps {
  onLoginSuccess: () => void;
  navigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onLoginSuccess, navigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.JOB_SEEKER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const user = await registerUser({ name, email, password, role });
        if (user) {
          onLoginSuccess();
        } else {
          setError('User with this email already exists.');
        }
    } catch (err) {
        setError('Registration failed.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
      <div className="card border-0 shadow-lg p-4 glass-card" style={{ maxWidth: '480px', width: '100%' }}>
        
        {/* Decorative Top Accent */}
        <div className="position-absolute top-0 start-0 w-100 bg-accent-color rounded-top" style={{height: '6px', background: 'var(--accent-color)'}}></div>

        <div className="card-body">
          <div className="text-center mb-4">
             <div className="d-inline-flex align-items-center justify-content-center bg-light text-primary-custom rounded-circle mb-3 shadow-sm" style={{width: 50, height: 50}}>
                <UserPlus size={24} />
             </div>
             <h3 className="fw-bold text-dark mb-1">Join HireSense</h3>
             <p className="text-secondary small">Start your intelligent job search journey</p>
          </div>
          
          {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-xl mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
                <div className="col-12">
                    <label className="form-label small fw-bold text-secondary text-uppercase">Full Name</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                    />
                </div>
                <div className="col-12">
                    <label className="form-label small fw-bold text-secondary text-uppercase">Email Address</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                </div>
                <div className="col-12">
                    <label className="form-label small fw-bold text-secondary text-uppercase">Password</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                </div>
                <div className="col-12 mb-2">
                    <label className="form-label small fw-bold text-secondary text-uppercase">I want to...</label>
                    <div className="d-flex gap-2">
                        <div 
                            className={`flex-fill border rounded-xl p-3 cursor-pointer text-center transition-all ${role === UserRole.JOB_SEEKER ? 'border-primary bg-primary bg-opacity-10' : 'bg-light border-light'}`}
                            onClick={() => setRole(UserRole.JOB_SEEKER)}
                            style={{cursor: 'pointer'}}
                        >
                            <span className={`fw-bold d-block ${role === UserRole.JOB_SEEKER ? 'text-primary-custom' : 'text-secondary'}`}>Find Jobs</span>
                        </div>
                        <div 
                            className={`flex-fill border rounded-xl p-3 cursor-pointer text-center transition-all ${role === UserRole.RECRUITER ? 'border-primary bg-primary bg-opacity-10' : 'bg-light border-light'}`}
                            onClick={() => setRole(UserRole.RECRUITER)}
                            style={{cursor: 'pointer'}}
                        >
                            <span className={`fw-bold d-block ${role === UserRole.RECRUITER ? 'text-primary-custom' : 'text-secondary'}`}>Hire Talent</span>
                        </div>
                    </div>
                </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary-custom w-100 py-3 mt-3 fw-bold d-flex justify-content-center align-items-center shadow-md">
                {loading ? <Loader2 className="animate-spin me-2" size={18} /> : null}
                Create Account
            </button>
          </form>

          <div className="mt-4 text-center border-top pt-3">
            <p className="small text-secondary mb-0">
              Already have an account? <button onClick={() => navigate('/login')} className="btn btn-link p-0 text-decoration-none fw-bold text-primary-custom">Login</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};