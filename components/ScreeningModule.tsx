import React, { useState, useRef, useEffect } from 'react';
import { ClipboardCheck, Play, ArrowRight, Circle, Loader2, Sparkles, BrainCircuit, Trophy, Map, Star, RefreshCw } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import { Message } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface ScreeningModuleProps {
    lang: 'en' | 'zh';
}

const ScreeningModule: React.FC<ScreeningModuleProps> = ({ lang }) => {
    const t = TRANSLATIONS[lang].screening;
    
    // Construct DOMAINS from translation
    const DOMAINS = [
        { id: 'name', ...t.domains.name, color: 'bg-blue-50 border-blue-200 text-blue-600', icon: '👂' },
        { id: 'mand', ...t.domains.mand, color: 'bg-green-50 border-green-200 text-green-600', icon: '🤲' },
        { id: 'joint', ...t.domains.joint, color: 'bg-yellow-50 border-yellow-200 text-yellow-600', icon: '👀' },
        { id: 'imitation', ...t.domains.imitation, color: 'bg-purple-50 border-purple-200 text-purple-600', icon: '😺' },
        { id: 'play', ...t.domains.play, color: 'bg-pink-50 border-pink-200 text-pink-600', icon: '🧸' },
        { id: 'social', ...t.domains.social, color: 'bg-orange-50 border-orange-200 text-orange-600', icon: '🤝' },
    ];

    const [activeDomain, setActiveDomain] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const startScreening = async (domainId: string) => {
        const domain = DOMAINS.find(d => d.id === domainId);
        if (!domain) return;
        
        setActiveDomain(domainId);
        setMessages([]); 
        setIsLoading(true);

        // Adjust prompt language based on prop
        const langInstruction = lang === 'zh' ? 'LANGUAGE: CHINESE (Simplified). Reply in friendly Chinese.' : 'LANGUAGE: ENGLISH ONLY.';

        const systemPrompt = `ACT AS: Senior ASD Screener & Fun Activity Guide.
        ${langInstruction}
        CONTEXT: Implementing a gamified VB-MAPP quick home screening for skill: "${domain.label}" (${domain.title}).
        GOAL: Guide the parent to perform ONE specific, standardized interaction with the child right now.
        
        OUTPUT:
        1. A fun "Mission Name" for the activity.
        2. A clear, short instruction script (what the parent should do/say).
        3. What to observe (specific behaviors).
        4. Do NOT ask for a general history. Ask for the result of this specific trial.
        
        TONE: Warm, energetic, encouraging, and clear. Use emojis to make it friendly.`;

        try {
             const history: any[] = [];
             const response = await sendChatMessage(history, systemPrompt, 'reasoning');
             
             setMessages([
                 {
                     id: 'welcome',
                     role: 'model',
                     text: response.text || "Initializing mission...",
                     isThinking: false
                 }
             ]);
        } catch (e) {
            console.error(e);
            setMessages([{ id: 'err', role: 'model', text: "Connection error. Please check your internet."}]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
             const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
             
             const langInstruction = lang === 'zh' ? 'LANGUAGE: CHINESE (Simplified).' : 'LANGUAGE: ENGLISH ONLY.';

             // System prompt for follow-up
             const contextPrompt = `Analyze the parent's response. ${langInstruction}
             CRITICAL:
             1. If the description is vague (e.g., "sometimes", "he did it"), ASK CLARIFYING QUESTIONS immediately.
             2. Distinguish between ACTIVE (spontaneous) and PASSIVE (prompted) behavior.
             3. If the signal is clear, summarize the finding as "Risk Signal Detected" or "Age Appropriate" and suggest the next step or a variation of the game.
             
             Tone: Supportive and professional.`;
             
             const response = await sendChatMessage(history, userMsg.text + `\n\n[SYSTEM: ${contextPrompt}]`, 'reasoning');
             
             const modelMsg: Message = {
                 id: Date.now().toString(),
                 role: 'model',
                 text: response.text || "...",
                 isThinking: true
             };
             setMessages(prev => [...prev, modelMsg]);

        } catch (e) {
             console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="h-full bg-[#FDFBF7] flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Left Sidebar: Adventure Map */}
            <div className="w-full md:w-1/3 bg-white border-r border-gray-100 flex flex-col z-10 shadow-sm h-full">
                <div className="p-6 pb-4">
                    <h2 className="text-2xl font-extrabold text-[#4A4A4A] flex items-center gap-3">
                        <div className="p-2 bg-[#5DADE2]/10 rounded-xl text-[#5DADE2]">
                             <Map size={24} />
                        </div>
                        {t.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="px-2 py-0.5 bg-[#F4D03F]/20 text-[#D4AC0D] text-[10px] font-bold uppercase tracking-wide rounded">
                            {t.badge}
                        </div>
                        <span className="text-xs text-slate-400 font-bold">{lang === 'zh' ? '中文模式' : 'English Mode'}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                        {t.desc}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3">
                    {DOMAINS.map(d => (
                        <button
                            key={d.id}
                            onClick={() => startScreening(d.id)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all group relative overflow-hidden ${
                                activeDomain === d.id 
                                ? `${d.color} border-current shadow-md transform scale-[1.02]` 
                                : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200'
                            }`}
                        >
                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{d.icon}</div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-700 group-hover:text-slate-900">{d.label}</h3>
                                        <p className="text-xs opacity-70 font-medium">{d.title}</p>
                                    </div>
                                </div>
                                {activeDomain === d.id ? <Play size={20} className="fill-current"/> : <Circle size={16} className="text-gray-300"/>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Main: Interaction Area */}
            <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] relative">
                {!activeDomain ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-60">
                         <div className="relative w-32 h-32 mb-6">
                            <div className="absolute inset-0 bg-[#F4D03F]/20 rounded-full animate-pulse"></div>
                            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                                <Trophy size={48} className="text-[#F4D03F]" />
                            </div>
                         </div>
                         <h3 className="text-2xl font-bold text-slate-700">{t.ready_title}</h3>
                         <p className="max-w-xs text-slate-400 mt-3 text-sm font-medium leading-relaxed">
                             {t.ready_desc}
                         </p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-20">
                             <div>
                                 <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
                                     {DOMAINS.find(d => d.id === activeDomain)?.icon} 
                                     {DOMAINS.find(d => d.id === activeDomain)?.label}
                                 </h3>
                                 <p className="text-xs text-slate-400 font-medium ml-7">AI Assessment in Progress</p>
                             </div>
                             <div className="flex items-center gap-2">
                                 <button onClick={() => startScreening(activeDomain)} className="p-2 hover:bg-gray-100 rounded-full text-slate-400" title="Restart Mission">
                                     <RefreshCw size={16} />
                                 </button>
                                 <div className="flex items-center gap-1 text-[10px] font-bold text-purple-500 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                                     <BrainCircuit size={12}/> {t.analysis_active}
                                 </div>
                             </div>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-24 scroll-smooth">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    
                                    {msg.role === 'model' && (
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5DADE2] to-[#2980B9] flex items-center justify-center text-white mr-3 flex-shrink-0 shadow-lg shadow-blue-200 mt-1 transform -rotate-3">
                                            <Sparkles size={18} />
                                        </div>
                                    )}

                                    <div className={`max-w-[85%] p-6 rounded-3xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-[#4A4A4A] text-white rounded-tr-sm shadow-lg shadow-gray-200' 
                                        : 'bg-white text-slate-600 border border-gray-100 rounded-tl-sm'
                                    }`}>
                                        {msg.isThinking && (
                                            <div className="flex items-center gap-2 text-xs font-bold text-purple-500 mb-4 bg-purple-50 w-fit px-3 py-1.5 rounded-lg border border-purple-100">
                                                <BrainCircuit size={14} className="animate-pulse"/> Analyzing responses...
                                            </div>
                                        )}
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start animate-in fade-in duration-300">
                                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5DADE2] to-[#2980B9] flex items-center justify-center text-white mr-3 flex-shrink-0 shadow-lg shadow-blue-200 mt-1 transform -rotate-3">
                                            <Sparkles size={18} />
                                    </div>
                                    <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3 text-sm text-slate-500 rounded-tl-sm">
                                        <Loader2 className="animate-spin text-[#5DADE2]" size={18} />
                                        Thinking...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-gradient-to-t from-white via-white to-transparent absolute bottom-0 left-0 right-0 z-20">
                            <div className="bg-white p-2 rounded-[24px] flex items-center gap-2 border border-gray-200 focus-within:border-[#5DADE2] focus-within:ring-4 focus-within:ring-[#5DADE2]/10 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                                <input 
                                    className="flex-1 bg-transparent outline-none text-slate-700 px-6 py-4 text-sm font-medium placeholder:text-slate-400"
                                    placeholder={t.input_placeholder}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="p-4 bg-[#4A4A4A] text-white rounded-[20px] hover:bg-black disabled:opacity-50 transition-all shadow-lg transform hover:scale-105 active:scale-95"
                                >
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ScreeningModule;