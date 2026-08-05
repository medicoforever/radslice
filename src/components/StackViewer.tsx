import React, { useRef, useEffect, useState } from 'react';
import { FilmSlice, WindowSettings, ActiveTool, LineMeasurement, ScaleCalibration } from '../types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface StackViewerProps {
  slices: FilmSlice[];
  currentSliceIndex: number;
  onSliceChange: (index: number) => void;
  windowSettings: WindowSettings;
  activeTool: ActiveTool;
  scaleCalibration: ScaleCalibration;
  lineMeasurements: LineMeasurement[];
  onAddLineMeasurement: (line: LineMeasurement) => void;
  onDeleteLineMeasurement: (id: string) => void;
  patientHeaderInfo?: string;
  sequenceName: string;
}

export const StackViewer: React.FC<StackViewerProps> = ({
  slices,
  currentSliceIndex,
  onSliceChange,
  windowSettings,
  activeTool,
  scaleCalibration,
  lineMeasurements,
  onAddLineMeasurement,
  onDeleteLineMeasurement,
  patientHeaderInfo,
  sequenceName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  const currentSlice = slices[currentSliceIndex] || slices[0];

  // 1. Mouse Wheel Scroll Listener for Stack Stepping
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (slices.length <= 1) return;
    if (e.deltaY > 0) {
      // Scroll Down -> Next Slice
      if (currentSliceIndex < slices.length - 1) {
        onSliceChange(currentSliceIndex + 1);
      }
    } else if (e.deltaY < 0) {
      // Scroll Up -> Previous Slice
      if (currentSliceIndex > 0) {
        onSliceChange(currentSliceIndex - 1);
      }
    }
  };

  // 2. Render Image Canvas with Windowing & Measurements
  useEffect(() => {
    if (!currentSlice || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = currentSlice.croppedDataUrl;
    img.onload = () => {
      canvas.width = currentSlice.width;
      canvas.height = currentSlice.height;

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply CSS Filters for Brightness, Contrast, Invert, WL/WW
      // Map windowLevel/Width to CSS contrast & brightness
      const brightnessVal = 100 + windowSettings.brightness + (windowSettings.windowLevel - 128) * 0.4;
      const contrastVal = 100 + windowSettings.contrast + (255 - windowSettings.windowWidth) * 0.5;
      const invertVal = windowSettings.invert ? 100 : 0;

      ctx.filter = `brightness(${brightnessVal}%) contrast(${contrastVal}%) invert(${invertVal}%)`;

      // Draw slice image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Reset filter for measurement layer drawing
      ctx.filter = 'none';

      // Draw saved line measurements for this slice
      const sliceLines = lineMeasurements.filter((m) => m.sliceId === currentSlice.id);
      sliceLines.forEach((line, idx) => {
        ctx.strokeStyle = line.color || '#00e5ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();

        // Draw start/end handles
        ctx.fillStyle = line.color || '#00e5ff';
        ctx.beginPath();
        ctx.arc(line.x1, line.y1, 4, 0, Math.PI * 2);
        ctx.arc(line.x2, line.y2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Text label
        const midX = (line.x1 + line.x2) / 2;
        const midY = (line.y1 + line.y2) / 2;

        ctx.fillStyle = '#090d16';
        ctx.fillRect(midX - 30, midY - 14, 60, 18);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(midX - 30, midY - 14, 60, 18);

        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${line.distanceMm.toFixed(1)} mm`, midX, midY);
      });

      // Draw active dragging measurement line
      if (isDrawing && drawStart && drawCurrent) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(drawStart.x, drawStart.y);
        ctx.lineTo(drawCurrent.x, drawCurrent.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const dx = drawCurrent.x - drawStart.x;
        const dy = drawCurrent.y - drawStart.y;
        const distPx = Math.sqrt(dx * dx + dy * dy);
        const distMm = distPx * scaleCalibration.ratioMmPerPx;

        const midX = (drawStart.x + drawCurrent.x) / 2;
        const midY = (drawStart.y + drawCurrent.y) / 2;

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${distMm.toFixed(1)} mm`, midX, midY - 6);
      }
    };
  }, [currentSlice, windowSettings, lineMeasurements, isDrawing, drawStart, drawCurrent, scaleCalibration]);

  // Handle Canvas Mouse Events for Measurement Tool
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'MEASURE_LINE' || !currentSlice) return;
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setDrawStart(coords);
    setDrawCurrent(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setDrawCurrent(getCanvasCoords(e));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart || !drawCurrent || !currentSlice) return;
    const coords = getCanvasCoords(e);
    const dx = coords.x - drawStart.x;
    const dy = coords.y - drawStart.y;
    const distPx = Math.sqrt(dx * dx + dy * dy);

    if (distPx > 5) {
      const distMm = distPx * scaleCalibration.ratioMmPerPx;
      const newLine: LineMeasurement = {
        id: `meas-${Date.now()}`,
        sliceId: currentSlice.id,
        x1: drawStart.x,
        y1: drawStart.y,
        x2: coords.x,
        y2: coords.y,
        distancePx: distPx,
        distanceMm: distMm,
        color: '#00e5ff',
      };
      onAddLineMeasurement(newLine);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  };

  if (!currentSlice) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono">
        No slice images extracted.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* DICOM Stack Display Canvas Window */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        className="relative bg-dicom-grid bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center min-h-[440px] max-h-[600px] select-none shadow-2xl group"
      >
        {/* HUD Top Left - Patient Info */}
        <div className="absolute top-3 left-3 z-10 font-mono text-[11px] text-cyan-300 pointer-events-none hud-glow bg-slate-950/70 p-2 rounded-xl border border-slate-800/80 backdrop-blur-sm">
          <div className="font-bold">{patientHeaderInfo || 'RADSLICE DICOM VIEWER'}</div>
          <div className="text-slate-400 text-[10px]">{sequenceName}</div>
        </div>

        {/* HUD Top Right - Slice Counter */}
        <div className="absolute top-3 right-3 z-10 font-mono text-xs font-bold text-cyan-400 pointer-events-none bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-xl shadow-lg backdrop-blur-sm">
          Slice {currentSliceIndex + 1} / {slices.length}
        </div>

        {/* HUD Bottom Left - WL/WW Status */}
        <div className="absolute bottom-3 left-3 z-10 font-mono text-[10px] text-slate-400 pointer-events-none bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 backdrop-blur-sm">
          WL: {windowSettings.windowLevel} | WW: {windowSettings.windowWidth} | Scale: {scaleCalibration.ratioMmPerPx.toFixed(2)} mm/px
        </div>

        {/* HUD Bottom Right - Mouse Scroll Guide */}
        <div className="absolute bottom-3 right-3 z-10 text-[10px] font-mono text-slate-400 pointer-events-none bg-slate-950/70 px-2 py-1 rounded-lg border border-slate-800 hidden sm:block">
          🖱️ Scroll Wheel to Step Slices
        </div>

        {/* Main Canvas Element */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`dicom-canvas max-w-full max-h-[520px] object-contain transition-transform ${
            activeTool === 'MEASURE_LINE' ? 'cursor-crosshair' : 'cursor-grab'
          }`}
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        />
      </div>

      {/* Stack Navigation & Zoom Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 gap-3">
        {/* Step Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onSliceChange(Math.max(0, currentSliceIndex - 1))}
            disabled={currentSliceIndex === 0}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-30 border border-slate-800 transition-colors"
            title="Previous Slice (Scroll Up)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSliceChange(Math.min(slices.length - 1, currentSliceIndex + 1))}
            disabled={currentSliceIndex === slices.length - 1}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-30 border border-slate-800 transition-colors"
            title="Next Slice (Scroll Down)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Slice Step Slider */}
        <div className="flex-1 flex items-center space-x-3">
          <input
            type="range"
            min={0}
            max={slices.length - 1}
            value={currentSliceIndex}
            onChange={(e) => onSliceChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="font-mono text-xs text-cyan-300 font-bold w-12 text-center">
            {currentSliceIndex + 1}/{slices.length}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(3.0, z + 0.2))}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1.0);
              setPan({ x: 0, y: 0 });
            }}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slice Findings Note */}
      {currentSlice.anatomicalNote && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
          <span className="font-mono font-bold text-cyan-400">AI Note:</span>
          <span>{currentSlice.anatomicalNote}</span>
          {currentSlice.keyFinding && (
            <span className="text-amber-300 font-medium">({currentSlice.keyFinding})</span>
          )}
        </div>
      )}
    </div>
  );
};
