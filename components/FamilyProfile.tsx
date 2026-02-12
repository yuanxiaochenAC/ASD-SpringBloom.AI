import React, { useState, useRef } from 'react';
import { User, Phone, Baby, Calendar, FileText, Upload, Save, HeartPulse, Activity, Shield, Check, AlertCircle } from 'lucide-react';

const DIAGNOSIS_OPTIONS = [
    "Autism Spectrum Disorder (ASD)",
    "Autism (Mild / Level 1)",
    "Autism (Moderate / Level 2)",
    "Autism (Severe / Level 3)",
    "Developmental Delay (Global)",
    "Developmental Delay (Language)",
    "Developmental Delay (Motor)",
    "Other"
];

const COMORBIDITY_OPTIONS = [
    "Asperger's Syndrome",
    "Epilepsy / Seizures",
    "Sleep Disorders",
    "Intellectual Disability",
    "Tourette Syndrome",
    "ADHD",
    "Anxiety",
    "Gastrointestinal Issues",
    "Other"
];

const RELATIONSHIPS = ["Mother", "Father", "Grandparent", "Guardian", "Therapist", "Other"];

const FamilyProfile: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [formData, setFormData] = useState({
        childName: '',
        gender: 'male',
        dob: '',
        parentPhone: '',
        relationship: 'Mother',
        diagnosis: '',
        allergies: '',
        comorbidities: [] as string[],
        otherInfo: ''
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const toggleComorbidity = (condition: string) => {
        setFormData(prev => {
            const current = prev.comorbidities;
            if (current.includes(condition)) {
                return { ...prev, comorbidities: current.filter(c => c !== condition) };
            } else {
                return { ...prev, comorbidities: [...current, condition] };
            }
        });
        setSaved(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
        }, 1500);
    };

    return (
        <div className="h-full bg-[#FDFBF7] p-6 md:p-10 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#4A4A4A] mb-2 flex items-center gap-3">
                        <div className="p-2 bg-[#A9D8E6]/30 rounded-xl text-[#2874A6]">
                            <User size={28} />
                        </div>
                        Family Profile
                    </h2>
                    <p className="text-slate-500 font-medium">Manage your child's medical profile for personalized AI support.</p>
                </div>
                {saved && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200 animate-in fade-in slide-in-from-top-2">
                        <Check size={18} /> <span className="text-sm font-bold">Profile Saved</span>
                    </div>
                )}
            </header>

            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                
                {/* Section 1: Basic Information */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#A9D8E6]"></div>
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <Baby size={20} className="text-[#A9D8E6]" /> Child Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Child's Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#A9D8E6] focus:bg-white transition-all font-medium text-slate-700"
                                placeholder="e.g. Leo Smith"
                                value={formData.childName}
                                onChange={(e) => handleInputChange('childName', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Gender</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#A9D8E6] focus:bg-white transition-all font-medium text-slate-700 appearance-none"
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                >
                                    <option value="male">Boy</option>
                                    <option value="female">Girl</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Date of Birth</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#A9D8E6] focus:bg-white transition-all font-medium text-slate-700"
                                        value={formData.dob}
                                        onChange={(e) => handleInputChange('dob', e.target.value)}
                                    />
                                    <Calendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Parent / Guardian Info */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-2 h-full bg-[#F4D03F]"></div>
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <Shield size={20} className="text-[#F4D03F]" /> Parent / Guardian Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Your Relationship</label>
                            <select 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#F4D03F] focus:bg-white transition-all font-medium text-slate-700"
                                value={formData.relationship}
                                onChange={(e) => handleInputChange('relationship', e.target.value)}
                            >
                                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Phone Number</label>
                            <div className="relative">
                                <input 
                                    type="tel" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#F4D03F] focus:bg-white transition-all font-medium text-slate-700 pl-10"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.parentPhone}
                                    onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                                />
                                <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Medical & Clinical */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#F5B041]"></div>
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-[#F5B041]" /> Clinical Information
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Primary Diagnosis</label>
                            <select 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#F5B041] focus:bg-white transition-all font-medium text-slate-700"
                                value={formData.diagnosis}
                                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                            >
                                <option value="" disabled>Select Diagnosis...</option>
                                {DIAGNOSIS_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Medical Records / Diagnosis File</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#F5B041] transition-all"
                            >
                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                                {fileName ? (
                                    <div className="flex items-center gap-3 text-[#F5B041]">
                                        <FileText size={32} />
                                        <span className="font-bold text-slate-700">{fileName}</span>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="mx-auto text-gray-300 mb-2" size={24} />
                                        <span className="text-sm font-bold text-slate-500">Upload Diagnosis Report (PDF/IMG)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Health Details */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#58D68D]"></div>
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <HeartPulse size={20} className="text-[#58D68D]" /> Health & Co-morbidities
                    </h3>

                    <div className="mb-6">
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Co-morbidities (Select all that apply)</label>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                             {COMORBIDITY_OPTIONS.map(opt => {
                                 const isSelected = formData.comorbidities.includes(opt);
                                 return (
                                     <button
                                        key={opt}
                                        onClick={() => toggleComorbidity(opt)}
                                        className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all border ${
                                            isSelected 
                                            ? 'bg-[#58D68D] text-white border-[#58D68D] shadow-md shadow-green-100' 
                                            : 'bg-gray-50 text-slate-500 border-transparent hover:bg-gray-100'
                                        }`}
                                     >
                                         {opt}
                                     </button>
                                 );
                             })}
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                 Allergies <AlertCircle size={12} className="text-orange-400"/>
                             </label>
                             <textarea 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#58D68D] focus:bg-white transition-all font-medium text-slate-700 h-24 resize-none"
                                placeholder="List any food or drug allergies..."
                                value={formData.allergies}
                                onChange={(e) => handleInputChange('allergies', e.target.value)}
                             />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Other Notes</label>
                             <textarea 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#58D68D] focus:bg-white transition-all font-medium text-slate-700 h-24 resize-none"
                                placeholder="Any other specific needs?"
                                value={formData.otherInfo}
                                onChange={(e) => handleInputChange('otherInfo', e.target.value)}
                             />
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-10 py-4 bg-[#4A4A4A] text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70"
                    >
                        {isSaving ? <Activity className="animate-spin" /> : <Save />}
                        Save Family Profile
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FamilyProfile;