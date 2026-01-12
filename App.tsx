
import React, { useState, useEffect, useRef } from 'react';
import { 
  initNetwork, 
  updateUnit, 
  calculateEnergy, 
  learn, 
  getCatSimilarity 
} from './services/boltzmannLogic';
import { 
  NUM_VISIBLE, 
  PATTERN_CAT, 
  PATTERN_DOG, 
  COLOR_DAY_BG, 
  COLOR_NIGHT_BG 
} from './constants';
import PixelGrid from './components/PixelGrid';
import Landscape from './components/Landscape';
import Tutorial from './components/Tutorial';
import HelpTooltip from './components/HelpTooltip';
import { Sun, Moon, RotateCcw, BookOpen, Zap, Thermometer, Check, AlertCircle, RefreshCw, Activity, Waves } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tutorial' | 'lab'>('tutorial');
  const [network, setNetwork] = useState(initNetwork());
  const [isDay, setIsDay] = useState(true); 
  const [temp, setTemp] = useState(2.5);
  const [isRunning, setIsRunning] = useState(true);
  
  const [learningStep, setLearningStep] = useState(0);
  const [digCount, setDigCount] = useState(0);
  const [fillCount, setFillCount] = useState(0);
  const [epoch, setEpoch] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Action Feedback State
  const [lastAction, setLastAction] = useState<'dig' | 'fill' | null>(null);
  const [actionTrigger, setActionTrigger] = useState(0); 

  const requestRef = useRef<number>(0);

  // --- GAME STATE FOR TUTORIAL ---
  const [guideStep, setGuideStep] = useState(1);
  const [guideMessage, setGuideMessage] = useState("");
  const [successStableCount, setSuccessStableCount] = useState(0); 
  
  const successFrameCount = useRef(0); 
  const STABILITY_THRESHOLD = 150; 

  useEffect(() => {
    const loop = () => {
      if (isRunning && activeTab === 'lab') {
        setNetwork(prev => {
          const newState = [...prev.state];
          const newWeights = prev.weights; 
          const newBiases = prev.biases;

          const idx = Math.floor(Math.random() * newState.length);
          
          if (isDay && idx < NUM_VISIBLE) {
            newState[idx] = PATTERN_CAT[idx]; 
          } else {
            newState[idx] = updateUnit(idx, newState, newWeights, newBiases, temp);
          }
          
          if (isDay) {
            for(let i=0; i<NUM_VISIBLE; i++) newState[i] = PATTERN_CAT[i];
          }

          return { ...prev, state: newState };
        });
      }
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isRunning, isDay, temp, activeTab]);

  const energyCat = calculateEnergy(
    [...PATTERN_CAT, ...network.state.slice(NUM_VISIBLE)], 
    network.weights, 
    network.biases
  );
  const energyDog = calculateEnergy(
    [...PATTERN_DOG, ...network.state.slice(NUM_VISIBLE)], 
    network.weights, 
    network.biases
  );
  const energyCurrent = calculateEnergy(network.state, network.weights, network.biases);
  const similarity = getCatSimilarity(network.state.slice(0, NUM_VISIBLE));

  // --- ACTIONS ---

  const handleTogglePhase = () => {
    successFrameCount.current = 0;
    setSuccessStableCount(0);

    if (isDay) {
        // Switching to Night
        setIsDay(false);
        // Tutorial Progression
        if (guideStep === 2) {
            setGuideStep(3);
            setTemp(4.0); 
        } else if (guideStep === 6) {
            setGuideStep(7); // Loop
        }
    } else {
        // Switching to Day
        setIsDay(true);
        setEpoch(e => e + 1);
        setDigCount(0);
        setFillCount(0);
        setGuideMessage(""); 
        setTemp(2.5);
        
        // Tutorial Progression
        if (guideStep === 5) {
            setGuideStep(6);
        } else if (guideStep === 7) {
            setGuideStep(6); // Loop
        }
    }
  };

  const handleAction = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);

    const direction = isDay ? 1 : -1;
    const rate = 0.2; 

    // Update Action State for Animations
    setLastAction(isDay ? 'dig' : 'fill');
    setActionTrigger(prev => prev + 1);

    if (isDay) {
        setDigCount(prev => prev + 1);
        if (guideStep === 1 && digCount >= 4) {
             setGuideStep(2); 
        }
    } else {
        setFillCount(prev => prev + 1);
        if (guideStep === 4) {
            setGuideStep(5);
        }
    }

    const result = learn(
      network.state, 
      network.weights, 
      network.biases, 
      rate, 
      direction
    );

    setNetwork(prev => ({
      ...prev,
      weights: result.weights,
      biases: result.biases
    }));

    setLearningStep(prev => prev + 1);
    setTimeout(() => setLearningStep(0), 300);
  };

  const handleReset = () => {
    setNetwork(initNetwork());
    setIsDay(true);
    setDigCount(0);
    setFillCount(0);
    setEpoch(1);
    setTemp(2.5);
    setGuideStep(1);
    setGuideMessage("");
    successFrameCount.current = 0;
    setSuccessStableCount(0);
  };

  const checkSuccess = () => {
      // 1. STRICT DAY MODE BLOCK
      if (isDay) {
        successFrameCount.current = 0;
        setSuccessStableCount(0);
        if (guideMessage && guideMessage.includes("稳定")) {
            setGuideMessage("");
        }
        return;
      }

      // 2. NIGHT MODE STABILITY CHECK
      if (temp <= 1.2) {
         if (similarity >= 0.94) {
             successFrameCount.current++;
         } else {
             successFrameCount.current = Math.max(0, successFrameCount.current - 5);
         }

         setSuccessStableCount(successFrameCount.current);

         if (successFrameCount.current > STABILITY_THRESHOLD) {
             if (guideStep === 7) {
                setGuideMessage("🎉 实验成功！网络已经完全记住了猫。\n即便在低温下，小球也稳定地掉进了“猫坑”。");
             }
         } else if (guideStep === 7) {
             if (successFrameCount.current > 30) {
                 const progress = Math.min(100, Math.floor((successFrameCount.current / STABILITY_THRESHOLD) * 100));
                 setGuideMessage(`🤔 正在检测稳定性... ${progress}% \n请保持住！`);
             } else if (similarity < 0.6) {
                 setGuideMessage("⚠️ 还没记住？\n请【切回白天】继续挖坑，然后【切回晚上】再试。");
             }
         }
      } else {
          successFrameCount.current = 0;
          setSuccessStableCount(0);
          if (guideStep === 7) setGuideMessage(""); 
      }
  };

  useEffect(() => {
    checkSuccess();
  }, [network.state]); 

  const handleTempChange = (val: number) => {
      setTemp(val);
      if (guideStep === 3 && val < 0.9) {
          setGuideStep(4);
      }
  };

  const ThermalVibration = () => {
      const isHighTemp = temp > 2.0;
      
      return (
        <div className="w-full mt-4 bg-slate-900/50 p-4 rounded-lg border border-slate-600/30">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">物理状态</span>
                <span className={`text-xs font-black ${isHighTemp ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isHighTemp ? "🔥 高弹/活跃" : "❄️ 低弹/冻结"}
                </span>
            </div>
            
            <div className="text-[10px] text-slate-400 mt-2 leading-tight">
                <p>
                    <strong>温度 = 弹性系数:</strong><br/>
                    高温时 (2.5+)，小球是“橡胶做的”，撞地后反弹很高，能跳出局部最优。<br/>
                    低温时 (0.5)，小球是“铅做的”，撞地后不反弹，只能滚向最低点。
                </p>
            </div>
        </div>
      );
  };

  const steps = [
      { id: 1, text: "👉 1. 白天挖坑：点击【挖坑】。看！锤子会同时砸向左边(0)和右边(7)的坑。", done: guideStep > 1 },
      { id: 2, text: "👉 2. 切换模式：点击右上角【切换到晚上】进入自由物理模式。", done: guideStep > 2 },
      { id: 3, text: "👉 3. 缓慢降温：把【温度】调低。让球停下来。", done: guideStep > 3 },
      { id: 4, text: "👉 4. 晚上填坑：看！中间有个“大陷阱”(4号坑)，球掉进去了吗？快点击【填坑】把它填平！", done: guideStep > 4 },
      { id: 5, text: "👉 5. 循环：现在【切回白天】。", done: guideStep > 5 },
      { id: 6, text: "👉 6. 加固：再次点击【挖坑】加深记忆。", done: guideStep > 6 },
      { id: 7, text: "🔄 7. 见证奇迹：切回晚上，先高温乱跳，再降温。球应该自动滚进最左(0)和最右(7)的坑。", done: false }
  ];

  if (activeTab === 'tutorial') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            🐱 猫狗学习记 <span className="text-slate-400 font-normal hidden sm:inline">| 玻尔兹曼机</span>
          </h1>
          <button 
             onClick={() => setActiveTab('lab')}
             className="text-sm font-bold px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            直接进入实验室
          </button>
        </div>
        <Tutorial onStart={() => setActiveTab('lab')} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isDay ? COLOR_DAY_BG : COLOR_NIGHT_BG} font-sans pb-10 overflow-hidden flex flex-col`}>
      
      {/* Top Bar */}
      <div className={`px-4 sm:px-6 py-3 flex justify-between items-center shadow-md ${isDay ? 'bg-white/90 text-slate-800' : 'bg-slate-900/90 text-slate-100'} backdrop-blur sticky top-0 z-40 border-b ${isDay ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
            🐱 实验室
          </h1>
          <button onClick={() => setActiveTab('tutorial')} className={`text-xs px-3 py-1.5 rounded-full font-bold transition ${isDay ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            📖 返回原理
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold ${isDay ? 'bg-blue-100 text-blue-700' : 'bg-indigo-900 text-indigo-300'}`}>
                <span>Epoch: {epoch}</span>
            </div>
            <button onClick={handleReset} className={`p-2 rounded-full transition ${isDay ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-slate-700 text-slate-300'}`} title="重置实验">
               <RotateCcw size={18} />
            </button>
        </div>
      </div>

      <div className="flex-grow w-full max-w-[1400px] mx-auto p-4 gap-6 grid grid-cols-1 lg:grid-cols-12 items-stretch">
        
        {/* LEFT COLUMN: Guide */}
        <div className="lg:col-span-2 flex flex-col gap-4 relative z-10">
            <div className={`p-4 rounded-2xl border-l-4 shadow-sm transition-all flex flex-col ${isDay ? 'bg-white border-blue-500' : 'bg-slate-800 border-indigo-500'}`}>
                <h3 className={`font-black text-sm mb-3 flex items-center gap-2 ${isDay ? 'text-slate-800' : 'text-slate-100'}`}>
                    <BookOpen size={16}/> 实验流程
                </h3>
                <div className="space-y-3">
                    {steps.map((s, idx) => (
                        <div key={idx} className={`p-2 rounded-xl transition-all border ${
                            guideStep === s.id 
                                ? (isDay ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-md ring-1 ring-blue-300' : 'bg-indigo-900/40 border-indigo-700 text-indigo-100 shadow-md ring-1 ring-indigo-500') 
                                : s.done 
                                    ? 'opacity-50 border-transparent bg-slate-100 dark:bg-slate-700/50' 
                                    : 'opacity-30 border-transparent'
                        }`}>
                            <div className="flex gap-2 items-start">
                                <span className={`font-black text-xs shrink-0 mt-0.5 ${guideStep === s.id ? (isDay ? 'text-blue-600' : 'text-indigo-400') : ''}`}>
                                    {s.done ? <Check size={14}/> : idx + 1}
                                </span>
                                <span className={`text-xs font-medium leading-tight ${isDay ? 'text-slate-700' : 'text-slate-300'}`}>{s.text}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {guideMessage && (
                    <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs rounded-lg flex gap-2 items-start animate-pulse shadow-sm z-50 relative">
                        {guideStep === 7 && successStableCount > STABILITY_THRESHOLD
                            ? <Activity size={16} className="mt-0.5 shrink-0 text-green-600"/> 
                            : <AlertCircle size={16} className="mt-0.5 shrink-0 text-yellow-600"/>
                        }
                        <span className="whitespace-pre-wrap font-medium leading-tight">{guideMessage}</span>
                    </div>
                )}
            </div>
        </div>

        {/* MIDDLE COLUMN */}
        <div className="lg:col-span-6 flex flex-col items-center justify-start relative z-20 min-h-[600px]">
            <div className={`p-1 rounded-full w-full max-w-sm flex relative shadow-inner items-center mb-6 ${isDay ? 'bg-slate-200' : 'bg-slate-700'}`}>
                 <button 
                    onClick={() => !isDay && handleTogglePhase()}
                    disabled={isDay}
                    className={`flex-1 py-2 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all z-10 ${isDay ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-200'}`}
                 >
                    <Sun size={16}/> 白天 (数据钳制)
                 </button>
                 <button 
                    onClick={() => isDay && handleTogglePhase()}
                    disabled={!isDay}
                    className={`flex-1 py-2 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all z-10 ${!isDay ? 'bg-slate-800 shadow-md text-yellow-400' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    <Moon size={16}/> 晚上 (自由弹球)
                 </button>
                 <HelpTooltip 
                    position="bottom-right"
                    title="模式对比" 
                    content={
                        <>
                        <p><strong>白天 (数据引力):</strong> 小球自由下落，但被“数据之风”强力吹向猫耳位置(0和7)。如果球落进去了，我们就在那里挖坑。</p>
                        <p><strong>晚上 (自由物理):</strong> 没有风。小球完全随机弹跳。如果掉进错误的坑，我们就把它填平。</p>
                        </>
                    }
                 />
            </div>

            <div className="flex-grow flex items-center justify-center w-full mb-8">
                 <div className="transform scale-110 sm:scale-125 md:scale-150">
                    <PixelGrid 
                        state={network.state} 
                        weights={network.weights} 
                        isDay={isDay} 
                        similarity={similarity}
                        actionTrigger={actionTrigger}
                        lastAction={lastAction}
                    />
                </div>
            </div>

            <div className="w-full max-w-sm space-y-3 relative z-10 mt-auto">
                <button
                    onClick={handleAction}
                    className={`w-full py-4 rounded-2xl text-lg font-black shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 border-b-4 ${
                    isDay 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-200 border-blue-800'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40 border-purple-800'
                    }`}
                >
                    {isDay ? <Zap size={24} className="animate-pulse"/> : <RotateCcw size={24} className="animate-spin-slow"/>}
                    <div className="flex flex-col items-start leading-none">
                        <div className="flex items-center gap-2">
                             <span>{isDay ? "点击挖坑 (Deepen)" : "点击填坑 (Flatten)"}</span>
                        </div>
                        <span className="text-[10px] opacity-80 font-normal mt-1">{isDay ? "用锤子砸深有球的坑" : "用铲子填平有球的坑"}</span>
                    </div>
                </button>
                
                <div className={`flex justify-between items-center text-xs font-bold rounded-lg px-4 py-3 ${isDay ? 'text-slate-500 bg-slate-100' : 'text-slate-400 bg-slate-800'}`}>
                    <span>{isDay ? `已挖掘: ${digCount} 次` : `已填补: ${fillCount} 次`}</span>
                    <HelpTooltip 
                        position="bottom-left"
                        title={isDay ? "为什么要填坑？(核心问题)" : "为什么要填坑？"}
                        content={isDay 
                            ? <p><strong>如果不填坑会怎样？</strong><br/>如果你只挖不填，整个沙盘都会下沉。猫是大坑，乱码也是大坑。网络会变得“滥情”，什么都认为是正确的。填坑(遗忘)是为了让非猫区域变高，从而增加猫的“独特性”。</p>
                            : "晚上是反思。撤去数据引力后，如果小球掉进了错误的坑（幻觉），我们把它填平，防止以后再犯错。"
                        }
                    />
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6 relative z-10 h-full">
            <div className={`flex-grow min-h-[300px] rounded-2xl overflow-hidden shadow-lg border-2 relative flex flex-col ${isDay ? 'bg-white border-blue-100' : 'bg-slate-800 border-indigo-900'}`}>
                <div className="absolute top-3 left-3 z-10 flex items-center">
                     <span className={`text-xs font-black px-2 py-1 rounded ${isDay ? 'bg-blue-100 text-blue-700' : 'bg-indigo-900 text-indigo-300'}`}>
                        第一行记忆深度 (Bias Profile)
                     </span>
                     <HelpTooltip 
                        position="bottom-left"
                        title="第一行记忆深度"
                        content="这里展示了第一行8个像素的'地形'。坑越深，小球越容易掉进去（对应像素亮起）。我们的目标是把最左(0)和最右(7)挖成深坑。"
                     />
                </div>
                <div className="flex-grow relative w-full h-full">
                    <Landscape 
                        biases={network.biases.slice(0, 8)}
                        rowState={network.state.slice(0, 8)}
                        isDay={isDay}
                        learningStep={learningStep}
                        temperature={temp}
                        lastAction={lastAction}
                    />
                </div>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm transition-all ${isDay ? 'bg-slate-100 border-slate-200 opacity-70' : 'bg-slate-800 border-orange-500/40'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                        <span className={`font-black text-sm flex items-center gap-2 ${isDay ? 'text-slate-500' : 'text-orange-400'}`}>
                            <Thermometer size={18}/> 
                            系统温度 (Temperature)
                            <HelpTooltip 
                                position="bottom-right"
                                title="模拟退火"
                                content={
                                    <>
                                    <p><strong>高温 (高弹):</strong> 小球反弹剧烈，能跳出错误的浅坑。</p>
                                    <p><strong>低温 (低弹):</strong> 小球失去弹性，只能滚进最近的坑底。</p>
                                    <p><strong>注意:</strong> 白天温度无效，因为小球被数据风引力控制了。</p>
                                    </>
                                }
                            />
                        </span>
                        <span className={`text-[10px] mt-0.5 ${isDay ? 'text-slate-400' : 'text-slate-500'}`}>
                            {isDay ? "数据引力开启 (Guided)" : "自由运行 (Free)"}
                        </span>
                    </div>
                    <span className={`font-mono text-2xl font-black ${isDay ? 'text-slate-400' : 'text-white'}`}>{temp.toFixed(1)}</span>
                </div>
                
                <input 
                    type="range" min="0.5" max="5.0" step="0.1" 
                    value={temp}
                    disabled={isDay}
                    onChange={(e) => handleTempChange(parseFloat(e.target.value))}
                    className={`w-full h-3 rounded-lg appearance-none cursor-pointer mb-2 ${isDay ? 'bg-slate-300' : 'bg-slate-600 accent-orange-500'}`} 
                />
                
                <div className={`flex justify-between text-xs font-bold mt-2 ${isDay ? 'text-slate-400' : 'text-slate-400'}`}>
                    <span className="flex items-center gap-1">❄️ 低弹/铅球</span>
                    <span className="flex items-center gap-1">🔥 高弹/橡胶</span>
                </div>

                {/* NEW THERMAL VISUALIZATION */}
                {!isDay && <ThermalVibration />}
                
                {!isDay && guideStep >= 5 && (
                     <div className="mt-3 text-[10px] text-orange-300 flex items-center gap-1">
                        <RefreshCw size={10}/> 提示：如果没成功，切回白天再挖几次！
                     </div>
                )}
            </div>

        </div>

      </div>
    </div>
  );
};

export default App;
