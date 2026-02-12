import React, { useState, useRef } from 'react';
import { Microscope, Upload, Video, FileText, Activity, TrendingUp, AlertTriangle, CheckCircle, Loader2, Play } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import { TRANSLATIONS } from '../utils/translations';

interface BehaviorAnalysisModuleProps {
    lang: 'en' | 'zh';
}

const BehaviorAnalysisModule: React.FC<BehaviorAnalysisModuleProps> = ({ lang }) => {
    const t = TRANSLATIONS[lang].analysis;
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<{data: string, mimeType: string, type: 'video' | 'image'} | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const type = file.type.startsWith('video/') ? 'video' : 'image';
                setSelectedFile({
                    data: base64String.split(',')[1],
                    mimeType: file.type,
                    type
                });
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if ((!description && !selectedFile) || isAnalyzing) return;
        setIsAnalyzing(true);
        setResult(null);

        // Adjust prompt language based on prop
        const langInstruction = lang === 'zh' ? 'LANGUAGE: CHINESE (Simplified). Reply in Chinese.' : 'LANGUAGE: ENGLISH ONLY.';

        // Specialized System Prompt for Behavior Analysis
        const systemPrompt = `ACT AS: Expert Pediatric Behavior Analyst (SpringBloom Analysis Core).
        TASK: Analyze the provided user input (text description and/or video/image).
        OBJECTIVE: Deconstruct the behavior to help the parent understand the "Why" and "How to adjust".
        ${langInstruction}
        
        OUTPUT STRUCTURE (Use Markdown):
        
        ### 🔍 Behavioral Translation (The "Why")
        - **Observation**: Objective description of what happened.
        - **Function**: Likely function (e.g., Sensory Seeking, Escape, Attention, Tangible). Explain simply.
        
        ### ⚠️ Trigger Analysis (Antecedents)
        - What in the environment or interaction likely triggered this?
        - Identify any "unintentional stimulation" from the parent's reaction.
        
        ### 🛡️ Action Plan (Environmental & Strategy)
        - **Immediate**: How to de-escalate next time.
        - **Prevention**: How to change the environment to prevent recurrence.
        
        ### 📈 Trend Context
        - What specifically to track for the next 3 days to see if it improves.
        
        TONE: Clinical yet empathetic, non-judgmental, actionable.`;

        try {
            const history: any[] = [];
            const mediaPart = selectedFile ? { inlineData: { data: selectedFile.data, mimeType: selectedFile.mimeType } } : undefined;
            
            // Send request with 'reasoning' mode to enable deep thinking for analysis
            const response = await sendChatMessage(
                history, 
                `${systemPrompt}\n\nUSER SITUATION:\n${description || "Please analyze the attached media."}`, 
                'reasoning', 
                mediaPart
            );

            setResult(response.text || "Analysis could not be generated.");
        } catch (e) {
            console.error(e);
            setResult("Error analyzing behavior. Please try again with a shorter video or description.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-full bg-[#FDFBF7] p-4 md:p-8 overflow-y-auto">
            <header className="mb-8">
                 <h2 className="text-3xl font-extrabold text-[#4A4A4A] mb-2 flex items-center gap-3">
                    <div className="p-2 bg-[#F5B041]/20 rounded-xl text-[#F5B041]">
                        <Microscope size={28} />
                    </div>
                    {t.title}
                </h2>
                <p className="text-slate-500 font-medium">{t.subtitle}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto pb-20">
                {/* Input Column */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">{t.upload_label}</label>
                        
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFile ? 'border-[#F5B041] bg-[#FEF9E7]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                        >
                            <input ref={fileInputRef} type="file" accept="video/*,image/*" className="hidden" onChange={handleFileUpload} />
                            
                            {selectedFile ? (
                                <div className="text-center">
                                    {selectedFile.type === 'video' ? <Video size={40} className="mx-auto text-[#F5B041] mb-2"/> : <FileText size={40} className="mx-auto text-[#F5B041] mb-2"/>}
                                    <p className="font-bold text-slate-700">{t.media_attached}</p>
                                    <p className="text-xs text-slate-400">{t.click_change}</p>
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <Upload size={32} className="mx-auto text-gray-300 mb-2"/>
                                    <p className="font-bold text-slate-500">{t.upload_placeholder}</p>
                                    <p className="text-xs text-slate-400 mt-1">{t.upload_sub}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">{t.desc_label}</label>
                        <textarea 
                            className="w-full p-4 rounded-xl bg-gray-50 border border-transparent focus:border-[#F5B041] focus:bg-white transition-all outline-none resize-none h-40 text-slate-700 placeholder:text-slate-400 font-medium"
                            placeholder={t.desc_placeholder}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || (!description && !selectedFile)}
                        className="w-full py-4 bg-[#F5B041] text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isAnalyzing ? <Loader2 className="animate-spin" /> : <Activity />}
                        {t.btn_analyze}
                    </button>
                </div>

                {/* Output Column */}
                <div className="relative">
                    {result ? (
                        <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 overflow-hidden animate-float">
                            <div className="bg-[#F5B041] p-4 flex items-center gap-2 text-white font-bold">
                                <CheckCircle size={20} /> {t.complete}
                            </div>
                            <div className="p-6 md:p-8 text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {result}
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-slate-400">
                                <span>{t.saved}</span>
                                <div className="flex items-center gap-1"><TrendingUp size={14}/> {t.trend}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50 border-2 border-dashed border-gray-200 rounded-[32px]">
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center gap-4">
                                     <div className="w-16 h-16 border-4 border-[#F5B041] border-t-transparent rounded-full animate-spin"></div>
                                     <p className="font-bold text-lg text-[#F5B041]">{t.analyzing}</p>
                                     <p className="text-sm max-w-xs">{t.analyzing_sub}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <AlertTriangle size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-600 mb-2">{t.no_analysis}</h3>
                                    <p className="max-w-xs text-sm">{t.no_analysis_desc}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BehaviorAnalysisModule;