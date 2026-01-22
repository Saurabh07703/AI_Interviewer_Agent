import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, Users, Layout, Share,
    Smile, MonitorUp, ChevronUp, Shield, Info,
    X, Send, User, AlertTriangle, MoreHorizontal,
    Grid, AppWindow, PenTool
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
    const participants = [
        { name: localStorage.getItem('candidate_name') || 'You', isMe: true, isTalking: isMicOn },
        { name: 'AI Interviewer', isMe: false, isTalking: true }, // AI always assumed active for demo
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
        <div className="flex flex-col h-screen bg-[#1A1A1A] text-white font-sans overflow-hidden">
            {/* Top Bar (Auto-hide logic could be added) */}
            <div ref={topBarRef} className="h-12 flex items-center justify-between px-4 absolute top-0 w-full z-20 hover:bg-black/40 transition-colors">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-[#232323] p-1 rounded">
                    <Shield className="w-5 h-5 text-green-500 fill-current" />
                    <ChevronUp className="w-3 h-3 text-green-500" />
                    <Info className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="bg-[#232323] flex items-center rounded-md p-1 border border-gray-700">
                        <button
                            onClick={() => setViewMode('speaker')}
                            className={`px-3 py-1 text-xs rounded-sm transition-colors ${viewMode === 'speaker' ? 'bg-[#393939] text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                        >
                            Speaker
                        </button>
                        <button
                            onClick={() => setViewMode('gallery')}
                            className={`px-3 py-1 text-xs rounded-sm transition-colors ${viewMode === 'gallery' ? 'bg-[#393939] text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                        >
                            Gallery
                        </button>
                    </div>
                    <button className="p-2 hover:bg-[#232323] rounded-md text-gray-200 text-sm font-medium flex items-center gap-1">
                        View <Grid className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex overflow-hidden ${activeSidebar ? 'mr-0' : ''} bg-[#1A1A1A]`}>
                {/* Video Area */}
                <div className="flex-1 flex items-center justify-center p-2 relative">

                    {/* View: Gallery Mode */}
                    {viewMode === 'gallery' && (
                        <div className="flex items-center justify-center gap-2 w-full h-full">
                            {/* User Tile */}
                            <div className={`relative bg-black rounded-lg overflow-hidden w-1/2 aspect-video border-2 ${isMicOn ? 'border-[#00CC00]' : 'border-[#333]'}`}>
                                <video ref={videoRef} autoPlay muted className={`w-full h-full object-cover transform scale-x-[-1] ${!isCamOn && 'hidden'}`} />
                                {!isCamOn && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#232323]">
                                        <div className="text-gray-400 text-xl font-medium">{participants[0].name}</div>
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide flex items-center gap-1">
                                    {isMicOn ? <div className="w-2 h-4 bg-green-500 rounded-full animate-pulse" /> : <MicOff className="w-3 h-3 text-red-500" />}
                                    {participants[0].name}
                                </div>
                                <div className="absolute bottom-10 left-4 text-5xl">
                                    <AnimatePresence>
                                        {reactions.map(r => (
                                            <motion.div key={r.id} initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -80 }} exit={{ opacity: 0 }}>
                                                {r.emoji}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* AI Agent Tile */}
                            <div className="relative bg-black rounded-lg overflow-hidden w-1/2 aspect-video border-2 border-[#00CC00]">
                                <div className="w-full h-full flex items-center justify-center bg-[#232323]">
                                    <MonitorUp className="w-24 h-24 text-blue-500 opacity-80" />
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide flex items-center gap-1">
                                    <div className="w-2 h-4 bg-green-500 rounded-full animate-pulse" />
                                    AI Interviewer
                                </div>
                                {/* Context for AI Question */}
                                <div className="absolute top-4 w-full text-center px-8 pointer-events-none">
                                    <span className="bg-black/60 text-white/90 px-4 py-2 rounded-lg text-lg font-medium backdrop-blur-sm">
                                        {currentQuestion}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Speaker Mode */}
                    {viewMode === 'speaker' && (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                            {/* PiP */}
                            <div className="absolute top-14 right-4 w-60 aspect-video bg-black border border-[#333] rounded-lg overflow-hidden z-10 shadow-lg">
                                <video ref={videoRef} autoPlay muted className={`w-full h-full object-cover transform scale-x-[-1] ${!isCamOn && 'hidden'}`} />
                                {!isCamOn && <div className="w-full h-full flex items-center justify-center bg-[#232323] text-gray-500 uppercase font-bold text-2xl">{participants[0].name.charAt(0)}</div>}
                                <div className="absolute bottom-1 left-1 bg-black/50 px-1.5 rounded text-[10px] text-white">
                                    {participants[0].name}
                                </div>
                            </div>

                            {/* Active Speaker (AI) */}
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A1A1A]">
                                <MonitorUp className="w-32 h-32 text-gray-600 mb-8" />
                                <h2 className="text-3xl font-semibold text-white/90 text-center max-w-3xl leading-snug">
                                    {currentQuestion}
                                </h2>
                                <p className="text-gray-500 mt-4 text-sm font-medium uppercase tracking-widest">Active Speaker</p>
                            </div>
                        </div>
                    )}

                    {/* Overlays */}
                    {isScreenSharing && (
                        <div className="absolute inset-0 z-20 bg-black flex items-center justify-center">
                            <video ref={screenRef} autoPlay className="max-w-full max-h-full object-contain" />
                            <div className="absolute top-4 bg-green-500 text-black px-4 py-1 rounded font-bold text-xs uppercase tracking-wider">
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
                                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-md flex items-center gap-3 shadow-xl"
                            >
                                <AlertTriangle className="w-5 h-5 fill-white text-red-600" />
                                <span className="font-semibold">{fraudWarning}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar */}
                {activeSidebar && (
                    <div className="w-[320px] bg-white flex flex-col h-full border-l border-gray-300 shadow-xl z-20">
                        {/* Sidebar content - kept simple but functional */}
                        <div className="h-12 flex items-center justify-center border-b border-gray-200 relative">
                            <h3 className="font-semibold text-gray-800 text-sm">{activeSidebar === 'participants' ? `Participants (${participants.length})` : 'Meeting Chat'}</h3>
                            <button onClick={() => setActiveSidebar(null)} className="absolute left-3 text-gray-500 hover:text-black">
                                <ChevronUp className="w-4 h-4 rotate-180" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-white">
                            {activeSidebar === 'chat' ? (
                                <div className="p-4 space-y-3">
                                    {messages.map((m, i) => (
                                        <div key={i} className="flex flex-col gap-0.5">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs font-bold text-gray-700">{m.role === 'user' ? 'Me' : 'AI Interviewer'}</span>
                                                <span className="text-[10px] text-gray-400">{m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="text-sm text-gray-800 leading-relaxed bg-gray-100 p-2 rounded-md rounded-tl-none">
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-0">
                                    {participants.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-100 border-b border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">{p.name.charAt(0)}</div>
                                                <span className="text-sm text-gray-800 font-medium">{p.name} {p.isMe && '(Me)'}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {p.isTalking ? <Mic className="w-4 h-4 text-gray-600" /> : <MicOff className="w-4 h-4 text-red-500" />}
                                                <Video className="w-4 h-4 text-gray-600" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {activeSidebar === 'chat' && (
                            <div className="p-4 border-t border-gray-200">
                                <div className="relative">
                                    <input className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Type message here..." />
                                    <button className="absolute right-2 top-2 text-gray-400 hover:text-blue-600"><Send className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Controls Bar (Fixed - Exact Height & Color) */}
            <div ref={bottomBarRef} className="h-[72px] bg-[#1a1a1a]/95 backdrop-blur-sm flex items-center justify-center px-4 fixed bottom-0 w-full z-30 border-t border-gray-800">
                {/* Center: Main Controls */}
                <div className="flex items-center gap-2">
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
                        iconColor="text-[#0E71EB]" // Zoom Green usually, but Web often uses Blue/Green distinctions
                        customIcon={<div className="bg-[#0E71EB] p-0.5 rounded-sm"><Share className="w-5 h-5 text-black fill-current" /></div>}
                        onClick={toggleScreenShare}
                        isActive={isScreenSharing}
                        activeBg="bg-[#2D2D2D]"
                        subIcon={ChevronUp}
                    />
                    <ControlButton icon={Smile} label="Reactions" onClick={() => triggerReaction('👍')} />
                    <ControlButton icon={AppWindow} label="Apps" />
                    <ControlButton icon={PenTool} label="Whiteboards" subIcon={ChevronUp} />
                    <ControlButton icon={MoreHorizontal} label="More" />
                </div>

                {/* Right: End */}
                <div className="absolute right-4 text-white">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-[#E02828] hover:bg-[#C92424] text-white px-5 py-2 rounded-md font-bold text-sm tracking-wide transition-colors"
                    >
                        Leave
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
    badge, subIcon: SubIcon, className = "", activeBg, customIcon
}) => (
    <div className={`flex flex-col items-center justify-center gap-1 cursor-pointer group min-w-[72px] h-[64px] rounded-lg transition-colors ${isActive && activeBg ? activeBg : 'hover:bg-[#232323]'}`} onClick={onClick}>
        <div className="relative flex flex-col items-center">
            <div className="relative">
                {customIcon ? customIcon : (
                    <Icon
                        className={`w-6 h-6 stroke-[1.5px] ${iconColor ? iconColor : (isActive ? activeColor : inactiveColor)}`}
                        fill={isActive && label !== "Unmute" && label !== "Start Video" ? "currentColor" : "none"} // Solid fill for active states sometimes
                    />
                )}
                {badge && (
                    <span className="absolute -top-1.5 -right-2 bg-[#E02828] text-white text-[10px] px-1 min-w-[16px] h-4 flex items-center justify-center rounded-full font-bold shadow-sm">
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
        <span className="text-[11px] text-[#A5A5A5] font-medium group-hover:text-white transition-colors tracking-tight">{label}</span>
    </div>
);

export default InterviewRoom;
