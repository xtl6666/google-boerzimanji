
import React from 'react';
import { ArrowLeft, RotateCcw, ChevronRight, Menu, Map } from 'lucide-react';

interface LevelNavProps {
    title: string;
    subTitle?: string;
    currentStep: number;
    totalSteps?: number;
    onPrevStep: () => void;
    onNextStep?: () => void; // Optional, usually handled by main interaction
    onPrevLevel?: () => void;
    onRestart: () => void;
    onOpenMenu?: () => void;
    onSkip?: () => void;
    canPrevStep: boolean;
    canPrevLevel: boolean;
}

const LevelNav: React.FC<LevelNavProps> = ({ 
    title, subTitle, 
    currentStep, totalSteps,
    onPrevStep, onNextStep, onPrevLevel, onRestart, onOpenMenu, onSkip,
    canPrevStep, canPrevLevel
}) => {
    return (
        <div className="bg-white border-b px-4 py-3 shadow-sm flex flex-col sm:flex-row justify-between items-center sticky top-0 z-40 gap-3 sm:gap-0">
            {/* Left: Navigation */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                    onClick={onPrevLevel}
                    disabled={!canPrevLevel}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${
                        canPrevLevel ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                    title="返回上一关"
                >
                    <ArrowLeft size={14}/> <span className="hidden sm:inline">上一关</span>
                </button>
                
                <div className="w-px h-6 bg-slate-200 mx-1"></div>

                <button 
                    onClick={onPrevStep}
                    disabled={!canPrevStep}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold border ${
                        canPrevStep 
                        ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' 
                        : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                    }`}
                >
                    <ArrowLeft size={12}/> 上一步
                </button>
            </div>

            {/* Center: Title */}
            <div className="flex flex-col items-center">
                <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    {title}
                </h2>
                {subTitle && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{subTitle}</span>}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {onSkip && (
                    <button 
                        onClick={onSkip}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1.5 transition-colors mr-2 hidden sm:block"
                    >
                        跳过 (Skip)
                    </button>
                )}

                {totalSteps && (
                    <div className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        Step {currentStep}/{totalSteps}
                    </div>
                )}
                <button 
                    onClick={onRestart}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    title="重新开始本关"
                >
                    <RotateCcw size={16}/>
                </button>
                
                {onOpenMenu && (
                    <button 
                        onClick={onOpenMenu}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                        title="选择关卡"
                    >
                        <Map size={16}/> <span className="text-xs font-bold hidden sm:inline">地图</span>
                    </button>
                )}

                {onNextStep && (
                    <button 
                        onClick={onNextStep}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                        下一步 <ChevronRight size={12}/>
                    </button>
                )}
            </div>
        </div>
    );
};

export default LevelNav;
