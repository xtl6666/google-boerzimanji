
import React, { useState, useEffect } from 'react';
import { CheckCircle, Activity, ArrowRight, Lightbulb, Lock, ChevronDown, ChevronUp, Calculator, BarChart3, ChevronRight, Magnet, ArrowUp, ArrowDown, HelpCircle, X, Table, Info } from 'lucide-react';
import LevelNav from './LevelNav';
import TermHelp from './TermHelp';
import UniversalRescueDrawer, { RescueContent } from './UniversalRescueDrawer';

// --- SHARED COMPONENTS ---

const IntroOverlay = ({ onStart }: { onStart: () => void }) => (
    <div className="absolute inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
             <div className="bg-slate-900 p-6 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                    <Info size={24}/>
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-white">Level 1: 造山运动</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">The Landscape</p>
                 </div>
             </div>
             
             <div className="p-6 space-y-6">
                 <p className="text-slate-700 text-lg font-medium leading-relaxed">
                     欢迎来到宏观世界。现在，我们将不再关注单个神经元，而是要把它们看作一个整体。你的身份从“观察者”变成了<strong>“造景师”</strong>。
                 </p>
                 
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">本章任务 (Mission Objectives)</h4>
                     <ul className="space-y-3">
                        <li className="flex gap-3 text-sm text-slate-700">
                            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                            <span>理解 <strong><TermHelp term="energy" label="能量 (Energy)" /></strong>：它是系统给每个状态打的“不舒服分”。</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-700">
                            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                            <span>使用 <strong><TermHelp term="weight" label="偏好 (Weight)" /></strong> 作为铲子，亲手改变地形。</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-700">
                            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                            <span>造山：挖出一个“能量谷底”，让系统自然地流向那里。</span>
                        </li>
                     </ul>
                 </div>
             </div>
             
             <div className="p-6 bg-slate-50 border-t flex justify-end">
                 <button 
                    onClick={onStart} 
                    className="group px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg hover:shadow-xl flex items-center gap-2 transition-all active:scale-95"
                 >
                     <span>开始实验</span>
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                 </button>
             </div>
        </div>
    </div>
);

const SummaryOverlay = ({ 
    title, content, insight, onNext 
}: { 
    title: string, content: string, insight: string, onNext: () => void 
}) => (
    <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
             <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                 <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                     <CheckCircle className="text-emerald-500" size={24} />
                     本节完成
                 </h2>
             </div>
             <div className="p-6 space-y-6">
                 <div className="space-y-2">
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                         <Activity size={12}/> 刚才发生了什么？
                     </div>
                     <p className="text-slate-700 leading-relaxed font-medium">
                         {content}
                     </p>
                 </div>
                 <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 bg-indigo-500/5 rounded-full blur-xl -mr-4 -mt-4"></div>
                     <div className="relative z-10">
                         <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                             <Lightbulb size={12}/> 核心洞察 (Insight)
                         </div>
                         <p className="text-indigo-900 font-bold leading-relaxed">
                             {insight}
                         </p>
                     </div>
                 </div>
             </div>
             <div className="p-6 bg-slate-50 border-t flex justify-end">
                 <button 
                    onClick={onNext} 
                    className="group px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg hover:shadow-xl flex items-center gap-2 transition-all active:scale-95"
                 >
                     <span>进入 Level 2</span>
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                 </button>
             </div>
        </div>
    </div>
);

const GuideCard = ({ 
    step, totalSteps, title, goal, action, why, onNext, canNext, onRescue 
}: { 
    step: number, totalSteps: number, title: string, goal: string, action: React.ReactNode, why: string, onNext?: () => void, canNext?: boolean, onRescue?: () => void
}) => {
    return (
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-t-2xl sm:rounded-xl shadow-xl border-t border-slate-700 z-30 transition-all duration-300 animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white text-xs font-black px-2 py-0.5 rounded shadow-sm ring-1 ring-blue-400">
                        STEP {step}/{totalSteps}
                    </span>
                    <h3 className="font-bold text-base text-blue-100">{title}</h3>
                </div>
                <div className="flex gap-2">
                    {onRescue && (
                        <button 
                            onClick={onRescue}
                            className="text-xs text-blue-400 hover:text-white flex items-center gap-1 transition-colors font-bold px-2 py-1 rounded bg-blue-900/30 hover:bg-blue-600 border border-blue-500/30"
                        >
                            <HelpCircle size={12}/> 我不懂这一步
                        </button>
                    )}
                    {onNext && (
                        <button 
                            onClick={onNext}
                            disabled={!canNext}
                            className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all ${
                                canNext 
                                ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-900/20 active:scale-95' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            下一步 <ChevronRight size={12}/>
                        </button>
                    )}
                </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-0.5 tracking-wider">🎯 目标 (Goal)</div>
                    <div className="text-white font-medium leading-tight">{goal}</div>
                </div>
                <div className="bg-blue-900/20 p-2.5 rounded-lg border border-blue-500/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="text-blue-300 text-[10px] font-bold uppercase mb-0.5 tracking-wider pl-2">👆 操作 (Do)</div>
                    <div className="text-blue-100 font-medium leading-tight pl-2">{action}</div>
                </div>
                <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-0.5 tracking-wider">👀 观测 (Observe)</div>
                    <div className="text-slate-300 leading-tight">{why}</div>
                </div>
            </div>
        </div>
    );
};

// --- CONSTANTS ---

const STATES = [
    { sA: 1, sB: 1, label: '同向 (上)' },
    { sA: 1, sB: -1, label: '相反' },
    { sA: -1, sB: 1, label: '相反' },
    { sA: -1, sB: -1, label: '同向 (下)' },
];

// --- LEVEL 1 COMPONENT ---

interface Level1Props {
    onComplete: () => void;
    initialStep?: number;
    onStepChange?: (step: number) => void;
    onPrevLevel?: () => void;
    canPrevLevel?: boolean;
    onOpenMenu?: () => void;
}

const Level1: React.FC<Level1Props> = ({ 
    onComplete,
    initialStep = 1,
    onStepChange,
    onPrevLevel,
    canPrevLevel = false,
    onOpenMenu
}) => {
    // State
    const [step, setStep] = useState(initialStep);
    const [w, setW] = useState(4); // Start positive
    const [selectedStateIdx, setSelectedStateIdx] = useState<number | null>(null);
    const [visitedStates, setVisitedStates] = useState<Set<number>>(new Set());
    const [showQuiz, setShowQuiz] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [expandedCalculation, setExpandedCalculation] = useState(false);
    const [showRescue, setShowRescue] = useState(false);

    // Sync step with parent
    useEffect(() => {
        onStepChange?.(step);
    }, [step, onStepChange]);

    // Helpers
    const calculateEnergy = (sA: number, sB: number, weight: number) => {
        // E = -w * sA * sB
        return -weight * sA * sB;
    };

    // Calculate Limits for Visualization
    const minEnergy = Math.min(...STATES.map(s => calculateEnergy(s.sA, s.sB, w)));

    const handleStateClick = (idx: number) => {
        setSelectedStateIdx(idx);
        setVisitedStates(prev => new Set(prev).add(idx));
    };

    // Quiz Logic
    const handleQuizSelect = (choice: 'same' | 'diff') => {
        setShowQuiz(false);
        setW(choice === 'diff' ? -4 : 4); // Set W based on their guess? Actually let them discover.
        // Better: Unlock slider, let them set it.
        setStep(2);
    };

    // --- RENDER HELPERS ---
    
    const renderMagnet = (val: number, label: string) => (
        <div className={`flex flex-col items-center gap-1 ${val === 1 ? 'text-orange-500' : 'text-blue-500'}`}>
            <div className={`w-8 h-12 rounded border-2 flex items-center justify-center font-bold text-xl shadow-sm transition-all ${val === 1 ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                {val === 1 ? <ArrowUp size={20} strokeWidth={3}/> : <ArrowDown size={20} strokeWidth={3}/>}
            </div>
            <span className="text-[10px] font-bold text-slate-400">{label}</span>
        </div>
    );

    // Rescue Content
    const getRescueContent = (lvl: number): RescueContent => {
        switch(lvl) {
            case 1: return {
                tldr: "能量(Energy) 是系统对当前状态的'厌恶程度'。能量越低，系统越喜欢。",
                why: ["我们无法直接告诉神经网络'什么是对的'，但我们可以定义'什么是能量低的'。", "物理规律：万物趋于能量最低点。"],
                io: { in: ["权重 w", "磁铁方向"], out: ["能量 E"], next: "调整 w" },
                micro: ["获取磁铁 A, B 的方向", "获取权重 w", "计算 E = -w * A * B"],
                math: { title: "能量公式", desc: "E = -w * sA * sB", example: ["w=4, A=1, B=1", "E = -4 * 1 * 1 = -4 (低能)"] },
                faq: [{q: "为什么要有负号?", a: "因为我们希望'好事情'(w和方向一致)对应'低能量'。如果没有负号，好事情就变成高能量了。"}],
                debug: { check: "点击表格没反应?", fix: "需要点击左侧列表里的每一行，观察不同组合的能量值。" }
            };
            case 2: return {
                tldr: "改变权重 w，就是改变物理法则。w 变成负数，系统就会讨厌'同向'，喜欢'相反'。",
                why: ["为了让网络学会不同的模式。", "如果我想让它记住'红配绿'(相反)，我就得把 w 设为负数。"],
                io: { in: ["负数 w"], out: ["翻转的地形图"], next: "理解公式" },
                micro: ["拖动滑块到负数区", "观察 E 的正负号变化", "谷底位置改变"],
                math: { title: "负权重影响", desc: "E = -(-4) * 1 * 1 = +4", example: ["w=-4, 同向 -> E=+4 (高)", "w=-4, 反向 -> E=-4 (低)"] },
                faq: [{q: "地形图为什么变了?", a: "地形图就是能量高低的直观展示。w 变了，哪里舒服哪里难受自然就变了。"}],
                debug: { check: "目标没达成?", fix: "必须把 w 拖到 0 以下，并且点击一下新的低能状态。" }
            };
            case 3: return {
                tldr: "这个公式 E = -w * sA * sB 是为了把'语言描述'变成'数学计算'。",
                why: ["计算机不懂'同向'这个词，但它懂乘法。", "同向相乘为正，反向相乘为负，配合 w 就能涵盖所有逻辑。"],
                io: { in: ["展开推导"], out: ["详细算式"], next: "造山" },
                micro: ["1x1=1", "1x(-1)=-1", "-w 决定最终符号"],
                math: { title: "符号运算", desc: "Sign(E) = -Sign(w) * Sign(sA*sB)", example: ["同号相乘=+1, 异号相乘=-1"] },
                faq: [{q: "sA 为什么是 +1/-1 而不是 1/0?", a: "为了方便计算对称性。如果是 0，乘积就一直是 0，很难表示'相反'的概念。"}],
                debug: { check: "按钮点不了?", fix: "点击'点击展开推导'按钮查看详细计算过程。" }
            };
            case 4: return {
                tldr: "权重 w 的绝对值越大，这种偏好就越强烈，'坑'就越深。",
                why: ["浅坑容易跳出来（遗忘），深坑很难跳出来（牢记）。", "训练的目的就是挖出足够深的坑。"],
                io: { in: ["大号 w"], out: ["深谷 (Deep Valley)"], next: "下一关" },
                micro: ["增加 w", "E 变得更负", "柱状图落差变大"],
                math: { title: "强度计算", desc: "|E| ∝ |w|", example: ["w=1 -> E=-1", "w=10 -> E=-10 (更深)"] },
                faq: [{q: "多深才算深?", a: "相对于'温度'(随机噪声)来说。如果坑比噪声大很多，就能锁住状态。"}],
                debug: { check: "无法完成?", fix: "把 w 拖到最右边 (>= 6)。" }
            };
            default: return { tldr: "", why: [], io: {in:[],out:[],next:""}, micro: [], math: {title:"",desc:"",example:[]}, faq: [], debug: {check:"",fix:""} };
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 font-sans relative overflow-hidden">
            
            <LevelNav 
                title="Level 1: 造山运动"
                subTitle="The Landscape"
                currentStep={step}
                totalSteps={4}
                onPrevStep={() => setStep(s => Math.max(1, s-1))}
                onPrevLevel={onPrevLevel}
                onRestart={() => { 
                    setStep(1); 
                    setW(4); 
                    setSelectedStateIdx(null); 
                    setVisitedStates(new Set());
                    setShowQuiz(false);
                    setShowSummary(false);
                    setShowIntro(true); 
                    setExpandedCalculation(false);
                }}
                canPrevStep={step > 1}
                canPrevLevel={canPrevLevel}
                onOpenMenu={onOpenMenu}
            />

            {/* --- INTRO MODAL --- */}
            {showIntro && (
                <IntroOverlay onStart={() => setShowIntro(false)} />
            )}

            {/* --- RESCUE DRAWER --- */}
            {showRescue && (
                <UniversalRescueDrawer 
                    step={step}
                    title="Level 1: 能量法则"
                    content={getRescueContent(step)}
                    onClose={() => setShowRescue(false)}
                />
            )}

            {/* --- QUIZ MODAL (Between Step 1 and 2) --- */}
            {showQuiz && (
                <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-lg w-full">
                        <div className="flex items-center gap-3 mb-4 text-blue-600">
                             <HelpCircle size={28} className="shrink-0"/>
                             <h3 className="text-xl font-bold text-slate-800">先猜后做：直觉测试</h3>
                        </div>
                        <p className="text-slate-600 mb-6 text-lg font-medium">
                            如果权重 <span className="font-mono bg-red-100 text-red-700 px-1 rounded font-bold">w &lt; 0</span> (变成负数)，
                            系统会更偏好哪种组合？
                        </p>
                        <div className="grid gap-4">
                            <button 
                                onClick={() => handleQuizSelect('same')}
                                className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                            >
                                <div className="font-bold text-slate-800 group-hover:text-blue-700 mb-1">A. 依然喜欢同向 (↑↑ 或 ↓↓)</div>
                            </button>
                            <button 
                                onClick={() => handleQuizSelect('diff')}
                                className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                            >
                                <div className="font-bold text-slate-800 group-hover:text-blue-700 mb-1">B. 变成喜欢相反 (↑↓ 或 ↓↑)</div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUMMARY MODAL --- */}
            {showSummary && (
                <SummaryOverlay 
                    title="造山运动完成"
                    content="你刚刚通过调整权重 w，彻底改变了系统的‘打分表’(能量地形)。"
                    insight="所谓‘训练网络’，本质上就是在调整 w。我们希望网络记住某种模式，就是把这种模式的能量坑挖得越深越好，这样系统就会自然而然地掉进去。"
                    onNext={onComplete}
                />
            )}

            {/* --- TOP BAR: WEIGHT CONTROL --- */}
            <div className="bg-white border-b px-6 py-4 shadow-sm z-20 flex flex-col items-center">
                <div className={`w-full max-w-lg transition-all duration-500 ${step === 1 ? 'opacity-80' : 'opacity-100'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Magnet size={16} className="text-slate-400"/>
                            <span><TermHelp term="weight" label="偏好强度 (Weight w)" /></span>
                            {step === 1 && <Lock size={12} className="text-slate-400"/>}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${w>0 ? 'bg-emerald-100 text-emerald-700' : (w<0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500')}`}>
                                {w > 0 ? "喜欢同向 (Aligned)" : (w < 0 ? "喜欢相反 (Opposite)" : "无感 (0)")}
                            </span>
                            <span className="font-mono font-black text-xl w-12 text-right">{w > 0 ? '+' : ''}{w}</span>
                        </div>
                    </div>
                    
                    <div className="relative h-8 flex items-center">
                         {/* Axis */}
                         <div className="absolute w-full h-1 bg-slate-200 rounded-full"></div>
                         <div className="absolute left-1/2 w-1 h-3 bg-slate-300 -translate-x-1/2 rounded-full"></div>
                         
                         <input 
                            type="range" min="-10" max="10" step="0.5" 
                            value={w} 
                            onChange={(e) => setW(parseFloat(e.target.value))}
                            className={`w-full absolute inset-0 opacity-0 cursor-pointer z-20 ${step===1?'cursor-not-allowed':''}`}
                            disabled={step === 1}
                        />
                        
                        {/* Thumb */}
                        <div 
                            className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 bg-white shadow-md transition-all duration-75 pointer-events-none z-10 flex items-center justify-center ${step >= 2 ? 'ring-4 ring-blue-100' : ''} ${w > 0 ? 'border-emerald-500' : (w < 0 ? 'border-red-500' : 'border-slate-400')}`}
                            style={{ left: `${((w + 10) / 20) * 100}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className={`w-2 h-2 rounded-full ${w > 0 ? 'bg-emerald-500' : (w < 0 ? 'bg-red-500' : 'bg-slate-400')}`}></div>
                        </div>
                    </div>
                </div>

                {/* Rule Explanation Card */}
                <div className="mt-2 flex gap-4 text-[10px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className={`flex items-center gap-1 ${w > 0 ? 'font-bold text-emerald-600' : 'opacity-50'}`}>
                        {w > 0 && <CheckCircle size={10}/>} w &gt; 0: 同向分低 (Comfortable)
                    </span>
                    <span className="w-px h-3 bg-slate-300"></span>
                    <span className={`flex items-center gap-1 ${w < 0 ? 'font-bold text-emerald-600' : 'opacity-50'}`}>
                        {w < 0 && <CheckCircle size={10}/>} w &lt; 0: 相反分低 (Comfortable)
                    </span>
                    <span className="w-px h-3 bg-slate-300"></span>
                    <span className="flex items-center gap-1">
                        |w| 越大 = 偏好越强
                    </span>
                </div>
            </div>

            {/* --- MAIN SPLIT VIEW --- */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
                
                {/* LEFT: STATE TABLE */}
                <div className="p-4 sm:p-6 bg-white border-r border-slate-200 overflow-y-auto">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Table size={14}/> 
                        <span>1. 状态打分表 (Score Table)</span>
                        <TermHelp term="state_vector" />
                    </h3>

                    <div className="space-y-3">
                        {STATES.map((s, idx) => {
                            const isSelected = selectedStateIdx === idx;
                            const energy = calculateEnergy(s.sA, s.sB, w);
                            const isLowest = energy <= minEnergy + 0.1; 

                            return (
                                <div key={idx} className="relative">
                                    <button
                                        onClick={() => handleStateClick(idx)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 group ${
                                            isSelected 
                                            ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02] z-10' 
                                            : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {/* State Visuals */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-2">
                                                {renderMagnet(s.sA, 'A')}
                                                {renderMagnet(s.sB, 'B')}
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-xs font-bold text-slate-700">{s.label}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    (sA:{s.sA > 0 ? '+1' : '-1'}, sB:{s.sB > 0 ? '+1' : '-1'})
                                                </span>
                                            </div>
                                        </div>

                                        {/* Energy & Comfort Label */}
                                        <div className="text-right">
                                            <div className={`font-mono font-black text-xl flex items-center justify-end gap-1 ${energy < 0 ? 'text-emerald-500' : (energy > 0 ? 'text-red-500' : 'text-slate-300')}`}>
                                                {energy.toFixed(1)} <TermHelp term="energy" trigger={<span className="text-[10px] text-slate-300 hover:text-blue-500 cursor-help border border-slate-200 rounded px-1">E</span>} />
                                            </div>
                                            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isLowest ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400'}`}>
                                                {isLowest ? "最舒服 (Valley)" : (energy > minEnergy ? "难受 (Peak)" : "一般")}
                                            </div>
                                        </div>
                                    </button>

                                    {/* CALCULATION EXPANSION */}
                                    {isSelected && expandedCalculation && (
                                        <div className="bg-slate-800 text-white p-4 rounded-xl mt-2 mb-4 animate-in slide-in-from-top-2 shadow-xl relative z-20">
                                            <div className="absolute top-0 left-8 -mt-2 w-4 h-4 bg-slate-800 rotate-45"></div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                                <Calculator size={12}/> 计算公式: E = -w · sA · sB
                                            </div>
                                            <div className="font-mono text-lg flex flex-wrap items-center gap-2 justify-start mb-2">
                                                <span className="text-slate-500">-</span>
                                                <span className="bg-slate-700 px-1.5 rounded text-blue-300" title="Weight (w)">({w})</span>
                                                <span className="text-slate-500">×</span>
                                                <span className={`px-1.5 rounded ${s.sA > 0 ? 'bg-white text-slate-900' : 'bg-slate-600 text-slate-200'}`} title="sA">({s.sA})</span>
                                                <span className="text-slate-500">×</span>
                                                <span className={`px-1.5 rounded ${s.sB > 0 ? 'bg-white text-slate-900' : 'bg-slate-600 text-slate-200'}`} title="sB">({s.sB})</span>
                                                <span className="text-slate-400 mx-1">=</span>
                                                <span className={`font-black text-2xl ${energy < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {energy.toFixed(1)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-300 border-t border-slate-700 pt-2 leading-relaxed">
                                                {s.sA === s.sB ? (
                                                    <span>
                                                        同向相乘为 <strong>+1</strong>。<br/>
                                                        {w > 0 ? "因为 w>0 (喜欢同向)，负号让能量变低 (舒适)。" : "因为 w<0 (讨厌同向)，负负得正，能量变高 (难受)。"}
                                                    </span>
                                                ) : (
                                                    <span>
                                                        反向相乘为 <strong>-1</strong>。<br/>
                                                        {w > 0 ? "因为 w>0，负负得正，能量变高 (难受)。" : "因为 w<0，三个负号相乘还是负，能量变低 (舒适)。"}
                                                    </span>
                                                )}
                                                <div className="mt-1 text-[10px] text-slate-500">(Bias terms hidden: -0 -0)</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: LANDSCAPE VISUALIZATION */}
                <div className="p-4 sm:p-8 bg-slate-50 flex flex-col relative min-h-[300px] border-t sm:border-t-0 sm:border-l border-slate-200">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BarChart3 size={14}/> 
                        <span>2. 能量地形 (Landscape)</span>
                        <TermHelp term="landscape" />
                    </h3>
                    
                    <div className="flex-grow flex items-center justify-center h-full pb-12">
                        <div className="flex items-end justify-center gap-4 sm:gap-6 w-full max-w-lg h-[200px] relative">
                            {/* Baseline E=0 */}
                            <div className="absolute w-full h-px bg-slate-300 top-1/2"></div>
                            <div className="absolute right-0 top-1/2 -mt-3 text-[9px] font-bold text-slate-400 bg-slate-50 px-1">E=0</div>

                            {STATES.map((s, idx) => {
                                const energy = calculateEnergy(s.sA, s.sB, w);
                                const isSelected = selectedStateIdx === idx;
                                const isLowest = energy <= minEnergy + 0.1;
                                const height = Math.abs(energy) * 10; 
                                
                                return (
                                    <div key={idx} className={`relative flex flex-col items-center group flex-1 transition-all duration-500 ${isSelected ? 'opacity-100' : 'opacity-80'}`}>
                                        {/* Lowest Indicator */}
                                        {isLowest && (
                                            <div className="absolute -top-8 animate-bounce bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-20">
                                                谷底
                                            </div>
                                        )}

                                        {/* Bar */}
                                        <div className="h-[200px] w-full flex items-center justify-center">
                                            <div 
                                                className={`w-full sm:w-16 rounded-md transition-all duration-500 flex items-center justify-center relative ${
                                                    energy < 0 ? 'bg-emerald-500 origin-top' : (energy > 0 ? 'bg-red-500 origin-bottom' : 'bg-slate-300 h-1')
                                                } ${isSelected ? 'ring-2 ring-blue-400 shadow-xl z-10' : 'shadow-sm'}`}
                                                style={{ 
                                                    height: `${Math.max(4, height)}px`,
                                                    transform: energy > 0 ? 'translateY(-50%)' : 'translateY(50%)'
                                                }}
                                            >
                                                <span className="text-[10px] font-bold text-white drop-shadow-md">
                                                    {Math.abs(energy) > 0.5 ? energy.toFixed(0) : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Label */}
                                        <div className={`mt-2 flex flex-col items-center transition-all ${isSelected ? 'scale-110' : ''}`}>
                                            <div className="flex gap-1 mb-1">
                                                {s.sA === 1 ? <ArrowUp size={12} className="text-slate-600"/> : <ArrowDown size={12} className="text-slate-600"/>}
                                                {s.sB === 1 ? <ArrowUp size={12} className="text-slate-600"/> : <ArrowDown size={12} className="text-slate-600"/>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* --- BOTTOM: GUIDED STEPS --- */}
            {step === 1 && (
                <GuideCard 
                    step={1} totalSteps={4}
                    title="探索规则与打分"
                    goal="点击左侧表格中的每一行"
                    action="点击不同的磁铁组合"
                    why="当前偏好是‘喜欢同向’(w=+4)。你会发现，只要磁铁方向一致，能量就是负的（绿色谷底）；方向相反则是正的（红色山峰）。"
                    onNext={() => setShowQuiz(true)}
                    canNext={visitedStates.size >= 2}
                    onRescue={() => setShowRescue(true)}
                />
            )}

            {step === 2 && (
                <GuideCard 
                    step={2} totalSteps={4}
                    title="验证你的猜想"
                    goal="将偏好改为‘喜欢相反’"
                    action="向左拖动顶部的 w 滑块，变成负数"
                    why="当你把 w 变成负数时，规则变了。能量地形会瞬间翻转：现在‘一上一下’变成了最舒服的谷底。"
                    onNext={() => { setStep(3); setW(4); }} // Removed setSelectedStateIdx(null)
                    canNext={w < 0 && calculateEnergy(1, -1, w) < 0}
                    onRescue={() => setShowRescue(true)}
                />
            )}

            {step === 3 && (
                <GuideCard 
                    step={3} totalSteps={4}
                    title="数学公式的意义"
                    goal="看看公式是怎么把规则变成数字的"
                    action={
                        <button 
                            onClick={() => { 
                                setExpandedCalculation(true); 
                                if (selectedStateIdx === null) setSelectedStateIdx(0); 
                            }} 
                            className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs font-bold transition-colors"
                        >
                            点击展开推导
                        </button>
                    }
                    why="公式 E = -w·sA·sB 只是把我们的口头规则写成了数学语言。同向乘积为正，反向乘积为负，w 决定了谁被奖励。"
                    onNext={() => setStep(4)}
                    canNext={expandedCalculation && selectedStateIdx !== null}
                    onRescue={() => setShowRescue(true)}
                />
            )}

            {step === 4 && (
                <GuideCard 
                    step={4} totalSteps={4}
                    title="造山运动"
                    goal="保持偏好同向(w>0)，但要把谷底挖得更深 (E ≤ -6)"
                    action="向右拖动 w 滑块，越大越好"
                    why="w 的绝对值代表偏好的‘强烈程度’。w 越大，谷底越深，系统以后就越容易‘掉’进这个状态里出不来。"
                    onNext={() => setShowSummary(true)}
                    canNext={w >= 6}
                    onRescue={() => setShowRescue(true)}
                />
            )}

        </div>
    );
};

export default Level1;
