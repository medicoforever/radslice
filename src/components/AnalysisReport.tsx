import React from 'react';
import { FilmAnalysisResult } from '../types';
import { FileText, Download, Printer, Layers, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

interface AnalysisReportProps {
  result: FilmAnalysisResult;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ result }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `RadSlice_Analysis_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
              <span>{result.title}</span>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                {result.modality}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Body Part: <strong className="text-slate-200">{result.bodyPart}</strong> | Processed in{' '}
              <span className="text-cyan-300 font-bold">{result.processingTimeMs} ms</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadJson}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Grid Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-500">Sub-Images Detected</div>
          <div className="text-lg font-black text-cyan-300 mt-0.5">{result.totalSubImagesDetected} Tiles</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-500">Sequences Grouped</div>
          <div className="text-lg font-black text-slate-100 mt-0.5">{result.sequences.length} Series</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-500">Resolution</div>
          <div className="text-lg font-black text-emerald-400 mt-0.5">
            {result.sourceImageWidth} × {result.sourceImageHeight}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-500">Vision Precision</div>
          <div className="text-lg font-black text-cyan-400 mt-0.5">0-1000 Box 2D</div>
        </div>
      </div>

      {/* Sequences Breakdown Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase font-mono text-slate-400 tracking-wider">
          Detected Sequence Breakdown
        </h4>
        <div className="space-y-2">
          {result.sequences.map((seq) => (
            <div
              key={seq.id}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">{seq.name}</div>
                  <div className="text-[10px] text-slate-500">{seq.description}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-xl text-xs font-bold">
                  {seq.slices.length} Slices ({seq.viewType})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Overall Impression */}
      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2 text-xs">
        <div className="flex items-center space-x-2 text-cyan-300 font-extrabold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Gemini Vision Impression & Technical Summary</span>
        </div>
        <p className="text-slate-300 leading-relaxed">{result.overallImpression}</p>
        {result.recommendations && (
          <div className="pt-2 border-t border-cyan-500/20 text-slate-400 font-mono text-[11px]">
            <strong className="text-cyan-300">Recommendations:</strong> {result.recommendations}
          </div>
        )}
      </div>
    </div>
  );
};
