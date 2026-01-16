import { useState } from "react";
import type { LLMAccount } from "../types";
import { LLMService } from "../services/llm";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface AccountFormProps {
  account?: LLMAccount;
  onSave: (account: Omit<LLMAccount, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export function AccountForm({ account, onSave, onCancel }: AccountFormProps) {
  const [name, setName] = useState(account?.name || "");
  const [baseUrl, setBaseUrl] = useState(account?.baseUrl || "");
  const [apiKey, setApiKey] = useState(account?.apiKey || "");
  const [model, setModel] = useState(account?.model || "");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      baseUrl,
      apiKey,
      model,
      isActive: account?.isActive ?? true,
    });
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const service = new LLMService({
        id: "",
        name,
        baseUrl,
        apiKey,
        model,
        isActive: true,
        createdAt: 0,
      });
      const success = await service.testConnection();
      setTestResult(success ? "success" : "error");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  };

  const isValid = name && baseUrl && apiKey && model;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Fireworks AI"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Base URL
        </label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://api.fireworks.ai/inference/v1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          The base URL for the OpenAI-compatible API endpoint
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Key
        </label>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model ID
        </label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="accounts/fireworks/models/deepseek-v3p2"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleTest}
          disabled={!isValid || testing}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {testing && <Loader2 className="w-4 h-4 animate-spin" />}
          Test Connection
        </button>
        {testResult === "success" && (
          <span className="text-sm text-green-600">Connection successful!</span>
        )}
        {testResult === "error" && (
          <span className="text-sm text-red-600">Connection failed</span>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {account ? "Update Account" : "Add Account"}
        </button>
      </div>
    </form>
  );
}
