
import React, { useState, useEffect } from 'react';
import { 
    Map, ArrowRight, CheckCircle, HelpCircle, Play, Pause, 
    Settings, RotateCcw, AlertTriangle, BookOpen, Target, 
    Microscope, Zap, MousePointerClick, ChevronRight, Activity,
    Layers, ArrowDown, ArrowUp, RefreshCw, Scale, Lightbulb, BarChart3, ChevronDown, ChevronUp
} from 'lucide-react';
import LevelNav from './LevelNav';
import UniversalRescueDrawer, { RescueContent } from './UniversalRescueDrawer';
import TermHelp from './TermHelp';

interface OrientationDockProps {
    onComplete: () => void;
    onOpenMenu: () => void;
    onSkip?: () => void;
    onRestart?: () => void;
}

// --- DATA: THE 8-NODE LOOP ---
const LOOP_NODES_DATA: Record<string, {
    id: string;
    label: string;
    icon: React.ReactNode;
    what: string;
    problem: string;
    io: { in: string, out: string };
    missing: string;
    level: string;
    levelId: number; // For jump
    example: string;
    causalNext: string;
}> = {
    'binary': {
        id: 'binary',
        label: 'Binary State (0/1)',
        icon: <div className="font-mono font-bold">0/1</div>,
        what: '微观世界的基石：状态二值化。每一个神经元（无论是代表像素还是抽象特征）在任意时刻只能处于两种确定的状态之一：静止(0) 或 激活(1)。这里不存在 0.5 的“半亮”状态，也不存在模糊的中间地带。',
        problem: '为什么要设计成非黑即白？\n1. 模拟生物神经元的“全或无”（All-or-none）放电特性。\n2. 简化物理模型：类似于磁铁的自旋（向上或向下），这让我们能用统计力学的方法来分析复杂系统。\n3. 避免连续数值带来的计算泥潭，让状态空间是有限可数的。',
        io: { in: '外界刺激 / 内部偏置', out: '确定的状态向量 s = [0, 1, 1, 0...]' },
        missing: '如果允许状态是连续的小数（如 0.75），我们就无法定义经典的“能量差 ΔE”，也就失去了通过能量高低来判断状态稳定性的物理基础。',
        level: 'Level 0: 基础校准',
        levelId: 0,
        example: '就像你房间的灯，要么开，要么关。整个神经网络就是成千上万个这种开关的组合。',
        causalNext: '既然状态确定了(0或1)，邻居们就可以根据连接权重，开始计算对它的“影响力”了。'
    },
    'score': {
        id: 'score',
        label: 'Score / ΔE',
        icon: <Activity size={16}/>,
        what: '局部支持力度（Net Input / Local Field）。这是该神经元收到的“总票数”：所有激活的邻居投来的支持票(正权重) 减去 反对票(负权重)，再加上它自己的偏置(Bias)。数学上，它等同于翻转该状态所带来的能量变化 ΔE。',
        problem: '解决“众口难调”的问题。一个神经元可能连接着上千个邻居，有的喊“亮！”，有的喊“灭！”。系统必须通过加权求和，把这些嘈杂的意见综合成一个单一的数值 x，作为决策的唯一依据。',
        io: { in: '邻居状态 s_j, 连接权重 w_ij, 偏置 b', out: '净输入 x (Score)' },
        missing: '没有这个统分 x，神经元就不知道该听谁的，只能随机乱跳。x 指引了能量降低的方向（x 越大，变成 1 后能量越低）。',
        level: 'Level 0.3 / Level 3',
        levelId: 0,
        example: '如果三个邻居都亮了，且连接权重都是 +2，那么 x = 2+2+2 = 6。这是一个极强的“请亮起来”的信号。',
        causalNext: '分数 x 可以是任意数值（如 +100, -50.5），不能直接用来做决定（掷硬币），我们需要把它翻译成概率。'
    },
    'sigmoid': {
        id: 'sigmoid',
        label: 'Sigmoid P',
        icon: <span className="font-serif italic">σ</span>,
        what: '概率翻译官（Logistic Function）。它是一个 S 型的数学函数，负责把任意范围的物理分数 x (从 -∞ 到 +∞) 压缩映射到 0%~100% 的概率区间。',
        problem: '解决“度量不统一”问题。物理量(能量/分数)是无界的，而统计抽样需要 0 到 1 之间的概率。Sigmoid 提供了这种转换，并且它特有的曲线形状保证了：分数微小的变化在中间区域极其敏感，而在两端趋于饱和。',
        io: { in: '分数 x', out: '激活概率 P (0~1)' },
        missing: '没有 Sigmoid，分数 100 和 -100 没法直接对应到硬币的正反面。它是连接确定性物理量与随机统计量的桥梁。',
        level: 'Level 0.3',
        levelId: 0,
        example: 'x=0 (犹豫) → P=0.5； x=2 (想亮) → P=0.88； x=-5 (极不想亮) → P=0.007。',
        causalNext: '现在我们手里有了概率 P，是时候由上帝（随机性）来掷骰子，决定它的最终命运了。'
    },
    'sample': {
        id: 'sample',
        label: 'Sampling (Gibbs)',
        icon: <Zap size={16}/>,
        what: '掷硬币时刻（吉布斯采样）。根据计算出的概率 P，随机决定当前状态是 0 还是 1。这一步引入了非确定性，是玻尔兹曼机的灵魂。',
        problem: '解决“局部死锁”和“缺乏创造力”的问题。如果每次只取最大概率（贪心），系统会瞬间卡死在最近的坑里出不来。引入随机性（热涨落）让系统有机会“犯错”，从而跳出小坑，寻找真正的大谷底。',
        io: { in: '概率 P', out: '新状态 s (0/1)' },
        missing: '如果不采样，网络就像只会背书的书呆子，没有创造力，也就失去了生成新的梦境的能力。它只能复读，不能联想。',
        level: 'Level 0.2 / Level 3',
        levelId: 0,
        example: '即使 P=0.99，也有一位“捣蛋鬼”有 1% 的几率把它变成 0。这种偶然的变异是进化的关键。',
        causalNext: '有了这套状态更新机制，我们就可以分“白天”和“晚上”两种情况来训练这个网络了。'
    },
    'pos': {
        id: 'pos',
        label: 'Positive Phase (Clamp)',
        icon: <CheckCircle size={16}/>,
        what: '白天模式（钳制阶段）。强制把可见层神经元(V)的状态设置为训练数据(如猫的像素)，并锁定它们不许动。只让隐藏层(H)根据权重自由跳动。',
        problem: '解决“学什么”的问题。网络本身是一张白纸，我们需要把现实世界的真理（数据）强行注入给它。告诉它：“看着，这才是正确答案，好好感受这种状态下的内部反应。”',
        io: { in: '训练数据 (Data)', out: '被钳制的 V, 响应的 H' },
        missing: '如果不固定现实样本，网络就没有学习的目标，不知道该模仿谁，只能在那自嗨。',
        level: 'Level 4 / 5',
        levelId: 4,
        example: '给网络看一张“猫”的照片。此时 V 被固定为猫的像素，H 会自动调整去解释“为什么会有猫”（比如提取出耳朵、胡须特征）。',
        causalNext: '在固定现实的情况下，我们要统计一下，神经元们是怎么互动的（共现频率）。'
    },
    'stats': {
        id: 'stats',
        label: 'Statistics <vh>',
        icon: <BarChart3 size={16}/>,
        what: '共现统计（Co-occurrence）。记录两个神经元 i 和 j “同时亮起”的频率。这是 Hebbian Learning 的核心：Fire together, wire together。',
        problem: '解决“关系量化”问题。单次的状态跳动是随机的，没有意义。只有通过长时间（或多次）的统计，算出“它们经常一起出现”的概率，才能作为修改权重的依据。',
        io: { in: 'V 和 H 的状态序列', out: '共现矩阵 <vh>_pos' },
        missing: '没有统计，就没法知道哪些连接是重要的。比如“有胡须”和“有猫耳”经常同时出现，这个统计量就是它们之间强连接的证据。',
        level: 'Level 3 / 4',
        levelId: 3,
        example: '如果在看猫时，V1(左上角)和H3(特征检测器)总是同时亮，说明 <v1h3> 很高，它们是好朋友。',
        causalNext: '记住了现实的统计特征后，我们把手放开，看看网络自己“以为”的世界是什么样的（做梦）。'
    },
    'neg': {
        id: 'neg',
        label: 'Negative Phase (Dream)',
        icon: <ArrowRight size={16}/>,
        what: '夜晚模式（自由联想/做梦）。放开可见层，不再给它看照片。让网络根据当前的权重记忆，自由地生成它认为合理的画面 (V\')。',
        problem: '解决“去伪”问题。光知道什么是对的还不够，必须知道网络“哪里搞错了”。负相暴露了网络当前的偏见、幻觉和错误记忆。我们需要把这些错误的倾向压下去。',
        io: { in: '当前权重 W', out: '梦境 V\' (Reconstruction)' },
        missing: '如果不做梦（负相），网络权重会无限增强，最终看到什么都觉得是对的（能量爆炸）。负相提供了抑制信号，维持平衡。',
        level: 'Level 4 / 5',
        levelId: 4,
        example: '闭上眼，尝试画出刚才那只猫。你可能会画歪，或者画成狗。这个画歪的图 V\' 就是负相状态。',
        causalNext: '现在我们有了“现实统计”和“梦境统计”，可以比较它们的差距了。'
    },
    'update': {
        id: 'update',
        label: 'Update Weights',
        icon: <RotateCcw size={16}/>,
        what: '学习更新。根据 (现实统计 - 梦境统计) 的差值，修改权重。规则：现实里有、梦里没 -> 加强；梦里有、现实里没 -> 惩罚。',
        problem: '解决“修正误差”问题。这是算法的终极目的：通过微调权重，把梦境拉向现实，雕刻能量地形，让正确答案的坑越来越深。',
        io: { in: 'Pos统计, Neg统计', out: '新的权重 W' },
        missing: '如果不更新权重，网络永远不会进步，永远在犯同样的错。',
        level: 'Level 1 / 4',
        levelId: 1,
        example: '如果现实中 V1,H1 一起亮(0.8)，但做梦时它们很少一起亮(0.2)，说明连接太弱，需要 Δw += 0.1 * (0.8 - 0.2)。',
        causalNext: '权重更新后，网络变得更聪明了一点。回到起点，准备处理下一个数据。'
    }
};

const ORDERED_IDS = ['binary', 'score', 'sigmoid', 'sample', 'pos', 'stats', 'neg', 'update'];

const OrientationDock: React.FC<OrientationDockProps> = ({ onComplete, onOpenMenu, onSkip, onRestart }) => {
    const [step, setStep] = useState(1);
    const [showRescue, setShowRescue] = useState(false);
    const [isFooterExpanded, setIsFooterExpanded] = useState(true);
    
    // --- STEP 1 STATE ---
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
    const [storyPlaying, setStoryPlaying] = useState(false);
    const [storyIndex, setStoryIndex] = useState(-1);
    
    // Tutorial Phase State: 'read_task' -> 'click_node' -> 'exploring'
    const [tutorialPhase, setTutorialPhase] = useState<'read_task' | 'click_node' | 'exploring'>('read_task');

    // Effects for Tutorial Sequencing
    useEffect(() => {
        // Only run this sequence on Step 1 initial entry
        if (step === 1 && visitedNodes.size === 0) {
            if (tutorialPhase === 'read_task') {
                setIsFooterExpanded(true); // Ensure footer is visible
                const timer = setTimeout(() => setTutorialPhase('click_node'), 3500);
                return () => clearTimeout(timer);
            }
        } else {
            // If we move past step 1 or have visited nodes, ensure we are in exploring
            if(tutorialPhase !== 'exploring') setTutorialPhase('exploring');
        }
    }, [step, tutorialPhase, visitedNodes.size]);

    // ... (rest of the state from previous)
    
    // --- STEP 2,3,4 STATE ---
    const [methodTab, setMethodTab] = useState<'phenomenon' | 'action' | 'formula'>('phenomenon');
    const [formulaAcknowledged, setFormulaAcknowledged] = useState(false);
    const [controlChecks, setControlChecks] = useState({ run: false, slider: false, help: false, rescue: false });
    const [mockRunning, setMockRunning] = useState(false);
    const [mockSliderVal, setMockSliderVal] = useState(50);
    const [simState, setSimState] = useState<'idle' | 'stuck' | 'resolved'>('idle');

    useEffect(() => {
        let timer: any;
        if (storyPlaying) {
            timer = setInterval(() => {
                setStoryIndex(prev => {
                    const next = prev + 1;
                    if (next >= ORDERED_IDS.length) { setStoryPlaying(false); return -1; }
                    setActiveNodeId(ORDERED_IDS[next]);
                    setVisitedNodes(p => new Set(p).add(ORDERED_IDS[next]));
                    return next;
                });
            }, 3500); 
        } else { setStoryIndex(-1); }
        return () => clearInterval(timer);
    }, [storyPlaying]);

    const handleNextNode = () => { if (!activeNodeId) return; setActiveNodeId(ORDERED_IDS[(ORDERED_IDS.indexOf(activeNodeId) + 1) % ORDERED_IDS.length]); };
    const handlePrevNode = () => { if (!activeNodeId) return; setActiveNodeId(ORDERED_IDS[(ORDERED_IDS.indexOf(activeNodeId) - 1 + ORDERED_IDS.length) % ORDERED_IDS.length]); };

    // Function to handle phase skipping on click
    const advanceTutorial = () => {
        if (step === 1 && tutorialPhase === 'read_task') {
            setTutorialPhase('click_node');
        }
    };

    const handleNodeClick = (id: string) => {
        setActiveNodeId(id);
        setVisitedNodes(p => new Set(p).add(id));
        setStoryPlaying(false);
        // Advance tutorial phase if needed
        if (tutorialPhase !== 'exploring') setTutorialPhase('exploring');
    };

    const getPanelContent = () => {
        switch(step) {
            case 1:
                const count = visitedNodes.size;
                return {
                    goal: `探索闭环节点 (${count}/3)`,
                    action: "点击圆环上的图标",
                    observe: "右侧的解释卡片",
                    why: "建立对算法全貌的认知。",
                    canNext: count >= 3
                };
            case 2:
                return {
                    goal: "建立物理直觉",
                    action: "按顺序点击三张卡片",
                    observe: "学习方法的转变",
                    why: "公式只是总结，现象才是基础。",
                    canNext: formulaAcknowledged
                };
            case 3:
                const checks = Object.values(controlChecks).filter(Boolean).length;
                return {
                    goal: `熟悉操作控件 (${checks}/4)`,
                    action: "点击红框高亮的区域",
                    observe: "界面的反馈",
                    why: "磨刀不误砍柴工。",
                    canNext: checks >= 4
                };
            case 4:
                return {
                    goal: "学会使用求助",
                    action: "遇到卡顿后点击求助",
                    observe: "解决方案",
                    why: "遇到问题知道去哪找答案。",
                    canNext: simState === 'resolved'
                };
            default: return { goal: "", action: "", observe: "", why: "", canNext: false };
        }
    };

    const getRescueContent = (s: number): RescueContent => {
        switch(s) {
            case 1: return {
                tldr: "不要死记硬背！这个圆环地图是你后面所有关卡的导航图。",
                why: [
                    "很多同学学到后面就晕了，不知道‘我现在在干嘛’。",
                    "其实整个算法就这 8 步，无限循环。",
                    "看懂这个地图，你就掌握了全局观。"
                ],
                io: { in: ["点击节点"], out: ["理解步骤含义"], next: "学习观" },
                micro: [
                    "点击圆环上的圆圈图标（任意一个）。",
                    "阅读右侧弹出的【What】【Why】【Example】。",
                    "点击弹窗里的【下一环】按钮，感受数据是怎么流动的。",
                    "至少点亮 3 个节点，进度条才会走。"
                ],
                math: { title: "无公式", desc: "本阶段不涉及计算，只看逻辑流。", example: [] },
                faq: [
                    {q: "必须按顺序点吗？", a: "不用，随便点。但建议按顺时针方向看，符合因果关系。"}
                ],
                debug: { check: "点击节点没反应？", fix: "请确保点击的是圆圈图标本身，而不是空白处。" }
            };
            case 2: return {
                tldr: "先看现象，再动手，最后才看公式。这是我们要建立的‘物理直觉’。",
                why: [
                    "教科书通常上来就给公式，但这很反直觉。",
                    "我们要先看到‘球往低处滚’（现象），",
                    "然后自己试着‘抬高一端’（实验），",
                    "最后才用公式 ΔE 描述它（总结）。"
                ],
                io: { in: ["点击三张卡片"], out: ["激活认知模型"], next: "熟悉控件" },
                micro: [
                    "依次点击【1.先看现象】、【2.再做实验】、【3.最后看公式】。",
                    "每张卡片代表一种学习层次。",
                    "最后点击出现的【我明白了】按钮。"
                ],
                math: { title: "Δw = η(Pos - Neg)", desc: "这个公式是最终 Boss，现在不用怕。", example: ["现在只需知道：它在奖励好行为，惩罚坏行为。"] },
                faq: [{q: "真的不用背公式吗？", a: "软件会自动计算。你需要理解的是公式背后的‘道理’。"}],
                debug: { check: "没有下一步按钮？", fix: "必须把三张卡片都点一遍，才会出现确认按钮。" }
            };
            case 3: return {
                tldr: "这是‘驾照考试’。学会怎么开这辆车，后面才不会翻车。",
                why: ["每关的界面都很像，学会通用的操作逻辑，效率翻倍。", "特别是‘采样进度条’，很多人看不懂。"],
                io: { in: ["点击各控件"], out: ["获得操作资格"], next: "求助系统" },
                micro: ["点击 Run 按钮，看到它变色。", "拖动滑块，看到数值变化。", "点击带问号的名词，查看解释。", "点击 Help 按钮，打开侧边栏。"],
                math: { title: "无", desc: "纯UI交互训练", example: [] },
                faq: [{q: "Task 3 点击没反应？", a: "请直接点击那行字右边的‘小问号’图标，而不是整行。"}],
                debug: { check: "进度不涨？", fix: "按顺序把 4 个红框标记的任务做完，每个都要点一下。" }
            };
            case 4: return {
                tldr: "遇到困难别硬撑，有三种锦囊可以用。",
                why: ["没有人能一次学会所有东西。", "知道‘哪里卡住了’比‘做对了’更重要。", "我们设计了专门的调试系统帮你。"],
                io: { in: ["模拟卡顿"], out: ["解决卡顿"], next: "正式开始" },
                micro: ["点击【试一试点击我】，发现按钮被锁住了。", "根据提示，点击左下角的【我不懂这一步】。", "在弹出的抽屉里找到解决方法（其实就是让你点一下）。"],
                math: { title: "无", desc: "", example: [] },
                faq: [{q: "点哪里求助？", a: "左下角的‘我不懂这一步’是最好用的。"}],
                debug: { check: "怎么没反应？", fix: "请先点击模拟区域的‘试一试’按钮触发剧情，然后再点求助。" }
            };
            default: return { tldr: "", why: [], io: {in:[],out:[],next:""}, micro: [], math: {title:"",desc:"",example:[]}, faq: [], debug: {check:"",fix:""} };
        }
    };

    const renderStep1 = () => {
        const activeData = activeNodeId ? LOOP_NODES_DATA[activeNodeId] : null;
        
        // Only show node hint if in 'click_node' phase and no node is active
        const showStartHint = tutorialPhase === 'click_node' && !activeNodeId && !storyPlaying;

        return (
            <div className="flex flex-col h-full relative" onClick={advanceTutorial}>
                <div className="flex-1 bg-slate-50 relative flex items-center justify-center p-4">
                    
                    {/* REASSURANCE BANNER */}
                    {!activeData && !storyPlaying && tutorialPhase !== 'read_task' && (
                        <div className="absolute top-6 left-0 right-0 flex justify-center z-20 pointer-events-none animate-in fade-in duration-1000 slide-in-from-top-4">
                            <div className="bg-white/80 backdrop-blur-md border border-slate-200 text-slate-500 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium shadow-sm flex items-center gap-2 max-w-[90%] text-center leading-tight">
                                <span className="text-lg">🍵</span>
                                <span>这一部分看不懂也没关系，主要是熟悉流程。带着问题去进行后续关卡！</span>
                            </div>
                        </div>
                    )}

                    {/* START HINT - NODE */}
                    {showStartHint && (
                        <div className="absolute top-[15%] sm:top-[18%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-none">
                            <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl border-4 border-white flex items-center gap-3 whitespace-nowrap animate-bounce">
                                <MousePointerClick size={24} />
                                <div className="text-left leading-tight">
                                    <div className="text-lg">点击圆环图标</div>
                                    <div className="text-xs opacity-80 font-normal">开始探索玻尔兹曼机的循环</div>
                                </div>
                            </div>
                            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white mt-[-2px] drop-shadow-sm"></div>
                        </div>
                    )}

                    {storyPlaying && activeData && (
                        <div className="absolute top-8 left-0 right-0 text-center z-20 animate-in fade-in slide-in-from-bottom-2">
                            <span className="bg-slate-900/90 text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl border border-slate-700">
                                {activeData.causalNext.substring(0, 20)}...
                            </span>
                        </div>
                    )}
                    <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-4xl font-black text-slate-200">RBM</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cycle</div>
                            </div>
                        </div>
                        {ORDERED_IDS.map((id, i) => {
                            const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
                            const x = Math.cos(angle) * 35 + 50; 
                            const y = Math.sin(angle) * 35 + 50;
                            const isActive = activeNodeId === id; const isVisited = visitedNodes.has(id);
                            
                            // Highlight the first node (index 0) if user needs to click
                            const isHintTarget = showStartHint && i === 0;

                            return (
                                <button key={id} onClick={(e) => { e.stopPropagation(); handleNodeClick(id); }}
                                    className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center shadow-sm transition-all duration-300 z-10 
                                    ${isActive ? 'bg-blue-600 border-blue-600 text-white scale-125 ring-4 ring-blue-100 shadow-xl' : 
                                      isVisited ? 'bg-white border-emerald-400 text-emerald-600' : 
                                      isHintTarget ? 'bg-white border-blue-400 text-blue-500 ring-4 ring-blue-200 scale-125 shadow-2xl z-20 animate-pulse' :
                                      'bg-white border-slate-200 text-slate-300 hover:border-blue-300'}`}
                                    style={{ left: `${x}%`, top: `${y}%` }}>{LOOP_NODES_DATA[id].icon}</button>
                            );
                        })}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none -z-0 opacity-20"><circle cx="50%" cy="50%" r="35%" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-slate-400"/></svg>
                    </div>
                    <div className="absolute bottom-4 left-4 flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setStoryPlaying(!storyPlaying); }} className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${storyPlaying ? 'bg-orange-100 text-orange-600' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
                            {storyPlaying ? <Pause size={16}/> : <Play size={16}/>} {storyPlaying ? "播放中..." : "播放闭环故事 (90s)"}
                        </button>
                    </div>
                </div>
                {activeData && !storyPlaying && (
                    <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 z-30 flex flex-col pb-48">
                        <div className="bg-slate-50 p-4 border-b flex justify-between items-center sticky top-0 z-10">
                            <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg">{activeData.icon}</div><div><div className="text-xs font-bold text-slate-400 uppercase">NODE {ORDERED_IDS.indexOf(activeData.id) + 1}/8</div><h3 className="font-bold text-slate-800">{activeData.label}</h3></div></div>
                            <button onClick={() => setActiveNodeId(null)} className="p-1 hover:bg-slate-200 rounded"><RotateCcw size={16} className="text-slate-400"/></button>
                        </div>
                        <div className="bg-blue-50/50 p-4 border-b border-blue-100">
                            <div className="flex justify-between items-center mb-3"><button onClick={handlePrevNode} className="text-xs font-bold text-blue-600 hover:bg-blue-100 px-2 py-1 rounded">◀︎ 上一环</button><button onClick={handleNextNode} className="text-xs font-bold text-blue-600 hover:bg-blue-100 px-2 py-1 rounded">下一环 ▶︎</button></div>
                            <p className="text-xs text-blue-800 italic leading-relaxed">"{activeData.causalNext}"</p>
                        </div>
                        <div className="p-4 space-y-6">
                            <section><h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><BookOpen size={16} className="text-slate-400"/> A. 这一步是什么 (What)</h4><p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{activeData.what}</p></section>
                            <section><h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Target size={16} className="text-orange-500"/> B. 解决什么困惑 (Problem)</h4><p className="text-sm text-slate-600 leading-relaxed">{activeData.problem}</p></section>
                            <div className="grid grid-cols-2 gap-4"><div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><div className="text-xs font-bold text-slate-400 uppercase mb-1">Input</div><div className="text-xs font-medium text-slate-700">{activeData.io.in}</div></div><div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100"><div className="text-xs font-bold text-emerald-500 uppercase mb-1">Output</div><div className="text-xs font-bold text-emerald-700">{activeData.io.out}</div></div></div>
                            <section><h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500"/> D. 不做会怎样 (Missing)</h4><p className="text-sm text-red-800 bg-red-50 p-3 rounded-lg border border-red-100">{activeData.missing}</p></section>
                            <section><h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Microscope size={16} className="text-purple-500"/> F. 最小例子 (Mini Example)</h4><div className="bg-slate-800 text-slate-200 p-3 rounded-lg font-mono text-xs leading-relaxed border-l-4 border-purple-500">{activeData.example}</div></section>
                            <div className="pt-4 border-t mt-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-400">E. 在哪关学？</span><button onClick={() => onOpenMenu()} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1">去 {activeData.level} <ArrowRight size={10}/></button></div></div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderStep2 = () => (
        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <div className="text-center space-y-2"><h3 className="text-2xl font-black text-slate-800">拒绝死记硬背</h3><p className="text-slate-500">我们反对直接把公式甩在你脸上。请遵循以下学习顺序：</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl sm:h-[300px] h-auto p-4 sm:p-0">
                <button onClick={() => setMethodTab('phenomenon')} className={`rounded-2xl p-6 border-2 text-left transition-all duration-300 flex flex-col justify-between ${methodTab==='phenomenon' ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100 shadow-xl scale-105 z-10' : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60'}`}><div className="w-12 h-12 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl mb-4">1</div><div><h4 className="font-black text-lg text-slate-800 mb-2">先看现象</h4><p className="text-sm text-slate-600 leading-relaxed">观察小球怎么跳、颜色怎么变、能量坑深不深。</p></div><div className="mt-4 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded w-fit">Observation</div></button>
                <button onClick={() => setMethodTab('action')} className={`rounded-2xl p-6 border-2 text-left transition-all duration-300 flex flex-col justify-between ${methodTab==='action' ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-100 shadow-xl scale-105 z-10' : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60'}`}><div className="w-12 h-12 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div><div><h4 className="font-black text-lg text-slate-800 mb-2">再做实验</h4><p className="text-sm text-slate-600 leading-relaxed">亲手拖动滑块、点击采样，验证你的猜想。</p></div><div className="mt-4 text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded w-fit">Experiment</div></button>
                <button onClick={() => setMethodTab('formula')} className={`rounded-2xl p-6 border-2 text-left transition-all duration-300 flex flex-col justify-between ${methodTab==='formula' ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100 shadow-xl scale-105 z-10' : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60'}`}><div className="w-12 h-12 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center font-bold text-xl mb-4">3</div><div><h4 className="font-black text-lg text-slate-800 mb-2">最后看公式</h4><p className="text-sm text-slate-600 leading-relaxed">公式不是为了背诵，而是为了总结你刚才看到的规律。</p></div><div className="mt-4 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded w-fit">Conclusion</div></button>
            </div>
            {methodTab === 'formula' && (<div className="bg-slate-900 text-white p-6 rounded-xl max-w-xl w-full animate-in slide-in-from-bottom-4 mx-4 sm:mx-0"><div className="font-mono text-center text-lg mb-4">Δw = η ( <span className="text-emerald-400">Positive</span> - <span className="text-red-400">Negative</span> )</div><p className="text-center text-sm text-slate-400 mb-4">这是核心公式。看不懂没关系，你只需要知道：<br/>它的意思是 <strong>“奖励现实，惩罚梦境”</strong>。</p><button onClick={() => setFormulaAcknowledged(true)} disabled={formulaAcknowledged} className={`w-full py-3 rounded-lg font-bold transition-all ${formulaAcknowledged ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'}`}>{formulaAcknowledged ? "✅ 已达成共识" : "我明白了，先不用背"}</button></div>)}
        </div>
    );

    const renderStep3 = () => (
        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <div className="text-center space-y-2"><h3 className="text-2xl font-black text-slate-800">操作校准</h3><p className="text-slate-500">请点亮下面 4 个红框控制灯，获得操作资格。</p></div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-8 mx-4 sm:mx-0">
                <div className={`p-4 rounded-xl border-2 transition-all ${controlChecks.run ? 'border-emerald-200 bg-emerald-50 opacity-50' : 'border-red-400 bg-white shadow-md shadow-red-100'}`}><div className="flex justify-between items-center mb-2"><span className={`text-xs font-bold uppercase ${controlChecks.run ? 'text-slate-400' : 'text-red-500'}`}>Task 1</span>{controlChecks.run && <CheckCircle size={16} className="text-emerald-500"/>}</div><button onClick={() => { setMockRunning(!mockRunning); if(!controlChecks.run) setControlChecks(prev => ({...prev, run: true})) }} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${mockRunning ? 'bg-orange-100 text-orange-600' : 'bg-slate-900 text-white hover:bg-slate-700'}`}>{mockRunning ? <Pause size={16}/> : <Play size={16}/>}{mockRunning ? "Running..." : "点击运行"}</button></div>
                <div className={`p-4 rounded-xl border-2 transition-all ${controlChecks.slider ? 'border-emerald-200 bg-emerald-50 opacity-50' : 'border-red-400 bg-white shadow-md shadow-red-100'}`}><div className="flex justify-between items-center mb-2"><span className={`text-xs font-bold uppercase ${controlChecks.slider ? 'text-slate-400' : 'text-red-500'}`}>Task 2</span>{controlChecks.slider && <CheckCircle size={16} className="text-emerald-500"/>}</div><div className="space-y-2"><div className="flex justify-between text-xs font-bold text-slate-600"><span>参数调节</span><span>{mockSliderVal}</span></div><input type="range" min="0" max="100" value={mockSliderVal} onChange={(e) => { setMockSliderVal(parseInt(e.target.value)); if(!controlChecks.slider) setControlChecks(prev => ({...prev, slider: true})) }} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/></div></div>
                <div className={`p-4 rounded-xl border-2 transition-all ${controlChecks.help ? 'border-emerald-200 bg-emerald-50 opacity-50' : 'border-red-400 bg-white shadow-md shadow-red-100'}`}><div className="flex justify-between items-center mb-2"><span className={`text-xs font-bold uppercase ${controlChecks.help ? 'text-slate-400' : 'text-red-500'}`}>Task 3</span>{controlChecks.help && <CheckCircle size={16} className="text-emerald-500"/>}</div><div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors" onClickCapture={() => !controlChecks.help && setControlChecks(prev => ({...prev, help: true}))}><span className="text-sm font-bold text-slate-600">看不懂的名词</span><div><TermHelp term="energy" /></div></div><p className="text-[10px] text-slate-400 mt-2 text-center">点击问号试试</p></div>
                <div className={`p-4 rounded-xl border-2 transition-all ${controlChecks.rescue ? 'border-emerald-200 bg-emerald-50 opacity-50' : 'border-red-400 bg-white shadow-md shadow-red-100'}`}><div className="flex justify-between items-center mb-2"><span className={`text-xs font-bold uppercase ${controlChecks.rescue ? 'text-slate-400' : 'text-red-500'}`}>Task 4</span>{controlChecks.rescue && <CheckCircle size={16} className="text-emerald-500"/>}</div><button onClick={() => { setShowRescue(true); if(!controlChecks.rescue) setControlChecks(prev => ({...prev, rescue: true})) }} className="w-full py-2 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors"><HelpCircle size={14}/> 我不懂这一步</button><p className="text-[10px] text-slate-400 mt-2 text-center">点击这里打开万能抽屉</p></div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <div className="text-center space-y-2"><h3 className="text-2xl font-black text-slate-800">求助演习：卡住了怎么办？</h3><p className="text-slate-500">模拟场景：你遇到了一个无法点击的按钮。</p></div>
            <div className="bg-slate-100 p-8 rounded-3xl border-2 border-dashed border-slate-300 w-full max-w-xl flex flex-col items-center gap-6 relative overflow-hidden mx-4 sm:mx-0">
                {simState === 'stuck' && (<div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center flex-col animate-in fade-in"><div className="bg-white p-4 rounded-xl shadow-2xl text-center max-w-xs animate-in zoom-in"><AlertTriangle size={32} className="text-red-500 mx-auto mb-2"/><h4 className="font-bold text-slate-800 mb-1">操作受限</h4><p className="text-xs text-slate-600 mb-4">在真实实验中，如果前置条件未满足，按钮会变灰。</p><button onClick={() => { setShowRescue(true); setSimState('resolved'); }} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-500">点击“我不懂”查看原因</button></div></div>)}
                <button onClick={() => setSimState('stuck')} disabled={simState === 'resolved'} className={`px-8 py-4 rounded-xl font-black text-lg shadow-lg transition-all ${simState === 'resolved' ? 'bg-emerald-500 text-white cursor-default' : 'bg-white text-slate-800 hover:scale-105'}`}>{simState === 'resolved' ? "✅ 问题已解决" : "试一试点击我"}</button>
                <div className="text-xs text-slate-400">{simState === 'resolved' ? "恭喜！你学会了如何使用救援系统。" : "点击上面的按钮触发剧情"}</div>
            </div>
        </div>
    );

    const panel = getPanelContent();

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 relative overflow-hidden font-sans">
            <LevelNav 
                title="Part 1: 入门区" 
                subTitle="Orientation Dock" 
                currentStep={step} 
                totalSteps={4} 
                onPrevStep={() => setStep(s => Math.max(1, s-1))} 
                onNextStep={() => setStep(s => Math.min(4, s+1))} 
                onPrevLevel={() => {}} 
                onRestart={onRestart || (() => window.location.reload())} 
                onSkip={onSkip} 
                canPrevStep={step > 1} 
                canPrevLevel={false} 
                onOpenMenu={onOpenMenu} 
            />
            <div className="flex-grow overflow-hidden relative">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>
            
            {/* OVERLAY FOR TASK READING PHASE */}
            {step === 1 && tutorialPhase === 'read_task' && (
                <div 
                    className="fixed inset-0 z-[45] bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-end pb-48 animate-in fade-in cursor-pointer" 
                    onClick={advanceTutorial}
                >
                    <div className="flex flex-col items-center gap-4 animate-bounce">
                        <div className="text-white text-2xl font-black drop-shadow-lg text-center">
                            第一步：先看这里领取任务
                            <div className="text-sm font-normal opacity-80 mt-1">First: Read your mission here</div>
                        </div>
                        <ArrowDown size={48} className="text-orange-400 drop-shadow-lg" strokeWidth={3} />
                    </div>
                </div>
            )}

            <div 
                className={`fixed bottom-0 left-0 right-0 z-[50] shadow-2xl transition-all duration-300 ${
                    tutorialPhase === 'read_task' ? 'ring-4 ring-orange-400 shadow-orange-900/50 scale-[1.02] -translate-y-2' : ''
                }`}
                style={{ transform: isFooterExpanded ? 'translateY(0)' : 'translateY(100%)' }}
            >
                {/* Toggle Handle */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0">
                    <button 
                        onClick={() => setIsFooterExpanded(!isFooterExpanded)}
                        className="bg-slate-900 text-white px-4 py-1.5 rounded-t-xl font-bold text-xs flex items-center gap-1 shadow-lg border-t border-x border-slate-700 hover:bg-slate-800 transition-colors"
                    >
                        {isFooterExpanded ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
                        {isFooterExpanded ? "收起指引" : "展开任务指引"}
                    </button>
                </div>

                {/* Footer Content */}
                <div className="bg-slate-900 border-t border-slate-700 p-4">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-stretch text-white">
                        <div className="flex flex-col justify-between shrink-0 min-w-[100px] md:border-r border-slate-700 pr-4"><div><div className="text-orange-500 font-black text-xs uppercase tracking-wider mb-1">TASK {step} / 4</div><div className="text-lg font-black font-mono leading-tight">{panel.goal}</div></div><button onClick={() => setShowRescue(true)} className="mt-2 text-xs text-blue-400 hover:text-white flex items-center gap-1 transition-colors font-bold px-2 py-1 rounded bg-blue-900/30 hover:bg-blue-600 w-fit"><HelpCircle size={14}/> 我不懂这一步</button></div>
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm"><div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30 relative overflow-hidden"><div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div><div className="text-[10px] font-bold text-blue-300 uppercase mb-1 flex items-center gap-1 pl-2"><MousePointerClick size={12}/> 行动 (Action)</div><div className="pl-2 font-medium text-blue-100">{panel.action}</div></div><div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"><div className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Microscope size={12}/> 观察 (Observe)</div><div className="text-slate-300">{panel.observe}</div></div><div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/30"><div className="text-[10px] font-bold text-purple-300 uppercase mb-1 flex items-center gap-1"><Target size={12}/> 意义 (Why)</div><div className="text-purple-100 text-xs leading-relaxed">{panel.why}</div></div></div>
                        <div className="flex items-center pl-4 md:border-l border-slate-700">{step < 4 ? (<button onClick={() => setStep(s => s+1)} disabled={!panel.canNext} className={`p-3 rounded-full shadow-lg transition-transform active:scale-95 ${panel.canNext ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}><ChevronRight size={24}/></button>) : (<button onClick={onComplete} disabled={!panel.canNext} className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${panel.canNext ? 'bg-emerald-600 text-white hover:bg-emerald-500 animate-bounce' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}><Activity size={18}/> 获得执照，进入 Level 0</button>)}</div>
                    </div>
                </div>
            </div>
            {showRescue && (<UniversalRescueDrawer step={step} title={`Orientation Step ${step}`} content={getRescueContent(step)} onClose={() => setShowRescue(false)} onRetry={() => { if(step===4) setSimState('idle'); setShowRescue(false); }} />)}
        </div>
    );
};

export default OrientationDock;
