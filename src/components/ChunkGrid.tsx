import type { ChunkStatus } from "../types";

interface ChunkGridProps {
  chunks: ChunkStatus[];
}

export function ChunkGrid({ chunks }: ChunkGridProps) {
  if (chunks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Chunk Status ({chunks.length} chunks)
      </h3>
      <div className="flex flex-wrap gap-1">
        {chunks.map((chunk) => (
          <div
            key={chunk.index}
            title={`Chunk #${chunk.index + 1}: ${chunk.status}${chunk.error ? ` - ${chunk.error}` : ""}`}
            className={`
              w-4 h-4 rounded-sm cursor-pointer transition-colors
              ${getChunkColor(chunk.status)}
            `}
          />
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span>Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-500 animate-pulse" />
          <span>Processing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-300" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span>Failed</span>
        </div>
      </div>
    </div>
  );
}

function getChunkColor(status: ChunkStatus["status"]): string {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "processing":
      return "bg-blue-500 animate-pulse";
    case "failed":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
}
