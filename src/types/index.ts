export interface LLMAccount {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  isActive: boolean;
  createdAt: number;
}

export interface TranslationSettings {
  chunkSize: number;
  requestDelay: number;
  maxRetries: number;
  temperature: number;
  concurrentThreads: number;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface ChunkStatus {
  index: number;
  content: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: string;
  workerId?: string;
  startTime?: number;
  endTime?: number;
  error?: string;
  retryCount: number;
}

export interface WorkerState {
  id: string;
  accountId: string;
  accountName: string;
  busy: boolean;
  currentChunkIndex?: number;
  progress: number;
  completedCount: number;
  errorCount: number;
  status: "idle" | "processing" | "rate_limited" | "error";
  lastError?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  workerId: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

export interface TranslationJob {
  id: string;
  fileName: string;
  originalContent: string;
  translatedContent: string;
  totalChunks: number;
  chunks: ChunkStatus[];
  status: "idle" | "running" | "paused" | "completed" | "error";
  startTime?: number;
  endTime?: number;
  sourceLanguage: string;
  targetLanguage: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: "auto", name: "Auto Detect" },
  { code: "en", name: "English" },
  { code: "vi", name: "Vietnamese" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
  { code: "th", name: "Thai" },
];
