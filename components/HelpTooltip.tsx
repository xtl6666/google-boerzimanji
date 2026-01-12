
import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  content: React.ReactNode;
  position?: 'left' | 'right' | 'center' | 'bottom-right' | 'bottom-left'; // Added bottom variants
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ title, content, position = 'center' }) => {
  const [isOpen, setIsOpen] = useState(false);

  let posClasses = "bottom-full mb-3 left-1/2 -translate-x-1/2"; // Default top center
  let arrowClasses = "bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r";

  // Position Logic
  if (position === 'left') {
    posClasses = "bottom-full mb-3 left-0 -translate-x-4";
    arrowClasses = "bottom-[-6px] left-4 border-b border-r";
  } else if (position === 'right') {
    posClasses = "bottom-full mb-3 right-0 translate-x-4";
    arrowClasses = "bottom-[-6px] right-4 border-b border-r";
  } else if (position === 'bottom-right') {
    posClasses = "top-full mt-3 right-0 translate-x-0"; // Show BELOW the button
    arrowClasses = "top-[-6px] right-2 border-t border-l bg-slate-800";
  } else if (position === 'bottom-left') {
    posClasses = "top-full mt-3 left-0 translate-x-0"; // Show BELOW the button
    arrowClasses = "top-[-6px] left-2 border-t border-l bg-slate-800";
  }

  return (
    <div className="relative inline-block ml-2 z-[60]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-blue-500 transition-colors cursor-pointer opacity-80 hover:opacity-100 align-middle"
        title="点击查看原理解释"
      >
        <HelpCircle size={18} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[60]" 
            onClick={() => setIsOpen(false)} 
          />
          <div className={`absolute ${posClasses} w-64 sm:w-80 bg-slate-800 text-white text-xs p-4 rounded-xl shadow-2xl z-[70] animate-in fade-in zoom-in-95 duration-200 border border-slate-600 leading-relaxed text-left`}>
            <div className="flex justify-between items-start mb-2 border-b border-slate-600 pb-2">
                <h4 className="font-bold text-blue-300 text-sm">{title}</h4>
                <button onClick={() => setIsOpen(false)}><X size={14}/></button>
            </div>
            <div className="opacity-90 space-y-2 text-slate-200">
                {content}
            </div>
            {/* Arrow */}
            <div className={`absolute w-3 h-3 bg-slate-800 rotate-45 ${arrowClasses} border-slate-600`}></div>
          </div>
        </>
      )}
    </div>
  );
};

export default HelpTooltip;
