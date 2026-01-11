import React from 'react';
import { Search, MapPin, ArrowRight, CheckCircle2, Zap, Target } from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="bg-white position-relative overflow-hidden">
        <div className="container position-relative z-2 py-5 my-5">
            <div className="row align-items-center">
                <div className="col-lg-6 mb-5 mb-lg-0">
                    <div className="d-inline-block px-3 py-1 bg-primary-custom bg-opacity-10 text-primary-custom rounded-pill fw-bold small mb-4">
                        ✨ Next Generation Recruitment
                    </div>
                    <h1 className="display-3 fw-bold mb-4 text-dark" style={{ lineHeight: '1.1' }}>
                        Hire Smarter with <br/>
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            HireSense AI
                        </span>
                    </h1>
                    <p className="lead mb-5 text-secondary" style={{ maxWidth: '500px' }}>
                        Stop applying blindly. Our intelligent AI analyzes resumes and matches talent with opportunities instantly and accurately.
                    </p>
                    <div className="d-flex flex-column flex-sm-row gap-3">
                        <button onClick={() => navigate('/jobs')} className="btn btn-primary-custom btn-lg px-5 py-3 shadow-lg d-flex align-items-center justify-content-center">
                            Browse Jobs <ArrowRight size={20} className="ms-2" />
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-outline-dark btn-lg px-5 py-3 border-2 fw-bold">
                            Upload Resume
                        </button>
                    </div>
                    
                    <div className="mt-5 pt-4 border-top d-flex gap-4">
                        <div className="d-flex align-items-center">
                            <h3 className="fw-bold mb-0 me-2">10k+</h3>
                            <span className="text-secondary small line-height-sm">Jobs<br/>Posted</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <h3 className="fw-bold mb-0 me-2">95%</h3>
                            <span className="text-secondary small line-height-sm">Match<br/>Accuracy</span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 position-relative">
                     {/* Decorative Elements */}
                     <div className="position-absolute top-0 end-0 bg-primary-custom opacity-10 rounded-circle" style={{ width: '300px', height: '300px', filter: 'blur(80px)', transform: 'translate(20%, -20%)' }}></div>
                     <div className="position-absolute bottom-0 start-0 bg-secondary opacity-10 rounded-circle" style={{ width: '250px', height: '250px', filter: 'blur(60px)', transform: 'translate(-20%, 20%)' }}></div>
                     
                     <div className="card shadow-lg border-0 p-4 position-relative z-2 animate-fade-in" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}>
                        <div className="d-flex align-items-center mb-4 border-bottom pb-3">
                            <div className="bg-primary-custom text-white p-2 rounded me-3">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h5 className="fw-bold mb-0">AI Match Analysis</h5>
                                <span className="text-secondary small">Real-time compatibility check</span>
                            </div>
                            <span className="ms-auto badge bg-success bg-opacity-10 text-success">92% Match</span>
                        </div>
                        
                        <div className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                                <span className="small fw-bold">Skills Match</span>
                                <span className="small fw-bold text-primary-custom">Excellent</span>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                                <div className="progress-bar bg-gradient-custom" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                                <span className="small fw-bold">Experience</span>
                                <span className="small fw-bold text-secondary">Good</span>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                                <div className="progress-bar bg-info" style={{ width: '78%' }}></div>
                            </div>
                        </div>
                        
                        <div className="d-flex gap-2 mt-2">
                             <div className="badge bg-light text-dark border fw-normal">React</div>
                             <div className="badge bg-light text-dark border fw-normal">Node.js</div>
                             <div className="badge bg-light text-dark border fw-normal">TypeScript</div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="container position-relative" style={{ zIndex: 10 }}>
        <div className="card p-4 border-0 shadow-lg" style={{ marginTop: '-3rem', borderRadius: '1rem' }}>
            <div className="row g-3">
                <div className="col-md-5">
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-white border-end-0 ps-3"><Search size={20} className="text-secondary" /></span>
                        <input type="text" className="form-control border-start-0 ps-0 fs-6" placeholder="Job title, keywords, or company" />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-white border-end-0 ps-3"><MapPin size={20} className="text-secondary" /></span>
                        <input type="text" className="form-control border-start-0 ps-0 fs-6" placeholder="City, state, or zip code" />
                    </div>
                </div>
                <div className="col-md-3">
                    <button onClick={() => navigate('/jobs')} className="btn btn-primary-custom w-100 h-100 fw-bold shadow">
                        Find Jobs
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-5 my-5">
        <div className="container py-4">
            <div className="text-center mb-5">
                <span className="text-primary-custom fw-bold text-uppercase small tracking-wide">Why Choose HireSense?</span>
                <h2 className="fw-bold mt-2 display-6">Intelligent hiring for the modern era</h2>
            </div>

            <div className="row g-4">
                {[
                    { title: 'Resume Parsing', desc: 'Our AI extracts key skills and experience automatically from PDFs and text.', icon: <Target size={32} className="text-white"/>, color: 'bg-primary-custom' },
                    { title: 'Smart Matching', desc: 'Get a compatibility score for every job listing to save you time.', icon: <Zap size={32} className="text-white"/>, color: 'bg-secondary' },
                    { title: 'Instant Feedback', desc: 'See missing skills and improve your resume instantly with AI suggestions.', icon: <CheckCircle2 size={32} className="text-white"/>, color: 'bg-success' }
                ].map((feature, idx) => (
                    <div key={idx} className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm p-4 hover-lift transition-all">
                            <div className={`mb-4 rounded-3 d-flex align-items-center justify-content-center ${feature.color}`} style={{ width: '64px', height: '64px', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)' }}>
                                {feature.icon}
                            </div>
                            <h4 className="h5 fw-bold mb-3">{feature.title}</h4>
                            <p className="text-secondary mb-0">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};