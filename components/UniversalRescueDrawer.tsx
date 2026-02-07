
import React, { useState } from 'react';
import { 
  X, BookOpen, Target, ArrowLeftRight, List, Calculator, AlertTriangle, Wrench, 
  Lightbulb, ArrowRight, MousePointerClick, ArrowDown, HelpCircle 
} from 'lucide-react';

export interface RescueContent {
    tldr: string;
    why: string[];
    io: { in: string[], out: string[], next: string };
    micro: string[];
    math: { title: string, desc: string, example: string[] };
    faq: { q: string, a: string }[];
    debug: { check: string, fix: string };
}

interface UniversalRescueDrawerProps {
    step: number;
    title: string;
    content: RescueContent;
    onClose: () => void;
    onHighlight?: (target: string) => void; // Optional if levels don't support highlighting yet
    onRetry?: () => void;
}

const UniversalRescueDrawer: React.FC<UniversalRescueDrawerProps> = ({ 
    step, title, content, onClose, onHighlight, onRetry 
}) => {
    const [activeTab, setActiveTab] = useState<'tldr'|'why'|'io'|'micro'|'math'|'faq'|'debug'>('tldr');

    const tabs = [
        { id: 'tldr', label: '小白解释', icon: <BookOpen size={16}/> },
        { id: 'why', label: '为什么做', icon: <Target size={16}/> },
        { id: 'io', label: '输入输出', icon: <ArrowLeftRight size={16}/> },
        { id: 'micro', label: '详细步骤', icon: <List size={16}/> },
        { id: 'math', label: '数字算例', icon: <Calculator size={16}/> },
        { id: 'faq', label: '常见误解', icon: <AlertTriangle size={16}/> },
        { id: 'debug', label: '卡住了?', icon: <Wrench size={16}/> },
    ];

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]" onClick={onClose} />
            
            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-[600px] bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                            <span>Step {step} 解析</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={24} className="text-slate-400"/>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto border-b border-slate-200 px-6 gap-6 no-scrollbar shrink-0 bg-white">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                                activeTab === tab.id 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Body */}
                <div className="flex-grow overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
                    
                    {/* TAB: TL;DR */}
                    {activeTab === 'tldr' && (
                        <div className="space-y-6">
                            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Lightbulb size={24}/> 一句话解释</h3>
                                <p className="text-blue-100 text-lg leading-relaxed">{content.tldr}</p>
                            </div>
                            
                            <button 
                                onClick={() => setActiveTab('micro')}
                                className="w-full bg-white p-6 rounded-xl border border-blue-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col justify-center group"
                            >
                                <span className="text-blue-600 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                    查看详细步骤 <ArrowRight size={16}/>
                                </span>
                                <span className="text-xs text-slate-400 mt-1">了解这一步具体发生了什么物理/数学过程</span>
                            </button>
                        </div>
                    )}

                    {/* TAB: WHY */}
                    {activeTab === 'why' && (
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Target size={20} className="text-orange-500"/> 为什么要这一步？</h3>
                                <ul className="space-y-3">
                                    {content.why.map((txt, i) => (
                                        <li key={i} className="flex gap-3 text-slate-600 leading-relaxed">
                                            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i+1}</div>
                                            {txt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* TAB: IO */}
                    {activeTab === 'io' && (
                        <div className="space-y-6">
                            <div className="grid gap-4">
                                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">输入 (Input)</div>
                                    <div className="flex flex-wrap gap-2">
                                        {content.io.in.map((tag, i) => (
                                            <span key={i} className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 shadow-sm border border-slate-200">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-center text-slate-400"><ArrowDown size={24}/></div>
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                    <div className="text-xs font-bold text-emerald-600 uppercase mb-2">输出 (Output)</div>
                                    <div className="flex flex-wrap gap-2">
                                        {content.io.out.map((tag, i) => (
                                            <span key={i} className="bg-white px-3 py-1.5 rounded-lg text-sm font-bold text-emerald-700 shadow-sm border border-emerald-200">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                                    <span className="text-sm font-medium text-blue-800">下一步去向：</span>
                                    <span className="font-bold text-blue-900">{content.io.next}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: MICRO STEPS */}
                    {activeTab === 'micro' && (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            {content.micro.map((stepTxt, i) => (
                                <div key={i} className="p-4 border-b border-slate-100 last:border-0 flex gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-500 shrink-0">
                                        {i+1}
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed mt-1.5">{stepTxt}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB: MATH EXAMPLE */}
                    {activeTab === 'math' && (
                        <div className="space-y-4">
                            <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl shadow-xl">
                                <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Calculator size={18}/> {content.math.title}</h3>
                                <p className="text-xs text-slate-400 mb-4 border-b border-slate-700 pb-2">{content.math.desc}</p>
                                <div className="space-y-3 font-mono text-xs sm:text-sm">
                                    {content.math.example.map((line, i) => (
                                        <div key={i} className="pl-3 border-l-2 border-blue-500">{line}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: FAQ */}
                    {activeTab === 'faq' && (
                        <div className="space-y-4">
                            {content.faq.map((item, i) => (
                                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 mb-2 flex items-start gap-2">
                                        <HelpCircle size={18} className="text-purple-500 shrink-0 mt-0.5"/>
                                        {item.q}
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed pl-6 border-l-2 border-purple-100">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB: DEBUG */}
                    {activeTab === 'debug' && (
                        <div className="space-y-6">
                            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2"><Wrench size={20}/> 故障排查</h3>
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-lg border border-red-100">
                                        <div className="text-xs font-bold text-red-400 uppercase mb-1">检查点 (Check)</div>
                                        <p className="text-red-900 font-medium text-sm">{content.debug.check}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-red-100">
                                        <div className="text-xs font-bold text-emerald-500 uppercase mb-1">修复方案 (Fix)</div>
                                        <p className="text-slate-700 font-medium text-sm">{content.debug.fix}</p>
                                    </div>
                                </div>
                            </div>

                            {onRetry && (
                                <button 
                                    onClick={() => { onRetry(); onClose(); }}
                                    className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                                >
                                    重试本步 (Reset Step)
                                </button>
                            )}
                            
                            {onHighlight && (
                                <button 
                                    onClick={() => { onHighlight(''); onClose(); }}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <MousePointerClick size={18}/> 高亮我要点的按钮
                                </button>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-white flex gap-3 shrink-0">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg active:scale-95 transition-all text-sm">
                        明白了，回到实验
                    </button>
                </div>
            </div>
        </>
    );
};

export default UniversalRescueDrawer;
