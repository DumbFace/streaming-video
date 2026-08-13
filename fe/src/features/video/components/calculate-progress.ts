export function calculateProgress(currentChunk: number, totalChunks: number): number {
  if (totalChunks <= 0) return 0;

  return Math.round((currentChunk / totalChunks) * 100);
}
