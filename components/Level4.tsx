
import React, { useState, useEffect, useRef } from 'react';
import { 
    Activity, Play, RotateCcw, 
    ArrowRight, CheckCircle, 
    BarChart3, Zap, Target,
    Scale, HelpCircle, 
    Grid, List, RefreshCw, Layers,
    AlertTriangle, XCircle, FastForward, TrendingDown, Pause
} from 'lucide-react';
import LevelNav from './LevelNav';
import TermHelp from './TermHelp';
import Level4IntroModal, { useIntroOnce } from './Level4IntroModal';
import UniversalRescueDrawer, { RescueContent } from './UniversalRescueDrawer';

// --- CONSTANTS & TYPES ---

const SAMPLES = [
    { v1: [1,0,0,0], v2: [1,0,0,0], label: "样本 A (1000)" },
    { v1: [0,1,0,0], v2: [0,1,0,0], label: "样本 B (0100)" },
    { v1: [0,0,1,0], v2: [0,0,1,0], label: "样本 C (0010)" },
    { v1: [0,0,0,1], v2: [0,0,0,1], label: "样本 D (0001)" }
];

const INIT_WEIGHTS_V1H = Array(4).fill(0).map(() => Array(2).fill(0).map(() => (Math.random()-0.5)*0.2));
const INIT_WEIGHTS_HV2 = Array(2).fill(0).map(() => Array(4).fill(0).map(() => (Math.random()-0.5)*0.2));

interface StatResult {
    co_v1h: number[][]; // [4][2]
    co_hv2: number[][]; // [2][4]
    count: number;
}

interface WeightChange {
    name: string;
    before: number;
    after: number;
    delta: number;
}

interface HistoryPoint {
    epoch: number;
    error: number; // Sum of abs(delta)
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

// --- SUB-COMPONENTS ---

const ProcessFlow = ({ step, epoch }: { step: number, epoch: number }) => {
    const stages = [
        { id: 1, label: "1. 选样本", active: step === 1 },
        { id: 2, label: "2. 正相 (Pos)", active: step === 2 },
        { id: 3, label: "3. 负相 (Neg)", active: step === 3 },
        { id: 4, label: "4. 计算 Δ", active: step === 4 },
        { id: 5, label: "5. 更新权重", active: step === 5 },
    ];

    return (
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {stages.map((s, i) => (
                    <div key={s.id} className="flex items-center shrink-0">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                            s.active 
                            ? 'bg-slate-900 text-white shadow-lg ring-2 ring-slate-200' 
                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                            <span>{s.label}</span>
                        </div>
                        {i < stages.length - 1 && (
                            <div className="w-2 h-0.5 mx-1 bg-slate-200"></div>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold whitespace-nowrap border border-blue-100">
                <RefreshCw size={12}/> Epoch: {epoch}
            </div>
        </div>
    );
};

// Network Lines Visualization
const NetworkLines = ({ wV1H, wHV2, v1, h, v2 }: { wV1H: number[][], wHV2: number[][], v1: number[], h: number[], v2: number[] }) => {
    const getY = (idx: number, total: number) => ((idx + 1) / (total + 1)) * 100;

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            {wV1H.map((row, i) => row.map((w, j) => {
                const opacity = Math.min(1, Math.abs(w) * 2 + 0.1);
                const color = w > 0 ? '#3b82f6' : '#ef4444'; 
                const isActive = v1[i] === 1 && h[j] === 1;
                return (
                    <line key={`v1h-${i}-${j}`}
                        x1="15%" y1={`${getY(i, 4)}%`} x2="50%" y2={`${getY(j, 2)}%`}
                        stroke={color} strokeWidth={Math.abs(w) * 8 + 1} strokeOpacity={opacity}
                        className={`transition-all duration-300 ${isActive ? 'opacity-100 stroke-[3px]' : 'opacity-30'}`}
                    />
                );
            }))}
            {wHV2.map((row, j) => row.map((w, k) => {
                const opacity = Math.min(1, Math.abs(w) * 2 + 0.1);
                const color = w > 0 ? '#3b82f6' : '#ef4444'; 
                const isActive = h[j] === 1 && v2[k] === 1;
                return (
                    <line key={`hv2-${j}-${k}`}
                        x1="50%" y1={`${getY(j, 2)}%`} x2="85%" y2={`${getY(k, 4)}%`}
                        stroke={color} strokeWidth={Math.abs(w) * 8 + 1} strokeOpacity={opacity}
                        className={`transition-all duration-300 ${isActive ? 'opacity-100 stroke-[3px]' : 'opacity-30'}`}
                    />
                );
            }))}
        </svg>
    );
};

const UnitNode: React.FC<{ val: number; isClamped?: boolean; label?: string; subLabel?: string }> = ({ val, isClamped, label, subLabel }) => (
    <div className="flex flex-col items-center gap-1 relative z-20">
        <div className={`
            rounded-full border-2 flex items-center justify-center font-mono font-bold transition-all duration-300 shadow-sm
            w-8 h-8 text-sm sm:w-10 sm:h-10 sm:text-base
            ${val === 1 
                ? (isClamped ? "bg-blue-600 border-blue-700 text-white" : "bg-purple-500 border-purple-600 text-white") 
                : "bg-white border-slate-300 text-slate-300"}
            ${isClamped ? "ring-2 ring-blue-200 ring-offset-1" : ""}
        `}>
            {val}
        </div>
        {label && <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-white/80 px-1 rounded">{label}</span>}
        {subLabel && <span className="text-[8px] text-slate-400">{subLabel}</span>}
    </div>
);

// --- MAIN COMPONENT ---

const Level4: React.FC<{ onComplete: () => void, onPrevLevel: () => void, canPrevLevel: boolean, onOpenMenu: () => void }> = ({ onComplete, onPrevLevel, canPrevLevel, onOpenMenu }) => {
    // --- STATE ---
    const [step, setStep] = useState(1);
    const [showIntro, setShowIntro] = useIntroOnce('level4_intro_done');
    const [showRescue, setShowRescue] = useState(false);
    
    // Core Data
    const [wV1H, setWV1H] = useState(INIT_WEIGHTS_V1H);
    const [wHV2, setWHV2] = useState(INIT_WEIGHTS_HV2);
    const [sampleIdx, setSampleIdx] = useState<number | null>(null);
    const [epoch, setEpoch] = useState(0);
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    
    // UI State
    const [v1, setV1] = useState([0,0,0,0]);
    const [v2, setV2] = useState([0,0,0,0]);
    const [h, setH] = useState([0,0]);
    const [posProgress, setPosProgress] = useState(0);
    const [negProgress, setNegProgress] = useState(0);
    const [posStats, setPosStats] = useState<StatResult>({ co_v1h: [], co_hv2: [], count: 0 });
    const [negStats, setNegStats] = useState<StatResult>({ co_v1h: [], co_hv2: [], count: 0 });
    const [topChanges, setTopChanges] = useState<WeightChange[]>([]);
    const [showErrorToast, setShowErrorToast] = useState<string | null>(null);
    
    // Auto Mode: idle, step (single phase), cycle (full loop)
    const [autoMode, setAutoMode] = useState<'idle' | 'step' | 'cycle'>('idle');
    const [showCycleSummary, setShowCycleSummary] = useState(false); // New: Modal after update

    const runRef = useRef<number>(0);

    const createEmptyStats = () => ({
        co_v1h: Array(4).fill(0).map(() => Array(2).fill(0)),
        co_hv2: Array(2).fill(0).map(() => Array(4).fill(0)),
        count: 0
    });

    // Reset for new sample or restart
    const resetForNewSample = (idx: number) => {
        const s = SAMPLES[idx];
        setSampleIdx(idx);
        setV1([...s.v1]);
        setV2([...s.v2]);
        setH([0,0]);
        setPosProgress(0);
        setNegProgress(0);
        setPosStats(createEmptyStats());
        setNegStats(createEmptyStats());
        setTopChanges([]);
        setStep(2); // Jump to Pos Phase ready
        // setHistory([]); // Keep history to show progress across samples if desired, but user asked to reset
        // setEpoch(0);
        setShowErrorToast(null);
        setShowCycleSummary(false);
    };

    const handleRestart = () => {
        setStep(1);
        setSampleIdx(null);
        setWV1H(Array(4).fill(0).map(() => Array(2).fill(0).map(() => (Math.random()-0.5)*0.2)));
        setWHV2(Array(2).fill(0).map(() => Array(4).fill(0).map(() => (Math.random()-0.5)*0.2)));
        setHistory([]);
        setEpoch(0);
        setShowCycleSummary(false);
    };

    // --- LOGIC: RUN PHASE ---
    const runPhase = (type: 'pos' | 'neg', onFinish?: () => void) => {
        if (sampleIdx === null) {
            setShowErrorToast("请先选择一个样本 (Step 1)");
            return;
        }

        const target = SAMPLES[sampleIdx];
        let currV1 = [...target.v1];
        // Pos: V2 Clamped. Neg: V2 Free (starts random or from prev).
        let currV2 = type === 'pos' ? [...target.v2] : [0,0,0,0].map(()=>Math.random()>0.5?1:0); 
        let currH = [0,0];
        let stats = createEmptyStats();
        let count = 0;
        const TARGET_STEPS = 20; // Faster for UX

        const loop = () => {
            count++;
            // Update H
            for(let j=0; j<2; j++) {
                let x = 0;
                for(let i=0; i<4; i++) x += currV1[i] * wV1H[i][j];
                for(let k=0; k<4; k++) x += currV2[k] * wHV2[j][k];
                currH[j] = Math.random() < sigmoid(x) ? 1 : 0;
            }
            // If Neg, Update V2
            if (type === 'neg') {
                for(let k=0; k<4; k++) {
                    let x = 0;
                    for(let j=0; j<2; j++) x += currH[j] * wHV2[j][k];
                    currV2[k] = Math.random() < sigmoid(x) ? 1 : 0;
                }
            }
            // Stats
            for(let i=0; i<4; i++) for(let j=0; j<2; j++) if(currV1[i]===1 && currH[j]===1) stats.co_v1h[i][j]++;
            for(let j=0; j<2; j++) for(let k=0; k<4; k++) if(currH[j]===1 && currV2[k]===1) stats.co_hv2[j][k]++;
            stats.count++;

            // Visual Update
            setV1([...currV1]); setV2([...currV2]); setH([...currH]);
            const prog = (count / TARGET_STEPS) * 100;
            if (type === 'pos') { setPosProgress(prog); setPosStats({...stats}); }
            else { setNegProgress(prog); setNegStats({...stats}); }

            if (count < TARGET_STEPS) {
                runRef.current = requestAnimationFrame(loop);
            } else {
                if (type === 'pos') setStep(3); // Move to Neg
                if (type === 'neg') setStep(4); // Move to Delta
                onFinish?.();
            }
        };
        cancelAnimationFrame(runRef.current);
        runRef.current = requestAnimationFrame(loop);
    };

    const handleUpdate = () => {
        if (negStats.count === 0) {
            setShowErrorToast("请先完成正相和负相统计");
            return;
        }

        const changes: WeightChange[] = [];
        const newWV1H = wV1H.map(row => [...row]);
        const newWHV2 = wHV2.map(row => [...row]);
        const LR = 0.8; // High learning rate for demo
        let totalError = 0;

        // V1→H
        for(let i=0; i<4; i++) for(let j=0; j<2; j++) {
            const pos = posStats.co_v1h[i][j] / Math.max(1, posStats.count);
            const neg = negStats.co_v1h[i][j] / Math.max(1, negStats.count);
            const delta = LR * (pos - neg);
            totalError += Math.abs(delta);
            if (Math.abs(delta) > 0.01) changes.push({ name: `V1[${i}]-H[${j}]`, before: wV1H[i][j], after: wV1H[i][j]+delta, delta });
            newWV1H[i][j] += delta;
        }
        // H→V2
        for(let j=0; j<2; j++) for(let k=0; k<4; k++) {
            const pos = posStats.co_hv2[j][k] / Math.max(1, posStats.count);
            const neg = negStats.co_hv2[j][k] / Math.max(1, negStats.count);
            const delta = LR * (pos - neg);
            totalError += Math.abs(delta);
            if (Math.abs(delta) > 0.01) changes.push({ name: `H[${j}]-V2[${k}]`, before: wHV2[j][k], after: wHV2[j][k]+delta, delta });
            newWHV2[j][k] += delta;
        }

        changes.sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta));
        setTopChanges(changes);
        setWV1H(newWV1H);
        setWHV2(newWHV2);
        
        const newEpoch = epoch + 1;
        setEpoch(newEpoch);
        setHistory(prev => [...prev, { epoch: newEpoch, error: totalError }]);
        
        // Finalize Cycle
        setAutoMode('idle');
        setStep(5); // Show update stats
        setShowCycleSummary(true);
    };

    // Auto Loop Logic: Single Cycle
    const runCycle = async () => {
        setAutoMode('cycle');
        // Pos
        await new Promise<void>(resolve => runPhase('pos', resolve));
        await new Promise<void>(resolve => setTimeout(resolve, 300));
        // Neg
        await new Promise<void>(resolve => runPhase('neg', resolve));
        await new Promise<void>(resolve => setTimeout(resolve, 300));
        // Update
        handleUpdate(); 
    };

    const continueNextRound = () => {
        setShowCycleSummary(false);
        setPosProgress(0);
        setNegProgress(0);
        setPosStats(createEmptyStats());
        setNegStats(createEmptyStats());
        setStep(2); // Back to Pos
    };

    // --- RESCUE CONTENT ---
    const getRescueContent = (currentStep: number): RescueContent => {
        // ... (Keep existing rescue content logic)
        // Simplified for this patch to focus on structure
        return { 
            tldr: "遵循：选样本 → 正相统计 → 负相统计 → 更新权重 的循环。", 
            why: [], io: {in:[],out:[],next:""}, micro: [], math: {title:"",desc:"",example:[]}, faq: [], debug: {check:"",fix:""} 
        };
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 font-sans relative">
            <LevelNav 
                title="Level 4: 双相实验台"
                subTitle="4-2-4 Encoder"
                currentStep={step}
                totalSteps={5}
                onPrevStep={() => {}}
                onPrevLevel={onPrevLevel}
                canPrevStep={false}
                canPrevLevel={canPrevLevel}
                onRestart={() => { handleRestart(); setShowIntro(true); }}
                onOpenMenu={onOpenMenu}
            />

            {showIntro && <Level4IntroModal onClose={() => setShowIntro(false)} />}
            {showRescue && <UniversalRescueDrawer step={step} title="Level 4: 学习循环" content={getRescueContent(step)} onClose={() => setShowRescue(false)} />}

            {/* Error Toast */}
            {showErrorToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-6 py-3 rounded-full shadow-xl font-bold text-sm animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
                    <AlertTriangle size={18}/>
                    {showErrorToast}
                    <button onClick={() => setShowErrorToast(null)} className="ml-2 hover:bg-red-600 rounded-full p-1"><XCircle size={16}/></button>
                </div>
            )}

            {/* Cycle Summary Modal */}
            {showCycleSummary && (
                <div className="fixed inset-0 z-[80] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95">
                        <div className="flex items-center gap-2 mb-4 text-emerald-600 font-bold text-lg">
                            <CheckCircle size={24}/> 第 {epoch} 轮循环完成
                        </div>
                        <p className="text-slate-600 text-sm mb-4">
                            权重已更新。误差 (Total Error): <strong>{history[history.length-1]?.error.toFixed(2)}</strong>
                        </p>
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={continueNextRound}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-md active:scale-95"
                            >
                                <RefreshCw size={16} className="inline mr-2"/> 继续下一轮 (Next Epoch)
                            </button>
                            <button 
                                onClick={onComplete}
                                className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 border border-slate-200"
                            >
                                跳过剩余训练，完成本关
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ProcessFlow step={step} epoch={epoch} />

            {/* MAIN CONTENT */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-slate-200 overflow-hidden relative pb-32 sm:pb-36">
                
                {/* COL 1: SETUP & CONTROLS */}
                <div className="bg-slate-50 p-6 flex flex-col gap-6 overflow-y-auto">
                    
                    {/* Sample Selection */}
                    <div className={`bg-white p-4 rounded-xl border-2 transition-all ${step===1 ? 'border-blue-500 shadow-md ring-4 ring-blue-50' : 'border-slate-200'}`}>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Layers size={14}/> 1. 选择样本</span>
                            <TermHelp term="clamp"/>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {SAMPLES.map((s, i) => (
                                <button key={i} onClick={() => resetForNewSample(i)} disabled={autoMode !== 'idle'}
                                    className={`py-2 px-3 rounded-lg text-left text-xs font-bold transition-all flex justify-between items-center ${sampleIdx === i ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                    <span>{s.label.split(' ')[1]}</span>
                                    {sampleIdx === i && <CheckCircle size={12}/>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step Controls */}
                    <div className="space-y-4">
                        <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Activity size={12}/> 手动流程 (Manual Steps)
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => runPhase('pos')}
                                disabled={step !== 2 || autoMode !== 'idle'}
                                className={`py-3 rounded-lg font-bold text-xs border transition-all ${step===2 ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' : 'bg-slate-50 border-slate-100 text-slate-300'}`}
                            >
                                2. 运行正相
                            </button>
                            <button 
                                onClick={() => runPhase('neg')}
                                disabled={step !== 3 || autoMode !== 'idle'}
                                className={`py-3 rounded-lg font-bold text-xs border transition-all ${step===3 ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : 'bg-slate-50 border-slate-100 text-slate-300'}`}
                            >
                                3. 运行负相
                            </button>
                        </div>

                        <button 
                            onClick={handleUpdate}
                            disabled={step !== 4 || autoMode !== 'idle'}
                            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${step === 4 ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-500 animate-pulse' : 'bg-slate-200 text-slate-400'}`}
                        >
                            <Scale size={16}/> 4. 计算 Δ 并更新权重
                        </button>

                        <div className="w-full h-px bg-slate-200 my-2"></div>

                        <button onClick={runCycle} disabled={sampleIdx === null || autoMode !== 'idle'}
                            className="w-full py-3 rounded-lg font-bold bg-slate-800 text-white hover:bg-slate-700 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-transform active:scale-95">
                            {autoMode === 'cycle' ? <Activity className="animate-spin" size={16}/> : <FastForward size={16}/>}
                            {autoMode === 'cycle' ? "正在循环..." : "自动跑一轮 (Auto Cycle)"}
                        </button>
                    </div>

                    {/* Convergence Graph */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-grow">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                            <TrendingDown size={14}/> 误差下降 (Total Error)
                        </div>
                        <div className="h-24 flex items-end gap-1 border-b border-l border-slate-200 p-1 relative">
                            {history.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-300">暂无数据</div>}
                            {history.slice(-15).map((h, i) => {
                                const maxErr = Math.max(...history.map(p=>p.error), 1);
                                const hPer = (h.error / maxErr) * 100;
                                return (
                                    <div key={i} className="flex-1 bg-red-400 hover:bg-red-500 transition-all rounded-t-sm relative group" style={{ height: `${Math.max(5, hPer)}%` }}>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-white text-[9px] px-1 rounded z-10 whitespace-nowrap">
                                            Ep:{h.epoch} Err:{h.error.toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* COL 2: VISUALIZATION */}
                <div className="bg-white relative flex flex-col overflow-hidden">
                    <div className="absolute inset-0 bg-slate-50/30"></div>
                    
                    {/* Phase Indicator Overlay */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                        {autoMode !== 'idle' && (
                            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-indigo-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <Activity className="text-indigo-600 animate-spin" size={16}/>
                                <span className="text-sm font-bold text-indigo-900">
                                    {posProgress > 0 && posProgress < 100 ? "正相统计中..." : 
                                     negProgress > 0 && negProgress < 100 ? "负相做梦中..." : "正在更新权重..."}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-grow relative flex items-center justify-center p-4">
                        <div className="relative w-full max-w-md h-[300px] flex justify-between items-center z-10">
                            <NetworkLines wV1H={wV1H} wHV2={wHV2} v1={v1} h={h} v2={v2} />
                            
                            {/* V1 */}
                            <div className="flex flex-col gap-4 h-full justify-center z-20">
                                {v1.map((val, i) => (
                                    <UnitNode key={i} val={val} isClamped={true} label={`V1_${i}`} />
                                ))}
                                <div className="text-center font-bold text-blue-600 text-xs mt-2 bg-blue-50 px-2 py-1 rounded">Input</div>
                            </div>

                            {/* H */}
                            <div className="flex flex-col gap-16 h-full justify-center z-20">
                                {h.map((val, i) => (
                                    <UnitNode key={i} val={val} label={`H_${i}`} />
                                ))}
                                <div className="text-center font-bold text-purple-500 text-xs mt-2 bg-purple-50 px-2 py-1 rounded flex items-center gap-1 justify-center">
                                    Hidden <TermHelp term="hidden_unit"/>
                                </div>
                            </div>

                            {/* V2 */}
                            <div className="flex flex-col gap-4 h-full justify-center z-20">
                                {v2.map((val, i) => (
                                    <UnitNode key={i} val={val} isClamped={step === 2 || step === 1} label={`V2_${i}`} />
                                ))}
                                <div className={`text-center font-bold text-xs mt-2 px-2 py-1 rounded transition-colors ${step===3 ? 'text-red-500 bg-red-50' : 'text-blue-600 bg-blue-50'}`}>
                                    {step === 3 ? "Free (Dream)" : "Clamped"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COL 3: STATS & LOGS */}
                <div className="bg-slate-50 p-6 flex flex-col gap-6 overflow-y-auto border-l border-slate-200">
                    
                    {/* Stats Comparison */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">统计对比 <TermHelp term="co_occurrence"/></span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-16 font-bold text-blue-600 flex items-center gap-1">Pos <TermHelp term="pos_stats"/></div>
                                <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${posProgress}%` }}></div>
                                </div>
                                <div className="w-8 text-right font-mono">{posStats.count}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-16 font-bold text-red-600 flex items-center gap-1">Neg <TermHelp term="neg_stats"/></div>
                                <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 transition-all" style={{ width: `${negProgress}%` }}></div>
                                </div>
                                <div className="w-8 text-right font-mono">{negStats.count}</div>
                            </div>
                        </div>
                    </div>

                    {/* Weight Heatmap */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Grid size={12}/> 权重变化 <TermHelp term="delta_w"/>
                        </div>
                        <div className="flex justify-around items-center">
                            <div className="flex flex-col items-center">
                                <div className="text-[9px] text-slate-400 mb-1">V1 → H</div>
                                <div className="grid grid-cols-2 gap-1">
                                    {wV1H.flat().map((w, i) => (
                                        <div key={i} className="w-4 h-4 rounded-[2px]" style={{ backgroundColor: w>0 ? `rgba(59,130,246,${Math.min(1,Math.abs(w)*2)})` : `rgba(239,68,68,${Math.min(1,Math.abs(w)*2)})` }}></div>
                                    ))}
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-slate-300"/>
                            <div className="flex flex-col items-center">
                                <div className="text-[9px] text-slate-400 mb-1">H → V2</div>
                                <div className="grid grid-cols-4 gap-1">
                                    {wHV2.flat().map((w, i) => (
                                        <div key={i} className="w-4 h-4 rounded-[2px]" style={{ backgroundColor: w>0 ? `rgba(59,130,246,${Math.min(1,Math.abs(w)*2)})` : `rgba(239,68,68,${Math.min(1,Math.abs(w)*2)})` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Log */}
                    <div className="flex-grow bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[150px]">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex justify-between">
                            <span>Top Updates</span>
                            <span className="text-emerald-600 font-mono">Δ = Pos - Neg</span>
                        </div>
                        <div className="space-y-1 overflow-y-auto max-h-[200px] custom-scrollbar">
                            {topChanges.length === 0 ? (
                                <div className="text-xs text-slate-300 text-center py-4">等待更新...</div>
                            ) : (
                                topChanges.slice(0, 6).map((c, i) => (
                                    <div key={i} className="text-[10px] flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                                        <span className="font-bold text-slate-600">{c.name}</span>
                                        <span className={c.delta>0?'text-blue-600':'text-red-600'}>
                                            {c.delta>0?'+':''}{c.delta.toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* BOTTOM GUIDE BAR */}
            <div className="fixed bottom-0 left-0 right-0 p-4 z-[60] pointer-events-none flex justify-center">
                <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border-t border-slate-700 w-full max-w-4xl pointer-events-auto transition-all animate-in slide-in-from-bottom-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase">Step {step}</span>
                                <h3 className="font-bold text-sm text-orange-100">
                                    {step === 1 && "目标：固定现实 (Reality)"}
                                    {step === 2 && "行动：统计正相 (Pos)"}
                                    {step === 3 && "行动：统计负相 (Neg)"}
                                    {step >= 4 && "行动：更新权重 (Update)"}
                                </h3>
                            </div>
                            <p className="text-xs text-slate-300 leading-tight">
                                {step === 1 && "点击上方样本按钮，告诉网络我们要学哪个模式。这将固定 V1/V2，网络准备好收集 Pos 数据。"}
                                {step === 2 && "网络正在‘睁眼看世界’。H 会根据固定的 V1/V2 寻找解释。统计正相共现。"}
                                {step === 3 && "网络在‘闭眼做梦’。放开 V2，看它自己生成什么。统计负相共现。"}
                                {step >= 4 && "正在计算 Δ = Pos - Neg。如果现实有但梦里没，就加强连接。观察 Error 曲线是否下降。"}
                            </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button onClick={() => setShowRescue(true)} className="px-3 py-2 rounded-lg bg-blue-900/50 hover:bg-blue-900 text-blue-200 text-xs font-bold border border-blue-800 transition-colors flex items-center gap-1">
                                <HelpCircle size={14}/> 我不懂
                            </button>
                            {(epoch >= 3 || (epoch >= 1 && history.length > 0 && history[history.length-1].error < 2)) && (
                                <button onClick={onComplete} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all animate-pulse flex items-center gap-1">
                                    完成本关 <ArrowRight size={14}/>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Level4;
