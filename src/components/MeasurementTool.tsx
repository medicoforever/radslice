import React, { useState } from 'react';
import { ActiveTool, ScaleCalibration, LineMeasurement, AngleMeasurement } from '../types';
import { Ruler, MousePointer, Scale, Compass, Square, Trash2, CheckCircle2 } from 'lucide-react';

interface MeasurementToolProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  scaleCalibration: ScaleCalibration;
  onUpdateCalibration: (knownPx: number, knownMm: number) => void;
  lineMeasurements: LineMeasurement[];
  onDeleteLineMeasurement: (id: string) => void;
  onClearAllMeasurements: () => void;
  currentSliceId: string;
}

export const MeasurementTool: React.FC<MeasurementToolProps> = ({
  activeTool,
  onSelectTool,
  scaleCalibration,
  onUpdateCalibration,
  lineMeasurements,
  onDeleteLineMeasurement,
  onClearAllMeasurements,
  currentSliceId,
}) => {
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [knownPxInput, setKnownPxInput] = useState(scaleCalibration.knownPx.toString());
  const [knownMmInput, setKnownMmInput] = useState(scaleCalibration.knownMm.toString());

  const handleSaveCalibration = () => {
    const px = parseFloat(knownPxInput);
    const mm = parseFloat(knownMmInput);
    if (!isNaN(px) && px > 0 && !isNaN(mm) && mm > 0) {
      onUpdateCalibration(px, mm);
      setShowCalibrationModal(false);
    }
  };

  const sliceLines = lineMeasurements.filter((m) => m.sliceId === currentSliceId);

  return (
    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-xl text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center space-x-2 font-extrabold text-slate-200">
          <Ruler className="w-4 h-4 text-cyan-400" />
          <span>Radiology Measurement & Calibration</span>
        </div>
        {scaleCalibration.isCalibrated ? (
          <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Calibrated (1px = {scaleCalibration.ratioMmPerPx.toFixed(3)}mm)</span>
          </span>
        ) : (
          <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
            Uncalibrated (Pixel scale)
          </span>
        )}
      </div>

      {/* Tool Selection Grid */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onSelectTool('SELECT')}
          className={`p-2.5 rounded-xl border flex items-center space-x-2 font-semibold transition-all ${
            activeTool === 'SELECT'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <MousePointer className="w-4 h-4" />
          <span>Pan / Navigate</span>
        </button>

        <button
          onClick={() => onSelectTool('MEASURE_LINE')}
          className={`p-2.5 rounded-xl border flex items-center space-x-2 font-semibold transition-all ${
            activeTool === 'MEASURE_LINE'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>Line Distance</span>
        </button>

        <button
          onClick={() => setShowCalibrationModal(true)}
          className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 flex items-center space-x-2 font-semibold transition-all"
        >
          <Scale className="w-4 h-4" />
          <span>Calibrate Scale</span>
        </button>

        <button
          onClick={() => onSelectTool('MEASURE_ANGLE')}
          className={`p-2.5 rounded-xl border flex items-center space-x-2 font-semibold transition-all ${
            activeTool === 'MEASURE_ANGLE'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Angle (Cobb)</span>
        </button>
      </div>

      {/* Active Line Measurements List for Current Slice */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
            Slice Measurements ({sliceLines.length})
          </span>
          {lineMeasurements.length > 0 && (
            <button
              onClick={onClearAllMeasurements}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {sliceLines.length === 0 ? (
          <div className="p-3 rounded-xl bg-slate-950/60 text-slate-500 text-[11px] text-center border border-dashed border-slate-800">
            Click & drag on the image slice to draw distance measurement lines.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {sliceLines.map((m, idx) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-300 font-bold">L{idx + 1}:</span>
                  <span className="text-cyan-300 font-bold">{m.distanceMm.toFixed(1)} mm</span>
                  <span className="text-slate-500 text-[10px]">({Math.round(m.distancePx)} px)</span>
                </div>
                <button
                  onClick={() => onDeleteLineMeasurement(m.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                  title="Delete measurement"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scale Calibration Modal */}
      {showCalibrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="text-sm font-extrabold text-slate-100 flex items-center space-x-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Calibrate DICOM Scale Bar</span>
            </h4>
            <p className="text-xs text-slate-400">
              Enter the known pixel length and real-world millimeter distance (e.g. 100 pixels = 20 mm scale ruler on film sheet).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400">
                  Known Canvas Pixels (px)
                </label>
                <input
                  type="number"
                  value={knownPxInput}
                  onChange={(e) => setKnownPxInput(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400">
                  Real-World Distance (mm)
                </label>
                <input
                  type="number"
                  value={knownMmInput}
                  onChange={(e) => setKnownMmInput(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCalibrationModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCalibration}
                className="flex-1 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-md"
              >
                Save Scale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
