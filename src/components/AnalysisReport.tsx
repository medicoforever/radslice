import React, { useState } from 'react';
import { FilmAnalysisResult } from '../types';
import { exportPatientFilmPackageZip } from '../services/zipExportService';
import { FileText, Download, Printer, Layers, Sparkles, Package, Smartphone } from 'lucide-react';

interface AnalysisReportProps {
  result: FilmAnalysisResult;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ result }) => {
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      await exportPatientFilmPackageZip(result);
    } catch (err) {
      console.error('ZIP export error:', err);
    } finally {
      setDownloadingZip(false);
    }
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
        <div className="flex items-center flex-wrap gap-2">
          {/* Download Mobile HTML ZIP Button */}
          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg transition-all"
            title="Download ZIP package containing standalone HTML viewers for mobile & offline viewing"
          >
            <Package className="w-4 h-4" />
            <Smartphone className="w-4 h-4" />
            <span>{downloadingZip ? 'Packaging ZIP...' : 'Download Mobile HTML ZIP'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Mobile ZIP Package Highlight Banner */}
      <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-cyan-300">Offline Mobile Viewers in ZIP Package</h4>
            <p className="text-slate-400 text-[11px]">
              Extracting the ZIP package gives you separate <strong className="text-slate-200">.html</strong> files for each category (T1, T2, FLAIR...). Anyone can open them on any smartphone or tablet browser to scroll through slices offline!
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadZip}
          disabled={downloadingZip}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs whitespace-nowrap shadow-md"
        >
          Get ZIP
        </button>
      </div>

      {/* Grid Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-500">Sub-Images Detected</div>
          <div className="text-lg font-black text-cyan-300 mt-0.5">{result.totalSubImagesDetected} Tiles</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-500">Sequence Categories</div>
          <div className="text-lg font-black text-slate-100 mt-0.5">{result.sequences.length} Series</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-500">Files Uploaded</div>
          <div className="text-lg font-black text-emerald-400 mt-0.5">
            {result.uploadedFilesCount || 1} Film Sheet(s)
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-[10px] uppercase font-mono text-slate-500">Touch Swipe Mode</div>
          <div className="text-lg font-black text-cyan-400 mt-0.5">Enabled 📱</div>
        </div>
      </div>

      {/* Sequences Breakdown Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase font-mono text-slate-400 tracking-wider">
          Categorized Sequence Viewers
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
      </div>
    </div>
  );
};
