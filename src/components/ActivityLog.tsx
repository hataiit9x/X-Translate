import type { LogEntry } from "../types";
import { formatTimestamp } from "../utils/fileChunker";
import { Trash2, Copy, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface ActivityLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export function ActivityLog({ logs, onClear }: ActivityLogProps) {
  const copyLogs = () => {
    const text = logs
      .map((log) => `[${formatTimestamp(log.timestamp)}] [${log.workerId}] ${log.message}`)
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col h-64">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Activity Log</h3>
        <div className="flex gap-2">
          <button
            onClick={copyLogs}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy logs"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 text-xs font-mono">
        {logs.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No activity yet</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2 p-1 rounded ${getLogBgColor(log.type)}`}
            >
              <LogIcon type={log.type} />
              <span className="text-gray-500 shrink-0">
                {formatTimestamp(log.timestamp)}
              </span>
              <span className="text-gray-600 shrink-0">[{log.workerId}]</span>
              <span className={getLogTextColor(log.type)}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LogIcon({ type }: { type: LogEntry["type"] }) {
  switch (type) {
    case "success":
      return <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />;
    case "warning":
      return <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />;
    case "error":
      return <XCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />;
    default:
      return <Info className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />;
  }
}

function getLogBgColor(type: LogEntry["type"]): string {
  switch (type) {
    case "success":
      return "bg-green-50";
    case "warning":
      return "bg-yellow-50";
    case "error":
      return "bg-red-50";
    default:
      return "";
  }
}

function getLogTextColor(type: LogEntry["type"]): string {
  switch (type) {
    case "success":
      return "text-green-700";
    case "warning":
      return "text-yellow-700";
    case "error":
      return "text-red-700";
    default:
      return "text-gray-700";
  }
}
