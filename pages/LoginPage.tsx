import React, { useState } from 'react';
import { loginUser } from '../services/database';
import { Loader2 } from 'lucide-react';

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
        const user = await loginUser(email, password);
        if (user) {
          onLoginSuccess();
        } else {
          setError('Invalid email or password');
        }
    } catch (err) {
        setError('An error occurred during login');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body">
          <h2 className="text-center fw-bold text-primary-custom mb-4">Login</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
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
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="password123"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary-custom w-100 py-2 fw-bold d-flex justify-content-center align-items-center">
                {loading ? <Loader2 className="animate-spin me-2" size={18} /> : null}
                Login
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="small text-secondary">
              Don't have an account? <button onClick={() => navigate('/register')} className="btn btn-link p-0 text-decoration-none">Register</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};