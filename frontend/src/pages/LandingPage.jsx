import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h1 className="text-5xl font-bold text-blue-600 mb-6">AI Interviewer Agent</h1>
            <p className="text-xl text-gray-700 mb-8 text-center max-w-2xl">
                Master your interview skills with our advanced AI-powered agent.
                Get real-time feedback on voice, video, and emotion.
            </p>
            <Link
                to="/dashboard"
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
            >
                Get Started
            </Link>
        </div>
    );
};

export default LandingPage;
