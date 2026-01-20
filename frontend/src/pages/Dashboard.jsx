import React from 'react';
import { Link } from 'react-router-dom';
import { Video, FileText, Settings } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-gray-800">Candidate Dashboard</h1>
                <p className="text-gray-600">Welcome back, get ready for your next interview.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* New Interview Card */}
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">New Interview</h2>
                        <Video className="text-blue-500 w-6 h-6" />
                    </div>
                    <p className="text-gray-600 mb-6">Start a new AI-driven mock interview session with real-time analysis.</p>
                    <Link
                        to="/interview"
                        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Start Session
                    </Link>
                </div>

                {/* History Card */}
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">History & Reports</h2>
                        <FileText className="text-green-500 w-6 h-6" />
                    </div>
                    <p className="text-gray-600 mb-6">View your past interview performance scores and feedback reports.</p>
                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                        View Reports
                    </button>
                </div>

                {/* Settings Card */}
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Profile Settings</h2>
                        <Settings className="text-gray-500 w-6 h-6" />
                    </div>
                    <p className="text-gray-600 mb-6">Update your resume, skills, and account preferences.</p>
                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                        Manage Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
