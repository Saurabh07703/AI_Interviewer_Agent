import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0b5cff] flex flex-col items-center justify-center relative font-sans selection:bg-blue-200">
            {/* Top Right Settings/Window Controls (Simulated for visual match) */}
            <div className="absolute top-6 right-6 flex space-x-4 text-white/90">
                <Settings className="w-5 h-5 cursor-pointer hover:rotate-90 transition-transform duration-500" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[440px] flex flex-col items-center"
            >
                {/* Zoom Logo */}
                <div className="mb-14">
                    <h1 className="text-white text-7xl font-bold tracking-tight">zoom</h1>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-2 w-full max-w-sm overflow-hidden ring-1 ring-black/5">
                    {/* Join Button (Primary) */}
                    <button
                        onClick={() => navigate('/join')}
                        className="w-full bg-[#0E71EB] hover:bg-[#0E71EB]/90 text-white font-semibold py-3.5 px-4 rounded-xl mb-2 transition-all duration-200 text-[17px] shadow-sm active:scale-[0.98]"
                    >
                        Join a Meeting
                    </button>

                    {/* Sign Up */}
                    <button
                        className="w-full bg-white hover:bg-gray-50 text-[#232333] font-semibold py-3.5 px-4 rounded-xl mb-2 border border-gray-200 transition-colors duration-200 text-[17px]"
                    >
                        Sign Up
                    </button>

                    {/* Sign In */}
                    <button
                        className="w-full bg-white hover:bg-gray-50 text-[#232333] font-semibold py-3.5 px-4 rounded-xl text-[17px] transition-colors duration-200"
                    >
                        Sign In
                    </button>
                </div>

                {/* Footer Version Info */}
                <div className="mt-16 text-blue-200/80 text-xs font-medium tracking-wide">
                    Version: 5.17.1 (28914)
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
