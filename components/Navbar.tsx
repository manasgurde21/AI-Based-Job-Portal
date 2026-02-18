
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Briefcase, User as UserIcon, LogOut, PlusCircle, Sparkles, Home, LayoutDashboard, Database, HardDrive, WifiOff, RefreshCw, Save } from 'lucide-react';
import { checkBackendHealth } from '../services/database';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, navigate }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ status: boolean; mode: 'postgres' | 'local_file' | 'memory' | 'offline' }>({ status: false, mode: 'offline' });
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
      setIsChecking(true);
      const health = await checkBackendHealth();
      setServerStatus(health);
      setTimeout(() => setIsChecking(false), 500);
  };

  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check System Health on mount
    checkHealth();
    // Poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => {
        window.removeEventListener('scroll', handleScroll);
        clearInterval(interval);
    };
  }, []);

  const isActive = (path: string) => {
      if (path === '/') return location.pathname === '/';
      return location.pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
      return `nav-link-custom ${isActive(path) ? 'active' : ''}`;
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-floating ${scrolled ? 'scrolled' : ''}`}>
      <div className="container-fluid px-2">
        <div className="d-flex align-items-center cursor-pointer me-4" style={{cursor: 'pointer'}} onClick={() => navigate('/')}>
          <div className="bg-gradient-custom text-white rounded-circle p-1 me-2 d-flex align-items-center justify-content-center shadow-sm" style={{width: '36px', height: '36px'}}>
            <Sparkles size={18} fill="currentColor" className="text-white" />
          </div>
          <span className="navbar-brand mb-0 h5 fw-bold text-dark" style={{letterSpacing: '-0.5px'}}>HireSense<span className="text-primary-custom">.ai</span></span>
        </div>
        
        <button className="navbar-toggler border-0 p-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon" style={{width: '1em', height: '1em'}}></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav align-items-center gap-1">
            <li className="nav-item">
              <button onClick={() => navigate('/')} className={`btn btn-link text-decoration-none ${getLinkClass('/')}`}>
                <Home size={18} className="nav-icon" />
                Home
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navigate('/jobs')} className={`btn btn-link text-decoration-none ${getLinkClass('/jobs')}`}>
                <Briefcase size={18} className="nav-icon" />
                Find Jobs
              </button>
            </li>
            {currentUser && (
               <li className="nav-item">
                 <button onClick={() => navigate('/dashboard')} className={`btn btn-link text-decoration-none ${getLinkClass('/dashboard')}`}>
                    <LayoutDashboard size={18} className="nav-icon" />
                    Dashboard
                 </button>
               </li>
            )}
          </ul>
        </div>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <div className="d-flex align-items-center gap-3 pt-3 pt-lg-0">
            
            {/* System Status Badge */}
            <div className="d-none d-lg-flex align-items-center me-2">
                {serverStatus.mode === 'postgres' && (
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center gap-1 fw-medium px-2 py-1 rounded-pill" style={{fontSize: '0.7rem'}} title="Connected to PostgreSQL Database">
                        <Database size={12} /> PostgreSQL
                    </span>
                )}
                {serverStatus.mode === 'local_file' && (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle d-flex align-items-center gap-1 fw-medium px-2 py-1 rounded-pill" style={{fontSize: '0.7rem'}} title="Connected to Local File Database (Fallback)">
                        <Save size={12} /> Local DB
                    </span>
                )}
                {serverStatus.mode === 'memory' && (
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle d-flex align-items-center gap-1 fw-medium px-2 py-1 rounded-pill" style={{fontSize: '0.7rem'}} title="Backend running in memory mode (Data not saved)">
                        <HardDrive size={12} /> Server Mem
                    </span>
                )}
                {serverStatus.mode === 'offline' && (
                     <div className="d-flex align-items-center gap-2">
                         <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle d-flex align-items-center gap-1 fw-medium px-2 py-1 rounded-pill" style={{fontSize: '0.7rem'}} title="Backend unreachable. Using local browser storage.">
                            <WifiOff size={12} /> Offline
                        </span>
                        <button onClick={checkHealth} className="btn btn-sm btn-link p-0 text-secondary" title="Retry connection">
                            <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
                        </button>
                    </div>
                )}
            </div>

            {currentUser ? (
              <>
                {currentUser.role === UserRole.RECRUITER && (
                  <button 
                    onClick={() => navigate('/post-job')} 
                    className="btn btn-sm btn-dark d-flex align-items-center rounded-pill px-3 py-2 shadow-sm"
                  >
                    <PlusCircle size={16} className="me-2" /> Post Job
                  </button>
                )}
                
                <div className="dropdown">
                    <button 
                        className="btn btn-light bg-white border d-flex align-items-center dropdown-toggle rounded-pill ps-1 pe-3 py-1 shadow-sm" 
                        type="button" 
                        data-bs-toggle="dropdown"
                    >
                         {currentUser.profilePicture ? (
                             <img 
                                src={currentUser.profilePicture} 
                                alt="Profile" 
                                className="rounded-circle me-2 object-fit-cover"
                                style={{width: '32px', height: '32px'}}
                             />
                         ) : (
                             <div className="bg-gradient-custom text-white rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold" style={{width: '32px', height: '32px', fontSize: '12px'}}>
                                {currentUser.name.charAt(0).toUpperCase()}
                             </div>
                         )}
                         <span className="fw-semibold small text-dark me-1">{currentUser.name.split(' ')[0]}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3 p-2 rounded-3" style={{minWidth: '200px'}}>
                         <li><h6 className="dropdown-header small text-uppercase fw-bold text-secondary">Account</h6></li>
                         <li><button className="dropdown-item rounded-2 py-2 d-flex align-items-center" onClick={() => navigate('/profile')}><UserIcon size={16} className="me-2 opacity-50"/> My Profile</button></li>
                         <li><hr className="dropdown-divider" /></li>
                         <li><button className="dropdown-item text-danger rounded-2 py-2 d-flex align-items-center" onClick={onLogout}><LogOut size={16} className="me-2"/> Logout</button></li>
                    </ul>
                </div>
              </>
            ) : (
              <div className="d-flex gap-2">
                 <button onClick={() => navigate('/login')} className="btn btn-link text-dark text-decoration-none fw-semibold px-3">
                  Log In
                </button>
                <button onClick={() => navigate('/register')} className="btn btn-primary-custom px-4 rounded-pill shadow-sm fw-bold">
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
