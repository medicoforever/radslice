import { DEFAULT_MODEL_ID } from '../constants';

const API_KEYS_STORAGE_KEY = 'radslice_gemini_api_keys';
const ACTIVE_MODEL_STORAGE_KEY = 'radslice_active_model';

export const getApiKeys = (): string[] => {
  try {
    const raw = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(k => String(k).trim()).filter(Boolean) : [];
  } catch (e) {
    console.error('Failed to read API keys from localStorage:', e);
    return [];
  }
};

export const saveApiKeys = (keys: string[]): void => {
  try {
    const cleanKeys = Array.from(new Set(keys.map(k => k.trim()).filter(Boolean)));
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(cleanKeys));
  } catch (e) {
    console.error('Failed to save API keys to localStorage:', e);
  }
};

export const addApiKey = (newKey: string): boolean => {
  const cleanKey = newKey.trim();
  if (!cleanKey) return false;
  const current = getApiKeys();
  if (current.includes(cleanKey)) return false;
  saveApiKeys([...current, cleanKey]);
  return true;
};

export const removeApiKey = (keyToRemove: string): void => {
  const current = getApiKeys();
  const updated = current.filter(k => k !== keyToRemove);
  saveApiKeys(updated);
};

export const clearApiKeys = (): void => {
  localStorage.removeItem(API_KEYS_STORAGE_KEY);
};

// Round-robin load balancer for API keys
let keyIndexCounter = 0;
export const getRandomApiKey = (): string | null => {
  const keys = getApiKeys();
  if (keys.length === 0) return null;
  keyIndexCounter = (keyIndexCounter + 1) % keys.length;
  return keys[keyIndexCounter];
};

export const getSelectedModel = (): string => {
  return localStorage.getItem(ACTIVE_MODEL_STORAGE_KEY) || DEFAULT_MODEL_ID;
};

export const setSelectedModel = (modelId: string): void => {
  localStorage.setItem(ACTIVE_MODEL_STORAGE_KEY, modelId);
};
