import React, { useState, useEffect } from 'react';
import { getApiKeys, addApiKey, removeApiKey, clearApiKeys } from '../services/storageService';
import { validateApiKey } from '../services/gemini';
import { Key, ShieldCheck, Plus, Trash2, ExternalLink, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysChanged: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeysChanged,
}) => {
  const [keysList, setKeysList] = useState<string[]>([]);
  const [inputKey, setInputKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const refreshKeys = () => {
    setKeysList(getApiKeys());
  };

  useEffect(() => {
    if (isOpen) {
      refreshKeys();
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddKey = async () => {
    const cleanKey = inputKey.trim();
    if (!cleanKey) {
      setStatusMsg({ type: 'error', text: 'Please enter a Gemini API Key from Google AI Studio.' });
      return;
    }
    setTesting(true);
    setStatusMsg({ type: 'info', text: 'Validating API key with Google AI Studio servers...' });

    const isValid = await validateApiKey(cleanKey);
    setTesting(false);

    if (isValid) {
      const added = addApiKey(cleanKey);
      if (added) {
        setStatusMsg({ type: 'success', text: '✅ Gemini API Key verified & saved successfully!' });
        setInputKey('');
        refreshKeys();
        onKeysChanged();
      } else {
        setStatusMsg({ type: 'info', text: 'This API key is already in your saved keys list.' });
      }
    } else {
      setStatusMsg({ type: 'error', text: '❌ Invalid API key. Please check your key from Google AI Studio and try again.' });
    }
  };

  const handleRemoveOne = (keyToRemove: string) => {
    removeApiKey(keyToRemove);
    refreshKeys();
    setStatusMsg({ type: 'info', text: 'API key removed.' });
    onKeysChanged();
  };

  const handleClearAll = () => {
    clearApiKeys();
    refreshKeys();
    setStatusMsg({ type: 'info', text: 'All saved API keys have been cleared.' });
    onKeysChanged();
  };

  const maskKey = (key: string) => {
    if (key.length <= 10) return '••••••••';
    return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-800 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-lg font-bold p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xl font-bold">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-100 flex items-center space-x-2">
              <span>RadSlice API Key Manager</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400">100% Client-Side Local Storage Privacy</p>
          </div>
        </div>

        {/* Multi-Key Info Banner */}
        <div className="bg-cyan-950/40 p-3.5 rounded-xl border border-cyan-500/30 mb-5 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-cyan-300 flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>Why add 2 or 3 API keys?</span>
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li>
              <strong className="text-slate-200">Quota Load Balancing:</strong> RadSlice cycles through your saved keys randomly for each vision decomposition request to distribute usage evenly.
            </li>
            <li>
              <strong className="text-slate-200">Automatic Failover:</strong> If one key hits Google's free tier rate limit (15 RPM), RadSlice seamlessly fails over to your next key!
            </li>
          </ul>
        </div>

        {/* Add Key Form */}
        <div className="space-y-3 mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Add New Gemini API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste AIzaSy... key from Google AI Studio"
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none font-mono"
            />
            <button
              onClick={handleAddKey}
              disabled={testing}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap shadow-lg flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>{testing ? 'Testing...' : 'Add Key'}</span>
            </button>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                  : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Active Keys List */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Saved Keys ({keysList.length})
            </span>
            {keysList.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          {keysList.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/60 text-center text-xs text-slate-500 border border-dashed border-slate-800">
              No API keys saved yet. Add a free key above to start analyzing film sheets!
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {keysList.map((keyStr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">
                      #{idx + 1}
                    </span>
                    <span className="text-slate-200">{maskKey(keyStr)}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveOne(keyStr)}
                    className="text-rose-400 hover:text-rose-300 font-bold text-xs p-1 flex items-center space-x-1"
                    title="Remove key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tutorial Link */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center space-x-1.5 font-semibold"
          >
            <span>Get Free Gemini API Key from Google AI Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
