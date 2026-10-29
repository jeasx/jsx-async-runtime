export async function streamToChunks<T>(stream: AsyncIterable<T>): Promise<T[]> {
  const chunks: T[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
}
