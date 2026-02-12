import React, { useState } from 'react';
import { Home, MessageCircle, Mic, Image, ClipboardCheck, Sparkles, Star, ChevronRight, Microscope, Users, Globe } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import LiveSession from './components/LiveSession';
import VisualGenerator from './components/VisualGenerator';
import ScreeningModule from './components/ScreeningModule';
import BehaviorAnalysisModule from './components/BehaviorAnalysisModule';
import CommunityModule from './components/CommunityModule';
import FamilyProfile from './components/FamilyProfile';
import { Tab } from './types';
import { TRANSLATIONS } from './utils/translations';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [lang, setLang] = useState<'en' | 'zh'>('en');

  const t = TRANSLATIONS[lang];

  const SidebarItem = ({ tab, icon: Icon, label, description }: { tab: Tab, icon: any, label: string, description?: string }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`group w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 mb-2 relative overflow-hidden ${
          isActive
            ? 'bg-[#F4D03F] text-white shadow-lg shadow-[#F4D03F]/30 scale-[1.02]'
            : 'text-slate-500 hover:bg-[#FFF9E5] hover:text-[#D4AC0D]'
        }`}
      >
        <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-white shadow-sm group-hover:bg-[#F4D03F]/10'}`}>
           <Icon size={22} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#D4AC0D]'} />
        </div>
        <div className="text-left hidden md:block">
            <span className={`block font-bold text-base ${isActive ? 'text-white' : 'text-slate-700'}`}>{label}</span>
            {description && <span className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-400'}`}>{description}</span>}
        </div>
        {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 rounded-l-full"></div>}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sans text-slate-800 overflow-hidden app-bg">
      {/* Enhanced Sidebar */}
      <aside className="w-20 md:w-80 flex-shrink-0 flex flex-col p-6 z-20 transition-all duration-300">
        <div className="flex items-center gap-3 px-2 mb-10 mt-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F4D03F] to-[#F1C40F] flex items-center justify-center text-white shadow-lg shadow-[#F4D03F]/40 animate-float">
             <Sparkles size={20} fill="white" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">SpringBloom</h1>
            <p className="text-xs text-[#D4AC0D] font-bold tracking-wide uppercase mt-1">Early Screening AI</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem tab={Tab.HOME} icon={Home} label={t.sidebar.home} description={t.sidebar.desc_home} />
          <SidebarItem tab={Tab.CHAT} icon={MessageCircle} label={t.sidebar.chat} description={t.sidebar.desc_chat} />
          <SidebarItem tab={Tab.LIVE} icon={Mic} label={t.sidebar.live} description={t.sidebar.desc_live} />
          <SidebarItem tab={Tab.VISUALS} icon={Image} label={t.sidebar.visuals} description={t.sidebar.desc_visuals} />
          <SidebarItem tab={Tab.SCREENING} icon={ClipboardCheck} label={t.sidebar.screening} description={t.sidebar.desc_screening} />
          <SidebarItem tab={Tab.ANALYSIS} icon={Microscope} label={t.sidebar.analysis} description={t.sidebar.desc_analysis} />
          <SidebarItem tab={Tab.COMMUNITY} icon={Users} label={t.sidebar.community} description={t.sidebar.desc_community} />
        </nav>

        <div className="mt-auto">
           <div 
               onClick={() => setActiveTab(Tab.PROFILE)}
               className={`p-4 rounded-2xl shadow-sm border flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow ${activeTab === Tab.PROFILE ? 'bg-[#A9D8E6] border-blue-200' : 'bg-white border-orange-50/50'}`}
           >
               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${activeTab === Tab.PROFILE ? 'bg-white text-[#2980B9]' : 'bg-[#A9D8E6]'}`}>
                   F
               </div>
               <div className="hidden md:block overflow-hidden">
                   <p className={`text-sm font-bold truncate ${activeTab === Tab.PROFILE ? 'text-white' : 'text-slate-700'}`}>{t.sidebar.profile}</p>
                   <p className={`text-xs truncate ${activeTab === Tab.PROFILE ? 'text-white/80' : 'text-slate-400'}`}>{t.sidebar.desc_profile}</p>
               </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full relative bg-white/50 backdrop-blur-md rounded-l-[40px] border border-white/60 shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {activeTab === Tab.HOME && (
          <div className="h-full overflow-y-auto p-8 md:p-12 scroll-smooth">
            <header className="mb-10 flex justify-between items-end">
               <div>
                   <p className="text-[#D4AC0D] font-bold text-sm uppercase tracking-wider mb-2">{t.home.greeting}</p>
                   <h2 className="text-4xl font-extrabold text-[#4A4A4A]">{t.home.family_name}</h2>
               </div>
               <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors"
                 >
                    <Globe size={16} className="text-[#5DADE2]" />
                    {lang === 'en' ? 'English' : '中文'}
                 </button>
                 <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-medium text-slate-500">
                     <span>Today, Oct 24</span>
                 </div>
               </div>
            </header>

            {/* Hero Card */}
            <div className="w-full bg-gradient-to-r from-[#82E0AA] to-[#58D68D] rounded-[32px] p-8 text-white shadow-xl shadow-[#82E0AA]/30 mb-10 relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            <Star size={12} fill="white"/> Daily Recommendation
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{t.home.hero_title}</h3>
                        <p className="text-white/90 max-w-lg leading-relaxed">{t.home.hero_desc}</p>
                    </div>
                    <button 
                        onClick={() => setActiveTab(Tab.LIVE)}
                        className="bg-white text-[#27AE60] px-6 py-3 rounded-xl font-bold hover:bg-[#F0FDF4] transition-colors shadow-sm flex items-center gap-2"
                    >
                        {t.home.start_voice} <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Activity Grid */}
            <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                {t.home.toolkit}
                <div className="h-px bg-gray-200 flex-1 ml-4"></div>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div 
                  onClick={() => setActiveTab(Tab.CHAT)}
                  className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-[#A9D8E6] hover:shadow-[0_10px_30px_-10px_rgba(169,216,230,0.4)] transition-all cursor-pointer group"
              >
                 <div className="w-14 h-14 bg-[#EBF5FB] rounded-2xl flex items-center justify-center text-[#5DADE2] mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle size={28} />
                 </div>
                 <h4 className="text-lg font-bold text-slate-700 mb-2">{t.home.cards.chat_title}</h4>
                 <p className="text-slate-400 text-sm leading-relaxed">{t.home.cards.chat_desc}</p>
              </div>

              {/* Card 2 */}
              <div 
                  onClick={() => setActiveTab(Tab.SCREENING)}
                  className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-[#5DADE2] hover:shadow-[0_10px_30px_-10px_rgba(93,173,226,0.3)] transition-all cursor-pointer group"
              >
                 <div className="w-14 h-14 bg-[#EBF5FB] rounded-2xl flex items-center justify-center text-[#2874A6] mb-4 group-hover:scale-110 transition-transform">
                    <ClipboardCheck size={28} />
                 </div>
                 <h4 className="text-lg font-bold text-slate-700 mb-2">{t.home.cards.screening_title}</h4>
                 <p className="text-slate-400 text-sm leading-relaxed">{t.home.cards.screening_desc}</p>
              </div>

              {/* Card 3 */}
              <div 
                  onClick={() => setActiveTab(Tab.LIVE)}
                  className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-[#F4D03F] hover:shadow-[0_10px_30px_-10px_rgba(244,208,63,0.3)] transition-all cursor-pointer group"
              >
                 <div className="w-14 h-14 bg-[#FEF9E7] rounded-2xl flex items-center justify-center text-[#F4D03F] mb-4 group-hover:scale-110 transition-transform">
                    <Mic size={28} />
                 </div>
                 <h4 className="text-lg font-bold text-slate-700 mb-2">{t.home.cards.live_title}</h4>
                 <p className="text-slate-400 text-sm leading-relaxed">{t.home.cards.live_desc}</p>
              </div>
              
              {/* Card 4 (Visuals) */}
              <div 
                  onClick={() => setActiveTab(Tab.VISUALS)}
                  className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-[#AF7AC5] hover:shadow-[0_10px_30px_-10px_rgba(175,122,197,0.3)] transition-all cursor-pointer group"
              >
                 <div className="w-14 h-14 bg-[#F5EEF8] rounded-2xl flex items-center justify-center text-[#AF7AC5] mb-4 group-hover:scale-110 transition-transform">
                    <Image size={28} />
                 </div>
                 <h4 className="text-lg font-bold text-slate-700 mb-2">{t.home.cards.visuals_title}</h4>
                 <p className="text-slate-400 text-sm leading-relaxed">{t.home.cards.visuals_desc}</p>
              </div>

              {/* Card 5 (Analysis) */}
              <div 
                  onClick={() => setActiveTab(Tab.ANALYSIS)}
                  className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-[#F5B041] hover:shadow-[0_10px_30px_-10px_rgba(245,176,65,0.3)] transition-all cursor-pointer group"
              >
                 <div className="w-14 h-14 bg-[#FEF9E7] rounded-2xl flex items-center justify-center text-[#F5B041] mb-4 group-hover:scale-110 transition-transform">
                    <Microscope size={28} />
                 </div>
                 <h4 className="text-lg font-bold text-slate-700 mb-2">{t.home.cards.analysis_title}</h4>
                 <p className="text-slate-400 text-sm leading-relaxed">{t.home.cards.analysis_desc}</p>
              </div>
              
               {/* Card 6 (Community) */}
              <div 
                  onClick={() => setActiveTab(Tab.COMMUNITY)}
                  className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-[#58D68D] hover:shadow-[0_10px_30px_-10px_rgba(88,214,141,0.3)] transition-all cursor-pointer group"
              >
                 <div className="w-14 h-14 bg-[#E8F8F5] rounded-2xl flex items-center justify-center text-[#58D68D] mb-4 group-hover:scale-110 transition-transform">
                    <Users size={28} />
                 </div>
                 <h4 className="text-lg font-bold text-slate-700 mb-2">{t.home.cards.community_title}</h4>
                 <p className="text-slate-400 text-sm leading-relaxed">{t.home.cards.community_desc}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === Tab.CHAT && <ChatInterface lang={lang} />}
        
        {activeTab === Tab.LIVE && <LiveSession lang={lang} />}
        
        {activeTab === Tab.VISUALS && <VisualGenerator lang={lang} />}

        {activeTab === Tab.SCREENING && <ScreeningModule lang={lang} />}

        {activeTab === Tab.ANALYSIS && <BehaviorAnalysisModule lang={lang} />}

        {activeTab === Tab.COMMUNITY && <CommunityModule lang={lang} />}

        {activeTab === Tab.PROFILE && <FamilyProfile lang={lang} />}
      </main>
    </div>
  );
};

export default App;