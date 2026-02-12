import React, { useState, useEffect } from 'react';
import { Users, MapPin, MessageCircle, Heart, Share2, Search, Filter, Shield, UserPlus, X } from 'lucide-react';
import { TRANSLATIONS } from '../utils/translations';

interface CommunityModuleProps {
    lang: 'en' | 'zh';
}

// Mock Data for the Network Graph
const MOCK_FAMILIES = [
    { id: 1, name: "The Chen Family", child: "Boy, 4yo", tags: ["Non-verbal", "Sensory Seeking"], dist: "0.5km", match: 95, x: 50, y: 40, status: "online" },
    { id: 2, name: "Sarah & Tom", child: "Girl, 3yo", tags: ["Early Intervention", "PECS"], dist: "2.1km", match: 88, x: 20, y: 30, status: "offline" },
    { id: 3, name: "Liang Family", child: "Boy, 5yo", tags: ["High Functioning", "Social Anxiety"], dist: "5km", match: 75, x: 80, y: 60, status: "online" },
    { id: 4, name: "Mom of Kai", child: "Boy, 2yo", tags: ["Newly Diagnosed", "Speech Delay"], dist: "1.2km", match: 92, x: 30, y: 70, status: "online" },
    { id: 5, name: "Happy Home", child: "Girl, 6yo", tags: ["School Prep", "Inclusion"], dist: "8km", match: 60, x: 70, y: 20, status: "offline" },
];

const TOPICS = [
    { id: 1, title: "Success Story: First purposeful 'Mama' after 6 months of ESDM!", author: "Chen Family", likes: 124, comments: 45, tag: "Hope" },
    { id: 2, title: "Anyone know a sensory-friendly dentist in Downtown?", author: "Sarah & Tom", likes: 12, comments: 8, tag: "Help" },
    { id: 3, title: "Review: The new weighted vest from Amazon", author: "Mom of Kai", likes: 56, comments: 23, tag: "Review" },
];

const CommunityModule: React.FC<CommunityModuleProps> = ({ lang }) => {
    const t = TRANSLATIONS[lang].community;
    const [selectedNode, setSelectedNode] = useState<any | null>(null);
    const [hoverNode, setHoverNode] = useState<number | null>(null);
    const [filter, setFilter] = useState(t.tabs[0]);

    // Animation state for "breathing" nodes
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full bg-[#FDFBF7] flex flex-col lg:flex-row overflow-hidden relative">
            
            {/* Main Interactive Network Area */}
            <div className="flex-1 relative overflow-hidden bg-[#FAFAFA]">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-20" 
                     style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {/* Floating Header */}
                <div className="absolute top-6 left-6 z-10">
                    <h2 className="text-3xl font-extrabold text-[#4A4A4A] flex items-center gap-3">
                        <div className="p-2 bg-[#A9D8E6]/20 rounded-xl text-[#2980B9]">
                            <Users size={28} />
                        </div>
                        {t.title}
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                        {t.subtitle(MOCK_FAMILIES.length + 120)}
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="absolute top-6 right-6 z-10 flex gap-2">
                    {t.tabs.map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all backdrop-blur-sm ${filter === f ? 'bg-[#4A4A4A] text-white shadow-lg' : 'bg-white/60 text-slate-500 hover:bg-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Network Visualization (SVG) */}
                <div className="w-full h-full flex items-center justify-center relative">
                    <svg className="w-full h-full max-w-4xl max-h-[800px]" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                        {/* Central Node (You) */}
                        <circle cx="50" cy="50" r="15" fill="#F4D03F" opacity="0.1" className="animate-pulse" />
                        <circle cx="50" cy="50" r="4" fill="#F4D03F" stroke="white" strokeWidth="1" />
                        <text x="50" y="58" textAnchor="middle" fontSize="3" fill="#B7950B" fontWeight="bold">You</text>

                        {/* Connections & Nodes */}
                        {MOCK_FAMILIES.map((fam, i) => {
                            // Calculate simple floating animation based on tick
                            const floatY = Math.sin((tick + i * 10) / 20) * 1;
                            const finalX = fam.x;
                            const finalY = fam.y + floatY;

                            // Calculate match color
                            const color = fam.match > 90 ? '#58D68D' : fam.match > 80 ? '#5DADE2' : '#AAB7B8';

                            return (
                                <g key={fam.id} 
                                   onClick={() => setSelectedNode(fam)}
                                   onMouseEnter={() => setHoverNode(fam.id)}
                                   onMouseLeave={() => setHoverNode(null)}
                                   className="cursor-pointer transition-all duration-300"
                                >
                                    {/* Connection Line */}
                                    <line 
                                        x1="50" y1="50" 
                                        x2={finalX} y2={finalY} 
                                        stroke={color} 
                                        strokeWidth="0.2" 
                                        strokeDasharray="1,1" 
                                        opacity={hoverNode === fam.id ? 1 : 0.3}
                                    />

                                    {/* Match Badge */}
                                    <circle 
                                        cx={finalX} cy={finalY} 
                                        r={hoverNode === fam.id ? 5 : 3.5} 
                                        fill="white" 
                                        stroke={color}
                                        strokeWidth={hoverNode === fam.id ? 1 : 0.5}
                                        className="transition-all duration-300 ease-out shadow-sm"
                                    />
                                    
                                    {/* User Avatar Placeholder */}
                                    <text x={finalX} y={finalY + 1} textAnchor="middle" fontSize="2" fill={color} fontWeight="bold">
                                        {fam.name.charAt(0)}
                                    </text>

                                    {/* Tooltip Label (Always visible if match is high, else on hover) */}
                                    {(hoverNode === fam.id || fam.match > 90) && (
                                        <g>
                                            <rect x={finalX - 8} y={finalY - 8} width="16" height="5" rx="1" fill="white" fillOpacity="0.9" />
                                            <text x={finalX} y={finalY - 5} textAnchor="middle" fontSize="2" fontWeight="bold" fill="#4A4A4A">{fam.name}</text>
                                            <text x={finalX} y={finalY - 3.5} textAnchor="middle" fontSize="1.5" fill="#7F8C8D">{fam.match}% Match</text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Legend */}
                <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur px-4 py-3 rounded-2xl text-xs font-medium text-slate-500 border border-white shadow-sm">
                    <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-[#58D68D]"></span> 90%+ Match (Similar Symptoms)</div>
                    <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-[#5DADE2]"></span> 80%+ Match (Nearby)</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#AAB7B8]"></span> Community Member</div>
                </div>
            </div>

            {/* Right Sidebar / Overlay: Details & Feed */}
            <div className="w-full lg:w-96 bg-white border-l border-gray-100 flex flex-col z-20 shadow-xl">
                
                {selectedNode ? (
                    // PROFILE VIEW
                    <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 bg-gradient-to-br from-[#EBF5FB] to-white relative">
                            <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                            
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-[#5DADE2] shadow-lg mb-4">
                                {selectedNode.name.charAt(0)}
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">{selectedNode.name}</h3>
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-1">
                                <MapPin size={14} /> {selectedNode.dist} • {selectedNode.status === 'online' ? <span className="text-green-500">Online</span> : 'Offline'}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {selectedNode.tags.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-white border border-blue-100 text-[#2980B9] text-xs font-bold rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-full text-[#58D68D] shadow-sm">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Compatibility</p>
                                    <p className="text-sm text-slate-600 font-medium">{selectedNode.match}% Match based on child age & diagnosis profile.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="py-3 bg-[#4A4A4A] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                    <MessageCircle size={18} /> {t.chat}
                                </button>
                                <button className="py-3 bg-white border border-gray-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                    <UserPlus size={18} /> {t.connect}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // FEED VIEW
                    <div className="flex-1 flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                            <h3 className="text-lg font-bold text-slate-700 mb-4">{t.feed_title}</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder={t.search_placeholder} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#5DADE2]/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {/* Featured Card */}
                            <div className="bg-gradient-to-br from-[#F4D03F]/10 to-[#F5B041]/10 p-5 rounded-2xl border border-[#F4D03F]/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield size={14} className="text-[#F5B041]" />
                                    <span className="text-xs font-bold text-[#D4AC0D] uppercase tracking-wide">{t.verified_title}</span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium mb-3">
                                    {t.verified_desc}
                                </p>
                                <a href="#" className="text-xs font-bold text-[#F5B041] hover:underline flex items-center gap-1">
                                    {t.read_more}
                                </a>
                            </div>

                            {/* Topics */}
                            {TOPICS.map(topic => (
                                <div key={topic.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-1 bg-blue-50 text-[#5DADE2] text-[10px] font-bold rounded uppercase tracking-wide">
                                            {topic.tag}
                                        </span>
                                        <span className="text-xs text-slate-400">{topic.author}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-700 text-sm mb-3 leading-snug">{topic.title}</h4>
                                    <div className="flex items-center gap-4 text-slate-400">
                                        <div className="flex items-center gap-1 text-xs font-medium">
                                            <Heart size={14} /> {topic.likes}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-medium">
                                            <MessageCircle size={14} /> {topic.comments}
                                        </div>
                                        <div className="flex-1 text-right">
                                            <Share2 size={14} className="inline" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityModule;