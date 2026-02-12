import React, { useState } from 'react';
import { Image as ImageIcon, Wand2, Download, RefreshCw, Upload, Sparkles } from 'lucide-react';
import { generateImage, editImage } from '../services/geminiService';
import { TRANSLATIONS } from '../utils/translations';

interface VisualGeneratorProps {
    lang: 'en' | 'zh';
}

const VisualGenerator: React.FC<VisualGeneratorProps> = ({ lang }) => {
    const t = TRANSLATIONS[lang].visuals;
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [uploadForEdit, setUploadForEdit] = useState<{data: string, mimeType: string} | null>(null);

    const handleAction = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setResultImage(null);

        try {
            if (mode === 'create') {
                const img = await generateImage(prompt, size);
                setResultImage(img);
            } else {
                if (uploadForEdit) {
                    const img = await editImage(uploadForEdit.data, prompt);
                    setResultImage(img);
                }
            }
        } catch (e) {
            console.error(e);
            alert("Something went wrong with image generation.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setUploadForEdit({
                    data: base64String.split(',')[1],
                    mimeType: file.type
                });
                setResultImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="h-full bg-[#FDFBF7] p-6 md:p-10 overflow-y-auto">
            <header className="mb-8">
                 <h2 className="text-3xl font-extrabold text-[#4A4A4A] mb-2 flex items-center gap-3">
                    <div className="p-2 bg-[#F4D03F]/20 rounded-xl text-[#F4D03F]">
                        <ImageIcon size={28} />
                    </div>
                    {t.title}
                </h2>
                <p className="text-slate-500 font-medium">{t.subtitle}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Control Panel */}
                <div className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
                        <button 
                            onClick={() => { setMode('create'); setResultImage(null); }}
                            className={`flex-1 py-4 rounded-xl font-bold transition-all flex flex-col items-center gap-2 ${mode === 'create' ? 'bg-[#EBF5FB] text-[#2980B9] shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <Sparkles size={20} /> {t.create}
                        </button>
                        <button 
                             onClick={() => { setMode('edit'); setResultImage(null); }}
                             className={`flex-1 py-4 rounded-xl font-bold transition-all flex flex-col items-center gap-2 ${mode === 'edit' ? 'bg-[#FEF9E7] text-[#B7950B] shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <RefreshCw size={20} /> {t.edit}
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] shadow-lg shadow-gray-100/50 border border-gray-100">
                        {mode === 'create' && (
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">{t.resolution}</label>
                                <div className="flex gap-3">
                                    {(['1K', '2K', '4K'] as const).map(s => (
                                        <button 
                                            key={s} 
                                            onClick={() => setSize(s)}
                                            className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition-all ${size === s ? 'bg-slate-800 text-white border-slate-800' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {mode === 'edit' && (
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">{t.source_image}</label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500 font-bold">{t.click_upload}</p>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                </label>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                                {mode === 'create' ? t.prompt_label_create : t.prompt_label_edit}
                            </label>
                            <textarea 
                                className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#F4D03F]/50 focus:bg-white transition-all outline-none resize-none h-32 text-slate-700 placeholder:text-slate-300 font-medium"
                                placeholder={mode === 'create' ? t.placeholder_create : t.placeholder_edit}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>

                        <button 
                            onClick={handleAction}
                            disabled={isLoading || !prompt || (mode === 'edit' && !uploadForEdit)}
                            className="w-full py-4 bg-gradient-to-r from-[#5DADE2] to-[#3498DB] text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 transform active:scale-95"
                        >
                            {isLoading ? <RefreshCw className="animate-spin" /> : <Wand2 />}
                            {mode === 'create' ? t.btn_generate : t.btn_apply}
                        </button>
                    </div>
                </div>

                {/* Result Panel */}
                <div className="bg-gray-100/50 rounded-[32px] border-2 border-dashed border-gray-200 flex items-center justify-center min-h-[400px] relative overflow-hidden group">
                    {resultImage ? (
                        <>
                            <img src={resultImage} alt="Generated" className="max-w-full max-h-[600px] rounded-xl shadow-lg object-contain transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <a 
                                    href={resultImage} 
                                    download={`springbloom-visual-${Date.now()}.png`}
                                    className="px-6 py-3 bg-white text-slate-800 rounded-full font-bold shadow-xl hover:scale-110 transition-transform flex items-center gap-2"
                                >
                                    <Download size={20} /> {t.download}
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-8 opacity-40">
                            <ImageIcon size={64} className="mx-auto mb-4 text-gray-400" />
                            <p className="font-bold text-gray-500">{t.empty_state}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisualGenerator;