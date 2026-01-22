import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 animate-gradient-xy opacity-80"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center w-full max-w-4xl"
            >
                <motion.h1
                    className="text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 text-center drop-shadow-2xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    AI Interviewer Agent
                </motion.h1>

                <motion.p
                    className="text-xl text-gray-300 mb-12 text-center max-w-2xl font-light leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    Upload your CV and let our AI tailor a perfect mock interview for you.
                    <br />
                    <span className="text-blue-300 font-medium">Real-time feedback</span> on your technical skills, communication, and confidence.
                </motion.p>

                <motion.div
                    className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
                >
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-full">
                            <motion.label
                                htmlFor="cv-upload"
                                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group
                                    ${file
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : 'border-gray-600 hover:border-blue-400 hover:bg-blue-500/5'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <AnimatePresence mode="wait">
                                        {file ? (
                                            <motion.div
                                                key="file-uploaded"
                                                initial={{ scale: 0, rotate: -45 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0 }}
                                                className="flex flex-col items-center"
                                            >
                                                <CheckCircle className="w-12 h-12 text-emerald-400 mb-3 shadow-lg rounded-full bg-emerald-900/20 p-2" />
                                                <p className="text-sm text-emerald-100 font-medium">{file.name}</p>
                                                <p className="text-xs text-emerald-300/70 mt-1">Ready to upload</p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="upload-prompt"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="p-3 bg-gray-800 rounded-full mb-3 group-hover:bg-blue-500/20 transition-colors">
                                                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                                </div>
                                                <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">Click to upload PDF Resume</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <input id="cv-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                            </motion.label>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex items-center gap-2 text-red-300 text-sm bg-red-900/30 px-4 py-3 rounded-xl w-full border border-red-500/30 overflow-hidden"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            onClick={handleUploadAndStart}
                            disabled={uploading || !file}
                            whileHover={!uploading && file ? { scale: 1.05 } : {}}
                            whileTap={!uploading && file ? { scale: 0.95 } : {}}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all relative overflow-hidden
                                ${uploading || !file
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
                                }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {uploading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        Processing...
                                    </>
                                ) : (
                                    success ? 'Redirecting...' : 'Get Started'
                                )}
                            </span>
                        </motion.button>

                        {!file && (
                            <p className="text-xs text-center text-gray-500">
                                * Supported formats: PDF only (Max 5MB)
                            </p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
