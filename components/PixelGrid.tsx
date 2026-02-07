
import React, { useState, useEffect, useMemo } from 'react';
import { GRID_SIZE, NUM_VISIBLE, PATTERN_CAT } from '../constants';
import { Eye, Network } from 'lucide-react';

interface PixelGridProps {
  state: number[]; 
  weights: number[][]; 
  isDay: boolean;
  similarity: number;
  lastAction: 'dig' | 'fill' | null;
  actionTrigger: number;
  overlayWeights?: number[] | null; // NEW: Weights from a specific Hidden unit
}

// 1. Extract Cell to a memoized component
const PixelCell = React.memo(({ 
    idx, val, isHovered, weightToDisplay, isDay, isAnimating, lastAction, onMouseEnter, overlayWeight
}: {
    idx: number,
    val: number,
    isHovered: boolean,
    weightToDisplay: number | null,
    isDay: boolean,
    isAnimating: boolean,
    lastAction: 'dig' | 'fill' | null,
    onMouseEnter: (idx: number) => void,
    overlayWeight: number | null // NEW
}) => {
    
    // Determine background style based on overlay or value
    let bgClass = "";
    let borderClass = "";
    let content = null;

    if (overlayWeight !== null) {
        // OVERLAY MODE (Exploring H features)
        const intensity = Math.min(1, Math.abs(overlayWeight) * 4); // Scale up for visibility
        if (overlayWeight > 0) {
            bgClass = `bg-blue-500 border-blue-600`;
            content = <div className="absolute inset-0 bg-blue-500 opacity-90" style={{ opacity: intensity }}></div>;
        } else {
            bgClass = `bg-red-500 border-red-600`;
            content = <div className="absolute inset-0 bg-red-500 opacity-90" style={{ opacity: intensity }}></div>;
        }
    } else {
        // NORMAL MODE
        if (val === 1) {
            bgClass = isDay ? 'bg-blue-500 border-blue-600' : 'bg-purple-500 border-purple-600';
        } else {
            bgClass = isDay ? 'bg-slate-100 border-slate-200' : 'bg-slate-700 border-slate-600';
        }
    }

    return (
        <div
            onMouseEnter={() => onMouseEnter(idx)}
            className={`w-10 h-10 rounded-sm flex items-center justify-center border cursor-pointer relative transition-transform duration-75 overflow-hidden ${bgClass} ${borderClass} ${isHovered ? 'ring-2 ring-yellow-400 z-50 scale-110 shadow-lg' : ''}`}
        >
            {content}
            
            {/* Value Indicator (in normal mode) */}
            {overlayWeight === null && val === 1 && (
                <div className={`w-3 h-3 rounded-full ${isDay ? 'bg-white/50' : 'bg-white/30'}`}></div>
            )}

            {/* Ghost Pattern Hint (Day Mode) */}
            {isDay && overlayWeight === null && PATTERN_CAT[idx] === 1 && val === 0 && (
                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full opacity-60"></div>
            )}

            {/* Weight Overlay Text (Hovering Pixel directly) */}
            {weightToDisplay !== null && overlayWeight === null && (
                <div className={`absolute inset-0 z-40 flex items-center justify-center font-bold text-[10px] ${
                    weightToDisplay > 0 
                        ? 'bg-blue-600/95 text-white' 
                        : 'bg-red-500/95 text-white'
                }`}>
                    {weightToDisplay > 0 ? '+' : ''}{weightToDisplay.toFixed(1)}
                </div>
            )}

            {/* Action Animation */}
            {isAnimating && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 z-50 font-black text-lg animate-bounce ${
                    lastAction === 'dig' ? 'text-green-500' : 'text-red-500'
                }`}>
                    {lastAction === 'dig' ? '+' : '-'}
                </div>
            )}
        </div>
    );
}, (prev, next) => {
    return prev.val === next.val && 
           prev.isHovered === next.isHovered && 
           prev.weightToDisplay === next.weightToDisplay &&
           prev.isAnimating === next.isAnimating &&
           prev.isDay === next.isDay &&
           prev.lastAction === next.lastAction &&
           prev.overlayWeight === next.overlayWeight; // Check overlay prop
});

const PixelGrid: React.FC<PixelGridProps> = ({ state, weights, isDay, similarity, lastAction, actionTrigger, overlayWeights }) => {
  const visiblePixels = state.slice(0, NUM_VISIBLE);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatingPixels, setAnimatingPixels] = useState<number[]>([]);

  // Trigger animation
  useEffect(() => {
    if (actionTrigger > 0) {
       const activeIndices = state
         .slice(0, NUM_VISIBLE)
         .map((val, idx) => val === 1 ? idx : -1)
         .filter(idx => idx !== -1);
       
       setAnimatingPixels(activeIndices);
       const timer = setTimeout(() => setAnimatingPixels([]), 600); 
       return () => clearTimeout(timer);
    }
  }, [actionTrigger]);

  const getExplanation = () => {
    if (overlayWeights) {
        return (
            <span className="animate-fade-in block text-sm leading-tight text-left pl-2">
               <div className="flex items-center gap-2 mb-1 text-purple-600 font-bold">
                    <Network size={14}/> 正在查看 H 的特征视野
               </div>
               <div className="text-[10px] text-slate-500 space-y-1">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> H 喜欢这里 (权重正)</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> H 讨厌这里 (权重负)</div>
               </div>
            </span>
        );
    }

    if (hoveredIndex === null) return "👆 悬停方格查看权重，或悬停右侧 H 查看特征。";
    
    return (
        <span className="animate-fade-in block text-sm leading-tight text-left pl-2">
           <div className="flex justify-between items-center mb-1">
                <strong>像素 {hoveredIndex} 的连接强度:</strong>
           </div>
           
           <div className="flex gap-2 text-xs mb-1">
               <span className="text-blue-600 font-bold bg-blue-50 px-1 rounded flex items-center gap-1">
                   <Eye size={10}/> 格子上显示的数字 = 权重
               </span>
           </div>
        </span>
    );
  };

  return (
    <div className="flex flex-col items-center w-full relative z-10">
      <div className={`relative p-4 rounded-xl shadow-xl transition-all duration-500 select-none ${isDay ? 'bg-white ring-4 ring-sky-200' : 'bg-slate-800 ring-4 ring-purple-500'}`}>
        <div 
          className="grid gap-1 relative z-20" 
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {visiblePixels.map((val, idx) => {
             const isHovered = hoveredIndex === idx;
             
             let weightToDisplay = null;
             if (hoveredIndex !== null && hoveredIndex !== idx && !overlayWeights) {
                 const w = weights[hoveredIndex][idx];
                 if (Math.abs(w) > 0.05) {
                     weightToDisplay = w;
                 }
             }

             const isAnimating = animatingPixels.includes(idx);
             const overlayW = overlayWeights ? overlayWeights[idx] : null; // Get overlay weight if active

             return (
                <PixelCell 
                    key={`v-${idx}`}
                    idx={idx}
                    val={val}
                    isHovered={isHovered}
                    weightToDisplay={weightToDisplay}
                    isDay={isDay}
                    isAnimating={isAnimating}
                    lastAction={lastAction}
                    onMouseEnter={setHoveredIndex}
                    overlayWeight={overlayW}
                />
            );
          })}
        </div>
      </div>

      <div className={`mt-4 w-full max-w-[340px] p-2 rounded-lg min-h-[70px] flex items-center justify-center transition-colors border shadow-sm z-0 ${isDay ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-slate-900 border-slate-700 text-slate-200'}`}>
         {getExplanation()}
      </div>
    </div>
  );
};

export default PixelGrid;
