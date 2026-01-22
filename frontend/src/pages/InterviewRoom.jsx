import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mic, MicOff, Video, VideoOff,
    MessageSquare, Users, Share,
    Smile, MonitorUp, ChevronUp, Shield, Info,
    X, Send, Grid, AppWindow, PenTool, MoreHorizontal,
    Sparkles, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewRoom = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const screenRef = useRef(null);
    const ws = useRef(null);
    const recognition = useRef(null);
    const chatEndRef = useRef(null);
    const fraudTimeoutRef = useRef(null);
    const topBarRef = useRef(null);
    const bottomBarRef = useRef(null);

    // State
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [viewMode, setViewMode] = useState('speaker'); // 'speaker' | 'gallery'
    const [activeSidebar, setActiveSidebar] = useState(null); // 'chat' | 'participants' | null
    const [messages, setMessages] = useState([]);
    const [reactions, setReactions] = useState([]);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState("Waiting for interview to start...");
    const [fraudWarning, setFraudWarning] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Mock Participants for Gallery View
    const storedName = localStorage.getItem('candidate_name') || 'Saurabh Tiwari';
    const participants = [
        { name: storedName.toUpperCase(), isMe: true, isTalking: isMicOn },
        { name: 'AI INTERVIEWER', isMe: false, isTalking: true },
    ];

    // Timer Update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeSidebar]);

    // Web Speech API
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-US';

            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                addMessage('user', transcript);
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({ type: 'answer', payload: transcript }));
                }
                setIsMicOn(false);
            };

            recognition.current.onend = () => { if (isMicOn) setIsMicOn(false); };
        }
    }, []);

    // Websocket & Media Setup
    useEffect(() => {
        const startInterview = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) { console.error("Media error:", err); }

            const clientId = Date.now();
            ws.current = new WebSocket(`ws://localhost:8000/ws/interview/${clientId}`);

            ws.current.onopen = () => {
                const cvText = localStorage.getItem('cv_text') || '';
                const name = localStorage.getItem('candidate_name') || 'Candidate';
                ws.current.send(JSON.stringify({ type: 'init', payload: { name, cv_text: cvText } }));
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'question') {
                    setCurrentQuestion(data.payload);
                    addMessage('agent', data.payload);
                } else if (data.type === 'interview_end') {
                    setReportData(data.payload);
                    setShowReport(true);
                } else if (data.type === 'fraud_alert') {
                    const { reason, face_count } = data.payload;
                    let warningMsg = "Attention Required";
                    if (face_count === 0) warningMsg = "No face detected in frame";
                    else if (face_count > 1) warningMsg = "Multiple faces detected";
                    else if (reason) warningMsg = reason;

                    setFraudWarning(warningMsg);
                    if (fraudTimeoutRef.current) clearTimeout(fraudTimeoutRef.current);
                    fraudTimeoutRef.current = setTimeout(() => setFraudWarning(null), 4000);
                }
            };
        };

        startInterview();
        return () => {
            if (ws.current) ws.current.close();
            if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            if (screenRef.current?.srcObject) screenRef.current.srcObject.getTracks().forEach(track => track.stop());
        };
    }, []);

    const toggleMic = () => {
        if (isMicOn) {
            recognition.current?.stop();
            setIsMicOn(false);
        } else {
            try { recognition.current?.start(); setIsMicOn(true); } catch (e) { }
        }
    };

    const toggleCam = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getVideoTracks().forEach(t => t.enabled = !t.enabled);
            setIsCamOn(!isCamOn);
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            if (screenRef.current?.srcObject) screenRef.current.srcObject.getTracks().forEach(track => track.stop());
            setIsScreenSharing(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                if (screenRef.current) screenRef.current.srcObject = stream;
                setIsScreenSharing(true);
                stream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
            } catch (e) { console.error("Screen share error:", e); }
        }
    };

    const addMessage = (role, text) => {
        setMessages(prev => [...prev, { role, text, time: new Date() }]);
    };

    const triggerReaction = (emoji) => {
        const id = Date.now();
        setReactions(prev => [...prev, { id, emoji }]);
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== id));
        }, 2000);
    };

    return (
        <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
            {/* Top Bar - Zoom Workplace Style */}
            <div ref={topBarRef} className="h-12 flex items-center justify-between px-4 absolute top-0 w-full z-20 bg-black/60 backdrop-blur-sm">
                {/* Left: Brand Name */}
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg tracking-tight">Zoom Workplace</span>
                </div>

                {/* Right: Security & View */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#232323] cursor-pointer transition-colors">
                        <div className="relative">
                            <Shield className="w-5 h-5 text-[#00cc00] fill-current" />
                            <Check className="w-3 h-3 text-black absolute top-1 left-1 stroke-[3px]" />
                        </div>
                    </div>

                    <div className="bg-[#232323] flex items-center rounded-md p-1 border border-gray-700/50">
                        <button className="px-3 py-1 text-xs font-medium bg-[#393939] rounded text-white flex items-center gap-2">
                            <Grid className="w-3 h-3" /> View
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex overflow-hidden ${activeSidebar ? 'mr-0' : ''} bg-black`}>
                {/* Video Area */}
                <div className="flex-1 flex items-center justify-center p-0 relative">

                    {/* View: Gallery Mode (Default/Simulated) */}
                    <div className="flex items-center justify-center w-full h-full p-2 gap-2">
                        {/* User Tile */}
                        <div className={`relative bg-[#1a1a1a] rounded-t-lg overflow-hidden w-full max-w-4xl aspect-video border-[3px] border-[#0E71EB] shadow-2xl`}> {/* Blue border for active speaker simulation or focused */}
                            <video ref={videoRef} autoPlay muted className={`w-full h-full object-cover transform scale-x-[-1] ${!isCamOn && 'hidden'}`} />
                            {!isCamOn && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#232323]">
                                    <div className="text-gray-400 text-3xl font-medium uppercase">{participants[0].name}</div>
                                </div>
                            )}

                            {/* Name Label */}
                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-sm text-[12px] font-semibold text-white flex items-center gap-1.5 backdrop-blur-sm">
                                {isMicOn ? <div className="w-2 h-4 bg-green-500 rounded-full animate-pulse" /> : <MicOff className="w-3 h-3 text-red-500" />}
                                {participants[0].name}
                            </div>

                            {/* Reactions Overlay */}
                            <div className="absolute bottom-12 left-4 text-6xl pointer-events-none">
                                <AnimatePresence>
                                    {reactions.map(r => (
                                        <motion.div key={r.id} initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -100 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
                                            {r.emoji}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Simulated Floating Self View (if in speaker mode - skipped for high fidelity gallery look as per image) */}

                    {/* Overlays */}
                    {isScreenSharing && (
                        <div className="absolute inset-0 z-20 bg-black flex items-center justify-center">
                            <video ref={screenRef} autoPlay className="max-w-full max-h-full object-contain" />
                            <div className="absolute top-16 bg-green-500 text-black px-6 py-2 rounded-full font-bold text-sm shadow-xl">
                                You are screen sharing
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {fraudWarning && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#2D2D2D] text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-2xl border border-red-500/50"
                            >
                                <div className="bg-red-500/20 p-2 rounded-full">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm">Proctoring Alert</span>
                                    <span className="text-xs text-gray-300">{fraudWarning}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar */}
                {activeSidebar && (
                    <div className="w-[350px] bg-white flex flex-col h-full border-l border-gray-300 shadow-2xl z-20">
                        {/* Sidebar Header */}
                        <div className="h-12 flex items-center justify-center border-b border-gray-200 relative bg-gray-50">
                            <h3 className="font-semibold text-gray-800 text-sm">{activeSidebar === 'participants' ? `Participants (${participants.length})` : 'Meeting Chat'}</h3>
                            <button onClick={() => setActiveSidebar(null)} className="absolute left-3 text-gray-500 hover:text-black">
                                <ChevronUp className="w-4 h-4 rotate-180" />
                            </button>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto bg-white">
                            {activeSidebar === 'chat' ? (
                                <div className="p-4 space-y-4">
                                    {messages.map((m, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs font-bold text-gray-900">{m.role === 'user' ? 'Me' : 'AI Recruiter'}</span>
                                                <span className="text-[10px] text-gray-400">{m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="text-sm text-gray-800 leading-relaxed bg-[#f0f2f5] p-2.5 rounded-lg rounded-tl-none">
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {participants.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 py-2 hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{p.name.charAt(0)}</div>
                                                <span className="text-sm text-gray-700 font-medium">{p.name} {p.isMe && '(Me)'}</span>
                                            </div>
                                            <div className="flex gap-2 text-gray-500">
                                                {p.isTalking ? <Mic className="w-4 h-4 text-gray-700" /> : <MicOff className="w-4 h-4 text-red-500" />}
                                                <Video className="w-4 h-4 text-gray-700" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {activeSidebar === 'chat' && (
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <div className="relative">
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-20"
                                        placeholder="Type message here..."
                                    />
                                    <div className="absolute bottom-2 right-2 flex gap-2">
                                        <button className="p-1 text-gray-400 hover:text-blue-600 rounded bg-white border border-gray-200"><Smile className="w-4 h-4" /></button>
                                        <button className="p-1 text-white bg-blue-600 hover:bg-blue-700 rounded"><Send className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Controls Bar */}
            <div ref={bottomBarRef} className="h-[72px] bg-[#1a1a1a] flex items-center justify-between px-4 fixed bottom-0 w-full z-30 border-t border-gray-800/50">

                {/* Left Spacer (for balance if needed, or put Audio settings here) */}
                <div className="w-[100px] hidden md:block"></div>

                {/* Center: Main Controls */}
                <div className="flex items-center justify-center gap-1">
                    <ControlButton
                        icon={isMicOn ? Mic : MicOff}
                        label={isMicOn ? "Mute" : "Unmute"}
                        isActive={isMicOn}
                        onClick={toggleMic}
                        subIcon={ChevronUp}
                        activeColor="text-white"
                        inactiveColor="text-white"
                        badge=""
                    />
                    <ControlButton
                        icon={isCamOn ? Video : VideoOff}
                        label={isCamOn ? "Stop Video" : "Start Video"}
                        isActive={isCamOn}
                        activeColor="text-white"
                        inactiveColor="text-white"
                        onClick={toggleCam}
                        subIcon={ChevronUp}
                    />

                    <div className="w-px h-8 bg-gray-700 mx-2" /> {/* Separator */}

                    <ControlButton icon={Shield} label="Security" />
                    <ControlButton
                        icon={Users}
                        label="Participants"
                        badge={participants.length}
                        onClick={() => setActiveSidebar(activeSidebar === 'participants' ? null : 'participants')}
                        isActive={activeSidebar === 'participants'}
                        activeBg="bg-[#2D2D2D]"
                        subIcon={ChevronUp}
                    />
                    <ControlButton
                        icon={MessageSquare}
                        label="Chat"
                        badge={messages.length > 0 ? messages.length : null}
                        onClick={() => setActiveSidebar(activeSidebar === 'chat' ? null : 'chat')}
                        isActive={activeSidebar === 'chat'}
                        activeBg="bg-[#2D2D2D]"
                        subIcon={ChevronUp}
                    />
                    <ControlButton
                        icon={Share}
                        label="Share Screen"
                        iconColor="text-[#0E71EB]"
                        customIcon={<div className="bg-[#0E71EB]/20 p-1 rounded"><Share className="w-5 h-5 text-[#0E71EB] fill-current" /></div>}
                        onClick={toggleScreenShare}
                        isActive={isScreenSharing}
                        activeBg="bg-[#2D2D2D]"
                        subIcon={ChevronUp}
                    />
                    <ControlButton icon={Smile} label="Reactions" onClick={() => triggerReaction('👍')} />
                    <ControlButton icon={AppWindow} label="Apps" />
                    <ControlButton
                        icon={Sparkles}
                        label="AI Companion"
                        iconColor="text-purple-400"
                        activeColor="text-purple-400"
                    />
                    <ControlButton icon={PenTool} label="Whiteboards" subIcon={ChevronUp} />
                    <ControlButton icon={MoreHorizontal} label="More" />
                </div>

                {/* Right: End Button */}
                <div className="flex items-center justify-end w-[100px]">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-[#E02828] hover:bg-[#C92424] text-white px-4 py-1.5 rounded-md font-semibold text-sm tracking-wide transition-colors flex items-center justify-center"
                    >
                        End
                    </button>
                </div>
            </div>
        </div>
    );
};

// Refined Control Button Component
const ControlButton = ({
    icon: Icon, label, onClick, isActive,
    activeColor = "text-white", inactiveColor = "text-white", iconColor,
    badge, subIcon: SubIcon, activeBg, customIcon
}) => (
    <div className={`flex flex-col items-center justify-center gap-1 cursor-pointer group px-3 h-[64px] rounded-lg transition-colors ${isActive && activeBg ? activeBg : 'hover:bg-[#232323]'}`} onClick={onClick}>
        <div className="relative flex flex-col items-center">
            <div className="relative">
                {customIcon ? customIcon : (
                    <Icon
                        className={`w-5 h-5 stroke-[2px] ${iconColor ? iconColor : (isActive ? activeColor : inactiveColor)}`}
                        fill={isActive && (label === "Security" || label === "Participants") ? "currentColor" : "none"}
                    />
                )}
                {badge && (
                    <span className="absolute -top-2 -right-2 bg-[#E02828] text-white text-[9px] min-w-[14px] h-[14px] flex items-center justify-center rounded-full font-bold shadow-sm ring-2 ring-[#1a1a1a]">
                        {badge}
                    </span>
                )}
            </div>
            {SubIcon && (
                <div className="absolute -top-1 -right-3 text-gray-500">
                    <SubIcon className="w-2.5 h-2.5" />
                </div>
            )}
        </div>
        <span className="text-[10px] text-[#C0C0C0] font-medium group-hover:text-white transition-colors tracking-tight whitespace-nowrap mt-1">{label}</span>
    </div>
);

export default InterviewRoom;
