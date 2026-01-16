import { create } from "zustand";
import type { ChunkStatus, LogEntry, TranslationJob, WorkerState } from "../types";

interface TranslationState {
  job: TranslationJob | null;
  workers: WorkerState[];
  logs: LogEntry[];
  isSettingsOpen: boolean;

  setJob: (job: TranslationJob | null) => void;
  updateJobStatus: (status: TranslationJob["status"]) => void;
  updateChunk: (index: number, updates: Partial<ChunkStatus>) => void;
  setChunks: (chunks: ChunkStatus[]) => void;

  initWorkers: (workers: WorkerState[]) => void;
  updateWorker: (id: string, updates: Partial<WorkerState>) => void;

  addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;

  setSettingsOpen: (open: boolean) => void;

  getProgress: () => { completed: number; total: number; percent: number };
  getEstimatedTime: () => number;
  getTranslatedContent: () => string;

  reset: () => void;
}

export const useTranslationStore = create<TranslationState>((set, get) => ({
  job: null,
  workers: [],
  logs: [],
  isSettingsOpen: false,

  setJob: (job) => set({ job }),

  updateJobStatus: (status) => {
    set((state) => {
      if (!state.job) return state;
      return {
        job: {
          ...state.job,
          status,
          endTime: status === "completed" || status === "error" ? Date.now() : state.job.endTime,
        },
      };
    });
  },

  updateChunk: (index, updates) => {
    set((state) => {
      if (!state.job) return state;
      const chunks = [...state.job.chunks];
      chunks[index] = { ...chunks[index], ...updates };
      return {
        job: { ...state.job, chunks },
      };
    });
  },

  setChunks: (chunks) => {
    set((state) => {
      if (!state.job) return state;
      return {
        job: { ...state.job, chunks, totalChunks: chunks.length },
      };
    });
  },

  initWorkers: (workers) => set({ workers }),

  updateWorker: (id, updates) => {
    set((state) => ({
      workers: state.workers.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }));
  },

  addLog: (log) => {
    const entry: LogEntry = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    set((state) => ({
      logs: [entry, ...state.logs].slice(0, 500),
    }));
  },

  clearLogs: () => set({ logs: [] }),

  setSettingsOpen: (open) => set({ isSettingsOpen: open }),

  getProgress: () => {
    const job = get().job;
    if (!job) return { completed: 0, total: 0, percent: 0 };
    const completed = job.chunks.filter((c) => c.status === "completed").length;
    const total = job.totalChunks;
    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },

  getEstimatedTime: () => {
    const job = get().job;
    if (!job || !job.startTime) return 0;
    const { completed, total } = get().getProgress();
    if (completed === 0) return 0;
    const elapsed = Date.now() - job.startTime;
    const avgTimePerChunk = elapsed / completed;
    const remaining = total - completed;
    return Math.round((avgTimePerChunk * remaining) / 1000);
  },

  getTranslatedContent: () => {
    const job = get().job;
    if (!job) return "";
    return job.chunks
      .filter((c) => c.status === "completed" && c.result)
      .sort((a, b) => a.index - b.index)
      .map((c) => c.result)
      .join("\n\n");
  },

  reset: () => {
    set({
      job: null,
      workers: [],
      logs: [],
    });
  },
}));
