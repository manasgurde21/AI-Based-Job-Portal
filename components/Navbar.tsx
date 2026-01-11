import React from 'react';
import { User, UserRole } from '../types';
import { Briefcase, User as UserIcon, LogOut, PlusCircle, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, navigate }) => {
  return (
    <nav className="navbar navbar-expand-lg fixed-top navbar-glass">
      <div className="container">
        <div className="d-flex align-items-center cursor-pointer" style={{cursor: 'pointer'}} onClick={() => navigate('/')}>
          <div className="bg-primary-custom text-white rounded p-1 me-2 d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
            <Sparkles size={20} />
          </div>
          <span className="navbar-brand mb-0 h4 fw-bold text-dark" style={{letterSpacing: '-0.5px'}}>HireSense <span className="text-primary-custom">AI</span></span>
        </div>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <button onClick={() => navigate('/')} className="nav-link btn btn-link text-decoration-none text-secondary fw-medium px-3">Home</button>
            </li>
            <li className="nav-item">
              <button onClick={() => navigate('/jobs')} className="nav-link btn btn-link text-decoration-none text-secondary fw-medium px-3">Jobs</button>
            </li>
            {currentUser && (
               <li className="nav-item">
                 <button onClick={() => navigate('/dashboard')} className="nav-link btn btn-link text-decoration-none text-secondary fw-medium px-3">Dashboard</button>
               </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {currentUser ? (
              <>
                {currentUser.role === UserRole.RECRUITER && (
                  <button 
                    onClick={() => navigate('/post-job')} 
                    className="btn btn-sm btn-primary-custom d-flex align-items-center rounded-pill px-3"
                  >
                    <PlusCircle size={16} className="me-1" /> Post Job
                  </button>
                )}
                
                <div className="dropdown">
                    <button 
                        className="btn btn-sm btn-light border d-flex align-items-center dropdown-toggle rounded-pill px-3 py-2" 
                        type="button" 
                        data-bs-toggle="dropdown"
                    >
                         <div className="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '24px', height: '24px', fontSize: '12px'}}>
                            {currentUser.name.charAt(0)}
                         </div>
                         <span className="fw-medium">{currentUser.name}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2 rounded-3">
                         <li><button className="dropdown-item rounded" onClick={() => navigate('/profile')}>My Profile</button></li>
                         <li><hr className="dropdown-divider" /></li>
                         <li><button className="dropdown-item text-danger rounded" onClick={onLogout}>Logout</button></li>
                    </ul>
                </div>
              </>
            ) : (
              <div className="d-flex gap-2">
                 <button onClick={() => navigate('/login')} className="btn btn-outline-dark border-0 fw-medium px-3">
                  Login
                </button>
                <button onClick={() => navigate('/register')} className="btn btn-primary-custom px-4 rounded-pill shadow-sm">
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};