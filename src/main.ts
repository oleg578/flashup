import "./style.css";
import {chunker} from "./chunker";

const CHUNK_SIZE = 1024 * 512; // 512KB default

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Welcome to FastUpload</h1>
    <p>Your one-stop solution for fast and efficient downloads.</p>
    <div id="uploadForm">
      <input type="file" id="fileInput" name="fileChunk" />
      <button id="uploadBtn">Upload</button>
      <progress id="progressBar" value="0" max="100"></progress>
    </div>
  </div>
`;

document.getElementById("uploadBtn")?.addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput") as HTMLInputElement;
  const file = fileInput.files?.[0];
  if (!file) return;
  const progressBar = document.getElementById(
    "progressBar"
  ) as HTMLProgressElement;
  progressBar.value = 0;
  await chunker(
    file,
    (percent) => {
      progressBar.value = percent;
    },
    CHUNK_SIZE
  );
});
