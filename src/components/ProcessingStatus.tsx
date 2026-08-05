import React from 'react';
import { Sparkles, Scan, Layers } from 'lucide-react';

interface ProcessingStatusProps {
  statusText: string;
  selectedModel: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  statusText,
  selectedModel,
}) => {
  return (
    <div className="max-w-xl mx-auto my-16 p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center shadow-2xl space-y-6 animate-fade-in">
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
        <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl shadow-inner">
          <Scan className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-100 flex items-center justify-center space-x-2">
          <span>Gemini Vision Film Sheet Decomposition</span>
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </h3>
        <p className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full inline-block">
          {statusText}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[9px] uppercase text-slate-500">Model</div>
          <div className="font-bold text-slate-200 truncate mt-0.5">{selectedModel}</div>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[9px] uppercase text-slate-500">Task</div>
          <div className="font-bold text-cyan-300 mt-0.5">Bounding Box 2D</div>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[9px] uppercase text-slate-500">Mode</div>
          <div className="font-bold text-emerald-400 mt-0.5">Canvas Crop</div>
        </div>
      </div>
    </div>
  );
};
