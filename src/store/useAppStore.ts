import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

export type ApiKeyStatus = 'valid' | 'invalid' | 'missing';

interface AppState {
  activeTab: string;
  showSettings: boolean;
  showChat: boolean;
  voiceEnabled: boolean;
  showCVCreatorDemo: boolean;
  apiKeyStatus: ApiKeyStatus;
  previewFile: File | null;

  setActiveTab: (tab: string) => void;
  setShowSettings: (value: boolean) => void;
  setShowChat: (value: boolean) => void;
  setVoiceEnabled: (value: boolean) => void;
  setShowCVCreatorDemo: (value: boolean) => void;
  setApiKeyStatus: (status: ApiKeyStatus) => void;
  setPreviewFile: (file: File | null) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        activeTab: 'dashboard',
        showSettings: false,
        showChat: false,
        voiceEnabled: true,
        showCVCreatorDemo: false,
        apiKeyStatus: 'missing',
        previewFile: null,

        setActiveTab: (tab) => set({ activeTab: tab }),
        setShowSettings: (value) => set({ showSettings: value }),
        setShowChat: (value) => set({ showChat: value }),
        setVoiceEnabled: (value) => set({ voiceEnabled: value }),
        setShowCVCreatorDemo: (value) => set({ showCVCreatorDemo: value }),
        setApiKeyStatus: (status) => set({ apiKeyStatus: status }),
        setPreviewFile: (file) => set({ previewFile: file }),
      }),
      {
        name: 'app-store',
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          activeTab: state.activeTab,
          voiceEnabled: state.voiceEnabled,
          apiKeyStatus: state.apiKeyStatus,
        }),
      }
    )
  )
);
