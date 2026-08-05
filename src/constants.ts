import { GeminiModelInfo, WindowPreset } from './types';

export const GEMINI_MODELS: GeminiModelInfo[] = [
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    badge: '3.6 Fast Vision',
    description: 'Latest high-speed vision model optimized for dense image bounding box detection & medical film segmentation.',
    recommended: true,
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: '3.5 Vision',
    description: 'High efficiency vision model for instant image breakdown and sequence tagging.',
  },
  {
    id: 'gemini-3.0-flash',
    name: 'Gemini 3.0 Flash',
    badge: '3.0 Flash',
    description: 'Fast multimodal model with robust spatial vision understanding.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: '2.5 Standard',
    description: 'Reliable flash model for sub-image grid extraction.',
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    badge: 'Ultra Fast',
    description: 'Lightweight model for maximum speed and minimal token latency.',
  },
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro',
    badge: '3.0 Pro',
    description: 'Deep reasoning multimodal model for complex clinical image interpretation.',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    badge: '2.5 Pro',
    description: 'Advanced vision model for high-precision diagnostic insights.',
  },
];

export const DEFAULT_MODEL_ID = 'gemini-3.6-flash';

export const WINDOW_PRESETS: WindowPreset[] = [
  {
    id: 'default',
    name: 'Standard DICOM',
    brightness: 0,
    contrast: 0,
    windowLevel: 128,
    windowWidth: 255,
    invert: false,
    description: 'Original image appearance without modified windowing.',
  },
  {
    id: 'brain',
    name: 'Brain Window',
    brightness: 15,
    contrast: 35,
    windowLevel: 140,
    windowWidth: 160,
    invert: false,
    description: 'Optimized for gray/white matter differentiation (WL 40 / WW 80 equivalent).',
  },
  {
    id: 'bone',
    name: 'Bone Window',
    brightness: -20,
    contrast: 65,
    windowLevel: 190,
    windowWidth: 100,
    invert: false,
    description: 'High contrast for cortical bone trabeculae and fracture inspection.',
  },
  {
    id: 'lung',
    name: 'Lung / High Contrast',
    brightness: 25,
    contrast: 50,
    windowLevel: 100,
    windowWidth: 220,
    invert: false,
    description: 'Enhances subtle parenchymal densities and micro-nodules.',
  },
  {
    id: 'soft_tissue',
    name: 'Soft Tissue',
    brightness: 10,
    contrast: 20,
    windowLevel: 130,
    windowWidth: 200,
    invert: false,
    description: 'Balanced contrast for musculature, visceral organs, and fat planes.',
  },
  {
    id: 'invert',
    name: 'Inverted Negative',
    brightness: 0,
    contrast: 25,
    windowLevel: 128,
    windowWidth: 255,
    invert: true,
    description: 'Black-on-white inverted view for high detail edge detection.',
  },
];

export const FILM_ANALYSIS_PROMPT = `You are RadSlice AI, an expert radiologist vision assistant specializing in medical film sheet (CT film, MRI film sheet, X-ray matrix) sub-image decomposition and sequence grouping.

You are analyzing an uploaded image containing a radiology film sheet with multiple sub-images/tiles arranged in a grid or series layout (e.g. Brain MRI, Spine MRI, CT chest/abdomen).

YOUR TASKS:
1. Identify the Modality (MRI, CT, XRAY, or ULTRASOUND) and Body Part (Brain, Spine, Chest, Abdomen, Knee, etc.).
2. Locate EVERY individual sub-image / slice tile on the film sheet.
3. For EVERY detected sub-image tile, return its EXACT bounding box in normalized 0-1000 scale: [ymin, xmin, ymax, xmax] where:
   - ymin: top boundary (0 = top of image, 1000 = bottom of image)
   - xmin: left boundary (0 = left of image, 1000 = right of image)
   - ymax: bottom boundary
   - xmax: right boundary
4. Group each sub-image into its respective radiology sequence series:
   - e.g. "T2 Axial", "T1 Axial", "FLAIR Axial", "T1 Post-Contrast", "Sagittal T2", "Coronal T2", "CT Soft Tissue", "CT Bone Window", "Localizer / Scout", or "Other".
5. Assign a relative slice number (1, 2, 3...) in anatomical order (inferior to superior or anterior to posterior) within each sequence.
6. Provide a short clinical impression / finding for the overall study.

CRITICAL INSTRUCTIONS FOR BOUNDING BOX ACCURACY:
- Ensure bounding boxes accurately enclose ONLY the sub-image tile (excluding surrounding film sheet text/borders if possible, but keeping the full anatomical slice frame intact).
- Do not skip any tiles on the film sheet. If there are 12 tiles, return 12 bounding box objects.
- Return strictly valid JSON following the schema below.

JSON OUTPUT SCHEMA:
{
  "title": "Study Title (e.g. Brain MRI Film Sheet)",
  "modality": "MRI",
  "bodyPart": "Brain",
  "totalSubImagesDetected": 12,
  "overallImpression": "Concise summary of findings across the film sheet...",
  "recommendations": "Any follow-up recommendations...",
  "subImages": [
    {
      "box_2d": [ymin, xmin, ymax, xmax],
      "sequenceName": "T2 Axial",
      "viewType": "AXIAL",
      "sliceIndex": 1,
      "anatomicalNote": "Inferior level showing cerebellum and brainstem",
      "keyFinding": "Normal cerebellar hemispheres, 4th ventricle patent"
    }
  ]
}
`;
