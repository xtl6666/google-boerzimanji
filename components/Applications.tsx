
import React from 'react';
import { Brain, Flame, Layers, Network, Snowflake, Shuffle, TrendingUp, Cpu, Image as ImageIcon } from 'lucide-react';

interface ApplicationsProps {
  onBack: () => void;
}

const Applications: React.FC<ApplicationsProps> = ({ onBack }) => {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-700 pb-24 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="text-center space-y-4 pt-4 mb-12">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          从沙盘到世界：应用与启示
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
           虽然玻尔兹曼机在现代已被更高效的算法（如 Transformer）取代，但它的思想内核依然深刻地影响着人工智能与复杂系统科学。
        </p>
      </div>

      <div className="grid gap-12">
        
        {/* SECTION 1: APPLICATIONS */}
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 border-b pb-4">
                <Cpu className="text-blue-600"/> 
                1. 它的实际作用是什么？
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
                {/* App 1 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                        <Layers size={20}/>
                    </div>
                    <h4 className="font-bold text-lg text-slate-800 mb-2">深度学习的鼻祖</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        在2006年之前，训练深层神经网络非常困难。Hinton 教授利用<strong>受限玻尔兹曼机 (RBM)</strong> 对网络进行逐层预训练（Pre-training），开启了深度学习的复兴时代。
                    </p>
                </div>

                {/* App 2 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                        <ImageIcon size={20}/>
                    </div>
                    <h4 className="font-bold text-lg text-slate-800 mb-2">图像修复与生成</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        就像我们在实验室里通过“填坑”让小球归位一样，玻尔兹曼机能根据部分信息推断出整体。这常用于<strong>图像去噪、修复残缺照片</strong>或生成类似风格的新数据。
                    </p>
                </div>

                {/* App 3 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                        <Network size={20}/>
                    </div>
                    <h4 className="font-bold text-lg text-slate-800 mb-2">组合优化问题</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        许多复杂的调度问题（如旅行商问题、芯片布局）都可以转化为寻找能量最低点。玻尔兹曼机通过热涨落机制，能有效寻找这类难题的<strong>近似最优解</strong>。
                    </p>
                </div>
            </div>
        </div>

        {/* SECTION 2: PHILOSOPHY & ANNEALING */}
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 border-b pb-4">
                <LightbulbIcon className="text-yellow-600"/> 
                2. 给我们的启示：模拟退火与人生
            </h3>
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                         <div className="flex items-center gap-3 text-orange-300 font-mono text-sm uppercase tracking-wider">
                             <Flame size={16}/> Simulated Annealing
                         </div>
                         <h4 className="text-3xl font-black leading-tight">
                             为了找到最高峰，<br/>有时必须先走下坡路。
                         </h4>
                         <p className="text-slate-300 text-lg leading-relaxed">
                             在实验室里你看到了，如果一开始温度就太低，小球会卡在错误的浅坑（局部最优）里出不来。
                             <br/><br/>
                             <strong>模拟退火算法</strong>告诉我们：在寻找答案的初期，必须保持“高温”（高混乱度、高随机性）。允许自己犯错，允许自己往“坏”的方向走几步。只有这样，才能跳出舒适圈（局部陷阱），最终找到那个真正的、宏大的深渊（全局最优）。
                         </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-500/20 p-3 rounded-lg text-red-400 shrink-0">
                                <Shuffle size={24}/>
                            </div>
                            <div>
                                <h5 className="font-bold text-lg">初期：接受混乱 (High Temp)</h5>
                                <p className="text-sm text-slate-400 mt-1">
                                    年轻时多尝试，多折腾。看似在走弯路（能量升高），其实是在探索可能性的边界，防止被困在井底。
                                </p>
                            </div>
                        </div>

                        <div className="w-px h-8 bg-slate-700 ml-8 my-1"></div>

                        <div className="flex items-start gap-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400 shrink-0">
                                <Snowflake size={24}/>
                            </div>
                            <div>
                                <h5 className="font-bold text-lg">后期：专注收敛 (Cooling)</h5>
                                <p className="text-sm text-slate-400 mt-1">
                                    随着时间推移，逐渐降低“温度”。减少无意义的随机尝试，专注于深化已有的认知，让智慧结晶。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SLEEP ANALOGY */}
            <div className="bg-indigo-50 p-6 sm:p-8 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row gap-6 items-center">
                 <div className="shrink-0 bg-white p-4 rounded-full shadow-sm text-indigo-600">
                     <Brain size={32} />
                 </div>
                 <div className="space-y-2 text-center sm:text-left">
                     <h4 className="font-bold text-xl text-indigo-900">关于睡眠的猜想</h4>
                     <p className="text-slate-700 leading-relaxed">
                         Hinton 等科学家认为，<strong>睡眠中的做梦（REM阶段）</strong> 可能就是生物大脑在进行“Unlearning（填坑）”的过程。白天我们接触了太多信息（数据钳制），晚上大脑切断输入，自由运行（吉布斯采样），把那些荒谬的、错误的神经连接“遗忘”掉。
                         <br/>
                         <span className="font-bold text-indigo-600">遗忘不是坏事，它是为了让记忆更清晰。</span>
                     </p>
                 </div>
            </div>

        </div>

        <div className="text-center pt-8">
            <button 
                onClick={onBack}
                className="px-8 py-3 bg-slate-200 text-slate-600 font-bold rounded-full hover:bg-slate-300 transition-colors"
            >
                返回实验室
            </button>
        </div>

      </div>
    </div>
  );
};

// Helper Icon for the header
function LightbulbIcon({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`w-6 h-6 ${className}`}
        >
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
        </svg>
    );
}

export default Applications;
