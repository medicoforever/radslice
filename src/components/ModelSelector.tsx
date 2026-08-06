import React, { useState, useRef, useEffect } from 'react';
import { GEMINI_MODELS } from '../constants';
import { Sparkles, ChevronDown } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = GEMINI_MODELS.find(m => m.id === selectedModel) || GEMINI_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm"
      >
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
        <div className="text-left">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 leading-none">
            Gemini Vision Model
          </div>
          <div className="text-xs font-semibold text-cyan-300 flex items-center space-x-1 mt-0.5">
            <span>{currentModel.name}</span>
            {currentModel.recommended && (
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                BEST
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1 border-b border-slate-800 mb-1">
            Select Gemini Vision Engine
          </div>
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {GEMINI_MODELS.map(model => {
            const isSelected = model.id === selectedModel;
            return (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg transition-all text-xs flex flex-col space-y-0.5 ${
                  isSelected
                    ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-200 font-semibold'
                    : 'hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center space-x-1.5">
                    <span>{model.name}</span>
                    {model.recommended && (
                      <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-1 py-0.2 rounded">
                        ★ Vision Priority
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{model.badge}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal line-clamp-2">
                  {model.description}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
