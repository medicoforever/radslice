import JSZip from 'jszip';
import { FilmAnalysisResult, SequenceGroup } from '../types';

const generateStandaloneCategoryHtml = (
  patientTitle: string,
  seqGroup: SequenceGroup
): string => {
  const slicesJson = JSON.stringify(
    seqGroup.slices.map((s, idx) => ({
      index: idx + 1,
      globalIndex: s.globalIndex,
      dataUrl: s.croppedDataUrl,
      note: s.anatomicalNote || '',
      finding: s.keyFinding || '',
    }))
  ).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${seqGroup.name} Viewer | ${patientTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #06090e;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-h: 100vh;
      display: flex;
      flex-direction: column;
      user-select: none;
      touch-action: pan-y;
    }
    header {
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 1px border #1e293b;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 { font-size: 16px; color: #38bdf8; font-weight: 800; }
    .subtitle { font-size: 11px; color: #94a3b8; }
    .badge {
      background: rgba(14, 165, 233, 0.2);
      color: #38bdf8;
      border: 1px solid rgba(14, 165, 233, 0.4);
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-weight: bold;
    }
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      gap: 12px;
    }
    .viewer-box {
      position: relative;
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
      width: 100%;
      max-width: 600px;
      height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    img.slice-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .hud-counter {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(2, 6, 23, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      font-family: monospace;
      font-weight: bold;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 8px;
    }
    .hud-title {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(2, 6, 23, 0.85);
      color: #e2e8f0;
      font-family: monospace;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 8px;
    }
    .touch-hint {
      position: absolute;
      bottom: 12px;
      color: #64748b;
      font-size: 10px;
      font-family: monospace;
      background: rgba(2, 6, 23, 0.7);
      padding: 4px 8px;
      border-radius: 6px;
    }
    .controls-bar {
      width: 100%;
      max-width: 600px;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    button.step-btn {
      background: #1e293b;
      color: #f1f5f9;
      border: none;
      border-radius: 8px;
      width: 38px;
      height: 38px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    }
    button.step-btn:disabled { opacity: 0.3; }
    input[type="range"] {
      flex: 1;
      accent-color: #38bdf8;
    }
    .note-box {
      width: 100%;
      max-width: 600px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 12px;
      font-size: 12px;
      color: #cbd5e1;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>${seqGroup.name}</h1>
      <div class="subtitle">${patientTitle}</div>
    </div>
    <div class="badge">${seqGroup.slices.length} Slices</div>
  </header>

  <main>
    <div class="viewer-box" id="viewerContainer">
      <div class="hud-title">${seqGroup.name}</div>
      <div class="hud-counter" id="counter">1 / ${seqGroup.slices.length}</div>
      <img id="mainImage" class="slice-img" src="" alt="Slice View">
      <div class="touch-hint">📱 Swipe screen / Wheel to scroll slices</div>
    </div>

    <div class="controls-bar">
      <button id="prevBtn" class="step-btn">◀</button>
      <input type="range" id="sliceSlider" min="0" max="${seqGroup.slices.length - 1}" value="0">
      <button id="nextBtn" class="step-btn">▶</button>
    </div>

    <div class="note-box" id="noteBox">Slice Details</div>
  </main>

  <script>
    const slices = ${slicesJson};
    let currentIndex = 0;

    const mainImage = document.getElementById('mainImage');
    const counter = document.getElementById('counter');
    const slider = document.getElementById('sliceSlider');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const noteBox = document.getElementById('noteBox');
    const container = document.getElementById('viewerContainer');

    function updateSlice(index) {
      if (index < 0 || index >= slices.length) return;
      currentIndex = index;
      const s = slices[currentIndex];
      mainImage.src = s.dataUrl;
      counter.textContent = (currentIndex + 1) + ' / ' + slices.length;
      slider.value = currentIndex;
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === slices.length - 1;
      noteBox.textContent = 'Slice ' + s.index + ' (Global #' + s.globalIndex + '): ' + (s.note || 'No notes');
    }

    prevBtn.addEventListener('click', () => updateSlice(currentIndex - 1));
    nextBtn.addEventListener('click', () => updateSlice(currentIndex + 1));
    slider.addEventListener('input', (e) => updateSlice(parseInt(e.target.value)));

    // Wheel Scroll
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY > 0) updateSlice(currentIndex + 1);
      else if (e.deltaY < 0) updateSlice(currentIndex - 1);
    }, { passive: false });

    // Touch Swipe Gesture
    let touchStartY = 0;
    container.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });

    container.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;
      if (Math.abs(diffY) > 30) {
        if (diffY > 0) updateSlice(currentIndex + 1); // Swipe Up -> Next
        else updateSlice(currentIndex - 1); // Swipe Down -> Prev
      }
    });

    // Keyboard Arrows
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') updateSlice(currentIndex + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') updateSlice(currentIndex - 1);
    });

    // Initial Load
    updateSlice(0);
  </script>
</body>
</html>`;
};

export const exportPatientFilmPackageZip = async (
  result: FilmAnalysisResult
): Promise<void> => {
  const zip = new JSZip();

  // 1. Generate Category Standalone HTML Files
  result.sequences.forEach((seqGroup) => {
    const fileName = `${seqGroup.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Viewer.html`;
    const htmlContent = generateStandaloneCategoryHtml(result.title, seqGroup);
    zip.file(fileName, htmlContent);
  });

  // 2. Generate Index.html for overall patient overview
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${result.title} | RadSlice AI Patient Package</title>
  <style>
    body { background: #06090e; color: #f1f5f9; font-family: system-ui, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    h1 { color: #38bdf8; font-size: 22px; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; text-decoration: none; color: inherit; }
    .card:hover { border-color: #38bdf8; }
    .btn { background: #0284c7; color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; }
  </style>
</head>
<body>
  <h1>🩻 ${result.title}</h1>
  <p style="color:#94a3b8; font-size:13px; margin-top:4px;">Modality: ${result.modality} | ${result.totalSubImagesDetected} Slices | ${result.sequences.length} Categories</p>

  <h2 style="font-size:16px; margin-top:24px; color:#e2e8f0;">Sequence Categories (Click to open viewer)</h2>
  ${result.sequences
    .map(
      (seq) => `
    <a href="${seq.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Viewer.html" class="card">
      <div>
        <h3 style="font-size:15px; font-weight:bold; color:#38bdf8;">${seq.name}</h3>
        <p style="font-size:12px; color:#94a3b8; margin-top:2px;">${seq.slices.length} Slices (${seq.viewType})</p>
      </div>
      <span class="btn">Open Viewer ➔</span>
    </a>
  `
    )
    .join('')}
</body>
</html>`;

  zip.file('Index.html', indexHtmlContent);

  // 3. Generate ZIP Blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `RadSlice_${result.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Package.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
