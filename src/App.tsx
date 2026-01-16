import { useState, useRef, useEffect } from "react";
import { Settings, Play, Download } from "lucide-react";
import { useSettingsStore } from "./stores/settingsStore";
import { useTranslationStore } from "./stores/translationStore";
import { FileUploader } from "./components/FileUploader";
import { LanguageSelector } from "./components/LanguageSelector";
import { TranslationView } from "./components/TranslationView";
import { ProgressPanel } from "./components/ProgressPanel";
import { WorkerStatus } from "./components/WorkerStatus";
import { ChunkGrid } from "./components/ChunkGrid";
import { ActivityLog } from "./components/ActivityLog";
import { SettingsModal } from "./components/SettingsModal";
import { splitIntoChunks } from "./utils/fileChunker";
import { WorkerPool } from "./services/workerPool";
import type { TranslationJob } from "./types";

export default function App() {
  const {
    accounts,
    settings,
    addAccount,
    updateAccount,
    deleteAccount,
    toggleAccountActive,
    updateSettings,
    getActiveAccounts,
  } = useSettingsStore();

  const {
    job,
    workers,
    logs,
    isSettingsOpen,
    setJob,
    updateJobStatus,
    updateChunk,
    initWorkers,
    updateWorker,
    addLog,
    clearLogs,
    setSettingsOpen,
    getProgress,
    getEstimatedTime,
    getTranslatedContent,
    reset,
  } = useTranslationStore();

  const [originalContent, setOriginalContent] = useState("");
  const [fileName, setFileName] = useState("");
  const workerPoolRef = useRef<WorkerPool | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (job?.status === "running" && job.startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - job.startTime!) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [job?.status, job?.startTime]);

  const handleFileLoad = (content: string, name: string) => {
    setOriginalContent(content);
    setFileName(name);
    reset();
  };

  const handleStartTranslation = async () => {
    const activeAccounts = getActiveAccounts();
    if (activeAccounts.length === 0) {
      addLog({ workerId: "system", type: "error", message: "No active LLM accounts configured" });
      setSettingsOpen(true);
      return;
    }

    if (!originalContent) {
      addLog({ workerId: "system", type: "error", message: "No file loaded" });
      return;
    }

    const chunks = splitIntoChunks(originalContent, settings.chunkSize);

    const newJob: TranslationJob = {
      id: crypto.randomUUID(),
      fileName,
      originalContent,
      translatedContent: "",
      totalChunks: chunks.length,
      chunks,
      status: "running",
      startTime: Date.now(),
      sourceLanguage: settings.sourceLanguage,
      targetLanguage: settings.targetLanguage,
    };

    setJob(newJob);
    clearLogs();

    addLog({
      workerId: "system",
      type: "info",
      message: `Starting translation: ${chunks.length} chunks, ${activeAccounts.length} accounts`,
    });

    const pool = new WorkerPool({
      accounts: activeAccounts,
      settings,
      onUpdateChunk: updateChunk,
      onUpdateWorker: updateWorker,
      onAddLog: addLog,
      onComplete: () => {
        updateJobStatus("completed");
        addLog({ workerId: "system", type: "success", message: "Translation completed!" });
      },
    });

    const workerStates = pool.initWorkers();
    initWorkers(workerStates);
    workerPoolRef.current = pool;

    await pool.start(chunks);
  };

  const handlePause = () => {
    workerPoolRef.current?.pause();
    updateJobStatus("paused");
  };

  const handleResume = () => {
    workerPoolRef.current?.resume();
    updateJobStatus("running");
  };

  const handleStop = () => {
    workerPoolRef.current?.stop();
    updateJobStatus("error");
  };

  const handleRetryFailed = () => {
    if (job && workerPoolRef.current) {
      workerPoolRef.current.retryFailed();
      updateJobStatus("running");
      workerPoolRef.current.start(job.chunks);
    }
  };

  const handleSaveTranslation = () => {
    const content = getTranslatedContent();
    if (!content) return;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.[^.]+$/, "") + "_translated.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const progress = getProgress();
  const estimatedRemaining = getEstimatedTime();
  const translatedContent = getTranslatedContent();
  const canStart = originalContent && getActiveAccounts().length > 0 && (!job || job.status === "completed" || job.status === "error" || job.status === "idle");
  const failedCount = job?.chunks.filter((c) => c.status === "failed").length || 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">X-Translate</h1>
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <FileUploader
            onFileLoad={handleFileLoad}
            isDisabled={job?.status === "running"}
          />

          {fileName && (
            <p className="mt-3 text-sm text-gray-600">
              Loaded: <span className="font-medium">{fileName}</span>
            </p>
          )}

          <div className="mt-4 flex items-end gap-4">
            <LanguageSelector
              label="Source Language"
              value={settings.sourceLanguage}
              onChange={(value) => updateSettings({ sourceLanguage: value })}
            />
            <LanguageSelector
              label="Target Language"
              value={settings.targetLanguage}
              onChange={(value) => updateSettings({ targetLanguage: value })}
              excludeAuto
            />
            <button
              onClick={handleStartTranslation}
              disabled={!canStart}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-4 h-4" />
              Translate
            </button>
            {job?.status === "completed" && translatedContent && (
              <button
                onClick={handleSaveTranslation}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Save Translation
              </button>
            )}
          </div>
        </div>

        {job && (
          <ProgressPanel
            fileName={job.fileName}
            completed={progress.completed}
            total={progress.total}
            percent={progress.percent}
            elapsed={elapsed}
            estimatedRemaining={estimatedRemaining}
            failed={failedCount}
            status={job.status}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onRetryFailed={handleRetryFailed}
          />
        )}

        {workers.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            <WorkerStatus workers={workers} />
            {job && <ChunkGrid chunks={job.chunks} />}
          </div>
        )}

        <div className="flex-1 grid grid-cols-3 gap-6 min-h-[400px]">
          <div className="col-span-2">
            <TranslationView
              original={originalContent}
              translated={translatedContent}
            />
          </div>
          <div>
            <ActivityLog logs={logs} onClear={clearLogs} />
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        accounts={accounts}
        settings={settings}
        onAddAccount={addAccount}
        onUpdateAccount={updateAccount}
        onDeleteAccount={deleteAccount}
        onToggleAccountActive={toggleAccountActive}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
}
