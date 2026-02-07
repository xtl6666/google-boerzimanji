
import React, { useState } from 'react';
import OrientationDock from './components/OrientationDock';
import Level0 from './components/Level0';
import Level1 from './components/Level1';
import Level2 from './components/Level2';
import Level3 from './components/Level3';
import Level4 from './components/Level4';
import Level5 from './components/Level5';
import Recap from './components/Recap';
import { X, Map, CheckCircle, Zap, Brain, ArrowRight } from 'lucide-react';

type View = 'cover' | 'orientation' | 'lab' | 'recap';

// --- COVER COMPONENT ---
const Cover = ({ onStart }: { onStart: () => void }) => (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden text-white">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="z-10 text-center space-y-8 p-4">
            <div className="flex justify-center gap-4 mb-4 text-slate-400 opacity-50">
                <Brain size={48} />
                <Zap size={48} />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                机器的梦境
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 font-light tracking-wide max-w-2xl mx-auto">
                一场关于神经网络、能量模型与无监督学习的<br/>可视化探索之旅
            </p>
            
            <div className="pt-8">
                <button 
                    onClick={onStart}
                    className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white transition-all duration-200 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-full hover:bg-white hover:text-slate-900 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
                >
                    <span>开始游戏</span>
                    <ArrowRight className="ml-3 -mr-1 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            
            <p className="text-sm text-slate-500 mt-12 font-mono">
                Interactive Explorable Paper · Level 0 - 5
            </p>
        </div>
    </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('cover'); // Start at cover
  const [currentLevel, setCurrentLevel] = useState(0); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [orientationKey, setOrientationKey] = useState(0); // Soft restart key for Part 1
  
  // GLOBAL PROGRESS STATE
  const [levelProgress, setLevelProgress] = useState<Record<number, number>>({
      0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1
  });

  const updateProgress = (level: number, step: number) => {
      setLevelProgress(prev => {
          if (prev[level] === step) return prev;
          return { ...prev, [level]: step };
      });
  };

  const handleLevelBack = () => {
      let prev = currentLevel - 1;
      if (prev < 0) {
          setCurrentView('orientation');
          return;
      }
      setCurrentLevel(prev);
  };

  const handleNextLevel = () => {
      let next = currentLevel + 1;
      if (next > 5) {
          setCurrentView('recap'); // Go to Recap after Level 5
          return;
      }
      setCurrentLevel(next);
  };

  const handleGoToLevel = (levelId: number, stepId: number) => {
      setCurrentLevel(levelId);
      updateProgress(levelId, stepId); // Set the step
      setCurrentView('lab');
      setIsMenuOpen(false);
  };

  // EXTRACTED MENU COMPONENT
  const LevelMenu = () => (
    <div 
        className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={() => setIsMenuOpen(false)} 
    >
        <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
        >
            <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center shrink-0">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Map className="text-blue-600"/> 
                    实验地图 (Level Select)
                </h2>
                <button 
                    onClick={() => setIsMenuOpen(false)} 
                    className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                >
                    <X size={24}/>
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <button 
                        onClick={() => { setCurrentView('cover'); setIsMenuOpen(false); }}
                        className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 text-left border-slate-100 hover:border-blue-300 hover:bg-slate-50 bg-white`}
                    >
                        <div className="flex justify-between w-full mb-2">
                            <span className="text-2xl">🏠</span>
                        </div>
                        <div className="font-bold text-slate-800">封面 (Start)</div>
                        <div className="text-xs mt-1 text-slate-500">回到开始界面</div>
                    </button>

                    <button 
                        onClick={() => { setCurrentView('orientation'); setIsMenuOpen(false); }}
                        className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 text-left ${
                            currentView === 'orientation'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md' 
                            : 'border-slate-100 hover:border-blue-300 hover:bg-slate-50 bg-white'
                        }`}
                    >
                        <div className="flex justify-between w-full mb-2">
                            <span className="text-2xl">⚓</span>
                            {currentView === 'orientation' && <CheckCircle size={20} className="text-blue-500"/>}
                        </div>
                        <div className={`font-bold ${currentView === 'orientation' ? 'text-blue-900' : 'text-slate-800'}`}>Part 1: 入门区</div>
                        <div className={`text-xs mt-1 ${currentView === 'orientation' ? 'text-blue-600' : 'text-slate-500'}`}>操作与求助指南</div>
                    </button>

                    {[
                        { id: 0, title: "Level 0: 基础校准", desc: "理解0/1状态与概率", icon: "🎛️" },
                        { id: 1, title: "Level 1: 造山运动", desc: "权重w与能量地形", icon: "🏔️" },
                        { id: 2, title: "Level 2: 翻越能垒", desc: "偏置b与温度T", icon: "🌡️" },
                        { id: 3, title: "Level 3: 隐变量", desc: "H单元的作用与重建", icon: "👻" },
                        { id: 4, title: "Level 4: 暗房冲洗", desc: "学习 = 现实 - 梦境", icon: "📸" },
                        { id: 5, title: "Level 5: 猫狗记忆", desc: "完整的玻尔兹曼机", icon: "🐱" },
                    ].map((lvl) => (
                        <button 
                            key={lvl.id}
                            onClick={() => { setCurrentLevel(lvl.id); setCurrentView('lab'); setIsMenuOpen(false); }}
                            className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 text-left ${
                                currentLevel === lvl.id && currentView === 'lab'
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md' 
                                : 'border-slate-100 hover:border-blue-300 hover:bg-slate-50 bg-white'
                            }`}
                        >
                            <div className="flex justify-between w-full mb-2">
                                <span className="text-2xl">{lvl.icon}</span>
                                {currentLevel === lvl.id && currentView === 'lab' && <CheckCircle size={20} className="text-blue-500"/>}
                            </div>
                            <div className={`font-bold ${currentLevel === lvl.id && currentView === 'lab' ? 'text-blue-900' : 'text-slate-800'}`}>{lvl.title}</div>
                            <div className={`text-xs mt-1 ${currentLevel === lvl.id && currentView === 'lab' ? 'text-blue-600' : 'text-slate-500'}`}>{lvl.desc}</div>
                        </button>
                    ))}

                    <button 
                        onClick={() => { setCurrentView('recap'); setIsMenuOpen(false); }}
                        className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 text-left border-slate-100 hover:border-blue-300 hover:bg-slate-50 bg-white`}
                    >
                        <div className="flex justify-between w-full mb-2">
                            <span className="text-2xl">🗺️</span>
                        </div>
                        <div className="font-bold text-slate-800">Part 3: 实验复盘</div>
                        <div className="text-xs mt-1 text-slate-500">连接所有知识点</div>
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t flex justify-between items-center shrink-0">
                <span className="text-xs text-slate-400 font-bold">
                    Current View: {currentView.toUpperCase()}
                </span>
                <button 
                    onClick={() => setIsMenuOpen(false)} 
                    className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors"
                >
                    关闭
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="w-screen h-screen bg-slate-100 flex flex-col relative overflow-hidden font-sans">
        
        {/* --- GLOBAL MENU OVERLAY --- */}
        {isMenuOpen && <LevelMenu />}

        {/* --- ROUTER --- */}
        
        {currentView === 'cover' && (
            <Cover onStart={() => setCurrentView('orientation')} />
        )}

        {currentView === 'orientation' && (
            <div className="w-full h-full bg-white">
                <OrientationDock 
                    key={orientationKey}
                    onComplete={() => setCurrentView('lab')}
                    onOpenMenu={() => setIsMenuOpen(true)}
                    onRestart={() => setOrientationKey(k => k + 1)}
                    onSkip={() => setCurrentView('lab')}
                />
            </div>
        )}

        {currentView === 'lab' && (
            <>
                {/* Global Floating Map Button for Lab */}
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white p-3 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-110 active:scale-95 border-2 border-slate-700 flex items-center justify-center group"
                    title="选择关卡 (Level Map)"
                >
                    <Map size={24} />
                    <span className="absolute right-full mr-3 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        切换关卡
                    </span>
                </button>

                <div className="flex-grow overflow-hidden relative w-full h-full">
                    {currentLevel === 0 && (
                        <div className="w-full h-full">
                            <Level0 
                                initialStep={levelProgress[0] || 1}
                                onStepChange={(s) => updateProgress(0, s)}
                                onComplete={handleNextLevel} 
                                onPrevLevel={handleLevelBack} 
                                canPrevLevel={true}
                                onOpenMenu={() => setIsMenuOpen(true)}
                            />
                        </div>
                    )}

                    {currentLevel === 1 && (
                        <div className="w-full h-full max-w-6xl mx-auto bg-white sm:shadow-xl sm:my-4 sm:rounded-2xl overflow-hidden border border-slate-200">
                            <Level1 
                                initialStep={levelProgress[1] || 1}
                                onStepChange={(s) => updateProgress(1, s)}
                                onComplete={handleNextLevel}
                                onPrevLevel={handleLevelBack}
                                canPrevLevel={true}
                                onOpenMenu={() => setIsMenuOpen(true)}
                            />
                        </div>
                    )}
                    
                    {currentLevel === 2 && (
                        <div className="w-full h-full max-w-6xl mx-auto bg-white sm:shadow-xl sm:my-4 sm:rounded-2xl overflow-hidden border border-slate-200">
                            <Level2 
                                initialStep={levelProgress[2] || 1}
                                onStepChange={(s) => updateProgress(2, s)}
                                onComplete={handleNextLevel}
                                onPrevLevel={handleLevelBack}
                                canPrevLevel={true}
                                onOpenMenu={() => setIsMenuOpen(true)}
                            />
                        </div>
                    )}

                    {currentLevel === 3 && (
                        <div className="w-full h-full max-w-6xl mx-auto bg-white sm:shadow-xl sm:my-4 sm:rounded-2xl overflow-hidden border border-slate-200">
                            <Level3 
                                initialStep={levelProgress[3] || 1}
                                onStepChange={(s) => updateProgress(3, s)}
                                onComplete={handleNextLevel} 
                                onPrevLevel={handleLevelBack}
                                canPrevLevel={true}
                                onOpenMenu={() => setIsMenuOpen(true)}
                            />
                        </div>
                    )}
                    
                    {currentLevel === 4 && (
                        <div className="w-full h-full max-w-6xl mx-auto bg-white sm:shadow-xl sm:my-4 sm:rounded-2xl overflow-hidden border border-slate-200">
                            <Level4 
                                onComplete={handleNextLevel} 
                                onPrevLevel={handleLevelBack}
                                canPrevLevel={true}
                                onOpenMenu={() => setIsMenuOpen(true)}
                            />
                        </div>
                    )}

                    {currentLevel === 5 && (
                        <Level5 
                            initialStep={levelProgress[5] || 1}
                            onStepChange={(s) => updateProgress(5, s)}
                            onGoToApplications={() => setCurrentView('recap')}
                            onPrevLevel={handleLevelBack}
                            canPrevLevel={true}
                            onOpenMenu={() => setIsMenuOpen(true)}
                        />
                    )}
                </div>
            </>
        )}

        {currentView === 'recap' && (
            <Recap 
                onBack={() => setCurrentView('lab')}
                onGoToLevel={handleGoToLevel}
            />
        )}
    </div>
  );
};

export default App;
