import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const JoinScreen = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [name, setName] = useState('');
    const [meetingId] = useState('425 496 5983'); // Fixed ID from user request

    useEffect(() => {
        const queryName = searchParams.get('uname');
        if (queryName) {
            setName(queryName);
        }
    }, [searchParams]);

    const handleJoin = (e) => {
        e.preventDefault();
        if (name.trim()) {
            localStorage.setItem('candidate_name', name);
            navigate('/waiting-room');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white font-sans text-[#2d2d2d]">
            {/* Minimal Header */}
            <div className="absolute top-0 w-full h-16 flex items-center justify-between px-6 border-b border-gray-200">
                <div className="text-blue-600 font-bold text-2xl tracking-tighter">zoom</div>
                <div className="text-sm text-gray-600">Support</div>
            </div>

            <div className="w-full max-w-md p-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-[#232333]">Join Meeting</h1>

                <form onSubmit={handleJoin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Name
                        </label>
                        <input
                            type="text"
                            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-base"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meeting ID
                        </label>
                        <input
                            type="text"
                            className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed text-base tracking-wider"
                            value={meetingId}
                            disabled
                        />
                    </div>

                    <div className="flex items-center gap-2 my-2">
                        <input type="checkbox" id="audio" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                        <label htmlFor="audio" className="text-sm text-gray-600">Don't connect to audio</label>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <input type="checkbox" id="video" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                        <label htmlFor="video" className="text-sm text-gray-600">Turn off my video</label>
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className={`h-12 rounded-xl font-bold text-base transition-colors ${name.trim()
                                ? 'bg-[#0E71EB] hover:bg-[#0b5cbe] text-white shadow-lg shadow-blue-200'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Join
                    </button>

                    <button
                        type="button"
                        className="text-[#0E71EB] text-sm font-medium hover:underline text-center mt-2"
                    >
                        Cancel
                    </button>
                </form>
            </div>

            <div className="absolute bottom-6 text-xs text-gray-500">
                Copyright ©2025 Zoom Video Communications, Inc. All rights reserved.
            </div>
        </div>
    );
};

export default JoinScreen;
