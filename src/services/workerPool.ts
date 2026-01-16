import type { LLMAccount, ChunkStatus, WorkerState, TranslationSettings } from "../types";
import { LLMService, RateLimitError } from "./llm";

type UpdateChunkCallback = (index: number, updates: Partial<ChunkStatus>) => void;
type UpdateWorkerCallback = (id: string, updates: Partial<WorkerState>) => void;
type AddLogCallback = (log: { workerId: string; type: "info" | "success" | "warning" | "error"; message: string }) => void;

interface WorkerPoolConfig {
  accounts: LLMAccount[];
  settings: TranslationSettings;
  onUpdateChunk: UpdateChunkCallback;
  onUpdateWorker: UpdateWorkerCallback;
  onAddLog: AddLogCallback;
  onComplete: () => void;
}

export class WorkerPool {
  private config: WorkerPoolConfig;
  private workers: Map<string, WorkerInstance> = new Map();
  private queue: number[] = [];
  private chunks: ChunkStatus[] = [];
  private isPaused = false;
  private isStopped = false;
  private activePromises: Promise<void>[] = [];

  constructor(config: WorkerPoolConfig) {
    this.config = config;
  }

  initWorkers(): WorkerState[] {
    const { accounts, settings } = this.config;
    const activeAccounts = accounts.filter((a) => a.isActive);
    const threadCount = settings.concurrentThreads > 0
      ? Math.min(settings.concurrentThreads, activeAccounts.length)
      : activeAccounts.length;

    const workerStates: WorkerState[] = [];

    for (let i = 0; i < threadCount; i++) {
      const account = activeAccounts[i % activeAccounts.length];
      const workerId = `worker-${i + 1}`;

      const worker = new WorkerInstance(
        workerId,
        account,
        this.config.settings,
        this.config.onUpdateWorker,
        this.config.onAddLog
      );

      this.workers.set(workerId, worker);

      workerStates.push({
        id: workerId,
        accountId: account.id,
        accountName: account.name,
        busy: false,
        progress: 0,
        completedCount: 0,
        errorCount: 0,
        status: "idle",
      });
    }

    return workerStates;
  }

  async start(chunks: ChunkStatus[]): Promise<void> {
    this.chunks = chunks;
    this.queue = chunks
      .filter((c) => c.status === "pending" || c.status === "failed")
      .map((c) => c.index);
    this.isPaused = false;
    this.isStopped = false;

    const workerPromises: Promise<void>[] = [];

    for (const [workerId, worker] of this.workers) {
      const promise = this.runWorker(workerId, worker);
      workerPromises.push(promise);
      this.activePromises.push(promise);
    }

    await Promise.all(workerPromises);

    if (!this.isStopped) {
      this.config.onComplete();
    }
  }

  private async runWorker(workerId: string, worker: WorkerInstance): Promise<void> {
    while (!this.isStopped) {
      if (this.isPaused) {
        await this.sleep(100);
        continue;
      }

      const chunkIndex = this.queue.shift();
      if (chunkIndex === undefined) {
        break;
      }

      const chunk = this.chunks[chunkIndex];
      if (!chunk) continue;

      this.config.onUpdateChunk(chunkIndex, {
        status: "processing",
        workerId,
        startTime: Date.now(),
      });

      this.config.onUpdateWorker(workerId, {
        busy: true,
        currentChunkIndex: chunkIndex,
        progress: 0,
        status: "processing",
      });

      this.config.onAddLog({
        workerId,
        type: "info",
        message: `Processing chunk #${chunkIndex + 1}...`,
      });

      try {
        const result = await worker.translateChunk(chunk.content, (progress) => {
          this.config.onUpdateWorker(workerId, { progress });
        });

        this.config.onUpdateChunk(chunkIndex, {
          status: "completed",
          result,
          endTime: Date.now(),
        });

        this.config.onUpdateWorker(workerId, {
          busy: false,
          currentChunkIndex: undefined,
          progress: 100,
          status: "idle",
          completedCount: (this.workers.get(workerId)?.completedCount || 0) + 1,
        });

        const elapsed = chunk.startTime
          ? ((Date.now() - chunk.startTime) / 1000).toFixed(1)
          : "?";

        this.config.onAddLog({
          workerId,
          type: "success",
          message: `Chunk #${chunkIndex + 1} completed (${elapsed}s)`,
        });
      } catch (error) {
        const isRateLimit = error instanceof RateLimitError;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if (isRateLimit && chunk.retryCount < this.config.settings.maxRetries) {
          this.config.onUpdateChunk(chunkIndex, {
            status: "pending",
            retryCount: chunk.retryCount + 1,
          });

          this.queue.push(chunkIndex);

          this.config.onUpdateWorker(workerId, {
            status: "rate_limited",
            lastError: errorMessage,
          });

          this.config.onAddLog({
            workerId,
            type: "warning",
            message: `Rate limit hit, retrying chunk #${chunkIndex + 1} in 5s...`,
          });

          await this.sleep(5000);
        } else {
          this.config.onUpdateChunk(chunkIndex, {
            status: "failed",
            error: errorMessage,
            endTime: Date.now(),
          });

          this.config.onUpdateWorker(workerId, {
            busy: false,
            currentChunkIndex: undefined,
            status: "error",
            errorCount: (this.workers.get(workerId)?.errorCount || 0) + 1,
            lastError: errorMessage,
          });

          this.config.onAddLog({
            workerId,
            type: "error",
            message: `Chunk #${chunkIndex + 1} failed: ${errorMessage}`,
          });
        }
      }

      await this.sleep(this.config.settings.requestDelay);
    }

    this.config.onUpdateWorker(workerId, {
      busy: false,
      status: "idle",
      currentChunkIndex: undefined,
    });
  }

  pause(): void {
    this.isPaused = true;
    this.config.onAddLog({
      workerId: "system",
      type: "warning",
      message: "Translation paused",
    });
  }

  resume(): void {
    this.isPaused = false;
    this.config.onAddLog({
      workerId: "system",
      type: "info",
      message: "Translation resumed",
    });
  }

  stop(): void {
    this.isStopped = true;
    this.isPaused = false;
    this.config.onAddLog({
      workerId: "system",
      type: "warning",
      message: "Translation stopped",
    });
  }

  retryFailed(): void {
    const failedIndexes = this.chunks
      .filter((c) => c.status === "failed")
      .map((c) => c.index);

    for (const index of failedIndexes) {
      this.config.onUpdateChunk(index, {
        status: "pending",
        error: undefined,
        retryCount: 0,
      });
      this.queue.push(index);
    }

    this.config.onAddLog({
      workerId: "system",
      type: "info",
      message: `Retrying ${failedIndexes.length} failed chunks`,
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

class WorkerInstance {
  private llmService: LLMService;
  private settings: TranslationSettings;
  completedCount = 0;
  errorCount = 0;

  constructor(
    _workerId: string,
    account: LLMAccount,
    settings: TranslationSettings,
    _onUpdateWorker: UpdateWorkerCallback,
    _onAddLog: AddLogCallback
  ) {
    this.llmService = new LLMService(account);
    this.settings = settings;
  }

  async translateChunk(
    content: string,
    onProgress: (progress: number) => void
  ): Promise<string> {
    return this.llmService.translate(
      content,
      this.settings.targetLanguage,
      this.settings.temperature,
      onProgress
    );
  }
}
