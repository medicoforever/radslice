import { FilmAnalysisResult, SequenceGroup, FilmSlice } from '../types';

export const generateSampleMriFilmSheet = (): FilmAnalysisResult => {
  // Generate a realistic 4x3 Grid Brain MRI Film Sheet Canvas (12 Slices)
  const cols = 4;
  const rows = 3;
  const tileW = 280;
  const tileH = 280;
  const padding = 12;
  const headerH = 70;

  const totalW = cols * tileW + (cols + 1) * padding;
  const totalH = headerH + rows * tileH + (rows + 1) * padding;

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d')!;

  // 1. Film Background
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, totalW, totalH);

  // 2. Film Header Text
  ctx.fillStyle = '#00e5ff';
  ctx.font = 'bold 16px "JetBrains Mono", sans-serif';
  ctx.fillText('PATIENT: DOE^JOHN [M/45] | ID: MR-889201 | DOB: 1981-04-12', padding, 28);
  ctx.font = '13px "Inter", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('STUDY: MRI BRAIN W/O CONTRAST | DATE: 2026-08-05 | SCANNER: 3.0T MAGNETOM', padding, 52);

  // Sequences definition:
  // Row 0: T2 AXIAL (Slices 1-4)
  // Row 1: FLAIR AXIAL (Slices 5-8)
  // Row 2: T1 SAGITTAL (Slices 9-11), LOCALIZER (Slice 12)
  const tileInfo = [
    { seq: 'T2 Axial', view: 'AXIAL' as const, sliceNo: 1, note: 'Inferior brainstem & cerebellum' },
    { seq: 'T2 Axial', view: 'AXIAL' as const, sliceNo: 2, note: 'Pons, 4th ventricle & temporal lobes' },
    { seq: 'T2 Axial', view: 'AXIAL' as const, sliceNo: 3, note: 'Midbrain & basal ganglia level' },
    { seq: 'T2 Axial', view: 'AXIAL' as const, sliceNo: 4, note: 'High centrum semiovale & cortex' },

    { seq: 'FLAIR Axial', view: 'AXIAL' as const, sliceNo: 1, note: 'Inferior temporal lobes' },
    { seq: 'FLAIR Axial', view: 'AXIAL' as const, sliceNo: 2, note: 'Periventricular white matter level' },
    { seq: 'FLAIR Axial', view: 'AXIAL' as const, sliceNo: 3, note: 'Lateral ventricles body level' },
    { seq: 'FLAIR Axial', view: 'AXIAL' as const, sliceNo: 4, note: 'High parietal cortex' },

    { seq: 'T1 Sagittal', view: 'SAGITTAL' as const, sliceNo: 1, note: 'Right lateral hemisphere' },
    { seq: 'T1 Sagittal', view: 'SAGITTAL' as const, sliceNo: 2, note: 'Midline sagittal corpus callosum' },
    { seq: 'T1 Sagittal', view: 'SAGITTAL' as const, sliceNo: 3, note: 'Left lateral hemisphere' },
    { seq: 'Localizer', view: 'LOCALIZER' as const, sliceNo: 1, note: 'Scout sagittal planning view' },
  ];

  const slices: FilmSlice[] = [];
  const sequenceMap = new Map<string, FilmSlice[]>();

  let globalIndex = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      globalIndex++;
      const info = tileInfo[globalIndex - 1];

      const x = padding + c * (tileW + padding);
      const y = headerH + padding + r * (tileH + padding);

      // Draw sub-image background & tile frame
      ctx.fillStyle = '#0d131d';
      ctx.fillRect(x, y, tileW, tileH);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, tileW, tileH);

      // Draw synthetic MRI brain slice graphic
      ctx.save();
      ctx.translate(x + tileW / 2, y + tileH / 2);

      const isFLAIR = info.seq.includes('FLAIR');
      const isSagittal = info.view === 'SAGITTAL';
      const isLocalizer = info.view === 'LOCALIZER';

      // Outer Skull Contour
      ctx.beginPath();
      if (isSagittal || isLocalizer) {
        ctx.ellipse(0, -10, tileW * 0.35, tileH * 0.38, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(0, 0, tileW * 0.34, tileH * 0.4, 0, 0, Math.PI * 2);
      }
      ctx.fillStyle = isFLAIR ? '#1e293b' : '#334155';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Brain Parenchyma
      ctx.beginPath();
      if (isSagittal || isLocalizer) {
        ctx.ellipse(-5, -8, tileW * 0.3, tileH * 0.32, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(0, 0, tileW * 0.28, tileH * 0.34, 0, 0, Math.PI * 2);
      }
      ctx.fillStyle = isFLAIR ? '#475569' : '#64748b';
      ctx.fill();

      // Ventricles / CSF Features
      if (!isLocalizer) {
        ctx.beginPath();
        if (isSagittal) {
          ctx.arc(-10, -15, 18, 0, Math.PI * 2);
        } else {
          // Butterfly ventricular system
          ctx.ellipse(-15, -10, 12, 28, Math.PI / 6, 0, Math.PI * 2);
          ctx.ellipse(15, -10, 12, 28, -Math.PI / 6, 0, Math.PI * 2);
        }
        // CSF T2 = Bright (white), FLAIR CSF = Suppressed (dark)
        ctx.fillStyle = isFLAIR ? '#0f172a' : '#f8fafc';
        ctx.fill();
      }

      // Localizer crosshairs
      if (isLocalizer) {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(-tileW * 0.4, 0);
        ctx.lineTo(tileW * 0.4, 0);
        ctx.moveTo(0, -tileH * 0.4);
        ctx.lineTo(0, tileH * 0.4);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();

      // Text Overlays on Sub-Image (DICOM HUD style)
      ctx.fillStyle = '#00e5ff';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`SE:${r + 1} SL:${info.sliceNo}`, x + 8, y + 16);
      ctx.fillText(`${info.seq}`, x + 8, y + tileH - 12);

      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`[${info.view}]`, x + tileW - 60, y + 16);

      // Scale bar graphic (10 mm reference line)
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + tileW - 50, y + tileH - 20);
      ctx.lineTo(x + tileW - 10, y + tileH - 20);
      ctx.stroke();
      ctx.fillStyle = '#00e5ff';
      ctx.font = '8px sans-serif';
      ctx.fillText('2 cm', x + tileW - 42, y + tileH - 8);

      // Crop tile for slice canvas
      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = tileW;
      tileCanvas.height = tileH;
      const tileCtx = tileCanvas.getContext('2d')!;
      tileCtx.drawImage(canvas, x, y, tileW, tileH, 0, 0, tileW, tileH);
      const croppedDataUrl = tileCanvas.toDataURL('image/png');

      // Normalized Bounding Box [ymin, xmin, ymax, xmax] 0-1000
      const ymin = Math.round((y / totalH) * 1000);
      const xmin = Math.round((x / totalW) * 1000);
      const ymax = Math.round(((y + tileH) / totalH) * 1000);
      const xmax = Math.round(((x + tileW) / totalW) * 1000);

      const sliceObj: FilmSlice = {
        id: `sample-slice-${globalIndex}`,
        globalIndex,
        sequenceIndex: info.sliceNo,
        sequenceName: info.seq,
        boundingBox: { ymin, xmin, ymax, xmax },
        croppedDataUrl,
        width: tileW,
        height: tileH,
        anatomicalNote: info.note,
        keyFinding: isFLAIR && info.sliceNo === 2 ? 'Subtle hyperintensity in deep periventricular white matter (Age-related microvascular change)' : 'Unremarkable anatomical appearance',
      };

      slices.push(sliceObj);

      if (!sequenceMap.has(info.seq)) {
        sequenceMap.set(info.seq, []);
      }
      sequenceMap.get(info.seq)!.push(sliceObj);
    }
  }

  const sequenceGroups: SequenceGroup[] = [];
  let seqIdx = 1;
  sequenceMap.forEach((seqSlices, seqName) => {
    let viewType: 'AXIAL' | 'SAGITTAL' | 'CORONAL' | 'LOCALIZER' | 'OTHER' = 'AXIAL';
    if (seqName.includes('Sagittal')) viewType = 'SAGITTAL';
    else if (seqName.includes('Localizer')) viewType = 'LOCALIZER';

    sequenceGroups.push({
      id: `sample-seq-${seqIdx++}`,
      name: seqName,
      viewType,
      slices: seqSlices,
      description: `${seqSlices.length} slice frames extracted from film sheet grid`,
    });
  });

  const fullDataUrl = canvas.toDataURL('image/png');

  return {
    title: 'Brain MRI Film Sheet (3.0T Demo Study)',
    modality: 'MRI',
    bodyPart: 'Brain',
    patientHeaderInfo: 'DOE^JOHN [M/45] | ID: MR-889201',
    totalSubImagesDetected: 12,
    sequences: sequenceGroups,
    overallImpression: 'Multi-sequence MRI Brain film sheet parsed into 12 sub-images across 4 sequences (T2 Axial, FLAIR Axial, T1 Sagittal, Localizer). Ventricular system is symmetric with normal midline alignment.',
    recommendations: 'No acute intracranial hemorrhage or territorial infarction identified.',
    processingTimeMs: 420,
    sourceImageUrl: fullDataUrl,
    sourceImageWidth: totalW,
    sourceImageHeight: totalH,
  };
};
