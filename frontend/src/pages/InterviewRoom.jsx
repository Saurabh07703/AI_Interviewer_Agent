import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, MoreVertical, Layout, Settings,
    Hand, Smile, MonitorUp, Captions, Info, X, Send, User
} from 'lucide-react';

const InterviewRoom = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const ws = useRef(null);
    const recognition = useRef(null);
    const chatEndRef = useRef(null);

    const [isMicOn, setIsMicOn] = useState(false);
    const [isCamOn, setIsCamOn] = useState(true);
    const [messages, setMessages] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState("Waiting for interview to start...");
    const [meetingCode, setMeetingCode] = useState("iqb-bsve-dwt");
    const [currentTime, setCurrentTime] = useState(new Date());

    // Timer Update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Web Speech API Setup
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
                    ws.current.send(JSON.stringify({
                        type: 'answer',
                        payload: transcript
                    }));
                }
                setIsMicOn(false);
            };

            recognition.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsMicOn(false);
            };

            recognition.current.onend = () => {
                if (isMicOn) setIsMicOn(false);
            };
        }
    }, []);

    const toggleMic = () => {
        if (isMicOn) {
            recognition.current?.stop();
            setIsMicOn(false);
        } else {
            try {
                recognition.current?.start();
                setIsMicOn(true);
            } catch (e) {
                console.error("Error starting speech recognition:", e);
            }
        }
    };

    const toggleCam = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getVideoTracks();
            tracks.forEach(track => track.enabled = !track.enabled);
            setIsCamOn(!isCamOn);
        }
    };

    const endCall = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        if (ws.current) {
            ws.current.close();
        }
        navigate('/dashboard');
    };

    useEffect(() => {
        const startInterview = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing media devices:", err);
            }

            const clientId = Date.now();
            ws.current = new WebSocket(`ws://localhost:8000/ws/interview/${clientId}`);

            ws.current.onopen = () => {
                const cvText = localStorage.getItem('cv_text') || '';
                const name = localStorage.getItem('candidate_name') || 'Candidate';
                ws.current.send(JSON.stringify({
                    type: 'init',
                    payload: { name, cv_text: cvText }
                }));
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'question') {
                    setCurrentQuestion(data.payload);
                    addMessage('agent', data.payload);
                } else if (data.type === 'interview_end') {
                    setReportData(data.payload);
                    setShowReport(true);
                }
            };
        };

        startInterview();
        return () => {
            if (ws.current) ws.current.close();
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const addMessage = (role, text) => {
        setMessages(prev => [...prev, { role, text, time: new Date() }]);
    };

    return (
        <div className="flex flex-col h-screen bg-[#202124] text-white overflow-hidden font-sans">
            <div className="flex-1 flex overflow-hidden">
                {/* Main Video Area */}
                <div className={`flex-1 relative flex items-center justify-center p-4 transition-all duration-300 ${isChatOpen ? 'mr-0' : 'mr-0'}`}>
                    <div className="relative w-full h-full max-h-[85vh] bg-[#3c4043] rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className={`w-full h-full object-cover transform scale-x-[-1] ${!isCamOn ? 'hidden' : ''}`}
                        />
                        {!isCamOn && (
                            <div className="flex items-center justify-center w-full h-full">
                                <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                                    {localStorage.getItem('candidate_name')?.charAt(0) || 'S'}
                                </div>
                            </div>
                        )}

                        {/* Name Label Overlay */}
                        <div className="absolute bottom-4 left-4">
                            <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium text-white flex items-center gap-2">
                                <span>{localStorage.getItem('candidate_name') || 'Saurabh Tiwari'}</span>
                            </div>
                        </div>

                        {/* Question Overlay (Optional, consistent with prev design but subtle) */}
                        <div className="absolute top-6 left-6 right-6 pointer-events-none">
                            <div className="bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-3xl mx-auto text-center">
                                <span className="text-blue-300 text-xs font-bold uppercase tracking-widest block mb-2">Current Question</span>
                                <h3 className="text-xl md:text-2xl font-semibold leading-relaxed shadow-sm">
                                    {currentQuestion}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - In-call messages */}
                {isChatOpen && (
                    <div className="w-[360px] bg-[#202124] flex flex-col m-4 ml-0 rounded-2xl bg-[#202124] border border-[#3c4043] shadow-lg">
                        <div className="p-4 flex items-center justify-between border-b border-[#3c4043]/50">
                            <h2 className="text-lg font-medium tracking-tight">In-call messages</h2>
                            <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-[#3c4043] rounded-full transition">
                                <X className="w-5 h-5 text-gray-300" />
                            </button>
                        </div>

                        <div className="p-4 bg-[#3c4043]/30 mx-4 mt-4 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-gray-300 font-medium">Let participants send messages</span>
                            <div className="w-9 h-5 bg-[#8ab4f8] rounded-full relative cursor-pointer">
                                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-[#202124] rounded-full shadow-sm"></div>
                            </div>
                        </div>

                        <div className="bg-[#3c4043]/30 mx-4 mt-4 p-4 rounded-lg flex gap-3">
                            <Info className="w-5 h-5 text-[#8ab4f8] shrink-0 mt-0.5" />
                            <div className="text-xs text-gray-300 leading-relaxed">
                                <span className="text-[#8ab4f8] font-bold block mb-1">Continuous chat is OFF</span>
                                Messages won't be saved when the call ends. You can pin a message to make it visible for people who join later.
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-300">
                                            {msg.role === 'user' ? 'You' : 'AI Interviewer'}
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                            {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`py-2 px-3 rounded-xl max-w-[90%] text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-[#8ab4f8] text-[#202124]'
                                            : 'bg-[#3c4043] text-gray-100'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 relative">
                            <div className="bg-[#3c4043] rounded-full px-5 py-3 flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Send a message"
                                    className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-400 flex-1"
                                    disabled
                                />
                                <button className="text-gray-400 hover:text-[#8ab4f8] transition">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Control Bar */}
            <div className="h-20 flex items-center justify-between px-6 bg-[#202124]">
                {/* Left: Time & Code */}
                <div className="flex items-center gap-4 min-w-[200px]">
                    <span className="text-white text-base font-medium tracking-wide">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-gray-400 text-sm">|</span>
                    <span className="text-gray-300 text-sm font-medium tracking-wider">{meetingCode}</span>
                </div>

                {/* Center: Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleMic}
                        className={`p-3 rounded-full transition-all duration-200 border border-transparent ${isMicOn
                                ? 'bg-[#3c4043] hover:bg-[#45484c] text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-glow'
                            }`}
                        title="Turn off microphone (ctrl + d)"
                    >
                        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={toggleCam}
                        className={`p-3 rounded-full transition-all duration-200 border border-transparent ${isCamOn
                                ? 'bg-[#3c4043] hover:bg-[#45484c] text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-glow'
                            }`}
                        title="Turn off camera (ctrl + e)"
                    >
                        {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </button>

                    <button className="p-3 bg-[#3c4043] hover:bg-[#45484c] rounded-full text-white transition-all">
                        <Captions className="w-5 h-5" strokeWidth={2.5} />
                    </button>

                    <button className="p-3 bg-[#3c4043] hover:bg-[#45484c] rounded-full text-white transition-all">
                        <Smile className="w-5 h-5" />
                    </button>

                    <button className="p-3 bg-[#3c4043] hover:bg-[#45484c] rounded-full text-white transition-all">
                        <MonitorUp className="w-5 h-5" />
                    </button>

                    <button className="p-3 bg-[#3c4043] hover:bg-[#45484c] rounded-full text-white transition-all">
                        <Hand className="w-5 h-5" />
                    </button>

                    <button className="p-3 bg-[#3c4043] hover:bg-[#45484c] rounded-full text-white transition-all">
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    <div className="w-px h-8 bg-[#3c4043] mx-1"></div>

                    <button
                        onClick={endCall}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all w-16"
                    >
                        <PhoneOff className="w-5 h-5 fill-white" />
                    </button>
                </div>

                {/* Right: Info, Chat, etc */}
                <div className="flex items-center gap-3 justify-end min-w-[200px]">
                    <button className="p-2.5 hover:bg-[#3c4043] rounded-full text-gray-300 transition-all">
                        <Info className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`p-2.5 rounded-full text-gray-300 transition-all ${isChatOpen ? 'bg-[#8ab4f8] text-[#202124]' : 'hover:bg-[#3c4043]'}`}
                    >
                        <MessageSquare className="w-5 h-5" fill={isChatOpen ? "#202124" : "none"} />
                    </button>
                    <button className="p-2.5 hover:bg-[#3c4043] rounded-full text-gray-300 transition-all">
                        <Layout className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 hover:bg-[#3c4043] rounded-full text-gray-300 transition-all">
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Report Modal - Same as before but styled darker */}
            {showReport && reportData && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 font-sans">
                    <div className="bg-[#202124] text-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-700">
                        <div className="p-8">
                            <h2 className="text-3xl font-medium mb-2 tracking-tight">Interview Completed</h2>
                            <p className="text-gray-400 mb-8">Performance Summary</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-[#3c4043]/50 p-5 rounded-xl border border-gray-700 text-center">
                                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Decision</h4>
                                    <p className={`text-2xl font-bold mt-2 ${reportData.decision.recommendation === 'Hire' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {reportData.decision.recommendation}
                                    </p>
                                </div>
                                <div className="bg-[#3c4043]/50 p-5 rounded-xl border border-gray-700 text-center">
                                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Score</h4>
                                    <p className="text-2xl font-bold text-[#8ab4f8] mt-2">
                                        {reportData.decision.final_score}/100
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#3c4043]/30 p-6 rounded-xl border border-gray-700 max-h-60 overflow-y-auto whitespace-pre-line text-sm text-gray-300 leading-7">
                                {reportData.report}
                            </div>
                        </div>
                        <div className="bg-[#202124] p-6 flex justify-end gap-3 border-t border-gray-700">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-2.5 hover:bg-[#3c4043] text-[#8ab4f8] font-medium rounded-full transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-2.5 bg-[#8ab4f8] text-[#202124] font-medium rounded-full hover:bg-[#7aa7f5] transition"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewRoom;
