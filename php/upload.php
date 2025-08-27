<?php
// Simple PHP upload handler for chunked uploads
// Save each chunk to temp_chunks/{fileName}-{chunkIndex}

// Allow CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fileName = $_POST['fileName'] ?? '';
    $chunkIndex = $_POST['chunkIndex'] ?? '';
    $totalChunks = $_POST['totalChunks'] ?? '';
    if (!$fileName || $chunkIndex === '' || !$totalChunks || !isset($_FILES['fileChunk'])) {
        http_response_code(400);
        echo 'Missing parameters';
        exit();
    }

    $tempDir = __DIR__ . '/temp_chunks';
    if (!is_dir($tempDir)) {
        mkdir($tempDir, 0777, true);
    }
    $chunkPath = $tempDir . "/{$fileName}-{$chunkIndex}";
    if (!move_uploaded_file($_FILES['fileChunk']['tmp_name'], $chunkPath)) {
        http_response_code(500);
        echo 'Failed to save chunk';
        exit();
    }

    // If last chunk, merge all
    if ((int)$chunkIndex + 1 === (int)$totalChunks) {
        $uploadDir = __DIR__ . '/uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $finalPath = $uploadDir . "/{$fileName}";
        $out = fopen($finalPath, 'wb');
        for ($i = 0; $i < $totalChunks; $i++) {
            $chunkFile = $tempDir . "/{$fileName}-{$i}";
            if (file_exists($chunkFile)) {
                $in = fopen($chunkFile, 'rb');
                stream_copy_to_stream($in, $out);
                fclose($in);
                unlink($chunkFile);
            }
        }
        fclose($out);
    }

    http_response_code(200);
    echo 'Chunk uploaded';
    exit();
}

http_response_code(405);
echo 'Method Not Allowed';
