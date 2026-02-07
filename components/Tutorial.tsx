
import React, { useState } from 'react';
import { ArrowRight, Mountain, BrainCircuit, Table, Lightbulb, Scale, BookOpen, Smile, Zap, EyeOff, Shovel, BrickWall } from 'lucide-react';

interface TutorialProps {
  onStart: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onStart }) => {
  const [mode, setMode] = useState<'story' | 'mapping' | 'theory'>('story');

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-700 pb-24">
      
      {/* Header */}
      <div className="text-center space-y-6 pt-8 mb-10">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          新手指南：失忆的造景师
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
           我们先不谈公式。在这个实验室里，你将扮演一位试图在沙盘上雕刻出“猫”形状的造景师。
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 bg-slate-100 p-1.5 rounded-full w-fit mx-auto mt-4">
             <button 
                onClick={() => setMode('story')}
                className={`px-4 py-2 rounded-full font-bold transition-all text-sm flex items-center gap-2 ${mode === 'story' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <BookOpen size={16}/> 1. 寓言故事
             </button>
             <button 
                onClick={() => setMode('mapping')}
                className={`px-4 py-2 rounded-full font-bold transition-all text-sm flex items-center gap-2 ${mode === 'mapping' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Table size={16}/> 2. 元素映射
             </button>
             <button 
                onClick={() => setMode('theory')}
                className={`px-4 py-2 rounded-full font-bold transition-all text-sm flex items-center gap-2 ${mode === 'theory' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <BrainCircuit size={16}/> 3. 核心原理
             </button>
        </div>
      </div>

      <div className="min-h-[400px]">
          
        {/* MODE 1: STORY */}
        {mode === 'story' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                
                <div className="bg-orange-50 p-6 sm:p-8 rounded-3xl border border-orange-100 shadow-sm">
                    <h3 className="text-2xl font-black text-orange-900 mb-4 flex items-center gap-3">
                        <Mountain size={28}/> 
                        背景设定：看不见的猫
                    </h3>
                    <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
                        <p>
                            想象你是一个<strong>患有失忆症的地形造景师</strong>。你的终极任务是建造一个“猫之谷”，让水流（或者小球）自动汇聚成猫的样子。
                        </p>
                        <p>
                            但你有一个大问题：<strong>你根本看不见猫，也记不住猫的样子。</strong>
                        </p>
                        <p className="bg-white/80 p-4 rounded-xl border-l-4 border-orange-400 text-slate-800 font-medium">
                            你只能依靠一位严厉的老师（数据）在白天抓住你的手，通过触觉来感知。
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                     {/* Phase 1 */}
                     <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Shovel size={24}/>
                        </div>
                        <h4 className="font-bold text-lg mb-2 text-slate-800">☀️ 白天：老师的手 (铭记)</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            白天，老师抓住你的手，强行按在沙盘的某些位置（比如两边）。<br/>
                            老师说：“记住，这里才是对的。”<br/>
                            于是你拿出<strong>铲子</strong>，顺着老师按住的地方疯狂<strong>挖坑</strong>。<br/>
                            <span className="block mt-2 font-bold text-blue-600">结果：猫的轮廓变成了深沟。</span>
                        </p>
                     </div>

                     {/* Phase 2 */}
                     <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                            <EyeOff size={24}/>
                        </div>
                        <h4 className="font-bold text-lg mb-2 text-slate-800">🌙 晚上：梦游 (反思)</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                             晚上老师走了。你在梦游。没有了老师的手，你把球随便往地上一扔。<br/>
                             球滚进了一个奇怪的凹陷处（可能是你以前乱挖的幻觉）。<br/>
                             你醒悟了：“不对！白天老师没按过这里！这是错的！”<br/>
                             于是你拿出<strong>砖头</strong>，把这个错误的坑<strong>填平</strong>。
                        </p>
                     </div>

                     {/* Phase 3 */}
                     <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <Smile size={24}/>
                        </div>
                        <h4 className="font-bold text-lg mb-2 text-slate-800">✨ 结局：完美的直觉</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                             就这样，<strong>白天挖真坑，晚上填假坑</strong>。<br/>
                             久而久之，整个沙盘只剩下“猫”的形状是最低的深渊。<br/>
                             以后哪怕没有老师，随便扔一个球，它也会顺着地势，自动滚进“猫之谷”。<br/>
                             <span className="block mt-2 font-bold text-emerald-600">这就是“学会了”。</span>
                        </p>
                     </div>
                </div>
            </div>
        )}

        {/* MODE 2: MAPPING */}
        {mode === 'mapping' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8">
                    <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <Scale size={24}/> 
                        连接现实与理论
                    </h3>
                    <p className="text-slate-700">
                        在这里，我们将故事中的元素翻译成物理实验和数学模型中的术语。
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                                    <th className="p-4 border-b w-1/4">故事元素</th>
                                    <th className="p-4 border-b w-1/4">实验室里的样子</th>
                                    <th className="p-4 border-b w-1/2">玻尔兹曼机原理</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-800">🏜️ 沙盘地形</td>
                                    <td className="p-4">右侧的 3D 地形图</td>
                                    <td className="p-4">
                                        <strong>能量景观 (Energy Landscape)</strong><br/>
                                        能量越低（坑越深），代表网络觉得这个状态越合理。
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-800">🎾 小球</td>
                                    <td className="p-4">像素格的状态 (0 或 1)</td>
                                    <td className="p-4">
                                        <strong>系统状态 (State Vector)</strong><br/>
                                        球在哪里，代表网络当前“想象”到了什么画面。
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-blue-600">✋ 老师的手 (白天)</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">白天模式</span>
                                    </td>
                                    <td className="p-4">
                                        <strong>数据钳制 (Data Clamping)</strong><br/>
                                        强制把输入层神经元设定为训练数据（如猫的图片）。
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-indigo-600">🧟 梦游 (晚上)</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-bold">晚上模式</span>
                                    </td>
                                    <td className="p-4">
                                        <strong>自由采样 (Gibbs Sampling)</strong><br/>
                                        网络根据当前的权重，自由联想生成的画面（做梦）。
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-green-600">🔨 铲子 (挖)</td>
                                    <td className="p-4">点击“挖坑”按钮</td>
                                    <td className="p-4">
                                        <strong>赫布学习 (Hebbian Learning)</strong><br/>
                                        <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">Δw += rate</code><br/>
                                        降低能量，奖励这个状态。
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-red-600">🧱 砖头 (填)</td>
                                    <td className="p-4">点击“填坑”按钮</td>
                                    <td className="p-4">
                                        <strong>反赫布学习 (Anti-Hebbian)</strong><br/>
                                        <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">Δw -= rate</code><br/>
                                        升高能量，惩罚这个幻觉。
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* MODE 3: THEORY */}
        {mode === 'theory' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-black text-slate-800">这篇论文到底在干什么？</h3>
                    <p className="text-slate-600 mt-2">
                        Boltzmann Machines: Constraint Satisfaction Networks that Learn (Hinton & Sejnowski, 1986)
                    </p>
                </div>

                {/* Concept 1 */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h4 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
                        1. 能量决定概率 (Energy = Probability)
                    </h4>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        玻尔兹曼机认为，神经网络就像一个物理系统。宇宙万物都倾向于能量最低的状态（就像水往低处流）。
                    </p>
                    <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-center shadow-lg text-sm sm:text-base">
                        P(state) ∝ e<sup>-Energy(state) / Temperature</sup>
                    </div>
                    <p className="text-sm text-slate-500 mt-3 text-center">
                        翻译：<strong>能量越低（坑越深），这个状态出现的概率就越大。</strong>
                    </p>
                </div>

                {/* Concept 2 */}
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h4 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
                        2. 学习 = 雕刻能量面 (Sculpting)
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                             <div className="font-bold text-blue-700 mb-2 text-sm uppercase tracking-wider">目标</div>
                             <p className="text-sm text-slate-700">
                                 让代表“真理”（训练数据）的地方变成<strong>大峡谷</strong>。<br/>
                                 让代表“谬误”（噪音/幻觉）的地方变成<strong>高原</strong>。
                             </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                             <div className="font-bold text-purple-700 mb-2 text-sm uppercase tracking-wider">手段 (CD算法)</div>
                             <p className="text-sm text-slate-700 font-mono text-xs mb-2">
                                Δw = η(⟨v<sub>i</sub>v<sub>j</sub>⟩<sub>data</sub> - ⟨v<sub>i</sub>v<sub>j</sub>⟩<sub>model</sub>)
                             </p>
                             <p className="text-sm text-slate-700">
                                 <strong>前一项 (挖):</strong> 看到数据里 i,j 同时亮 → 拉近关系。<br/>
                                 <strong>后一项 (填):</strong> 看到模型自己瞎猜 i,j 同时亮 → 疏远关系。
                             </p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 text-center">
                    <h4 className="font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
                        <Lightbulb size={20}/> 核心洞察
                    </h4>
                    <p className="text-lg text-yellow-800 font-medium">
                        “学习不仅是记住什么是对的（挖），更重要的是遗忘什么是错的（填）。”
                    </p>
                </div>
            </div>
        )}

      </div>

      {/* CTA */}
      <div className="text-center pt-12 border-t mt-12">
          <button 
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-200 bg-slate-900 text-lg rounded-xl hover:bg-slate-800 hover:scale-105 hover:shadow-xl focus:outline-none ring-offset-2 focus:ring-2"
          >
            <span>进入实验室</span>
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform"/>
          </button>
      </div>

    </div>
  );
};

export default Tutorial;
