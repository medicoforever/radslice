export interface GeminiModelInfo {
  id: string;
  name: string;
  badge: string;
  description: string;
  recommended?: boolean;
}

export interface ApiKeyStatus {
  key: string;
  isValid: boolean;
  lastTested?: string;
}

export interface BoundingBox {
  ymin: number; // 0-1000 normalized
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface FilmSlice {
  id: string;
  globalIndex: number;
  sequenceIndex: number;
  sequenceName: string;
  boundingBox: BoundingBox;
  croppedDataUrl: string;
  width: number;
  height: number;
  anatomicalNote?: string;
  keyFinding?: string;
}

export interface SequenceGroup {
  id: string;
  name: string; // e.g. "T2 Axial", "FLAIR", "CT Bone Window"
  viewType: 'AXIAL' | 'SAGITTAL' | 'CORONAL' | 'LOCALIZER' | 'OTHER';
  slices: FilmSlice[];
  description?: string;
}

export interface WindowSettings {
  brightness: number; // -100 to +100 (default 0)
  contrast: number; // -100 to +100 (default 0)
  windowLevel: number; // 0 to 255 (default 128)
  windowWidth: number; // 1 to 255 (default 255)
  invert: boolean;
}

export interface WindowPreset {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  windowLevel: number;
  windowWidth: number;
  invert: boolean;
  description: string;
}

export interface ScaleCalibration {
  isCalibrated: boolean;
  knownPx: number;
  knownMm: number;
  ratioMmPerPx: number; // mm per pixel
}

export interface LineMeasurement {
  id: string;
  sliceId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distancePx: number;
  distanceMm: number;
  color: string;
  label?: string;
}

export interface AngleMeasurement {
  id: string;
  sliceId: string;
  x1: number; // Start
  y1: number;
  x2: number; // Vertex
  y2: number;
  x3: number; // End
  y3: number;
  angleDegrees: number;
  color: string;
}

export interface RoiMeasurement {
  id: string;
  sliceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  areaMm2: number;
  meanDensity: number;
  color: string;
}

export interface FilmAnalysisResult {
  title: string;
  modality: 'MRI' | 'CT' | 'XRAY' | 'ULTRASOUND' | 'UNKNOWN';
  bodyPart: string;
  patientHeaderInfo?: string;
  totalSubImagesDetected: number;
  sequences: SequenceGroup[];
  overallImpression: string;
  recommendations?: string;
  processingTimeMs: number;
  sourceImageUrl: string;
  sourceImageWidth: number;
  sourceImageHeight: number;
}

export type ActiveTool = 'SELECT' | 'MEASURE_LINE' | 'CALIBRATE' | 'MEASURE_ANGLE' | 'ROI_BOX';

export type DisplayMode = 'STACK' | 'GRID';
