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
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>RadSlice AI • Powered by Gemini Vision 3.6 / 3.5 Flash</div>
          <div>100% Client-Side Privacy • Multi-File Categorizer & Standalone HTML ZIP Export</div>
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
