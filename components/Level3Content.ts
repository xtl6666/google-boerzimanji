
export interface PrincipleCard {
    title: string;
    oneLiner: string;
    intuition: string;
    paperMeaning: string;
    uiWhere: string;
    formula?: string;
    commonMistakes?: string;
}

export interface ContentSection {
    id: string;
    title: string;
    cards: PrincipleCard[];
}

export const LEVEL_3_CONTENT: ContentSection[] = [
    {
        id: "chapter1",
        title: "1. 为什么 H 会随机跳动？H 到底是什么？",
        cards: [
            {
                title: "H 是“内部原因”寄存器",
                oneLiner: "H 代表了系统内部推测出的“某种可能性”，而非必然性。",
                intuition: "想象 A 和 B 是电路板上的 LED 灯（你能看到），而 H 是芯片内部的一个寄存器位（你看不见）。当你看到 A、B 同时亮起时，可能是因为内部的 H 处于激活状态。H 的存在是为了解释 A 和 B 之间的关联。",
                paperMeaning: "H 是 Hidden Unit（隐藏单元）。它的作用是捕获可见单元（Visible Units）之间的高阶相关性（Higher-order correlations）。如果没有 H，模型只能学习简单的两两关系。",
                uiWhere: "界面中间那个紫色的大数字卡片 H。",
                commonMistakes: "新手常以为 H 是多余的。其实 H 才是“智能”的载体，它存储了对外部世界的抽象特征。"
            },
            {
                title: "随机跳动 = 概率搜索",
                oneLiner: "随机不是 Bug，而是 Feature。它在搜索各种可能的解释。",
                intuition: "这就像你在回忆一个模糊的梦。有时候你觉得它是红色的，有时候觉得是蓝色的。这种“不确定性”正是因为信息不足（或者系统本身就在探索）。玻尔兹曼机故意引入这种“噪声”，防止思维僵化。",
                paperMeaning: "玻尔兹曼机是“随机神经网络”（Stochastic Neural Network）。每个神经元不是确定性的逻辑门，而是一个概率发生器。这种随机性允许系统探索状态空间，避免陷入局部最优。",
                uiWhere: "当你点击“自动采样”时，H 在 0 和 1 之间不断闪烁。",
            },
            {
                title: "随机但不瞎跳 (倾向性)",
                oneLiner: "H 的跳动虽然随机，但它是“有偏”的骰子。",
                intuition: "虽然 H 会跳，但如果 P=90%，它绝大多数时候都会停在 1。它就像一个有偏重的硬币，虽然你无法预测下一次一定是正面，但你知道长期来看正面居多。",
                paperMeaning: "H 的状态服从伯努利分布 (Bernoulli Distribution)，其参数 p 由当前的输入 x 决定。采样过程就是从这个分布中抽取样本。",
                uiWhere: "观察统计相机里的“频率条”，它会稳定在概率 P 附近，而不是乱跳。",
            },
            {
                title: "为什么要固定 AB 采样？",
                oneLiner: "为了看清在“当前现实”下，内部大脑在想什么。",
                intuition: "这叫“控制变量法”。如果在 A=1, B=1 的情况下，H 有 99% 的概率是 1，说明系统认为“AB同时亮”的主要原因是“H亮了”。通过固定 AB 并大量采样，我们就能测出系统内部的“潜意识”。",
                paperMeaning: "这对应论文中的“Clamped Phase”（钳制阶段）。我们需要计算在给定数据 v 的条件下，隐藏层 h 的后验概率分布 P(h|v)。",
                uiWhere: "Step 1 中，你不能修改 A/B，只能疯狂点击采样 H。"
            }
        ]
    },
    {
        id: "chapter2",
        title: "2. 为什么 H 由 x 决定？x 是什么？",
        cards: [
            {
                title: "x 是“净票数/支持力度”",
                oneLiner: "x 是所有邻居给 H 投的票数总和（支持票 - 反对票）。",
                intuition: "想象 H 在进行一场选举。A 投了赞成票（w_AH > 0），B 投了反对票（w_BH < 0）。x 就是最后的净票数。如果 x > 0，H 就有动力变 1；如果 x < 0，H 就想变 0。",
                paperMeaning: "x 是 Local Field（局部场）或 Net Input（净输入）。它是所有连接权重的加权和加上偏置。",
                uiWhere: "投票面板中最左侧的大号数字 x。",
                formula: "x_j = \\sum_i w_{ij} s_i + b_j"
            },
            {
                title: "从 x 到 P：Sigmoid 的翻译",
                oneLiner: "Sigmoid 函数负责把“任意大小的力度”翻译成“0到1的概率”。",
                intuition: "x 可以是 100，也可以是 -50，但这不能直接用来掷硬币。Sigmoid 就像一个翻译官：\n• x=0 → 翻译成 50% (犹豫)\n• x=2 → 翻译成 88% (挺想)\n• x=4 → 翻译成 98% (非常想)\n• x=-4 → 翻译成 2% (非常不想)",
                paperMeaning: "这是 Logistic Activation Function。它源于玻尔兹曼分布的数学推导，保证了系统的详细平衡条件。",
                uiWhere: "投票面板中间的箭头，指向概率 P。",
                formula: "P(H=1) = \\frac{1}{1 + e^{-x/T}}"
            },
            {
                title: "关键：x 不是能量 E！",
                oneLiner: "x 是“推力”，E 是“高度”。x 越大，往坑底推的力越大。",
                intuition: "这是一个极其重要的区别！\n• 能量 E 是整个系统的“不舒服程度”（越低越好）。\n• 力度 x 是让 H 变 1 的“欲望强度”。\n\n数学上，x 越大，把 H 变成 1 能够降低的能量就越多（ΔE = -2x）。所以 x 指引了能量降低的方向。",
                paperMeaning: "对于二值神经元 (0/1)，能量差 ΔE = E(0) - E(1) = x。所以 P(1) = sigmoid(x) 本质上就是 P(1) = 1 / (1 + exp(ΔE))，完全符合玻尔兹曼分布。",
                uiWhere: "x 在投票面板；E 在 Level 1/2 的地形图里。本关只关注局部的 x。",
                commonMistakes: "很多新手会把 x 当成能量。记住：x 是正的好（想变1），E 是负的好（稳定）。"
            },
            {
                title: "Step 2 实验的意义",
                oneLiner: "为了验证“有方向的随机”不是玄学，而是可预测的科学。",
                intuition: "在 Step 2 中，我们让你先看 x 预测 P，再实际采样验证。你会发现，虽然单次结果不可控，但统计频率完美符合 x 的指示。这就证明了神经网络的“随机”是受到严格数学物理法则约束的。",
                paperMeaning: "这是在验证 Gibbs Sampling 的正确性。只要按这个规则更新，系统最终一定会收敛到玻尔兹曼分布。",
                uiWhere: "Step 2 的目标：先预测，后验证。"
            }
        ]
    },
    {
        id: "chapter3",
        title: "3. 论文对照：这些变量在学术界叫什么？",
        cards: [
            {
                title: "A, B → Visible Units",
                oneLiner: "可见单元：数据直接呈现的部分。",
                intuition: "就像你眼睛看到的像素、耳朵听到的音频。它们是直接受外界数据控制的。",
                paperMeaning: "Visible Vector (v)。在训练阶段，它们被钳制（Clamped）到训练数据上。",
                uiWhere: "左侧的 A、B 两个开关。"
            },
            {
                title: "H → Hidden Units",
                oneLiner: "隐藏单元：负责解释数据的内部特征。",
                intuition: "就像你在看云彩（Visible）时，脑子里想到的“这是一匹马”（Hidden）。这个“马”的概念是你脑补的，不是云彩本身。",
                paperMeaning: "Hidden Vector (h)。它们扩展了网络的状态空间，使其能模拟非线性分布。",
                uiWhere: "中间的 H 单元。"
            },
            {
                title: "x → Net Input / Local Field",
                oneLiner: "局部场：决定单个神经元命运的总信号。",
                intuition: "在物理学中，这对应于作用在某个自旋上的“有效磁场”。",
                paperMeaning: "Total input to unit j: x_j = ∑ w_ij s_i + b_j。",
                uiWhere: "投票面板的 x。"
            },
            {
                title: "P → Stochastic Update Rule",
                oneLiner: "随机更新规则：玻尔兹曼机的核心引擎。",
                intuition: "这就是著名的“吉布斯采样”步骤。通过不断地按 P 掷硬币，网络在“思考”和“做梦”。",
                paperMeaning: "p(s_j=1) = σ(ΔE_j / T)。这是 Metropolis-Hastings 算法的一种特例。",
                uiWhere: "概率条 P(H=1)。"
            },
            {
                title: "为什么要有“Clamped”和“Free”？",
                oneLiner: "为后面的 Level 4/5 铺路：学习 = 现实 - 梦境。",
                intuition: "本关你做的是“Clamped”（固定AB）。后面我们会让你放开 AB（Free）。学习的本质就是比较这两种状态下的统计差异。",
                paperMeaning: "Hebbian Learning 对应 Negative Phase (Free) 和 Positive Phase (Clamped)。学习规则 Δw ∝ <vh>_data - <vh>_model。",
                uiWhere: "Level 4 将会详细展开。"
            }
        ]
    }
];

export const LEVEL_3_FAQ = [
    {
        q: "x 是能量吗？",
        a: "不是。x 是局部净输入（推力），E 是全局能量（高度）。x 越大，把 H 推向 1 的力越大，导致系统能量 E 越低。"
    },
    {
        q: "P 都快 98% 了为什么还会出 0？",
        a: "概率不是保证。98% 意味着投 100 次可能有 2 次是 0。这是正常的物理涨落，就像空气分子偶尔会聚在一起一样。"
    },
    {
        q: "为什么要采样 100 次而不是 1 次？",
        a: "单次采样是随机的，没有任何统计意义。只有大量采样的“频率”才能逼近“概率”，让我们看清系统的真实倾向。"
    },
    {
        q: "H 到底有什么用？我看不见它啊？",
        a: "看不见才有用！它是大脑的“想象力”。如果只有 A 和 B，你只能记忆死板的对应关系。有了 H，你就能提取出 A 和 B 背后的抽象规律（比如“只要有一个亮，H就亮”）。"
    },
    {
        q: "Step 2 怎么过？",
        a: "你需要制造两种极端情况来验证模型。\n1. 中立：把权重滑块都拖到 0，x 会变 0，P 变 50%。\n2. 强烈：把权重滑块都拖到最大，x 变很大，P 变 >90%。\n记得每种情况都要点击“自动采样”来收集数据！"
    }
];
