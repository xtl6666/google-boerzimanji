
import React, { useState } from 'react';
import { 
    X, ArrowRight, CheckCircle, Scale, 
    Zap, Divide, BarChart3, TestTube, SplitSquareHorizontal, Brain, Eye
} from 'lucide-react';
import TermHelp from './TermHelp';

export const useIntroOnce = (key: string): [boolean, (v: boolean) => void] => {
    const [show, setShow] = useState(() => {
        try {
            return !localStorage.getItem(key);
        } catch(e) { return true; }
    });

    const setShown = (val: boolean) => {
        setShow(val);
        if (!val) {
            try {
                localStorage.setItem(key, 'true');
            } catch(e) {}
        }
    };

    return [show, setShown];
};

const Level4IntroModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="bg-slate-50 p-6 border-b flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl">
                            <TestTube size={28}/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">Level 4: 双相实验台</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">The 4-2-4 Encoder Challenge</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={24}/>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                    
                    {/* 1. One Liner */}
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-4 items-start">
                        <Brain className="text-blue-600 shrink-0 mt-1" size={24}/>
                        <div>
                            <h3 className="font-bold text-blue-900 text-lg mb-1">一句话目标</h3>
                            <p className="text-blue-800 text-sm leading-relaxed font-medium">
                                这一关只做一件事：对比<strong>“现实共现”</strong>与<strong>“梦境共现”</strong>，用它们的差值来更新权重，让模型生成的梦境越来越像现实。
                            </p>
                        </div>
                    </div>

                    {/* 2. Pipeline Visualization */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 size={16}/> 核心流水线 (The Pipeline)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center relative group hover:border-emerald-300 transition-colors">
                                <div className="text-xs font-bold text-emerald-600 mb-1">Step 1</div>
                                <div className="font-black text-slate-700">正相 (Pos)</div>
                                <div className="text-[10px] text-slate-500 mt-1">固定答案，统计现实</div>
                                <div className="hidden sm:block absolute top-1/2 -right-3 -mt-2 text-slate-300 z-10">→</div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center relative group hover:border-red-300 transition-colors">
                                <div className="text-xs font-bold text-red-600 mb-1">Step 2</div>
                                <div className="font-black text-slate-700">负相 (Neg)</div>
                                <div className="text-[10px] text-slate-500 mt-1">放飞自我，统计梦境</div>
                                <div className="hidden sm:block absolute top-1/2 -right-3 -mt-2 text-slate-300 z-10">→</div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center relative group hover:border-purple-300 transition-colors">
                                <div className="text-xs font-bold text-purple-600 mb-1">Step 3</div>
                                <div className="font-black text-slate-700">计算差值 Δ</div>
                                <div className="text-[10px] text-slate-500 mt-1">现实 - 梦境</div>
                                <div className="hidden sm:block absolute top-1/2 -right-3 -mt-2 text-slate-300 z-10">→</div>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center relative group hover:border-blue-300 transition-colors">
                                <div className="text-xs font-bold text-blue-600 mb-1">Step 4</div>
                                <div className="font-black text-slate-700">更新权重</div>
                                <div className="text-[10px] text-slate-500 mt-1">修正误差</div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Expected Outcome */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                            <Eye size={16}/> 你将会看到
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex gap-2 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                                <span><strong>Δ 不再是 0：</strong> 开始时正负相统计不同，产生学习信号。</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                                <span><strong>权重变色：</strong> 右侧热力图颜色会随更新而变化（蓝=增强，红=抑制）。</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                                <span><strong>梦境进化：</strong> 更新几次后，负相的 V2 重建会越来越像现实样本。</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-6 border-t flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-sm shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2 group"
                    >
                        <span>进入实验室</span> 
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Level4IntroModal;
