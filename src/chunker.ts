export async function chunker(
  file: File,
  onProgress?: (percent: number) => void,
  chunkSize: number = 1024 * 512 // 512KB default
) {
  if (!file) return;

  const totalChunks = Math.ceil(file.size / chunkSize);
  console.log(`Total chunks to upload: ${totalChunks}`);

  if (totalChunks === 0) {
    onProgress?.(100);
    return;
  }

  onProgress?.(0);

  let completedChunks = 0;

  const uploadChunk = async (chunkIndex: number) => {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("fileChunk", chunk);
    formData.append("fileName", file.name);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("totalChunks", totalChunks.toString());
    for (let [key, value] of formData.entries()) {
      console.info(`${key}:`, value);
    }

    const urlDest = "http://localhost:3000/upload";

    await fetch(urlDest, {method: "POST", body: formData});

    completedChunks += 1;
    onProgress?.((completedChunks / totalChunks) * 100);
  };

  try {
    const uploadTasks = Array.from({length: totalChunks}, (_, chunkIndex) =>
      uploadChunk(chunkIndex)
    );

    await Promise.all(uploadTasks); // upload all chunks concurrently
    console.log("Upload complete!");
  } catch (err) {
    console.error("Upload failed", err);
    throw err;
  }
}
