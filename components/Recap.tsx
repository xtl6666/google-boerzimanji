
import React, { useState } from 'react';
import { 
    ArrowLeft, ChevronDown, ChevronUp, ChevronRight, 
    BookOpen, Activity, Zap, Scale, Brain, 
    Lightbulb, HelpCircle, Layout, MousePointerClick, 
    Target, Microscope, Map, RotateCcw,
    ArrowRight, AlertTriangle 
} from 'lucide-react';
import TermHelp from './TermHelp';
import UniversalRescueDrawer, { RescueContent } from './UniversalRescueDrawer';
import { TERM_DEFS } from './Level3Terms';

interface RecapProps {
    onBack: () => void;
    onGoToLevel: (levelId: number, stepId: number) => void;
}

// --- DATA: LEVEL SUMMARIES ---
const LEVEL_SUMMARIES = [
    {
        id: 0,
        title: "Level 0: 基础校准 (Calibration)",
        oneLiner: "微观物理法则：二值、概率与采样。",
        phenomena: [
            "神经元只有 0 或 1 两种状态，没有中间值。",
            "概率 P 是稳定的趋势，采样 Sample 是波动的现实。",
            "Sigmoid 曲线把任意范围的分数 x 压缩成了 0~1 的概率。"
        ],
        actions: [
            "点击开关切换 0/1。",
            "拖动概率条 P，观察掷硬币结果。",
            "观察邻居 B 如何改变 A 的状态。"
        ],
        terms: ["binary", "probability", "sampling", "sigmoid"],
        loopPhase: "Binary State → Probability → Sample",
        outcome: "学会了如何根据输入 x 计算概率 P，并掷硬币决定状态 s。",
        nextUse: "这是所有神经元每次更新时都在做的微观动作。",
        confusion: [
            "误区：神经元可以是 0.5。真相：只能是 0 或 1，0.5 只是概率。",
            "误区：概率高一定会亮。真相：99% 也可能随到 0 (黑天鹅)。"
        ],
        reviewTarget: { level: 0, step: 3 }
    },
    {
        id: 1,
        title: "Level 1: 能量地形 (Energy Landscape)",
        oneLiner: "宏观目标：一切为了降低能量。",
        phenomena: [
            "当 w>0 时，同向状态能量低（变绿/谷底）。",
            "当 w<0 时，反向状态能量低。",
            "w 绝对值越大，坑越深，越难跳出来。"
        ],
        actions: [
            "拖动权重 w 滑块，观察地形翻转。",
            "点击状态列表，查看能量计算公式。",
            "寻找能量最低的‘最舒适状态’。"
        ],
        terms: ["energy", "weight", "landscape"],
        loopPhase: "Configuration → Energy E",
        outcome: "建立了‘训练就是挖坑’的直觉。w 决定了哪里是坑。",
        nextUse: "为后面的采样提供动力学解释（为什么要往坑里跳）。",
        confusion: [
            "误区：能量是正的好。真相：能量越低（越负）越稳定。",
            "误区：w 是概率。真相：w 是造地形的铲子，间接影响概率。"
        ],
        reviewTarget: { level: 1, step: 1 }
    },
    {
        id: 2,
        title: "Level 2: 偏置与退火 (Bias & Annealing)",
        oneLiner: "打破对称性，并学会跳出陷阱。",
        phenomena: [
            "调整 b 可以让天平向 0 或 1 倾斜。",
            "温度 T 低时，小球死在坑里；T 高时，小球乱跳翻墙。",
            "模拟退火（先热后冷）能找到真正的全局最低点。"
        ],
        actions: [
            "拖动 bias 滑块，移动谷底位置。",
            "调节温度 T，观察翻越能垒（红色墙）的概率。",
            "执行‘模拟退火’过程。"
        ],
        terms: ["bias", "temperature", "local_minima", "annealing", "barrier"],
        loopPhase: "Energy → Probability (via Temp)",
        outcome: "理解了 Bias 是‘自带倾向’，T 是‘随机程度’。",
        nextUse: "Sampling 过程中必须有 T 参与，否则系统动不起来。",
        confusion: [
            "误区：Bias 和 Weight 一样。真相：W 连接两个点，B 只影响自己。",
            "误区：一直高温好。真相：一直高温就存不住记忆（太乱）。"
        ],
        reviewTarget: { level: 2, step: 3 }
    },
    {
        id: 3,
        title: "Level 3: 隐变量 (Hidden Units)",
        oneLiner: "内部特征：解释可见数据的幕后推手。",
        phenomena: [
            "只看 A/B 无法解释复杂关系，需要 H 参与。",
            "固定 A/B 时，H 依然在闪烁（在寻找解释）。",
            "H 可以反向重建出 A/B（生成能力）。"
        ],
        actions: [
            "固定可见单元 A, B，采样隐藏单元 H。",
            "调整权重，观察 H 的激活频率。",
            "运行‘往返重建’流水线。"
        ],
        terms: ["hidden_unit", "visible_units", "net_input", "reconstruct"],
        loopPhase: "V → H (Inference) & H → V (Generation)",
        outcome: "明白了网络不仅有输入输出，还有‘脑补’的中间层。",
        nextUse: "Level 4/5 的核心结构，所有的学习都发生在 V-H 连接上。",
        confusion: [
            "误区：H 是输出结果。真相：H 是特征（比如‘有猫耳’），V 才是图像。",
            "误区：H 是确定的。真相：H 是对当前输入的一种概率性解释。"
        ],
        reviewTarget: { level: 3, step: 4 }
    },
    {
        id: 4,
        title: "Level 4: 核心闭环 (The Loop)",
        oneLiner: "学习的本质：现实减去梦境。",
        phenomena: [
            "正相（Day）：固定 V，H 随之跳动。",
            "负相（Night）：放开 V，全网自由乱跳（做梦）。",
            "权重变化 Δw 取决于 (正相共现 - 负相共现)。"
        ],
        actions: [
            "点击‘运行正相’统计 Pos Stats。",
            "点击‘运行负相’统计 Neg Stats。",
            "点击‘执行更新’修改权重。"
        ],
        terms: ["positive_phase", "negative_phase", "clamp", "delta_w", "co_occurrence"],
        loopPhase: "Pos Stats → Neg Stats → Δw → Update",
        outcome: "第一次完整跑通了论文公式，理解了‘赫布学习’的修正版。",
        nextUse: "这是训练算法的原子操作，Level 5 只是把它重复了很多次。",
        confusion: [
            "误区：负相是错误的。真相：负相是模型‘当前以为’的世界，必须把它压下去。",
            "误区：一次更新就够了。真相：每次只改一点点（学习率），需要很多轮。"
        ],
        reviewTarget: { level: 4, step: 4 }
    },
    {
        id: 5,
        title: "Level 5: 综合实验 (Full RBM)",
        oneLiner: "量变引起质变：从像素到概念。",
        phenomena: [
            "H 单元逐渐分工，有的管耳朵，有的管眼睛。",
            "梦境（V'）从杂乱无章变得越来越像猫。",
            "相似度曲线震荡上升，最终收敛。"
        ],
        actions: [
            "点击‘自动训练’，观察 Epoch 计数。",
            "悬停 H 单元，查看其特征视野（红/蓝权重）。",
            "观察重建图像的变化。"
        ],
        terms: ["rbm", "cd_1", "recon_rate"],
        loopPhase: "Full Loop Iteration",
        outcome: "见证了神经网络如何从随机初始状态‘涌现’出记忆能力。",
        nextUse: "这就是深度学习（Deep Learning）最基础的积木。",
        confusion: [
            "误区：训练是为了记住这张图。真相：是为了学会‘猫的特征分布’，从而能生成猫。",
            "误区：所有 H 都要亮。真相：稀疏激活（只有几个亮）通常更好。"
        ],
        reviewTarget: { level: 5, step: 7 }
    }
];

// --- DATA: VARIABLES ---
const VARIABLES = [
    { sym: "w", name: "权重 (Weight)", mean: "连接强度/投票权", ui: "连线粗细/热力图", role: "造山者：决定地形形状" },
    { sym: "b", name: "偏置 (Bias)", mean: "个体倾向/门槛", ui: "滑块/节点参数", role: "倾斜者：调节激活难易" },
    { sym: "T", name: "温度 (Temp)", mean: "随机噪声水平", ui: "Level 2 滑块", role: "扰动者：决定翻墙概率" },
    { sym: "E", name: "能量 (Energy)", mean: "系统不适度", ui: "地形高度/数值", role: "裁判：越低越稳定" },
    { sym: "x", name: "净输入 (Net Input)", mean: "总支持票数", ui: "Level 3 面板", role: "推手：决定变1的欲望" },
    { sym: "P", name: "概率 (Prob)", mean: "变1的可能性", ui: "Sigmoid/频率条", role: "翻译官：把 x 变成 0~1" },
    { sym: "Pos", name: "正相 (Positive)", mean: "现实/数据钳制", ui: "Level 4 蓝色条", role: "老师：教正确答案" },
    { sym: "Neg", name: "负相 (Negative)", mean: "梦境/模型重构", ui: "Level 4 红色条", role: "学生：展示当前理解" },
    { sym: "Δw", name: "更新量 (Delta)", mean: "学习步伐", ui: "Level 4 日志", role: "修正者：Pos - Neg" },
];

const Recap: React.FC<RecapProps> = ({ onBack, onGoToLevel }) => {
    const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
    const [showVars, setShowVars] = useState(false);
    const [showRescue, setShowRescue] = useState(false);

    const toggleLevel = (id: number) => {
        setExpandedLevel(prev => prev === id ? null : id);
    };

    const rescueContent: RescueContent = {
        tldr: "这一页是你大脑的‘整理柜’。它把之前散落在各关的知识点串成了一条线。",
        why: ["碎片化的知识容易忘，结构化的知识才牢固。", "看清全貌（Big Picture）才能理解细节的意义。"],
        io: { in: ["阅读总结"], out: ["完整认知"], next: "回到实验" },
        micro: ["先看顶部总纲", "逐个点开卡片复习", "查阅变量表"],
        math: { title: "核心公式", desc: "Δw = η(Pos - Neg)", example: [] },
        faq: [{q: "一定要全背下来吗？", a: "不用。知道‘去哪找’比‘背下来’更重要。"}],
        debug: { check: "太长不看？", fix: "只看每一张卡片的第一句‘一句话总结’即可。" }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-32 font-sans">
            
            {/* --- HEADER --- */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20}/>
                    </button>
                    <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Map className="text-blue-600"/> 实验复盘 (Recap)
                    </h1>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                    全景概览 (The Big Picture)
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* --- SECTION 1: THE BIG PICTURE --- */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-24 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    
                    <div className="relative z-10 text-center space-y-6">
                        <h2 className="text-2xl sm:text-3xl font-black text-blue-100">
                            "玻尔兹曼机学习 = 让梦境统计逼近现实统计"
                        </h2>
                        
                        {/* Formula */}
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl inline-block">
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-xl sm:text-2xl font-mono">
                                <span className="text-emerald-400 font-bold">Δw</span>
                                <span>=</span>
                                <span className="text-slate-400">η</span>
                                <span>(</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-blue-300 font-bold">⟨s<sub className="text-xs">i</sub>s<sub className="text-xs">j</sub>⟩<sub className="text-sm">pos</sub></span>
                                    <span className="text-[10px] text-blue-200/60 uppercase tracking-widest">现实 (Reality)</span>
                                </div>
                                <span>−</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-red-300 font-bold">⟨s<sub className="text-xs">i</sub>s<sub className="text-xs">j</sub>⟩<sub className="text-sm">neg</sub></span>
                                    <span className="text-[10px] text-red-200/60 uppercase tracking-widest">梦境 (Dream)</span>
                                </div>
                                <span>)</span>
                            </div>
                        </div>

                        {/* Loop Diagram */}
                        <div className="flex flex-wrap justify-center items-center gap-2 text-xs sm:text-sm font-bold text-slate-400">
                            <span className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700">二值状态</span>
                            <ArrowRight size={14}/>
                            <span className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700">概率 (Sigmoid)</span>
                            <ArrowRight size={14}/>
                            <span className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700">采样 (Gibbs)</span>
                            <ArrowRight size={14}/>
                            <span className="px-3 py-1 bg-blue-900/50 text-blue-200 rounded-full border border-blue-800">正相 (Pos)</span>
                            <span className="text-slate-600">+</span>
                            <span className="px-3 py-1 bg-red-900/50 text-red-200 rounded-full border border-red-800">负相 (Neg)</span>
                            <ArrowRight size={14}/>
                            <span className="px-3 py-1 bg-emerald-900/50 text-emerald-200 rounded-full border border-emerald-800">更新权重</span>
                        </div>
                    </div>
                </div>

                {/* --- SECTION 2: LEVEL CARDS --- */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider pl-2 flex items-center gap-2">
                        <Layout size={16}/> 逐关复盘 (Level Breakdown)
                    </h3>
                    
                    {LEVEL_SUMMARIES.map((lvl) => (
                        <div key={lvl.id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${expandedLevel === lvl.id ? 'border-blue-500 ring-4 ring-blue-50 shadow-lg' : 'border-slate-200 shadow-sm hover:border-blue-300'}`}>
                            {/* Card Header */}
                            <button 
                                onClick={() => toggleLevel(lvl.id)}
                                className="w-full flex items-center justify-between p-5 text-left"
                            >
                                <div>
                                    <div className={`text-lg font-black ${expandedLevel === lvl.id ? 'text-blue-700' : 'text-slate-800'}`}>
                                        {lvl.title}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1 font-medium">{lvl.oneLiner}</div>
                                </div>
                                <div className={`p-2 rounded-full transition-all ${expandedLevel === lvl.id ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                                    <ChevronDown size={20}/>
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {expandedLevel === lvl.id && (
                                <div className="px-5 pb-6 pt-0 space-y-6 animate-in slide-in-from-top-2 border-t border-slate-100 mt-2">
                                    
                                    {/* Grid Layout */}
                                    <div className="grid sm:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <Microscope size={14}/> 实验现象 (Phenomena)
                                                </h4>
                                                <ul className="space-y-2">
                                                    {lvl.phenomena.map((t, i) => (
                                                        <li key={i} className="text-sm text-slate-700 flex gap-2 items-start">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                                            {t}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <MousePointerClick size={14}/> 操作步骤 (Actions)
                                                </h4>
                                                <ul className="space-y-2">
                                                    {lvl.actions.map((t, i) => (
                                                        <li key={i} className="text-sm text-slate-700 flex gap-2 items-start">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></div>
                                                            {t}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <Target size={14}/> 闭环位置 & 产物
                                                </h4>
                                                <div className="text-sm font-bold text-slate-800 mb-2">{lvl.loopPhase}</div>
                                                <div className="text-xs text-slate-600 leading-relaxed mb-2">
                                                    <span className="font-bold text-blue-600">产物：</span>{lvl.outcome}
                                                </div>
                                                <div className="text-xs text-slate-500 leading-relaxed">
                                                    <span className="font-bold text-purple-600">下一步：</span>{lvl.nextUse}
                                                </div>
                                            </div>

                                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <AlertTriangle size={14}/> 常见困惑
                                                </h4>
                                                <ul className="space-y-2">
                                                    {lvl.confusion.map((t, i) => (
                                                        <li key={i} className="text-xs text-orange-900 leading-relaxed flex gap-2 items-start">
                                                            <span className="text-orange-400">•</span> {t}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New Terms */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {lvl.terms.map(term => (
                                            <div key={term} className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1">
                                                <TermHelp term={term} label={TERM_DEFS[term]?.title || term} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex gap-3 pt-2">
                                        <button 
                                            onClick={() => onGoToLevel(lvl.reviewTarget.level, lvl.reviewTarget.step)}
                                            className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                                        >
                                            <RotateCcw size={14}/> 回到本关复习
                                        </button>
                                    </div>

                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* --- SECTION 3: VARIABLE CHEAT SHEET --- */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <button 
                        onClick={() => setShowVars(!showVars)}
                        className="w-full flex justify-between items-center p-6 hover:bg-slate-50 transition-colors"
                    >
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Activity size={20} className="text-emerald-500"/> 变量角色速查表
                        </h3>
                        {showVars ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
                    </button>
                    
                    {showVars && (
                        <div className="border-t border-slate-100 divide-y divide-slate-100">
                            {VARIABLES.map((v, i) => (
                                <div key={i} className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm items-center hover:bg-slate-50/50 transition-colors">
                                    <div className="font-bold font-mono text-lg text-blue-600 text-center sm:text-left bg-blue-50 sm:bg-transparent rounded p-2 sm:p-0">
                                        {v.sym} <TermHelp term={v.sym === 'Δw' ? 'delta_w' : v.name.split(' ')[0].toLowerCase()} label={TERM_DEFS[v.sym === 'Δw' ? 'delta_w' : v.name.split(' ')[0].toLowerCase()]?.title} />
                                    </div>
                                    <div className="font-bold text-slate-800">{v.name}</div>
                                    <div className="text-slate-500 col-span-2 sm:col-span-2 flex flex-col gap-1">
                                        <span className="font-medium text-slate-700">{v.role}</span>
                                        <span className="text-xs text-slate-400">👀 {v.ui}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* --- FOOTER GUIDE --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 z-[50] shadow-2xl">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-stretch text-white">
                    <div className="flex flex-col justify-between shrink-0 min-w-[100px] md:border-r border-slate-700 pr-4">
                        <div>
                            <div className="text-orange-500 font-black text-xs uppercase tracking-wider mb-1">PART 3</div>
                            <div className="text-lg font-black font-mono leading-tight">全图复盘</div>
                        </div>
                        <button onClick={() => setShowRescue(true)} className="mt-2 text-xs text-blue-400 hover:text-white flex items-center gap-1 transition-colors font-bold px-2 py-1 rounded bg-blue-900/30 hover:bg-blue-600 w-fit">
                            <HelpCircle size={14}/> 怎么读这页？
                        </button>
                    </div>
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <div className="text-[10px] font-bold text-blue-300 uppercase mb-1 flex items-center gap-1 pl-2">
                                <Target size={12}/> 目标 (Goal)
                            </div>
                            <div className="pl-2 font-medium text-blue-100">串联所有关卡，形成完整认知地图。</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                <MousePointerClick size={12}/> 行动 (Action)
                            </div>
                            <div className="text-slate-300">点击展开中间的卡片，按需跳转回之前的关卡复习。</div>
                        </div>
                        <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-500/30">
                            <div className="text-[10px] font-bold text-emerald-400 uppercase mb-1 flex items-center gap-1">
                                <Lightbulb size={12}/> 意义 (Why)
                            </div>
                            <div className="text-emerald-100 text-xs leading-relaxed">
                                单独的知识点容易忘，连成线、结成网才能真正掌握。
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center pl-4 md:border-l border-slate-700">
                        <button 
                            onClick={onBack}
                            className="px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 bg-slate-700 text-slate-300 hover:bg-slate-600"
                        >
                            返回选关
                        </button>
                    </div>
                </div>
            </div>

            {showRescue && (
                <UniversalRescueDrawer 
                    step={1} 
                    title="如何使用复盘页" 
                    content={rescueContent} 
                    onClose={() => setShowRescue(false)} 
                />
            )}
        </div>
    );
};

export default Recap;
