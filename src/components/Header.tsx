import React from 'react';
import { ModelSelector } from './ModelSelector';
import { getApiKeys } from '../services/storageService';
import { Key, Play, Github, Info, Layers } from 'lucide-react';

interface HeaderProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onOpenApiKeyModal: () => void;
  onRunSampleDemo: () => void;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedModel,
  onSelectModel,
  onOpenApiKeyModal,
  onRunSampleDemo,
  onOpenOnboarding,
}) => {
  const keysCount = getApiKeys().length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-black text-xl">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-200 to-cyan-400">
                RadSlice AI
              </h1>
              <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Radiology Film Sheet Stack Splitter & Vision Intelligence
            </p>
          </div>
        </div>

        {/* Center / Right Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* 1-Click Demo Button */}
          <button
            onClick={onRunSampleDemo}
            className="bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-500/60 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center space-x-1.5"
            title="Load instant synthetic 3.0T Brain MRI Film Sheet Demo"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
            <span>Try Brain MRI Demo</span>
          </button>

          {/* Model Selector Dropdown */}
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
          />

          {/* API Key Manager Button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center space-x-2 shadow-sm ${
              keysCount > 0
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                : 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/60 animate-pulse'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Keys</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                keysCount > 0
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {keysCount}
            </span>
          </button>

          {/* Info / Onboarding Guide */}
          <button
            onClick={onOpenOnboarding}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors"
            title="View app guide & help"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/medicoforever/radslice"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors"
            title="View Source on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
