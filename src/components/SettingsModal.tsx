import { useState } from "react";
import { X } from "lucide-react";
import type { LLMAccount, TranslationSettings } from "../types";
import { AccountManager } from "./AccountManager";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: LLMAccount[];
  settings: TranslationSettings;
  onAddAccount: (account: Omit<LLMAccount, "id" | "createdAt">) => void;
  onUpdateAccount: (id: string, account: Partial<LLMAccount>) => void;
  onDeleteAccount: (id: string) => void;
  onToggleAccountActive: (id: string) => void;
  onUpdateSettings: (settings: Partial<TranslationSettings>) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  accounts,
  settings,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onToggleAccountActive,
  onUpdateSettings,
}: SettingsModalProps) {
  const [tab, setTab] = useState<"accounts" | "settings">("accounts");

  if (!isOpen) return null;

  const activeCount = accounts.filter((a) => a.isActive).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setTab("accounts")}
            className={`px-4 py-2 text-sm font-medium ${
              tab === "accounts"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            LLM Accounts ({accounts.length})
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`px-4 py-2 text-sm font-medium ${
              tab === "settings"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Translation Settings
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "accounts" && (
            <AccountManager
              accounts={accounts}
              onAdd={onAddAccount}
              onUpdate={onUpdateAccount}
              onDelete={onDeleteAccount}
              onToggleActive={onToggleAccountActive}
            />
          )}

          {tab === "settings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Concurrency Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Concurrent Threads
                    </label>
                    <select
                      value={settings.concurrentThreads}
                      onChange={(e) =>
                        onUpdateSettings({
                          concurrentThreads: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">Auto (= {activeCount} active accounts)</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      More threads = faster, but higher rate limit risk.
                      Recommended: 1 thread per LLM account.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Request Delay (ms)
                    </label>
                    <input
                      type="number"
                      value={settings.requestDelay}
                      onChange={(e) =>
                        onUpdateSettings({
                          requestDelay: parseInt(e.target.value) || 500,
                        })
                      }
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Delay between requests per thread to avoid rate limits
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Translation Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chunk Size (characters)
                    </label>
                    <input
                      type="number"
                      value={settings.chunkSize}
                      onChange={(e) =>
                        onUpdateSettings({
                          chunkSize: parseInt(e.target.value) || 3000,
                        })
                      }
                      min="500"
                      max="10000"
                      step="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum characters per translation chunk (500-10000)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Retries
                    </label>
                    <input
                      type="number"
                      value={settings.maxRetries}
                      onChange={(e) =>
                        onUpdateSettings({
                          maxRetries: parseInt(e.target.value) || 3,
                        })
                      }
                      min="0"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature
                    </label>
                    <input
                      type="number"
                      value={settings.temperature}
                      onChange={(e) =>
                        onUpdateSettings({
                          temperature: parseFloat(e.target.value) || 0.6,
                        })
                      }
                      min="0"
                      max="2"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower = more consistent, Higher = more creative (0-2)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
