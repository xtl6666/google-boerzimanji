
export type TermDefinition = {
    title: string;
    subtitle?: string;
    what: string[];
    why: string[];
    use: string[];
    where: string[];
    example?: string[];
    misconceptions?: string[];
    formula?: { label: string; latex: string; note: string }[];
};

export const TERM_DEFS: Record<string, TermDefinition> = {
    // --- LEVEL 4 NEW TERMS ---
    "encoder_424": {
        title: "4-2-4 编码器 (Encoder)",
        subtitle: "信息压缩机",
        what: ["一个经典的神经网络任务结构：4个输入 → 2个隐藏 → 4个输出。"],
        why: ["为了验证网络是否学会了‘抽象’。输入有4位信息，中间只有2位宽度的通道（瓶颈），网络必须学会把信息压缩编码，并在另一端无损还原。"],
        use: ["Level 4 的核心实验对象。网络需要学会用 2 位二进制（如00, 01, 10, 11）来代表 4 种不同的输入模式。"],
        where: ["界面正中央的网络拓扑图。"],
        example: ["输入 '1000' → 压缩为 '00' → 还原为 '1000'。"],
        misconceptions: ["这不是简单的信号传输，中间层必须学会‘编码规则’才能通过瓶颈。"]
    },
    "pos_stats": {
        title: "正相统计 (Positive Stats)",
        subtitle: "现实的共现 / 老师教的",
        what: ["在‘数据钳制’（Clamped）状态下，统计可见层 V 和隐藏层 H 同时激活的频率。"],
        why: ["这是学习的目标基准。我们希望网络记住：‘当看到这个数据时，内部应该有什么反应’。"],
        use: ["Step 2 点击‘运行正相’时收集。它是 Δw 公式中的被减数。"],
        where: ["左侧控制面板进度条 / 内部计算数据。"],
        example: ["现实中 V1=1, H=1 同时出现了 40 次 → <v1h>_pos ≈ 0.8。"],
        misconceptions: ["正相不代表‘正确’，它代表‘外部数据的真实分布’。"]
    },
    "neg_stats": {
        title: "负相统计 (Negative Stats)",
        subtitle: "梦境的共现 / 学生练的",
        what: ["在‘自由运行’（Free/Reconstruction）状态下，统计网络自己生成的 V 和 H 同时激活的频率。"],
        why: ["这是需要修正的基准。如果梦境里的共现频率和现实不一样，说明网络产生了幻觉或偏见。"],
        use: ["Step 3 点击‘运行负相’时收集。它是 Δw 公式中的减数。"],
        where: ["左侧控制面板进度条 / 内部计算数据。"],
        example: ["梦里 V1=1, H=1 出现了 90 次 → <v1h>_neg ≈ 1.8 (过高) → 说明网络对这个连接过度兴奋，需要抑制。"],
        misconceptions: ["负相不是‘错误的’，它是‘模型当前的真实反应’。学习就是要让负相逼近正相。"]
    },
    "delta_w": {
        title: "权重更新量 (Δw)",
        subtitle: "学习的步伐",
        what: ["连接权重要增加或减少的数值。公式：Δw = 学习率 × (正相 - 负相)。"],
        why: ["为了消除现实(Pos)与梦境(Neg)的差异。当差异为 0 时，学习完成（收敛）。"],
        use: ["Step 4 点击‘执行更新’时应用到权重矩阵上。"],
        where: ["右侧更新日志 (Updater) 面板。"],
        example: ["Pos=0.8, Neg=0.3 → Δw = 0.5 (现实多，梦里少 → 加强连接)"],
        misconceptions: ["Δw 不是权重 w 本身，它是 w 的变化量（梯度）。"]
    },
    "free_phase": {
        title: "自由阶段 (Free Phase)",
        subtitle: "解除控制",
        what: ["不再强制固定输出层 V2，而是让 V2 根据 H 的状态自由变化。"],
        why: ["为了测试网络‘自己以为’答案是什么。如果一直固定 V2，我们就永远不知道网络学得怎么样了。"],
        use: ["在 Step 3 负相统计时发生。"],
        where: ["Step 3 时，右侧的 V2 节点会从蓝色（固定）变为紫色/红色（自由）。"],
        misconceptions: ["Free Phase 并不是完全随机，它受当前权重的强烈影响。"]
    },

    // --- EXISTING TERMS (Keep them) ---
    "energy": {
        title: "能量 E (Energy)",
        subtitle: "系统的不舒服程度",
        what: ["给当前状态打的一个分数。分数越低，代表系统越“舒服”、越稳定。"],
        why: ["物理世界的公理：万物倾向于向低能状态演化（水往低处流，球往坑里滚）。"],
        use: ["作为系统的“损失函数”。我们的目标就是通过调整权重，把目标状态的能量降到最低。"],
        where: ["状态列表右侧的彩色数字 / 地形图的高度。"],
        formula: [{ label: "全局能量", latex: "E = -∑(w·sᵢ·sⱼ) - ∑(b·sᵢ)", note: "同向相乘(s·s)为正，配合前面的负号，使能量降低。" }]
    },
    "landscape": {
        title: "能量地形 (Energy Landscape)",
        subtitle: "所有可能性的地图",
        what: ["把所有可能的状态（如00, 01, 10, 11）按照能量高低画出来的 3D 地形。"],
        why: ["让我们直观地看到系统的动态：系统运行就像一个小球在这个地形上滚动，寻找最低点。"],
        use: ["山峰 = 不稳定/高能；山谷 = 稳定/低能/记忆。"],
        where: ["界面右侧的柱状图/地形图。"]
    },
    "barrier": {
        title: "能垒 (Energy Barrier)",
        subtitle: "翻墙的代价",
        what: ["从一个低能状态跳到另一个低能状态时，中间必须要经过的“最高门槛”。"],
        why: ["如果墙太高（能垒大），小球如果没有足够的动能（温度），就会被困在原来的坑里出不去。"],
        use: ["Level 2 的核心挑战：如何翻越能垒进入更深的谷底。"],
        where: ["Level 2 能够看到的红色 Peak 值。"]
    },
    "local_minima": {
        title: "局部最优 / 陷阱 (Local Minima)",
        subtitle: "虚假的舒适区",
        what: ["一个比周围都低，但并不是全地图最低的地方。"],
        why: ["贪心算法（只敢往下走）会死在这里。一旦掉进去，四周都是高墙，爬不出来。"],
        use: ["需要用“高温”带来的随机性跳出来。"],
        where: ["Level 2 中的 00 状态（当 11 才是真理时）。"]
    },
    "annealing": {
        title: "模拟退火 (Simulated Annealing)",
        subtitle: "先热后冷，寻找真理",
        what: ["一种优化策略：开始时保持高温（允许乱跳、翻墙），然后慢慢降温（锁定最佳位置）。"],
        why: ["高温负责探索（Exploration），防止卡在陷阱；低温负责利用（Exploitation），精确收敛到谷底。"],
        use: ["Level 2 最后一步，解决“怎么跳出陷阱”的问题。"],
        where: ["Level 2 的“开始模拟退火”按钮。"]
    },
    "state_vector": {
        title: "状态 (State / Configuration)",
        subtitle: "当前的开关组合",
        what: ["网络中所有神经元在某一时刻的亮灭情况（例如 A=1, B=0）。"],
        why: ["能量是定义在“状态”上的。每一个状态对应地形图上的一个坐标点。"],
        use: ["我们希望网络记住某些特定的状态（即让这些状态能量变低）。"],
        where: ["Level 1 左侧列表中的每一行。"]
    },
    "boltzmann_distribution": {
        title: "玻尔兹曼分布",
        subtitle: "能量决定概率",
        what: ["一个物理定律：能量越低的状态，出现的概率呈指数级上升。"],
        why: ["它联系了微观的 E 和宏观的 P。"],
        use: ["决定了随机采样的概率分布，是整个算法的物理基础。"],
        where: ["虽然不可见，但它是支配每一次掷硬币（采样）的幕后法则。"],
        formula: [{ label: "概率公式", latex: "P(s) ≈ exp( -E(s) / T )", note: "温度 T 越高，概率分布越扁平（大家机会均等）；T 越低，概率越集中在低能态。" }]
    },
    "visible_units": {
        title: "可见单元 V (Visible Units)",
        subtitle: "输入/输出接口",
        what: ["网络中直接与外界数据对接的部分。"],
        why: ["我们无法直接控制大脑内部，只能通过眼睛（输入）和嘴巴（输出）与世界交互。"],
        use: ["在 4-2-4 编码器中，V1 是输入层，V2 是输出层。"],
        where: ["Level 4 左右两侧的蓝色节点。"]
    },
    "hidden_unit": {
        title: "隐藏单元 H (Hidden Unit)",
        subtitle: "内部特征提取器",
        what: ["既不直接接收输入，也不直接产生输出的中间层节点。"],
        why: ["如果只有输入输出，网络只能进行简单的线性映射。H 提供了“思考空间”，用于提取抽象特征（比如把 '1000' 压缩成 '00'）。"],
        use: ["它们负责在内部构建数据的“模型”。"],
        where: ["Level 4 中间的紫色节点。"]
    },
    "sampling": {
        title: "采样 (Sampling)",
        subtitle: "按概率掷硬币",
        what: ["根据计算出的概率 P，掷硬币决定某个单元当前是取 0 还是取 1。"],
        why: ["玻尔兹曼机不是确定性的逻辑门电路，而是随机神经网络。"],
        use: ["让模型在各种可能的状态间“随机但有偏好”地移动。"],
        where: ["点击“运行统计”时发生的内部过程。"]
    },
    "random_update": {
        title: "随机更新 (Stochastic Update)",
        subtitle: "带噪声的决策",
        what: ["每次只更新一个单元，假设其它单元暂时固定，然后按概率进行抽样。"],
        why: ["这样做能保证系统长期运行的统计结果符合“玻尔兹曼分布”。"],
        use: ["让系统能够探索不同的内部原因，而不是卡死在某一个状态不动。"],
        where: ["自动运行时发生的内部过程。"]
    },
    "frequency": {
        title: "频率 (Frequency)",
        subtitle: "看得见的概率",
        what: ["在很多次采样中，某个事件实际发生的比例。"],
        why: ["概率 P 是理论值，看不见；频率是实验值，看得见。次数越多，频率越接近概率。"],
        use: ["用来验证模型的“倾向”是否真的在起作用。"],
        where: ["统计柱状图的高度。"]
    },
    "net_input": {
        title: "净输入 x (Net Input)",
        subtitle: "推 H 向 1 还是向 0 的支持力度",
        what: ["把邻居对当前节点的影响加起来，得到的一个总分数。"],
        why: ["决定概率 P 的大小。"],
        use: ["x > 0 倾向于变 1，x < 0 倾向于变 0。"],
        where: ["（本关隐藏，直接体现为概率变化）"]
    },
    "probability": {
        title: "概率 P (Probability)",
        subtitle: "变 1 的可能性",
        what: ["节点取 1 的概率。"],
        why: ["由能量差或净输入 x 决定。"],
        use: ["用来采样。"],
        where: ["（本关作为中间步骤）"]
    },
    "sigmoid": {
        title: "Sigmoid (σ)",
        subtitle: "把分数翻译成概率",
        what: ["一个 S 型函数，把 (-∞, +∞) 的输入压缩到 (0, 1)。"],
        why: ["为了把物理量 x 转化为概率 P。"],
        use: ["P = 1 / (1 + exp(-x))"],
        where: ["（数学原理）"]
    },
    "bias": {
        title: "偏置 b (Bias)",
        subtitle: "门槛 / 默认倾向",
        what: ["节点自身的倾向，不依赖邻居。"],
        why: ["有些节点天生就容易亮（b>0）或不容易亮（b<0）。"],
        use: ["调节节点的激活阈值。"],
        where: ["（本关作为可学习参数之一）"]
    },
    "temperature": {
        title: "温度 T (Temperature)",
        subtitle: "随机性调节器",
        what: ["控制系统有多大几率“乱跳”。"],
        why: ["高温有助于快速遍历不同状态（混合），防止卡死。低温用于精确采样。"],
        use: ["在 Burn-in 阶段通常温度较高，统计阶段温度较低。"],
        where: ["（本关可选高级设置）"]
    },
    "weight": {
        title: "权重 w (Weight)",
        subtitle: "连接强度",
        what: ["两个神经元之间关系的紧密程度。"],
        why: ["这是模型“记忆”知识的地方。"],
        use: ["w > 0：鼓励一起亮；w < 0：鼓励相反。"],
        where: ["连线的粗细和颜色。"]
    },
    "contributions": {
        title: "贡献项 (Contributions)",
        subtitle: "票数来源",
        what: ["谁给当前节点投了票。"],
        why: ["分析决定是由哪个邻居主导的。"],
        use: ["用于理解x的构成。"],
        where: ["（Level 3 概念）"]
    },
    "clamp": {
        title: "钳制 (Clamping)",
        subtitle: "强行固定",
        what: ["强制把某些可见单元（如 V1, V2）设置为训练数据的值，不许它们变动。"],
        why: ["这是“老师在教”。我们告诉网络：“这时候 V1 必须是 1，V2 必须是 0，你别乱动，好好感受。”"],
        use: ["在正相（Positive Phase）中用于固定数据。"],
        where: ["正相面板中锁定的 V1/V2。"],
        misconceptions: ["Clamp 不是训练，Clamp 只是设定了环境，训练是后面的 Update。"]
    },
    "round_trip": {
        title: "往返 (Round Trip)",
        subtitle: "AB → H → AB'",
        what: ["信号传进去再传出来的过程。"],
        why: ["检查信息是否丢失。"],
        use: ["验证H的表示能力。"],
        where: ["Level 3 概念。"]
    },
    "reconstruct": {
        title: "重建 (Reconstruction)",
        subtitle: "脑补",
        what: ["根据隐藏层 H 的状态，反推可见层应该是什么。"],
        why: ["用来测试模型是否学会了。"],
        use: ["在测试模式中，Clamp V1 → H → V2(Reconstruct)。"],
        where: ["Step 5 的测试功能。"]
    },
    "ab_prime": {
        title: "AB' (Reconstruction)",
        subtitle: "生成的幻想",
        what: ["模型生成的数据。"],
        why: ["我们需要对比生成的数据和原始数据，以计算误差。"],
        use: ["用于评估模型是否学到了数据的特征。"],
        where: ["Level 3 概念。"]
    },
    "x_gen": { 
        title: "生成分数", 
        what: ["反向生成的 x"], 
        why: ["反向传播信号以生成可见层。"],
        use: ["计算生成概率。"],
        where: ["Level 3"] 
    },
    "p_gen": { 
        title: "生成概率", 
        what: ["反向生成的 P"], 
        why: ["决定生成数据的概率分布。"],
        use: ["用于采样生成数据。"],
        where: ["Level 3"] 
    },
    "recon_rate": {
        title: "重建率 (Reconstruction Rate)",
        subtitle: "考试成绩",
        what: ["模型生成的 V2 与真实目标 V2 一致的概率。"],
        why: ["衡量模型学得好不好。"],
        use: ["100% 表示完美学会了编码。"],
        where: ["Step 5 的右上角指标。"]
    },
    "positive_phase": {
        title: "正相 (Positive Phase)",
        subtitle: "现实 / 老师教",
        what: ["固定所有可见单元 (V1+V2) 为训练数据，只让隐藏单元 (H) 自由采样。"],
        why: ["让网络感受“正确答案”是什么样的。统计此时的共现情况，作为学习的目标。"],
        use: ["计算 <SiSj>_positive。"],
        where: ["左侧的绿色面板。"],
        example: ["如果数据是 V1=1, V2=1，我们就强制 V1=1, V2=1，然后看 H 会变成什么。"]
    },
    "negative_phase": {
        title: "负相 (Negative Phase)",
        subtitle: "梦境 / 学生练",
        what: ["只固定输入 (V1) 或完全不固定，让网络自由运行产生输出 (V2) 和隐藏状态 (H)。"],
        why: ["看看在没有老师手把手教（不固定 V2）的情况下，网络自己“以为”的世界是什么样的。"],
        use: ["计算 <SiSj>_negative。这是需要被纠正的“幻觉”。"],
        where: ["中间的红色/紫色面板。"],
        misconceptions: ["负相不是“错误的”阶段，它是“模型当前的真实反应”。学习就是要修正这个反应。"]
    },
    "co_occurrence": {
        title: "共现统计 <SiSj>",
        subtitle: "一起亮的频率",
        what: ["统计两个神经元 i 和 j 同时为 1 (或同号) 的频率。"],
        why: ["这是 Hebbian Learning 的核心：Fire together, wire together。"],
        use: ["如果正相里常共现，负相里不共现 → 说明连接太弱 → 增强权重。\n如果正相不共现，负相常共现 → 说明连接太强(幻觉) → 减弱权重。"],
        where: ["柱状图的高度。"],
        formula: [{ label: "共现频率", latex: "⟨sᵢ·sⱼ⟩ = (1/N) · ∑ sᵢ·sⱼ", note: "N 是采样步数。" }]
    },
    "burn_in": {
        title: "预热 (Burn-in)",
        subtitle: "等待热平衡",
        what: ["在开始统计计数之前，先让网络空跑几十步。"],
        why: ["刚开始的状态通常与当前权重不匹配（还没进入状态）。需要跑一会儿，让系统“忘掉”初始状态，进入代表当前分布的“热平衡态”。"],
        use: ["在采样进度条中的前段灰色部分。"],
        where: ["左中面板的进度条。"]
    },
    "sampling_window": {
        title: "采样窗口 (Sampling Window)",
        subtitle: "正式统计期",
        what: ["Burn-in 之后，连续记录 N 步的状态用于统计。"],
        why: ["单次采样波动大，统计多次取平均才能得到稳定的 <SiSj>。"],
        use: ["计算最终的柱状图高度。"],
        where: ["左中面板的进度条中段。"]
    },
    "weight_update": {
        title: "权重更新 (Update)",
        subtitle: "Δw = η (现实 - 梦境)",
        what: ["根据正相和负相的统计差异，修改权重。"],
        why: ["这是学习的本质：拉近梦境与现实的距离。"],
        use: ["点击“Update”按钮时执行。"],
        where: ["右侧面板。"],
        formula: [{ label: "更新规则", latex: "Δw = η · ( ⟨sᵢ·sⱼ⟩₊ - ⟨sᵢ·sⱼ⟩₋ )", note: "η 是学习率。公式意为：现实频率 减去 梦境频率。" }]
    },
    "learning_rate": {
        title: "学习率 η (Eta)",
        subtitle: "步子迈多大",
        what: ["控制每次更新权重的幅度。"],
        why: ["太大容易震荡（学过头了），太小收敛太慢。"],
        use: ["调节滑块控制。"],
        where: ["右侧面板的滑块。"]
    },
    // --- NEW LEVEL 5 RBM TERMS ---
    "rbm": {
        title: "受限玻尔兹曼机 (RBM)",
        subtitle: "Restricted Boltzmann Machine",
        what: ["一种特殊的神经网络结构：分两层（可见层V、隐藏层H）。层内无连接，层间全连接。"],
        why: ["全连接玻尔兹曼机（层内也有连接）太难训练了，计算量巨大。去掉层内连接后，计算速度指数级提升。"],
        use: ["作为深度学习早期的积木，可以层层堆叠构成深度信念网络 (DBN)。"],
        where: ["本关的整个网络结构。"],
        misconceptions: ["RBM '受限'不是指功能弱，而是指连接方式受限，这反而让它变强了（可训练）。"]
    },
    "cd_1": {
        title: "对比散度 (CD-1)",
        subtitle: "Contrastive Divergence",
        what: ["Hinton 发明的快速训练算法。只做一次“梦”（负相采样 1 步）就进行更新。"],
        why: ["理论上应该让网络跑很久达到热平衡（无限次采样），但这太慢了。Hinton 发现，只要往“梦”的方向走一步，就能指明修正权重的方向。"],
        use: ["本关的核心训练循环：Day → Night(1 step) → Update。"],
        where: ["顶部的流水线条。"],
        formula: [{ label: "CD-k 更新", latex: "Δw ≈ ⟨v·h⟩₀ - ⟨v·h⟩ₖ", note: "k=1 时就是 CD-1。" }]
    }
};
