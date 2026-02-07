
import React, { useState, useEffect } from 'react';
import { 
    Cpu, Activity, RefreshCw, 
    ArrowRight, CheckCircle, 
    MousePointerClick, Zap, BarChart3, ChevronRight,
    ArrowLeftRight, ChevronDown, Camera, ArrowUp, Variable, Calculator, ChevronUp, BookOpen, AlertCircle, FastForward, HelpCircle, Check, ArrowDown
} from 'lucide-react';
import TermHelp from './TermHelp';
import LevelNav from './LevelNav';
import UniversalRescueDrawer, { RescueContent } from './UniversalRescueDrawer';

// --- TYPES ---
type Val = 0 | 1;

// --- PHYSICS ENGINE ---
const toMath = (v: Val): number => (v === 1 ? 1 : -1);
const sigmoid = (x: number, t: number): number => 1 / (1 + Math.exp(-x / t));

// Calculate Net Input (x) for Hidden Unit H
const calcNetInputH = (valA: Val, valB: Val, wAH: number, wBH: number, bH: number) => {
    return (wAH * toMath(valA)) + (wBH * toMath(valB)) + bH;
};

// Calculate Net Input for Visible Units (Step 4)
const calcNetInputVisible = (valH: Val, weight: number, bias: number) => {
    return (weight * toMath(valH)) + bias;
};

const sample = (prob: number): Val => Math.random() < prob ? 1 : 0;

// --- COMPONENTS ---

// 1. INTRO OVERLAY (ROLE CARDS)
const IntroRoleCards = ({ onStart }: { onStart: () => void }) => (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-50 p-6 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-purple-600"/> 
                    变量角色卡 (Variable Roles)
                </h2>
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                    在进入实验前，请先认识一下即将登场的 5 位主角。
                    <br/>
                    <strong>核心逻辑：</strong> 外部现象(AB) 通过 投票权(w) 产生 支持力度(x)，形成 倾向(P)，最终掷硬币决定 内部原因(H)。
                </p>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="font-bold text-blue-700 text-sm mb-1 flex items-center gap-2">
                        A, B (可见开关) <TermHelp term="visible_units" />
                    </div>
                    <div className="text-xs text-slate-600">你能够直接观测到的外部现象。</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="font-bold text-purple-700 text-sm mb-1 flex items-center gap-2">
                        H (隐藏开关) <TermHelp term="hidden_unit" />
                    </div>
                    <div className="text-xs text-slate-600">看不见的内部寄存器，代表“内部原因”。</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="font-bold text-orange-700 text-sm mb-1 flex items-center gap-2">
                        w (投票权) <TermHelp term="weight" />
                    </div>
                    <div className="text-xs text-slate-600">权重。决定了 A/B 对 H 的话语权有多大。</div>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-700 text-sm mb-1 flex items-center gap-2">
                        x (净票数) <TermHelp term="net_input" />
                    </div>
                    <div className="text-xs text-slate-600">所有支持票减去反对票的总和。x&gt;0 想变1，x&lt;0 想变0。</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="font-bold text-emerald-700 text-sm mb-1 flex items-center gap-2">
                        P (倾向概率) <TermHelp term="probability" />
                    </div>
                    <div className="text-xs text-slate-600">把票数 x 变成 0%~100% 的概率。</div>
                </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-end">
                <button onClick={onStart} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2">
                    <span>认识了，开始实验</span> <ArrowRight size={18}/>
                </button>
            </div>
        </div>
    </div>
);

// 2. GUIDE CARD
const GuideCard = ({ title, goal, action, purpose, onNext, canNext, expandedContent, demoButtons, extraStatus, meaning, onRescue }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className={`bg-slate-900 text-white p-5 rounded-xl shadow-2xl border-t border-slate-700 w-full transition-all duration-500 ${canNext ? 'ring-2 ring-emerald-500 shadow-emerald-900/50' : ''}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <h3 className={`font-bold text-base ${canNext ? 'text-emerald-100' : 'text-purple-100'}`}>{title}</h3>
                </div>
                <div className="flex gap-2">
                    {onRescue && (
                        <button 
                            onClick={onRescue}
                            className="text-xs text-blue-400 hover:text-white flex items-center gap-1 transition-colors font-bold px-2 py-1 rounded bg-blue-900/30 hover:bg-blue-600 border border-blue-500/30"
                        >
                            <HelpCircle size={12}/> 我不懂
                        </button>
                    )}
                    {onNext && (
                        <button onClick={onNext} disabled={!canNext} className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all ${canNext ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg active:scale-95 animate-pulse' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                            {canNext ? "解锁下一步" : "目标未达成"} <ChevronRight size={12}/>
                        </button>
                    )}
                </div>
            </div>
            
            {/* Purpose Sentence */}
            <div className="mb-4 bg-slate-800/80 px-3 py-2 rounded-lg border-l-4 border-purple-500">
                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block mb-0.5">本步目的 (Why this step)</span>
                <p className="text-sm text-slate-200 font-medium">{purpose}</p>
            </div>

            {/* Grid Content */}
            <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">🎯 目标 (Goal)</div>
                    <div className="text-white font-medium">{goal}</div>
                    {extraStatus && <div className="mt-2 pt-2 border-t border-slate-700/50">{extraStatus}</div>}
                </div>
                <div className="bg-purple-900/20 p-2.5 rounded-lg border border-purple-500/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <div className="text-purple-300 text-[10px] font-bold uppercase mb-0.5 pl-2">👆 操作 (Do)</div>
                    <div className="text-purple-100 font-medium pl-2 mb-2">{action}</div>
                    {demoButtons && <div className="pl-2">{demoButtons}</div>}
                </div>
            </div>

            {/* Meaning Section (Step 4 specific) */}
            {meaning && (
                <div className="bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-500/30 mb-3">
                    <div className="text-emerald-400 text-[10px] font-bold uppercase mb-0.5">💡 意义 (Meaning)</div>
                    <div className="text-emerald-100 text-sm leading-relaxed">{meaning}</div>
                </div>
            )}

            {/* Expanded Details */}
            {expandedContent && (
                <div className="mt-2 border-t border-slate-700 pt-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1">
                        {isExpanded ? <ChevronRight className="rotate-90" size={12}/> : <Calculator size={12}/>}
                        {isExpanded ? "收起原理详解" : "展开原理详解 (数学公式)"}
                    </button>
                    {isExpanded && <div className="mt-2 bg-slate-800 p-3 rounded-lg text-xs text-slate-300 border border-slate-700 leading-relaxed animate-in fade-in">{expandedContent}</div>}
                </div>
            )}
        </div>
    );
};

// --- MAIN LEVEL 3 ---

interface Level3Props {
    onComplete: () => void;
    initialStep?: number;
    onStepChange?: (step: number) => void;
    onPrevLevel?: () => void;
    canPrevLevel?: boolean;
    onOpenMenu?: () => void;
}

const Level3: React.FC<Level3Props> = ({ 
    onComplete, 
    initialStep = 1, 
    onStepChange, 
    onPrevLevel, 
    canPrevLevel = false,
    onOpenMenu
}) => {
    // --- STATE ---
    const [step, setStep] = useState(initialStep);
    const [showIntro, setShowIntro] = useState(true);
    const [showRescue, setShowRescue] = useState(false);
    const [isFooterExpanded, setIsFooterExpanded] = useState(true); // NEW: Collapsible Footer

    // Sync step
    useEffect(() => {
        onStepChange?.(step);
    }, [step, onStepChange]);

    // Units
    const [valA, setValA] = useState<Val>(1);
    const [valB, setValB] = useState<Val>(1);
    const [valH, setValH] = useState<Val>(0); 
    const [isHFlashing, setIsHFlashing] = useState(false); 

    // Parameters
    const [wAH, setWAH] = useState(2);
    const [wBH, setWBH] = useState(2);
    const [bH, setBH] = useState(0);
    const temp = 1;

    // UI States
    const [showVotingDetails, setShowVotingDetails] = useState(false);

    // Step 4 Specific States
    // 0: Idle, 1: Computed P(H), 2: Sampled H, 3: Reconstructed
    const [pipelineStage, setPipelineStage] = useState<0 | 1 | 2 | 3>(0); 
    const [step4Data, setStep4Data] = useState({
        xH: 0,
        pH: 0,
        sampledH: 0 as Val,
        xGenA: 0, xGenB: 0,
        pGenA: 0, pGenB: 0,
        reconA: 0 as Val, reconB: 0 as Val
    });

    const [isAutoRun, setIsAutoRun] = useState(false);

    // Stats
    const [hOnCount, setHOnCount] = useState(0);
    const [totalSamples, setTotalSamples] = useState(0);
    const [reconMatchCount, setReconMatchCount] = useState(0); 

    // Step Progress Flags
    const [step2NeutralSamples, setStep2NeutralSamples] = useState(0);
    const [step2StrongSamples, setStep2StrongSamples] = useState(0);
    const [step3CondDone, setStep3CondDone] = useState(false); 

    // --- CALCULATIONS ---
    const netInputH = calcNetInputH(valA, valB, wAH, wBH, bH);
    const probH = sigmoid(netInputH, temp);
    const freqH = totalSamples === 0 ? 0 : hOnCount / totalSamples;

    // --- ACTIONS ---

    const handleResetStats = () => {
        setHOnCount(0);
        setTotalSamples(0);
        setReconMatchCount(0);
        setPipelineStage(0);
    };

    const flashH = (val: Val) => {
        setValH(val);
        setIsHFlashing(true);
        setTimeout(() => setIsHFlashing(false), 200);
    };

    const updateH = () => {
        const newVal = sample(probH);
        flashH(newVal);
        setHOnCount(prev => prev + (newVal === 1 ? 1 : 0));
        setTotalSamples(prev => prev + 1);
        updateStep2Progress(1, probH);
    };

    const batchSampleH = () => {
        let ones = 0;
        const N = 100;
        for(let i=0; i<N; i++) {
            if (sample(probH) === 1) ones++;
        }
        setHOnCount(prev => prev + ones);
        setTotalSamples(prev => prev + N);
        flashH(sample(probH));
        updateStep2Progress(N, probH);
    };

    const updateStep2Progress = (n: number, currentP: number) => {
        if (step === 2) {
            if (Math.abs(currentP - 0.5) < 0.1) {
                setStep2NeutralSamples(prev => prev + n);
            }
            else if (currentP > 0.9) {
                setStep2StrongSamples(prev => prev + n);
            }
        }
    };

    // --- STEP 4 PIPELINE LOGIC ---
    
    // 1. Compute P (Input AB → P)
    const handleStep4_Compute = () => {
        const x = calcNetInputH(valA, valB, wAH, wBH, bH);
        const p = sigmoid(x, temp);
        setStep4Data(prev => ({ ...prev, xH: x, pH: p }));
        setPipelineStage(1);
    };

    // 2. Sample H (P → H)
    const handleStep4_Sample = () => {
        const h = sample(step4Data.pH);
        setStep4Data(prev => ({ ...prev, sampledH: h }));
        flashH(h);
        setPipelineStage(2);
    };

    // 3. Reconstruct (H → AB')
    const handleStep4_Reconstruct = () => {
        const h = step4Data.sampledH;
        // Backwards pass using SAME weights
        const xA = calcNetInputVisible(h, wAH, 0); 
        const xB = calcNetInputVisible(h, wBH, 0);
        const pA = sigmoid(xA, temp);
        const pB = sigmoid(xB, temp);
        
        const rA = sample(pA);
        const rB = sample(pB);
        
        setStep4Data(prev => ({
            ...prev,
            xGenA: xA, xGenB: xB,
            pGenA: pA, pGenB: pB,
            reconA: rA, reconB: rB
        }));

        // Stats Update
        setTotalSamples(prev => prev + 1);
        if (rA === valA && rB === valB) setReconMatchCount(prev => prev + 1);
        
        setPipelineStage(3);
    };

    const runAutoRoundTrip = async () => {
        setIsAutoRun(true);
        const N = 20;
        
        for (let i = 0; i < N; i++) {
            // Internal calc without UI delays
            const x = calcNetInputH(valA, valB, wAH, wBH, bH);
            const p = sigmoid(x, temp);
            const h = sample(p);
            
            const xA = calcNetInputVisible(h, wAH, 0); 
            const xB = calcNetInputVisible(h, wBH, 0);
            const pA = sigmoid(xA, temp);
            const pB = sigmoid(xB, temp);
            
            const rA = sample(pA);
            const rB = sample(pB);
            
            setStep4Data({
                xH: x, pH: p, sampledH: h,
                xGenA: xA, xGenB: xB, pGenA: pA, pGenB: pB,
                reconA: rA, reconB: rB
            });
            
            flashH(h);
            setTotalSamples(prev => prev + 1);
            if (rA === valA && rB === valB) setReconMatchCount(prev => prev + 1);
            
            await new Promise(r => setTimeout(r, 100)); // Fast animation
        }
        
        setPipelineStage(3); // Show final state
        setIsAutoRun(false);
    };

    // Step 3 Logic Check
    useEffect(() => {
        if (step === 3 && totalSamples > 10) {
            if (valA === 1 && valB === 0 && freqH > 0.7) setStep3CondDone(true);
        }
    }, [step, valA, valB, freqH, totalSamples]);

    const step2NeutralDone = step2NeutralSamples >= 20;
    const step2StrongDone = step2StrongSamples >= 20;

    // Rescue Content
    const getRescueContent = (lvl: number): RescueContent => {
        switch(lvl) {
            case 1: return {
                tldr: "H 是'内部原因'。你看不见它，但它决定了 A 和 B 的关系。",
                why: ["如果只有 A 和 B，网络只能死记硬背。", "有了 H，网络可以学会'抽象特征'（比如 H=1 代表'猫来了'）。"],
                io: { in: ["A, B"], out: ["H 的概率"], next: "H 如何被决定" },
                micro: ["H 的状态是不确定的", "我们通过采样来观察 H 的倾向"],
                math: { title: "无公式", desc: "本步主要是观察现象：固定 AB 时 H 依然会跳动。", example: [] },
                faq: [{q: "H 为什么会闪?", a: "因为它是随机更新的。即使概率很高，它也有小几率变 0。"}],
                debug: { check: "统计条是空的?", fix: "点击'自动采样 100 次'。" }
            };
            case 2: return {
                tldr: "H 不是瞎跳的，它受 A 和 B 的'投票'控制。投票越多，变 1 的概率越大。",
                why: ["证明随机性是有规律可循的。", "Sigmoid 函数把'票数'变成了'概率'。"],
                io: { in: ["票数 x"], out: ["概率 P"], next: "权重的作用" },
                micro: ["计算 x = wA*A + wB*B", "P = sigmoid(x)", "采样 H"],
                math: { title: "激活函数", desc: "P = 1/(1+e^-x)", example: ["x=0 (中立) → P=0.5", "x>3 (强烈) → P>0.95"] },
                faq: [{q: "预设是什么意思?", a: "预设只是帮你把权重调到了特定值，方便你观察 x=0 和 x>0 的区别。"}],
                debug: { check: "无法下一步?", fix: "必须完成两个预设的采样任务。" }
            };
            case 3: return {
                tldr: "权重 w 就是'投票权'。把 w 调大，对应的输入对 H 的影响就变大。",
                why: ["这模拟了'学习'的过程：学习就是调整 w。", "如果 w=0，A 就算喊破喉咙 H 也听不见。"],
                io: { in: ["调整 w"], out: ["变化的概率"], next: "重建" },
                micro: ["手动拖动 w 滑块", "观察 P 的变化", "采样验证"],
                math: { title: "加权求和", desc: "x = wA*sA + wB*sB", example: ["wA=3, A=1 → 贡献+3分"] },
                faq: [{q: "为什么要 A=1 B=0?", a: "为了测试单边影响。如果两个都亮，很难分清是谁起的作用。"}],
                debug: { check: "H 没反应?", fix: "确保 A 是 1，然后把 w_AH 拖大。" }
            };
            case 4: return {
                tldr: "如果 H 能把 A 和 B 还原出来，说明 H 确实'听懂'了 A 和 B 的意思。",
                why: ["验证 H 是否有效存储了信息。", "这是'生成模型'的基础：不仅能看，还能造。"],
                io: { in: ["H 的状态"], out: ["重建的 A' B'"], next: "下一关" },
                micro: ["Input → H", "H → Reconstruct Output", "对比 Input 和 Output"],
                math: { title: "双向传播", desc: "P(v|h) 使用同样的 w", example: ["x_vis = w * s_h"] },
                faq: [{q: "重建率低怎么办?", a: "说明权重设置得不好，或者采样次数太少有误差。多跑几次试试。"}],
                debug: { check: "重建率一直 0?", fix: "可能是权重太小。试着把 w 调大，让信号传过去。" }
            };
            default: return { tldr: "", why: [], io: {in:[],out:[],next:""}, micro: [], math: {title:"",desc:"",example:[]}, faq: [], debug: {check:"",fix:""} };
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 relative overflow-hidden font-sans">
            
            {/* --- NAV BAR --- */}
            <LevelNav 
                title="Level 3: 隐变量" 
                subTitle="Hidden Units"
                currentStep={step}
                totalSteps={4}
                onPrevStep={() => { setStep(s => Math.max(1, s-1)); handleResetStats(); }}
                onPrevLevel={onPrevLevel}
                canPrevStep={step > 1}
                canPrevLevel={canPrevLevel}
                onRestart={() => { setStep(1); handleResetStats(); setWAH(2); setWBH(2); setValA(1); setValB(1); setShowIntro(true); setStep2NeutralSamples(0); setStep2StrongSamples(0); setPipelineStage(0); }}
                onOpenMenu={onOpenMenu}
            />

            {/* --- INTRO ROLE CARDS --- */}
            {showIntro && <IntroRoleCards onStart={() => setShowIntro(false)} />}

            {/* --- RESCUE DRAWER --- */}
            {showRescue && (
                <UniversalRescueDrawer 
                    step={step}
                    title="Level 3: 内部世界"
                    content={getRescueContent(step)}
                    onClose={() => setShowRescue(false)}
                />
            )}

            {/* --- MAIN CONTENT GRID (SCROLLABLE) --- */}
            <div className="flex-grow overflow-y-auto pb-48">
                <div className={`grid grid-cols-1 ${step === 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-0 divide-x divide-slate-200 min-h-[500px]`}>
                    
                    {/* COL 1: VISIBLE INPUT (A/B) */}
                    <div className="bg-slate-50 p-6 flex flex-col items-center">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <MousePointerClick size={14}/> 外部现象 (Visible) 
                            {step === 1 && <TermHelp term="visible_units" />}
                        </h3>
                        
                        <div className="flex flex-col gap-6 w-full max-w-[200px]">
                            {[ 
                                { label: '单元 A', val: valA, set: setValA },
                                { label: '单元 B', val: valB, set: setValB }
                            ].map((unit, i) => (
                                <div key={i} className={`p-4 rounded-xl border-2 transition-all duration-300 ${unit.val === 1 ? 'bg-white border-blue-500 shadow-md' : 'bg-slate-100 border-slate-200 opacity-70'} ${step === 4 && pipelineStage > 0 ? 'opacity-50 grayscale' : ''}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-slate-700">{unit.label}</span>
                                        <div className="flex items-center gap-1">
                                            {step === 4 && <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Input</span>}
                                            <span className="font-mono text-xs text-slate-400">{unit.val===1 ? '+1' : '-1'}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { unit.set(v => v===1?0:1); handleResetStats(); }}
                                        disabled={step === 1 || step === 4 || isAutoRun} 
                                        className={`w-full py-3 rounded-lg font-black text-xl transition-transform active:scale-95 ${unit.val === 1 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-500'}`}
                                    >
                                        {unit.val}
                                    </button>
                                </div>
                            ))}
                            
                            {step === 4 && (
                                <div className={`mt-2 text-center text-xs font-bold p-2 rounded border flex items-center justify-center gap-1 transition-colors ${pipelineStage === 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                    <Variable size={12}/>
                                    <TermHelp term="clamp" label={pipelineStage === 0 ? "Ready to Clamp" : "Clamped (固定中)"} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COL 2: CENTER STAGE */}
                    <div className="bg-white p-6 flex flex-col items-center relative z-10">
                        <h3 className="text-xs font-black text-purple-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Cpu size={14}/> 内部原因 (Hidden)
                            {step === 1 && <TermHelp term="hidden_unit" />}
                        </h3>
                        
                        {/* H CARD */}
                        <div className={`w-32 h-40 rounded-2xl border-4 flex flex-col items-center justify-center mb-6 transition-all duration-200 shadow-xl ${
                            valH === 1 
                                ? 'bg-purple-600 border-purple-500 text-white shadow-purple-200' 
                                : 'bg-white border-slate-200 text-slate-300'
                        } ${isHFlashing ? 'scale-105 ring-4 ring-purple-200' : ''}`}>
                            <span className={`text-6xl font-black font-mono ${isHFlashing ? 'animate-pulse' : ''}`}>{valH}</span>
                            <div className={`text-xs font-bold mt-2 uppercase tracking-wider ${valH===1?'text-purple-200':'text-slate-300'}`}>Hidden</div>
                        </div>

                        {/* STEP 4: GUIDED PIPELINE UI */}
                        {step === 4 && (
                            <div className="w-full max-w-sm space-y-4">
                                {/* Alert Banner */}
                                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5"/>
                                    <span className="leading-tight">
                                        <strong>注意：</strong>这是“推断/生成”演示，不是训练。我们不会用概率 P 去算权重 w。权重 w 在这里是固定的。
                                    </span>
                                </div>

                                {/* 3-STEP CARD */}
                                <div className="border-2 border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                                    <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase flex justify-between items-center">
                                        <span>往返实验流水线 (Round Trip)</span>
                                        <TermHelp term="round_trip" />
                                    </div>
                                    
                                    {/* 1. COMPUTE */}
                                    <div className={`p-3 border-b border-slate-100 transition-colors ${pipelineStage===1 ? 'bg-blue-50' : ''}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${pipelineStage >= 1 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                                                <span className="text-xs font-bold text-slate-700">Compute P(H)</span>
                                                <TermHelp term="net_input" />
                                            </div>
                                            {pipelineStage >= 1 && <span className="text-[10px] font-mono text-slate-500">P={(step4Data.pH*100).toFixed(0)}%</span>}
                                        </div>
                                        <button 
                                            onClick={handleStep4_Compute}
                                            disabled={pipelineStage !== 0 || isAutoRun}
                                            className={`w-full py-2 rounded text-xs font-bold transition-all ${pipelineStage === 0 ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm' : 'bg-slate-100 text-slate-400 cursor-default'}`}
                                        >
                                            ① 计算概率 (Input x w)
                                        </button>
                                    </div>

                                    {/* 2. SAMPLE */}
                                    <div className={`p-3 border-b border-slate-100 transition-colors ${pipelineStage===2 ? 'bg-purple-50' : ''}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${pipelineStage >= 2 ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                                                <span className="text-xs font-bold text-slate-700">Sample H</span>
                                                <TermHelp term="sampling" />
                                            </div>
                                            {pipelineStage >= 2 && <span className="text-[10px] font-mono font-bold text-purple-600">H = {step4Data.sampledH}</span>}
                                        </div>
                                        <button 
                                            onClick={handleStep4_Sample}
                                            disabled={pipelineStage !== 1 || isAutoRun}
                                            className={`w-full py-2 rounded text-xs font-bold transition-all ${pipelineStage === 1 ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-md animate-pulse' : 'bg-slate-100 text-slate-400 cursor-default'}`}
                                        >
                                            ② 掷硬币 (Bernoulli)
                                        </button>
                                    </div>

                                    {/* 3. RECONSTRUCT */}
                                    <div className={`p-3 transition-colors ${pipelineStage===3 ? 'bg-orange-50' : ''}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${pipelineStage >= 3 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
                                                <span className="text-xs font-bold text-slate-700">Reconstruct AB'</span>
                                                <TermHelp term="reconstruct" />
                                            </div>
                                            {pipelineStage >= 3 && <span className="text-[10px] font-mono font-bold text-orange-600">AB' = {step4Data.reconA}{step4Data.reconB}</span>}
                                        </div>
                                        <button 
                                            onClick={handleStep4_Reconstruct}
                                            disabled={pipelineStage !== 2 || isAutoRun}
                                            className={`w-full py-2 rounded text-xs font-bold transition-all ${pipelineStage === 2 ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-md animate-pulse' : 'bg-slate-100 text-slate-400 cursor-default'}`}
                                        >
                                            ③ 生成 AB' (Output)
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Auto Run */}
                                <button 
                                    onClick={runAutoRoundTrip}
                                    disabled={isAutoRun}
                                    className="w-full py-3 mt-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                                >
                                    {isAutoRun ? <Activity className="animate-spin" size={16}/> : <FastForward size={16}/>}
                                    自动执行 20 次 (统计重建率)
                                </button>
                                
                                {pipelineStage === 3 && !isAutoRun && (
                                    <button 
                                        onClick={() => setPipelineStage(0)}
                                        className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1"
                                    >
                                        <RefreshCw size={12}/> 重置流程
                                    </button>
                                )}
                            </div>
                        )}

                        {/* VOTING PANEL (Steps 1-3) */}
                        {step < 4 && step >= 2 && (
                            <div className={`w-full max-w-[280px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mb-6 animate-in fade-in slide-in-from-top-4 transition-all duration-300`}>
                                <button 
                                    onClick={() => setShowVotingDetails(!showVotingDetails)}
                                    className="w-full flex justify-between items-center p-4 hover:bg-slate-100 transition-colors group"
                                >
                                    <div className="text-left">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 flex items-center gap-1">
                                            净票数 x <TermHelp term="net_input" />
                                        </div>
                                        <div className="text-xl font-black text-slate-700 font-mono">{netInputH.toFixed(1)}</div>
                                    </div>
                                    <ArrowRight className="text-slate-300 group-hover:text-purple-400 transition-colors" size={20}/>
                                    <div className="text-right">
                                        <div className="text-[10px] text-purple-400 font-bold uppercase mb-0.5 flex items-center justify-end gap-1">
                                            倾向 P <TermHelp term="probability" />
                                        </div>
                                        <div className="text-xl font-black text-purple-600 font-mono">{(probH * 100).toFixed(0)}%</div>
                                    </div>
                                    <div className="ml-2 pl-2 border-l border-slate-200">
                                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${showVotingDetails ? 'rotate-180' : ''}`}/>
                                    </div>
                                </button>
                                
                                {showVotingDetails && (
                                    <div className="bg-slate-100 p-3 space-y-3 text-sm border-t border-slate-200 animate-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">A 的投票 (w·sA)</span>
                                                <span className="font-mono text-slate-700">{wAH.toFixed(1)}×{toMath(valA)} = <strong className={wAH*toMath(valA)>0?'text-emerald-600':'text-red-500'}>{(wAH*toMath(valA)).toFixed(1)}</strong></span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">B 的投票 (w·sB)</span>
                                                <span className="font-mono text-slate-700">{wBH.toFixed(1)}×{toMath(valB)} = <strong className={wBH*toMath(valB)>0?'text-emerald-600':'text-red-500'}>{(wBH*toMath(valB)).toFixed(1)}</strong></span>
                                            </div>
                                        </div>
                                        {step >= 3 && (
                                            <div className="pt-2 border-t border-slate-300/50 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-purple-600 w-16 flex items-center gap-1">
                                                        w_AH <TermHelp term="weight" />
                                                    </span>
                                                    <input type="range" min="-4" max="4" step="0.5" value={wAH} onChange={e => {setWAH(parseFloat(e.target.value)); handleResetStats();}} className="flex-grow h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-purple-600"/>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-purple-600 w-16">w_BH</span>
                                                    <input type="range" min="-4" max="4" step="0.5" value={wBH} onChange={e => {setWBH(parseFloat(e.target.value)); handleResetStats();}} className="flex-grow h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-purple-600"/>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions (Steps 1-3) */}
                        <div className="w-full max-w-[280px] space-y-2 mt-4">
                            {step === 2 && (
                                 <button 
                                    onClick={updateH}
                                    className="w-full py-2 rounded-lg font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Activity size={16}/> 投掷一次硬币
                                </button>
                            )}
                            {step < 4 && (
                                <button 
                                    onClick={batchSampleH}
                                    className={`w-full py-3 rounded-lg font-bold border transition-all active:scale-95 flex items-center justify-center gap-2 ${step === 1 ? 'bg-purple-600 text-white border-purple-500 shadow-md animate-pulse' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <Zap size={16}/> 自动采样 100 次
                                </button>
                            )}
                        </div>
                    </div>

                    {/* COL 3: STATS */}
                    <div className={`bg-slate-50 p-6 flex flex-col`}>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <BarChart3 size={14}/> 
                            {step === 4 ? "重建率统计 (Stats)" : "统计相机 (Stats)"}
                        </h3>
                        
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex-grow flex flex-col justify-center relative min-h-[200px]">
                             {/* Empty State */}
                            {totalSamples === 0 && (
                                <div className="absolute inset-0 z-10 bg-white/95 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                                    <div className="bg-slate-100 p-3 rounded-full mb-3">
                                        <Camera size={24} className="opacity-50"/>
                                    </div>
                                    <p className="font-bold text-sm text-slate-500">还没曝光</p>
                                    <p className="text-xs mt-1">点击“{step===4?'自动执行':'自动采样'}”拍一张底片<br/>看看数据分布</p>
                                </div>
                            )}

                            {step === 4 ? (
                                <div className="flex flex-col gap-4">
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-slate-500 mb-1 flex items-center justify-center gap-1">
                                            重建率 (Reconstruction Rate) <TermHelp term="recon_rate" />
                                        </div>
                                        <div className={`text-4xl font-black mb-2 font-mono ${reconMatchCount/totalSamples > 0.6 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                            {totalSamples === 0 ? 0 : Math.round((reconMatchCount / totalSamples) * 100)}%
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${reconMatchCount/totalSamples > 0.6 ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                                                style={{ width: `${totalSamples===0 ? 0 : (reconMatchCount/totalSamples)*100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-xs border-t pt-4">
                                        <div className="p-2 bg-slate-50 rounded">
                                            <div className="text-slate-400 font-bold mb-1">原始输入 AB</div>
                                            <div className="font-mono font-black text-slate-700 text-lg">{valA}{valB}</div>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded">
                                            <div className="text-slate-400 font-bold mb-1 flex items-center gap-1">
                                                最近 AB'
                                            </div>
                                            <div className={`font-mono font-black text-lg ${pipelineStage === 3 && step4Data.reconA===valA && step4Data.reconB===valB ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {pipelineStage === 3 ? `${step4Data.reconA}${step4Data.reconB}` : "--"}
                                            </div>
                                        </div>
                                        <div className="p-2 bg-emerald-50 rounded text-emerald-800">
                                            Match: <strong>{reconMatchCount}</strong>
                                        </div>
                                        <div className="p-2 bg-slate-100 rounded text-slate-600">
                                            Total: <strong>{totalSamples}</strong>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
                                        重建率高 = H 确实携带了模式<br/>单次不准，看统计。
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">H=1 Count</span>
                                            <span className="text-2xl font-mono font-black text-slate-700">{hOnCount}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                                            <span className="text-2xl font-mono font-black text-slate-400">{totalSamples}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span className="text-slate-600 flex items-center gap-1">
                                                频率 Freq(H=1) <TermHelp term="frequency" />
                                            </span>
                                            <span className="text-purple-600 font-mono">{(freqH*100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${freqH*100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button onClick={handleResetStats} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto mt-4">
                                <RefreshCw size={10}/> 清空统计
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- GUIDE (FIXED COLLAPSIBLE) --- */}
            <div 
                className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center pointer-events-none transition-transform duration-300"
                style={{ transform: isFooterExpanded ? 'translateY(0)' : 'translateY(100%)' }}
            >
                <div className="w-full max-w-4xl relative pointer-events-auto px-4 pb-4">
                    {/* Handle */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-1px] pb-2">
                        <button 
                            onClick={() => setIsFooterExpanded(!isFooterExpanded)}
                            className="bg-slate-900 text-white px-4 py-1.5 rounded-t-xl font-bold text-xs flex items-center gap-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-x border-slate-700 hover:bg-slate-800 transition-colors"
                        >
                            {isFooterExpanded ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
                            {isFooterExpanded ? "收起指引" : "展开任务指引"}
                        </button>
                    </div>

                    <div className="w-full">
                        {step === 1 && (
                            <GuideCard 
                                title="H 的不确定性"
                                purpose="证明 AB 固定时 H 仍可能不唯一（会随机跳），所以需要隐藏单元来记录内部状态。"
                                goal="累计采样 ≥ 100 次"
                                action={
                                    <span>
                                        点击 <TermHelp term="sampling" label="“自动采样 100 次”" /> 按钮
                                    </span>
                                }
                                onNext={() => { setStep(2); handleResetStats(); setShowVotingDetails(false); }}
                                canNext={totalSamples >= 100}
                                onRescue={() => setShowRescue(true)}
                                expandedContent={
                                    <div className="space-y-2">
                                        <p>在本步骤中，你需要理解 <TermHelp term="random_update" label="随机更新" /> 的概念。</p>
                                    </div>
                                }
                            />
                        )}

                        {step === 2 && (
                            <GuideCard 
                                title="H 是怎么更新的？"
                                purpose="证明 H 的随机不是瞎跳，而是被 x 决定方向 (x→P→掷硬币)。"
                                goal="利用预设构造 2 种情况并采样验证"
                                action="点击下方预设，每次点击后再点“自动采样”"
                                demoButtons={
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => { setWAH(0); setWBH(0); setBH(0); handleResetStats(); }}
                                            className={`px-2 py-1 text-xs rounded border ${step2NeutralDone ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white text-slate-600'}`}
                                        >
                                            预设1: 中立 (x=0)
                                        </button>
                                        <button 
                                            onClick={() => { setWAH(2); setWBH(2); setBH(0); handleResetStats(); }}
                                            className={`px-2 py-1 text-xs rounded border ${step2StrongDone ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white text-slate-600'}`}
                                        >
                                            预设2: 强烈 (x&gt;3)
                                        </button>
                                    </div>
                                }
                                extraStatus={
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div className={`p-1 rounded text-center border ${step2NeutralDone ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                            中立样本: {step2NeutralSamples}/20
                                        </div>
                                        <div className={`p-1 rounded text-center border ${step2StrongDone ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                            强烈样本: {step2StrongSamples}/20
                                        </div>
                                    </div>
                                }
                                onNext={() => { setStep(3); handleResetStats(); setWAH(0.5); setWBH(0.5); setValA(1); setValB(0); setShowVotingDetails(true); }}
                                canNext={step2NeutralDone && step2StrongDone}
                                onRescue={() => setShowRescue(true)}
                                expandedContent={
                                    <div>
                                        <p className="font-mono text-emerald-300 mb-1">P(H=1) = sigmoid(x / T)</p>
                                        <div className="flex flex-col gap-1 text-xs">
                                            <span><TermHelp term="sigmoid" label="Sigmoid" /> 函数的作用就是把任意大小的票数 x，压缩到 0~1 之间。</span>
                                            <span><TermHelp term="bias" label="Bias" /> 和 <TermHelp term="temperature" label="温度 T" /> 也会影响这个过程。</span>
                                        </div>
                                    </div>
                                }
                            />
                        )}

                        {step === 3 && (
                            <GuideCard 
                                title="权重 w 的意义"
                                purpose="证明 w 是“因果杠杆/投票权”，决定 A/B 对 H 的影响强度，这也是后面学习要更新的核心量。"
                                goal="调整 w，让 A=1, B=0 时 H 依然大概率变 1"
                                action="把 w_AH 调大 (A的话语权变大)，w_BH 调小 (B的话语权变小)，然后采样验证。"
                                onNext={() => { setStep(4); handleResetStats(); setWAH(3); setWBH(3); setValA(1); setValB(1); setShowVotingDetails(false); setPipelineStage(0); }}
                                canNext={step3CondDone}
                                onRescue={() => setShowRescue(true)}
                                expandedContent={
                                    <div>
                                        理解 <TermHelp term="weight" label="权重 w" /> 和 <TermHelp term="contributions" label="贡献项" /> 是本步的关键。
                                    </div>
                                }
                            />
                        )}

                        {step === 4 && (
                            <GuideCard 
                                title="预告：编码与重建"
                                purpose="验证 H 是否真的“记住”了特征：如果 H 能把 AB 复原，说明它捕捉到了模式。"
                                goal="让重建率 (Reconstruction Rate) 超过 60%"
                                action={
                                    <div className="flex flex-col gap-1">
                                        <div>1. 按顺序完成流水线（Compute → Sample → Reconstruct）感受一次闭环。</div>
                                        <div>2. 点击 <TermHelp term="round_trip" label="“自动执行 20 次”" /> 积累统计数据。</div>
                                    </div>
                                }
                                meaning={
                                    <span>
                                        因为 A/B 与 H 之间有连接权重 w，<strong>同一条连接既用于 AB→H 的更新，也用于 H→AB 的更新</strong>，所以影响是双向的：H 会改变 A/B 变成 1 的倾向（概率）。
                                    </span>
                                }
                                onNext={onComplete}
                                canNext={totalSamples >= 20 && (reconMatchCount/totalSamples) > 0.6}
                                onRescue={() => setShowRescue(true)}
                                expandedContent={
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="font-bold text-slate-400 shrink-0">1. <TermHelp term="clamp" label="Clamp" />:</span>
                                            <span>输入 AB 就像“看到猫的照片”。</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="font-bold text-slate-400 shrink-0">2. <TermHelp term="sampling" label="Sample H" />:</span>
                                            <span>大脑提取特征：“这是猫”。</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="font-bold text-slate-400 shrink-0">3. <TermHelp term="reconstruct" label="Reconstruct" />:</span>
                                            <span>根据 H，反过来计算 <TermHelp term="p_gen" label="P(A'|H)" />，再掷硬币生成 A' B'。</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="font-bold text-slate-400 shrink-0">4. Compare:</span>
                                            <span>看 <TermHelp term="ab_prime" label="A'B'" /> 是否等于原来的 AB。</span>
                                        </div>
                                    </div>
                                }
                            />
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Level3;
