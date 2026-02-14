import React, { useState } from 'react';
import { loginUser } from '../services/database';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        await loginUser(email, password);
        onLoginSuccess();
    } catch (err: any) {
        console.error(err);
        if (err.message === 'Failed to fetch') {
            setError('Cannot connect to server. Please make sure the backend is running on port 5000.');
        } else {
            setError(err.message || 'Invalid email or password');
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
      <div className="card border-0 shadow-lg p-4 glass-card" style={{ maxWidth: '420px', width: '100%' }}>
        
        {/* Decorative Top Accent */}
        <div className="position-absolute top-0 start-0 w-100 bg-gradient-custom rounded-top" style={{height: '6px'}}></div>

        <div className="card-body">
          <div className="text-center mb-4">
             <div className="d-inline-flex align-items-center justify-content-center bg-primary-custom text-white rounded-circle mb-3 shadow-sm" style={{width: 48, height: 48}}>
                <Sparkles size={24} />
             </div>
             <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
             <p className="text-secondary small">Login to access your personalized dashboard</p>
          </div>
          
          {error && (
            <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-xl mb-4 d-flex align-items-start">
                <AlertCircle size={18} className="me-2 mt-1 flex-shrink-0" />
                <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary text-uppercase">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                placeholder="alex.j@example.com"
              />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary text-uppercase">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary-custom w-100 py-2 fw-bold d-flex justify-content-center align-items-center shadow-md">
                {loading ? <Loader2 className="animate-spin me-2" size={18} /> : null}
                Sign In
            </button>
          </form>

          <div className="mt-4 text-center border-top pt-3">
            <p className="small text-secondary mb-0">
              New to HireSense? <button onClick={() => navigate('/register')} className="btn btn-link p-0 text-decoration-none fw-bold text-primary-custom">Create Account</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};