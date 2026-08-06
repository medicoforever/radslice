import { FilmAnalysisResult } from '../types';

export const exportPatientFilmPackageZip = async (
  result: FilmAnalysisResult
): Promise<void> => {
  // We keep the function name the same for compatibility, but it now exports a unified HTML file.
  
  const allDataJson = JSON.stringify({
    title: result.title,
    modality: result.modality,
    bodyPart: result.bodyPart,
    sequences: result.sequences.map(seq => ({
      id: seq.id,
      name: seq.name,
      viewType: seq.viewType,
      slices: seq.slices.map(s => ({
        index: s.sequenceIndex,
        globalIndex: s.globalIndex,
        dataUrl: s.croppedDataUrl,
        note: s.anatomicalNote || '',
        finding: s.keyFinding || '',
      }))
    }))
  }).replace(/</g, '\\u003c');

  const htmlContent = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>RadSlice Standalone Viewer | ${result.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #06090e;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      user-select: none;
      touch-action: pan-y;
    }
    header {
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #1e293b;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 { font-size: 16px; color: #38bdf8; font-weight: 800; }
    .subtitle { font-size: 11px; color: #94a3b8; }
    
    .tabs {
      display: flex;
      overflow-x: auto;
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
      padding: 8px 12px 0 12px;
      gap: 8px;
      scrollbar-width: none; /* Firefox */
    }
    .tabs::-webkit-scrollbar { display: none; } /* Safari and Chrome */
    .tab {
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
      border-bottom: none;
      border-radius: 8px 8px 0 0;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      white-space: nowrap;
    }
    .tab.active {
      background: #020617;
      color: #38bdf8;
      border-color: #1e293b;
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
      background: #000;
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
      pointer-events: none;
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
      <h1>RadSlice AI Viewer</h1>
      <div class="subtitle">${result.title} | ${result.modality}</div>
    </div>
  </header>

  <div class="tabs" id="tabsContainer"></div>

  <main>
    <div class="viewer-box" id="viewerContainer">
      <div class="hud-title" id="hudTitle">Sequence</div>
      <div class="hud-counter" id="counter">1 / X</div>
      <img id="mainImage" class="slice-img" src="" alt="Slice View">
      <div class="touch-hint">📱 Swipe screen / Wheel to scroll slices</div>
    </div>

    <div class="controls-bar">
      <button id="prevBtn" class="step-btn">◀</button>
      <input type="range" id="sliceSlider" min="0" max="0" value="0">
      <button id="nextBtn" class="step-btn">▶</button>
    </div>

    <div class="note-box" id="noteBox">Slice Details</div>
  </main>

  <script>
    const db = ${allDataJson};
    let activeSeqIndex = 0;
    let currentSliceIndex = 0;

    const tabsContainer = document.getElementById('tabsContainer');
    const mainImage = document.getElementById('mainImage');
    const hudTitle = document.getElementById('hudTitle');
    const counter = document.getElementById('counter');
    const slider = document.getElementById('sliceSlider');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const noteBox = document.getElementById('noteBox');
    const viewerContainer = document.getElementById('viewerContainer');

    function renderTabs() {
      tabsContainer.innerHTML = '';
      db.sequences.forEach((seq, idx) => {
        const tab = document.createElement('div');
        tab.className = 'tab ' + (idx === activeSeqIndex ? 'active' : '');
        tab.textContent = seq.name + ' (' + seq.slices.length + ')';
        tab.onclick = () => {
          activeSeqIndex = idx;
          currentSliceIndex = 0;
          renderTabs();
          loadSequence();
        };
        tabsContainer.appendChild(tab);
      });
    }

    function loadSequence() {
      const seq = db.sequences[activeSeqIndex];
      hudTitle.textContent = seq.name;
      slider.max = seq.slices.length - 1;
      updateSlice(0);
    }

    function updateSlice(index) {
      const seq = db.sequences[activeSeqIndex];
      if (!seq || index < 0 || index >= seq.slices.length) return;
      
      currentSliceIndex = index;
      const s = seq.slices[currentSliceIndex];
      
      mainImage.src = s.dataUrl;
      counter.textContent = (currentSliceIndex + 1) + ' / ' + seq.slices.length;
      slider.value = currentSliceIndex;
      prevBtn.disabled = currentSliceIndex === 0;
      nextBtn.disabled = currentSliceIndex === seq.slices.length - 1;
      noteBox.textContent = 'Slice ' + s.index + ' (Global #' + s.globalIndex + '): ' + (s.note || 'No notes');
    }

    prevBtn.addEventListener('click', () => updateSlice(currentSliceIndex - 1));
    nextBtn.addEventListener('click', () => updateSlice(currentSliceIndex + 1));
    slider.addEventListener('input', (e) => updateSlice(parseInt(e.target.value)));

    // Wheel Scroll
    viewerContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY > 0) updateSlice(currentSliceIndex + 1);
      else if (e.deltaY < 0) updateSlice(currentSliceIndex - 1);
    }, { passive: false });

    // Touch Swipe Gesture
    let touchStartY = 0;
    viewerContainer.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });

    viewerContainer.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;
      if (Math.abs(diffY) > 30) {
        if (diffY > 0) updateSlice(currentSliceIndex + 1);
        else updateSlice(currentSliceIndex - 1);
      }
    });

    // Keyboard Arrows
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') updateSlice(currentSliceIndex + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') updateSlice(currentSliceIndex - 1);
    });

    // Initialize
    if (db.sequences.length > 0) {
      renderTabs();
      loadSequence();
    }
  </script>
</body>
</html>`;

  // Output as a single HTML file instead of ZIP
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `RadSlice_${result.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Viewer.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
