import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Play, Sparkles, AlertCircle, Layers } from 'lucide-react';
import { rasterizePdfFile } from '../services/pdfService';
import { UploadedFileItem } from '../types';

interface ImageUploaderProps {
  onFilesSelected: (files: UploadedFileItem[]) => void;
  onRunSampleDemo: () => void;
  onOpenApiKeyModal: () => void;
  hasApiKeys: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFilesSelected,
  onRunSampleDemo,
  onOpenApiKeyModal,
  hasApiKeys,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFileList = async (fileList: FileList | File[]) => {
    setErrorMsg(null);
    if (!fileList || fileList.length === 0) return;

    const items: UploadedFileItem[] = [];
    const files = Array.from(fileList);

    for (const file of files) {
      const fileType = file.type;
      const fileName = file.name;

      if (fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
        setLoadingPdf(true);
        try {
          const pages = await rasterizePdfFile(file, 2.0);
          setLoadingPdf(false);
          pages.forEach((p) => {
            items.push({
              dataUrl: p.dataUrl,
              name: `${fileName} (Page ${p.pageIndex})`,
            });
          });
        } catch (err: any) {
          setLoadingPdf(false);
          console.error('PDF error:', err);
          setErrorMsg(`Failed to render PDF: ${err.message || 'Corrupted file'}`);
        }
      } else if (fileType.startsWith('image/')) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        items.push({ dataUrl, name: fileName });
      }
    }

    if (items.length > 0) {
      onFilesSelected(items);
    } else if (!errorMsg) {
      setErrorMsg('Please select valid image (.png, .jpg, .webp) or PDF film sheet files.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      {/* No API Key Warning Banner */}
      {!hasApiKeys && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-amber-300">No Gemini API Key Configured</p>
              <p className="text-amber-200/80">
                Try the <strong className="text-white">Brain MRI Demo</strong> right now! Add a free key to analyze custom patient film uploads.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenApiKeyModal}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md"
          >
            Add API Key
          </button>
        </div>
      )}

      {/* Main Drop Area - Supports Multi-File Upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/40 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && processFileList(e.target.files)}
          accept="image/*,.pdf"
          multiple
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-inner">
            {loadingPdf ? (
              <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center justify-center space-x-2">
              <span>Upload Patient Radiology Film Sheet(s)</span>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                Multi-File Upload
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Select or drop any number of CT / MRI film photos or PDFs for the same patient. Gemini Vision will categorize similar sequences (T1, T2, FLAIR, etc.) into unified category stack viewers.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono pt-2">
            <span className="flex items-center space-x-1">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multiple Images (JPG, PNG, WebP)</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-Page PDFs</span>
            </span>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/80 text-rose-200 border border-rose-800 text-xs">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Alternative Demo Action Card */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200">Instant Demo (No Key Required)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Test with a realistic 12-slice 3.0T Brain MRI Film Sheet immediately.
            </p>
          </div>
          <button
            onClick={onRunSampleDemo}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center space-x-1.5 shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run Demo</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">Sequence Grouping Engine</h3>
            <p className="text-xs text-slate-400">
              Gemini Vision classifies T2, T1, FLAIR, and CT series into unified DICOM stack viewers.
            </p>
          </div>
          <a
            href="https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            Docs ↗
          </a>
        </div>
      </div>
    </div>
  );
};
