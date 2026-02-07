
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle, Activity, BarChart3, HelpCircle, Play, Pause, ChevronUp, Lightbulb, Dices, Scale, Table, Info } from 'lucide-react';
import LevelNav from './LevelNav';
import UniversalRescueDrawer, { RescueContent } from './UniversalRescueDrawer';

interface Level0Props {
  onComplete: () => void;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onPrevLevel?: () => void;
  canPrevLevel?: boolean;
  onOpenMenu?: () => void;
}

// --- HELPER: Intro Overlay ---
const IntroOverlay = ({ onStart }: { onStart: () => void }) => (
    <div className="absolute inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
             <div className="bg-slate-900 p-6 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                    <Info size={24}/>
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-white">Level 0: 基础校准</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Calibration Bay</p>
                 </div>
             </div>
             
             <div className="p-6 space-y-6">
                 <p className="text-slate-700 text-lg font-medium leading-relaxed">
                     欢迎来到实验室。在开始构建复杂的“猫脑”之前，我们需要先熟悉微观世界的基本物理法则。
                 </p>
                 
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">本章任务 (Mission Objectives)</h4>
                     <ul className="space-y-3">
                        <li className="flex gap-3 text-sm text-slate-700">
                            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                            <span>理解神经元的 <strong>0/1 二值状态</strong> (没有中间态)。</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-700">
                            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                            <span>掌握 <strong>概率 (Probability)</strong> 是如何控制随机性的。</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-700">
                            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                            <span>明白“邻居”和“偏好”是如何<strong>影响决策</strong>的。</span>
                        </li>
                     </ul>
                 </div>
             </div>
             
             <div className="p-6 bg-slate-50 border-t flex justify-end">
                 <button 
                    onClick={onStart} 
                    className="group px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg hover:shadow-xl flex items-center gap-2 transition-all active:scale-95"
                 >
                     <span>开始校准</span>
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                 </button>
             </div>
        </div>
    </div>
);

// --- HELPER: Statistical Tolerance (2.5-sigma) ---
const getTolerance = (p: number, n: number) => {
    if (n <= 0) return 1;
    return Math.max(0.04, 2.5 * Math.sqrt((p * (1 - p)) / n));
};

// --- HELPER: Step Instruction Card ---
const GuideCard = ({ 
    step, totalSteps, title, goal, action, why, hint, onRescue 
}: { 
    step: number, totalSteps: number, title: string, goal: string, action: React.ReactNode, why: string, hint?: string, onRescue?: () => void 
}) => {
    const [showHint, setShowHint] = useState(false);
    return (
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-t-2xl sm:rounded-xl shadow-xl border-t border-slate-700 z-30 transition-all duration-300 animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base text-blue-100">{title}</h3>
                </div>
                {onRescue && (
                    <button 
                        onClick={onRescue}
                        className="text-xs text-blue-400 hover:text-white flex items-center gap-1 transition-colors font-bold px-2 py-1 rounded bg-blue-900/30 hover:bg-blue-600 border border-blue-500/30"
                    >
                        <HelpCircle size={12}/> 我不懂这一步
                    </button>
                )}
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
                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-0.5 tracking-wider">👀 观测 (See)</div>
                    <div className="text-slate-300 leading-tight">{why}</div>
                </div>
            </div>

            {hint && (
                <div className="mt-3 border-t border-slate-700/50 pt-2">
                    <button 
                        onClick={() => setShowHint(!showHint)}
                        className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 font-bold transition-colors"
                    >
                        {showHint ? <ChevronUp size={12}/> : <Lightbulb size={12}/>}
                        {showHint ? "收起详解" : "💡 展开原理解释 (Hint)"}
                    </button>
                    {showHint && <p className="text-xs text-slate-400 mt-2 leading-relaxed animate-in fade-in bg-slate-800 p-2 rounded border border-slate-700">{hint}</p>}
                </div>
            )}
        </div>
    );
};

// --- HELPER: Summary Overlay ---
const SummaryOverlay = ({ 
    title, content, insight, onNext, isLast 
}: { 
    title: string, content: string, insight: string, onNext: () => void, isLast: boolean 
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
                             <Lightbulb size={12}/> 我学到了 (Insight)
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
                     <span>{isLast ? "完成校准，进入 Level 1" : "明白，进入下一节"}</span>
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                 </button>
             </div>
        </div>
    </div>
);


// --- MODULE 0.1: BINARY SWITCH (SIMPLIFIED) ---
const ModuleSwitch = ({ onComplete, onRescue }: { onComplete: () => void, onRescue: () => void }) => {
  const [val, setVal] = useState(0);
  const [toggleCount, setToggleCount] = useState(0);

  const handleSet = (v: number) => {
    if (val !== v) {
        setVal(v);
        setToggleCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (toggleCount >= 3) {
        timer = setTimeout(onComplete, 500);
    }
    return () => clearTimeout(timer);
  }, [toggleCount, onComplete]);

  return (
    <div className="flex flex-col h-full justify-between">
        <div className="flex-grow flex flex-col items-center justify-center gap-10">
            {/* Visual Node */}
            <div className={`w-40 h-40 rounded-full border-8 flex items-center justify-center text-7xl font-black transition-all duration-300 shadow-2xl ${
                val === 1 
                ? 'bg-slate-800 border-slate-600 text-white scale-110' 
                : 'bg-white border-slate-200 text-slate-300'
            }`}>
                {val}
            </div>
            
            {/* Controls */}
            <div className="flex gap-6">
                <button 
                    onClick={() => handleSet(0)}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg border-b-4 transition-all active:scale-95 ${
                        val === 0 ? 'bg-slate-200 border-slate-400 text-slate-500 shadow-inner' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 ring-4 ring-blue-100 hover:ring-blue-300 shadow-lg'
                    }`}
                >
                    设为 0 (关)
                </button>
                <button 
                    onClick={() => handleSet(1)}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg border-b-4 transition-all active:scale-95 ${
                        val === 1 ? 'bg-slate-800 border-slate-900 text-white shadow-inner' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 ring-4 ring-blue-100 hover:ring-blue-300 shadow-lg'
                    }`}
                >
                    设为 1 (开)
                </button>
            </div>
        </div>

        <GuideCard 
            step={1} totalSteps={1}
            title="神经元的状态"
            goal={`切换状态 3 次 (当前: ${toggleCount})`}
            action="点击上面的两个按钮"
            why="观察中间的圆圈。它没有“0.5”或“半亮”的状态，只有彻底的 0 或 1。"
            onRescue={onRescue}
        />
    </div>
  );
};


// --- MODULE 0.2: PROBABILITY & SAMPLING ---
const ModuleProbability = ({ onComplete, onRescue }: { onComplete: () => void, onRescue: () => void }) => {
    const [p, setP] = useState(0.5);
    const [history, setHistory] = useState<number[]>([]);
    const [isFlipping, setIsFlipping] = useState(false);
    const [hasCompleted, setHasCompleted] = useState(false);

    const ones = history.filter(x => x === 1).length;
    const total = history.length;
    const freq = total === 0 ? 0 : ones / total;
    const error = Math.abs(freq - p);
    const tolerance = getTolerance(p, total);
    
    // Check completion
    const isTargetP = p >= 0.75 && p <= 0.85;
    const hasEnoughSamples = total >= 50;
    const isConverged = error < tolerance;
    const isDone = isTargetP && hasEnoughSamples && isConverged;

    // Separate effect to trigger completion state, independent of timer
    useEffect(() => {
        if (isDone && !isFlipping && !hasCompleted) {
            setHasCompleted(true);
        }
    }, [isDone, isFlipping, hasCompleted]);

    // Separate effect to handle transition, so updates don't cancel timer
    useEffect(() => {
        if (hasCompleted) {
            const timer = setTimeout(onComplete, 1000);
            return () => clearTimeout(timer);
        }
    }, [hasCompleted, onComplete]);

    const flip = (count: number) => {
        if (hasCompleted) return;
        setIsFlipping(true);
        const newResults: number[] = [];
        for(let i=0; i<count; i++) newResults.push(Math.random() < p ? 1 : 0);
        setTimeout(() => {
            setHistory(prev => [...prev, ...newResults]);
            setIsFlipping(false);
        }, 400);
    };

    return (
        <div className="flex flex-col h-full justify-between">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-4">
                {/* Left: Controls */}
                <div className="flex flex-col items-center gap-8">
                     <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl font-black shadow-lg transition-transform duration-300 ${isFlipping ? 'rotate-[360deg] scale-90' : ''} ${
                        history.length > 0 && history[history.length-1] === 1 ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-300 border-slate-200'
                    }`}>
                        {history.length > 0 ? history[history.length-1] : '?'}
                    </div>

                    <div className={`w-full max-w-xs space-y-2 p-4 rounded-xl transition-all ${!hasEnoughSamples ? 'bg-blue-50 ring-4 ring-blue-100' : ''}`}>
                        <div className="flex justify-between text-sm font-bold text-slate-600">
                            <span>设定概率 P(1)</span>
                            <span className={isTargetP ? 'text-emerald-600' : ''}>{p.toFixed(2)}</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.05" 
                            value={p} onChange={(e) => { setP(parseFloat(e.target.value)); setHistory([]); }}
                            className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            disabled={isFlipping}
                        />
                        {!isTargetP && <div className="text-xs text-orange-500 font-bold">🎯 任务：请把 P 调到 0.8 左右</div>}
                    </div>

                    <div className="flex gap-2">
                        <button disabled={isFlipping} onClick={() => flip(10)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 font-bold text-slate-500 active:scale-95 disabled:opacity-50">掷 10 次</button>
                        <button disabled={isFlipping} onClick={() => flip(50)} className={`px-6 py-2 rounded-lg shadow-md text-white font-bold active:scale-95 disabled:opacity-50 transition-all ${
                            isTargetP ? 'bg-blue-600 hover:bg-blue-500 ring-4 ring-blue-200 animate-pulse' : 'bg-slate-400'
                        }`}>
                            掷 50 次
                        </button>
                    </div>
                </div>

                {/* Right: Stats */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center h-full max-h-[300px]">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <BarChart3 size={18}/> 统计结果
                    </h3>
                    <div className="space-y-6">
                        <div className="flex justify-between text-sm border-b pb-2">
                            <span className="text-slate-500">总投掷次数 (Samples)</span>
                            <span className="font-mono font-bold text-lg">{total}</span>
                        </div>
                        
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">实际出现 1 的频率</span>
                                <span className={`font-mono font-bold text-lg ${isConverged ? 'text-emerald-600' : 'text-slate-700'}`}>
                                    {freq.toFixed(2)}
                                </span>
                            </div>
                            {/* Tolerance Bar */}
                            <div className="h-6 bg-slate-200 rounded-full overflow-hidden relative border border-slate-300">
                                {/* Safe Zone */}
                                <div 
                                    className="absolute top-0 bottom-0 bg-emerald-100/50 border-x border-emerald-300 transition-all duration-500" 
                                    style={{ 
                                        left: `${Math.max(0, (p - tolerance) * 100)}%`, 
                                        width: `${Math.min(1, tolerance * 2) * 100}%` 
                                    }}
                                />
                                {/* Target Line */}
                                <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10" style={{ left: `${p * 100}%` }} />
                                {/* Actual Value */}
                                <div className={`absolute top-1.5 bottom-1.5 w-3 h-3 rounded-full -ml-1.5 z-20 transition-all duration-500 shadow-sm border border-white ${isConverged ? 'bg-emerald-500' : 'bg-slate-500'}`} style={{ left: `${freq * 100}%` }} />
                            </div>
                            <div className="text-[10px] text-slate-400 mt-2 text-center">
                                {isConverged ? <span className="text-emerald-600 font-bold">✅ 频率符合预期 (在绿色误差带内)</span> : "⏳ 样本越少波动越大，请继续投掷..."}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <GuideCard 
                step={1} totalSteps={1}
                title="概率与采样"
                goal="P设为0.8，投掷50次以上"
                action="调整滑块，然后疯狂点击'掷 50 次'"
                why="P 只是一个'倾向'。结果是随机的，但如果你试很多次，实际频率就会落入'合理波动带'（绿色区域）。"
                hint="这就是大数定律。在玻尔兹曼机里，所有的状态都是'跳'出来的，但跳的概率是由物理法则严格控制的。"
                onRescue={onRescue}
            />
        </div>
    );
};


// --- MODULE 0.3: PROBABILITY CONVERTER (SIGMOID) ---
const ModuleProbabilityConverter = ({ onComplete, onRescue }: { onComplete: () => void, onRescue: () => void }) => {
    const [step, setStep] = useState(1);
    const [x, setX] = useState(0); 
    const [history, setHistory] = useState<number[]>([]);
    const [showFormula, setShowFormula] = useState(false);
    const [transitionTrigger, setTransitionTrigger] = useState<number | null>(null);
    
    // Logic: x -> p
    const p = 1 / (1 + Math.exp(-x));
    
    // Stats
    const ones = history.filter(v => v===1).length;
    const total = history.length;
    const freq = total === 0 ? 0 : ones / total;
    const tolerance = getTolerance(p, total);
    const error = Math.abs(freq - p);

    const flip = (count: number) => {
        const newResults: number[] = [];
        for(let i=0; i<count; i++) newResults.push(Math.random() < p ? 1 : 0);
        setHistory(prev => [...prev, ...newResults]);
    };

    // Force clear history when entering Step 2 or 3
    useEffect(() => {
        if (step === 2 || step === 3) {
            setHistory([]);
        }
    }, [step]);

    // Timer Effect
    useEffect(() => {
        if (transitionTrigger === 3) {
            const t = setTimeout(() => { setStep(3); setTransitionTrigger(null); }, 1000);
            return () => clearTimeout(t);
        }
        if (transitionTrigger === 4) {
            const t = setTimeout(() => { setStep(4); setShowFormula(true); setTransitionTrigger(null); }, 1000);
            return () => clearTimeout(t);
        }
    }, [transitionTrigger]);

    // Check Logic
    useEffect(() => {
        // Prevent re-triggering if already transitioning
        if (transitionTrigger) return;

        if (step === 2 && total >= 20 && ones >= 12) {
            setTransitionTrigger(3);
        }
        else if (step === 3 && total >= 100 && error < tolerance) {
            setTransitionTrigger(4);
        }
    }, [step, total, ones, error, tolerance, transitionTrigger]);

    const mapX = (v: number) => ((v + 6) / 12) * 200;
    const mapY = (v: number) => 120 - (v * 120);

    return (
        <div className="flex flex-col h-full justify-between relative">
            {step === 4 && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm animate-in fade-in">
                    <button
                        onClick={onComplete}
                        className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:bg-blue-50 animate-bounce active:scale-95 flex items-center gap-2 ring-4 ring-blue-200"
                    >
                        <CheckCircle size={28}/>
                        <span>明白了，完成本节</span>
                        <ArrowRight />
                    </button>
                </div>
            )}

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-4">
                {/* Left: Interactive Controls */}
                <div className="flex flex-col gap-8 w-full max-w-sm mx-auto">
                     {/* The "Knob" */}
                     <div className={`bg-slate-50 p-6 rounded-2xl border transition-all duration-500 ${step === 1 ? 'ring-4 ring-blue-400 border-blue-500 shadow-xl bg-white' : ''}`}>
                         <div className="flex justify-between items-center mb-4">
                             <span className="font-bold text-slate-700 text-lg">🎛️ 倾向打分 (Score x)</span>
                             <span className="font-mono font-bold text-slate-500">{x.toFixed(1)}</span>
                         </div>
                         <input 
                            type="range" min="-6" max="6" step="0.5" 
                            value={x} 
                            onChange={e => { 
                                const val = parseFloat(e.target.value);
                                setX(val); 
                                // Only transition if we are in step 1 and meet criteria
                                if(step===1 && val > 2) {
                                    // Use a timeout to prevent instant jump, give user time to see
                                    setTimeout(() => setStep(2), 500); 
                                }
                            }} 
                            className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                            disabled={step !== 1 && step !== 4}
                         />
                         <div className="flex justify-between text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-wider">
                             <button onClick={() => {setX(-2); setHistory([]);}} disabled={step!==1} className="hover:text-blue-500 cursor-pointer text-left">想当 0<br/>(x=-2)</button>
                             <button onClick={() => {setX(0); setHistory([]);}} disabled={step!==1} className="hover:text-blue-500 cursor-pointer text-center">中立<br/>(x=0)</button>
                             <button onClick={() => {setX(2); setHistory([]); if(step===1) setTimeout(() => setStep(2), 500);}} disabled={step!==1} className="hover:text-blue-500 cursor-pointer text-right">想当 1<br/>(x=2)</button>
                         </div>
                     </div>

                     {/* The "Sampler" */}
                     <div className={`p-6 rounded-2xl border text-center transition-all ${step === 2 || step === 3 ? 'ring-4 ring-blue-400 border-blue-500 shadow-xl bg-white' : 'bg-slate-50 opacity-80'}`}>
                         <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between px-4">
                             <span>当前概率 P(1)</span>
                             <span className="font-mono text-blue-600">{p.toFixed(3)}</span>
                         </div>
                         <div className="flex gap-3 justify-center">
                             <button 
                                onClick={() => flip(20)} 
                                disabled={step !== 2}
                                className={`flex-1 py-3 rounded-xl font-bold shadow-sm transition-all ${step === 2 ? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95 animate-pulse' : 'bg-slate-200 text-slate-400'}`}
                             >
                                 试 20 次
                             </button>
                             <button 
                                onClick={() => flip(50)} 
                                disabled={step !== 3}
                                className={`flex-1 py-3 rounded-xl font-bold shadow-sm transition-all ${step === 3 ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 animate-pulse' : 'bg-slate-200 text-slate-400'}`}
                             >
                                 试 100 次
                             </button>
                         </div>
                         <div className="mt-4 flex justify-between text-xs text-slate-400 px-2">
                             <span>{history.slice(-10).join('')}...</span>
                             <span>Total: {total}</span>
                         </div>
                     </div>
                </div>

                {/* Right: Visualization */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-full flex flex-col items-center justify-center relative min-h-[300px]">
                     {/* SVG GRAPH */}
                     <div className="relative border-b border-l border-slate-300 w-[240px] h-[140px]">
                         <svg width="240" height="140" className="overflow-visible">
                             <defs>
                                 <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
                                     <stop offset="0%" stopColor="#94a3b8" />
                                     <stop offset="100%" stopColor="#3b82f6" />
                                 </linearGradient>
                             </defs>
                             {/* Curve */}
                             <path d={Array.from({length:40},(_,i)=>{
                                 const sx = -6+(i/39)*12; 
                                 return `${i===0?'M':'L'} ${mapX(sx)*1.2} ${mapY(1/(1+Math.exp(-sx)))}`
                             }).join(' ')} fill="none" stroke="url(#curveGrad)" strokeWidth="4" strokeLinecap="round"/>
                             
                             {/* Active Point */}
                             <circle cx={mapX(x)*1.2} cy={mapY(p)} r="8" fill="white" stroke="#3b82f6" strokeWidth="3" className="transition-all duration-300 shadow-md"/>
                         </svg>
                     </div>

                     <div className="mt-8 w-full space-y-3">
                         <div className="flex justify-between items-center p-3 bg-white rounded-lg border shadow-sm">
                             <span className="text-sm font-bold text-slate-600">理论概率 P</span>
                             <span className="font-mono font-black text-blue-600 text-xl">{p.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-white rounded-lg border shadow-sm">
                             <span className="text-sm font-bold text-slate-600">实际频率 ({total}次)</span>
                             <span className={`font-mono font-black text-xl transition-colors duration-300 ${error < tolerance ? 'text-emerald-500' : 'text-slate-400'}`}>{freq.toFixed(2)}</span>
                         </div>
                     </div>

                     {/* The Reveal */}
                     {showFormula && (
                         <div className="absolute top-4 inset-x-4 bg-yellow-50 text-yellow-900 border border-yellow-200 p-3 rounded-xl shadow-lg animate-in fade-in zoom-in-95">
                             <div className="text-xs font-bold uppercase tracking-wider mb-1 text-yellow-600">Name Revealed</div>
                             <div className="font-bold text-sm">这条转换函数叫 Sigmoid</div>
                             <div className="font-mono text-xs mt-1 bg-yellow-100/50 p-1 rounded inline-block">p = 1 / (1 + e^(-x))</div>
                         </div>
                     )}
                </div>
            </div>

            {/* Narrative Controller */}
            {step === 1 && (
                <GuideCard 
                    step={1} totalSteps={4}
                    title="控制倾向 (Score)"
                    goal="把概率 P 调到 > 0.85"
                    action="向右拖动滑块，增加 x 分数"
                    why="x 是'得分'。分数越高，变成 1 的概率就越大。分数越低，越想变成 0。"
                    hint="试着点一下滑块下方的快捷按钮，感受 -2, 0, 2 对应的概率变化。"
                    onRescue={onRescue}
                />
            )}
            {step === 2 && (
                <GuideCard 
                    step={2} totalSteps={4}
                    title="验证概率 (Small Sample)"
                    goal="投掷 20 次，确认 1 出现的次数更多"
                    action="点击'试 20 次'按钮"
                    why="概率是 88% 不代表每次都是 1。你会看到偶尔出现几个 0，这是正常的随机波动。"
                    onRescue={onRescue}
                />
            )}
             {step === 3 && (
                <GuideCard 
                    step={3} totalSteps={4}
                    title="消除波动 (Large Sample)"
                    goal="投掷 100 次，让频率稳定下来"
                    action="点击'试 100 次'按钮"
                    why="样本量越大，实际频率就越接近理论概率。误差会自然缩小。"
                    onRescue={onRescue}
                />
            )}
            {step === 4 && (
                <GuideCard 
                    step={4} totalSteps={4}
                    title="完成：概率转换器"
                    goal="理解流程：打分 -> 概率 -> 采样"
                    action="点击屏幕中央的蓝色按钮"
                    why="在神经网络中，每个神经元都有一台这样的转换器。它把周围传来的信号算出总分 x，然后通过 Sigmoid 变成概率，最后决定自己是亮还是灭。"
                    onRescue={onRescue}
                />
            )}
        </div>
    );
};

// --- MODULE 0.4: NEIGHBOR INFLUENCE ---
const ModuleNeighborInfluence = ({ onComplete, onRescue }: { onComplete: () => void, onRescue: () => void }) => {
    // State
    const [step, setStep] = useState(1);
    const [quizPhase, setQuizPhase] = useState<'none' | 'initial' | 'switch'>('initial');
    const [showMapping, setShowMapping] = useState(false);
    const [transitionTrigger, setTransitionTrigger] = useState<string | null>(null);
    
    // Params
    const [sB, setSB] = useState(1); // Neighbor (0 or 1)
    const [w, setW] = useState(2);   // Preference (Weight)
    const [sA, setSA] = useState(0); // Me (0 or 1)
    
    // Physics / Scenario Logic
    // Cost (Uncomfort) = -w * sB * sA
    const cost0 = 0;
    const cost1 = -w * sB;
    const scoreX = cost0 - cost1; // Benefit of 1 over 0
    const pA = 1 / (1 + Math.exp(-scoreX));

    // Stats
    const [history, setHistory] = useState<number[]>([]);
    const [isAuto, setIsAuto] = useState(false);
    const intervalRef = useRef<number>(0);
    const [pHigh, setPHigh] = useState<number | null>(null);

    // Auto Loop
    const updateA = () => {
        const nextA = Math.random() < pA ? 1 : 0;
        setSA(nextA);
        setHistory(prev => [...prev.slice(-29), nextA]); 
    };

    useEffect(() => {
        if (isAuto) {
            intervalRef.current = window.setInterval(updateA, 200); 
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isAuto, pA]);

    const freqA = history.length === 0 ? 0 : history.filter(v => v===1).length / history.length;

    // --- STEP TRANSITION TIMERS ---
    useEffect(() => {
        if (transitionTrigger === 'step2') {
             const t = setTimeout(() => { setStep(3); setTransitionTrigger(null); }, 800);
             return () => clearTimeout(t);
        }
        if (transitionTrigger === 'step3') {
             const t = setTimeout(() => { 
                 setIsAuto(false); 
                 setQuizPhase('switch'); 
                 setStep(4); 
                 setHistory([]); 
                 setTransitionTrigger(null); 
             }, 1500);
             return () => clearTimeout(t);
        }
        if (transitionTrigger === 'step4') {
             const t = setTimeout(onComplete, 2000);
             return () => clearTimeout(t);
        }
    }, [transitionTrigger, onComplete]);

    // --- STEP CONDITION CHECKERS ---
    useEffect(() => {
        if (transitionTrigger) return; // Locked

        if (step === 2 && pA > 0.8) {
            setTransitionTrigger('step2');
        }
        if (step === 3 && isAuto && history.length >= 30 && freqA > 0.7) {
             setPHigh(pA); // Safe to record here
             setTransitionTrigger('step3');
        }
        if (step === 4 && quizPhase === 'none' && sB === 0 && pHigh !== null) {
            const pNow = pA; 
            if (Math.abs(pNow - 0.5) < 0.1 && history.length >= 20 && Math.abs(freqA - 0.5) < 0.25) {
                setTransitionTrigger('step4');
            }
        }
    }, [step, pA, isAuto, history.length, freqA, quizPhase, sB, pHigh, transitionTrigger]);


    return (
         <div className="flex flex-col h-full justify-between relative">
             
             {/* --- PREDICTION QUIZ MODALS --- */}
             {quizPhase !== 'none' && (
                 <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                     <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                         <div className="text-4xl mb-4">🤔</div>
                         <h3 className="text-lg font-bold text-slate-800 mb-2">先猜后做 (Prediction)</h3>
                         
                         {quizPhase === 'initial' && (
                            <>
                             <p className="text-slate-600 mb-6 text-sm text-left bg-slate-50 p-3 rounded-lg border">
                                <strong>场景：</strong><br/>
                                同桌 B 坐在右边 (B=1)。<br/>
                                你很喜欢同桌 (偏好 w = +2)。<br/>
                                <strong>问题：</strong><br/>
                                你(A)会更倾向于坐左边(0)还是右边(1)？
                             </p>
                             <div className="grid gap-3">
                                 <button 
                                    onClick={() => { 
                                        setStep(2); 
                                        setQuizPhase('none'); 
                                        setW(0); // RESET w to 0 to force user interaction
                                    }} 
                                    className="py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-200 transition-transform active:scale-95"
                                 >
                                     坐右边 (1) - 靠近同桌
                                 </button>
                                 <button 
                                    onClick={() => { 
                                        setStep(2); 
                                        setQuizPhase('none'); 
                                        setW(0); // RESET w to 0
                                    }} 
                                    className="py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-transform active:scale-95"
                                 >
                                     坐左边 (0) - 远离同桌
                                 </button>
                             </div>
                            </>
                         )}

                         {quizPhase === 'switch' && (
                            <>
                             <p className="text-slate-600 mb-6 text-sm text-left bg-slate-50 p-3 rounded-lg border">
                                <strong>场景变化：</strong><br/>
                                现在把同桌 B 赶走 (设为 0)。<br/>
                                <strong>问题：</strong><br/>
                                你(A)坐在右边(1)的概率 P(1) 会发生什么变化？
                             </p>
                             <div className="grid gap-3">
                                 <button onClick={() => setQuizPhase('none')} className="py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-transform active:scale-95">变大 (更想坐右边)</button>
                                 <button onClick={() => setQuizPhase('none')} className="py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-200 transition-transform active:scale-95">变小 (回到中立 0.5)</button>
                                 <button onClick={() => setQuizPhase('none')} className="py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-transform active:scale-95">不变</button>
                             </div>
                            </>
                         )}
                     </div>
                 </div>
             )}

             <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch p-4">
                 {/* LEFT: SCENE & CONTROLS */}
                 <div className="flex flex-col gap-6 relative">
                     {/* 1. MAPPING TOGGLE */}
                     <div className="absolute top-0 right-0 z-20">
                         <button 
                            onClick={() => setShowMapping(!showMapping)}
                            className="text-[10px] font-bold bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 px-2 py-1 rounded flex items-center gap-1 border transition-colors"
                         >
                             <Table size={12}/> {showMapping ? "收起映射表" : "显示公式类比"}
                         </button>
                         {showMapping && (
                             <div className="absolute right-0 top-full mt-2 w-64 bg-white p-3 rounded-xl shadow-xl border border-slate-200 text-xs z-30 animate-in fade-in zoom-in-95 origin-top-right">
                                 <div className="grid grid-cols-2 gap-y-2">
                                     <div className="font-bold text-slate-400">场景概念</div>
                                     <div className="font-bold text-slate-400">数学/物理</div>
                                     <div>不舒服程度</div>
                                     <div className="font-mono text-slate-600">Energy / Cost</div>
                                     <div>偏好强度</div>
                                     <div className="font-mono text-slate-600">Weight (w)</div>
                                     <div>对比后的优势</div>
                                     <div className="font-mono text-slate-600">Score (x)</div>
                                     <div>犹豫/随机选</div>
                                     <div className="font-mono text-slate-600">Sampling</div>
                                 </div>
                             </div>
                         )}
                     </div>

                     {/* 2. THE SCENE VISUALIZATION */}
                     <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex-grow flex flex-col items-center justify-center relative">
                         {/* Connection Pipe */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-4 bg-slate-200 rounded-full overflow-hidden">
                             <div 
                                className={`h-full transition-all duration-300 ${w > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                                style={{ width: '100%', opacity: Math.abs(w)/4 }}
                             />
                         </div>

                         <div className="flex justify-between w-full max-w-xs relative z-10">
                             {/* Neighbor B */}
                             <div className="flex flex-col items-center gap-3">
                                 <button 
                                    onClick={() => step === 4 && setSB(prev => prev===1 ? 0 : 1)}
                                    disabled={step !== 4}
                                    className={`w-20 h-20 rounded-2xl border-4 font-black text-2xl flex items-center justify-center transition-all shadow-lg ${
                                        sB === 1 
                                        ? 'bg-slate-800 text-white border-slate-600 scale-105' 
                                        : 'bg-white text-slate-300 border-slate-200'
                                    } ${step === 4 ? 'cursor-pointer hover:ring-4 hover:ring-blue-200' : 'cursor-not-allowed'}`}
                                 >
                                     {sB}
                                 </button>
                                 <div className="text-center">
                                     <div className="font-bold text-slate-700 text-sm">同桌 B</div>
                                     <div className="text-[10px] text-slate-400 font-bold">{sB===1 ? "在右边(1)" : "不在/在左(0)"}</div>
                                 </div>
                             </div>

                             {/* Weight Label */}
                             <div className="self-center bg-white px-3 py-1 rounded-full shadow border border-slate-100 flex flex-col items-center">
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">Preference</span>
                                 <span className={`font-mono font-bold ${w>0?'text-emerald-500':w<0?'text-red-500':'text-slate-400'}`}>w={w}</span>
                             </div>

                             {/* Me A */}
                             <div className="flex flex-col items-center gap-3">
                                 <div className={`w-20 h-20 rounded-full border-4 font-black text-2xl flex items-center justify-center transition-all shadow-lg ${
                                     sA === 1 
                                     ? 'bg-blue-600 text-white border-blue-700' 
                                     : 'bg-white text-slate-300 border-slate-200'
                                 }`}>
                                     {sA}
                                 </div>
                                 <div className="text-center">
                                     <div className="font-bold text-blue-600 text-sm">我 (A)</div>
                                     <div className="text-[10px] text-slate-400 font-bold">{sA===1 ? "选右边(1)" : "选左边(0)"}</div>
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* 3. CONTROLS */}
                     <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 relative">
                         {/* Weight Slider */}
                         <div className={`transition-all relative ${step === 2 ? 'ring-4 ring-blue-400 rounded-xl bg-blue-50/50 p-1 scale-105 z-20 shadow-xl' : 'opacity-80'}`}>
                             <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                                 <span>偏好强度 (w)</span>
                                 <span>{w > 0 ? "喜欢靠近 (+)" : (w < 0 ? "讨厌靠近 (-)" : "无所谓 (0)")}</span>
                             </div>
                             <input 
                                type="range" min="-4" max="4" step="0.5" 
                                value={w} 
                                disabled={step !== 2}
                                onChange={e => setW(parseFloat(e.target.value))} 
                                className={`w-full h-3 rounded-lg appearance-none cursor-pointer ${w>0?'accent-emerald-500':'accent-red-500'}`}
                            />
                         </div>

                         {/* Auto Run Button */}
                         <div className={`transition-all ${step === 3 || (step === 4 && sB === 0) ? 'ring-4 ring-blue-100 rounded-xl' : ''}`}>
                             <button 
                                onClick={() => setIsAuto(!isAuto)} 
                                disabled={step < 3}
                                className={`w-full py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 transition-all border ${
                                    isAuto 
                                        ? 'bg-orange-50 text-orange-600 border-orange-200 animate-pulse' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                } ${step === 3 && !isAuto ? 'ring-2 ring-blue-500 animate-bounce' : ''}`}
                             >
                                {isAuto ? <Pause size={16}/> : <Play size={16}/>}
                                {isAuto ? "正在连续掷硬币..." : "自动更新 30 次"}
                             </button>
                         </div>
                     </div>
                 </div>

                 {/* RIGHT: THE 3-STAGE PIPELINE */}
                 <div className="flex flex-col gap-3 h-full">
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">决策流水线 (Pipeline)</div>
                     
                     {/* STAGE 1: COMPARE */}
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex-1 flex flex-col justify-center">
                         <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
                         <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                             <Scale size={14}/> 1. 对比不舒服程度 (Cost)
                         </h4>
                         
                         <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                             <div className={`p-2 rounded border text-center ${sA===0 ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-100 opacity-50'}`}>
                                 <div className="font-bold text-slate-500">若选左边 (0)</div>
                                 <div className="font-mono mt-1 text-slate-400">Cost = 0</div>
                             </div>
                             <div className={`p-2 rounded border text-center ${sA===1 ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-100 opacity-50'}`}>
                                 <div className="font-bold text-blue-600">若选右边 (1)</div>
                                 <div className="font-mono mt-1 text-slate-600">{(-1 * w * sB).toFixed(1)}</div>
                             </div>
                         </div>
                         
                         <div className="text-center">
                             <span className="text-xs font-bold text-slate-400 mr-2">优势 (Score):</span>
                             <span className={`font-mono font-black text-lg ${scoreX > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                 {scoreX > 0 ? '+' : ''}{scoreX.toFixed(1)}
                             </span>
                             <div className="text-[10px] text-emerald-600 font-bold">
                                 {scoreX > 0 ? "选 1 更舒服！" : (scoreX < 0 ? "选 0 更舒服！" : "没区别")}
                             </div>
                         </div>
                     </div>

                     {/* STAGE 2: CONVERT */}
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex-1 flex flex-col justify-center">
                         <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                         <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                             <Activity size={14}/> 2. 转化为概率 (Prob)
                         </h4>
                         
                         <div className="flex items-center justify-between mb-2">
                             <span className="text-xs text-slate-500">P(选右边)</span>
                             <span className="font-mono font-black text-2xl text-blue-600">{(pA*100).toFixed(0)}%</span>
                         </div>
                         
                         <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex relative">
                             <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${pA*100}%` }}></div>
                             {/* Marker for 0.5 */}
                             <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50 z-10"></div>
                         </div>
                         <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                             <span>0%</span>
                             <span>50%</span>
                             <span>100%</span>
                         </div>
                     </div>

                     {/* STAGE 3: DECIDE */}
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex-1 flex flex-col justify-center">
                         <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                         <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                             <Dices size={14}/> 3. 掷硬币决定 (Sample)
                         </h4>
                         
                         <div className="flex justify-between items-end">
                             <div className="flex flex-col gap-1 w-full mr-4">
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">最近 30 次历史</span>
                                 <div className="flex gap-[1px] h-6 items-end bg-slate-50 rounded overflow-hidden p-0.5 border border-slate-100">
                                     {history.slice(-30).map((h, i) => (
                                         <div key={i} className={`flex-1 rounded-sm ${h===1?'bg-blue-500 h-full':'bg-slate-200 h-1/4'}`}></div>
                                     ))}
                                 </div>
                             </div>
                             <div className="text-right shrink-0">
                                 <span className="text-xs text-slate-400 font-bold block">选1频率</span>
                                 <span className={`font-mono font-bold text-xl ${freqA > 0.6 ? 'text-emerald-600' : 'text-slate-400'}`}>{freqA.toFixed(2)}</span>
                             </div>
                         </div>
                     </div>
                 </div>

             </div>

             {/* NARRATIVE */}
             {step === 1 && (
                <GuideCard 
                    step={1} totalSteps={4}
                    title="场景：同桌效应"
                    goal="理解为什么同桌的位置会影响我的选择"
                    action="完成刚才的预测 (Prediction)"
                    why="因为你喜欢同桌(w>0)，所以当同桌在右边时，你坐右边的'不舒服程度'(Cost)更低。系统总是倾向于更舒服的状态。"
                    onRescue={onRescue}
                />
             )}
             {step === 2 && (
                <GuideCard 
                    step={2} totalSteps={4}
                    title="调整偏好强度"
                    goal="把概率 P(选右边) 提高到 80% 以上"
                    action="拖动左侧的 'w' 滑块 (增加偏好)"
                    why="偏好越强(w越大)，'坐在一起'的优势分(Score)就越高，转化的概率 P 就越大。"
                    onRescue={onRescue}
                />
             )}
             {step === 3 && (
                <GuideCard 
                    step={3} totalSteps={4}
                    title="观察随机性"
                    goal="自动更新 30 次，确认频率 > 0.7"
                    action="点击左侧的 '自动更新' 按钮"
                    why="概率是 80% 并不意味着你会死死地钉在右边。你会偶尔跳回左边(0)，但长期来看，你大多数时间都在右边陪同桌。"
                    onRescue={onRescue}
                />
             )}
             {step === 4 && (
                <GuideCard 
                    step={4} totalSteps={4}
                    title="同桌离开了"
                    goal="把 B 改成 0，点击自动更新，观察概率回归中立"
                    action="点击同桌 B 的圆圈设为 0，然后点击'自动更新'"
                    why="同桌不在右边了，你的'偏好' w 就失去了作用对象。左右两边的舒适度一样了，所以你又变回了 50/50 的随机状态。"
                    hint="看右边的流水线：Cost(0) 和 Cost(1) 变成了相等的 0，Score 变成了 0，所以 P 变成了 50%。"
                    onRescue={onRescue}
                />
             )}
         </div>
    );
};

const Level0: React.FC<Level0Props> = ({ 
    onComplete,
    initialStep = 1,
    onStepChange,
    onPrevLevel,
    canPrevLevel = false,
    onOpenMenu
}) => {
    const [step, setStep] = useState(initialStep);
    const [showIntro, setShowIntro] = useState(true);
    const [showRescue, setShowRescue] = useState(false);

    useEffect(() => {
        onStepChange?.(step);
    }, [step, onStepChange]);

    const getRescueContent = (lvl: number): RescueContent => {
        switch(lvl) {
            case 1: return {
                tldr: "神经元只有 0(关) 和 1(开) 两种状态。",
                why: ["计算机底层是二进制的。", "简化模型，方便计算能量。"],
                io: { in: ["点击开关"], out: ["状态改变"], next: "概率" },
                micro: ["点击按钮", "状态变 0 或 1", "没有 0.5"],
                math: { title: "二值状态", desc: "s ∈ {0, 1}", example: [] },
                faq: [{q: "为什么不能有 0.5?", a: "因为这是‘状态’，不是‘概率’。你可以有 50% 的概率是 1，但那一瞬间你必须决定是 0 还是 1。"}],
                debug: { check: "没反应?", fix: "多点几次开关。" }
            };
            case 2: return {
                tldr: "概率 P 决定了变 1 的倾向，但结果是随机的。",
                why: ["世界充满不确定性。", "防止模型死记硬背，增加鲁棒性。"],
                io: { in: ["概率 P"], out: ["一串 01 序列"], next: "Sigmoid" },
                micro: ["设定 P=0.8", "采样多次", "统计 1 的频率"],
                math: { title: "伯努利试验", desc: "P(X=1) = p", example: ["p=0.8, 10次可能出8个1，也可能出7个。"] },
                faq: [{q: "为什么 P=0.8 还会出 0?", a: "这就是随机性。0.8 只是大概率，不是绝对。"}],
                debug: { check: "进度条不动?", fix: "多点几次‘掷 50 次’。" }
            };
            case 3: return {
                tldr: "分数 x 代表‘想变 1 的欲望强度’。Sigmoid 把 x 变成 P。",
                why: ["物理量(能量差)是连续的，需要转换成概率。", "Sigmoid 函数性质很好(可导、平滑)。"],
                io: { in: ["分数 x"], out: ["概率 P"], next: "邻居影响" },
                micro: ["改变 x", "P 随之改变", "采样验证"],
                math: { title: "Sigmoid", desc: "P = 1 / (1 + e^-x)", example: ["x=0 -> P=0.5", "x=2 -> P≈0.88"] },
                faq: [{q: "x 和 P 有什么区别?", a: "x 是因，P 是果。x 可以是负无穷到正无穷，P 只能是 0 到 1。"}],
                debug: { check: "怎么过关?", fix: "完成 x=2 (想当1) 和 P 验证实验。" }
            };
            case 4: return {
                tldr: "你的状态受邻居影响。邻居状态 sB 和 关系 w 共同决定了你的分数 x。",
                why: ["这是神经网络连接的基础。", "通过这种方式，信息才能在网络中传播。"],
                io: { in: ["邻居 sB", "权重 w"], out: ["我的状态 sA"], next: "下一关" },
                micro: ["计算 x = -w * sB * sA (能量差)", "转化 P", "采样 sA"],
                math: { title: "局部场", desc: "x_A = w * s_B", example: ["w=2, B=1 -> x=2 -> P高"] },
                faq: [{q: "为什么 B 走了 P 就变 0.5?", a: "因为 B=0 时，w * B = 0，分数 x=0，Sigmoid(0)=0.5。"}] ,
                debug: { check: "怎么完成?", fix: "把 B 设为 0，然后再次点击自动更新。" }
            };
            default: return { tldr: "", why: [], io: {in:[],out:[],next:""}, micro: [], math: {title:"",desc:"",example:[]}, faq: [], debug: {check:"",fix:""} };
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 font-sans relative overflow-hidden">
            
            <LevelNav 
                title="Level 0: 基础校准"
                subTitle="Calibration Bay"
                currentStep={step}
                totalSteps={4}
                onPrevStep={() => setStep(s => Math.max(1, s-1))}
                onPrevLevel={onPrevLevel}
                onRestart={() => { setStep(1); setShowIntro(true); }}
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
                    title="Level 0: 基础原理"
                    content={getRescueContent(step)}
                    onClose={() => setShowRescue(false)}
                />
            )}

            <div className="flex-grow overflow-hidden relative w-full h-full">
                {step === 1 && <ModuleSwitch onComplete={() => setStep(2)} onRescue={() => setShowRescue(true)} />}
                {step === 2 && <ModuleProbability onComplete={() => setStep(3)} onRescue={() => setShowRescue(true)} />}
                {step === 3 && <ModuleProbabilityConverter onComplete={() => setStep(4)} onRescue={() => setShowRescue(true)} />}
                {step === 4 && <ModuleNeighborInfluence onComplete={onComplete} onRescue={() => setShowRescue(true)} />}
            </div>

        </div>
    );
};

export default Level0;
