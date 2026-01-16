import { formatTime } from "../utils/fileChunker";

interface ProgressPanelProps {
  fileName: string;
  completed: number;
  total: number;
  percent: number;
  elapsed: number;
  estimatedRemaining: number;
  failed: number;
  status: "idle" | "running" | "paused" | "completed" | "error";
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRetryFailed: () => void;
}

export function ProgressPanel({
  fileName,
  completed,
  total,
  percent,
  elapsed,
  estimatedRemaining,
  failed,
  status,
  onPause,
  onResume,
  onStop,
  onRetryFailed,
}: ProgressPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Translation Progress</h3>
          <p className="text-xs text-gray-500">{fileName}</p>
        </div>
        <div className="flex gap-2">
          {status === "running" && (
            <button
              onClick={onPause}
              className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
            >
              Pause
            </button>
          )}
          {status === "paused" && (
            <button
              onClick={onResume}
              className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
            >
              Resume
            </button>
          )}
          {(status === "running" || status === "paused") && (
            <button
              onClick={onStop}
              className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Stop
            </button>
          )}
          {failed > 0 && status !== "running" && (
            <button
              onClick={onRetryFailed}
              className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
            >
              Retry Failed ({failed})
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">
            {completed} / {total} chunks
          </span>
          <span className="text-sm font-medium text-gray-700">{percent}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              status === "completed"
                ? "bg-green-500"
                : status === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center text-sm">
        <div>
          <p className="text-gray-500">Completed</p>
          <p className="font-semibold text-green-600">{completed}</p>
        </div>
        <div>
          <p className="text-gray-500">In Progress</p>
          <p className="font-semibold text-blue-600">
            {total - completed - failed}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Failed</p>
          <p className="font-semibold text-red-600">{failed}</p>
        </div>
        <div>
          <p className="text-gray-500">Elapsed</p>
          <p className="font-semibold text-gray-700">{formatTime(elapsed)}</p>
        </div>
      </div>

      {status === "running" && estimatedRemaining > 0 && (
        <p className="text-xs text-gray-500 text-center mt-3">
          Estimated remaining: ~{formatTime(estimatedRemaining)}
        </p>
      )}

      {status === "completed" && (
        <p className="text-sm text-green-600 text-center mt-3 font-medium">
          Translation completed successfully!
        </p>
      )}
    </div>
  );
}
