import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Signal, Info, Heart, Sparkles, Flower2 } from 'lucide-react';
import { connectLiveSession, createPcmBlob } from '../services/geminiService';
import { TRANSLATIONS } from '../utils/translations';

interface LiveSessionProps {
    lang: 'en' | 'zh';
}

const LiveSession: React.FC<LiveSessionProps> = ({ lang }) => {
    const t = TRANSLATIONS[lang].live;
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState(t.ready);
    const [duration, setDuration] = useState(0);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    
    // Update status text when lang changes if not connected
    useEffect(() => {
        if (!isConnected) {
            setStatus(t.ready);
        } else {
            setStatus(t.connected);
        }
    }, [lang]);
    
    // Media & Logic Refs
    const inputContextRef = useRef<AudioContext | null>(null);
    const outputContextRef = useRef<AudioContext | null>(null);
    const sessionRef = useRef<any>(null);
    const nextStartTimeRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const timerRef = useRef<number | null>(null);
    const videoIntervalRef = useRef<number | null>(null);
    
    // Element Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startSession = async () => {
        try {
            setStatus(t.warming_up);
            
            // Audio Contexts
            inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            // Get User Media (Audio + Video)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            streamRef.current = stream;
            
            // Preview Video
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const sessionPromise = connectLiveSession(
                async (base64Audio) => {
                    // --- AUDIO OUTPUT PLAYBACK ---
                    if (!outputContextRef.current) return;
                    
                    const ctx = outputContextRef.current;
                    const audioData = atob(base64Audio);
                    const len = audioData.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) bytes[i] = audioData.charCodeAt(i);
                    
                    const dataInt16 = new Int16Array(bytes.buffer);
                    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
                    const channelData = buffer.getChannelData(0);
                    for(let i=0; i<channelData.length; i++) {
                        channelData[i] = dataInt16[i] / 32768.0;
                    }

                    const source = ctx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(ctx.destination);
                    
                    const currentTime = ctx.currentTime;
                    const startTime = Math.max(nextStartTimeRef.current, currentTime);
                    source.start(startTime);
                    nextStartTimeRef.current = startTime + buffer.duration;
                },
                () => {
                    handleDisconnect();
                }
            );

            sessionPromise.then(session => {
                sessionRef.current = session;
                setIsConnected(true);
                setStatus(t.connected);
                startTimer();
                
                // --- AUDIO INPUT STREAMING ---
                if (inputContextRef.current) {
                    const source = inputContextRef.current.createMediaStreamSource(stream);
                    const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
                    processorRef.current = processor;

                    processor.onaudioprocess = (e) => {
                        if (isMuted) return; // Mute logic
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = createPcmBlob(inputData);
                        session.sendRealtimeInput({ media: pcmBlob });
                    };

                    source.connect(processor);
                    processor.connect(inputContextRef.current.destination);
                }

                // --- VIDEO INPUT STREAMING (1 FPS) ---
                videoIntervalRef.current = window.setInterval(() => {
                    if (videoRef.current && canvasRef.current && isVideoOn) {
                        const canvas = canvasRef.current;
                        const video = videoRef.current;
                        
                        // Draw video frame to canvas
                        canvas.width = video.videoWidth * 0.2; // Scale down significantly for bandwidth/latency
                        canvas.height = video.videoHeight * 0.2;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            // Convert to base64 jpeg
                            const base64Data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
                            session.sendRealtimeInput({ 
                                media: { 
                                    mimeType: 'image/jpeg', 
                                    data: base64Data 
                                } 
                            });
                        }
                    }
                }, 1000); // 1 Frame per second is enough for "Live Presence" context without overloading
            });

        } catch (e) {
            console.error(e);
            setStatus(t.mic_access);
            setIsConnected(false);
        }
    };

    const handleDisconnect = () => {
        setIsConnected(false);
        setStatus(t.ended);
        stopTimer();
    };

    const stopSession = () => {
        if (sessionRef.current) {
            try { (sessionRef.current as any).close?.(); } catch(e) {}
            sessionRef.current = null;
        }
        
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        
        if (inputContextRef.current) {
            inputContextRef.current.close();
            inputContextRef.current = null;
        }
        if (outputContextRef.current) {
            outputContextRef.current.close();
            outputContextRef.current = null;
        }

        if (videoIntervalRef.current) {
            clearInterval(videoIntervalRef.current);
            videoIntervalRef.current = null;
        }

        handleDisconnect();
        nextStartTimeRef.current = 0;
    };

    const toggleVideo = () => {
        const newState = !isVideoOn;
        setIsVideoOn(newState);
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(t => t.enabled = newState);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const startTimer = () => {
        setDuration(0);
        timerRef.current = window.setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        return () => {
            stopSession();
        };
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] relative overflow-hidden font-sans">
            {/* Hidden Video/Canvas for Processing */}
            <video ref={videoRef} autoPlay playsInline muted className="hidden" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Background Ambient Decor - Warm & Healing */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#FEF9E7] to-transparent opacity-80"></div>
                {isConnected && (
                     <div className="absolute inset-0 bg-gradient-to-b from-[#F4D03F]/10 via-transparent to-transparent animate-pulse duration-[4000ms]"></div>
                )}
                <div className="absolute top-10 left-10 text-[#F4D03F]/20 animate-float"><Flower2 size={48} /></div>
                <div className="absolute bottom-20 right-10 text-[#5DADE2]/10 animate-float" style={{animationDelay: '1s'}}><Heart size={64} /></div>
            </div>

            {/* Main Video Call Interface */}
            <div className="relative z-10 flex flex-col h-full max-w-lg mx-auto w-full md:border-x md:border-white/50 bg-white/40 backdrop-blur-sm shadow-2xl">
                
                {/* Header Area */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                             <div className="p-1.5 bg-white rounded-full shadow-sm text-[#F5B041]">
                                 <Sparkles size={14} fill="currentColor" />
                             </div>
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wide opacity-80">SpringBloom Live</span>
                        </div>
                    </div>
                    {isConnected && (
                        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/50">
                             <div className="w-2 h-2 rounded-full bg-[#58D68D] animate-pulse"></div>
                             <span className="text-xs font-bold text-slate-600 font-mono">{formatTime(duration)}</span>
                        </div>
                    )}
                </div>

                {/* Avatar / Presence Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                    
                    {/* The Hedgehog Avatar - Virtual Character */}
                    <div className="relative w-72 h-72 mb-8 group">
                        {/* Soft Glow */}
                        <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-1000 ${isConnected ? 'bg-[#F4D03F]/30 scale-110' : 'bg-gray-200/30 scale-100'}`}></div>

                        <div className={`w-full h-full rounded-full overflow-hidden shadow-[0_20px_60px_-10px_rgba(244,208,63,0.3)] transition-all duration-1000 relative z-10 border-[6px] border-white ${isConnected ? 'scale-105 ring-4 ring-[#F4D03F]/20' : 'scale-100 grayscale-[0.1] opacity-90'}`}>
                            {/* Cute Hedgehog Image - Placeholder for "Attachment" */}
                            <img 
                                src="https://images.unsplash.com/photo-1615809312282-53b925b6a378?q=80&w=1000&auto=format&fit=crop" 
                                alt="Hedgehog Companion" 
                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-[20s]"
                            />
                            
                            {/* Virtual Overlay (Breathing effect) */}
                            {isConnected && (
                                <div className="absolute inset-0 bg-gradient-to-t from-[#F4D03F]/10 to-transparent mix-blend-overlay animate-breathe"></div>
                            )}
                        </div>

                        {/* Status Bubble */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-2.5 rounded-full shadow-lg border border-orange-50 flex items-center gap-2 whitespace-nowrap z-20 transition-all duration-500">
                             {isConnected ? (
                                 <>
                                    <div className="flex gap-0.5 items-end h-3">
                                        <div className="w-1 bg-[#F5B041] h-2 animate-[bounce_1s_infinite] rounded-full"></div>
                                        <div className="w-1 bg-[#F5B041] h-3 animate-[bounce_1.2s_infinite] rounded-full"></div>
                                        <div className="w-1 bg-[#F5B041] h-1.5 animate-[bounce_0.8s_infinite] rounded-full"></div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{status}</span>
                                 </>
                             ) : (
                                 <span className="text-sm font-bold text-slate-400">{t.sleeping}</span>
                             )}
                        </div>
                    </div>

                    {/* Context Text */}
                    <div className="text-center max-w-xs space-y-2 relative z-20">
                         {!isConnected && (
                             <div className="bg-white/60 p-5 rounded-3xl border border-white shadow-sm backdrop-blur-sm">
                                <p className="text-slate-600 font-medium leading-relaxed mb-1">
                                    {t.intro_title}
                                </p>
                                <p className="text-slate-400 text-xs">
                                    {t.intro_desc}
                                </p>
                             </div>
                         )}
                    </div>
                </div>

                {/* Self View (PiP) - Enhanced */}
                {isConnected && isVideoOn && (
                    <div className="absolute bottom-32 right-6 w-32 h-44 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-[3px] border-white transform transition-all hover:scale-105 z-30 group cursor-move">
                        <video 
                            ref={(el) => {
                                if (el && streamRef.current) el.srcObject = streamRef.current;
                            }} 
                            autoPlay 
                            muted 
                            className="w-full h-full object-cover -scale-x-100 opacity-90 group-hover:opacity-100 transition-opacity" // Mirror effect
                        />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] text-white font-bold shadow-black drop-shadow-md">You</span>
                        </div>
                    </div>
                )}

                {/* Bottom Control Bar */}
                <div className="bg-white/90 backdrop-blur-xl px-8 py-8 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-20 border-t border-white">
                     <div className="flex items-center justify-center gap-6">
                         
                         {/* Mute Toggle */}
                         <button 
                            onClick={toggleMute}
                            className={`p-4 rounded-full transition-all duration-300 shadow-sm ${isMuted ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-slate-500 hover:bg-gray-100'}`}
                            title={isMuted ? "Unmute" : "Mute"}
                         >
                             {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                         </button>

                         {/* Main Call Action */}
                         {!isConnected ? (
                             <button 
                                onClick={startSession}
                                className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#F4D03F] to-[#F1C40F] text-white shadow-xl shadow-yellow-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center relative overflow-hidden group"
                             >
                                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                 <Video size={32} fill="white" />
                             </button>
                         ) : (
                             <button 
                                onClick={stopSession}
                                className="h-20 w-20 rounded-full bg-[#E74C3C] text-white shadow-xl shadow-red-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                             >
                                 <PhoneOff size={32} fill="white" />
                             </button>
                         )}

                         {/* Video Toggle */}
                         <button 
                            onClick={toggleVideo}
                            className={`p-4 rounded-full transition-all duration-300 shadow-sm ${!isVideoOn ? 'bg-gray-200 text-gray-500' : 'bg-gray-50 text-slate-500 hover:bg-gray-100'}`}
                            title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
                         >
                             {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                         </button>

                     </div>
                     <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
                         <Info size={10} /> {t.secure_space}
                     </p>
                </div>
            </div>
        </div>
    );
};

export default LiveSession;