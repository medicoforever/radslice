import React, { useState } from 'react';
import {
  FilmAnalysisResult,
  WindowSettings,
  ActiveTool,
  ScaleCalibration,
  LineMeasurement,
  DisplayMode,
} from '../types';
import { SequenceTabs } from './SequenceTabs';
import { StackViewer } from './StackViewer';
import { GridViewer } from './GridViewer';
import { WindowControls } from './WindowControls';
import { MeasurementTool } from './MeasurementTool';
import { AnalysisReport } from './AnalysisReport';
import { WINDOW_PRESETS } from '../constants';
import { RotateCcw, FileText, Image as ImageIcon } from 'lucide-react';

interface ViewerContainerProps {
  analysisResult: FilmAnalysisResult;
  selectedModel: string;
  onResetUpload: () => void;
}

export const ViewerContainer: React.FC<ViewerContainerProps> = ({
  analysisResult,
  selectedModel,
  onResetUpload,
}) => {
  const [selectedSeqId, setSelectedSeqId] = useState<string | 'ALL'>('ALL');
  const [currentSliceIndex, setCurrentSliceIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('STACK');
  const [activeTool, setActiveTool] = useState<ActiveTool>('SELECT');

  // Windowing Settings
  const [windowSettings, setWindowSettings] = useState<WindowSettings>({
    brightness: 0,
    contrast: 0,
    windowLevel: 128,
    windowWidth: 255,
    invert: false,
  });

  // Scale Calibration (default 1 px = 0.25 mm)
  const [scaleCalibration, setScaleCalibration] = useState<ScaleCalibration>({
    isCalibrated: false,
    knownPx: 100,
    knownMm: 25,
    ratioMmPerPx: 0.25,
  });

  // Line Measurements List
  const [lineMeasurements, setLineMeasurements] = useState<LineMeasurement[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);

  // Filter Slices by Selected Sequence
  const activeSequence = analysisResult.sequences.find((s) => s.id === selectedSeqId);

  const activeSlices = activeSequence
    ? activeSequence.slices
    : analysisResult.sequences.flatMap((s) => s.slices);

  const handleUpdateCalibration = (knownPx: number, knownMm: number) => {
    const ratio = knownMm / knownPx;
    setScaleCalibration({
      isCalibrated: true,
      knownPx,
      knownMm,
      ratioMmPerPx: ratio,
    });
  };

  const handleAddLineMeasurement = (line: LineMeasurement) => {
    setLineMeasurements((prev) => [...prev, line]);
  };

  const handleDeleteLineMeasurement = (id: string) => {
    setLineMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearAllMeasurements = () => {
    setLineMeasurements([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 animate-fade-in">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={onResetUpload}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="Upload another film sheet"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Film Sheet</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="text-xs font-mono">
            <span className="text-slate-400">Study: </span>
            <span className="font-bold text-cyan-300">{analysisResult.title}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowReportModal(!showReportModal)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md ${
              showReportModal
                ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20'
                : 'bg-slate-950 text-cyan-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>AI Radiology Report</span>
          </button>
        </div>
      </div>

      {/* Report Modal or Inline Toggle */}
      {showReportModal && <AnalysisReport result={analysisResult} />}

      {/* Sequence Tabs */}
      <SequenceTabs
        sequences={analysisResult.sequences}
        selectedSeqId={selectedSeqId}
        onSelectSeq={(seqId) => {
          setSelectedSeqId(seqId);
          setCurrentSliceIndex(0);
        }}
        displayMode={displayMode}
        onToggleDisplayMode={setDisplayMode}
        totalSliceCount={analysisResult.totalSubImagesDetected}
      />

      {/* Main DICOM Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left 3 Columns: Viewer Area */}
        <div className="lg:col-span-3">
          {displayMode === 'STACK' ? (
            <StackViewer
              slices={activeSlices}
              currentSliceIndex={currentSliceIndex}
              onSliceChange={setCurrentSliceIndex}
              windowSettings={windowSettings}
              activeTool={activeTool}
              scaleCalibration={scaleCalibration}
              lineMeasurements={lineMeasurements}
              onAddLineMeasurement={handleAddLineMeasurement}
              onDeleteLineMeasurement={handleDeleteLineMeasurement}
              patientHeaderInfo={analysisResult.patientHeaderInfo}
              sequenceName={
                activeSequence ? activeSequence.name : `All Series (${activeSlices.length} Slices)`
              }
            />
          ) : (
            <GridViewer
              slices={activeSlices}
              windowSettings={windowSettings}
              onSelectSlice={(idx) => {
                setCurrentSliceIndex(idx);
                setDisplayMode('STACK');
              }}
            />
          )}
        </div>

        {/* Right 1 Column: Controls Panel */}
        <div className="space-y-4">
          {/* DICOM Windowing WL/WW Controls */}
          <WindowControls
            settings={windowSettings}
            onChangeSettings={setWindowSettings}
            onReset={() =>
              setWindowSettings({
                brightness: 0,
                contrast: 0,
                windowLevel: 128,
                windowWidth: 255,
                invert: false,
              })
            }
          />

          {/* Measurement & Scale Calibration Tool */}
          <MeasurementTool
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            scaleCalibration={scaleCalibration}
            onUpdateCalibration={handleUpdateCalibration}
            lineMeasurements={lineMeasurements}
            onDeleteLineMeasurement={handleDeleteLineMeasurement}
            onClearAllMeasurements={handleClearAllMeasurements}
            currentSliceId={activeSlices[currentSliceIndex]?.id || ''}
          />
        </div>
      </div>
    </div>
  );
};
