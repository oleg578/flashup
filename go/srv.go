package main

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"log"
	"fmt"
)

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	defer cleanupTempChunks()
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprint(w, "Method Not Allowed")
		return
	}

	file, _, err := r.FormFile("fileChunk")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, "Missing fileChunk")
		return
	}
	defer file.Close()

	fileName := r.FormValue("fileName")
	chunkIndex := r.FormValue("chunkIndex")
	totalChunks := r.FormValue("totalChunks")
	if fileName == "" || chunkIndex == "" || totalChunks == "" {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprint(w, "Missing parameters")
		return
	}

	tempDir := filepath.Join(".", "temp_chunks")
	os.MkdirAll(tempDir, 0755)
	chunkPath := filepath.Join(tempDir, fmt.Sprintf("%s-%s", fileName, chunkIndex))
	log.Printf("Saving chunk to: %s\n", chunkPath)
	out, err := os.Create(chunkPath)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, "Failed to save chunk")
		return
	}
	_, err = io.Copy(out, file)
	if err != nil {
		out.Close()
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprint(w, "Failed to save chunk")
		return
	}
	out.Close()

	chunkIdx, _ := strconv.Atoi(chunkIndex)
	totalChks, _ := strconv.Atoi(totalChunks)
	if chunkIdx+1 == totalChks {
		uploadDir := filepath.Join(".", "uploads")
		os.MkdirAll(uploadDir, 0755)
		finalPath := filepath.Join(uploadDir, fileName)
		finalOut, err := os.Create(finalPath)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprint(w, "Failed to create final file")
			return
		}
		defer finalOut.Close()
		for i := 0; i < totalChks; i++ {
			partPath := filepath.Join(tempDir, fmt.Sprintf("%s-%d", fileName, i))
			log.Println("Merging part:", partPath)
			in, err := os.Open(partPath)
			if err != nil {
				log.Println("Failed to open part:", partPath)
				continue
			}
			if err == nil {
				io.Copy(finalOut, in)
				in.Close()
				os.Remove(partPath)
			}
		}
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Chunk uploaded")
}

func cleanupTempChunks() {
	tempDir := "temp_chunks"
	files, err := os.ReadDir(tempDir)
	if err != nil {
		return
	}
	for _, file := range files {
		os.Remove(filepath.Join(tempDir, file.Name()))
	}
}

func main() {
    defer cleanupTempChunks()
	http.HandleFunc("/upload", uploadHandler)
	log.Println("Go server started on port 3000")
	http.ListenAndServe(":3000", nil)
}
