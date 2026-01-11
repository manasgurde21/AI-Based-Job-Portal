import React, { useState } from 'react';
import { registerUser } from '../services/database';
import { UserRole } from '../types';
import { Loader2 } from 'lucide-react';

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
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-body">
          <h2 className="text-center fw-bold text-primary-custom mb-4">Create Account</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <div className="mb-4">
              <label className="form-label">I am a...</label>
              <select 
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value={UserRole.JOB_SEEKER}>Job Seeker</option>
                <option value={UserRole.RECRUITER}>Recruiter</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn btn-accent-custom w-100 py-2 fw-bold d-flex justify-content-center align-items-center">
                {loading ? <Loader2 className="animate-spin me-2" size={18} /> : null}
                Register
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="small text-secondary">
              Already have an account? <button onClick={() => navigate('/login')} className="btn btn-link p-0 text-decoration-none">Login</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};