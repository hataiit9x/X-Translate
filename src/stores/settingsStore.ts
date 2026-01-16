import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LLMAccount, TranslationSettings } from "../types";

interface SettingsState {
  accounts: LLMAccount[];
  settings: TranslationSettings;
  addAccount: (account: Omit<LLMAccount, "id" | "createdAt">) => void;
  updateAccount: (id: string, account: Partial<LLMAccount>) => void;
  deleteAccount: (id: string) => void;
  toggleAccountActive: (id: string) => void;
  updateSettings: (settings: Partial<TranslationSettings>) => void;
  getActiveAccounts: () => LLMAccount[];
}

const defaultSettings: TranslationSettings = {
  chunkSize: 3000,
  requestDelay: 500,
  maxRetries: 3,
  temperature: 0.6,
  concurrentThreads: 0,
  sourceLanguage: "auto",
  targetLanguage: "vi",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      accounts: [],
      settings: defaultSettings,

      addAccount: (account) => {
        const newAccount: LLMAccount = {
          ...account,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        set((state) => ({
          accounts: [...state.accounts, newAccount],
        }));
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === id ? { ...acc, ...updates } : acc
          ),
        }));
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc.id !== id),
        }));
      },

      toggleAccountActive: (id) => {
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === id ? { ...acc, isActive: !acc.isActive } : acc
          ),
        }));
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      getActiveAccounts: () => {
        return get().accounts.filter((acc) => acc.isActive);
      },
    }),
    {
      name: "x-translate-settings",
    }
  )
);
