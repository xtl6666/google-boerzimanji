
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X, BookOpen, Target, Activity, MapPin, AlertTriangle, Calculator } from 'lucide-react';
import { TERM_DEFS } from './Level3Terms';

interface TermHelpProps {
    term: string; // Key in TERM_DEFS
    label?: string; // Optional text to display before the icon
    trigger?: React.ReactNode; // Optional custom trigger
}

const TermHelp: React.FC<TermHelpProps> = ({ term, label, trigger }) => {
    const [isOpen, setIsOpen] = useState(false);
    const def = TERM_DEFS[term];

    if (!def) {
        console.warn(`Term definition not found for: ${term}`);
        return <span>{label || term}</span>;
    }

    // Portal Target Content
    const modalContent = (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-start sticky top-0 z-20">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">{def.title}</h3>
                        {def.subtitle && <p className="text-blue-600 font-bold text-sm mt-1">{def.subtitle}</p>}
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-8 text-slate-600 leading-relaxed custom-scrollbar z-10">
                    
                    {/* What */}
                    <section>
                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-lg">
                            <BookOpen size={20} className="text-blue-500"/> 这是什么？
                        </h4>
                        <ul className="space-y-2 list-disc list-outside ml-5">
                            {def.what.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                    </section>

                    {/* Why & Use */}
                    <section className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                                <Target size={16} className="text-orange-500"/> 为什么要用？
                            </h4>
                            <ul className="space-y-2 list-disc list-outside ml-4 text-sm">
                                {def.why.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                                <Activity size={16} className="text-emerald-500"/> 有什么用？
                            </h4>
                            <ul className="space-y-2 list-disc list-outside ml-4 text-sm">
                                {def.use.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                        </div>
                    </section>

                    {/* Where & Example */}
                    {(def.where.length > 0 || def.example) && (
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                            {def.where.length > 0 && (
                                <div>
                                    <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-2 text-sm">
                                        <MapPin size={16} className="text-purple-500"/> 在界面哪里？
                                    </h4>
                                    <ul className="space-y-1 list-disc list-outside ml-4 text-sm text-slate-500">
                                        {def.where.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                </div>
                            )}
                            {def.example && (
                                <div className="pt-3 border-t border-slate-200">
                                    <h4 className="font-bold text-slate-700 mb-2 text-sm">🌰 最小例子</h4>
                                    <ul className="space-y-1 list-disc list-outside ml-4 text-sm text-slate-500">
                                        {def.example.map((t, i) => <li key={i}>{t}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Formula */}
                    {def.formula && (
                        <section>
                            <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                                <Calculator size={16} className="text-slate-400"/> 数学公式 (可选)
                            </h4>
                            <div className="space-y-3">
                                {def.formula.map((f, i) => (
                                    <div key={i} className="bg-slate-800 text-slate-200 p-4 rounded-lg font-mono text-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-slate-700 text-[10px] px-2 py-1 rounded-bl text-slate-300">{f.label}</div>
                                        <div className="mb-2 text-center text-lg">{f.latex}</div>
                                        <div className="text-xs text-slate-400 border-t border-slate-700 pt-2">{f.note}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Misconceptions */}
                    {def.misconceptions && (
                        <section className="bg-red-50 p-5 rounded-xl border border-red-100 text-red-900">
                            <h4 className="flex items-center gap-2 font-bold text-red-700 mb-3">
                                <AlertTriangle size={18}/> 常见误解
                            </h4>
                            <ul className="space-y-2 list-disc list-outside ml-5 text-sm">
                                {def.misconceptions.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <span 
                className="inline-flex items-center gap-1 cursor-help group align-baseline relative hover:z-10" 
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
            >
                {label && <span className="border-b border-dotted border-slate-400 group-hover:text-blue-600 group-hover:border-blue-500 transition-colors">{label}</span>}
                {trigger || <HelpCircle size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />}
            </span>

            {/* Portal to document.body to avoid z-index/overflow clipping */}
            {isOpen && createPortal(modalContent, document.body)}
        </>
    );
};

export default TermHelp;
