import { FILM_ANALYSIS_PROMPT } from '../constants';
import { FilmAnalysisResult, SequenceGroup, FilmSlice, BoundingBox } from '../types';
import { getApiKeys, getRandomApiKey } from './storageService';

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  const cleanKey = apiKey.trim();
  if (!cleanKey) return false;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`
    );
    return response.ok;
  } catch (e) {
    console.error('API key validation error:', e);
    return false;
  }
};

interface GeminiVisionSubImageRaw {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  sequenceName: string;
  viewType?: 'AXIAL' | 'SAGITTAL' | 'CORONAL' | 'LOCALIZER' | 'OTHER';
  sliceIndex?: number;
  anatomicalNote?: string;
  keyFinding?: string;
}

interface GeminiVisionRawResponse {
  title?: string;
  modality?: 'MRI' | 'CT' | 'XRAY' | 'ULTRASOUND' | 'UNKNOWN';
  bodyPart?: string;
  totalSubImagesDetected?: number;
  overallImpression?: string;
  recommendations?: string;
  subImages?: GeminiVisionSubImageRaw[];
}

export const analyzeFilmSheetWithGemini = async (
  imageDataUrl: string,
  selectedModel: string,
  onProgress?: (status: string) => void
): Promise<FilmAnalysisResult> => {
  const startTime = Date.now();
  const keys = getApiKeys();

  if (keys.length === 0) {
    throw new Error('NO_API_KEY: Please configure at least one Gemini API Key in the API Key Manager.');
  }

  if (onProgress) onProgress('Loading image resolution & preparing canvas payload...');

  // 1. Get Image Dimensions & HTMLImageElement
  const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image file into canvas.'));
    img.src = imageDataUrl;
  });

  const width = imageElement.width;
  const height = imageElement.height;

  // 2. Prepare Base64 data for Gemini
  const base64Data = imageDataUrl.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeType = imageDataUrl.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/jpeg';

  // 3. Make Gemini Vision Request with automatic failover key rotation
  let geminiResponseText = '';
  let lastError: any = null;
  const attemptedKeys = new Set<string>();

  if (onProgress) onProgress(`Connecting to Gemini (${selectedModel}) for vision grid detection...`);

  while (attemptedKeys.size < keys.length) {
    const apiKey = getRandomApiKey();
    if (!apiKey || attemptedKeys.has(apiKey)) continue;
    attemptedKeys.add(apiKey);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: FILM_ANALYSIS_PROMPT },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 429) {
          console.warn(`API key rate limited (429), trying next key... (${attemptedKeys.size}/${keys.length})`);
          continue;
        }
        throw new Error(`Gemini API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      geminiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (geminiResponseText) break; // Success!
    } catch (err: any) {
      console.error(`Gemini request error with key attempt ${attemptedKeys.size}:`, err);
      lastError = err;
    }
  }

  if (!geminiResponseText) {
    throw new Error(
      lastError?.message || 'Failed to receive vision response from Gemini. Please check your API key quota.'
    );
  }

  if (onProgress) onProgress('Parsing detected bounding boxes and cropping sub-images...');

  // 4. Parse JSON result
  let parsedJson: GeminiVisionRawResponse;
  try {
    // Strip codeblock backticks if present
    const cleanedJson = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    parsedJson = JSON.parse(cleanedJson);
  } catch (err) {
    console.error('Failed to parse JSON response from Gemini:', geminiResponseText);
    throw new Error('Gemini vision model returned an invalid JSON response structure.');
  }

  const rawSubImages = parsedJson.subImages || [];

  if (rawSubImages.length === 0) {
    // Fallback: If no sub-images returned, treat whole image as single frame
    rawSubImages.push({
      box_2d: [0, 0, 1000, 1000],
      sequenceName: 'Full Film View',
      viewType: 'AXIAL',
      sliceIndex: 1,
      anatomicalNote: 'Full uploaded film sheet',
    });
  }

  // 5. Crop Sub-Images using HTML5 Canvas
  const slices: FilmSlice[] = [];
  const sequenceMap = new Map<string, FilmSlice[]>();

  for (let i = 0; i < rawSubImages.length; i++) {
    const item = rawSubImages[i];
    const [ymin, xmin, ymax, xmax] = item.box_2d;

    // Convert 0-1000 normalized bounding box to pixel coordinates
    const cropX = Math.max(0, Math.round((xmin / 1000) * width));
    const cropY = Math.max(0, Math.round((ymin / 1000) * height));
    const cropW = Math.min(width - cropX, Math.round(((xmax - xmin) / 1000) * width));
    const cropH = Math.min(height - cropY, Math.round(((ymax - ymin) / 1000) * height));

    if (cropW <= 10 || cropH <= 10) continue; // Skip invalid tiny crops

    // Create Canvas for cropped slice
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = cropW;
    sliceCanvas.height = cropH;
    const ctx = sliceCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imageElement, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    }
    const croppedDataUrl = sliceCanvas.toDataURL('image/png');

    const seqName = item.sequenceName || 'Sequence 1';
    const viewType = item.viewType || 'AXIAL';

    const sliceObj: FilmSlice = {
      id: `slice-${i + 1}-${Date.now()}`,
      globalIndex: i + 1,
      sequenceIndex: item.sliceIndex || (sequenceMap.get(seqName)?.length || 0) + 1,
      sequenceName: seqName,
      boundingBox: { ymin, xmin, ymax, xmax },
      croppedDataUrl,
      width: cropW,
      height: cropH,
      anatomicalNote: item.anatomicalNote,
      keyFinding: item.keyFinding,
    };

    slices.push(sliceObj);

    if (!sequenceMap.has(seqName)) {
      sequenceMap.set(seqName, []);
    }
    sequenceMap.get(seqName)!.push(sliceObj);
  }

  // 6. Assemble Sequence Groups
  const sequenceGroups: SequenceGroup[] = [];
  let seqIdx = 1;

  sequenceMap.forEach((seqSlices, seqName) => {
    // Sort slices by sequenceIndex
    seqSlices.sort((a, b) => a.sequenceIndex - b.sequenceIndex);

    // Infer view type from sequence name or first slice
    const lowerName = seqName.toLowerCase();
    let viewType: 'AXIAL' | 'SAGITTAL' | 'CORONAL' | 'LOCALIZER' | 'OTHER' = 'AXIAL';
    if (lowerName.includes('sag') || lowerName.includes('sagittal')) viewType = 'SAGITTAL';
    else if (lowerName.includes('cor') || lowerName.includes('coronal')) viewType = 'CORONAL';
    else if (lowerName.includes('loc') || lowerName.includes('scout')) viewType = 'LOCALIZER';

    sequenceGroups.push({
      id: `seq-${seqIdx++}`,
      name: seqName,
      viewType,
      slices: seqSlices,
      description: `${seqSlices.length} slice frames extracted from film sheet`,
    });
  });

  const processingTimeMs = Date.now() - startTime;

  return {
    title: parsedJson.title || 'Radiology Film Sheet Study',
    modality: parsedJson.modality || 'MRI',
    bodyPart: parsedJson.bodyPart || 'Brain',
    totalSubImagesDetected: slices.length,
    sequences: sequenceGroups,
    overallImpression: parsedJson.overallImpression || 'Sub-images successfully extracted and grouped into DICOM stack sequences.',
    recommendations: parsedJson.recommendations,
    processingTimeMs,
    sourceImageUrl: imageDataUrl,
    sourceImageWidth: width,
    sourceImageHeight: height,
  };
};
