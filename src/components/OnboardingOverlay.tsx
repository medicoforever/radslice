import React from 'react';
import { Layers, MousePointer, Key, Ruler, Sparkles, CheckCircle2 } from 'lucide-react';

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onRunDemo: () => void;
  onOpenApiKeyModal: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  isOpen,
  onClose,
  onRunDemo,
  onOpenApiKeyModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-lg font-bold p-1 rounded-lg hover:bg-slate-800"
        >
          ✕
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100">Welcome to RadSlice AI</h2>
            <p className="text-xs text-slate-400">
              Radiology Film Sheet Stack Splitter, DICOM Viewer & Measurement Tool
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-300 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Gemini 3.6 / 3.5 Vision</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Auto-detects sub-image bounding boxes on MRI/CT film sheets and groups them into DICOM sequences.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-300 flex items-center space-x-1.5">
              <MousePointer className="w-4 h-4 text-cyan-400" />
              <span>PACS Stack Wheel Scroll</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Scroll mouse wheel or drag slider to smoothly step through slices like a real DICOM viewer.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-300 flex items-center space-x-1.5">
              <Ruler className="w-4 h-4 text-cyan-400" />
              <span>Distance & Scale Calibration</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Measure distances directly on slices with scale calibration (pixels $\rightarrow$ mm/cm accuracy).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-cyan-300 flex items-center space-x-1.5">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Multi-Key Load Balancing</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Save multiple free Gemini keys for automatic round-robin rotation and failover.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onRunDemo();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg text-center"
          >
            🚀 Try Brain MRI Demo (No Key Needed)
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenApiKeyModal();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 font-bold text-xs transition-all text-center"
          >
            🔑 Configure Gemini API Keys
          </button>
        </div>
      </div>
    </div>
  );
};
