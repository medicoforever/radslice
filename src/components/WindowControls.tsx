import React from 'react';
import { WindowSettings } from '../types';
import { WINDOW_PRESETS } from '../constants';
import { Sun, Contrast, Sliders, RotateCcw, Eye, Sparkles } from 'lucide-react';

interface WindowControlsProps {
  settings: WindowSettings;
  onChangeSettings: (newSettings: WindowSettings) => void;
  onReset: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  settings,
  onChangeSettings,
  onReset,
}) => {
  const handlePresetSelect = (presetId: string) => {
    const preset = WINDOW_PRESETS.find(p => p.id === presetId);
    if (preset) {
      onChangeSettings({
        brightness: preset.brightness,
        contrast: preset.contrast,
        windowLevel: preset.windowLevel,
        windowWidth: preset.windowWidth,
        invert: preset.invert,
      });
    }
  };

  return (
    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-xl text-xs">
      {/* Header & Reset */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center space-x-2 font-extrabold text-slate-200">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>DICOM Windowing (WL / WW) & Contrast</span>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center space-x-1 font-semibold transition-colors"
          title="Reset to default window settings"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Preset Quick Buttons */}
      <div className="space-y-1.5">
        <label className="block text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
          Windowing Presets
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {WINDOW_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 font-semibold text-[11px] transition-all text-center truncate"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3 pt-1">
        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-slate-400 flex items-center space-x-1">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Brightness</span>
            </span>
            <span className="text-cyan-300 font-bold">{settings.brightness > 0 ? `+${settings.brightness}` : settings.brightness}%</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.brightness}
            onChange={(e) => onChangeSettings({ ...settings, brightness: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-slate-400 flex items-center space-x-1">
              <Contrast className="w-3 h-3 text-cyan-400" />
              <span>Contrast</span>
            </span>
            <span className="text-cyan-300 font-bold">{settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}%</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.contrast}
            onChange={(e) => onChangeSettings({ ...settings, contrast: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Window Level (WL) */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-slate-400">Window Level (WL)</span>
            <span className="text-cyan-300 font-bold">{settings.windowLevel}</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            value={settings.windowLevel}
            onChange={(e) => onChangeSettings({ ...settings, windowLevel: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Window Width (WW) */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-slate-400">Window Width (WW)</span>
            <span className="text-cyan-300 font-bold">{settings.windowWidth}</span>
          </div>
          <input
            type="range"
            min="1"
            max="255"
            value={settings.windowWidth}
            onChange={(e) => onChangeSettings({ ...settings, windowWidth: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Invert Color Toggle */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Invert Colors (Negative)</span>
        </span>
        <button
          onClick={() => onChangeSettings({ ...settings, invert: !settings.invert })}
          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
            settings.invert ? 'bg-cyan-500' : 'bg-slate-800'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
              settings.invert ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
