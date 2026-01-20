import React, { useEffect, useRef, useState } from 'react';
import { Mic, Video as VideoIcon, PhoneOff, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const InterviewRoom = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const ws = useRef(null);
    const [fraudAlerts, setFraudAlerts] = useState([]);

    useEffect(() => {
        // 1. Setup Webcam
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };
        startVideo();

        // 2. Setup WebSocket
        const clientId = Date.now().toString();
        ws.current = new WebSocket(`ws://localhost:8000/ws/interview/${clientId}`);

        ws.current.onopen = () => {
            console.log("Connected to Interview Backend");
        };

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "fraud_alert") {
                const { is_suspicious, alerts } = message.payload;
                if (is_suspicious) {
                    setFraudAlerts(prev => [...prev.slice(-4), ...alerts]); // Keep last 5 alerts
                }
            }
        };

        // 3. Frame Capture Loop
        const interval = setInterval(() => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
                const context = canvasRef.current.getContext('2d');
                context.drawImage(videoRef.current, 0, 0, 640, 480);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5);

                ws.current.send(JSON.stringify({
                    type: "video",
                    data: dataUrl
                }));
            }
        }, 500); // 2 FPS to reduce load

        return () => {
            clearInterval(interval);
            if (ws.current) ws.current.close();
            // Stop tracks
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Hidden Canvas for processing */}
            <canvas ref={canvasRef} width="640" height="480" className="hidden" />

            {/* Header */}
            <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-xl font-bold">Interview Session #1024</h1>
                <div className="text-sm text-gray-400">Time Remaining: 14:32</div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex p-4 gap-4 overflow-hidden">

                {/* Main Video Area */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex-1 bg-black rounded-lg border border-gray-700 relative overflow-hidden flex items-center justify-center">

                        {/* AI Avatar Placeholder */}
                        <div className="text-center z-0 absolute">
                            <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 animate-pulse"></div>
                            <p className="text-gray-300">AI Interviewer is speaking...</p>
                        </div>

                        {/* User Video (Self View) */}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="absolute inset-0 w-full h-full object-cover z-10 opacity-20 hover:opacity-100 transition-opacity"
                        />

                        {/* Alerts Overlay */}
                        {fraudAlerts.length > 0 && (
                            <div className="absolute top-4 left-4 z-20 space-y-2">
                                {fraudAlerts.map((alert, idx) => (
                                    <div key={idx} className="bg-red-600/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-bounce">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="text-sm">{alert}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* PIP View (Explicit) */}
                        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg border border-gray-600 overflow-hidden z-30 shadow-xl">
                            <video
                                ref={el => { if (el && videoRef.current) el.srcObject = videoRef.current.srcObject }}
                                autoPlay
                                muted
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="h-20 bg-gray-800 rounded-lg flex items-center justify-center gap-6">
                        <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition">
                            <Mic className="w-6 h-6" />
                        </button>
                        <button className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition">
                            <VideoIcon className="w-6 h-6" />
                        </button>
                        <Link to="/dashboard" className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition">
                            <PhoneOff className="w-6 h-6" />
                        </Link>
                    </div>
                </div>

                {/* Sidebar (Chat / Questions) */}
                <div className="w-80 bg-gray-800 rounded-lg p-4 flex flex-col">
                    <h2 className="font-semibold mb-4 border-b border-gray-700 pb-2">Interaction Log</h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-xs text-blue-400 mb-1">AI Interviewer</p>
                            <p className="text-sm">Tell me about a time you faced a technical challenge.</p>
                        </div>
                        {/* More messages... */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewRoom;
