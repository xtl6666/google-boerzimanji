
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Activity, RotateCcw, TrendingUp, Info, 
    Check, X, Lock, ChevronRight, Zap, Snowflake, 
    ArrowRight, Lightbulb, Scale, BarChart3, Microscope, Play, HelpCircle
} from 'lucide-react';
import LevelNav from './LevelNav';
import TermHelp from './TermHelp';
import UniversalRescueDrawer, { RescueContent } from './UniversalRescueDrawer';

// --- MATH & PHYSICS CONSTANTS ---

// 0: 00, 1: 01, 2: 10, 3: 11
type StateIdx = 0 | 1 | 2 | 3;

interface StateDef {
    id: StateIdx;
    labelA: 0 | 1; // UI Display
    labelB: 0 | 1; // UI Display
    sA: -1 | 1;    // Math Calculation
    sB: -1 | 1;    // Math Calculation
    name: string;
}

const STATES: StateDef[] = [
    { id: 0, labelA: 0, labelB: 0, sA: -1, sB: -1, name: '00' }, // Top-Left
    { id: 1, labelA: 0, labelB: 1, sA: -1, sB: 1,  name: '01' }, // Bottom-Left
    { id: 2, labelA: 1, labelB: 0, sA: 1,  sB: -1, name: '10' }, // Top-Right
    { id: 3, labelA: 1, labelB: 1, sA: 1,  sB: 1,  name: '11' }, // Bottom-Right
];

// --- PHYSICS ENGINE (Ising Model) ---

// E = -w * sA * sB - b * (sA + sB)
const calculateEnergy = (idx: number, w: number, b: number) => {
    const s = STATES[idx];
    const coupling = -w * s.sA * s.sB;
    const biasTerm = -b * (s.sA + s.sB);
    return coupling + biasTerm;
};

// Decompose Energy for Step 2 Visualization
const decomposeEnergy = (idx: number, w: number, b: number) => {
    const s = STATES[idx];
    return {
        coupling: -w * s.sA * s.sB,
        biasA: -b * s.sA,
        biasB: -b * s.sB,
        total: calculateEnergy(idx, w, b)
    };
};

// Calculate Barrier: Max Energy on the path from Start to Goal minus Start Energy
// Path 1: Start -> Neighbor1 -> Goal
// Path 2: Start -> Neighbor2 -> Goal
const calculateBarrier = (startIdx: number, goalIdx: number, w: number, b: number) => {
    const startE = calculateEnergy(startIdx, w, b);
    const goalE = calculateEnergy(goalIdx, w, b);
    
    // Neighbors (1-bit flip)
    // 00(0) <-> 01(1), 10(2)
    // 11(3) <-> 01(1), 10(2)
    // If start is 00 and goal is 11, neighbors are 01 and 10.
    
    let paths = [];
    
    // Find neighbors that are 1 bit away from start AND 1 bit away from goal
    // For 2x2, if start!=goal, neighbors are the other two.
    const neighbors = [0, 1, 2, 3].filter(n => n !== startIdx && n !== goalIdx);
    
    for (let nIdx of neighbors) {
        const neighborE = calculateEnergy(nIdx, w, b);
        // Peak is the highest point on this specific path (Start -> Neighbor -> Goal)
        // Usually the neighbor is the peak, but if Goal is higher, Goal is peak (though rare in optimization context)
        const peak = Math.max(startE, neighborE, goalE);
        const barrier = peak - startE;
        paths.push({
            via: nIdx,
            peak,
            barrier,
            neighborE
        });
    }

    // We assume the system takes the EASIEST path (Lowest Barrier)
    paths.sort((a, b) => a.barrier - b.barrier);
    
    return {
        startE,
        goalE,
        bestPath: paths[0], // The recommended path
        barrierHeight: paths[0].barrier
    };
};


// --- SHARED COMPONENTS ---

const GuideCard = ({ step, total, title, goal, action, why, onNext, canNext, expandedContent, hint, onRescue }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-t-2xl sm:rounded-xl shadow-xl border-t border-slate-700 z-30 transition-all duration-300 animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <span className="bg-orange-600 text-white text-xs font-black px-2 py-0.5 rounded shadow-sm ring-1 ring-orange-400">
                        STEP {step}/{total}
                    </span>
                    <h3 className="font-bold text-base text-orange-100">{title}</h3>
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
                        <button onClick={onNext} disabled={!canNext} className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all ${canNext ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                            {canNext ? "完成，下一步" : "请先达成目标"} <ChevronRight size={12}/>
                        </button>
                    )}
                </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm mb-3">
                <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-0.5 tracking-wider">🎯 目标 (Goal)</div>
                    <div className="text-white font-medium leading-tight">{goal}</div>
                </div>
                <div className="bg-orange-900/20 p-2.5 rounded-lg border border-orange-500/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                    <div className="text-orange-300 text-[10px] font-bold uppercase mb-0.5 tracking-wider pl-2">👆 操作 (Do)</div>
                    <div className="text-orange-100 font-medium leading-tight pl-2">{action}</div>
                </div>
                <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-0.5 tracking-wider">👀 观测 (Observe)</div>
                    <div className="text-slate-300 leading-tight">{why}</div>
                </div>
            </div>
            
            <div className="flex flex-col gap-2">
                {hint && <div className="text-xs text-orange-300 font-medium bg-orange-900/30 p-2 rounded border border-orange-500/20">{hint}</div>}
                
                {expandedContent && (
                    <div>
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition-colors mt-2"
                        >
                            <Lightbulb size={12} className={isExpanded ? "text-yellow-400 fill-yellow-400" : ""}/>
                            {isExpanded ? "收起详解" : "💡 原理详解 (点击展开)"}
                        </button>
                        {isExpanded && (
                            <div className="mt-2 bg-slate-800 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 leading-relaxed animate-in fade-in slide-in-from-top-1 space-y-3">
                                {expandedContent}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN LEVEL COMPONENT ---

interface Level2Props {
  onComplete: () => void;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onPrevLevel?: () => void;
  canPrevLevel?: boolean;
  onOpenMenu?: () => void;
}

const Level2: React.FC<Level2Props> = ({ 
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
    
    // Sync step
    useEffect(() => {
        onStepChange?.(step);
    }, [step, onStepChange]);
    
    // Physics Parameters
    const [w, setW] = useState(0);    // Weight
    const [b, setB] = useState(1);    // Bias
    const [temp, setTemp] = useState(0.2); // Temperature
    
    // Simulation State
    const [currState, setCurrState] = useState<StateIdx>(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isAnnealing, setIsAnnealing] = useState(false);
    const [stepsLeft, setStepsLeft] = useState(0);
    
    // Stats & Feedback
    const [stats, setStats] = useState<number[]>([0, 0, 0, 0]);
    const [uphillAttempts, setUphillAttempts] = useState(0);
    const [uphillAccepts, setUphillAccepts] = useState(0);
    const [lastTransition, setLastTransition] = useState<{
        from: StateIdx, 
        to: StateIdx, 
        dE: number, 
        prob: number, 
        accepted: boolean,
        isUphill: boolean,
        timestamp: number
    } | null>(null);

    // Trackers for Progression
    const [maxBarrierSeen, setMaxBarrierSeen] = useState(0);
    const [hasSeenValleyFlip, setHasSeenValleyFlip] = useState(false);
    const [seenHighTempSuccess, setSeenHighTempSuccess] = useState(false);
    const [annealSuccessCount, setAnnealSuccessCount] = useState(0);

    const intervalRef = useRef<number>(0);

    // Fixed Start/Goal for Step 1
    const START_NODE = 0; // 00
    const GOAL_NODE = 3;  // 11

    // Derived Metrics
    const barrierInfo = calculateBarrier(START_NODE, GOAL_NODE, w, b);
    const lowestEnergy = Math.min(...STATES.map(s => calculateEnergy(s.id, w, b)));
    const lowestStates = STATES.filter(s => calculateEnergy(s.id, w, b) === lowestEnergy).map(s => s.id);
    const uphillRate = uphillAttempts === 0 ? 0 : uphillAccepts / uphillAttempts;

    // --- SIMULATION LOOP ---

    const runStep = () => {
        const currentE = calculateEnergy(currState, w, b);
        
        // Pick neighbor (1 bit flip)
        const neighbors = [0, 1, 2, 3].filter(n => n !== currState && (
            (STATES[n].labelA !== STATES[currState].labelA && STATES[n].labelB === STATES[currState].labelB) ||
            (STATES[n].labelA === STATES[currState].labelA && STATES[n].labelB !== STATES[currState].labelB)
        ));
        const nextState = neighbors[Math.floor(Math.random() * neighbors.length)] as StateIdx;
        const nextE = calculateEnergy(nextState, w, b);
        
        const dE = nextE - currentE;
        const isUphill = dE > 0;
        
        // Metropolis
        let prob = 1.0;
        if (isUphill) {
            prob = Math.exp(-dE / temp);
        }
        
        const accepted = Math.random() < prob;

        setLastTransition({
            from: currState,
            to: nextState,
            dE,
            prob,
            accepted,
            isUphill,
            timestamp: Date.now()
        });

        if (isUphill) {
            setUphillAttempts(p => p + 1);
            if (accepted) setUphillAccepts(p => p + 1);
        }

        if (accepted) {
            setCurrState(nextState);
            setStats(p => { const n = [...p]; n[nextState]++; return n; });
        } else {
            setStats(p => { const n = [...p]; n[currState]++; return n; });
        }
    };

    useEffect(() => {
        if (isRunning && stepsLeft > 0) {
            // DYNAMIC SPEED:
            // Step 3 (Stats): Fast (20ms) to reduce waiting time.
            // Step 4 (Annealing): Slow (60ms) to visualize the jumping.
            const tickRate = step === 4 ? 60 : 20;

            intervalRef.current = window.setInterval(() => {
                runStep();
                setStepsLeft(p => p - 1);
                
                if (isAnnealing) {
                    // Very slow cooling to ensure we see the "jumping around" phase
                    setTemp(t => Math.max(0.2, t * 0.99)); 
                }
            }, tickRate); 
        } else if (stepsLeft === 0) {
            setIsRunning(false);
            setIsAnnealing(false);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, stepsLeft, currState, w, b, temp, isAnnealing, step]);

    // Validation Checkers
    useEffect(() => {
        if (step === 1 && barrierInfo.barrierHeight >= 6) setMaxBarrierSeen(barrierInfo.barrierHeight);
        
        if (step === 2 && lowestStates.includes(3) && lowestStates.length === 1) setHasSeenValleyFlip(true);
        if (step === 2 && lowestStates.includes(0) && lowestStates.length === 1) setHasSeenValleyFlip(true); // Works both ways

        // CHANGED: Success if reached state 3 (target) OR (temp is high AND acceptance rate is decent)
        if (step === 3 && (currState === 3 || (temp >= 1.0 && uphillRate > 0.05))) setSeenHighTempSuccess(true);
        
        if (step === 4 && !isRunning && !isAnnealing && stats[3] > 40) setAnnealSuccessCount(stats[3]);
    }, [w, b, temp, step, isRunning, stats, barrierInfo.barrierHeight, currState, uphillRate]);


    // --- VISUALIZATION HELPERS ---
    
    const getBgColor = (idx: number) => {
        const e = calculateEnergy(idx, w, b);
        if (idx === currState) return 'ring-4 ring-blue-500 z-10 shadow-xl scale-105';
        if (lowestStates.includes(idx as StateIdx)) return 'bg-emerald-100 border-emerald-400 shadow-inner'; // Deep Valley
        if (idx === barrierInfo.bestPath.via && step === 1) return 'bg-red-50 border-red-300 ring-4 ring-red-50/50'; // Peak
        if (e < 0) return 'bg-blue-50 border-blue-200';
        return 'bg-slate-100 border-slate-200';
    };

    // Rescue Content
    const getRescueContent = (lvl: number): RescueContent => {
        switch(lvl) {
            case 1: return {
                tldr: "Barrier (能垒) 就是两座山谷之间的那一座高山。w 越大，这座山越高。",
                why: ["如果山太高，小球就翻不过去，会被困在原地。", "这就是'局部最优陷阱'的成因。"],
                io: { in: ["权重 w"], out: ["墙高 Barrier"], next: "调整 Bias" },
                micro: ["起点 E=低", "终点 E=低", "中间点 E=高", "Barrier = 中间点 - 起点"],
                math: { title: "Barrier 计算", desc: "Max(Path) - Start", example: ["Peak=12, Start=-4", "Barrier = 16 (很高!)"] },
                faq: [{q: "为什么中间是红色的?", a: "因为红色代表高能量。在 w>0 时，中间状态(01/10)是不一致的，所以能量高。"}],
                debug: { check: "Barrier 数值不够?", fix: "把 w 往右拖到底，制造最大的阻碍。" }
            };
            case 2: return {
                tldr: "Bias (偏置) 像一个跷跷板，它可以让一边变低，另一边变高。",
                why: ["我们想让 11 成为唯一的最低点。", "Bias 打破了 00 和 11 的对称性。"],
                io: { in: ["偏置 b"], out: ["唯一的谷底"], next: "温度 T" },
                micro: ["b>0 奖励 1", "b<0 奖励 0", "拖动 b 观察谷底(绿色徽章)移动"],
                math: { title: "偏置项", desc: "E_bias = -b * (sA+sB)", example: ["b=1, 11状态 -> -1*(1+1)=-2 (能量降低)"] },
                faq: [{q: "谷底徽章是什么?", a: "代表全图能量最低的状态。我们的目标是让系统停在这里。"}],
                debug: { check: "没有反应?", fix: "拖动 b 滑块，直到绿色'谷底'标签出现在 00 或 11 上。" }
            };
            case 3: return {
                tldr: "温度 T 是'允许犯错'的程度。温度高，可以往山上跑；温度低，只能往山下滚。",
                why: ["如果 T 太低，遇到墙就回头，永远过不去。", "如果 T 够高，就有概率翻过去。"],
                io: { in: ["温度 T"], out: ["翻墙概率"], next: "模拟退火" },
                micro: ["计算 ΔE (墙高)", "计算 P = exp(-ΔE/T)", "掷硬币决定是否翻越"],
                math: { title: "Metropolis 准则", desc: "P = exp(-ΔE/T)", example: ["ΔE=4, T=0.2 -> P≈0", "ΔE=4, T=4 -> P≈0.37"] },
                faq: [{q: "为什么 T 高了反而乱跳?", a: "因为能量低不再是绝对优势了，系统变得'不在乎'好坏，四处游荡。"}],
                debug: { check: "小球不过去?", fix: "把 T 调到最大 (3.0)，然后点击运行。" }
            };
            case 4: return {
                tldr: "模拟退火 = 先加热(翻出陷阱) + 后冷却(落入真理)。",
                why: ["一直高温会乱跳，停不下来。", "一直低温会被困住，动不了。", "结合两者：先热后冷。"],
                io: { in: ["初始 T=3.0"], out: ["最终状态 11"], next: "完成" },
                micro: ["开始 T=3", "每一步 T = T * 0.99", "最后 T -> 0"],
                math: { title: "冷却计划", desc: "T_k = α * T_{k-1}", example: ["T0=3.0", "T1=2.97", "... T300=0.15"] },
                faq: [{q: "为什么最后停住了?", a: "因为温度降到接近0，系统失去了向上跳的能力，只能待在谷底。"}],
                debug: { check: "最后没停在 11?", fix: "多试几次，或者确保前面的 b 已经让 11 成为最低点。" }
            };
            default: return { tldr: "", why: [], io: {in:[],out:[],next:""}, micro: [], math: {title:"",desc:"",example:[]}, faq: [], debug: {check:"",fix:""} };
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 font-sans relative overflow-hidden">
            
            <LevelNav 
                title="Level 2: 翻越能垒"
                subTitle="The Trap"
                currentStep={step}
                totalSteps={4}
                onPrevStep={() => setStep(s => Math.max(1, s-1))}
                onPrevLevel={onPrevLevel}
                onRestart={() => { 
                    setStep(1); 
                    setShowIntro(true);
                    setW(0); setB(1); setTemp(0.2);
                    setCurrState(0);
                    setStats([0,0,0,0]);
                    setUphillAccepts(0);
                    setUphillAttempts(0);
                    setStepsLeft(0);
                    setIsRunning(false);
                    setIsAnnealing(false);
                    // Reset progression trackers
                    setMaxBarrierSeen(0);
                    setHasSeenValleyFlip(false);
                    setSeenHighTempSuccess(false);
                    setAnnealSuccessCount(0);
                }}
                canPrevStep={step > 1}
                canPrevLevel={canPrevLevel}
                onOpenMenu={onOpenMenu}
            />

            {showIntro && (
                <div className="absolute inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95">
                        <div className="flex items-center gap-4 mb-4">
                             <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                <Activity size={24}/>
                             </div>
                             <div>
                                <h2 className="text-xl font-black text-slate-800">Level 2: 翻越能垒</h2>
                                <p className="text-slate-500 text-sm font-bold uppercase">The Trap</p>
                             </div>
                        </div>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            在这一关，我们将深入探究如何制造“陷阱”，以及如何逃离它们。
                            <br/><br/>
                            我们将学习三个关键工具：
                            <br/>1. <strong><TermHelp term="weight" label="权重 w" /></strong> (造墙)
                            <br/>2. <strong><TermHelp term="bias" label="偏好 b" /></strong> (选谷)
                            <br/>3. <strong><TermHelp term="temperature" label="温度 T" /></strong> (翻墙)
                        </p>
                        <button onClick={() => setShowIntro(false)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">
                            开始实验
                        </button>
                    </div>
                </div>
            )}

            {/* --- RESCUE DRAWER --- */}
            {showRescue && (
                <UniversalRescueDrawer 
                    step={step}
                    title="Level 2: 陷阱与逃离"
                    content={getRescueContent(step)}
                    onClose={() => setShowRescue(false)}
                />
            )}

            {/* --- HEADER CONTROLS --- */}
            <div className="bg-white border-b px-4 py-3 shadow-sm z-20 flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-6">
                    {/* W CONTROL */}
                    <div className={`transition-all ${step === 1 ? 'opacity-100 scale-105' : 'opacity-60 grayscale'}`}>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${step===1 ? 'text-orange-600' : 'text-slate-400'}`}>
                            {step === 1 && <span className="animate-pulse">●</span>} <TermHelp term="weight" label="Weight w" />
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="range" min="0" max="8" step="0.5" 
                                value={w} 
                                disabled={step !== 1}
                                onChange={e => setW(parseFloat(e.target.value))}
                                className={`w-20 h-2 rounded-lg appearance-none cursor-pointer ${step===1 ? 'bg-orange-100 accent-orange-600' : 'bg-slate-100'}`}
                            />
                            <span className="font-mono font-bold text-slate-700 w-6">{w}</span>
                        </div>
                    </div>
                    
                    {/* B CONTROL */}
                    <div className={`transition-all ${step === 2 ? 'opacity-100 scale-105' : 'opacity-60 grayscale'}`}>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${step===2 ? 'text-blue-600' : 'text-slate-400'}`}>
                            {step === 2 && <span className="animate-pulse">●</span>} <TermHelp term="bias" label="Bias b" />
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="range" min="-3" max="3" step="1" 
                                value={b} 
                                disabled={step !== 2}
                                onChange={e => setB(parseFloat(e.target.value))}
                                className={`w-20 h-2 rounded-lg appearance-none cursor-pointer ${step===2 ? 'bg-blue-100 accent-blue-600' : 'bg-slate-100'}`}
                            />
                            <span className="font-mono font-bold text-slate-700 w-6">{b}</span>
                        </div>
                    </div>

                    {/* T CONTROL */}
                    <div className={`transition-all ${step >= 3 ? 'opacity-100 scale-105' : 'opacity-60 grayscale'}`}>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${step>=3 ? 'text-purple-600' : 'text-slate-400'}`}>
                            {step >= 3 && <span className="animate-pulse">●</span>} <TermHelp term="temperature" label="Temp T" />
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="range" min="0.2" max="3.0" step="0.2" 
                                value={temp} 
                                disabled={step < 3 || isRunning}
                                onChange={e => setTemp(parseFloat(e.target.value))}
                                className={`w-20 h-2 rounded-lg appearance-none cursor-pointer ${step>=3 ? 'bg-purple-100 accent-purple-600' : 'bg-slate-100'}`}
                            />
                            <span className="font-mono font-bold text-slate-700 w-6">{temp.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        setCurrState(0);
                        setStats([0,0,0,0]);
                        setUphillAccepts(0);
                        setUphillAttempts(0);
                        setStepsLeft(0);
                        setIsRunning(false);
                        setTemp(step >= 3 ? 0.2 : 0.2); // Reset temp only if unlocked
                        if (step === 1) { setW(0); setB(1); }
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                >
                    <RotateCcw size={18}/>
                </button>
            </div>

            {/* --- MAIN SPLIT --- */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden min-h-0">
                
                {/* LEFT: GRID VISUALIZATION */}
                <div className="bg-slate-100/50 p-6 flex flex-col items-center justify-center relative border-r border-slate-200">
                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm aspect-square relative z-10">
                        {STATES.map((s) => {
                            const e = calculateEnergy(s.id, w, b);
                            const isPeak = s.id === barrierInfo.bestPath.via;
                            const isStart = s.id === START_NODE;
                            const isGoal = s.id === GOAL_NODE;
                            const isLowest = lowestStates.includes(s.id);
                            
                            // Visual Path Hints for Step 1
                            let pathLabel = null;
                            if (step === 1) {
                                if (isStart) pathLabel = "Start";
                                if (isGoal) pathLabel = "Goal";
                                if (isPeak) pathLabel = "Peak";
                            }

                            return (
                                <div 
                                    key={s.id}
                                    onClick={() => step === 2 && setCurrState(s.id)}
                                    className={`relative rounded-2xl border-4 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${getBgColor(s.id)}`}
                                >
                                    {/* Ball */}
                                    {currState === s.id && (
                                        <div className="absolute inset-0 flex items-center justify-center z-20">
                                            <div className="w-14 h-14 rounded-full bg-slate-800 shadow-xl border-4 border-white animate-bounce flex items-center justify-center text-white font-black text-lg">
                                                ●
                                            </div>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="text-center z-10">
                                        <div className="text-2xl font-black text-slate-400 font-mono tracking-widest opacity-50 mb-1">{s.name}</div>
                                        <div className={`text-sm font-bold px-2 py-0.5 rounded border ${isLowest ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                                            E = {e}
                                        </div>
                                    </div>
                                    
                                    {/* Badges */}
                                    {pathLabel && (
                                        <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${isPeak ? 'bg-red-500 text-white' : 'bg-slate-600 text-white'}`}>
                                            {pathLabel}
                                        </div>
                                    )}
                                    {step === 2 && isLowest && (
                                        <div className="absolute top-2 right-2 text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Check size={10}/> <TermHelp term="local_minima" label="谷底" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: DASHBOARD PANELS */}
                <div className="bg-white p-6 flex flex-col gap-4 overflow-y-auto">
                    
                    {/* PANEL 1: BARRIER CALCULATION (STEP 1) */}
                    {step === 1 && (
                        <div className="bg-white rounded-xl border-2 border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                                <Scale size={14} className="text-orange-500"/>
                                <span className="text-xs font-black text-slate-600 uppercase">
                                    <TermHelp term="barrier" label="能垒计算 (Barrier)" />
                                </span>
                            </div>
                            <div className="p-4 grid grid-cols-3 gap-2 text-center items-end">
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold">Start (00)</div>
                                    <div className="font-mono font-bold text-slate-600">{barrierInfo.startE}</div>
                                </div>
                                <div className="relative">
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] text-red-500 font-bold whitespace-nowrap">Peak ({STATES[barrierInfo.bestPath.via].name})</div>
                                    <div className="h-12 w-2 bg-red-200 mx-auto rounded-t-sm relative">
                                        <div className="absolute bottom-0 w-full bg-slate-200" style={{ height: '30%' }}></div>
                                    </div>
                                    <div className="font-mono font-black text-red-500 text-lg">{barrierInfo.bestPath.peak}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold">Goal (11)</div>
                                    <div className="font-mono font-bold text-slate-600">{barrierInfo.goalE}</div>
                                </div>
                            </div>
                            <div className="bg-slate-900 text-white p-3 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400">Barrier = Peak - Start</span>
                                <span className={`font-mono font-black text-xl ${barrierInfo.barrierHeight >= 6 ? 'text-emerald-400' : 'text-white'}`}>
                                    {barrierInfo.barrierHeight}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* PANEL 2: ENERGY DECOMPOSITION (STEP 2) */}
                    {step === 2 && (
                        <div className="bg-white rounded-xl border-2 border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right">
                             <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                                <Microscope size={14} className="text-blue-500"/>
                                <span className="text-xs font-black text-slate-600 uppercase">能量分解 ({STATES[currState].name})</span>
                            </div>
                            <div className="p-4 space-y-3">
                                {(() => {
                                    const d = decomposeEnergy(currState, w, b);
                                    return (
                                        <>
                                            <div className="flex justify-between text-xs items-center">
                                                <span className="text-slate-500 font-bold">Coupling (-w·sA·sB)</span>
                                                <span className="font-mono">{d.coupling}</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-orange-400" style={{ width: `${Math.abs(d.coupling/10)*50}%`, marginLeft: d.coupling < 0 ? '50%' : 'auto', marginRight: d.coupling > 0 ? '50%' : 'auto' }}></div>
                                            </div>
                                            
                                            <div className="flex justify-between text-xs items-center">
                                                <span className="text-slate-500 font-bold">Bias Total (-b·sA -b·sB)</span>
                                                <span className="font-mono">{d.biasA + d.biasB}</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                                                 <div className="h-full bg-blue-400" style={{ width: `${Math.abs((d.biasA+d.biasB)/6)*50}%`, marginLeft: (d.biasA+d.biasB) < 0 ? '50%' : 'auto', marginRight: (d.biasA+d.biasB) > 0 ? '50%' : 'auto' }}></div>
                                            </div>

                                            <div className="border-t pt-2 flex justify-between items-center">
                                                <span className="font-bold text-slate-800 text-sm">Total Energy</span>
                                                <span className={`font-mono font-black text-xl ${lowestStates.includes(currState) ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                    {d.total}
                                                </span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {/* PANEL 3: UPHILL STATS (STEP 3 & 4) */}
                    {step >= 3 && (
                        <div className="bg-white rounded-xl border-2 border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BarChart3 size={14} className="text-purple-500"/>
                                    <span className="text-xs font-black text-slate-600 uppercase">门禁统计 (Gatekeeper)</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">T={temp.toFixed(1)}</span>
                            </div>
                            <div className="p-4 grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">Attempts</div>
                                    <div className="font-mono font-bold text-slate-700">{uphillAttempts}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">Accepts</div>
                                    <div className="font-mono font-bold text-emerald-600">{uphillAccepts}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">Rate</div>
                                    <div className={`font-mono font-black text-lg ${uphillRate > 0.1 ? 'text-emerald-500' : 'text-red-400'}`}>
                                        {(uphillRate * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                            
                            {/* LAST TRANSITION MONITOR */}
                            {lastTransition && Date.now() - lastTransition.timestamp < 2000 && (
                                <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-1">
                                    <div className={`text-xs p-2 rounded border flex justify-between items-center ${lastTransition.accepted ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{STATES[lastTransition.from].name} → {STATES[lastTransition.to].name}</span>
                                            <span className="text-[10px] opacity-80">ΔE={lastTransition.dE > 0 ? '+' : ''}{lastTransition.dE}</span>
                                        </div>
                                        <div className="font-black">
                                            {lastTransition.accepted ? "ACCEPTED" : "REJECTED"}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="mt-auto">
                        {step === 3 && (
                            <button 
                                onClick={() => {
                                    setStepsLeft(100); // CHANGED: Reduced steps from 200 to 100 for speed
                                    setIsRunning(true);
                                    setUphillAccepts(0);
                                    setUphillAttempts(0);
                                    setStats([0,0,0,0]);
                                }}
                                disabled={isRunning}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${isRunning ? 'bg-slate-100 text-slate-400' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
                            >
                                {isRunning ? <Activity className="animate-spin"/> : <Play fill="currentColor"/>}
                                {isRunning ? "运行中..." : "运行 100 步"} 
                            </button>
                        )}
                        {step === 4 && (
                            <button 
                                onClick={() => {
                                    setStepsLeft(400); // INCREASED: Allow more time to watch
                                    setTemp(3.0); // START HOT: Ensure jumping happens
                                    setIsRunning(true);
                                    setIsAnnealing(true);
                                    setUphillAccepts(0);
                                    setUphillAttempts(0);
                                    setStats([0,0,0,0]);
                                    setCurrState(0); // Force start at Trap (00)
                                }}
                                disabled={isRunning}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${isRunning ? 'bg-slate-100 text-slate-400' : 'bg-orange-600 text-white hover:bg-orange-500'}`}
                            >
                                {isRunning ? <Snowflake className="animate-spin"/> : <Zap fill="currentColor"/>}
                                {isRunning ? `退火中 T=${temp.toFixed(1)}...` : <TermHelp term="annealing" label="开始模拟退火" />}
                            </button>
                        )}
                    </div>

                </div>

            </div>

            {/* --- GUIDE STEPS --- */}
            
            {step === 1 && (
                <GuideCard 
                    step={1} total={4}
                    title="w 是造墙的 (Barrier)"
                    goal="把 Barrier 调到 ≥ 6"
                    action="向右拖动 Weight 滑块"
                    why="w 越大，A与B不一致的状态 (01/10) 能量越高。中间高了，从起点 (00) 到目标 (11) 必须翻越的墙就越高。"
                    expandedContent={
                        <>
                            <div className="mb-2">
                                <h4 className="font-bold text-orange-200 mb-1">1. 这关在干嘛？(采样 vs 学习)</h4>
                                <p>本关只做“采样”（让状态随机跳变），不涉及更新 w 或 b。目的是理解在固定的物理法则下，系统如何运动。</p>
                            </div>
                            <div className="mb-2">
                                <h4 className="font-bold text-orange-200 mb-1">2. 能量 E 是什么？</h4>
                                <p>E 是“不舒服分”，越低越好。系统天然倾向于待在低能状态。</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-orange-200 mb-1">3. 墙是怎么造出来的？</h4>
                                <p>翻转 1 位必须经过中间态 (01/10)。如果 w=6：</p>
                                <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-400">
                                    <li>不一致态(中间)能量 ≈ +6 (高)</li>
                                    <li>一致态(两边)能量 ≈ -6 (低)</li>
                                    <li>墙高 (Barrier) ≈ 12。这就像平地起了两座大山。</li>
                                </ul>
                                <div className="mt-2 text-orange-300 font-bold">👉 请观察右侧 Barrier 面板的 Peak 数值。</div>
                            </div>
                        </>
                    }
                    onNext={() => { setStep(2); setW(6); setB(0); }} // Force high barrier for next step
                    canNext={barrierInfo.barrierHeight >= 6}
                    onRescue={() => setShowRescue(true)}
                />
            )}

            {step === 2 && (
                <GuideCard 
                    step={2} total={4}
                    title="bias 是选谷的 (Target)"
                    goal="让 '谷底' 徽章翻转到 00 或 11"
                    action="左右拖动 Bias 滑块，点击格子查看能量分解"
                    why="Bias 决定了系统更偏向 0 还是 1。它打破了对称性，决定了最终那个‘最深的山谷’是 00 还是 11。"
                    expandedContent={
                        <div>
                             <h4 className="font-bold text-blue-200 mb-1">0/1 显示 vs ±1 计算</h4>
                             <p className="mb-2">UI为了好懂显示 0/1，但内部计算用 ±1。</p>
                             <div className="bg-slate-900 p-2 rounded font-mono text-[10px] text-emerald-400 mb-2">
                                 映射公式: s = 2x - 1 <br/>
                                 0 → -1, 1 → +1
                             </div>
                             <p><strong>为什么要这样？</strong></p>
                             <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-400">
                                 <li>算一致性更方便：<br/>1×1=1 (同), (-1)×(-1)=1 (同)<br/>1×(-1)=-1 (反)</li>
                             </ul>
                             <div className="mt-2 text-blue-300 font-bold">👉 点击任意格子，查看右侧的能量分解详情。</div>
                        </div>
                    }
                    // CHANGED: Force W to 2.0 (was 2.5) to make Step 3 easier
                    onNext={() => { setStep(3); setB(1); setTemp(0.2); setCurrState(0); setW(2.0); }} 
                    canNext={hasSeenValleyFlip}
                    onRescue={() => setShowRescue(true)}
                />
            )}

            {step === 3 && (
                <GuideCard 
                    step={3} total={4}
                    title="温度 T 是翻墙工具"
                    goal="先低温失败，后高温成功"
                    action="1. T=0.2 运行观察拒绝。 2. T=2.0 运行观察翻越。"
                    why="T 越高，系统对‘上坡’ (ΔE>0) 的容忍度越高。看右侧的门禁统计：高温时 Accept Rate 显著上升，小球成功翻到了目标谷 (11)。"
                    expandedContent={
                        <>
                            <div className="mb-2">
                                <h4 className="font-bold text-purple-200 mb-1">温度不是速度，是“门禁”</h4>
                                <p>每一步都要过安检。下坡(ΔE&lt;0)直接放行，上坡(ΔE&gt;0)要看脸色。</p>
                                <div className="bg-slate-900 p-2 rounded font-mono text-[10px] text-emerald-400 mt-1">
                                    P(放行) = exp(-ΔE / T)
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-purple-200 mb-1">数值例子 (假设 ΔE=3)</h4>
                                <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-400">
                                    <li>T=0.2: P ≈ 0.0000003 (门焊死了，过不去)</li>
                                    <li>T=2.0: P ≈ 0.22 (约22%概率放行)</li>
                                </ul>
                                <div className="mt-2 text-purple-300 font-bold">👉 请观察右侧统计面板的 Rate 变化。</div>
                            </div>
                        </>
                    }
                    // Keep W=2.0 for Step 4 as well
                    onNext={() => { setStep(4); setCurrState(0); setStats([0,0,0,0]); setW(2.0); }}
                    canNext={seenHighTempSuccess}
                    onRescue={() => setShowRescue(true)}
                />
            )}

            {step === 4 && (
                <GuideCard 
                    step={4} total={4}
                    title="退火 = 先翻墙后稳定"
                    goal="点击退火，最终停在目标谷 (11)"
                    action="点击【开始模拟退火】"
                    why="一开始高温乱跳（探索，翻越障碍），后来温度降低，系统逐渐‘冻结’在能量最低的状态（利用，锁定目标）。"
                    expandedContent={
                        <>
                            <div>
                                <h4 className="font-bold text-orange-200 mb-1">探索 (Explore) vs 利用 (Exploit)</h4>
                                <ul className="list-disc pl-4 mt-1 space-y-2 text-slate-400">
                                    <li>
                                        <strong>高温探索：</strong> 
                                        为了不被困在错误的坑里，必须允许犯错（上坡）。先翻过 w 造的高墙。
                                    </li>
                                    <li>
                                        <strong>低温利用：</strong> 
                                        确认翻过来了，就要稳住。降低 T，让系统不再乱跳，老实待在 b 选的深谷里。
                                    </li>
                                </ul>
                                <div className="mt-2 text-orange-300 font-bold">👉 观察左侧小球，看它是否最后稳定停在 11。</div>
                            </div>
                        </>
                    }
                    onNext={onComplete}
                    canNext={annealSuccessCount > 40}
                    onRescue={() => setShowRescue(true)}
                />
            )}

        </div>
    );
};

export default Level2;
