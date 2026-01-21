import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please upload a valid PDF file.');
        }
    };

    const handleUploadAndStart = async () => {
        if (!file) {
            setError('Please select a CV first.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/upload-cv', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            // Store CV text in localStorage to be accessed by InterviewRoom
            localStorage.setItem('cv_text', data.text);
            localStorage.setItem('candidate_name', 'Verified Candidate'); // Placeholder or extract from CV if possible

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000); // Brief delay to show success
        } catch (err) {
            setError(err.message || 'Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white px-4">
            <h1 className="text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                AI Interviewer Agent
            </h1>
            <p className="text-xl text-gray-300 mb-10 text-center max-w-2xl font-light">
                Upload your CV and let our AI tailor a perfect mock interview for you.
                Get real-time feedback on your technical skills, communication, and confidence.
            </p>

            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-full">
                        <label
                            htmlFor="cv-upload"
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-500 hover:border-blue-400 hover:bg-blue-500/10'
                                }`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {file ? (
                                    <>
                                        <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                                        <p className="text-sm text-gray-200">{file.name}</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-400">Click to upload PDF Resume</p>
                                    </>
                                )}
                            </div>
                            <input id="cv-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                        </label>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg w-full">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        onClick={handleUploadAndStart}
                        disabled={uploading || !file}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] ${uploading || !file
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white'
                            }`}
                    >
                        {uploading ? 'Processing Resume...' : (success ? 'Redirecting...' : 'Get Started')}
                    </button>

                    {!file && (
                        <p className="text-xs text-gray-500 mt-2">
                            * Please upload a PDF file to enable the start button.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
