import React from 'react';
import { SequenceGroup, DisplayMode } from '../types';
import { Layers, Grid, SquareStack, Check } from 'lucide-react';

interface SequenceTabsProps {
  sequences: SequenceGroup[];
  selectedSeqId: string | 'ALL';
  onSelectSeq: (seqId: string | 'ALL') => void;
  displayMode: DisplayMode;
  onToggleDisplayMode: (mode: DisplayMode) => void;
  totalSliceCount: number;
}

export const SequenceTabs: React.FC<SequenceTabsProps> = ({
  sequences,
  selectedSeqId,
  onSelectSeq,
  displayMode,
  onToggleDisplayMode,
  totalSliceCount,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-md">
      {/* Sequence Selector Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 max-w-full">
        <button
          onClick={() => onSelectSeq('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            selectedSeqId === 'ALL'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Sequences</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              selectedSeqId === 'ALL' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {totalSliceCount}
          </span>
        </button>

        {sequences.map((seq) => {
          const isSelected = selectedSeqId === seq.id;
          return (
            <button
              key={seq.id}
              onClick={() => onSelectSeq(seq.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{seq.name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {seq.slices.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stack vs Grid View Mode Toggle */}
      <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onToggleDisplayMode('STACK')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
            displayMode === 'STACK'
              ? 'bg-slate-800 text-cyan-300 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="PACS Stack Wheel Scroll Viewer Mode"
        >
          <SquareStack className="w-3.5 h-3.5" />
          <span>DICOM Stack</span>
        </button>

        <button
          onClick={() => onToggleDisplayMode('GRID')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
            displayMode === 'GRID'
              ? 'bg-slate-800 text-cyan-300 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Series Grid Matrix View"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Series Grid</span>
        </button>
      </div>
    </div>
  );
};
