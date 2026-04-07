import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppKeys {
  userKey: string;       // API / Vendor Key
  appName: string;       // Registered app name (e.g. "5paisaprime")
  appSource: string;     // App source ID
  encryptionKey: string; // Used for OAuth token exchange
  userId: string;        // Login user ID
  password: string;      // Plain password — required in every API head (SDK confirmed)
  clientCode: string;    // Returned from OAuth (numeric, e.g. "54509559")
  accessToken: string;   // Bearer token
}

interface AppStore {
  isMockMode: boolean;
  apiKeys: AppKeys | null;
  setMockMode: (val: boolean) => void;
  setApiKeys: (keys: AppKeys) => void;
  clearKeys: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      isMockMode: true,
      apiKeys: null,
      setMockMode: (val) => set({ isMockMode: val }),
      setApiKeys: (keys) => set({ apiKeys: keys }),
      clearKeys: () => set({ apiKeys: null, isMockMode: true }),
    }),
    { name: '5paisa-prime-store' }
  )
);
