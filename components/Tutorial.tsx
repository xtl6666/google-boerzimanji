
import React, { useState } from 'react';
import { ArrowRight, Mountain, BrainCircuit, Table, Lightbulb, Scale, BookOpen, Smile, Zap, EyeOff } from 'lucide-react';

interface TutorialProps {
  onStart: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onStart }) => {
  const [mode, setMode] = useState<'story' | 'visual' | 'mapping' | 'theory'>('story');

  return (
    <div className="max-w-5xl mx-auto p-6 text-slate-700 pb-24">
      
      {/* Header */}
      <div className="text-center space-y-6 pt-8 mb-10">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">
          新手指南：如何训练一只玻尔兹曼机？
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
           别急着看公式。我们先讲一个<strong>“沙盘与陷阱”</strong>的故事。
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 bg-slate-100 p-1.5 rounded-full w-fit mx-auto mt-4">
             <button 
                onClick={() => setMode('story')}
                className={`px-4 py-2 rounded-full font-bold transition-all text-sm ${mode === 'story' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                📖 0. 故事类比 (必读)
             </button>
             <button 
                onClick={() => setMode('visual')}
                className={`px-4 py-2 rounded-full font-bold transition-all text-sm ${mode === 'visual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                👀 1. 视觉机制
             </button>
             <button 
                onClick={() => setMode('mapping')}
                className={`px-4 py-2 rounded-full font-bold transition-all text-sm ${mode === 'mapping' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                ⚖️ 2. 逻辑对照
             </button>
             <button 
                onClick={() => setMode('theory')}
                className={`px-4 py-2 rounded-full font-bold transition-all text-sm ${mode === 'theory' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                🎓 3. 核心原理
             </button>
        </div>
      </div>

      <div className="min-h-[400px]">
          
        {/* MODE 0: STORY */}
        {mode === 'story' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
                <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 shadow-sm">
                    <h3 className="text-2xl font-black text-orange-900 mb-6 flex items-center gap-3">
                        <Mountain size={32}/> 
                        第一幕：真理与幻觉
                    </h3>
                    <div className="space-y-6 text-lg text-slate-700 leading-loose">
                        <p>
                            想象我们的沙盘上有一群小球。小球最终停在哪，就代表网络“认为”哪里是正确的图案。
                        </p>
                        <p>
                            <strong>现在的困境：</strong><br/>
                            我们的网络天生有一种坏习惯（幻觉）。它总觉得<strong>“中间”</strong>应该是凹陷的。即使我们还没教它，小球也会莫名其妙地往中间滚。
                        </p>
                        <p className="bg-white p-4 rounded-xl border-l-4 border-orange-400 text-slate-600">
                            <strong>我们的任务：</strong><br/>
                            我们要让小球学会去<strong>两边（猫耳朵的位置）</strong>，同时不再掉进<strong>中间（那个错误的陷阱）</strong>。
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                     <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h4 className="font-bold text-lg mb-3 text-slate-800">☀️ 白天：在两边挖坑</h4>
                        <p className="text-slate-600 leading-relaxed">
                            我们拿出一张“猫”的照片（数据）。猫的耳朵在两边（位置0和7）。<br/>
                            所以我们拿起铲子，<strong>在两边疯狂挖坑</strong>。<br/>
                            <span className="text-xs text-blue-500 font-bold block mt-2">目的：建立正确的记忆。</span>
                        </p>
                     </div>
                     <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h4 className="font-bold text-lg mb-3 text-slate-800">🌙 晚上：填平中间的陷阱</h4>
                        <p className="text-slate-600 leading-relaxed">
                            晚上我们不看照片，让小球自由滚动。由于网络有“坏习惯”，小球会掉进中间那个本来不该存在的深坑。<br/>
                            这时候我们冲过去，<strong>把中间那个坑填平！</strong><br/>
                            <span className="text-xs text-red-500 font-bold block mt-2">目的：消除错误的幻觉。</span>
                        </p>
                     </div>
                </div>
            </div>
        )}

        {/* MODE 1: VISUAL */}
        {mode === 'visual' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <BrainCircuit size={24}/> 
                        微观视角：弹簧的拉锯战
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-lg mb-4">
                        我们在微观世界里没有铲子。我们只有<strong>“弹簧”</strong>。
                    </p>
                    <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-4">
                        <div>
                            <span className="font-bold text-slate-800 block mb-1">❓ 为什么中间会有坑？</span>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                在这个实验开始时，我们故意在第3和第4个像素位置设置了很强的<strong>正向偏置 (Bias)</strong>。<br/>
                                这就像是网络大脑里长了一个“瘤子”或者“执念”，它天生就觉得中间应该是亮的。
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold text-lg mb-2 text-blue-700">☀️ 白天 (挖两边)</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            数据强制让位置0和7亮起。我们看到它们亮了，就<strong>增加</strong>它们的偏置值。<br/>
                            <span className="bg-blue-100 px-1 rounded text-blue-800">物理效果：</span> 两边的地形下降，形成新的引力中心。
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-2 text-purple-700">🌙 晚上 (填中间)</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            晚上没有数据约束，网络顺着自己的坏习惯，点亮了位置3和4（掉进陷阱）。<br/>
                            我们看到它们竟然亮了（虽然不该亮），就<strong>减少</strong>它们的偏置值。<br/>
                            <span className="bg-red-100 px-1 rounded text-red-800">物理效果：</span> 中间的地形隆起，原来的深坑慢慢变成平地，小球以后就不会再掉进来了。
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* MODE 2: MAPPING */}
        {mode === 'mapping' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600">
                                <th className="p-4 border-b w-1/4">阶段</th>
                                <th className="p-4 border-b w-1/4">数学操作</th>
                                <th className="p-4 border-b w-1/4">物理动作</th>
                                <th className="p-4 border-b w-1/4">实际意义</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            <tr>
                                <td className="p-4 font-bold text-blue-600">☀️ 白天 (Day)</td>
                                <td className="p-4 font-mono">Bias += rate</td>
                                <td className="p-4 font-bold">在0和7号位【挖坑】</td>
                                <td className="p-4 text-slate-600">记住“猫耳朵在两边”这一事实。</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-bold text-purple-600">🌙 晚上 (Night)</td>
                                <td className="p-4 font-mono">Bias -= rate</td>
                                <td className="p-4 font-bold">在3和4号位【填坑】</td>
                                <td className="p-4 text-slate-600">遗忘“中间有个大坑”这个幻觉。</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-bold text-slate-500">结果 (Result)</td>
                                <td className="p-4 font-mono">Energy Landscape</td>
                                <td className="p-4 text-slate-600">两边变深，中间变平</td>
                                <td className="p-4 text-slate-600">最终，无论小球怎么滚，都只会落在两边。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="mt-8 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                        <Lightbulb size={20}/> 关键提示
                    </h4>
                    <p className="text-sm text-yellow-900 leading-relaxed">
                        这就是为什么玻尔兹曼机被称为<strong>“基于能量的模型”</strong>。我们不需要告诉它什么是错的，我们只需要：<br/>
                        1. 把正确的地方（数据）能量降低（挖坑）。<br/>
                        2. 让它自己运行，凡是它自己跑去的地方（如果没有数据支撑），就把能量升高（填坑）。
                    </p>
                </div>
            </div>
        )}

        {/* MODE 3: THEORY */}
        {mode === 'theory' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-700 max-w-4xl mx-auto">
                
                <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-800">真正的数学原理</h3>
                    <p className="leading-relaxed">
                        玻尔兹曼机试图学习数据的<strong>概率分布</strong>。对于任何一个状态向量 <code className="bg-slate-100 px-1">v</code>，它出现的概率由玻尔兹曼分布给出：
                    </p>
                    <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-center my-4 shadow-lg">
                        P(v) = (1/Z) * e<sup>-Energy(v) / Temperature</sup>
                    </div>
                    <p>
                        这里的关键是：<strong>能量越低，概率指数级越高。</strong>
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-5 border-l-4 border-blue-500 bg-blue-50 rounded-r-xl">
                        <h3 className="font-bold text-lg text-blue-900 mb-2">Hebbian Learning (挖坑)</h3>
                        <p className="text-sm leading-relaxed text-slate-700">
                            <strong>Positive Phase:</strong> 当网络被数据（猫的图片）钳制时，我们统计神经元的激活情况。<br/>
                            如果两个神经元同时被数据点亮，我们认为它们之间有强关联，于是增加权重（挖坑），降低该状态的能量。
                        </p>
                    </div>
                    <div className="p-5 border-l-4 border-orange-500 bg-orange-50 rounded-r-xl">
                        <h3 className="font-bold text-lg text-orange-900 mb-2">Anti-Hebbian (填坑)</h3>
                        <p className="text-sm leading-relaxed text-slate-700">
                            <strong>Negative Phase:</strong> 我们松开手，让网络自己“做梦”（Gibbs Sampling）。<br/>
                            如果网络在梦中频繁出现某种状态（比如中间亮起），而这种状态在真实数据中并不存在，说明这是网络的“伪像”或“幻觉”。我们减少权重（填坑），升高其能量，抑制其出现概率。
                        </p>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* CTA */}
      <div className="text-center pt-12 border-t mt-12">
          <button 
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-12 py-5 font-bold text-white transition-all duration-200 bg-slate-900 text-lg rounded-xl hover:bg-slate-800 hover:scale-105 hover:shadow-xl focus:outline-none ring-offset-2 focus:ring-2"
          >
            <span>我准备好了，开始实验</span>
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform"/>
          </button>
      </div>

    </div>
  );
};

export default Tutorial;
