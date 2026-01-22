import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const WaitingRoom = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Stimulate "Host letting you in" after 3 seconds
        const timer = setTimeout(() => {
            navigate('/interview');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-2">
                    <div className="text-blue-600 font-bold text-2xl tracking-tighter">zoom</div>
                </div>
                <div className="text-sm text-red-600 font-semibold cursor-pointer hover:underline">Leave</div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg text-center">
                    <h1 className="text-2xl font-semibold mb-6 text-[#232333]">
                        Please wait, the meeting host will let you in soon.
                    </h1>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-left">
                        <h2 className="text-lg font-bold text-[#232333] mb-1">
                            AI Interviewer Agent's Personal Meeting Room
                        </h2>
                        <p className="text-sm text-gray-500">
                            Host: AI Interviewer Agent
                        </p>
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button className="w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                            Test Computer Audio
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 text-center text-xs text-gray-400">
                Wait time may vary depending on the host's schedule.
            </div>
        </div>
    );
};

export default WaitingRoom;
