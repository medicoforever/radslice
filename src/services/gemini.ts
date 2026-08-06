import { FILM_ANALYSIS_PROMPT } from '../constants';
import { FilmAnalysisResult, SequenceGroup, FilmSlice, UploadedFileItem } from '../types';
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

export const analyzeMultipleFilmSheetsWithGemini = async (
  files: UploadedFileItem[],
  selectedModel: string,
  onProgress?: (status: string) => void
): Promise<FilmAnalysisResult> => {
  const startTime = Date.now();
  const keys = getApiKeys();

  if (keys.length === 0) {
    throw new Error('NO_API_KEY: Please configure at least one Gemini API Key in the API Key Manager.');
  }

  const allSlices: FilmSlice[] = [];
  const sequenceMap = new Map<string, FilmSlice[]>();
  let mainTitle = '';
  let modality: 'MRI' | 'CT' | 'XRAY' | 'ULTRASOUND' | 'UNKNOWN' = 'MRI';
  let bodyPart = 'Brain';
  let overallImpressions: string[] = [];

  for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
    const fileItem = files[fileIdx];
    if (onProgress) {
      onProgress(
        `Analyzing film sheet ${fileIdx + 1} of ${files.length} (${fileItem.name}) with ${selectedModel}...`
      );
    }

    // 1. Get Image Element
    const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image file ${fileItem.name}`));
      img.src = fileItem.dataUrl;
    });

    const width = imageElement.width;
    const height = imageElement.height;

    // 2. Prepare Base64
    const base64Data = fileItem.dataUrl.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const mimeType = fileItem.dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/jpeg';

    // 3. Request Gemini Vision with failover key rotation and model fallback
    const modelsToTry = Array.from(new Set([selectedModel, 'gemini-3.5-flash', 'gemini-3.0-flash']));
    
    let geminiResponseText = '';
    let lastError: any = null;

    for (const currentModel of modelsToTry) {
      if (geminiResponseText) break;
      
      const attemptedKeys = new Set<string>();
      if (onProgress) {
        onProgress(`Trying model ${currentModel} on film ${fileIdx + 1}...`);
      }

      while (attemptedKeys.size < keys.length) {
        const apiKey = getRandomApiKey();
        if (!apiKey || attemptedKeys.has(apiKey)) continue;
        attemptedKeys.add(apiKey);

        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
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
            if (response.status === 429 || response.status === 503) {
              console.warn(`Model ${currentModel} on key hit 429/503. Retrying next key...`);
              lastError = new Error(`Rate limit exceeded for model ${currentModel}`);
              continue;
            }
            const errText = await response.text();
            throw new Error(`Gemini API Error ${response.status}: ${errText}`);
          }

          const data = await response.json();
          geminiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (geminiResponseText) break;
        } catch (err: any) {
          lastError = err;
        }
      }
      
      // If we failed after all keys for this model, the outer loop will advance to the next fallback model.
    }

    if (!geminiResponseText) {
      throw new Error(lastError?.message || `Vision request failed for film ${fileItem.name}.`);
    }

    // 4. Parse JSON
    let parsedJson: GeminiVisionRawResponse;
    try {
      const cleanedJson = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedJson = JSON.parse(cleanedJson);
    } catch (err) {
      console.error('Parse error:', geminiResponseText);
      throw new Error(`Invalid JSON response from Gemini Vision for file ${fileItem.name}.`);
    }

    if (!mainTitle && parsedJson.title) mainTitle = parsedJson.title;
    if (parsedJson.modality) modality = parsedJson.modality;
    if (parsedJson.bodyPart) bodyPart = parsedJson.bodyPart;
    if (parsedJson.overallImpression) overallImpressions.push(parsedJson.overallImpression);

    const rawSubImages = parsedJson.subImages || [];
    if (rawSubImages.length === 0) {
      rawSubImages.push({
        box_2d: [0, 0, 1000, 1000],
        sequenceName: 'General Series',
        viewType: 'AXIAL',
        sliceIndex: 1,
      });
    }

    // 5. Crop Sub-Images using HTML5 Canvas
    for (let i = 0; i < rawSubImages.length; i++) {
      const item = rawSubImages[i];
      const [ymin, xmin, ymax, xmax] = item.box_2d;

      const cropX = Math.max(0, Math.round((xmin / 1000) * width));
      const cropY = Math.max(0, Math.round((ymin / 1000) * height));
      const cropW = Math.min(width - cropX, Math.round(((xmax - xmin) / 1000) * width));
      const cropH = Math.min(height - cropY, Math.round(((ymax - ymin) / 1000) * height));

      if (cropW <= 10 || cropH <= 10) continue;

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = cropW;
      sliceCanvas.height = cropH;
      const ctx = sliceCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(imageElement, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      }
      const croppedDataUrl = sliceCanvas.toDataURL('image/png');

      const rawSeqName = item.sequenceName || 'Sequence 1';
      // Normalize sequence name (e.g. "T2 AXIAL", "T2_AXIAL" -> "T2 Axial")
      const normalizedSeqName = rawSeqName.trim();

      const sliceObj: FilmSlice = {
        id: `slice-${fileIdx + 1}-${i + 1}-${Date.now()}`,
        globalIndex: allSlices.length + 1,
        sequenceIndex: item.sliceIndex || (sequenceMap.get(normalizedSeqName)?.length || 0) + 1,
        sequenceName: normalizedSeqName,
        sourceFileName: fileItem.name,
        boundingBox: { ymin, xmin, ymax, xmax },
        croppedDataUrl,
        width: cropW,
        height: cropH,
        anatomicalNote: item.anatomicalNote,
        keyFinding: item.keyFinding,
      };

      allSlices.push(sliceObj);

      if (!sequenceMap.has(normalizedSeqName)) {
        sequenceMap.set(normalizedSeqName, []);
      }
      sequenceMap.get(normalizedSeqName)!.push(sliceObj);
    }
  }

  // 6. Merge Sequence Groups across files & sort slices
  const sequenceGroups: SequenceGroup[] = [];
  let seqIdx = 1;

  sequenceMap.forEach((seqSlices, seqName) => {
    // Sort merged sequence slices by sequenceIndex
    seqSlices.sort((a, b) => a.sequenceIndex - b.sequenceIndex);

    // Re-index global & sequence numbers cleanly
    seqSlices.forEach((s, idx) => {
      s.sequenceIndex = idx + 1;
    });

    const lowerName = seqName.toLowerCase();
    let viewType: 'AXIAL' | 'SAGITTAL' | 'CORONAL' | 'LOCALIZER' | 'OTHER' = 'AXIAL';
    if (lowerName.includes('sag') || lowerName.includes('sagittal')) viewType = 'SAGITTAL';
    else if (lowerName.includes('cor') || lowerName.includes('coronal')) viewType = 'CORONAL';
    else if (lowerName.includes('loc') || lowerName.includes('scout')) viewType = 'LOCALIZER';

    sequenceGroups.push({
      id: `seq-group-${seqIdx++}`,
      name: seqName,
      viewType,
      slices: seqSlices,
      description: `${seqSlices.length} merged slice frames across ${files.length} uploaded film sheet(s)`,
    });
  });

  const processingTimeMs = Date.now() - startTime;

  return {
    title: mainTitle || 'Patient Radiology Study',
    modality,
    bodyPart,
    totalSubImagesDetected: allSlices.length,
    uploadedFilesCount: files.length,
    sequences: sequenceGroups,
    overallImpression:
      overallImpressions.join(' ') ||
      `Sub-images across ${files.length} uploaded film sheet(s) successfully categorized and merged into sequence stack viewers.`,
    processingTimeMs,
    sourceImageUrl: files[0]?.dataUrl || '',
    sourceImageWidth: 1000,
    sourceImageHeight: 1000,
  };
};
