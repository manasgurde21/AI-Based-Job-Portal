import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Star, AlertTriangle, Loader2 } from 'lucide-react';
import { reviewResumeQuality, ResumeReviewResult } from '../services/geminiService';

interface ResumeUploadProps {
  onUpload: (text: string) => void;
  currentResumeText?: string;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload, currentResumeText }) => {
  const [text, setText] = useState(currentResumeText || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Review State
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<ResumeReviewResult | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    
    // Simulate PDF parsing for demo purposes (actual PDF parsing needs heavy libraries)
    if (file.type === 'application/pdf') {
        // In a real app, use pdfjs-dist here.
        // For this demo, we mock the extraction or prompt the user.
        alert("PDF Uploaded! In this demo environment, we cannot extract text from PDFs locally. Please ensure the text below represents your resume.");
        if (text.length < 50) {
            setText(`[Simulated Content from ${file.name}]\n\nExperienced Professional with skills in...\n(Please paste actual content for accurate AI results)`);
        }
    } else if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setText(ev.target.result as string);
            }
        };
        reader.readAsText(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          processFile(e.target.files[0]);
      }
  };

  const handleSave = () => {
      onUpload(text);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReview = async () => {
      if (!text || text.length < 50) {
          alert("Please provide more resume content for analysis.");
          return;
      }
      setIsReviewing(true);
      const result = await reviewResumeQuality(text);
      setReviewResult(result);
      setIsReviewing(false);
  };

  return (
    <div className="d-flex flex-column gap-4 h-100">
        {/* Upload Section */}
        <div className="card">
        <div className="card-body">
            <h5 className="card-title fw-bold mb-3">Resume Upload</h5>
            
            <div 
                className={`p-4 text-center mb-4 rounded border-2 ${isDragOver ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle'}`}
                style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('resume-file-input')?.click()}
            >
                <UploadCloud size={48} className="text-secondary mb-2" />
                <p className="mb-1 fw-medium text-dark">
                    {fileName ? `Selected: ${fileName}` : "Drag & drop PDF or Text file"}
                </p>
                <p className="small text-secondary mb-0">or click to browse</p>
                <input 
                    type="file" 
                    id="resume-file-input" 
                    className="d-none" 
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileSelect}
                />
            </div>

            <div className="mb-3">
                <label className="form-label small fw-bold text-secondary d-flex align-items-center">
                    <FileText size={14} className="me-1" />
                    Resume Text (Editable)
                </label>
                <textarea
                    className="form-control"
                    rows={6}
                    placeholder="Paste your resume text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                ></textarea>
            </div>

            <button 
                onClick={handleSave}
                className={`btn w-100 d-flex align-items-center justify-content-center ${isSaved ? 'btn-success text-white' : 'btn-primary-custom'}`}
            >
                {isSaved ? (
                    <>
                        <CheckCircle size={18} className="me-2" />
                        Saved
                    </>
                ) : "Save Resume"}
            </button>
        </div>
        </div>

        {/* AI Review Section */}
        <div className="card bg-light border-0">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title fw-bold mb-0 text-dark">AI Resume Review</h5>
                    {reviewResult && (
                        <span className={`badge ${reviewResult.rating >= 8 ? 'bg-success' : reviewResult.rating >= 6 ? 'bg-warning' : 'bg-danger'}`}>
                            Score: {reviewResult.rating}/10
                        </span>
                    )}
                </div>

                {!reviewResult ? (
                    <div className="text-center py-3">
                        <p className="small text-secondary mb-3">Get instant feedback on your resume's strength.</p>
                        <button 
                            onClick={handleReview} 
                            disabled={isReviewing || !text}
                            className="btn btn-outline-primary btn-sm"
                        >
                            {isReviewing ? <><Loader2 className="spinner-border spinner-border-sm me-2"/> Analyzing...</> : "Review My Resume"}
                        </button>
                    </div>
                ) : (
                    <div className="fade-in">
                        <p className="small fst-italic text-secondary mb-3">"{reviewResult.summary}"</p>
                        
                        <div className="mb-3">
                            <h6 className="small fw-bold text-success d-flex align-items-center"><CheckCircle size={14} className="me-1"/> Strengths</h6>
                            <ul className="mb-0 small ps-3">
                                {reviewResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>

                        <div>
                            <h6 className="small fw-bold text-warning d-flex align-items-center"><AlertTriangle size={14} className="me-1"/> Improvements</h6>
                            <ul className="mb-0 small ps-3">
                                {reviewResult.improvements.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};