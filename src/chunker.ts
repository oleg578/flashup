export async function chunker(
  file: File,
  onProgress?: (percent: number) => void,
  chunkSize: number = 1024 * 512 // 512KB default
) {
  if (!file) return;
  let start = 0;
  let chunkIndex = 0;
  const totalChunks = Math.ceil(file.size / chunkSize);
  console.log(`Total chunks to upload: ${totalChunks}`);

  async function uploadNextChunk() {
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
    try {
      const url_dest = "http://localhost:3000/upload";
      await fetch(url_dest, {method: "POST", body: formData});

      start = end;
      chunkIndex++;
      if (onProgress) {
        onProgress((chunkIndex / totalChunks) * 100);
      }

      if (start < file.size) {
        await uploadNextChunk(); // next chunk
      } else {
        console.log("Upload complete!");
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  }

  await uploadNextChunk();
}
