import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Search, MapPin, Play, Loader2, Sparkles, BrainCircuit, X, Video, HeartHandshake, Zap, Feather } from 'lucide-react';
import { sendChatMessage, generateSpeech } from '../services/geminiService';
import { Message } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface ChatInterfaceProps {
    lang: 'en' | 'zh';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang].chat;
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Reset conversation when language changes to show proper welcome
  useEffect(() => {
      setMessages([
        { id: '1', role: 'model', text: t.welcome }
      ]);
  }, [lang]);

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'fast' | 'reasoning' | 'search' | 'maps'>('fast');
  const [selectedMedia, setSelectedMedia] = useState<{data: string, mimeType: string, type: 'image'|'video'} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const isVideo = file.type.startsWith('video/');
        setSelectedMedia({ 
            data: base64Data, 
            mimeType: file.type, 
            type: isVideo ? 'video' : 'image' 
        });

        if (isVideo && mode !== 'reasoning') {
            setMode('reasoning');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && !selectedMedia) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      media: selectedMedia ? { ...selectedMedia } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const mediaPart = selectedMedia ? { inlineData: { data: selectedMedia.data, mimeType: selectedMedia.mimeType } } : undefined;
      setSelectedMedia(null);

      const response = await sendChatMessage(history, userMsg.text, mode, mediaPart);
      
      let groundingUrls: Array<{url: string, title: string}> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
          chunks.forEach((chunk: any) => {
              if (chunk.web) {
                  groundingUrls.push({ url: chunk.web.uri, title: chunk.web.title });
              }
              if (chunk.maps) {
                   groundingUrls.push({ url: chunk.maps.googleMapsUri, title: chunk.maps.placeId || 'Map Location' });
              }
          });
      }

      const modelText = response.text || "I'm listening, but I couldn't quite catch that. Could you say it again?";

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: modelText,
        groundingUrls,
        isThinking: mode === 'reasoning'
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I seem to be having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const playTTS = async (text: string) => {
      try {
          const audioBase64 = await generateSpeech(text);
          if (audioBase64) {
              const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
              audio.play();
          }
      } catch (e) {
          console.error("TTS Error", e);
      }
  };

  const ModeButton = ({ m, icon: Icon, label, color, activeColor }: { m: string, icon: any, label: string, color: string, activeColor: string }) => (
    <button 
      onClick={() => setMode(m as any)}
      className={`px-5 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 border ${
        mode === m 
          ? `${activeColor} text-white shadow-sm border-transparent transform scale-105` 
          : 'bg-white/50 text-slate-400 border-gray-200 hover:bg-white'
      }`}
    >
      <Icon size={20} /> {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative font-sans">
      
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#F4D03F]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-[#A9D8E6]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-96">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {msg.role === 'model' && (
                  <div className="flex items-center gap-3 mb-2 ml-1">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F4D03F] to-[#F1C40F] flex items-center justify-center text-white shadow-sm">
                        <Feather size={20} />
                     </div>
                     <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">SpringBloom</span>
                  </div>
                )}

                <div className={`relative px-6 py-5 text-[17px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#4A4A4A] text-white rounded-[32px] rounded-br-sm' 
                    : 'bg-white text-slate-600 border border-gray-100/80 rounded-[32px] rounded-tl-sm'
                }`}>
                  {msg.media && (
                    <div className="mb-4">
                        {msg.media.type === 'image' ? (
                             <img src={`data:${msg.media.mimeType};base64,${msg.media.data}`} alt="Upload" className="max-w-full rounded-2xl border border-white/20 shadow-sm" />
                        ) : (
                             <video controls className="max-w-full rounded-2xl border border-white/20 shadow-sm bg-black">
                                 <source src={`data:${msg.media.mimeType};base64,${msg.media.data}`} type={msg.media.mimeType} />
                             </video>
                        )}
                    </div>
                  )}
                  
                  {msg.isThinking && (
                     <div className="text-xs font-bold text-purple-500 mb-3 flex items-center gap-2 bg-purple-50 w-fit px-3 py-1.5 rounded-full border border-purple-100">
                        <BrainCircuit size={16}/> {t.modes.reasoning}
                     </div>
                  )}

                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <Search size={16}/> References
                          </p>
                          <div className="flex flex-wrap gap-2">
                              {msg.groundingUrls.map((g, idx) => (
                                  <a key={idx} href={g.url} target="_blank" rel="noreferrer" className="text-xs bg-gray-50 text-blue-500 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors truncate max-w-[180px]">
                                      {g.title || 'Link'}
                                  </a>
                              ))}
                          </div>
                      </div>
                  )}
                </div>

                {msg.role === 'model' && (
                  <button onClick={() => playTTS(msg.text)} className="mt-2 ml-2 text-slate-300 hover:text-[#F4D03F] transition-colors p-2" title="Read Aloud">
                      <Play size={24} fill="currentColor" className="opacity-70 hover:opacity-100"/>
                  </button>
                )}
             </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-start w-full animate-pulse">
                <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2 mb-2 ml-1">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="bg-white px-8 py-6 rounded-[32px] rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-4">
                        <Loader2 className="animate-spin text-[#F4D03F]" size={24} />
                        <span className="text-base font-medium text-slate-400">{t.thinking}</span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Interface - Lifted Up */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pb-14 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent z-20">
        <div className="max-w-4xl mx-auto flex flex-col gap-5">
          
          {/* 1. Quick Suggestions (Chips) */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide shrink-0 mr-1">Ask me:</span>
              {t.suggestions.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(s)}
                    className="shrink-0 px-5 py-2.5 bg-white border border-gray-100 text-slate-600 text-sm font-bold rounded-full shadow-sm hover:border-[#F4D03F] hover:text-[#D4AC0D] hover:shadow-md transition-all whitespace-nowrap"
                  >
                      {s}
                  </button>
              ))}
          </div>

          {/* 2. Main Input Box */}
          <div className="w-full bg-white p-3 rounded-[36px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-gray-200 focus-within:border-[#F4D03F] focus-within:ring-4 focus-within:ring-[#F4D03F]/10 transition-all flex items-end gap-4 relative z-20">
            
            {/* Media Attachment Preview */}
            {selectedMedia && (
                <div className="absolute -top-20 left-0 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                        {selectedMedia.type === 'image' ? (
                            <ImageIcon className="text-gray-400" size={32}/> 
                        ) : (
                            <Video className="text-gray-400" size={32}/>
                        )}
                    </div>
                    <span className="text-sm font-bold text-gray-600">{selectedMedia.type === 'video' ? 'Video' : 'Image'}</span>
                    <button onClick={() => setSelectedMedia(null)} className="text-gray-400 hover:text-red-400 p-2"><X size={20}/></button>
                </div>
            )}

            <label className="p-4 text-slate-400 hover:text-[#F4D03F] hover:bg-[#FEF9E7] rounded-full cursor-pointer transition-colors mb-0.5" title="Attach Photo/Video">
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
              <ImageIcon size={32} />
            </label>
            
            <textarea 
              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 py-4 px-2 max-h-40 min-h-[64px] resize-none text-lg font-medium"
              placeholder={t.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                  }
              }}
              rows={1}
            />
            
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || (!input.trim() && !selectedMedia)}
              className="p-5 bg-[#4A4A4A] text-white rounded-[28px] hover:bg-black disabled:opacity-50 transition-all shadow-lg shadow-gray-200 mb-0.5 transform active:scale-95"
            >
              <Send size={28} fill="white" />
            </button>
          </div>

          {/* 3. Mode Selection */}
          <div className="flex justify-center items-center gap-3">
               <ModeButton m="fast" icon={Zap} label={t.modes.fast} color="text-slate-600" activeColor="bg-[#F4D03F]" />
               <ModeButton m="reasoning" icon={BrainCircuit} label={t.modes.reasoning} color="text-purple-500" activeColor="bg-purple-500" />
               <ModeButton m="search" icon={Search} label={t.modes.search} color="text-blue-500" activeColor="bg-blue-500" />
               <ModeButton m="maps" icon={MapPin} label={t.modes.maps} color="text-emerald-500" activeColor="bg-emerald-500" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatInterface;