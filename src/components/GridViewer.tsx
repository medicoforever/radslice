import React from 'react';
import { FilmSlice, WindowSettings } from '../types';
import { Eye } from 'lucide-react';

interface GridViewerProps {
  slices: FilmSlice[];
  windowSettings: WindowSettings;
  onSelectSlice: (index: number) => void;
}

export const GridViewer: React.FC<GridViewerProps> = ({
  slices,
  windowSettings,
  onSelectSlice,
}) => {
  const brightnessVal = 100 + windowSettings.brightness;
  const contrastVal = 100 + windowSettings.contrast;
  const invertVal = windowSettings.invert ? 100 : 0;
  const filterStyle = `brightness(${brightnessVal}%) contrast(${contrastVal}%) invert(${invertVal}%)`;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-2 bg-slate-950 rounded-2xl border border-slate-800">
      {slices.map((slice, index) => (
        <div
          key={slice.id}
          onClick={() => onSelectSlice(index)}
          className="group relative bg-slate-900 rounded-xl border border-slate-800 hover:border-cyan-500/50 p-2 cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col space-y-1.5"
        >
          {/* Slice Image */}
          <div className="relative overflow-hidden rounded-lg bg-black aspect-square flex items-center justify-center">
            <img
              src={slice.croppedDataUrl}
              alt={`Slice ${slice.globalIndex}`}
              className="w-full h-full object-contain dicom-canvas"
              style={{ filter: filterStyle }}
            />

            {/* Global Slice Badge */}
            <div className="absolute top-1.5 left-1.5 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-[9px] px-1.5 py-0.2 rounded">
              #{slice.globalIndex}
            </div>

            {/* Hover overlay button */}
            <div className="absolute inset-0 bg-cyan-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-cyan-500 text-slate-950 font-bold text-[10px] px-2 py-1 rounded-lg shadow-md flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>Focus Stack</span>
              </span>
            </div>
          </div>

          {/* Details footer */}
          <div className="text-[10px] font-mono leading-tight space-y-0.5">
            <div className="font-bold text-slate-200 truncate">{slice.sequenceName}</div>
            <div className="text-slate-400">Slice #{slice.sequenceIndex}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
