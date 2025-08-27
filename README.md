# FlashUp

FlashUp is a multi-language project designed to efficiently upload large files to a server by dividing them into smaller chunks. This approach enables reliable uploads, supports resumable transfers, and optimizes performance for handling big files.

## Main Goal

The primary goal of FlashUp is to facilitate the upload of large files to a server by splitting them into manageable chunks. This method ensures:

- Improved reliability for unstable network connections
- Support for resumable uploads
- Efficient handling of very large files

## Project Structure

- **src/**: TypeScript client-side logic for chunking and uploading files
- **python/**, **go/**, **php/**, **srv/**: Server-side implementations for receiving and assembling file chunks
- **data/**: Sample data and inventory files
- **public/**: Static assets

## How It Works

1. The client splits a large file into smaller chunks.
2. Each chunk is uploaded individually to the server.
3. The server receives chunks and reassembles them into the original file.

## Technologies Used

- TypeScript (frontend logic)
- Python, Go, PHP, Node.js (server-side chunk handling)

## Usage

1. Start the server in your preferred language (see respective folders).
2. Use the client (in `src/`) to select and upload a large file.
3. Monitor progress and verify successful upload.

## License

MIT
