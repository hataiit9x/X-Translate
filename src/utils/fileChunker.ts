import type { ChunkStatus } from "../types";

export function splitIntoChunks(content: string, maxChunkSize: number): ChunkStatus[] {
  const paragraphs = content.split(/\n\n+/);
  const chunks: ChunkStatus[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(createChunk(chunkIndex++, currentChunk.trim()));
        currentChunk = "";
      }

      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      let sentenceChunk = "";

      for (const sentence of sentences) {
        if (sentence.length > maxChunkSize) {
          if (sentenceChunk) {
            chunks.push(createChunk(chunkIndex++, sentenceChunk.trim()));
            sentenceChunk = "";
          }
          const words = sentence.split(/\s+/);
          let wordChunk = "";
          for (const word of words) {
            if ((wordChunk + " " + word).length > maxChunkSize) {
              if (wordChunk) {
                chunks.push(createChunk(chunkIndex++, wordChunk.trim()));
              }
              wordChunk = word;
            } else {
              wordChunk = wordChunk ? wordChunk + " " + word : word;
            }
          }
          if (wordChunk) {
            sentenceChunk = wordChunk;
          }
        } else if ((sentenceChunk + " " + sentence).length > maxChunkSize) {
          if (sentenceChunk) {
            chunks.push(createChunk(chunkIndex++, sentenceChunk.trim()));
          }
          sentenceChunk = sentence;
        } else {
          sentenceChunk = sentenceChunk ? sentenceChunk + " " + sentence : sentence;
        }
      }

      if (sentenceChunk) {
        currentChunk = sentenceChunk;
      }
    } else if ((currentChunk + "\n\n" + paragraph).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(createChunk(chunkIndex++, currentChunk.trim()));
      }
      currentChunk = paragraph;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + paragraph : paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(createChunk(chunkIndex++, currentChunk.trim()));
  }

  return chunks;
}

function createChunk(index: number, content: string): ChunkStatus {
  return {
    index,
    content,
    status: "pending",
    retryCount: 0,
  };
}

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
