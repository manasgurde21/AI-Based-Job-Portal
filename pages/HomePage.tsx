import React from 'react';
import { Search, MapPin, ArrowRight, CheckCircle2, Zap, Target, Briefcase, Award } from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="position-relative overflow-hidden pt-5 pb-5">
        <div className="container position-relative z-2">
            <div className="row justify-content-center text-center">
                <div className="col-lg-9">
                    <div className="d-inline-flex align-items-center px-3 py-1 bg-white border rounded-pill shadow-sm mb-4">
                        <span className="badge bg-primary-custom rounded-pill me-2">New</span>
                        <span className="small fw-bold text-secondary">AI-Powered Resume Analysis 2.0 is live</span>
                    </div>
                    
                    <h1 className="display-3 fw-800 mb-4 text-dark" style={{ letterSpacing: '-1px', fontWeight: 800 }}>
                        Find your dream job with <br/>
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Intelligent AI Matching
                        </span>
                    </h1>
                    
                    <p className="lead text-secondary mb-5 mx-auto" style={{ maxWidth: '600px', fontSize: '1.25rem' }}>
                        HireSense scans your resume, matches skills, and predicts your success rate. Stop guessing and start getting hired.
                    </p>

                    {/* Floating Search Bar */}
                    <div className="card border-0 shadow-lg mx-auto mb-5 glass-card" style={{ maxWidth: '800px', borderRadius: '1rem' }}>
                        <div className="card-body p-2">
                            <div className="row g-2 align-items-center">
                                <div className="col-md-5">
                                    <div className="input-group">
                                        <span className="input-group-text bg-transparent border-0 ps-3"><Search size={20} className="text-primary-custom" /></span>
                                        <input type="text" className="form-control border-0 bg-transparent shadow-none" placeholder="Job title or keywords..." style={{fontSize: '1rem'}} />
                                    </div>
                                </div>
                                <div className="col-md-4 border-start">
                                    <div className="input-group">
                                        <span className="input-group-text bg-transparent border-0 ps-3"><MapPin size={20} className="text-primary-custom" /></span>
                                        <input type="text" className="form-control border-0 bg-transparent shadow-none" placeholder="Location..." style={{fontSize: '1rem'}} />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <button onClick={() => navigate('/jobs')} className="btn btn-primary-custom w-100 h-100 fw-bold shadow-md">
                                        Search Jobs
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center gap-4 text-secondary small">
                        <span className="d-flex align-items-center"><CheckCircle2 size={16} className="text-success me-1" /> No credit card required</span>
                        <span className="d-flex align-items-center"><CheckCircle2 size={16} className="text-success me-1" /> 14-day free trial</span>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Abstract shapes */}
        <div className="position-absolute top-0 start-0 translate-middle rounded-circle bg-primary-custom opacity-10 blur-3xl" style={{ width: '600px', height: '600px', filter: 'blur(100px)' }}></div>
        <div className="position-absolute bottom-0 end-0 translate-middle-x rounded-circle bg-secondary-color opacity-10 blur-3xl" style={{ width: '500px', height: '500px', filter: 'blur(100px)' }}></div>
      </div>

      {/* Stats Section */}
      <div className="container mb-5">
        <div className="row g-4 justify-content-center">
            {[
                { number: '95%', label: 'Match Accuracy', icon: Target },
                { number: '10k+', label: 'Active Jobs', icon: Briefcase },
                { number: '24h', label: 'Avg. Response', icon: Zap },
                { number: '500+', label: 'Top Companies', icon: Award }
            ].map((stat, idx) => (
                <div key={idx} className="col-6 col-md-3">
                    <div className="card border-0 bg-white shadow-sm h-100 text-center py-4 card-hover">
                        <div className="mb-2 text-primary-custom opacity-75 d-flex justify-content-center">
                            <stat.icon size={28} />
                        </div>
                        <h3 className="fw-bold mb-0 text-dark">{stat.number}</h3>
                        <p className="small text-secondary mb-0 fw-bold text-uppercase">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Feature Split Section */}
      <div className="py-5 bg-white">
        <div className="container py-5">
            <div className="row align-items-center g-5">
                <div className="col-lg-6">
                    <div className="position-relative">
                        <div className="card shadow-lg border-0 rounded-2xl overflow-hidden">
                            <div className="card-header bg-light border-bottom p-3 d-flex align-items-center">
                                <div className="d-flex gap-2">
                                    <div className="rounded-circle bg-danger" style={{width:10, height:10}}></div>
                                    <div className="rounded-circle bg-warning" style={{width:10, height:10}}></div>
                                    <div className="rounded-circle bg-success" style={{width:10, height:10}}></div>
                                </div>
                                <span className="ms-3 small text-secondary fw-bold">AI Analysis Dashboard</span>
                            </div>
                            <div className="card-body p-4 bg-white">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="bg-primary-custom text-white p-3 rounded-xl me-3">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-1">Senior Product Designer</h5>
                                        <span className="badge bg-success bg-opacity-10 text-success">92% Match Score</span>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="small fw-bold text-secondary">Skill Overlap</span>
                                        <span className="small fw-bold text-dark">High</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div className="progress-bar bg-gradient-custom" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                                <div className="p-3 bg-light rounded-xl border">
                                    <p className="small text-secondary mb-0 fst-italic">"Strong candidate with exceptional experience in Figma and Design Systems. Recommended for interview."</p>
                                </div>
                            </div>
                        </div>
                        {/* Floating elements */}
                        <div className="position-absolute top-100 start-100 translate-middle badge bg-white text-dark shadow-lg p-3 rounded-xl border" style={{ marginTop: '-40px', marginLeft: '-40px' }}>
                            <div className="d-flex align-items-center">
                                <CheckCircle2 size={20} className="text-success me-2" />
                                <div className="text-start">
                                    <div className="fw-bold small">Resume Parsed</div>
                                    <div className="text-secondary" style={{fontSize: '10px'}}>Just now</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <span className="text-primary-custom fw-bold text-uppercase small tracking-wide">For Candidates</span>
                    <h2 className="display-6 fw-bold mb-4 mt-2">Get discovered by top tech companies.</h2>
                    <p className="text-secondary lead mb-4">
                        Our AI doesn't just scan for keywords—it understands context, experience, and potential.
                    </p>
                    
                    <ul className="list-unstyled mb-5">
                        {[
                            'Instant feedback on your resume strength',
                            'Personalized job recommendations',
                            'Salary insights based on your profile',
                            'Direct connection to hiring managers'
                        ].map((item, i) => (
                            <li key={i} className="d-flex align-items-center mb-3">
                                <div className="bg-primary-custom bg-opacity-10 text-primary-custom rounded-circle p-1 me-3">
                                    <CheckCircle2 size={16} />
                                </div>
                                <span className="fw-medium text-dark">{item}</span>
                            </li>
                        ))}
                    </ul>
                    
                    <button onClick={() => navigate('/register')} className="btn btn-dark btn-lg px-4 py-3 shadow-sm rounded-pill">
                        Create Free Profile
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};