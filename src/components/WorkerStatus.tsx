import type { WorkerState } from "../types";
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface WorkerStatusProps {
  workers: WorkerState[];
}

export function WorkerStatus({ workers }: WorkerStatusProps) {
  if (workers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Workers</h3>
      <div className="space-y-2">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"
          >
            <StatusIcon status={worker.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">
                  {worker.id}
                </span>
                <span className="text-xs text-gray-500">
                  ({worker.accountName})
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {worker.status === "processing" && worker.currentChunkIndex !== undefined && (
                  <span>Chunk #{worker.currentChunkIndex + 1}</span>
                )}
                {worker.status === "rate_limited" && (
                  <span className="text-yellow-600">Rate limited</span>
                )}
                {worker.status === "idle" && !worker.busy && (
                  <span>Idle</span>
                )}
              </div>
            </div>
            {worker.status === "processing" && (
              <div className="w-16">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${worker.progress}%` }}
                  />
                </div>
              </div>
            )}
            <div className="text-xs text-gray-500 tabular-nums">
              {worker.completedCount} done
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: WorkerState["status"] }) {
  switch (status) {
    case "processing":
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case "rate_limited":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <CheckCircle className="w-4 h-4 text-green-500" />;
  }
}
