import { GeminiModelInfo } from './types';

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
];

export const DEFAULT_MODEL_ID = 'gemini-3.6-flash';

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
4. Classify each sub-image into a standard radiology sequence category:
   - Use standardized clear sequence names such as "T2 Axial", "T1 Axial", "FLAIR Axial", "T1 Post-Contrast", "Sagittal T2", "Coronal T2", "CT Soft Tissue", "CT Bone Window", "Localizer / Scout", or "Other".
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
