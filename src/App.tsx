import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ViewerContainer } from './components/ViewerContainer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { FilmAnalysisResult, UploadedFileItem } from './types';
import { getSelectedModel, setSelectedModel as saveSelectedModel, getApiKeys } from './services/storageService';
import { analyzeMultipleFilmSheetsWithGemini } from './services/gemini';
import { generateSampleMriFilmSheet } from './services/sampleData';

export const App: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>(getSelectedModel());
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(getApiKeys().length > 0);

  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Initializing vision module...');
  const [analysisResult, setAnalysisResult] = useState<FilmAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (getApiKeys().length === 0) {
      setOnboardingOpen(true);
    }
  }, []);

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    saveSelectedModel(modelId);
  };

  const refreshKeysState = () => {
    setHasApiKeys(getApiKeys().length > 0);
  };

  const handleFilesSelected = async (files: UploadedFileItem[]) => {
    setErrorMsg(null);
    setProcessing(true);

    try {
      const result = await analyzeMultipleFilmSheetsWithGemini(
        files,
        selectedModel,
        (status) => setProcessingStatus(status)
      );
      setAnalysisResult(result);
      setProcessing(false);
    } catch (err: any) {
      setProcessing(false);
      console.error('Multi-film analysis failed:', err);
      if (err.message?.includes('NO_API_KEY')) {
        setApiKeyModalOpen(true);
      } else {
        setErrorMsg(
          err.message || 'Failed to analyze film sheet(s). Please check your API key quota or try another model.'
        );
      }
    }
  };

  const handleRunSampleDemo = () => {
    setErrorMsg(null);
    setProcessing(true);
    setProcessingStatus('Loading synthetic 3.0T Brain MRI Film Sheet canvas...');
    setTimeout(() => {
      const demoResult = generateSampleMriFilmSheet();
      setAnalysisResult(demoResult);
      setProcessing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Header Navigation */}
      <Header
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        onRunSampleDemo={handleRunSampleDemo}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {processing ? (
          <ProcessingStatus
            statusText={processingStatus}
            selectedModel={selectedModel}
          />
        ) : analysisResult ? (
          <ViewerContainer
            analysisResult={analysisResult}
            selectedModel={selectedModel}
            onResetUpload={() => setAnalysisResult(null)}
          />
        ) : (
          <ImageUploader
            onFilesSelected={handleFilesSelected}
            onRunSampleDemo={handleRunSampleDemo}
            onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
            hasApiKeys={hasApiKeys}
          />
        )}

        {/* Global Error Alert */}
        {errorMsg && !processing && (
          <div className="max-w-2xl mx-auto my-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start justify-between gap-3 shadow-xl">
            <div>
              <strong className="font-bold text-rose-300">Analysis Error:</strong> {errorMsg}
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 hover:text-rose-200 font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <div>RadSlice AI • Powered by Gemini Vision</div>
            <div>100% Client-Side Privacy • Multi-File Categorizer & Standalone HTML ZIP Export</div>
          </div>
          
          <div className="border-t border-slate-800/60 w-full pt-4 mt-2">
            <div className="text-cyan-400 font-bold mb-3 uppercase tracking-widest text-[10px]">SUBSCRIBE TO OUR CHANNELS FOR MORE UPDATES & ANNOUNCEMENTS</div>
            <div className="flex flex-wrap justify-center gap-4 text-[11px] font-sans font-semibold">
              <a href="https://whatsapp.com/channel/0029Vb2S2bW0G0Xq94mR721T" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 hover:border-emerald-500/30">WhatsApp Channel</a>
              <a href="https://youtube.com/@raddoc96" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-rose-400 transition-colors bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 hover:border-rose-500/30">YouTube Channel</a>
              <a href="https://t.me/raddocs" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 hover:border-blue-500/30">Telegram Channel</a>
              <a href="https://t.me/radiology_chatgpt" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 hover:border-blue-500/30">Telegram Group</a>
              <a href="https://x.com/raddoc96" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-500/30">X (Twitter)</a>
            </div>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onKeysChanged={refreshKeysState}
      />

      {/* Onboarding Intro Modal */}
      <OnboardingOverlay
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onRunDemo={handleRunSampleDemo}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
      />
    </div>
  );
};
export default App;
