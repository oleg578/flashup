<?php
// Simple PHP server for /upload route using built-in server
// Usage: php -S localhost:3000 router.php

if (php_sapi_name() === 'cli-server') {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($uri === '/upload') {
        include __DIR__ . '/upload.php';
        exit();
    }
    // Serve static files if they exist
    $file = __DIR__ . $uri;
    if (is_file($file)) {
        return false;
    }
    // Default response for other routes
    http_response_code(404);
    echo 'Not Found';
    exit();
}
