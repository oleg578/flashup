from flask import Flask, request, send_from_directory
import os

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload():
    if request.method == 'OPTIONS':
        return '', 200
    file = request.files.get('fileChunk')
    file_name = request.form.get('fileName')
    chunk_index = request.form.get('chunkIndex')
    total_chunks = request.form.get('totalChunks')
    if not file or file_name is None or chunk_index is None or total_chunks is None:
        return 'Missing parameters', 400

    temp_dir = os.path.join(os.path.dirname(__file__), 'temp_chunks')
    os.makedirs(temp_dir, exist_ok=True)
    chunk_path = os.path.join(temp_dir, f"{file_name}-{chunk_index}")
    file.save(chunk_path)

    # If last chunk, merge
    if int(chunk_index) + 1 == int(total_chunks):
        upload_dir = os.path.join(os.path.dirname(__file__), 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        final_path = os.path.join(upload_dir, file_name)
        with open(final_path, 'wb') as out_file:
            for i in range(int(total_chunks)):
                part_path = os.path.join(temp_dir, f"{file_name}-{i}")
                if os.path.exists(part_path):
                    with open(part_path, 'rb') as in_file:
                        out_file.write(in_file.read())
                    os.remove(part_path)
    return 'Chunk uploaded', 200

if __name__ == '__main__':
    app.run(port=3000)
