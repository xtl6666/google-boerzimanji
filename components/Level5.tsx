
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, CheckCircle, RotateCcw, 
  Settings, Play, FastForward, Activity,
  Zap, Brain, Moon, Sun, Scale,
  Menu, Info, BarChart3, Target, HelpCircle, ChevronRight, X, Lightbulb, Microscope, MousePointerClick,
  BookOpen, Layers, Calculator, AlertTriangle, Wrench, List, ArrowLeftRight, ArrowDown, TrendingUp, Trophy, RefreshCw, Pause, Gauge, Hand,
  ChevronUp, ChevronDown
} from 'lucide-react';
import LevelNav from './LevelNav';
import TermHelp from './TermHelp';
import PixelGrid from './PixelGrid';
import { PATTERN_CAT, NUM_VISIBLE } from '../constants';
import UniversalRescueDrawer, { RescueContent } from './UniversalRescueDrawer';

// --- CONSTANTS ---
const NUM_HIDDEN = 16; 
const LEARNING_RATE = 0.1;
const TARGET_ACCURACY = 0.90;

// --- TYPES ---
interface RBMState {
    weights: number[][]; // [visible][hidden]
    biasV: number[];     // [visible]
    biasH: number[];     // [hidden]
}

interface PipelineState {
    visible: number[]; // V0 (Day)
    hidden: number[];  // H0
    hiddenProbs: number[]; // P(H0|V0)
    
    reconVisible: number[]; // V1 (Night/Dream)
    reconHidden: number[];  // H1
    
    phase: 'idle' | 'day' | 'night' | 'update';
}

// --- HELPERS ---
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const sampleBernoulli = (probs: number[]): number[] => probs.map(p => Math.random() < p ? 1 : 0);

const initRBM = (): RBMState => {
    const weights = Array(NUM_VISIBLE).fill(0).map(() => Array(NUM_HIDDEN).fill(0).map(() => (Math.random() - 0.5) * 0.2));
    const biasV = Array(NUM_VISIBLE).fill(0).map(() => -0.1);
    const biasH = Array(NUM_HIDDEN).fill(0).map(() => -0.1);
    return { weights, biasV, biasH };
};

// --- COMPONENTS ---

const IntroOverlay = ({ onStart }: { onStart: () => void }) => (
    <div className="absolute inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
             <div className="bg-slate-900 p-6 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
                    <Brain size={24}/>
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-white">Level 5: 综合实验</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">The Final Synthesis</p>
                 </div>
             </div>
             
             <div className="p-6 space-y-6">
                 <p className="text-slate-700 text-lg font-medium leading-relaxed">
                     这是最后一关。我们将把之前学到的所有零件组装成一台完整的<strong>受限玻尔兹曼机 (RBM)</strong>。
                 </p>
                 
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">实验目标 (Objectives)</h4>
                     <ul className="space-y-3">
                        <li className="flex gap-3 text-sm text-slate-700">
                            <div className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                            <span><strong>教它认猫：</strong> 我们会把一张“猫脸”图案反复展示给网络看（数据钳制）。</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-700">
                            <div className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                            <span><strong>观察做梦：</strong> 网络会在“负相”尝试重构记忆。刚开始是乱码，后来会越来越像猫。</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-700">
                            <div className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                            <span><strong>特征涌现：</strong> 观察中间的 H 单元，它们会自动学会识别“耳朵”、“眼睛”等局部特征。</span>
                        </li>
                     </ul>
                 </div>

                 <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
                    <Info size={16} className="text-blue-500 shrink-0 mt-0.5"/>
                    <span>注意：不需要手动操作太多。你的任务是启动引擎，然后<strong>观察</strong>智能是如何从数学公式中涌现的。</span>
                 </div>
             </div>
             
             <div className="p-6 bg-slate-50 border-t flex justify-end">
                 <button 
                    onClick={onStart} 
                    className="group px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg hover:shadow-xl flex items-center gap-2 transition-all active:scale-95"
                 >
                     <span>启动引擎</span>
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                 </button>
             </div>
        </div>
    </div>
);

// --- COMPLETION MODAL ---
const CompletionModal = ({ epoch, accuracy, onNext, onStay }: { epoch: number, accuracy: number, onNext: () => void, onStay: () => void }) => (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 border border-slate-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={32}/>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">训练完成！</h2>
            <p className="text-slate-600 mb-6 text-sm">
                经过 <strong>{epoch}</strong> 轮训练，神经网络已经达标。<br/>
                梦境相似度达到 <strong>{(accuracy*100).toFixed(0)}%</strong>。
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left mb-6 text-sm space-y-2">
                <div className="flex gap-2 items-center text-slate-700"><CheckCircle size={14} className="text-emerald-500"/> <span>掌握了 H -> V 的生成规则</span></div>
                <div className="flex gap-2 items-center text-slate-700"><CheckCircle size={14} className="text-emerald-500"/> <span>权重已雕刻出能量谷底</span></div>
            </div>
            <div className="flex flex-col gap-3">
                <button onClick={onNext} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                    进入 Part 3: 总结与应用 <ArrowRight size={16}/>
                </button>
                <button onClick={onStay} className="w-full py-3 bg-white text-slate-500 font-bold rounded-xl hover:bg-slate-50 border border-slate-200 active:scale-95 transition-all">
                    留在这里继续实验
                </button>
            </div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

const Level5: React.FC<{ 
    onGoToApplications: () => void, 
    onPrevLevel: () => void, 
    canPrevLevel: boolean, 
    onOpenMenu: () => void,
    initialStep?: number,
    onStepChange?: (step: number) => void
}> = ({ onGoToApplications, onPrevLevel, canPrevLevel, onOpenMenu, initialStep=1, onStepChange }) => {

    // --- STATE ---
    const [rbm, setRbm] = useState<RBMState>(initRBM);
    const [epoch, setEpoch] = useState(0);
    const [autoMode, setAutoMode] = useState(false);
    const [speedMode, setSpeedMode] = useState<'slow' | 'fast'>('slow'); // NEW: Speed control
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showRescue, setShowRescue] = useState(false);
    const [showIntro, setShowIntro] = useState(true); // NEW: Intro State
    const [hasCompleted, setHasCompleted] = useState(false); 
    const [isFooterExpanded, setIsFooterExpanded] = useState(true); // NEW: Footer state

    const [pipeline, setPipeline] = useState<PipelineState>({
        visible: Array(NUM_VISIBLE).fill(0), hidden: Array(NUM_HIDDEN).fill(0),
        hiddenProbs: Array(NUM_HIDDEN).fill(0), reconVisible: Array(NUM_VISIBLE).fill(0), reconHidden: Array(NUM_HIDDEN).fill(0),
        phase: 'idle'
    });
    const [accuracyHistory, setAccuracyHistory] = useState<number[]>([]);
    
    // Feature Visualization State
    const [hoveredHIndex, setHoveredHIndex] = useState<number | null>(null);

    const autoRef = useRef<number>(0);

    // --- LOGIC: ONE STEP ---
    const runStep = () => {
        // 1. Pos Phase (Clamp V -> Sample H)
        const hProbs0 = rbm.biasH.map((b, j) => {
            let sum = b;
            for(let i=0; i<NUM_VISIBLE; i++) sum += PATTERN_CAT[i] * rbm.weights[i][j];
            return sigmoid(sum);
        });
        const hSample0 = sampleBernoulli(hProbs0);

        // 2. Neg Phase (Recon V' -> Sample H')
        const vProbs1 = rbm.biasV.map((b, i) => {
            let sum = b;
            for(let j=0; j<NUM_HIDDEN; j++) sum += hSample0[j] * rbm.weights[i][j];
            return sigmoid(sum);
        });
        const vSample1 = sampleBernoulli(vProbs1);
        
        const hProbs1 = rbm.biasH.map((b, j) => {
            let sum = b;
            for(let i=0; i<NUM_VISIBLE; i++) sum += vSample1[i] * rbm.weights[i][j];
            return sigmoid(sum);
        });
        const hSample1 = sampleBernoulli(hProbs1);

        // 3. Update
        const newWeights = rbm.weights.map(row => [...row]);
        for(let i=0; i<NUM_VISIBLE; i++) for(let j=0; j<NUM_HIDDEN; j++) {
            const pos = PATTERN_CAT[i] * hSample0[j];
            const neg = vSample1[i] * hSample1[j];
            newWeights[i][j] += LEARNING_RATE * (pos - neg);
        }
        const newBiasV = rbm.biasV.map((b, i) => b + LEARNING_RATE * (PATTERN_CAT[i] - vSample1[i]));
        const newBiasH = rbm.biasH.map((b, j) => b + LEARNING_RATE * (hSample0[j] - hSample1[j]));

        setRbm({ weights: newWeights, biasV: newBiasV, biasH: newBiasH });
        
        // Metrics
        const acc = vSample1.reduce((acc, v, i) => acc + (v === PATTERN_CAT[i] ? 1 : 0), 0) / NUM_VISIBLE;
        setAccuracyHistory(prev => [...prev.slice(-49), acc]);
        setEpoch(e => e + 1);
        
        // UI State Update with Cycling Phases for Slow Mode
        if (speedMode === 'slow') {
            // Visual Sequence Trick: Quickly cycle phases or just show 'Update'
            setPipeline({ ...pipeline, phase: 'day' });
            setTimeout(() => setPipeline(p => ({...p, phase: 'night'})), 200);
            setTimeout(() => setPipeline(p => ({...p, phase: 'update', visible: PATTERN_CAT, hidden: hSample0, hiddenProbs: hProbs0, reconVisible: vSample1, reconHidden: hSample1 })), 400);
        } else {
            // Fast mode: just update values
            setPipeline({
                visible: PATTERN_CAT,
                hidden: hSample0,
                hiddenProbs: hProbs0,
                reconVisible: vSample1,
                reconHidden: hSample1,
                phase: 'update'
            });
        }

        // Check Success
        if (acc > TARGET_ACCURACY && epoch > 10) {
            const recent = [...accuracyHistory.slice(-4), acc];
            if (recent.length >= 5 && recent.every(a => a > 0.85)) {
                if (!hasCompleted) {
                    setAutoMode(false);
                    setHasCompleted(true);
                    setShowSuccessModal(true);
                }
            }
        }
    };

    // Auto Loop
    useEffect(() => {
        if (autoMode && !showSuccessModal) {
            const interval = speedMode === 'slow' ? 800 : 100; // Slower default
            autoRef.current = window.setInterval(runStep, interval);
        } else {
            clearInterval(autoRef.current);
        }
        return () => clearInterval(autoRef.current);
    }, [autoMode, rbm, showSuccessModal, hasCompleted, speedMode]);

    // Extract weights for currently hovered H unit
    const activeWeights = hoveredHIndex !== null 
        ? rbm.weights.map(row => row[hoveredHIndex]) 
        : null;

    // --- RESCUE CONTENT ---
    const rescueContent: RescueContent = {
        tldr: "H 是大脑的‘特征识别区’。每个圆圈代表一个特征（如‘有耳朵’）。",
        why: ["如果只记像素，那就是复读机。记住特征，才能举一反三。", "H 负责把具体的像素(V)抽象成概念。"],
        io: { in: ["训练"], out: ["学会的特征"], next: "收敛" },
        micro: ["V -> H (解释)", "H -> V' (想象)", "对比 V 和 V'"],
        math: { title: "Gibbs Sampling", desc: "P(h|v) & P(v|h)", example: [] },
        faq: [
            {q: "H 到底是什么？", a: "试着把鼠标悬停在 H 圆圈上！你会看到左边的像素变色。变蓝的地方是 H 喜欢的（它检测的特征），变红的是它讨厌的。"},
            {q: "为什么自动训练变慢了？", a: "为了让你看清过程。点击‘加速’按钮可以变快。"}
        ],
        debug: { check: "进度条不动？", fix: "点击‘自动训练’。" }
    };

    const currentAcc = accuracyHistory[accuracyHistory.length-1] || 0;

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 relative overflow-hidden font-sans">
            <LevelNav 
                title="Level 5: 综合实验" 
                subTitle="Full RBM Training"
                currentStep={epoch} totalSteps={100} // Just visual
                onPrevStep={() => {}} onPrevLevel={onPrevLevel} canPrevStep={false} canPrevLevel={canPrevLevel} 
                onRestart={() => { setRbm(initRBM()); setEpoch(0); setAccuracyHistory([]); setShowSuccessModal(false); setHasCompleted(false); setShowIntro(true); }}
                onOpenMenu={onOpenMenu}
            />

            {showIntro && <IntroOverlay onStart={() => setShowIntro(false)} />}
            {showSuccessModal && <CompletionModal epoch={epoch} accuracy={currentAcc} onNext={onGoToApplications} onStay={() => setShowSuccessModal(false)} />}
            {showRescue && <UniversalRescueDrawer step={1} title="Level 5 Help" content={rescueContent} onClose={() => setShowRescue(false)} />}

            {/* TOP BAR: PROGRESS */}
            <div className="bg-white border-b px-4 py-2 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4 flex-grow">
                    <div className="flex flex-col w-full max-w-sm">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                            <span>Training Progress (Target: 90%)</span>
                            <span className={currentAcc > 0.8 ? 'text-emerald-600' : 'text-orange-500'}>
                                {(currentAcc*100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, (currentAcc/TARGET_ACCURACY)*100)}%` }}></div>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
                        <RefreshCw size={12}/> Epoch: {epoch}
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {/* Speed Toggle */}
                    <button 
                        onClick={() => setSpeedMode(s => s === 'slow' ? 'fast' : 'slow')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${speedMode === 'fast' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}
                    >
                        <Gauge size={14}/> {speedMode === 'slow' ? "慢速教学" : "快速收敛"}
                    </button>

                    <button onClick={runStep} disabled={autoMode} className="px-4 py-1.5 rounded-lg font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200">
                        单步
                    </button>
                    <button onClick={() => setAutoMode(!autoMode)} className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${autoMode ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                        {autoMode ? <Pause size={14}/> : <Play size={14}/>}
                        {autoMode ? "自动训练" : "自动训练"}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-slate-200 overflow-hidden">
                
                {/* COL 1: V (Input) */}
                <div className="bg-slate-50 p-6 flex flex-col items-center overflow-y-auto relative">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Sun size={14} className="text-blue-500"/> 现实 (Reality) <TermHelp term="clamp"/>
                    </h3>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-200 relative transition-all">
                        <PixelGrid 
                            state={PATTERN_CAT} 
                            weights={rbm.weights} 
                            isDay={true} 
                            similarity={1} 
                            lastAction={null} 
                            actionTrigger={0} 
                            overlayWeights={activeWeights} // Pass hovered weights
                        />
                        <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Input</div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500 text-center max-w-[200px]">
                        {hoveredHIndex !== null 
                            ? <span className="text-purple-600 font-bold animate-pulse">正在显示 H{hoveredHIndex} 的特征视野<br/>(蓝=喜欢, 红=讨厌)</span>
                            : "这是你要教给网络的知识（猫）。V 被强制固定为此状态。"
                        }
                    </div>
                </div>

                {/* COL 2: H (Hidden) */}
                <div className="bg-white p-6 flex flex-col items-center relative z-10 overflow-y-auto">
                    <h3 className="text-xs font-black text-purple-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Brain size={14}/> 内部特征 (Hidden H) <TermHelp term="hidden_unit"/>
                    </h3>
                    
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {pipeline.hiddenProbs.map((p, i) => (
                            <button 
                                key={i} 
                                onMouseEnter={() => setHoveredHIndex(i)}
                                onMouseLeave={() => setHoveredHIndex(null)}
                                className={`flex flex-col items-center gap-1 group relative transition-all cursor-help ${hoveredHIndex === i ? 'scale-125 z-20' : 'hover:scale-110'}`}
                            >
                                {/* Prob Bar */}
                                <div className={`w-1.5 h-8 bg-slate-100 rounded-full overflow-hidden border ${hoveredHIndex===i ? 'border-purple-400' : 'border-slate-200'}`}>
                                    <div className="w-full bg-purple-500 transition-all duration-300" style={{ height: `${p*100}%`, marginTop: `${(1-p)*100}%` }}></div>
                                </div>
                                {/* Circle */}
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors ${
                                    hoveredHIndex === i ? 'bg-purple-100 border-purple-500 text-purple-700 ring-4 ring-purple-50' :
                                    pipeline.hidden[i]===1 ? 'bg-purple-600 border-purple-700 text-white shadow-md' : 'bg-white border-slate-300 text-slate-300'
                                }`}>
                                    {pipeline.hidden[i]}
                                </div>
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-slate-800 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap pointer-events-none z-30">
                                    H{i}: P={(p*100).toFixed(0)}%
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-xs text-purple-800 text-center leading-relaxed flex items-start gap-2">
                        <Hand size={16} className="shrink-0 mt-0.5"/>
                        <span>
                            <strong>悬停探索：</strong><br/>
                            把鼠标放在任意 H 圆圈上，左侧网格会显示它“看重”哪些像素。
                        </span>
                    </div>
                </div>

                {/* COL 3: V' (Recon) */}
                <div className="bg-slate-50 p-6 flex flex-col items-center overflow-y-auto">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Moon size={14} className="text-red-500"/> 梦境 (Dream) <TermHelp term="reconstruct"/>
                    </h3>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 relative">
                        <PixelGrid state={pipeline.reconVisible} weights={rbm.weights} isDay={false} similarity={accuracyHistory[accuracyHistory.length-1] || 0} lastAction={null} actionTrigger={0} />
                        <div className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            Reconstruction
                        </div>
                    </div>
                    
                    {/* Metrics Graph */}
                    <div className="mt-6 w-full max-w-[200px] h-20 bg-white border border-slate-200 rounded-lg p-2 flex items-end gap-[1px]">
                        {accuracyHistory.map((v, i) => (
                            <div key={i} className="flex-1 bg-emerald-400" style={{ height: `${v*100}%` }}></div>
                        ))}
                        {accuracyHistory.length === 0 && <div className="w-full text-center text-[10px] text-slate-300 self-center">暂无数据</div>}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Similarity History</div>
                </div>

            </div>

            {/* BOTTOM GUIDE - COLLAPSIBLE */}
            <div 
                className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center pointer-events-none transition-transform duration-300"
                style={{ transform: isFooterExpanded ? 'translateY(0)' : 'translateY(100%)' }}
            >
                <div className="w-full max-w-4xl relative pointer-events-auto">
                    {/* Handle */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-1px]">
                        <button 
                            onClick={() => setIsFooterExpanded(!isFooterExpanded)}
                            className="bg-slate-900 text-white px-4 py-1.5 rounded-t-xl font-bold text-xs flex items-center gap-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-x border-slate-700 hover:bg-slate-800 transition-colors"
                        >
                            {isFooterExpanded ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
                            {isFooterExpanded ? "收起" : "展开目标"}
                        </button>
                    </div>

                    {/* Content Card */}
                    <div className="bg-slate-900 text-white p-4 rounded-t-xl shadow-2xl border-t border-slate-700 w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase">Level 5 Goal</span>
                                    <h3 className="font-bold text-sm text-blue-100">让梦境逼近现实</h3>
                                </div>
                                <p className="text-xs text-slate-300 leading-tight">
                                    1. 点击【自动训练】，网络会循环：看猫(Pos) → 做梦(Neg) → 改权重(Update)。<br/>
                                    2. <strong>悬停观察 H：</strong> 它们是特征探测器。训练后，某个 H 可能会专门负责“检测左耳”。<br/>
                                    3. 当相似度稳定在 90% 以上时，训练自动停止。
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => setShowRescue(true)} className="px-3 py-2 rounded-lg bg-blue-900/50 hover:bg-blue-900 text-blue-200 text-xs font-bold border border-blue-800 transition-colors flex items-center gap-1">
                                    <HelpCircle size={14}/> 我不懂
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Level5;
