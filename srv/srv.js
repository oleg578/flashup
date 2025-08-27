
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";


const app = express();
const upload = multer({dest: "temp_chunks/"});

// CORS middleware for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


app.post("/upload", upload.single("fileChunk"), (req, res) => {
  console.info("Receiving chunk");
  const {fileName, chunkIndex, totalChunks} = req.body;
  const logMessage = `fileName: ${fileName}, Received chunk ${parseInt(chunkIndex) + 1} of ${totalChunks}\n`;
  console.info(logMessage);
  const tempPath = path.join("temp_chunks", `${fileName}-${chunkIndex}`);
  fs.renameSync(req.file.path, tempPath);

  // If last chunk, merge
  if (parseInt(chunkIndex) + 1 === parseInt(totalChunks)) {
    const finalPath = path.join("uploads", fileName);
    const writeStream = fs.createWriteStream(finalPath);

    let index = 0;
    function appendChunk() {
      const chunkPath = path.join("temp_chunks", `${fileName}-${index}`);
      if (!fs.existsSync(chunkPath)) {
        writeStream.end();
        return;
      }
      const chunkStream = fs.createReadStream(chunkPath);
      chunkStream.pipe(writeStream, {end: false});
      chunkStream.on("end", () => {
        fs.unlinkSync(chunkPath); // cleanup
        index++;
        appendChunk();
      });
    }
    appendChunk();
  }

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Server started on port 3000"));
